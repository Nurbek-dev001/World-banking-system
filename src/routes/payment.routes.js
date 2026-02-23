import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { asyncHandler, successResponse, BadRequestError, NotFoundError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

/**
 * POST /api/payments/create
 * Create a payment for any category
 */
router.post('/create', protect, asyncHandler(async (req, res) => {
  const { category, accountNumber, amount, reference, accountId } = req.body;
  const userId = req.user.userId;

  // Validate input
  if (!category || !amount) {
    throw new BadRequestError('Category and amount are required');
  }
  if (amount <= 0) {
    throw new BadRequestError('Amount must be greater than 0');
  }

  // Get account
  const account = accountId 
    ? await Account.findById(accountId)
    : await Account.findOne({ userId, accountType: 'world_gold' });

  if (!account || account.userId.toString() !== userId) {
    throw new NotFoundError('Account');
  }

  // Check balance
  if (account.balance < amount) {
    throw new BadRequestError('Insufficient balance for this payment');
  }

  // Create payment record
  const payment = {
    id: `pay_${Date.now()}`,
    userId,
    category,
    accountNumber: account.accountNumber,
    amount,
    reference: reference || `PAY-${Date.now()}`,
    status: 'completed',
    timestamp: new Date(),
    transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  // Update account balance
  account.balance -= amount;
  account.spentThisMonth = (account.spentThisMonth || 0) + amount;
  await account.save();

  // Create transaction record
  const transaction = new Transaction({
    userId,
    type: 'payment',
    amount,
    currency: account.currency,
    description: `${category} payment`,
    accountId: account._id,
    status: 'completed',
    reference: payment.reference
  });
  await transaction.save();

  logger.info('Payment processed', {
    userId,
    category,
    amount,
    reference: payment.reference
  });

  // Return success response
  res.status(200).json(successResponse(payment, 'Payment processed successfully'));
}));

/**
 * POST /api/payments/utilities
 * Pay utilities (electricity, water, gas)
 */
router.post('/utilities', protect, asyncHandler(async (req, res) => {
  const { provider, accountNumber, amount, accountId } = req.body;
  const userId = req.user.userId;

  if (!provider || !accountNumber || !amount) {
    throw new BadRequestError('Provider, account number, and amount are required');
  }

  const account = accountId 
    ? await Account.findById(accountId)
    : await Account.findOne({ userId });

  if (!account || account.balance < amount) {
    throw new BadRequestError('Insufficient balance');
  }

  account.balance -= amount;
  await account.save();

  const transaction = new Transaction({
    userId,
    type: 'utility_payment',
    amount,
    currency: account.currency,
    description: `${provider} utility payment`,
    accountId: account._id,
    status: 'completed',
    reference: `UTIL-${Date.now()}`
  });
  await transaction.save();

  res.json(successResponse({
    id: `pay_${Date.now()}`,
    type: 'utility',
    provider,
    amount,
    status: 'completed'
  }, 'Utility payment processed'));
}));

/**
 * POST /api/payments/internet
 * Pay internet/mobile services
 */
router.post('/internet', protect, asyncHandler(async (req, res) => {
  const { provider, phoneNumber, amount, accountId } = req.body;
  const userId = req.user.userId;

  if (!provider || !phoneNumber || !amount) {
    throw new BadRequestError('Provider, phone number, and amount are required');
  }

  const account = accountId 
    ? await Account.findById(accountId)
    : await Account.findOne({ userId });

  if (!account || account.balance < amount) {
    throw new BadRequestError('Insufficient balance');
  }

  account.balance -= amount;
  await account.save();

  const transaction = new Transaction({
    userId,
    type: 'internet_payment',
    amount,
    currency: account.currency,
    description: `${provider} service for ${phoneNumber}`,
    accountId: account._id,
    status: 'completed',
    reference: `INT-${Date.now()}`
  });
  await transaction.save();

  res.json(successResponse({
    id: `pay_${Date.now()}`,
    type: 'internet',
    provider,
    amount,
    status: 'completed'
  }, 'Internet payment processed'));
}));

/**
 * POST /api/payments/education
 * Pay education fees
 */
router.post('/education', protect, asyncHandler(async (req, res) => {
  const { institution, studentName, amount, accountId } = req.body;
  const userId = req.user.userId;

  if (!institution || !studentName || !amount) {
    throw new BadRequestError('Institution, student name, and amount are required');
  }

  const account = accountId 
    ? await Account.findById(accountId)
    : await Account.findOne({ userId });

  if (!account || account.balance < amount) {
    throw new BadRequestError('Insufficient balance');
  }

  account.balance -= amount;
  await account.save();

  const transaction = new Transaction({
    userId,
    type: 'education_payment',
    amount,
    currency: account.currency,
    description: `Education fee for ${studentName} at ${institution}`,
    accountId: account._id,
    status: 'completed',
    reference: `EDU-${Date.now()}`
  });
  await transaction.save();

  res.json(successResponse({
    id: `pay_${Date.now()}`,
    type: 'education',
    institution,
    studentName,
    amount,
    status: 'completed'
  }, 'Education payment processed'));
}));

/**
 * POST /api/payments/government
 * Pay government services (taxes, fines, fees)
 */
router.post('/government', protect, asyncHandler(async (req, res) => {
  const { serviceType, reference, amount, accountId } = req.body;
  const userId = req.user.userId;

  if (!serviceType || !reference || !amount) {
    throw new BadRequestError('Service type, reference, and amount are required');
  }

  const account = accountId 
    ? await Account.findById(accountId)
    : await Account.findOne({ userId });

  if (!account || account.balance < amount) {
    throw new BadRequestError('Insufficient balance');
  }

  account.balance -= amount;
  await account.save();

  const transaction = new Transaction({
    userId,
    type: 'government_payment',
    amount,
    currency: account.currency,
    description: `${serviceType} payment (Ref: ${reference})`,
    accountId: account._id,
    status: 'completed',
    reference: `GOV-${Date.now()}`
  });
  await transaction.save();

  res.json(successResponse({
    id: `pay_${Date.now()}`,
    type: 'government',
    serviceType,
    reference,
    amount,
    status: 'completed'
  }, 'Government service payment processed'));
}));

/**
 * POST /api/payments/merchant
 * Pay merchant
 */
router.post('/merchant', protect, asyncHandler(async (req, res) => {
  const { merchantName, merchantCode, amount, accountId } = req.body;
  const userId = req.user.userId;

  if (!merchantName || !merchantCode || !amount) {
    throw new BadRequestError('Merchant name, code, and amount are required');
  }

  const account = accountId 
    ? await Account.findById(accountId)
    : await Account.findOne({ userId });

  if (!account || account.balance < amount) {
    throw new BadRequestError('Insufficient balance');
  }

  account.balance -= amount;
  await account.save();

  const transaction = new Transaction({
    userId,
    type: 'merchant_payment',
    amount,
    currency: account.currency,
    description: `Payment to ${merchantName}`,
    accountId: account._id,
    status: 'completed',
    reference: `MERCH-${Date.now()}`
  });
  await transaction.save();

  res.json(successResponse({
    id: `pay_${Date.now()}`,
    type: 'merchant',
    merchantName,
    merchantCode,
    amount,
    status: 'completed'
  }, 'Merchant payment processed'));
}));

/**
 * GET /api/payments/history
 * Get payment history
 */
router.get('/history', protect, asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  const userId = req.user.userId;

  const transactions = await Transaction.find({
    userId,
    type: { $in: ['payment', 'utility_payment', 'internet_payment', 'education_payment', 'government_payment', 'merchant_payment'] }
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset))
    .lean();

  const total = await Transaction.countDocuments({
    userId,
    type: { $in: ['payment', 'utility_payment', 'internet_payment', 'education_payment', 'government_payment', 'merchant_payment'] }
  });

  res.json(successResponse({
    transactions,
    pagination: { total, limit: parseInt(limit), offset: parseInt(offset) }
  }, 'Payment history retrieved'));
}));

/**
 * GET /api/payments/categories
 * Get payment categories
 */
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = [
    { id: 1, name: 'Utilities', icon: '⚡', description: 'Electricity, water, gas' },
    { id: 2, name: 'Internet & Mobile', icon: '📱', description: 'Internet, mobile top-up' },
    { id: 3, name: 'Education', icon: '🎓', description: 'School and university fees' },
    { id: 4, name: 'Government', icon: '🏛️', description: 'Taxes, fines, licenses' },
    { id: 5, name: 'Merchant', icon: '🏪', description: 'Store and online purchases' }
  ];

  res.json(successResponse(categories, 'Payment categories retrieved'));
}));

export default router;
