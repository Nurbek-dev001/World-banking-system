import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { asyncHandler, successResponse, BadRequestError, NotFoundError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Card from '../models/Card.js';
import Transfer from '../models/Transfer.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Validate transfer amount
const validateTransferAmount = (amount) => {
  if (!amount || amount <= 0) {
    throw new BadRequestError('Transfer amount must be greater than 0');
  }
  if (amount > 10000000) {
    throw new BadRequestError('Transfer amount exceeds maximum limit of 10,000,000');
  }
};

// Get account balance
const getAccountBalance = async (accountId) => {
  const account = await Account.findById(accountId);
  if (!account) {
    throw new NotFoundError('Account not found');
  }
  return account;
};

/**
 * POST /api/transfers/phone
 * Transfer by phone number
 */
router.post('/phone', protect, asyncHandler(async (req, res) => {
  const { amount, description, recipientPhone, accountId } = req.body;

  // Validate input
  if (!recipientPhone || !accountId) {
    throw new BadRequestError('Phone number and account ID are required');
  }
  validateTransferAmount(amount);

  // Get sender account
  const senderAccount = await getAccountBalance(accountId);
  if (senderAccount.userId.toString() !== req.user.id) {
    throw new BadRequestError('This account does not belong to you');
  }

  // Check balance
  if (senderAccount.balance < amount) {
    throw new BadRequestError('Insufficient balance for this transfer');
  }

  // Find recipient by phone
  const recipient = await User.findOne({ phone: recipientPhone });
  if (!recipient) {
    throw new NotFoundError('Recipient with this phone number not found');
  }

  // Get recipient's default account
  const recipientAccount = await Account.findOne({ userId: recipient._id, accountType: 'world_gold' });
  if (!recipientAccount) {
    throw new NotFoundError('Recipient account not found');
  }

  // Create transfer record
  const transfer = new Transfer({
    senderId: req.user.id,
    recipientId: recipient._id,
    recipientType: 'phone',
    recipientValue: recipientPhone,
    recipientName: `${recipient.firstName} ${recipient.lastName}`,
    amount,
    currency: senderAccount.currency,
    status: 'completed',
    transferType: 'domestic',
    description,
    reference: `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  });

  await transfer.save();

  // Update balances
  senderAccount.balance -= amount;
  senderAccount.spentToday = (senderAccount.spentToday || 0) + amount;
  await senderAccount.save();

  recipientAccount.balance += amount;
  await recipientAccount.save();

  // Create transactions
  const senderTransaction = new Transaction({
    userId: req.user.id,
    type: 'transfer_sent',
    amount,
    currency: senderAccount.currency,
    description: `Transfer to ${recipientPhone}`,
    accountId,
    status: 'completed',
    reference: transfer.reference
  });
  await senderTransaction.save();

  const recipientTransaction = new Transaction({
    userId: recipient._id,
    type: 'transfer_received',
    amount,
    currency: recipientAccount.currency,
    description: `Transfer from ${req.user.email}`,
    accountId: recipientAccount._id,
    status: 'completed',
    reference: transfer.reference
  });
  await recipientTransaction.save();

  logger.info('Transfer by phone completed', {
    senderId: req.user.id,
    recipientPhone,
    amount,
    reference: transfer.reference
  });

  res.status(201).json(successResponse({
    transfer: {
      id: transfer._id,
      reference: transfer.reference,
      amount,
      recipient: recipientPhone,
      status: 'completed',
      timestamp: transfer.createdAt
    },
    senderBalance: senderAccount.balance
  }, 'Transfer completed successfully'));
}));

/**
 * POST /api/transfers/card
 * Transfer by card number
 */
router.post('/card', protect, asyncHandler(async (req, res) => {
  const { amount, description, recipientCardNumber, accountId } = req.body;

  // Validate input
  if (!recipientCardNumber || !accountId) {
    throw new BadRequestError('Card number and account ID are required');
  }
  validateTransferAmount(amount);

  // Get sender account
  const senderAccount = await getAccountBalance(accountId);
  if (senderAccount.userId.toString() !== req.user.id) {
    throw new BadRequestError('This account does not belong to you');
  }

  // Check balance
  if (senderAccount.balance < amount) {
    throw new BadRequestError('Insufficient balance for this transfer');
  }

  // Find recipient card
  const recipientCard = await Card.findOne({ cardNumber: recipientCardNumber, cardStatus: 'active' });
  if (!recipientCard) {
    throw new NotFoundError('Card not found or is not active');
  }

  // Get recipient account
  const recipientAccount = await Account.findById(recipientCard.accountId);
  if (!recipientAccount) {
    throw new NotFoundError('Recipient account not found');
  }

  // Get recipient user info
  const recipient = await User.findById(recipientCard.userId);

  // Create transfer record
  const transfer = new Transfer({
    senderId: req.user.id,
    recipientId: recipientCard.userId,
    recipientType: 'card',
    recipientValue: recipientCardNumber,
    recipientName: recipientCard.cardHolderName,
    amount,
    currency: senderAccount.currency,
    status: 'completed',
    transferType: 'domestic',
    description,
    reference: `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  });

  await transfer.save();

  // Update balances
  senderAccount.balance -= amount;
  senderAccount.spentToday = (senderAccount.spentToday || 0) + amount;
  await senderAccount.save();

  recipientAccount.balance += amount;
  await recipientAccount.save();

  // Create transactions
  const senderTransaction = new Transaction({
    userId: req.user.id,
    type: 'transfer_sent',
    amount,
    currency: senderAccount.currency,
    description: `Transfer to card ${recipientCardNumber.slice(-4)}`,
    accountId,
    status: 'completed',
    reference: transfer.reference
  });
  await senderTransaction.save();

  const recipientTransaction = new Transaction({
    userId: recipientCard.userId,
    type: 'transfer_received',
    amount,
    currency: recipientAccount.currency,
    description: `Transfer from ${req.user.email}`,
    accountId: recipientAccount._id,
    status: 'completed',
    reference: transfer.reference
  });
  await recipientTransaction.save();

  logger.info('Transfer by card completed', {
    senderId: req.user.id,
    recipientCard: recipientCardNumber.slice(-4),
    amount,
    reference: transfer.reference
  });

  res.status(201).json(successResponse({
    transfer: {
      id: transfer._id,
      reference: transfer.reference,
      amount,
      recipient: `Card **** **** **** ${recipientCardNumber.slice(-4)}`,
      status: 'completed',
      timestamp: transfer.createdAt
    },
    senderBalance: senderAccount.balance
  }, 'Transfer completed successfully'));
}));

/**
 * POST /api/transfers/account
 * Transfer between own accounts or accounts
 */
router.post('/account', protect, asyncHandler(async (req, res) => {
  const { amount, description, fromAccountId, toAccountId } = req.body;

  // Validate input
  if (!fromAccountId || !toAccountId) {
    throw new BadRequestError('Both account IDs are required');
  }
  if (fromAccountId === toAccountId) {
    throw new BadRequestError('Cannot transfer to the same account');
  }
  validateTransferAmount(amount);

  // Get accounts
  const fromAccount = await getAccountBalance(fromAccountId);
  const toAccount = await getAccountBalance(toAccountId);

  // Verify ownership of from account
  if (fromAccount.userId.toString() !== req.user.id) {
    throw new BadRequestError('This account does not belong to you');
  }

  // Check balance
  if (fromAccount.balance < amount) {
    throw new BadRequestError('Insufficient balance for this transfer');
  }

  // Verify currency match
  if (fromAccount.currency !== toAccount.currency) {
    throw new BadRequestError('Transfer between different currencies not supported');
  }

  // Create transfer record
  const toAccountUser = await User.findById(toAccount.userId);
  const transfer = new Transfer({
    senderId: req.user.id,
    recipientId: toAccount.userId,
    recipientType: 'account',
    recipientValue: toAccount.accountNumber,
    recipientName: `${toAccountUser.firstName} ${toAccountUser.lastName}`,
    amount,
    currency: fromAccount.currency,
    status: 'completed',
    transferType: 'domestic',
    description,
    reference: `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  });

  await transfer.save();

  // Update balances
  fromAccount.balance -= amount;
  fromAccount.spentToday = (fromAccount.spentToday || 0) + amount;
  await fromAccount.save();

  toAccount.balance += amount;
  await toAccount.save();

  // Create transactions
  const senderTransaction = new Transaction({
    userId: req.user.id,
    type: 'transfer_sent',
    amount,
    currency: fromAccount.currency,
    description: `Transfer to account ${toAccount.accountNumber}`,
    accountId: fromAccountId,
    status: 'completed',
    reference: transfer.reference
  });
  await senderTransaction.save();

  const recipientTransaction = new Transaction({
    userId: toAccount.userId,
    type: 'transfer_received',
    amount,
    currency: toAccount.currency,
    description: `Transfer from account ${fromAccount.accountNumber}`,
    accountId: toAccountId,
    status: 'completed',
    reference: transfer.reference
  });
  await recipientTransaction.save();

  logger.info('Account transfer completed', {
    senderId: req.user.id,
    fromAccountId,
    toAccountId,
    amount,
    reference: transfer.reference
  });

  res.status(201).json(successResponse({
    transfer: {
      id: transfer._id,
      reference: transfer.reference,
      amount,
      fromAccount: fromAccount.accountNumber,
      toAccount: toAccount.accountNumber,
      status: 'completed',
      timestamp: transfer.createdAt
    },
    fromAccountBalance: fromAccount.balance
  }, 'Transfer completed successfully'));
}));

/**
 * POST /api/transfers/international
 * International transfer
 */
router.post('/international', protect, asyncHandler(async (req, res) => {
  const { amount, description, accountId, recipientIBAN, recipientName, recipientCountry } = req.body;

  // Validate input
  if (!accountId || !recipientIBAN || !recipientName || !recipientCountry) {
    throw new BadRequestError('Account, IBAN, recipient name and country are required');
  }
  validateTransferAmount(amount);

  // Check international limit (50000 per transaction)
  if (amount > 50000) {
    throw new BadRequestError('International transfer limit is 50,000');
  }

  // Get sender account
  const senderAccount = await getAccountBalance(accountId);
  if (senderAccount.userId.toString() !== req.user.id) {
    throw new BadRequestError('This account does not belong to you');
  }

  // Check balance including fee
  const fee = amount * 0.015; // 1.5% fee for international transfers
  const totalAmount = amount + fee;
  if (senderAccount.balance < totalAmount) {
    throw new BadRequestError('Insufficient balance including transfer fee');
  }

  // Create transfer record
  const transfer = new Transfer({
    senderId: req.user.id,
    recipientType: 'iban',
    recipientValue: recipientIBAN,
    recipientName,
    amount,
    currency: senderAccount.currency,
    fee: parseFloat(fee.toFixed(2)),
    status: 'completed',
    transferType: 'international',
    description,
    reference: `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  });

  await transfer.save();

  // Update balance
  senderAccount.balance -= totalAmount;
  senderAccount.spentToday = (senderAccount.spentToday || 0) + totalAmount;
  await senderAccount.save();

  // Create transaction
  const senderTransaction = new Transaction({
    userId: req.user.id,
    type: 'international_transfer',
    amount,
    currency: senderAccount.currency,
    description: `International transfer to ${recipientName} (${recipientCountry})`,
    accountId,
    status: 'completed',
    reference: transfer.reference,
    fee: transfer.fee
  });
  await senderTransaction.save();

  logger.info('International transfer completed', {
    senderId: req.user.id,
    amount,
    fee,
    recipientCountry,
    reference: transfer.reference
  });

  res.status(201).json(successResponse({
    transfer: {
      id: transfer._id,
      reference: transfer.reference,
      amount,
      fee,
      totalAmount,
      recipient: recipientName,
      country: recipientCountry,
      status: 'completed',
      timestamp: transfer.createdAt
    },
    senderBalance: senderAccount.balance
  }, 'International transfer completed successfully'));
}));

/**
 * GET /api/transfers/history
 * Get transfer history
 */
router.get('/history', protect, asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0, type = 'all' } = req.query;

  let query = { $or: [{ senderId: req.user.id }, { recipientId: req.user.id }] };

  if (type && type !== 'all') {
    query.transferType = type;
  }

  const transfers = await Transfer.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset))
    .lean();

  const total = await Transfer.countDocuments(query);

  logger.info('Transfer history retrieved', {
    userId: req.user.id,
    count: transfers.length
  });

  res.json(successResponse({
    transfers,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      pages: Math.ceil(total / parseInt(limit))
    }
  }, 'Transfer history retrieved successfully'));
}));

/**
 * GET /api/transfers/recipients
 * Get saved recipients
 */
router.get('/recipients', protect, asyncHandler(async (req, res) => {
  // Get unique recent transfer recipients
  const recipients = await Transfer.aggregate([
    {
      $match: { senderId: new (require('mongoose')).Types.ObjectId(req.user.id) }
    },
    {
      $group: {
        _id: '$recipientValue',
        recipientName: { $first: '$recipientName' },
        recipientType: { $first: '$recipientType' },
        lastTransfer: { $max: '$createdAt' }
      }
    },
    { $sort: { lastTransfer: -1 } },
    { $limit: 50 }
  ]);

  res.json(successResponse({
    recipients
  }, 'Recipients retrieved successfully'));
}));

/**
 * POST /api/transfers/recipients
 * Add recipient (save for future transfers)
 */
router.post('/recipients', protect, asyncHandler(async (req, res) => {
  const { recipientPhone, recipientCard, recipientIBAN } = req.body;

  if (!recipientPhone && !recipientCard && !recipientIBAN) {
    throw new BadRequestError('At least one recipient identifier is required');
  }

  // This is a placeholder - in a real app, you'd have a Recipient model
  // For now, we just validate and return success
  const recipient = {
    id: Math.random().toString(36).substr(2, 9),
    phone: recipientPhone,
    card: recipientCard ? `****${recipientCard.slice(-4)}` : null,
    iban: recipientIBAN ? `****${recipientIBAN.slice(-4)}` : null,
    savedAt: new Date()
  };

  logger.info('Recipient saved', {
    userId: req.user.id,
    recipientId: recipient.id
  });

  res.status(201).json(successResponse({
    recipient
  }, 'Recipient saved successfully'));
}));

/**
 * GET /api/transfers/:id
 * Get transfer details
 */
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const transfer = await Transfer.findById(req.params.id);

  if (!transfer) {
    throw new NotFoundError('Transfer');
  }

  // Check authorization
  if (transfer.senderId.toString() !== req.user.id && transfer.recipientId?.toString() !== req.user.id) {
    throw new BadRequestError('You are not authorized to view this transfer');
  }

  res.json(successResponse({
    transfer
  }, 'Transfer details retrieved successfully'));
}));

export default router;
