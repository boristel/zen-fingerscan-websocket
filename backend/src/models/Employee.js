const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Employee model - Enterprise-grade employee management
 * Implements proper data validation and security measures
 */
const Employee = sequelize.define('Employee', {
  // Primary identifier
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Employee identification
  employeeId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'karyawanid',
    validate: {
      notEmpty: true,
      len: [1, 50]
    },
    comment: 'Employee unique identifier (karyawanid)'
  },

  employeeCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'kodekaryawan',
    validate: {
      notEmpty: true,
      len: [1, 50]
    },
    comment: 'Employee code for attendance system (kodekaryawan)'
  },

  // Personal information
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'nama_depan',
    validate: {
      notEmpty: true,
      len: [1, 100]
    },
    comment: 'First name of employee'
  },

  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'nama_belakang',
    validate: {
      len: [0, 100]
    },
    comment: 'Last name of employee (optional)'
  },

  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'namakaryawan',
    validate: {
      notEmpty: true,
      len: [1, 255]
    },
    comment: 'Full name of employee'
  },

  // Contact information
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
      len: [0, 255]
    },
    comment: 'Employee email address'
  },

  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^[+]?[\d\s-()]+$/,
      len: [0, 20]
    },
    comment: 'Phone number with international format support'
  },

  // Department and position
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'departemen_id',
    comment: 'Department identifier'
  },

  departmentName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'nama_departemen',
    validate: {
      len: [0, 100]
    },
    comment: 'Department name'
  },

  position: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'jabatan',
    validate: {
      len: [0, 100]
    },
    comment: 'Employee position or job title'
  },

  // Location information
  outletId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'outlet_id',
    comment: 'Outlet/branch identifier'
  },

  outletName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'nama_outlet',
    validate: {
      len: [0, 100]
    },
    comment: 'Outlet/branch name'
  },

  // Employment status
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
    field: 'status_karyawan',
    comment: 'Current employment status'
  },

  hireDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'tanggal_mulai',
    comment: 'Date when employee was hired'
  },

  terminationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'tanggal_selesai',
    comment: 'Date when employment ended'
  },

  // Biometric enrollment status
  biometricEnrolled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'biometric_enrolled',
    comment: 'Whether employee has enrolled biometric data'
  },

  biometricCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'biometric_count',
    comment: 'Number of biometric templates enrolled'
  },

  lastBiometricUpdate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_biometric_update',
    comment: 'Last biometric data update timestamp'
  },

  // Authentication and security
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    validate: {
      len: [3, 50],
      is: /^[a-zA-Z0-9_.-]+$/
    },
    comment: 'System username for login'
  },

  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'password_hash',
    comment: 'Hashed password for system access'
  },

  loginAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'login_attempts',
    comment: 'Number of failed login attempts'
  },

  lockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'locked_until',
    comment: 'Account locked until this timestamp'
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

  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at',
    comment: 'Last successful login timestamp'
  },

  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by',
    comment: 'User who created this employee record'
  },

  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'updated_by',
    comment: 'User who last updated this record'
  },

  // Soft delete support
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at'
  },

  // Additional metadata
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional employee metadata as JSON'
  }
}, {
  tableName: 'employees',
  timestamps: true,
  paranoid: true, // Enable soft deletes
  indexes: [
    // Performance indexes
    {
      unique: true,
      fields: ['employeeId']
    },
    {
      unique: true,
      fields: ['employeeCode']
    },
    {
      fields: ['departmentId']
    },
    {
      fields: ['outletId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['biometricEnrolled']
    },
    {
      fields: ['departmentId', 'status']
    },
    {
      fields: ['outletId', 'status']
    }
  ],
  comment: 'Employee master data with biometric enrollment tracking'
});

/**
 * Instance methods
 */

// Verify password for authentication
Employee.prototype.verifyPassword = async function(password) {
  if (!this.passwordHash) {
    return false;
  }
  return await bcrypt.compare(password, this.passwordHash);
};

// Set password with proper hashing
Employee.prototype.setPassword = async function(password) {
  const saltRounds = 12;
  this.passwordHash = await bcrypt.hash(password, saltRounds);
  this.loginAttempts = 0;
  this.lockedUntil = null;
};

// Check if account is locked
Employee.prototype.isLocked = function() {
  return this.lockedUntil && this.lockedUntil > new Date();
};

// Increment login attempts
Employee.prototype.incrementLoginAttempts = function() {
  this.loginAttempts += 1;

  // Lock account after 5 failed attempts for 30 minutes
  if (this.loginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
};

// Reset login attempts on successful login
Employee.prototype.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  this.lockedUntil = null;
  this.lastLoginAt = new Date();
};

// Get full display name
Employee.prototype.getDisplayName = function() {
  return this.fullName || `${this.firstName} ${this.lastName || ''}`.trim();
};

// Check if employee is active for attendance
Employee.prototype.canRecordAttendance = function() {
  return this.status === 'ACTIVE' && this.biometricEnrolled && !this.isLocked();
};

/**
 * Class methods
 */

// Find active employees only
Employee.findActive = function(options = {}) {
  return this.findAll({
    where: {
      status: 'ACTIVE',
      deletedAt: null
    },
    ...options
  });
};

// Find employees by department
Employee.findByDepartment = function(departmentId, options = {}) {
  return this.findAll({
    where: {
      departmentId,
      deletedAt: null
    },
    ...options
  });
};

// Find employees by outlet
Employee.findByOutlet = function(outletId, options = {}) {
  return this.findAll({
    where: {
      outletId,
      deletedAt: null
    },
    ...options
  });
};

// Search employees by name or ID
Employee.search = function(query, options = {}) {
  const searchCondition = {
    [sequelize.Sequelize.Op.or]: [
      {
        employeeId: {
          [sequelize.Sequelize.Op.like]: `%${query}%`
        }
      },
      {
        employeeCode: {
          [sequelize.Sequelize.Op.like]: `%${query}%`
        }
      },
      {
        fullName: {
          [sequelize.Sequelize.Op.like]: `%${query}%`
        }
      },
      {
        email: {
          [sequelize.Sequelize.Op.like]: `%${query}%`
        }
      }
    ],
    deletedAt: null
  };

  return this.findAll({
    where: searchCondition,
    ...options
  });
};

/**
 * Hooks
 */

// Before create: ensure data integrity
Employee.beforeCreate(async (employee) => {
  if (employee.fullName && !employee.firstName) {
    // Auto-split full name if first name is not provided
    const nameParts = employee.fullName.split(' ');
    employee.firstName = nameParts[0];
    employee.lastName = nameParts.slice(1).join(' ') || null;
  }

  if (!employee.fullName && employee.firstName) {
    // Auto-generate full name if not provided
    employee.fullName = employee.lastName
      ? `${employee.firstName} ${employee.lastName}`
      : employee.firstName;
  }
});

// Before update: track changes
Employee.beforeUpdate(async (employee) => {
  // Update biometric enrollment status based on associated templates
  // This will be implemented after associations are set up
});

module.exports = Employee;