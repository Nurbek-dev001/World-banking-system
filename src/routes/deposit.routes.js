import express from 'express';
import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.middleware.js';
import { DepositScoringService } from '../services/scoringService.js';
import { asyncHandler, successResponse, NotFoundError, BadRequestError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/deposits/score/calculate
 * Calculate deposit eligibility score for current user
 */
router.get('/score/calculate', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw new NotFoundError('User');
  }

  const financialData = user._financial || {};
  
  const score = DepositScoringService.calculateDepositScore({
    currentBalance: financialData.balance?.current || 0,
    averageBalance: financialData.balance?.average || 0,
    maxBalance: financialData.balance?.max || 0,
    accountAgeMonths: user.createdAt 
      ? Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24 * 30))
      : 0,
    totalTransactions: financialData.transactions?.total || 0,
    averageMonthlyTransactions: financialData.transactions?.averageMonthly || 0,
    monthlyVariance: 2, // Default variance
    monthsActive: user.createdAt 
      ? Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24 * 30))
      : 0,
    suspiciousActivityCount: 0,
    previousDeposits: financialData.deposits?.previous || 0,
    defaultedDeposits: financialData.deposits?.defaulted || 0
  });

  res.json(successResponse(score, 'Deposit eligibility score calculated'));
}));

/**
 * POST /api/deposits/score/custom
 * Calculate deposit score with custom data (for testing)
 */
router.post('/score/custom', protect, asyncHandler(async (req, res) => {
  const {
    currentBalance,
    averageBalance,
    maxBalance,
    accountAgeMonths,
    totalTransactions,
    averageMonthlyTransactions,
    monthlyVariance,
    previousDeposits
  } = req.body;

  const score = DepositScoringService.calculateDepositScore({
    currentBalance: currentBalance || 0,
    averageBalance: averageBalance || 0,
    maxBalance: maxBalance || 0,
    accountAgeMonths: accountAgeMonths || 0,
    totalTransactions: totalTransactions || 0,
    averageMonthlyTransactions: averageMonthlyTransactions || 0,
    monthlyVariance: monthlyVariance || 2,
    monthsActive: accountAgeMonths || 0,
    suspiciousActivityCount: 0,
    previousDeposits: previousDeposits || 0,
    defaultedDeposits: 0
  });

  logger.info('Custom deposit score calculated', {
    userId: req.user.id,
    score: score.totalScore
  });

  res.json(successResponse(score, 'Custom deposit score calculated'));
}));

/**
 * POST /api/deposits/create
 * Create new deposit
 */
router.post('/create', protect, asyncHandler(async (req, res) => {
  const { amount, duration, depositType, accountId } = req.body;

  // Validate input
  if (!amount || amount <= 0) {
    throw new BadRequestError('Deposit amount must be greater than 0');
  }
  if (!duration || duration <= 0 || duration > 60) {
    throw new BadRequestError('Duration must be between 1 and 60 months');
  }
  if (!['fixed', 'flexible'].includes(depositType)) {
    throw new BadRequestError('Invalid deposit type');
  }
  if (!accountId) {
    throw new BadRequestError('Account ID is required');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new NotFoundError('User');
  }

  // Verify the account belongs to the user
  const account = await Account.findById(accountId);
  if (!account || account.userId.toString() !== req.user.id) {
    throw new BadRequestError('This account does not belong to you');
  }

  // Check if account has sufficient balance
  if (account.balance < amount) {
    throw new BadRequestError('Insufficient balance for this deposit');
  }

  // Calculate eligibility score
  const financialData = user._financial || {};
  const score = DepositScoringService.calculateDepositScore({
    currentBalance: financialData.balance?.current || account.balance,
    averageBalance: financialData.balance?.average || account.balance,
    maxBalance: financialData.balance?.max || account.balance,
    accountAgeMonths: user.createdAt 
      ? Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24 * 30))
      : 0,
    totalTransactions: financialData.transactions?.total || 0,
    averageMonthlyTransactions: financialData.transactions?.averageMonthly || 0,
    monthlyVariance: 2,
    monthsActive: user.createdAt 
      ? Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24 * 30))
      : 0,
    suspiciousActivityCount: 0,
    previousDeposits: financialData.deposits?.previous || 0,
    defaultedDeposits: financialData.deposits?.defaulted || 0
  });

  // Check if eligible for deposit
  if (score.recommendation.status === 'DENIED') {
    return res.status(403).json({
      status: 'error',
      message: 'Deposit application denied - You do not meet the eligibility criteria',
      score: score,
      statusCode: 403
    });
  }

  // Calculate maturity details
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + duration);

  // Calculate interest
  const interestRate = score.recommendedInterestRate;
  const totalInterest = amount * (interestRate / 100) * (duration / 12);
  const maturityAmount = amount + totalInterest;

  // Create deposit
  const deposit = new Deposit({
    userId: user._id,
    amount,
    duration,
    depositType,
    interestRate: parseFloat(interestRate.toFixed(2)),
    expectedInterest: parseFloat(totalInterest.toFixed(2)),
    startDate,
    endDate,
    status: 'active',
    currency: account.currency
  });

  await deposit.save();

  // Lock amount in account (subtract from available balance)
  account.availableBalance -= amount;
  account.spentThisMonth = (account.spentThisMonth || 0) + amount;
  await account.save();

  // Create transaction record
  const transaction = new Transaction({
    userId: user._id,
    type: 'deposit_created',
    amount,
    currency: account.currency,
    description: `${depositType === 'fixed' ? 'Fixed' : 'Flexible'} deposit for ${duration} months`,
    accountId,
    status: 'completed',
    reference: `DEP-${deposit._id}`
  });
  await transaction.save();

  logger.info('Deposit created successfully', {
    userId: user._id,
    depositId: deposit._id,
    amount,
    duration,
    score: score.totalScore
  });

  res.status(201).json(successResponse({
    deposit: {
      id: deposit._id,
      amount,
      duration,
      depositType,
      interestRate,
      expectedInterest: parseFloat(totalInterest.toFixed(2)),
      maturityAmount: parseFloat(maturityAmount.toFixed(2)),
      startDate,
      endDate,
      status: 'active',
      reference: deposit._id.toString()
    },
    score: score,
    message: score.recommendation.message
  }, 'Deposit created successfully'));
}));

/**
 * GET /api/deposits
 * Get user deposits
 */
router.get('/', protect, asyncHandler(async (req, res) => {
  const { status = 'all' } = req.query;

  let query = { userId: req.user.id };
  if (status !== 'all') {
    query.status = status;
  }

  const deposits = await Deposit.find(query).sort({ createdAt: -1 }).lean();

  logger.info('Deposits retrieved', {
    userId: req.user.id,
    count: deposits.length
  });

  res.json(successResponse(deposits, `Found ${deposits.length} deposit(s)`));
}));

/**
 * GET /api/deposits/:id
 * Get deposit details
 */
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);

  if (!deposit || deposit.userId.toString() !== req.user.id) {
    throw new NotFoundError('Deposit');
  }

  // Calculate current earned interest
  const now = new Date();
  let earnedInterest = 0;

  if (deposit.status === 'active' && now > deposit.startDate) {
    const monthsElapsed = Math.floor(
      (now - deposit.startDate) / (1000 * 60 * 60 * 24 * 30)
    );
    earnedInterest = deposit.expectedInterest * (monthsElapsed / deposit.duration);
  } else if (deposit.status === 'matured' || deposit.status === 'closed') {
    earnedInterest = deposit.earnedInterest;
  }

  res.json(successResponse({
    ...deposit.toJSON(),
    earnedInterest: parseFloat(earnedInterest.toFixed(2)),
    daysRemaining: deposit.status === 'active' 
      ? Math.max(0, Math.ceil((deposit.endDate - now) / (1000 * 60 * 60 * 24)))
      : 0
  }, 'Deposit details retrieved successfully'));
}));

/**
 * POST /api/deposits/:id/close
 * Close deposit
 */
router.post('/:id/close', protect, asyncHandler(async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);

  if (!deposit || deposit.userId.toString() !== req.user.id) {
    throw new NotFoundError('Deposit');
  }

  if (deposit.status !== 'active') {
    throw new BadRequestError(`Cannot close a ${deposit.status} deposit`);
  }

  // Calculate earned interest up to now
  const now = new Date();
  const monthsElapsed = (now - deposit.startDate) / (1000 * 60 * 60 * 24 * 30);
  const earnedInterest = deposit.expectedInterest * (monthsElapsed / deposit.duration);

  // Update deposit
  deposit.status = 'closed';
  deposit.earnedInterest = parseFloat(earnedInterest.toFixed(2));
  await deposit.save();

  // Refund amount to account
  const account = await Account.findOne({ userId: req.user.id });
  if (account) {
    account.availableBalance += deposit.amount;
    account.balance += parseFloat(earnedInterest.toFixed(2)); // Add interest
    await account.save();
  }

  // Create transaction record
  const transaction = new Transaction({
    userId: req.user.id,
    type: 'deposit_closed',
    amount: deposit.amount,
    currency: deposit.currency,
    description: `Deposit closed - Interest earned: ${earnedInterest.toFixed(2)}`,
    accountId: account?._id,
    status: 'completed',
    reference: `DEP-CLOSE-${deposit._id}`
  });
  await transaction.save();

  logger.info('Deposit closed', {
    userId: req.user.id,
    depositId: deposit._id,
    earnedInterest
  });

  res.json(successResponse({
    deposit: {
      id: deposit._id,
      status: 'closed',
      amount: deposit.amount,
      earnedInterest: parseFloat(earnedInterest.toFixed(2)),
      totalAmount: deposit.amount + parseFloat(earnedInterest.toFixed(2))
    },
    message: `Deposit closed successfully. Interest earned: ${earnedInterest.toFixed(2)}`
  }, 'Deposit closed successfully'));
}));

/**
 * GET /api/deposits/:id/interest-projection
 * Get interest projection for deposit
 */
router.get('/:id/interest-projection', protect, asyncHandler(async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);

  if (!deposit || deposit.userId.toString() !== req.user.id) {
    throw new NotFoundError('Deposit');
  }

  const projection = [];
  const startDate = new Date(deposit.startDate);

  for (let i = 0; i <= deposit.duration; i++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + i);
    
    const interestEarned = deposit.expectedInterest * (i / deposit.duration);
    const balance = deposit.amount + interestEarned;

    projection.push({
      month: i,
      date: monthDate,
      interestEarned: parseFloat(interestEarned.toFixed(2)),
      balance: parseFloat(balance.toFixed(2))
    });
  }

  res.json(successResponse({
    depositId: deposit._id,
    projection,
    totalExpectedInterest: deposit.expectedInterest,
    maturityAmount: deposit.amount + deposit.expectedInterest
  }, 'Interest projection retrieved successfully'));
}));

export default router;
