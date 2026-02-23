/**
 * Input Validation Middleware
 * Provides centralized validation for common data types
 */

import { body, validationResult, param, query } from 'express-validator';

/**
 * Validation error handler middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Email validation rules
 */
export const emailValidation = () => {
  return body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail();
};

/**
 * Password validation rules
 */
export const passwordValidation = () => {
  return body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character');
};

/**
 * Phone number validation rules
 */
export const phoneValidation = () => {
  return body('phone')
    .matches(/^[+]?[0-9]{10,15}$/)
    .withMessage('Please provide a valid phone number');
};

/**
 * Name validation rules
 */
export const nameValidation = (field = 'name') => {
  return body(field)
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(`${field} must be between 2 and 50 characters`)
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(`${field} contains invalid characters`);
};

/**
 * User registration validation
 */
export const validateUserRegistration = () => {
  return [
    nameValidation('firstName'),
    nameValidation('lastName'),
    emailValidation(),
    phoneValidation(),
    passwordValidation(),
    handleValidationErrors
  ];
};

/**
 * User login validation
 */
export const validateUserLogin = () => {
  return [
    body('email')
      .trim()
      .toLowerCase()
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ];
};

/**
 * Amount validation (for transactions)
 */
export const validateAmount = (field = 'amount') => {
  return body(field)
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0')
    .custom(value => {
      if (value > 1000000) {
        throw new Error('Amount exceeds maximum transaction limit');
      }
      return true;
    });
};

/**
 * Transaction validation
 */
export const validateTransaction = () => {
  return [
    validateAmount('amount'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    handleValidationErrors
  ];
};

/**
 * ID parameter validation
 */
export const validateMongoId = (paramName = 'id') => {
  return [
    param(paramName)
      .isMongoId()
      .withMessage(`Invalid ${paramName} format`),
    handleValidationErrors
  ];
};

/**
 * Pagination validation
 */
export const validatePagination = () => {
  return [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ];
};

/**
 * Account transfer validation
 */
export const validateTransfer = () => {
  return [
    body('recipientAccountNumber')
      .trim()
      .matches(/^[0-9]{10,20}$/)
      .withMessage('Invalid account number'),
    validateAmount('amount'),
    handleValidationErrors
  ];
};

/**
 * Card creation validation
 */
export const validateCardCreation = () => {
  return [
    body('cardName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Card name must be between 2 and 50 characters'),
    body('cardType')
      .isIn(['debit', 'credit', 'prepaid'])
      .withMessage('Invalid card type'),
    handleValidationErrors
  ];
};

export default {
  handleValidationErrors,
  emailValidation,
  passwordValidation,
  phoneValidation,
  nameValidation,
  validateUserRegistration,
  validateUserLogin,
  validateAmount,
  validateTransaction,
  validateMongoId,
  validatePagination,
  validateTransfer,
  validateCardCreation
};
