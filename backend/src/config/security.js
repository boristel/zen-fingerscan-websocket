require('dotenv').config();

/**
 * Enterprise security configuration
 * Implements industry best practices for biometric systems
 */
const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    algorithm: 'HS256'
  },

  // Biometric Security
  biometric: {
    // Template encryption settings
    encryption: {
      algorithm: 'AES-256-GCM',
      keyLength: 32,
      ivLength: 16,
      tagLength: 16
    },

    // Verification thresholds
    verification: {
      minSimilarity: 80,    // Minimum similarity percentage for verification
      maxAttempts: 3,       // Maximum failed attempts before lockout
      lockoutDuration: 300   // Lockout duration in seconds (5 minutes)
    },

    // Template security
    template: {
      // Salt for template hashing
      saltRounds: 12,

      // Template storage security
      storageEncryption: true,

      // Template transmission security
      transmissionEncryption: true
    }
  },

  // API Rate Limiting
  rateLimiting: {
    // General API limits
    windowMs: 15 * 60 * 1000,    // 15 minutes
    max: 100,                    // 100 requests per window

    // Sensitive endpoints (biometric operations)
    biometric: {
      windowMs: 15 * 60 * 1000,  // 15 minutes
      max: 20,                   // 20 biometric requests per window
      skipSuccessfulRequests: false
    },

    // Authentication endpoints
    auth: {
      windowMs: 15 * 60 * 1000,  // 15 minutes
      max: 10,                   // 10 auth attempts per window
      skipSuccessfulRequests: false
    }
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:8080', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
  },

  // File Upload Security
  upload: {
    // Fingerprint image upload limits
    maxSize: 10 * 1024 * 1024,   // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],

    // Template data upload limits
    maxTemplateSize: 1024 * 1024, // 1MB for template data
    allowedTemplateTypes: ['application/octet-stream', 'text/plain']
  },

  // Audit Logging
  audit: {
    level: 'info',
    logToFile: true,
    logToDatabase: true,
    retentionDays: 365,  // Keep audit logs for 1 year

    // Sensitive operations to always audit
    sensitiveOperations: [
      'BIOMETRIC_REGISTRATION',
      'BIOMETRIC_VERIFICATION',
      'TEMPLATE_DELETION',
      'USER_AUTHENTICATION',
      'ATTENDANCE_RECORD',
      'ADMIN_ACCESS'
    ]
  },

  // Security Headers
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"]
      }
    },

    crossOriginEmbedderPolicy: { policy: "require-corp" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameOptions: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
  },

  // Session Security
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    }
  },

  // Password Security
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    saltRounds: 12
  },

  // Environment-specific settings
  development: {
    encryptionKey: process.env.ENCRYPTION_KEY_DEV || 'dev-key-32-chars-long-please-change',
    logLevel: 'debug'
  },

  production: {
    encryptionKey: process.env.ENCRYPTION_KEY_PROD,
    logLevel: 'warn'
  },

  // Get encryption key based on environment
  getEncryptionKey: () => {
    const key = process.env[`ENCRYPTION_KEY_${process.env.NODE_ENV?.toUpperCase() || 'DEVELOPMENT'}`];
    if (!key || key.length < 32) {
      throw new Error('Encryption key must be at least 32 characters long');
    }
    return key;
  }
};

module.exports = securityConfig;