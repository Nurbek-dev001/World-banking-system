/**
 * Custom Error Classes and Error Handling Utilities
 */

/**
 * Base API Error class
 */
export class APIError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      status: 'error',
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp
    };
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends APIError {
  constructor(message, code = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends APIError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends APIError {
  constructor(resource = 'Resource', code = 'NOT_FOUND') {
    super(`${resource} not found`, 404, code);
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends APIError {
  constructor(message, code = 'CONFLICT') {
    super(message, 409, code);
  }
}

/**
 * Validation Error (422)
 */
export class ValidationError extends APIError {
  constructor(message, errors = {}, code = 'VALIDATION_ERROR') {
    super(message, 422, code);
    this.errors = errors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors
    };
  }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends APIError {
  constructor(message = 'Too many requests', retryAfter = 60) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter
    };
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends APIError {
  constructor(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    super(message, 500, code);
  }
}

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
export const globalErrorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = err;

  // Handle specific error types
  if (err.name === 'CastError') {
    error = new BadRequestError('Invalid ID format', 'INVALID_ID');
  } else if (err.name === 'ValidationError') {
    const errors = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
    error = new ValidationError('Validation failed', errors);
  } else if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = new ConflictError(`${field} already exists`, 'DUPLICATE_ENTRY');
  } else if (!(err instanceof APIError)) {
    error = new InternalServerError(
      process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    );
  }

  // Send error response
  res.status(error.statusCode).json(error.toJSON());
};

/**
 * Async handler wrapper for route handlers
 * Automatically catches errors and passes them to error handler
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Success response formatter
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Formatted response
 */
export const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    status: 'success',
    message,
    statusCode,
    data,
    timestamp: new Date().toISOString()
  };
};

/**
 * Paginated response formatter
 * @param {Array} data - Array of data items
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} message - Success message
 * @returns {Object} Formatted paginated response
 */
export const paginatedResponse = (data, total, page, limit, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  return {
    status: 'success',
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    timestamp: new Date().toISOString()
  };
};

export default {
  APIError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  globalErrorHandler,
  asyncHandler,
  successResponse,
  paginatedResponse
};
