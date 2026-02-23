/**
 * Machine Learning Scoring Service
 * Calculates financial eligibility scores for loans and deposits
 */

/**
 * Loan Eligibility Scoring
 * Uses ML-like algorithm to calculate loan approval probability
 * 
 * Factors:
 * - Credit history (0-20 points)
 * - Income level (0-20 points)
 * - Debt-to-income ratio (0-15 points)
 * - Account age (0-15 points)
 * - Transaction history (0-15 points)
 * - Employment stability (0-15 points)
 * Total: 100 points
 */
export class LoanScoringService {
  /**
   * Calculate loan eligibility score
   * @param {Object} userData - User financial data
   * @returns {Object} Score and recommendation
   */
  static calculateLoanScore(userData) {
    let score = 0;
    const breakdown = {};

    // 1. Credit Score (0-20 points)
    const creditPoints = this.creditScorePoints(userData.creditScore || 650);
    breakdown.creditScore = creditPoints;
    score += creditPoints;

    // 2. Income Level (0-20 points)
    const incomePoints = this.incomePoints(userData.monthlyIncome || 1000);
    breakdown.income = incomePoints;
    score += incomePoints;

    // 3. Debt-to-Income Ratio (0-15 points)
    const debtRatioPoints = this.debtRatioPoints(
      userData.monthlyDebt || 0,
      userData.monthlyIncome || 1000
    );
    breakdown.debtRatio = debtRatioPoints;
    score += debtRatioPoints;

    // 4. Account Age in Months (0-15 points)
    const accountAgePoints = this.accountAgePoints(userData.accountAgeMonths || 0);
    breakdown.accountAge = accountAgePoints;
    score += accountAgePoints;

    // 5. Transaction History (0-15 points)
    const transactionPoints = this.transactionHistoryPoints(
      userData.totalTransactions || 0,
      userData.averageMonthlyTransactions || 0
    );
    breakdown.transactions = transactionPoints;
    score += transactionPoints;

    // 6. Employment Stability (0-15 points)
    const employmentPoints = this.employmentStabilityPoints(
      userData.employmentYears || 0,
      userData.currentJobMonths || 0
    );
    breakdown.employment = employmentPoints;
    score += employmentPoints;

    // Calculate probability
    const probability = score / 100;
    const recommendation = this.getLoanRecommendation(score, probability);

    return {
      totalScore: Math.round(score),
      maxScore: 100,
      percentage: Math.round(probability * 100),
      probability,
      recommendation,
      breakdown,
      eligibleLoanAmount: this.calculateMaxLoanAmount(
        userData.monthlyIncome || 1000,
        score
      ),
      maxInterestRate: this.calculateMaxInterestRate(score)
    };
  }

  /**
   * Credit score evaluation (0-20 points)
   */
  static creditScorePoints(creditScore) {
    if (creditScore >= 750) return 20;
    if (creditScore >= 700) return 18;
    if (creditScore >= 650) return 15;
    if (creditScore >= 600) return 10;
    if (creditScore >= 550) return 5;
    return 0;
  }

  /**
   * Income level evaluation (0-20 points)
   */
  static incomePoints(monthlyIncome) {
    if (monthlyIncome >= 5000) return 20;
    if (monthlyIncome >= 4000) return 18;
    if (monthlyIncome >= 3000) return 16;
    if (monthlyIncome >= 2000) return 13;
    if (monthlyIncome >= 1000) return 8;
    return 2;
  }

  /**
   * Debt-to-income ratio evaluation (0-15 points)
   */
  static debtRatioPoints(monthlyDebt, monthlyIncome) {
    if (monthlyIncome === 0) return 0;
    const ratio = monthlyDebt / monthlyIncome;

    if (ratio <= 0.2) return 15; // Excellent
    if (ratio <= 0.3) return 12; // Good
    if (ratio <= 0.4) return 9;  // Fair
    if (ratio <= 0.5) return 5;  // Poor
    return 0;                    // Too much debt
  }

  /**
   * Account age evaluation (0-15 points)
   */
  static accountAgePoints(accountAgeMonths) {
    if (accountAgeMonths >= 60) return 15;  // 5+ years
    if (accountAgeMonths >= 36) return 12;  // 3+ years
    if (accountAgeMonths >= 24) return 10;  // 2+ years
    if (accountAgeMonths >= 12) return 7;   // 1+ year
    if (accountAgeMonths >= 6) return 4;    // 6+ months
    return 1;                               // New account
  }

  /**
   * Transaction history evaluation (0-15 points)
   */
  static transactionHistoryPoints(totalTransactions, avgMonthlyTransactions) {
    let points = 0;

    // Total transactions impact
    if (totalTransactions >= 100) points += 8;
    else if (totalTransactions >= 50) points += 5;
    else if (totalTransactions >= 20) points += 3;
    else points += 1;

    // Monthly consistency impact
    if (avgMonthlyTransactions >= 10) points += 7;
    else if (avgMonthlyTransactions >= 5) points += 5;
    else if (avgMonthlyTransactions >= 2) points += 3;
    else points += 1;

    return Math.min(points, 15);
  }

  /**
   * Employment stability evaluation (0-15 points)
   */
  static employmentStabilityPoints(employmentYears, currentJobMonths) {
    let points = 0;

    // Overall employment experience
    if (employmentYears >= 10) points += 7;
    else if (employmentYears >= 5) points += 5;
    else if (employmentYears >= 2) points += 3;
    else points += 1;

    // Current job stability
    if (currentJobMonths >= 36) points += 8;
    else if (currentJobMonths >= 12) points += 6;
    else if (currentJobMonths >= 6) points += 4;
    else points += 2;

    return Math.min(points, 15);
  }

  /**
   * Get loan recommendation based on score
   */
  static getLoanRecommendation(score, probability) {
    if (score >= 85) {
      return {
        status: 'APPROVED',
        tier: 'Excellent',
        message: 'Excellent credit profile - Approved for maximum loan amount',
        color: 'success'
      };
    }
    if (score >= 70) {
      return {
        status: 'APPROVED',
        tier: 'Good',
        message: 'Good credit profile - Approved with standard terms',
        color: 'success'
      };
    }
    if (score >= 55) {
      return {
        status: 'CONDITIONAL',
        tier: 'Fair',
        message: 'Fair credit profile - Approved with stricter terms',
        color: 'warning'
      };
    }
    if (score >= 40) {
      return {
        status: 'REVIEW',
        tier: 'Poor',
        message: 'Poor credit profile - Requires manual review',
        color: 'warning'
      };
    }
    return {
      status: 'DENIED',
      tier: 'Very Poor',
      message: 'Credit profile does not meet minimum requirements',
      color: 'danger'
    };
  }

  /**
   * Calculate maximum eligible loan amount
   */
  static calculateMaxLoanAmount(monthlyIncome, score) {
    // Loan amount can be 3-10x monthly income depending on score
    const multiplier = 3 + (score / 100) * 7; // 3x to 10x
    return Math.round(monthlyIncome * multiplier);
  }

  /**
   * Calculate maximum interest rate based on score
   */
  static calculateMaxInterestRate(score) {
    // Rate from 18% to 5%
    const minRate = 5;
    const maxRate = 18;
    const rate = maxRate - (score / 100) * (maxRate - minRate);
    return parseFloat(rate.toFixed(2));
  }
}

/**
 * Deposit Eligibility Scoring
 * Uses ML-like algorithm to calculate deposit approval and interest rate
 * 
 * Factors:
 * - Account balance history (0-25 points)
 * - Account age (0-20 points)
 * - Transaction consistency (0-20 points)
 * - Account stability (0-20 points)
 * - Previous deposit experience (0-15 points)
 * Total: 100 points
 */
export class DepositScoringService {
  /**
   * Calculate deposit eligibility score
   * @param {Object} userData - User financial data
   * @returns {Object} Score and recommendation
   */
  static calculateDepositScore(userData) {
    let score = 0;
    const breakdown = {};

    // 1. Account Balance History (0-25 points)
    const balancePoints = this.balanceHistoryPoints(
      userData.currentBalance || 0,
      userData.averageBalance || 0,
      userData.maxBalance || 0
    );
    breakdown.balanceHistory = balancePoints;
    score += balancePoints;

    // 2. Account Age (0-20 points)
    const agePoints = this.accountAgePoints(userData.accountAgeMonths || 0);
    breakdown.accountAge = agePoints;
    score += agePoints;

    // 3. Transaction Consistency (0-20 points)
    const consistencyPoints = this.transactionConsistencyPoints(
      userData.totalTransactions || 0,
      userData.averageMonthlyTransactions || 0,
      userData.monthlyVariance || 0
    );
    breakdown.consistency = consistencyPoints;
    score += consistencyPoints;

    // 4. Account Stability (0-20 points)
    const stabilityPoints = this.accountStabilityPoints(
      userData.monthsActive || 0,
      userData.suspiciousActivityCount || 0
    );
    breakdown.stability = stabilityPoints;
    score += stabilityPoints;

    // 5. Previous Deposit Experience (0-15 points)
    const depositPoints = this.depositExperiencePoints(
      userData.previousDeposits || 0,
      userData.defaultedDeposits || 0
    );
    breakdown.depositExperience = depositPoints;
    score += depositPoints;

    // Calculate probability
    const probability = score / 100;
    const recommendation = this.getDepositRecommendation(score, probability);

    return {
      totalScore: Math.round(score),
      maxScore: 100,
      percentage: Math.round(probability * 100),
      probability,
      recommendation,
      breakdown,
      maxDepositAmount: this.calculateMaxDepositAmount(
        userData.currentBalance || 0,
        userData.monthlyIncome || 0,
        score
      ),
      recommendedInterestRate: this.calculateInterestRate(score),
      depositTier: this.getDepositTier(score)
    };
  }

  /**
   * Account balance history evaluation (0-25 points)
   */
  static balanceHistoryPoints(currentBalance, averageBalance, maxBalance) {
    let points = 0;

    // Current balance
    if (currentBalance >= 10000) points += 10;
    else if (currentBalance >= 5000) points += 8;
    else if (currentBalance >= 2000) points += 6;
    else if (currentBalance >= 500) points += 4;
    else points += 1;

    // Average balance
    if (averageBalance >= 5000) points += 10;
    else if (averageBalance >= 2000) points += 8;
    else if (averageBalance >= 1000) points += 6;
    else if (averageBalance >= 500) points += 3;
    else points += 1;

    // Max balance achieved
    if (maxBalance >= 20000) points += 5;
    else if (maxBalance >= 10000) points += 4;
    else if (maxBalance >= 5000) points += 3;
    else points += 1;

    return Math.min(points, 25);
  }

  /**
   * Account age evaluation (0-20 points)
   */
  static accountAgePoints(accountAgeMonths) {
    if (accountAgeMonths >= 60) return 20;   // 5+ years
    if (accountAgeMonths >= 36) return 17;   // 3+ years
    if (accountAgeMonths >= 24) return 14;   // 2+ years
    if (accountAgeMonths >= 12) return 10;   // 1+ year
    if (accountAgeMonths >= 6) return 6;     // 6+ months
    if (accountAgeMonths >= 3) return 3;     // 3+ months
    return 1;                                // New account
  }

  /**
   * Transaction consistency evaluation (0-20 points)
   */
  static transactionConsistencyPoints(totalTransactions, avgMonthly, variance) {
    let points = 0;

    // Total transaction volume
    if (totalTransactions >= 200) points += 10;
    else if (totalTransactions >= 100) points += 8;
    else if (totalTransactions >= 50) points += 5;
    else if (totalTransactions >= 20) points += 3;
    else points += 1;

    // Monthly consistency (lower variance is better)
    if (variance <= 2) points += 10; // Very consistent
    else if (variance <= 4) points += 8;
    else if (variance <= 6) points += 5;
    else points += 2;

    return Math.min(points, 20);
  }

  /**
   * Account stability evaluation (0-20 points)
   */
  static accountStabilityPoints(monthsActive, suspiciousActivityCount) {
    let points = 0;

    // Months actively used
    if (monthsActive >= 48) points += 15;
    else if (monthsActive >= 24) points += 12;
    else if (monthsActive >= 12) points += 9;
    else if (monthsActive >= 6) points += 5;
    else points += 2;

    // Suspicious activity penalty
    const suspiciousPenalty = suspiciousActivityCount * 2;
    points = Math.max(points - suspiciousPenalty, 0);

    return Math.min(points, 20);
  }

  /**
   * Previous deposit experience evaluation (0-15 points)
   */
  static depositExperiencePoints(previousDeposits, defaultedDeposits) {
    let points = 0;

    // Previous deposit count
    if (previousDeposits >= 5) points += 12;
    else if (previousDeposits >= 3) points += 9;
    else if (previousDeposits >= 1) points += 5;
    else points += 1;

    // Default penalty
    const defaultPenalty = defaultedDeposits * 5;
    points = Math.max(points - defaultPenalty, 0);

    return Math.min(points, 15);
  }

  /**
   * Get deposit recommendation
   */
  static getDepositRecommendation(score, probability) {
    if (score >= 85) {
      return {
        status: 'APPROVED',
        tier: 'Premium',
        message: 'Excellent account - Premium deposit rates available',
        color: 'success'
      };
    }
    if (score >= 70) {
      return {
        status: 'APPROVED',
        tier: 'Gold',
        message: 'Good account - Standard high interest rate',
        color: 'success'
      };
    }
    if (score >= 55) {
      return {
        status: 'APPROVED',
        tier: 'Silver',
        message: 'Fair account - Standard interest rate',
        color: 'info'
      };
    }
    if (score >= 40) {
      return {
        status: 'APPROVED',
        tier: 'Bronze',
        message: 'Basic account - Lower interest rate',
        color: 'warning'
      };
    }
    return {
      status: 'REVIEW',
      tier: 'Restricted',
      message: 'Account requires manual review',
      color: 'warning'
    };
  }

  /**
   * Calculate maximum deposit amount
   */
  static calculateMaxDepositAmount(currentBalance, monthlyIncome, score) {
    // Max deposit based on balance and score multiplier
    const multiplier = 2 + (score / 100) * 3; // 2x to 5x
    return Math.round(currentBalance + monthlyIncome * multiplier);
  }

  /**
   * Calculate interest rate based on score
   */
  static calculateInterestRate(score) {
    // Rate from 2% to 8% based on score
    const minRate = 2;
    const maxRate = 8;
    const rate = minRate + (score / 100) * (maxRate - minRate);
    return parseFloat(rate.toFixed(2));
  }

  /**
   * Get deposit tier name
   */
  static getDepositTier(score) {
    if (score >= 85) return 'Premium';
    if (score >= 70) return 'Gold';
    if (score >= 55) return 'Silver';
    if (score >= 40) return 'Bronze';
    return 'Restricted';
  }
}

export default {
  LoanScoringService,
  DepositScoringService
};
