const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * AttendanceRecord model - Enterprise-grade attendance tracking
 * Implements comprehensive attendance recording with biometric verification
 */
const AttendanceRecord = sequelize.define('AttendanceRecord', {
  // Primary identifier
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },

  // Employee identification
  employeeId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'karyawanid',
    validate: {
      notEmpty: true,
      len: [1, 50]
    },
    comment: 'Employee identifier'
  },

  employeeCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'kodekaryawan',
    validate: {
      notEmpty: true,
      len: [1, 50]
    },
    comment: 'Employee code'
  },

  employeeName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'namakaryawan',
    validate: {
      notEmpty: true,
      len: [1, 255]
    },
    comment: 'Employee full name'
  },

  // Attendance type and timing
  attendanceType: {
    type: DataTypes.ENUM('CHECK_IN', 'CHECK_OUT', 'BREAK_IN', 'BREAK_OUT', 'OVERTIME_IN', 'OVERTIME_OUT'),
    allowNull: false,
    field: 'attendance_type',
    comment: 'Type of attendance record'
  },

  recordTimestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'record_timestamp',
    comment: 'Actual timestamp when attendance was recorded'
  },

  scheduledTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'scheduled_time',
    comment: 'Expected time for this attendance type'
  },

  // Biometric verification
  biometricVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'biometric_verified',
    comment: 'Whether attendance was verified using biometrics'
  },

  verificationMethod: {
    type: DataTypes.ENUM('FINGERPRINT', 'FACE', 'IRIS', 'VOICE', 'PASSWORD', 'MANUAL', 'CARD'),
    allowNull: true,
    field: 'verification_method',
    comment: 'Method used for identity verification'
  },

  verificationSimilarity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'verification_similarity',
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Biometric verification similarity score (0-100%)'
  },

  verificationTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'verification_time',
    validate: {
      min: 0
    },
    comment: 'Time taken for verification in milliseconds'
  },

  // Finger identification for biometric verification
  fingerIndexMatched: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'fingerindex_matched',
    validate: {
      min: 0,
      max: 9
    },
    comment: 'Finger index that matched during verification'
  },

  fingerNameMatched: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'finger_name_matched',
    comment: 'Human-readable finger name that matched'
  },

  // Device and location information
  deviceId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'device_id',
    validate: {
      len: [0, 100]
    },
    comment: 'Biometric device identifier'
  },

  deviceName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'device_name',
    validate: {
      len: [0, 100]
    },
    comment: 'Human-readable device name'
  },

  locationId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'location_id',
    comment: 'Location identifier where attendance was recorded'
  },

  locationName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'location_name',
    validate: {
      len: [0, 100]
    },
    comment: 'Human-readable location name'
  },

  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'department_id',
    comment: 'Department identifier'
  },

  departmentName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'department_name',
    validate: {
      len: [0, 100]
    },
    comment: 'Department name'
  },

  outletId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'outlet_id',
    comment: 'Outlet/branch identifier'
  },

  outletName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'outlet_name',
    validate: {
      len: [0, 100]
    },
    comment: 'Outlet/branch name'
  },

  // Shift information
  shiftId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'shift_id',
    comment: 'Shift identifier'
  },

  shiftName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'shift_name',
    validate: {
      len: [0, 100]
    },
    comment: 'Shift name'
  },

  shiftStartTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'shift_start_time',
    comment: 'Shift start time'
  },

  shiftEndTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'shift_end_time',
    comment: 'Shift end time'
  },

  // Status and processing
  status: {
    type: DataTypes.ENUM('PENDING', 'PROCESSED', 'APPROVED', 'REJECTED', 'MANUAL_REVIEW'),
    allowNull: false,
    defaultValue: 'PROCESSED',
    field: 'status',
    comment: 'Current status of attendance record'
  },

  isLate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_late',
    comment: 'Whether employee was late for this attendance type'
  },

  lateMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'late_minutes',
    validate: {
      min: 0
    },
    comment: 'Number of minutes employee was late'
  },

  isEarly: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_early',
    comment: 'Whether employee was early for this attendance type'
  },

  earlyMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'early_minutes',
    validate: {
      min: 0
    },
    comment: 'Number of minutes employee was early'
  },

  // Processing information
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'processed_at',
    comment: 'Timestamp when record was processed'
  },

  processedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'processed_by',
    comment: 'User ID who processed this record'
  },

  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'approved_at',
    comment: 'Timestamp when record was approved'
  },

  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'approved_by',
    comment: 'User ID who approved this record'
  },

  // GPS and geolocation
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    field: 'latitude',
    validate: {
      min: -90,
      max: 90
    },
    comment: 'GPS latitude where attendance was recorded'
  },

  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    field: 'longitude',
    validate: {
      min: -180,
      max: 180
    },
    comment: 'GPS longitude where attendance was recorded'
  },

  gpsAccuracy: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    field: 'gps_accuracy',
    validate: {
      min: 0
    },
    comment: 'GPS accuracy in meters'
  },

  // Network and device information
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address',
    validate: {
      isIP: true
    },
    comment: 'IP address of the device'
  },

  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent',
    comment: 'User agent string of the client'
  },

  sessionId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'session_id',
    validate: {
      len: [0, 100]
    },
    comment: 'Session identifier for the attendance record'
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

  // Additional notes and metadata
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes about the attendance record'
  },

  verificationNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'verification_notes',
    comment: 'Notes about biometric verification process'
  },

  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional attendance metadata as JSON'
  },

  // Exception handling
  hasException: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'has_exception',
    comment: 'Whether this record has an exception'
  },

  exceptionType: {
    type: DataTypes.ENUM('FORGOT_CHECK_IN', 'FORGOT_CHECK_OUT', 'DEVICE_FAILURE', 'BIOMETRIC_FAILURE', 'SYSTEM_ERROR', 'MANUAL_OVERRIDE'),
    allowNull: true,
    field: 'exception_type',
    comment: 'Type of exception if any'
  },

  exceptionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'exception_reason',
    comment: 'Detailed reason for exception'
  },

  exceptionResolvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'exception_resolved_by',
    comment: 'User ID who resolved the exception'
  },

  exceptionResolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'exception_resolved_at',
    comment: 'Timestamp when exception was resolved'
  }
}, {
  tableName: 'attendance_records',
  timestamps: true,
  indexes: [
    // Performance indexes
    {
      fields: ['employeeId']
    },
    {
      fields: ['employeeCode']
    },
    {
      fields: ['recordTimestamp']
    },
    {
      fields: ['attendanceType']
    },
    {
      fields: ['status']
    },
    {
      fields: ['biometricVerified']
    },
    {
      fields: ['deviceId']
    },
    {
      fields: ['locationId']
    },
    {
      fields: ['departmentId']
    },
    {
      fields: ['outletId']
    },
    {
      fields: ['shiftId']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['processedAt']
    },
    // Composite indexes for common queries
    {
      fields: ['employeeId', 'recordTimestamp']
    },
    {
      fields: ['employeeId', 'attendanceType', 'recordTimestamp']
    },
    {
      fields: ['biometricVerified', 'recordTimestamp']
    },
    {
      fields: ['status', 'processedAt']
    }
  ],
  comment: 'Comprehensive attendance records with biometric verification tracking'
});

/**
 * Instance methods
 */

// Get finger name from index
AttendanceRecord.prototype.getFingerName = function() {
  if (this.fingerNameMatched) {
    return this.fingerNameMatched;
  }

  if (this.fingerIndexMatched === null || this.fingerIndexMatched === undefined) {
    return null;
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

  return fingerNames[this.fingerIndexMatched] || 'Unknown Finger';
};

// Check if record needs manual review
AttendanceRecord.prototype.needsManualReview = function() {
  return !this.biometricVerified ||
         this.status === 'MANUAL_REVIEW' ||
         this.hasException ||
         (this.verificationSimilarity && this.verificationSimilarity < 75);
};

// Calculate time difference from scheduled time
AttendanceRecord.prototype.calculateTimeDifference = function() {
  if (!this.scheduledTime) {
    return null;
  }

  const diffMs = this.recordTimestamp - this.scheduledTime;
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  return {
    minutes: diffMinutes,
    isLate: diffMinutes > 0,
    isEarly: diffMinutes < 0,
    absoluteMinutes: Math.abs(diffMinutes)
  };
};

/**
 * Class methods
 */

// Find attendance records for employee in date range
AttendanceRecord.findByEmployeeAndDateRange = function(employeeId, startDate, endDate, options = {}) {
  return this.findAll({
    where: {
      employeeId,
      recordTimestamp: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      },
      ...options.where
    },
    order: [['recordTimestamp', 'ASC']],
    ...options
  });
};

// Find today's attendance for employee
AttendanceRecord.findTodayForEmployee = function(employeeId) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  return this.findAll({
    where: {
      employeeId,
      recordTimestamp: {
        [sequelize.Sequelize.Op.between]: [startOfDay, endOfDay]
      }
    },
    order: [['recordTimestamp', 'ASC']]
  });
};

// Find records pending approval
AttendanceRecord.findPendingApproval = function(options = {}) {
  return this.findAll({
    where: {
      status: 'MANUAL_REVIEW',
      ...options.where
    },
    order: [['createdAt', 'ASC']],
    ...options
  });
};

// Get attendance statistics for date range
AttendanceRecord.getStatistics = function(startDate, endDate, options = {}) {
  return this.findAll({
    where: {
      recordTimestamp: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      },
      ...options.where
    },
    attributes: [
      'attendanceType',
      [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN biometricVerified = true THEN 1 END')), 'biometricVerified'],
      [sequelize.fn('AVG', sequelize.col('verificationSimilarity')), 'avgSimilarity'],
      [sequelize.fn('AVG', sequelize.col('verificationTime')), 'avgVerificationTime']
    ],
    group: ['attendanceType'],
    ...options
  });
};

// Find duplicate records (same employee, same type, within 5 minutes)
AttendanceRecord.findDuplicates = function(employeeId, attendanceType, timestamp, windowMinutes = 5) {
  const windowStart = new Date(timestamp.getTime() - windowMinutes * 60 * 1000);
  const windowEnd = new Date(timestamp.getTime() + windowMinutes * 60 * 1000);

  return this.findAll({
    where: {
      employeeId,
      attendanceType,
      recordTimestamp: {
        [sequelize.Sequelize.Op.between]: [windowStart, windowEnd]
      }
    },
    order: [['recordTimestamp', 'DESC']]
  });
};

/**
 * Hooks
 */

// Before create: set calculated fields
AttendanceRecord.beforeCreate(async (record) => {
  // Set finger name if finger index is provided
  if (record.fingerIndexMatched !== null && record.fingerIndexMatched !== undefined && !record.fingerNameMatched) {
    record.fingerNameMatched = record.getFingerName();
  }

  // Calculate time differences if scheduled time is provided
  if (record.scheduledTime) {
    const timeDiff = record.calculateTimeDifference();
    if (timeDiff) {
      record.isLate = timeDiff.isLate;
      record.isEarly = timeDiff.isEarly;
      record.lateMinutes = timeDiff.isLate ? timeDiff.absoluteMinutes : null;
      record.earlyMinutes = timeDiff.isEarly ? timeDiff.absoluteMinutes : null;
    }
  }

  // Set processed timestamp if status is PROCESSED
  if (record.status === 'PROCESSED' && !record.processedAt) {
    record.processedAt = new Date();
  }
});

// Before update: track changes
AttendanceRecord.beforeUpdate(async (record) => {
  // Update processed timestamp when status changes to PROCESSED
  if (record.changed('status') && record.status === 'PROCESSED' && !record.processedAt) {
    record.processedAt = new Date();
  }

  // Update approved timestamp when status changes to APPROVED
  if (record.changed('status') && record.status === 'APPROVED' && !record.approvedAt) {
    record.approvedAt = new Date();
  }
});

module.exports = AttendanceRecord;