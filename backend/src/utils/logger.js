const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
require('dotenv').config();

/**
 * Enterprise-grade logging system
 * Implements structured logging with rotation and multiple transports
 */

// Custom log format for structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, userId, operation, ip, userAgent, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      service: service || 'biometric-attendance',
      userId,
      operation,
      ip,
      userAgent,
      message,
      ...meta
    });
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, service, operation, ...meta }) => {
    const serviceTag = service ? `[${service}]` : '';
    const operationTag = operation ? `{${operation}}` : '';
    return `${timestamp} ${level} ${serviceTag} ${operationTag} ${message} ${
      Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

// Create Winston logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'info'),
  format: customFormat,
  defaultMeta: {
    service: 'biometric-attendance-backend',
    version: process.env.APP_VERSION || '1.0.0'
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? customFormat : consoleFormat,
      silent: process.env.NODE_ENV === 'test'
    }),

    // Application logs with daily rotation
    new DailyRotateFile({
      filename: path.join(logsDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '100m',
      maxFiles: '30d',
      format: customFormat
    }),

    // Error logs with daily rotation
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '100m',
      maxFiles: '30d',
      format: customFormat
    }),

    // Security/audit logs with daily rotation
    new DailyRotateFile({
      filename: path.join(logsDir, 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxSize: '100m',
      maxFiles: '365d', // Keep audit logs for 1 year
      format: customFormat,
      // Only log security-related messages
      filter: (info) => {
        const securityOperations = [
          'BIOMETRIC_REGISTRATION',
          'BIOMETRIC_VERIFICATION',
          'USER_AUTHENTICATION',
          'TEMPLATE_ACCESS',
          'ADMIN_OPERATION',
          'SECURITY_VIOLATION',
          'ATTENDANCE_RECORD'
        ];
        return securityOperations.includes(info.operation) || info.level === 'error';
      }
    }),

    // Performance logs with daily rotation
    new DailyRotateFile({
      filename: path.join(logsDir, 'performance-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '50m',
      maxFiles: '14d',
      format: customFormat,
      // Only log performance-related messages
      filter: (info) => {
        return info.operation === 'PERFORMANCE_METRIC' ||
               info.operation === 'DATABASE_QUERY' ||
               info.operation === 'BIOMETRIC_PROCESSING';
      }
    })
  ],

  // Exception handling
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log')
    })
  ],

  // Rejection handling
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log')
    })
  ]
});

/**
 * Enhanced logging functions for specific operations
 */
const auditLogger = {
  /**
   * Log biometric operations
   */
  biometric: (operation, userId, details = {}) => {
    logger.info('Biometric operation', {
      operation,
      userId,
      ...details,
      category: 'BIOMETRIC'
    });
  },

  /**
   * Log security events
   */
  security: (event, userId, details = {}) => {
    logger.warn('Security event', {
      operation: event,
      userId,
      ...details,
      category: 'SECURITY'
    });
  },

  /**
   * Log authentication events
   */
  auth: (action, userId, success, details = {}) => {
    logger.info('Authentication event', {
      operation: 'USER_AUTHENTICATION',
      action,
      userId,
      success,
      ...details,
      category: 'AUTHENTICATION'
    });
  },

  /**
   * Log attendance events
   */
  attendance: (action, employeeId, details = {}) => {
    logger.info('Attendance operation', {
      operation: 'ATTENDANCE_RECORD',
      action,
      employeeId,
      ...details,
      category: 'ATTENDANCE'
    });
  },

  /**
   * Log performance metrics
   */
  performance: (operation, duration, details = {}) => {
    logger.info('Performance metric', {
      operation: 'PERFORMANCE_METRIC',
      action: operation,
      duration,
      ...details,
      category: 'PERFORMANCE'
    });
  }
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info('API Request', {
    operation: 'API_REQUEST',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info('API Response', {
      operation: 'API_RESPONSE',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id
    });
  });

  next();
};

/**
 * Error logging helper
 */
const logError = (error, operation = 'UNKNOWN', context = {}) => {
  logger.error('Application error', {
    operation,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    ...context
  });
};

/**
 * Development logger with color coding
 */
const devLogger = {
  info: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\x1b[36mℹ  INFO\x1b[0m ${message}`, meta);
    }
    logger.info(message, meta);
  },

  success: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\x1b[32m✅ SUCCESS\x1b[0m ${message}`, meta);
    }
    logger.info(message, meta);
  },

  warn: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\x1b[33m⚠  WARN\x1b[0m ${message}`, meta);
    }
    logger.warn(message, meta);
  },

  error: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\x1b[31m❌ ERROR\x1b[0m ${message}`, meta);
    }
    logger.error(message, meta);
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\x1b[35m🐛 DEBUG\x1b[0m ${message}`, meta);
    }
    logger.debug(message, meta);
  }
};

module.exports = {
  logger,
  auditLogger,
  requestLogger,
  logError,
  devLogger
};