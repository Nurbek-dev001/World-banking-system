/**
 * Logging Utility
 * Provides structured logging for the application
 */

const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  TRACE: 'TRACE'
};

const Colors = {
  ERROR: '\x1b[31m',   // Red
  WARN: '\x1b[33m',    // Yellow
  INFO: '\x1b[36m',    // Cyan
  DEBUG: '\x1b[35m',   // Magenta
  TRACE: '\x1b[37m',   // White
  RESET: '\x1b[0m'     // Reset
};

class Logger {
  constructor(context = 'App', level = process.env.LOG_LEVEL || 'INFO') {
    this.context = context;
    this.level = level;
    this.levels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
  }

  /**
   * Format log message with timestamp and context
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const color = Colors[level] || '';
    const reset = Colors.RESET;
    
    let output = `${color}[${timestamp}] [${level}] [${this.context}] ${message}${reset}`;
    
    if (data && Object.keys(data).length > 0) {
      output += `\n  Data: ${JSON.stringify(data, null, 2)}`;
    }
    
    return output;
  }

  /**
   * Check if log level should be printed
   */
  shouldLog(level) {
    const currentLevelIndex = this.levels.indexOf(this.level);
    const messageLevelIndex = this.levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Log error message
   */
  error(message, data = null) {
    if (this.shouldLog('ERROR')) {
      console.error(this.formatMessage('ERROR', message, data));
    }
  }

  /**
   * Log warning message
   */
  warn(message, data = null) {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  /**
   * Log info message
   */
  info(message, data = null) {
    if (this.shouldLog('INFO')) {
      console.log(this.formatMessage('INFO', message, data));
    }
  }

  /**
   * Log debug message
   */
  debug(message, data = null) {
    if (this.shouldLog('DEBUG')) {
      console.log(this.formatMessage('DEBUG', message, data));
    }
  }

  /**
   * Log trace message
   */
  trace(message, data = null) {
    if (this.shouldLog('TRACE')) {
      console.log(this.formatMessage('TRACE', message, data));
    }
  }

  /**
   * Log HTTP request
   */
  logRequest(req) {
    this.debug(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  }

  /**
   * Log HTTP response
   */
  logResponse(req, statusCode, responseTime) {
    this.debug(`Response: ${req.method} ${req.path} ${statusCode}`, {
      method: req.method,
      path: req.path,
      statusCode,
      responseTime: `${responseTime}ms`
    });
  }

  /**
   * Log database operation
   */
  logDatabase(operation, collection, data = null) {
    this.debug(`Database: ${operation} on ${collection}`, data);
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext) {
    const childLogger = new Logger(`${this.context}:${additionalContext}`, this.level);
    return childLogger;
  }
}

/**
 * Request logging middleware
 */
export const requestLoggerMiddleware = (logger) => {
  return (req, res, next) => {
    const startTime = Date.now();
    logger.logRequest(req);

    const originalSend = res.send;
    res.send = function(data) {
      const responseTime = Date.now() - startTime;
      logger.logResponse(req, res.statusCode, responseTime);
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Performance monitoring middleware
 */
export const performanceMonitorMiddleware = (logger) => {
  return (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const slow = duration > 1000; // 1 second threshold
      
      if (slow) {
        logger.warn(`Slow request detected: ${req.method} ${req.path}`, {
          duration: `${duration}ms`,
          statusCode: res.statusCode
        });
      }
    });

    next();
  };
};

/**
 * Global logger instance
 */
const logger = new Logger('World-Bank', process.env.LOG_LEVEL || 'INFO');

export default logger;
export { Logger, LogLevel };
