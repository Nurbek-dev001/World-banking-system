/**
 * Database Seed - Create test clients with different profiles
 */

import User from '../models/User.js';
import Account from '../models/Account.js';
import logger from '../utils/logger.js';

const testClients = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+11234567890',
    password: 'SecurePass@123',
    monthlyIncome: 5000,
    creditScore: 750,
    totalTransactions: 150,
    averageMonthlyTransactions: 12,
    accountAgeMonths: 48,
    employment: { years: 8, currentJobMonths: 24 },
    monthlyDebt: 500,
    currentBalance: 15000,
    averageBalance: 10000,
    maxBalance: 25000,
    previousDeposits: 5,
    role: 'user'
  },
  {
    firstName: 'Sarah',
    lastName: 'Smith',
    email: 'sarah.smith@example.com',
    phone: '+12345678901',
    password: 'SecurePass@456',
    monthlyIncome: 3500,
    creditScore: 680,
    totalTransactions: 80,
    averageMonthlyTransactions: 6,
    accountAgeMonths: 24,
    employment: { years: 4, currentJobMonths: 12 },
    monthlyDebt: 700,
    currentBalance: 8000,
    averageBalance: 5000,
    maxBalance: 12000,
    previousDeposits: 2,
    role: 'user'
  },
  {
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@example.com',
    phone: '+13456789012',
    password: 'SecurePass@789',
    monthlyIncome: 4200,
    creditScore: 720,
    totalTransactions: 120,
    averageMonthlyTransactions: 10,
    accountAgeMonths: 36,
    employment: { years: 6, currentJobMonths: 18 },
    monthlyDebt: 400,
    currentBalance: 12000,
    averageBalance: 8500,
    maxBalance: 18000,
    previousDeposits: 3,
    role: 'user'
  },
  {
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma.wilson@example.com',
    phone: '+14567890123',
    password: 'SecurePass@101',
    monthlyIncome: 5500,
    creditScore: 800,
    totalTransactions: 200,
    averageMonthlyTransactions: 15,
    accountAgeMonths: 60,
    employment: { years: 10, currentJobMonths: 36 },
    monthlyDebt: 300,
    currentBalance: 20000,
    averageBalance: 15000,
    maxBalance: 30000,
    previousDeposits: 8,
    role: 'user'
  },
  {
    firstName: 'Robert',
    lastName: 'Brown',
    email: 'robert.brown@example.com',
    phone: '+15678901234',
    password: 'SecurePass@202',
    monthlyIncome: 2500,
    creditScore: 620,
    totalTransactions: 45,
    averageMonthlyTransactions: 4,
    accountAgeMonths: 12,
    employment: { years: 2, currentJobMonths: 8 },
    monthlyDebt: 900,
    currentBalance: 3000,
    averageBalance: 2000,
    maxBalance: 5000,
    previousDeposits: 0,
    role: 'user'
  },
  {
    firstName: 'Lisa',
    lastName: 'Garcia',
    email: 'lisa.garcia@example.com',
    phone: '+16789012345',
    password: 'SecurePass@303',
    monthlyIncome: 6000,
    creditScore: 780,
    totalTransactions: 180,
    averageMonthlyTransactions: 14,
    accountAgeMonths: 54,
    employment: { years: 9, currentJobMonths: 28 },
    monthlyDebt: 600,
    currentBalance: 18000,
    averageBalance: 12000,
    maxBalance: 22000,
    previousDeposits: 6,
    role: 'user'
  },
  {
    firstName: 'David',
    lastName: 'Martinez',
    email: 'david.martinez@example.com',
    phone: '+17890123456',
    password: 'SecurePass@404',
    monthlyIncome: 3000,
    creditScore: 650,
    totalTransactions: 60,
    averageMonthlyTransactions: 5,
    accountAgeMonths: 18,
    employment: { years: 3, currentJobMonths: 10 },
    monthlyDebt: 800,
    currentBalance: 5000,
    averageBalance: 3500,
    maxBalance: 8000,
    previousDeposits: 1,
    role: 'user'
  },
  {
    firstName: 'Jennifer',
    lastName: 'Lee',
    email: 'jennifer.lee@example.com',
    phone: '+18901234567',
    password: 'SecurePass@505',
    monthlyIncome: 4500,
    creditScore: 740,
    totalTransactions: 140,
    averageMonthlyTransactions: 11,
    accountAgeMonths: 42,
    employment: { years: 7, currentJobMonths: 20 },
    monthlyDebt: 450,
    currentBalance: 14000,
    averageBalance: 9000,
    maxBalance: 20000,
    previousDeposits: 4,
    role: 'user'
  },
  {
    firstName: 'James',
    lastName: 'Anderson',
    email: 'james.anderson@example.com',
    phone: '+19012345678',
    password: 'SecurePass@606',
    monthlyIncome: 2800,
    creditScore: 600,
    totalTransactions: 35,
    averageMonthlyTransactions: 3,
    accountAgeMonths: 8,
    employment: { years: 1, currentJobMonths: 5 },
    monthlyDebt: 1200,
    currentBalance: 2000,
    averageBalance: 1500,
    maxBalance: 3500,
    previousDeposits: 0,
    role: 'user'
  },
  {
    firstName: 'Patricia',
    lastName: 'Taylor',
    email: 'patricia.taylor@example.com',
    phone: '+11234509876',
    password: 'SecurePass@707',
    monthlyIncome: 5200,
    creditScore: 760,
    totalTransactions: 160,
    averageMonthlyTransactions: 13,
    accountAgeMonths: 50,
    employment: { years: 8, currentJobMonths: 25 },
    monthlyDebt: 550,
    currentBalance: 17000,
    averageBalance: 11000,
    maxBalance: 23000,
    previousDeposits: 5,
    role: 'user'
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@worldbank.com',
    phone: '+10000000000',
    password: 'AdminPass@123',
    monthlyIncome: 10000,
    creditScore: 850,
    totalTransactions: 500,
    averageMonthlyTransactions: 30,
    accountAgeMonths: 120,
    employment: { years: 15, currentJobMonths: 60 },
    monthlyDebt: 100,
    currentBalance: 100000,
    averageBalance: 75000,
    maxBalance: 150000,
    previousDeposits: 20,
    role: 'admin'
  }
];

/**
 * Create test accounts for each user
 */
async function createAccountsForUser(userId) {
  try {
    const accountTypes = ['checking', 'savings'];
    
    for (const type of accountTypes) {
      const accountNumber = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const account = await Account.create({
        userId,
        accountNumber,
        accountType: type,
        balance: type === 'checking' ? 5000 : 10000,
        currency: 'USD',
        status: 'active'
      });

      logger.info(`Created ${type} account for user`, {
        userId,
        accountId: account._id,
        accountNumber
      });
    }
  } catch (error) {
    logger.error('Error creating accounts for user', {
      userId,
      error: error.message
    });
  }
}

/**
 * Seed database with test data
 */
export async function seedDatabase() {
  try {
    logger.info('Starting database seed...');

    // Check if data already exists
    const existingUsers = await User.findOne({
      email: 'john.doe@example.com'
    });

    if (existingUsers) {
      logger.warn('Test data already exists, skipping seed');
      return { message: 'Test data already exists' };
    }

    // Create users
    const createdUsers = [];
    for (const clientData of testClients) {
      try {
        const user = await User.create({
          firstName: clientData.firstName,
          lastName: clientData.lastName,
          email: clientData.email,
          phone: clientData.phone,
          password: clientData.password,
          role: clientData.role,
          kycStatus: 'verified',
          status: 'active',
          // Financial profile data
          _financial: {
            monthlyIncome: clientData.monthlyIncome,
            creditScore: clientData.creditScore,
            monthlyDebt: clientData.monthlyDebt,
            employment: clientData.employment,
            transactions: {
              total: clientData.totalTransactions,
              averageMonthly: clientData.averageMonthlyTransactions
            },
            balance: {
              current: clientData.currentBalance,
              average: clientData.averageBalance,
              max: clientData.maxBalance
            },
            deposits: {
              previous: clientData.previousDeposits,
              defaulted: 0
            }
          }
        });

        // Create accounts for user
        await createAccountsForUser(user._id);

        createdUsers.push({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          password: clientData.password,
          role: user.role
        });

        logger.info(`Created user: ${user.email}`, {
          userId: user._id,
          role: user.role
        });
      } catch (error) {
        logger.error(`Error creating user ${clientData.email}`, {
          error: error.message
        });
      }
    }

    logger.info(`✅ Database seed completed`, {
      usersCreated: createdUsers.length,
      accountsCreated: createdUsers.length * 2 // 2 accounts per user
    });

    return {
      message: 'Database seed completed successfully',
      usersCreated: createdUsers.length,
      testAccounts: createdUsers
    };
  } catch (error) {
    logger.error('Database seed failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Clear all users and accounts (for testing)
 */
export async function clearDatabase() {
  try {
    logger.warn('Clearing all users and accounts...');
    
    const deletedUsers = await User.deleteMany({});
    const deletedAccounts = await Account.deleteMany({});

    logger.info('Database cleared', {
      usersDeleted: deletedUsers.deletedCount,
      accountsDeleted: deletedAccounts.deletedCount
    });

    return {
      message: 'Database cleared',
      usersDeleted: deletedUsers.deletedCount,
      accountsDeleted: deletedAccounts.deletedCount
    };
  } catch (error) {
    logger.error('Error clearing database', {
      error: error.message
    });
    throw error;
  }
}

export default {
  seedDatabase,
  clearDatabase,
  testClients
};
