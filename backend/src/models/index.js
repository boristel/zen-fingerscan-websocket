const { sequelize } = require('../config/database');
const Employee = require('./Employee');
const BiometricTemplate = require('./BiometricTemplate');
const AttendanceRecord = require('./AttendanceRecord');

/**
 * Model associations
 * Defines relationships between database models
 */

// Employee has many biometric templates
Employee.hasMany(BiometricTemplate, {
  foreignKey: 'employeeId',
  sourceKey: 'employeeId',
  as: 'biometricTemplates',
  onDelete: 'CASCADE',
  hooks: {
    afterCreate: async (employee) => {
      // Update biometric enrollment status
      const templateCount = await BiometricTemplate.count({
        where: {
          employeeId: employee.employeeId,
          status: 'ACTIVE',
          deletedAt: null
        }
      });

      if (templateCount > 0) {
        await employee.update({
          biometricEnrolled: true,
          biometricCount: templateCount,
          lastBiometricUpdate: new Date()
        });
      }
    },

    afterDestroy: async (employee) => {
      // Soft delete associated templates
      await BiometricTemplate.destroy({
        where: {
          employeeId: employee.employeeId
        },
        force: false
      });
    }
  }
});

BiometricTemplate.belongsTo(Employee, {
  foreignKey: 'employeeId',
  targetKey: 'employeeId',
  as: 'employee'
});

// Employee has many attendance records
Employee.hasMany(AttendanceRecord, {
  foreignKey: 'employeeId',
  sourceKey: 'employeeId',
  as: 'attendanceRecords',
  onDelete: 'CASCADE'
});

AttendanceRecord.belongsTo(Employee, {
  foreignKey: 'employeeId',
  targetKey: 'employeeId',
  as: 'employee'
});

/**
 * Database synchronization and initialization
 */
const initializeModels = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync models (create tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('🔄 Database models synchronized (development mode)');
    } else {
      await sequelize.sync();
      console.log('🔄 Database models synchronized');
    }

    return {
      Employee,
      BiometricTemplate,
      AttendanceRecord,
      sequelize
    };
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    throw error;
  }
};

/**
 * Model exports and utilities
 */
module.exports = {
  Employee,
  BiometricTemplate,
  AttendanceRecord,
  sequelize,
  initializeModels
};