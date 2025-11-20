const jwt = require('jsonwebtoken');
const { Employee } = require('../models');
const { auditLogger } = require('../utils/logger');
const securityConfig = require('../config/security');

/**
 * JWT Authentication Middleware
 * Implements secure token-based authentication with audit logging
 */

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    employeeId: user.employeeId,
    employeeCode: user.employeeCode,
    role: user.role || 'EMPLOYEE',
    permissions: user.permissions || []
  };

  return jwt.sign(payload, securityConfig.jwt.secret, {
    expiresIn: securityConfig.jwt.expiresIn,
    algorithm: securityConfig.jwt.algorithm,
    issuer: process.env.APP_NAME || 'Biometric Attendance System',
    audience: 'biometric-attendance-users'
  });
};

/**
 * Verify JWT token and return decoded payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, securityConfig.jwt.secret, {
      algorithms: [securityConfig.jwt.algorithm],
      issuer: process.env.APP_NAME || 'Biometric Attendance System',
      audience: 'biometric-attendance-users'
    });
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Extract token from request headers
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
};

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      auditLogger.security('AUTH_TOKEN_MISSING', null, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });

      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
        error: 'MISSING_TOKEN'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await Employee.findOne({
      where: {
        id: decoded.id,
        employeeId: decoded.employeeId,
        status: 'ACTIVE',
        deletedAt: null
      }
    });

    if (!user) {
      auditLogger.security('AUTH_USER_NOT_FOUND', decoded.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });

      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        error: 'USER_NOT_FOUND'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      auditLogger.security('AUTH_ACCOUNT_LOCKED', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        lockedUntil: user.lockedUntil,
        url: req.originalUrl,
        method: req.method
      });

      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked',
        error: 'ACCOUNT_LOCKED',
        lockedUntil: user.lockedUntil
      });
    }

    // Attach user and token to request
    req.user = {
      id: user.id,
      employeeId: user.employeeId,
      employeeCode: user.employeeCode,
      fullName: user.getDisplayName(),
      role: decoded.role,
      permissions: decoded.permissions,
      departmentId: user.departmentId,
      outletId: user.outletId
    };

    req.token = token;

    // Log successful authentication
    auditLogger.auth('TOKEN_VERIFIED', user.id, true, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method
    });

    next();
  } catch (error) {
    auditLogger.security('AUTH_TOKEN_INVALID', null, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      error: error.message,
      url: req.originalUrl,
      method: req.method
    });

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token',
      error: 'INVALID_TOKEN'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = verifyToken(token);
      const user = await Employee.findOne({
        where: {
          id: decoded.id,
          employeeId: decoded.employeeId,
          status: 'ACTIVE',
          deletedAt: null
        }
      });

      if (user && !user.isLocked()) {
        req.user = {
          id: user.id,
          employeeId: user.employeeId,
          employeeCode: user.employeeCode,
          fullName: user.getDisplayName(),
          role: decoded.role,
          permissions: decoded.permissions,
          departmentId: user.departmentId,
          outletId: user.outletId
        };
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail the request on auth errors
    next();
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role or permission
 */
const authorize = (requiredRoles = [], requiredPermissions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }

    // Check roles
    const hasRole = requiredRoles.length === 0 || requiredRoles.includes(req.user.role);

    // Check permissions
    const hasPermission = requiredPermissions.length === 0 ||
      requiredPermissions.every(permission => req.user.permissions.includes(permission));

    if (!hasRole || !hasPermission) {
      auditLogger.security('AUTHORIZATION_DENIED', req.user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requiredRoles,
        requiredPermissions,
        userRole: req.user.role,
        userPermissions: req.user.permissions,
        url: req.originalUrl,
        method: req.method
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS',
        required: {
          roles: requiredRoles,
          permissions: requiredPermissions
        },
        current: {
          role: req.user.role,
          permissions: req.user.permissions
        }
      });
    }

    // Log successful authorization
    auditLogger.security('AUTHORIZATION_GRANTED', req.user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requiredRoles,
      requiredPermissions,
      url: req.originalUrl,
      method: req.method
    });

    next();
  };
};

/**
 * Biometric operation authorization
 * Special authorization for biometric operations
 */
const authorizeBiometric = (action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for biometric operations',
        error: 'NOT_AUTHENTICATED'
      });
    }

    // Users can only manage their own biometric data (unless admin)
    if (req.user.role !== 'ADMIN' && req.user.role !== 'HR') {
      const targetEmployeeId = req.params.employeeId || req.params.id || req.body.employeeId;

      if (targetEmployeeId && targetEmployeeId !== req.user.employeeId) {
        auditLogger.security('BIOMETRIC_UNAUTHORIZED_ACCESS', req.user.id, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          action,
          targetEmployeeId,
          url: req.originalUrl,
          method: req.method
        });

        return res.status(403).json({
          success: false,
          message: 'You can only manage your own biometric data',
          error: 'BIOMETRIC_UNAUTHORIZED'
        });
      }
    }

    // Log biometric operation authorization
    auditLogger.security('BIOMETRIC_AUTHORIZED', req.user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      action,
      targetEmployeeId: req.params.employeeId || req.params.id || req.body.employeeId,
      url: req.originalUrl,
      method: req.method
    });

    next();
  };
};

/**
 * Self-authorization middleware
 * Ensures users can only access their own data
 */
const authorizeSelf = (targetField = 'employeeId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }

    // Admins can access any data
    if (req.user.role === 'ADMIN' || req.user.role === 'HR') {
      return next();
    }

    // Extract target employee ID from various sources
    const targetEmployeeId = req.params[targetField] ||
                            req.params.id ||
                            req.query[targetField] ||
                            req.body[targetField];

    if (targetEmployeeId && targetEmployeeId !== req.user.employeeId) {
      auditLogger.security('SELF_AUTHORIZATION_DENIED', req.user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        targetEmployeeId,
        userEmployeeId: req.user.employeeId,
        url: req.originalUrl,
        method: req.method
      });

      return res.status(403).json({
        success: false,
        message: 'You can only access your own data',
        error: 'SELF_ACCESS_DENIED'
      });
    }

    next();
  };
};

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  authenticate,
  optionalAuth,
  authorize,
  authorizeBiometric,
  authorizeSelf
};