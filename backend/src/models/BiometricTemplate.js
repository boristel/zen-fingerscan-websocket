const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

/**
 * BiometricTemplate model - Enterprise-grade biometric template management
 * Implements secure storage and management of fingerprint templates
 */
const BiometricTemplate = sequelize.define('BiometricTemplate', {
  // Primary identifier
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'autonum'
  },

  // Employee relationship
  employeeId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'karyawanid',
    validate: {
      notEmpty: true,
      len: [1, 50]
    },
    comment: 'Employee identifier who owns this biometric template'
  },

  employeeCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'kodekaryawan',
    validate: {
      notEmpty: true,
      len: [1, 50]
    },
    comment: 'Employee code for biometric template'
  },

  employeeName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'namakaryawan',
    validate: {
      notEmpty: true,
      len: [1, 255]
    },
    comment: 'Employee full name for audit trail'
  },

  // Finger identification
  fingerIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'fingerindex',
    validate: {
      min: 0,
      max: 9
    },
    comment: 'Finger position (0=Right Thumb, 1=Right Index, ..., 9=Left Little)'
  },

  fingerName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    },
    comment: 'Human-readable finger name'
  },

  // Template data (encrypted)
  templateData: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    field: 'fingerimage',
    comment: 'Encrypted biometric template data'
  },

  // Template metadata
  templateFormat: {
    type: DataTypes.ENUM('ISO_IEC_19794_2', 'ANSI_378_2004', 'CUSTOM', 'INTERMEDIATE'),
    allowNull: false,
    defaultValue: 'INTERMEDIATE',
    field: 'template_format',
    comment: 'Biometric template format standard'
  },

  templateQuality: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'template_quality',
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Quality score of the captured template (0-100)'
  },

  templateSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'template_size',
    validate: {
      min: 0
    },
    comment: 'Size of template data in bytes'
  },

  // Device and capture information
  deviceId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'device_id',
    validate: {
      len: [0, 100]
    },
    comment: 'Fingerprint scanner device identifier'
  },

  deviceModel: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'device_model',
    validate: {
      len: [0, 100]
    },
    comment: 'Fingerprint scanner model'
  },

  captureSoftware: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'capture_software',
    validate: {
      len: [0, 100]
    },
    comment: 'Software version used for template capture'
  },

  // Security and encryption metadata
  encryptionAlgorithm: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'AES-256-GCM',
    field: 'encryption_algorithm',
    comment: 'Encryption algorithm used for template data'
  },

  encryptionKeyId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'encryption_key_id',
    comment: 'Identifier of encryption key version used'
  },

  checksum: {
    type: DataTypes.STRING(128),
    allowNull: true,
    field: 'template_checksum',
    validate: {
      len: [0, 128]
    },
    comment: 'SHA-256 checksum for template integrity verification'
  },

  // Registration process information
  registrationAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'registration_attempts',
    validate: {
      min: 1,
      max: 10
    },
    comment: 'Number of attempts made during registration'
  },

  averageQuality: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'average_quality',
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Average quality score across all registration attempts'
  },

  registrationDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'registration_duration',
    comment: 'Time taken for registration in milliseconds'
  },

  // Status and lifecycle
  status: {
    type: DataTypes.ENUM('ACTIVE', 'DISABLED', 'REVOKED', 'EXPIRED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
    field: 'status',
    comment: 'Current status of biometric template'
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
    comment: 'Whether template is currently active for verification'
  },

  validFrom: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'valid_from',
    comment: 'Template validity start date'
  },

  validUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'valid_until',
    comment: 'Template expiry date'
  },

  // Verification statistics
  verificationCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'verification_count',
    comment: 'Total number of verification attempts'
  },

  successfulVerifications: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'successful_verifications',
    comment: 'Number of successful verifications'
  },

  lastVerificationAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_verification_at',
    comment: 'Last successful verification timestamp'
  },

  averageVerificationTime: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    field: 'avg_verification_time',
    comment: 'Average verification time in milliseconds'
  },

  // Audit and compliance
  purposeOfUse: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'ATTENDANCE',
    field: 'purpose_of_use',
    validate: {
      isIn: [['ATTENDANCE', 'ACCESS_CONTROL', 'IDENTITY_VERIFICATION', 'TIME_TRACKING']]
    },
    comment: 'Intended purpose of biometric data usage'
  },

  consentObtained: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'consent_obtained',
    comment: 'Whether user consent was obtained for biometric data'
  },

  consentDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'consent_date',
    comment: 'Date when consent was obtained'
  },

  dataRetentionPeriod: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'data_retention_period',
    comment: 'Data retention period in days'
  },

  // System timestamps
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },

  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  },

  lastedit: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Last edit timestamp (legacy field compatibility)'
  },

  // Operation tracking
  registeredBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'registered_by',
    comment: 'User ID who registered this template'
  },

  lastUpdatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'last_updated_by',
    comment: 'User ID who last updated this template'
  },

  // Soft delete support
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at'
  },

  // Additional notes and metadata
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes about the biometric template'
  },

  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional template metadata as JSON'
  }
}, {
  tableName: 'biometric_templates',
  timestamps: true,
  paranoid: true, // Enable soft deletes
  indexes: [
    // Performance indexes
    {
      unique: true,
      fields: ['employeeId', 'fingerIndex'],
      where: {
        deletedAt: null
      }
    },
    {
      fields: ['employeeId']
    },
    {
      fields: ['fingerIndex']
    },
    {
      fields: ['status']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['deviceId']
    },
    {
      fields: ['purposeOfUse']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['lastVerificationAt']
    }
  ],
  comment: 'Secure biometric template storage with encryption and audit trail'
});

/**
 * Instance methods
 */

// Encrypt template data before storage
BiometricTemplate.prototype.encryptTemplateData = function(plainData) {
  const algorithm = 'aes-256-gcm';
  const key = process.env.ENCRYPTION_KEY; // Should be from secure key management
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from('biometric-template'));

  let encrypted = cipher.update(plainData, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  this.templateData = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
  this.encryptionAlgorithm = algorithm;
  this.encryptionKeyId = 'v1'; // Version of encryption key

  // Generate checksum for integrity verification
  this.checksum = crypto.createHash('sha256').update(plainData).digest('hex');
  this.templateSize = Buffer.byteLength(plainData, 'utf8');
};

// Decrypt template data for verification
BiometricTemplate.prototype.decryptTemplateData = function() {
  if (!this.templateData) {
    throw new Error('No template data to decrypt');
  }

  const algorithm = this.encryptionAlgorithm || 'aes-256-gcm';
  const key = process.env.ENCRYPTION_KEY;

  const parts = this.templateData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted template format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipher(algorithm, key);
  decipher.setAAD(Buffer.from('biometric-template'));
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  // Verify integrity
  const calculatedChecksum = crypto.createHash('sha256').update(decrypted).digest('hex');
  if (calculatedChecksum !== this.checksum) {
    throw new Error('Template data integrity check failed');
  }

  return decrypted;
};

// Verify template integrity
BiometricTemplate.prototype.verifyIntegrity = function() {
  try {
    this.decryptTemplateData();
    return true;
  } catch (error) {
    return false;
  }
};

// Update verification statistics
BiometricTemplate.prototype.recordVerification = function(successful, duration) {
  this.verificationCount += 1;

  if (successful) {
    this.successfulVerifications += 1;
    this.lastVerificationAt = new Date();
  }

  // Update average verification time
  if (duration) {
    const totalTime = (this.averageVerificationTime || 0) * (this.verificationCount - 1) + duration;
    this.averageVerificationTime = totalTime / this.verificationCount;
  }

  this.save();
};

// Check if template is valid for verification
BiometricTemplate.prototype.isValidForVerification = function() {
  const now = new Date();

  return this.isActive &&
         this.status === 'ACTIVE' &&
         (!this.validFrom || this.validFrom <= now) &&
         (!this.validUntil || this.validUntil >= now) &&
         this.verifyIntegrity();
};

// Get finger name from index
BiometricTemplate.prototype.getFingerName = function() {
  if (this.fingerName) {
    return this.fingerName;
  }

  const fingerNames = [
    'Right Thumb',      // 0
    'Right Index',      // 1
    'Right Middle',     // 2
    'Right Ring',       // 3
    'Right Little',     // 4
    'Left Thumb',       // 5
    'Left Index',       // 6
    'Left Middle',      // 7
    'Left Ring',        // 8
    'Left Little'       // 9
  ];

  return fingerNames[this.fingerIndex] || 'Unknown Finger';
};

/**
 * Class methods
 */

// Find active templates for employee
BiometricTemplate.findActiveByEmployee = function(employeeId) {
  return this.findAll({
    where: {
      employeeId,
      status: 'ACTIVE',
      isActive: true,
      deletedAt: null
    },
    order: [['fingerIndex', 'ASC']]
  });
};

// Find template by employee and finger
BiometricTemplate.findByEmployeeAndFinger = function(employeeId, fingerIndex) {
  return this.findOne({
    where: {
      employeeId,
      fingerIndex,
      status: 'ACTIVE',
      isActive: true,
      deletedAt: null
    }
  });
};

// Get verification statistics for employee
BiometricTemplate.getEmployeeStats = function(employeeId) {
  return this.findAll({
    where: {
      employeeId,
      deletedAt: null
    },
    attributes: [
      'employeeId',
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalTemplates'],
      [sequelize.fn('SUM', sequelize.col('verificationCount')), 'totalVerifications'],
      [sequelize.fn('SUM', sequelize.col('successfulVerifications')), 'successfulVerifications'],
      [sequelize.fn('AVG', sequelize.col('averageVerificationTime')), 'avgVerificationTime']
    ],
    group: ['employeeId']
  });
};

// Clean up expired templates
BiometricTemplate.cleanupExpired = function() {
  const now = new Date();
  return this.update(
    {
      status: 'EXPIRED',
      isActive: false,
      updatedAt: now
    },
    {
      where: {
        status: 'ACTIVE',
        validUntil: {
          [sequelize.Sequelize.Op.lt]: now
        }
      }
    }
  );
};

/**
 * Hooks
 */

// Before create: encrypt template data and set defaults
BiometricTemplate.beforeCreate(async (template) => {
  // Set finger name if not provided
  if (!template.fingerName) {
    template.fingerName = template.getFingerName();
  }

  // Encrypt template data if provided as plain text
  if (template.templateData && !template.templateData.includes(':')) {
    template.encryptTemplateData(template.templateData);
  }

  // Set default validity period (2 years from creation)
  if (!template.validFrom) {
    template.validFrom = new Date();
  }
  if (!template.validUntil) {
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 2);
    template.validUntil = validUntil;
  }

  // Set consent date if consent obtained but no date
  if (template.consentObtained && !template.consentDate) {
    template.consentDate = new Date();
  }
});

// Before update: handle template data changes
BiometricTemplate.beforeUpdate(async (template) => {
  // Re-encrypt template data if it changed
  if (template.changed('templateData') && !template.templateData.includes(':')) {
    template.encryptTemplateData(template.templateData);
  }

  // Update lastedit field for legacy compatibility
  if (template.changed()) {
    template.lastedit = new Date();
  }
});

module.exports = BiometricTemplate;