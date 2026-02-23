/**
 * Transaction Service
 * Handles all transaction-related business logic
 */

import Transfer from '../models/Transfer.js';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import Loan from '../models/Loan.js';
import Deposit from '../models/Deposit.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export class TransactionService {
  /**
   * Create a transaction record
   */
  static async createTransaction(transactionData) {
    try {
      const transaction = new Transaction(transactionData);
      await transaction.save();
      
      logger.info('Transaction created', {
        transactionId: transaction._id,
        type: transaction.type,
        amount: transaction.amount
      });
      
      return transaction;
    } catch (error) {
      logger.error('Failed to create transaction', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user transaction history
   */
  static async getTransactionHistory(userId, filters = {}) {
    try {
      const query = { userId };
      
      if (filters.type) query.type = filters.type;
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();

      const total = await Transaction.countDocuments(query);

      return {
        transactions,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get transaction history', { error: error.message });
      throw error;
    }
  }

  /**
   * Get account transactions
   */
  static async getAccountTransactions(accountId, limit = 50, offset = 0) {
    try {
      const transactions = await Transaction.find({ accountId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();

      const total = await Transaction.countDocuments({ accountId });

      return {
        transactions,
        total,
        limit,
        offset
      };
    } catch (error) {
      logger.error('Failed to get account transactions', { error: error.message });
      throw error;
    }
  }

  /**
   * Reverse transaction (for refunds)
   */
  static async reverseTransaction(transactionId) {
    try {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Create reverse transaction
      const reverseTransaction = new Transaction({
        userId: transaction.userId,
        type: `${transaction.type}_reversed`,
        amount: transaction.amount,
        currency: transaction.currency,
        description: `Reversal: ${transaction.description}`,
        accountId: transaction.accountId,
        status: 'completed',
        reference: `REV-${transactionId}`
      });

      await reverseTransaction.save();

      // Refund to account if it was a debit
      if (['transfer_sent', 'deposit_created', 'payment'].includes(transaction.type)) {
        const account = await Account.findById(transaction.accountId);
        if (account) {
          account.balance += transaction.amount;
          if (transaction.fee) {
            account.balance += transaction.fee;
          }
          await account.save();
        }
      }

      logger.info('Transaction reversed', {
        originalTransactionId: transactionId,
        reverseTransactionId: reverseTransaction._id
      });

      return reverseTransaction;
    } catch (error) {
      logger.error('Failed to reverse transaction', { error: error.message });
      throw error;
    }
  }

  /**
   * Get spending analytics
   */
  static async getSpendingAnalytics(userId, monthsBack = 12) {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsBack);

      const transactions = await Transaction.find({
        userId,
        createdAt: { $gte: startDate },
        type: { $in: ['transfer_sent', 'payment', 'loan_payment', 'deposit_created'] }
      }).lean();

      // Group by type
      const byType = {};
      // Group by month
      const byMonth = {};
      let totalSpent = 0;

      transactions.forEach(t => {
        // By type
        if (!byType[t.type]) {
          byType[t.type] = { count: 0, total: 0 };
        }
        byType[t.type].count += 1;
        byType[t.type].total += t.amount;

        // By month
        const month = new Date(t.createdAt).toISOString().substring(0, 7);
        if (!byMonth[month]) {
          byMonth[month] = { count: 0, total: 0 };
        }
        byMonth[month].count += 1;
        byMonth[month].total += t.amount;

        totalSpent += t.amount;
      });

      const averageMonthly = totalSpent / monthsBack;

      return {
        summary: {
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          averageMonthly: parseFloat(averageMonthly.toFixed(2)),
          transactionCount: transactions.length
        },
        byType,
        byMonth
      };
    } catch (error) {
      logger.error('Failed to get spending analytics', { error: error.message });
      throw error;
    }
  }
}

/**
 * Loan Repayment Service
 * Handles loan repayment tracking and calculations
 */
export class LoanRepaymentService {
  /**
   * Calculate EMI (Equated Monthly Installment)
   */
  static calculateEMI(loanAmount, annualRate, tenureMonths) {
    const monthlyRate = annualRate / 12 / 100;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return parseFloat(emi.toFixed(2));
  }

  /**
   * Get loan amortization schedule
   */
  static generateAmortizationSchedule(loanAmount, annualRate, tenureMonths) {
    const monthlyRate = annualRate / 12 / 100;
    const emi = this.calculateEMI(loanAmount, annualRate, tenureMonths);
    
    const schedule = [];
    let balance = loanAmount;

    for (let i = 1; i <= tenureMonths; i++) {
      const interest = balance * monthlyRate;
      const principal = emi - interest;
      balance -= principal;

      schedule.push({
        month: i,
        principalAmount: parseFloat(principal.toFixed(2)),
        interestAmount: parseFloat(interest.toFixed(2)),
        emi,
        remainingBalance: parseFloat(Math.max(0, balance).toFixed(2))
      });
    }

    return schedule;
  }

  /**
   * Check for overdue payments
   */
  static async checkOverduePayments() {
    try {
      const now = new Date();
      
      const overdueLoans = await Loan.find({
        nextPaymentDate: { $lt: now },
        status: { $in: ['active', 'conditional'] }
      }).populate('userId', 'email phone');

      for (const loan of overdueLoans) {
        const daysOverdue = Math.floor((now - loan.nextPaymentDate) / (1000 * 60 * 60 * 24));
        
        logger.warn('Overdue loan detected', {
          loanId: loan._id,
          userId: loan.userId._id,
          daysOverdue,
          amount: loan.monthlyPayment
        });

        // Send notification to user (implement notification service)
        // await notificationService.sendOverdueWarning(loan.userId, loan, daysOverdue);
      }

      return overdueLoans;
    } catch (error) {
      logger.error('Failed to check overdue payments', { error: error.message });
      throw error;
    }
  }

  /**
   * Process automatic payment if enabled
   */
  static async processAutomaticPayment(loanId) {
    try {
      const loan = await Loan.findById(loanId).populate('userId');
      if (!loan || loan.status !== 'active') {
        return null;
      }

      // Get user's default account
      const account = await Account.findOne({ 
        userId: loan.userId._id,
        status: 'active'
      });

      if (!account || account.balance < loan.monthlyPayment) {
        logger.warn('Automatic payment failed - insufficient funds', {
          loanId,
          userId: loan.userId._id
        });
        return null;
      }

      // Process payment
      loan.payments.push({
        amount: loan.monthlyPayment,
        date: new Date(),
        status: 'paid'
      });

      loan.remainingBalance = Math.max(0, loan.remainingBalance - loan.monthlyPayment);
      if (loan.remainingBalance <= 0) {
        loan.status = 'completed';
      } else {
        const nextDate = new Date(loan.nextPaymentDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        loan.nextPaymentDate = nextDate;
      }

      await loan.save();

      // Update account
      account.balance -= loan.monthlyPayment;
      await account.save();

      logger.info('Automatic loan payment processed', {
        loanId,
        userId: loan.userId._id,
        amount: loan.monthlyPayment
      });

      return { success: true, loan };
    } catch (error) {
      logger.error('Failed to process automatic payment', { error: error.message });
      throw error;
    }
  }
}

/**
 * Deposit Interest Service
 * Handles deposit interest calculations and maturity
 */
export class DepositInterestService {
  /**
   * Calculate compound interest
   */
  static calculateCompoundInterest(principal, rate, timeInMonths, compoundingFrequency = 'monthly') {
    const n = compoundingFrequency === 'monthly' ? 12 : 1; // Compounds per year
    const t = timeInMonths / 12; // Convert to years
    const r = rate / 100;

    const amount = principal * Math.pow(1 + r / n, n * t);
    const interest = amount - principal;

    return {
      principal: parseFloat(principal.toFixed(2)),
      interest: parseFloat(interest.toFixed(2)),
      maturityAmount: parseFloat(amount.toFixed(2)),
      rate,
      timeInMonths,
      effectiveAnnualRate: parseFloat((Math.pow(1 + r / n, n) - 1) * 100).toFixed(2)
    };
  }

  /**
   * Process deposit maturity
   */
  static async processDepositMaturity() {
    try {
      const now = new Date();
      
      const matureDeposits = await Deposit.find({
        endDate: { $lte: now },
        status: 'active'
      }).populate('userId');

      for (const deposit of matureDeposits) {
        // Calculate final interest
        const finalInterest = deposit.expectedInterest;
        
        // Get user's account
        const account = await Account.findOne({ userId: deposit.userId._id });
        
        if (account) {
          // Credit amount + interest to account
          account.balance += deposit.amount + finalInterest;
          account.availableBalance += deposit.amount; // Free up locked amount
          await account.save();

          // Create transaction
          const transaction = new Transaction({
            userId: deposit.userId._id,
            type: 'deposit_matured',
            amount: deposit.amount + finalInterest,
            currency: deposit.currency,
            description: `Deposit matured - Principal: ${deposit.amount}, Interest: ${finalInterest}`,
            accountId: account._id,
            status: 'completed',
            reference: `DEP-MAT-${deposit._id}`
          });
          await transaction.save();
        }

        // Update deposit status
        deposit.status = 'matured';
        deposit.earnedInterest = finalInterest;
        await deposit.save();

        logger.info('Deposit matured', {
          depositId: deposit._id,
          userId: deposit.userId._id,
          amount: deposit.amount,
          interest: finalInterest
        });
      }

      return matureDeposits;
    } catch (error) {
      logger.error('Failed to process deposit maturity', { error: error.message });
      throw error;
    }
  }

  /**
   * Auto-renew deposits if enabled
   */
  static async processAutoRenewal() {
    try {
      const now = new Date();
      
      const renewableDeposits = await Deposit.find({
        endDate: { $lte: now },
        status: 'matured',
        autoRenewal: true
      }).populate('userId');

      for (const deposit of renewableDeposits) {
        const newDeposit = new Deposit({
          userId: deposit.userId._id,
          amount: deposit.amount + deposit.earnedInterest, // Compound interest
          duration: deposit.duration,
          depositType: deposit.depositType,
          interestRate: deposit.interestRate,
          currency: deposit.currency,
          startDate: now,
          endDate: new Date(now.setMonth(now.getMonth() + deposit.duration)),
          autoRenewal: true,
          status: 'active'
        });

        await newDeposit.save();

        logger.info('Deposit auto-renewed', {
          originalDepositId: deposit._id,
          newDepositId: newDeposit._id,
          newAmount: newDeposit.amount
        });
      }

      return renewableDeposits.length;
    } catch (error) {
      logger.error('Failed to process auto-renewal', { error: error.message });
      throw error;
    }
  }
}

/**
 * Fund Transfer Service
 * Handles all fund transfer operations
 */
export class FundTransferService {
  /**
   * Calculate transfer fee based on amount and type
   */
  static calculateTransferFee(amount, transferType = 'domestic') {
    let feePercentage = 0;
    let minimumFee = 0;
    let maximumFee = 0;

    if (transferType === 'domestic') {
      feePercentage = 0.005; // 0.5%
      minimumFee = 50; // 50 KZT
      maximumFee = 5000; // 5000 KZT
    } else if (transferType === 'international') {
      feePercentage = 0.015; // 1.5%
      minimumFee = 500; // 500 KZT
      maximumFee = 50000; // 50000 KZT
    }

    let fee = amount * feePercentage;
    fee = Math.max(fee, minimumFee);
    fee = Math.min(fee, maximumFee);

    return parseFloat(fee.toFixed(2));
  }

  /**
   * Validate transfer limits
   */
  static async validateTransferLimits(userId, amount, transferType = 'domestic') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get today's transfers
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayTransfers = await Transfer.find({
        senderId: userId,
        createdAt: { $gte: today },
        status: 'completed'
      });

      const todayTotal = todayTransfers.reduce((sum, t) => sum + t.amount, 0);

      // Daily limits
      const dailyLimit = transferType === 'international' ? 50000 : 500000;
      const monthlyLimit = transferType === 'international' ? 500000 : 2500000;
      const transactionLimit = transferType === 'international' ? 50000 : 1000000;

      // Validate transaction amount
      if (amount > transactionLimit) {
        return {
          allowed: false,
          reason: `Single transfer limit is ${transactionLimit}`
        };
      }

      // Validate daily limit
      if (todayTotal + amount > dailyLimit) {
        return {
          allowed: false,
          reason: `Daily limit is ${dailyLimit}. You have transferred ${todayTotal} today.`,
          remainingToday: dailyLimit - todayTotal
        };
      }

      // Check monthly limit
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthTransfers = await Transfer.find({
        senderId: userId,
        createdAt: { $gte: startOfMonth },
        status: 'completed'
      });

      const monthTotal = monthTransfers.reduce((sum, t) => sum + t.amount, 0);
      if (monthTotal + amount > monthlyLimit) {
        return {
          allowed: false,
          reason: `Monthly limit is ${monthlyLimit}. You have transferred ${monthTotal} this month.`,
          remainingThisMonth: monthlyLimit - monthTotal
        };
      }

      return {
        allowed: true,
        dailyRemaining: dailyLimit - todayTotal - amount,
        monthlyRemaining: monthlyLimit - monthTotal - amount
      };
    } catch (error) {
      logger.error('Failed to validate transfer limits', { error: error.message });
      throw error;
    }
  }

  /**
   * Get transfer status
   */
  static async getTransferStatus(transferId) {
    try {
      const transfer = await Transfer.findById(transferId);
      if (!transfer) {
        throw new Error('Transfer not found');
      }

      return {
        id: transfer._id,
        reference: transfer.reference,
        status: transfer.status,
        amount: transfer.amount,
        fee: transfer.fee,
        createdAt: transfer.createdAt,
        completedAt: transfer.updatedAt,
        failureReason: transfer.failureReason
      };
    } catch (error) {
      logger.error('Failed to get transfer status', { error: error.message });
      throw error;
    }
  }
}
