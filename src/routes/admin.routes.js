import express from 'express';
import User from '../models/User.js';
import Account from '../models/Account.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { asyncHandler, successResponse, paginatedResponse, NotFoundError, BadRequestError } from '../utils/errorHandler.js';
import { seedDatabase, clearDatabase } from '../utils/seedDatabase.js';
import { LoanScoringService, DepositScoringService } from '../services/scoringService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * Admin Routes - Protected (Admin only)
 */

/**
 * GET /api/admin/statistics
 * Get platform statistics
 */
router.get('/statistics', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: 'active' });
  const blockedUsers = await User.countDocuments({ status: 'blocked' });
  const merchants = await User.countDocuments({ role: 'merchant' });

  res.json(successResponse({
    totalUsers,
    activeUsers,
    blockedUsers,
    merchants,
    timestamp: new Date()
  }, 'Platform statistics retrieved'));
}));

/**
 * GET /api/admin/clients
 * Get all clients with detailed information
 */
router.get('/clients', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status } = req.query;
  const skip = (page - 1) * limit;

  let query = { role: { $in: ['user', 'merchant'] } };

  if (search) {
    query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') }
    ];
  }

  if (status) {
    query.status = status;
  }

  const clients = await User.find(query)
    .select('-password')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  // Calculate scores for each client
  const clientsWithScores = clients.map(client => {
    const financialData = client._financial || {};
    const loanScore = LoanScoringService.calculateLoanScore({
      creditScore: financialData.creditScore || 650,
      monthlyIncome: financialData.monthlyIncome || 1000,
      monthlyDebt: financialData.monthlyDebt || 0,
      accountAgeMonths: client.createdAt 
        ? Math.floor((Date.now() - client.createdAt) / (1000 * 60 * 60 * 24 * 30))
        : 0,
      totalTransactions: financialData.transactions?.total || 0,
      averageMonthlyTransactions: financialData.transactions?.averageMonthly || 0,
      employmentYears: financialData.employment?.years || 0,
      currentJobMonths: financialData.employment?.currentJobMonths || 0
    });

    const depositScore = DepositScoringService.calculateDepositScore({
      currentBalance: financialData.balance?.current || 0,
      averageBalance: financialData.balance?.average || 0,
      maxBalance: financialData.balance?.max || 0,
      accountAgeMonths: client.createdAt 
        ? Math.floor((Date.now() - client.createdAt) / (1000 * 60 * 60 * 24 * 30))
        : 0,
      totalTransactions: financialData.transactions?.total || 0,
      averageMonthlyTransactions: financialData.transactions?.averageMonthly || 0,
      monthlyVariance: 2,
      monthsActive: client.createdAt 
        ? Math.floor((Date.now() - client.createdAt) / (1000 * 60 * 60 * 24 * 30))
        : 0,
      suspiciousActivityCount: 0,
      previousDeposits: financialData.deposits?.previous || 0,
      defaultedDeposits: financialData.deposits?.defaulted || 0
    });

    return {
      _id: client._id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      status: client.status,
      role: client.role,
      kycStatus: client.kycStatus,
      createdAt: client.createdAt,
      financial: {
        monthlyIncome: financialData.monthlyIncome,
        creditScore: financialData.creditScore,
        currentBalance: financialData.balance?.current,
        loanScore: {
          score: loanScore.totalScore,
          percentage: loanScore.percentage,
          status: loanScore.recommendation.status,
          tier: loanScore.recommendation.tier
        },
        depositScore: {
          score: depositScore.totalScore,
          percentage: depositScore.percentage,
          tier: depositScore.depositTier,
          interestRate: depositScore.recommendedInterestRate
        }
      }
    };
  });

  res.json(paginatedResponse(clientsWithScores, total, parseInt(page), parseInt(limit), 'Clients retrieved successfully'));
}));

/**
 * GET /api/admin/clients/:id
 * Get client details with accounts
 */
router.get('/clients/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const client = await User.findById(req.params.id).select('-password');

  if (!client) {
    throw new NotFoundError('Client');
  }

  // Fetch all accounts for this client
  const accounts = await Account.find({ userId: client._id });

  const financialData = client._financial || {};
  const loanScore = LoanScoringService.calculateLoanScore({
    creditScore: financialData.creditScore || 650,
    monthlyIncome: financialData.monthlyIncome || 1000,
    monthlyDebt: financialData.monthlyDebt || 0,
    accountAgeMonths: client.createdAt 
      ? Math.floor((Date.now() - client.createdAt) / (1000 * 60 * 60 * 24 * 30))
      : 0,
    totalTransactions: financialData.transactions?.total || 0,
    averageMonthlyTransactions: financialData.transactions?.averageMonthly || 0,
    employmentYears: financialData.employment?.years || 0,
    currentJobMonths: financialData.employment?.currentJobMonths || 0
  });

  const depositScore = DepositScoringService.calculateDepositScore({
    currentBalance: financialData.balance?.current || 0,
    averageBalance: financialData.balance?.average || 0,
    maxBalance: financialData.balance?.max || 0,
    accountAgeMonths: client.createdAt 
      ? Math.floor((Date.now() - client.createdAt) / (1000 * 60 * 60 * 24 * 30))
      : 0,
    totalTransactions: financialData.transactions?.total || 0,
    averageMonthlyTransactions: financialData.transactions?.averageMonthly || 0,
    monthlyVariance: 2,
    monthsActive: client.createdAt 
      ? Math.floor((Date.now() - client.createdAt) / (1000 * 60 * 60 * 24 * 30))
      : 0,
    suspiciousActivityCount: 0,
    previousDeposits: financialData.deposits?.previous || 0,
    defaultedDeposits: financialData.deposits?.defaulted || 0
  });

  res.json(successResponse({
    client: {
      _id: client._id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      dateOfBirth: client.dateOfBirth,
      address: client.address,
      status: client.status,
      role: client.role,
      kycStatus: client.kycStatus,
      createdAt: client.createdAt,
      ...client._financial
    },
    accounts: accounts.map(acc => ({
      _id: acc._id,
      accountNumber: acc.accountNumber,
      accountType: acc.accountType,
      currency: acc.currency,
      balance: acc.balance,
      availableBalance: acc.availableBalance,
      status: acc.status,
      createdAt: acc.createdAt
    })),
    loanScore,
    depositScore
  }, 'Client details retrieved successfully'));
}));

/**
 * POST /api/admin/users/:id/block
 * Block a user
 */
router.post('/users/:id/block', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: 'blocked' },
    { new: true }
  );

  if (!user) {
    throw new NotFoundError('User');
  }

  logger.warn('User blocked by admin', {
    userId: user._id,
    email: user.email,
    adminId: req.user.id
  });

  res.json(successResponse(user, 'User blocked successfully'));
}));

/**
 * POST /api/admin/users/:id/unblock
 * Unblock a user
 */
router.post('/users/:id/unblock', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: 'active' },
    { new: true }
  );

  if (!user) {
    throw new NotFoundError('User');
  }

  logger.info('User unblocked by admin', {
    userId: user._id,
    email: user.email,
    adminId: req.user.id
  });

  res.json(successResponse(user, 'User unblocked successfully'));
}));

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get('/users', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .select('-password')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments();

  res.json(paginatedResponse(users, total, parseInt(page), parseInt(limit)));
}));

/**
 * GET /api/admin/transactions
 * Get all transactions
 */
router.get('/transactions', protect, authorize('admin'), asyncHandler(async (req, res) => {
  res.json(successResponse([], 'Transactions endpoint'));
}));

/**
 * GET /api/admin/reports
 * Get all reports
 */
router.get('/reports', protect, authorize('admin'), asyncHandler(async (req, res) => {
  res.json(successResponse([], 'Reports endpoint'));
}));

/**
 * POST /api/admin/reports/generate
 * Generate new report
 */
router.post('/reports/generate', protect, authorize('admin'), asyncHandler(async (req, res) => {
  res.json(successResponse({ message: 'Report generation started' }));
}));

/**
 * GET /api/admin/settings
 * Get platform settings
 */
router.get('/settings', protect, authorize('admin'), asyncHandler(async (req, res) => {
  res.json(successResponse({
    loanSettings: {
      minAmount: 1000,
      maxAmount: 100000,
      minTenure: 6,
      maxTenure: 60,
      defaultRate: 12.5
    },
    depositSettings: {
      minAmount: 100,
      maxAmount: 1000000,
      minDuration: 3,
      maxDuration: 120,
      defaultRate: 5.5
    }
  }, 'Settings retrieved'));
}));

/**
 * PUT /api/admin/settings
 * Update platform settings
 */
router.put('/settings', protect, authorize('admin'), asyncHandler(async (req, res) => {
  res.json(successResponse({ message: 'Settings updated' }));
}));

/**
 * GET /api/admin/logs
 * Get system logs
 */
router.get('/logs', protect, authorize('admin'), asyncHandler(async (req, res) => {
  res.json(successResponse({
    message: 'System logs would be displayed here',
    timestamp: new Date()
  }));
}));

/**
 * POST /api/admin/seed
 * Seed database with test clients (DEVELOPMENT ONLY)
 */
router.post('/seed', protect, authorize('admin'), asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    throw new BadRequestError('Seeding is not allowed in production');
  }

  const result = await seedDatabase();

  logger.info('Database seeded by admin', {
    adminId: req.user.id,
    usersCreated: result.usersCreated
  });

  res.json(successResponse(result, 'Database seeded successfully'));
}));

/**
 * POST /api/admin/clear
 * Clear database (DEVELOPMENT ONLY - USE WITH CAUTION)
 */
router.post('/clear', protect, authorize('admin'), asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    throw new BadRequestError('Database clearing is not allowed in production');
  }

  if (!req.body.confirm) {
    throw new BadRequestError('Please confirm by sending confirm: true');
  }

  const result = await clearDatabase();

  logger.warn('Database cleared by admin', {
    adminId: req.user.id,
    usersDeleted: result.usersDeleted
  });

  res.json(successResponse(result, 'Database cleared'));
}));

export default router;
