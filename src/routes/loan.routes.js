import express from 'express';
import User from '../models/User.js';
import Loan from '../models/Loan.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.middleware.js';
import { LoanScoringService } from '../services/scoringService.js';
import { asyncHandler, successResponse, NotFoundError, BadRequestError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/loans/score/calculate
 * Calculate loan eligibility score for current user
 */
router.get('/score/calculate', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw new NotFoundError('User');
  }

  const financialData = user._financial || {};
  
  const score = LoanScoringService.calculateLoanScore({
    creditScore: financialData.creditScore || 650,
    monthlyIncome: financialData.monthlyIncome || 1000,
    monthlyDebt: financialData.monthlyDebt || 0,
    accountAgeMonths: user.createdAt 
      ? Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24 * 30))
      : 0,
    totalTransactions: financialData.transactions?.total || 0,
    averageMonthlyTransactions: financialData.transactions?.averageMonthly || 0,
    employmentYears: financialData.employment?.years || 0,
    currentJobMonths: financialData.employment?.currentJobMonths || 0
  });

  res.json(successResponse(score, 'Loan eligibility score calculated'));
}));

/**
 * POST /api/loans/score/custom
 * Calculate loan score with custom data (for testing)
 */
router.post('/score/custom', protect, asyncHandler(async (req, res) => {
  const {
    creditScore,
    monthlyIncome,
    monthlyDebt,
    accountAgeMonths,
    totalTransactions,
    averageMonthlyTransactions,
    employmentYears,
    currentJobMonths
  } = req.body;

  const score = LoanScoringService.calculateLoanScore({
    creditScore: creditScore || 650,
    monthlyIncome: monthlyIncome || 1000,
    monthlyDebt: monthlyDebt || 0,
    accountAgeMonths: accountAgeMonths || 0,
    totalTransactions: totalTransactions || 0,
    averageMonthlyTransactions: averageMonthlyTransactions || 0,
    employmentYears: employmentYears || 0,
    currentJobMonths: currentJobMonths || 0
  });

  logger.info('Custom loan score calculated', {
    userId: req.user.id,
    score: score.totalScore
  });

  res.json(successResponse(score, 'Custom loan score calculated'));
}));

/**
 * POST /api/loans/apply
 * Apply for a loan
 */
router.post('/apply', protect, asyncHandler(async (req, res) => {
  const { amount, tenure, purpose, accountId } = req.body;

  // Validate input
  if (!amount || amount <= 0) {
    throw new BadRequestError('Loan amount must be greater than 0');
  }
  if (amount > 10000000) {
    throw new BadRequestError('Loan amount exceeds maximum limit of 10,000,000');
  }
  if (!tenure || tenure < 3 || tenure > 84) {
    throw new BadRequestError('Tenure must be between 3 and 84 months');
  }
  if (!purpose) {
    throw new BadRequestError('Loan purpose is required');
  }
  if (!accountId) {
    throw new BadRequestError('Account ID is required');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new NotFoundError('User');
  }

  // Verify account belongs to user
  const account = await Account.findById(accountId);
  if (!account || account.userId.toString() !== req.user.id) {
    throw new BadRequestError('This account does not belong to you');
  }

  // Calculate eligibility score
  const financialData = user._financial || {};
  const score = LoanScoringService.calculateLoanScore({
    creditScore: financialData.creditScore || 650,
    monthlyIncome: financialData.monthlyIncome || 1000,
    monthlyDebt: financialData.monthlyDebt || 0,
    accountAgeMonths: user.createdAt 
      ? Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24 * 30))
      : 0,
    totalTransactions: financialData.transactions?.total || 0,
    averageMonthlyTransactions: financialData.transactions?.averageMonthly || 0,
    employmentYears: financialData.employment?.years || 0,
    currentJobMonths: financialData.employment?.currentJobMonths || 0
  });

  // Check if eligible
  if (score.recommendation.status === 'DENIED') {
    logger.warn('Loan application denied', {
      userId: user._id,
      amount,
      score: score.totalScore
    });

    return res.status(403).json({
      status: 'error',
      message: 'Loan application denied - Credit profile does not meet requirements',
      score: score,
      statusCode: 403
    });
  }

  const maxAmount = score.eligibleLoanAmount;
  if (amount > maxAmount) {
    return res.status(400).json({
      status: 'error',
      message: `Loan amount exceeds eligibility limit of ${maxAmount}`,
      maxEligibleAmount: maxAmount,
      statusCode: 400
    });
  }

  // Calculate loan details
  const interestRate = score.maxInterestRate;
  const totalInterest = amount * (interestRate / 100) * (tenure / 12);
  const totalPayable = amount + totalInterest;
  const monthlyPayment = parseFloat((totalPayable / tenure).toFixed(2));

  // Set disbursement and end dates
  const disbursementDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + tenure);

  // Create loan
  const loan = new Loan({
    userId: user._id,
    loanAmount: amount,
    duration: tenure,
    purpose,
    interestRate: parseFloat(interestRate.toFixed(2)),
    monthlyPayment,
    totalPayable: parseFloat(totalPayable.toFixed(2)),
    remainingBalance: parseFloat(totalPayable.toFixed(2)),
    status: score.recommendation.status === 'APPROVED' ? 'approved' : 'conditional',
    creditScore: financialData.creditScore || 650,
    riskLevel: score.riskLevel || 'medium',
    disbursementDate,
    endDate,
    nextPaymentDate: new Date(disbursementDate.setMonth(disbursementDate.getMonth() + 1)),
    payments: []
  });

  await loan.save();

  // If approved, disburse the loan
  if (score.recommendation.status === 'APPROVED') {
    account.balance += amount;
    await account.save();

    // Create transaction for disbursement
    const transaction = new Transaction({
      userId: user._id,
      type: 'loan_disbursed',
      amount,
      currency: account.currency,
      description: `Loan disbursed - ${purpose}`,
      accountId,
      status: 'completed',
      reference: `LOAN-${loan._id}`
    });
    await transaction.save();
  }

  logger.info('Loan application submitted', {
    userId: user._id,
    loanId: loan._id,
    amount,
    tenure,
    status: loan.status,
    score: score.totalScore
  });

  res.status(201).json(successResponse({
    loan: {
      id: loan._id,
      amount,
      monthlyPayment,
      totalPayable,
      tenure,
      interestRate,
      purpose,
      status: loan.status,
      disbursementDate,
      endDate,
      nextPaymentDate: loan.nextPaymentDate,
      reference: loan._id.toString()
    },
    score: score,
    message: score.recommendation.message
  }, 'Loan application submitted successfully'));
}));

/**
 * GET /api/loans
 * Get user loans
 */
router.get('/', protect, asyncHandler(async (req, res) => {
  const { status = 'all' } = req.query;

  let query = { userId: req.user.id };
  if (status !== 'all') {
    query.status = status;
  }

  const loans = await Loan.find(query).sort({ createdAt: -1 }).lean();

  logger.info('Loans retrieved', {
    userId: req.user.id,
    count: loans.length
  });

  res.json(successResponse(loans, `Found ${loans.length} loan(s)`));
}));

/**
 * GET /api/loans/:id
 * Get loan details
 */
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan || loan.userId.toString() !== req.user.id) {
    throw new NotFoundError('Loan');
  }

  // Calculate loan status details
  const paidAmount = loan.payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const nextPaymentDate = loan.nextPaymentDate || new Date();
  const daysUntilPayment = Math.max(0, Math.ceil((nextPaymentDate - new Date()) / (1000 * 60 * 60 * 24)));

  res.json(successResponse({
    ...loan.toJSON(),
    paidAmount: parseFloat(paidAmount.toFixed(2)),
    remainingPayments: loan.payments.filter(p => p.status === 'pending').length,
    daysUntilNextPayment: daysUntilPayment,
    progressPercentage: parseFloat(((paidAmount / loan.totalPayable) * 100).toFixed(2))
  }, 'Loan details retrieved successfully'));
}));

/**
 * POST /api/loans/:id/pay
 * Make loan payment
 */
router.post('/:id/pay', protect, asyncHandler(async (req, res) => {
  const { amount, accountId } = req.body;

  if (!amount || amount <= 0) {
    throw new BadRequestError('Payment amount must be greater than 0');
  }
  if (!accountId) {
    throw new BadRequestError('Account ID is required');
  }

  const loan = await Loan.findById(req.params.id);
  if (!loan || loan.userId.toString() !== req.user.id) {
    throw new NotFoundError('Loan');
  }

  if (loan.status === 'completed' || loan.status === 'closed') {
    throw new BadRequestError('This loan is already completed');
  }

  // Get account
  const account = await Account.findById(accountId);
  if (!account || account.userId.toString() !== req.user.id) {
    throw new BadRequestError('This account does not belong to you');
  }

  // Check balance
  if (account.balance < amount) {
    throw new BadRequestError('Insufficient balance for this payment');
  }

  // Validate payment amount
  if (amount > loan.remainingBalance) {
    throw new BadRequestError(`Payment amount exceeds remaining balance of ${loan.remainingBalance}`);
  }

  // Process payment
  loan.payments.push({
    amount,
    date: new Date(),
    status: 'paid'
  });

  loan.remainingBalance = parseFloat((loan.remainingBalance - amount).toFixed(2));

  // Update loan status
  if (loan.remainingBalance <= 0) {
    loan.status = 'completed';
    loan.remainingBalance = 0;
  } else {
    loan.status = 'active';
    // Set next payment date
    const nextDate = new Date(loan.nextPaymentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    loan.nextPaymentDate = nextDate;
  }

  await loan.save();

  // Update account balance
  account.balance -= amount;
  account.spentThisMonth = (account.spentThisMonth || 0) + amount;
  await account.save();

  // Create transaction
  const transaction = new Transaction({
    userId: req.user.id,
    type: 'loan_payment',
    amount,
    currency: account.currency,
    description: `Loan payment - ${loan.purpose}`,
    accountId,
    status: 'completed',
    reference: `LOAN-PAY-${loan._id}`
  });
  await transaction.save();

  logger.info('Loan payment processed', {
    userId: req.user.id,
    loanId: loan._id,
    amount,
    remainingBalance: loan.remainingBalance
  });

  res.json(successResponse({
    payment: {
      amount,
      date: new Date(),
      reference: `LOAN-PAY-${loan._id}`
    },
    loan: {
      id: loan._id,
      status: loan.status,
      remainingBalance: loan.remainingBalance,
      nextPaymentDate: loan.nextPaymentDate,
      totalPaid: loan.payments.reduce((sum, p) => sum + p.amount, 0)
    },
    accountBalance: account.balance,
    message: loan.remainingBalance <= 0 ? 'Loan completed successfully' : 'Payment processed successfully'
  }, 'Loan payment processed successfully'));
}));

/**
 * GET /api/loans/:id/schedule
 * Get loan payment schedule
 */
router.get('/:id/schedule', protect, asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan || loan.userId.toString() !== req.user.id) {
    throw new NotFoundError('Loan');
  }

  // Generate payment schedule
  const schedule = [];
  let currentDate = new Date(loan.disbursementDate);
  let remainingBalance = loan.loanAmount;

  for (let i = 1; i <= loan.duration; i++) {
    currentDate.setMonth(currentDate.getMonth() + 1);
    remainingBalance -= loan.monthlyPayment;

    // Find if this payment was made
    const madePayment = loan.payments.find(p => {
      const paymentMonth = new Date(p.date).getMonth();
      const currentMonth = currentDate.getMonth();
      return paymentMonth === currentMonth && p.status === 'paid';
    });

    const interestAmount = loan.loanAmount * (loan.interestRate / 100) * (1 / loan.duration);
    const principalAmount = loan.monthlyPayment - interestAmount;

    schedule.push({
      month: i,
      dueDate: currentDate,
      principalAmount: parseFloat(principalAmount.toFixed(2)),
      interestAmount: parseFloat(interestAmount.toFixed(2)),
      monthlyPayment: loan.monthlyPayment,
      remainingBalance: parseFloat(Math.max(0, remainingBalance).toFixed(2)),
      status: madePayment ? 'paid' : 'pending'
    });
  }

  res.json(successResponse({
    loanId: loan._id,
    schedule,
    summary: {
      totalPayments: loan.duration,
      paidPayments: loan.payments.length,
      remainingPayments: loan.duration - loan.payments.length,
      totalMonthlyPayment: loan.monthlyPayment
    }
  }, 'Payment schedule retrieved successfully'));
}));

export default router;
