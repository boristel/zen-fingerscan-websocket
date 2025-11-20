const { body, param, query, validationResult } = require('express-validator');
const { AttendanceRecord, Employee, BiometricTemplate } = require('../models');
const { auditLogger } = require('../utils/logger');
const biometricService = require('../services/biometricService');

/**
 * Attendance Controller - Enterprise-grade attendance tracking
 * Implements secure attendance recording with biometric verification
 */
class AttendanceController {
  /**
   * Record attendance (replaces insecure attendance from original server.js)
   */
  async storeAttendance(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        karyawanid,
        kodekaryawan,
        namakaryawan,
        attendanceType,
        fingerprintVerified,
        verificationSimilarity,
        verificationTime,
        fingerindexMatched,
        notes
      } = req.body;

      // Verify employee exists and is active
      const employee = await Employee.findOne({
        where: {
          [Employee.sequelize.Sequelize.Op.or]: [
            { employeeId: karyawanid },
            { id: karyawanid }
          ],
          status: 'ACTIVE',
          deletedAt: null
        }
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found or inactive',
          error: 'EMPLOYEE_NOT_FOUND'
        });
      }

      // Additional validation for attendance data
      if (employee.employeeCode !== kodekaryawan || employee.fullName !== namakaryawan) {
        auditLogger.security('ATTENDANCE_DATA_MISMATCH', req.user?.id, {
          submitted: { karyawanid, kodekaryawan, namakaryawan },
          actual: {
            employeeId: employee.employeeId,
            employeeCode: employee.employeeCode,
            fullName: employee.fullName
          },
          ip: req.ip
        });

        return res.status(400).json({
          success: false,
          message: 'Attendance data mismatch with employee records',
          error: 'DATA_MISMATCH'
        });
      }

      // Check for duplicate attendance within a short time window
      const existingRecord = await AttendanceRecord.findDuplicates(
        karyawanid,
        attendanceType,
        new Date(),
        5 // 5 minutes window
      );

      if (existingRecord.length > 0) {
        auditLogger.security('DUPLICATE_ATTENDANCE_ATTEMPT', req.user?.id, {
          employeeId: karyawanid,
          attendanceType,
          existingRecordId: existingRecord[0].id,
          ip: req.ip
        });

        return res.status(409).json({
          success: false,
          message: 'Duplicate attendance record detected',
          error: 'DUPLICATE_RECORD',
          existingRecord: existingRecord[0].toJSON()
        });
      }

      // Create attendance record
      const attendanceRecord = await AttendanceRecord.create({
        employeeId: karyawanid,
        employeeCode: kodekaryawan,
        employeeName: namakaryawan,
        attendanceType: attendanceType.toUpperCase(),
        recordTimestamp: new Date(),
        biometricVerified: fingerprintVerified || false,
        verificationMethod: fingerprintVerified ? 'FINGERPRINT' : 'MANUAL',
        verificationSimilarity: verificationSimilarity || 0,
        verificationTime: verificationTime || 0,
        fingerIndexMatched: fingerindexMatched,
        fingerNameMatched: fingerindexMatched !== null ? this.getFingerName(fingerindexMatched) : null,
        deviceId: req.get('X-Device-ID') || req.body.deviceId,
        locationName: req.body.locationName || 'Main Office',
        departmentId: employee.departmentId,
        departmentName: employee.departmentName,
        outletId: employee.outletId,
        outletName: employee.outletName,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        processedBy: req.user?.id,
        notes: notes,
        metadata: {
          source: req.get('X-Source') || 'WEB_APPLICATION',
          sessionId: req.sessionID || 'unknown'
        }
      });

      // If biometric verified, update template statistics
      if (fingerprintVerified && fingerindexMatched !== null) {
        const template = await BiometricTemplate.findByEmployeeAndFinger(karyawanid, fingerindexMatched);
        if (template) {
          await template.recordVerification(true, verificationTime);
        }
      }

      auditLogger.attendance('ATTENDANCE_RECORDED', karyawanid, {
        recordId: attendanceRecord.id,
        attendanceType: attendanceType.toUpperCase(),
        biometricVerified: fingerprintVerified,
        verificationSimilarity,
        processingTime: verificationTime,
        deviceId: req.get('X-Device-ID')
      });

      res.status(201).json({
        success: true,
        message: `${attendanceType.toUpperCase()} recorded successfully for ${namakaryawan}`,
        data: attendanceRecord.toJSON()
      });

    } catch (error) {
      console.error('❌ Store attendance error:', error);

      auditLogger.security('ATTENDANCE_STORE_ERROR', req.user?.id, {
        error: error.message,
        employeeId: req.body.karyawanid,
        attendanceType: req.body.attendanceType,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to store attendance record',
        error: 'STORE_ERROR'
      });
    }
  }

  /**
   * Get attendance records
   */
  async getAttendanceRecords(req, res) {
    try {
      const { employeeId, startDate, endDate, attendanceType, status, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      // Build where condition
      const whereCondition = { deletedAt: null };

      if (employeeId) {
        whereCondition.employeeId = employeeId;
      }

      if (attendanceType) {
        whereCondition.attendanceType = attendanceType.toUpperCase();
      }

      if (status) {
        whereCondition.status = status;
      }

      if (startDate && endDate) {
        whereCondition.recordTimestamp = {
          [AttendanceRecord.sequelize.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Get attendance records
      const result = await AttendanceRecord.findAndCountAll({
        where: whereCondition,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['recordTimestamp', 'DESC']],
        attributes: [
          'id', 'employeeId', 'employeeCode', 'employeeName', 'attendanceType',
          'recordTimestamp', 'biometricVerified', 'verificationMethod',
          'verificationSimilarity', 'verificationTime', 'fingerIndexMatched',
          'fingerNameMatched', 'deviceId', 'locationName', 'departmentName',
          'outletName', 'isLate', 'lateMinutes', 'status', 'notes', 'createdAt'
        ]
      });

      auditLogger.attendance('ATTENDANCE_RECORDS_RETRIEVED', req.user?.id, {
        query: { employeeId, startDate, endDate, attendanceType, status },
        resultsCount: result.rows.length,
        page
      });

      res.json({
        success: true,
        message: `Found ${result.rows.length} attendance records`,
        data: {
          records: result.rows.map(record => record.toJSON()),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: result.count,
            pages: Math.ceil(result.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ Get attendance records error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve attendance records',
        error: 'RETRIEVAL_ERROR'
      });
    }
  }

  /**
   * Get employee attendance records
   */
  async getEmployeeAttendance(req, res) {
    try {
      const employeeId = req.params.employeeId;
      const { startDate, endDate, attendanceType } = req.query;

      // Verify employee exists
      const employee = await Employee.findOne({
        where: {
          [Employee.sequelize.Sequelize.Op.or]: [
            { id: employeeId },
            { employeeId: employeeId },
            { employeeCode: employeeId }
          ],
          deletedAt: null
        }
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
          error: 'EMPLOYEE_NOT_FOUND'
        });
      }

      // Build date range
      let dateRange = {};
      if (startDate && endDate) {
        dateRange = {
          [AttendanceRecord.sequelize.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        };
      } else {
        // Default to last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateRange = {
          [AttendanceRecord.sequelize.Sequelize.Op.gte]: thirtyDaysAgo
        };
      }

      // Build where condition
      const whereCondition = {
        employeeId: employee.employeeId,
        deletedAt: null,
        recordTimestamp: dateRange
      };

      if (attendanceType) {
        whereCondition.attendanceType = attendanceType.toUpperCase();
      }

      const records = await AttendanceRecord.findAll({
        where: whereCondition,
        order: [['recordTimestamp', 'DESC']],
        attributes: [
          'id', 'attendanceType', 'recordTimestamp', 'biometricVerified',
          'verificationMethod', 'verificationSimilarity', 'verificationTime',
          'fingerIndexMatched', 'fingerNameMatched', 'deviceId', 'locationName',
          'isLate', 'lateMinutes', 'isEarly', 'earlyMinutes', 'status', 'notes'
        ]
      });

      // Group records by date
      const groupedRecords = this.groupRecordsByDate(records);

      auditLogger.attendance('EMPLOYEE_ATTENDANCE_RETRIEVED', req.user?.id, {
        employeeId: employee.employeeId,
        recordsCount: records.length,
        dateRange: { startDate, endDate }
      });

      res.json({
        success: true,
        message: `Found ${records.length} attendance records for ${employee.fullName}`,
        data: {
          employee: {
            id: employee.id,
            employeeId: employee.employeeId,
            employeeCode: employee.employeeCode,
            fullName: employee.fullName
          },
          summary: {
            totalRecords: records.length,
            checkIns: records.filter(r => r.attendanceType === 'CHECK_IN').length,
            checkOuts: records.filter(r => r.attendanceType === 'CHECK_OUT').length,
            biometricVerified: records.filter(r => r.biometricVerified).length,
            lateRecords: records.filter(r => r.isLate).length
          },
          groupedRecords,
          rawRecords: records.map(record => record.toJSON())
        }
      });

    } catch (error) {
      console.error('❌ Get employee attendance error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve employee attendance',
        error: 'RETRIEVAL_ERROR'
      });
    }
  }

  /**
   * Get attendance statistics
   */
  async getAttendanceStatistics(req, res) {
    try {
      const { startDate, endDate, employeeId, departmentId, outletId } = req.query;

      // Build date range
      let dateRange = {};
      if (startDate && endDate) {
        dateRange = {
          [AttendanceRecord.sequelize.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        };
      } else {
        // Default to last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateRange = {
          [AttendanceRecord.sequelize.Sequelize.Op.gte]: thirtyDaysAgo
        };
      }

      // Build where condition
      const whereCondition = {
        deletedAt: null,
        recordTimestamp: dateRange
      };

      if (employeeId) {
        whereCondition.employeeId = employeeId;
      }

      if (departmentId) {
        whereCondition.departmentId = departmentId;
      }

      if (outletId) {
        whereCondition.outletId = outletId;
      }

      // Get overall statistics
      const overallStats = await AttendanceRecord.findAll({
        where: whereCondition,
        attributes: [
          [AttendanceRecord.sequelize.Sequelize.fn('COUNT', AttendanceRecord.sequelize.Sequelize.col('id')), 'totalRecords'],
          [AttendanceRecord.sequelize.Sequelize.fn('COUNT', AttendanceRecord.sequelize.Sequelize.literal('CASE WHEN biometricVerified = true THEN 1 END')), 'biometricVerified'],
          [AttendanceRecord.sequelize.Sequelize.fn('COUNT', AttendanceRecord.sequelize.Sequelize.literal('CASE WHEN isLate = true THEN 1 END')), 'lateRecords'],
          [AttendanceRecord.sequelize.Sequelize.fn('COUNT', AttendanceRecord.sequelize.Sequelize.literal('CASE WHEN attendanceType = "CHECK_IN" THEN 1 END')), 'checkIns'],
          [AttendanceRecord.sequelize.Sequelize.fn('COUNT', AttendanceRecord.sequelize.Sequelize.literal('CASE WHEN attendanceType = "CHECK_OUT" THEN 1 END')), 'checkOuts'],
          [AttendanceRecord.sequelize.Sequelize.fn('AVG', AttendanceRecord.sequelize.Sequelize.col('verificationTime')), 'avgVerificationTime'],
          [AttendanceRecord.sequelize.Sequelize.fn('AVG', AttendanceRecord.sequelize.Sequelize.col('verificationSimilarity')), 'avgSimilarity']
        ]
      });

      // Get breakdown by attendance type
      const typeBreakdown = await AttendanceRecord.findAll({
        where: whereCondition,
        attributes: [
          'attendanceType',
          [AttendanceRecord.sequelize.Sequelize.fn('COUNT', AttendanceRecord.sequelize.Sequelize.col('id')), 'count'],
          [AttendanceRecord.sequelize.Sequelize.fn('COUNT', AttendanceRecord.sequelize.Sequelize.literal('CASE WHEN biometricVerified = true THEN 1 END')), 'biometricVerified']
        ],
        group: ['attendanceType']
      });

      // Get breakdown by date
      const dailyBreakdown = await AttendanceRecord.findAll({
        where: whereCondition,
        attributes: [
          [AttendanceRecord.sequelize.Sequelize.fn('DATE', AttendanceRecord.sequelize.Sequelize.col('recordTimestamp')), 'date'],
          [AttendanceRecord.sequelize.Sequelize.fn('COUNT', AttendanceRecord.sequelize.Sequelize.col('id')), 'count'],
          [AttendanceRecord.sequelize.Sequelize.fn('COUNT', AttendanceRecord.sequelize.Sequelize.literal('CASE WHEN biometricVerified = true THEN 1 END')), 'biometricVerified']
        ],
        group: [AttendanceRecord.sequelize.Sequelize.fn('DATE', AttendanceRecord.sequelize.Sequelize.col('recordTimestamp'))],
        order: [[AttendanceRecord.sequelize.Sequelize.fn('DATE', AttendanceRecord.sequelize.Sequelize.col('recordTimestamp')), 'ASC']],
        limit: 30 // Last 30 days
      });

      const stats = overallStats[0].get({ plain: true });

      res.json({
        success: true,
        message: 'Attendance statistics retrieved successfully',
        data: {
          overview: {
            totalRecords: parseInt(stats.totalRecords) || 0,
            biometricVerified: parseInt(stats.biometricVerified) || 0,
            lateRecords: parseInt(stats.lateRecords) || 0,
            checkIns: parseInt(stats.checkIns) || 0,
            checkOuts: parseInt(stats.checkOuts) || 0,
            avgVerificationTime: parseFloat(stats.avgVerificationTime) || 0,
            avgSimilarity: parseFloat(stats.avgSimilarity) || 0,
            biometricVerificationRate: stats.totalRecords > 0
              ? ((stats.biometricVerified / stats.totalRecords) * 100).toFixed(2)
              : 0,
            punctualityRate: stats.totalRecords > 0
              ? (((stats.totalRecords - stats.lateRecords) / stats.totalRecords) * 100).toFixed(2)
              : 0
          },
          typeBreakdown: typeBreakdown.map(item => ({
            attendanceType: item.attendanceType,
            total: parseInt(item.get('count')),
            biometricVerified: parseInt(item.get('biometricVerified')),
            verificationRate: item.get('count') > 0
              ? ((item.get('biometricVerified') / item.get('count')) * 100).toFixed(2)
              : 0
          })),
          dailyBreakdown: dailyBreakdown.map(item => ({
            date: item.get('date'),
            total: parseInt(item.get('count')),
            biometricVerified: parseInt(item.get('biometricVerified'))
          }))
        }
      });

    } catch (error) {
      console.error('❌ Get attendance statistics error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve attendance statistics',
        error: 'STATISTICS_ERROR'
      });
    }
  }

  /**
   * Approve attendance record (for manual review)
   */
  async approveAttendance(req, res) {
    try {
      const recordId = req.params.id;
      const { status, notes } = req.body;

      // Validate status
      const validStatuses = ['APPROVED', 'REJECTED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be APPROVED or REJECTED',
          error: 'INVALID_STATUS'
        });
      }

      // Find attendance record
      const record = await AttendanceRecord.findByPk(recordId);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found',
          error: 'RECORD_NOT_FOUND'
        });
      }

      // Check if record is in pending status
      if (record.status !== 'MANUAL_REVIEW') {
        return res.status(400).json({
          success: false,
          message: 'Attendance record is not pending manual review',
          error: 'NOT_PENDING'
        });
      }

      // Update record
      await record.update({
        status: status,
        approvedBy: req.user?.id,
        approvedAt: new Date(),
        notes: notes || record.notes
      });

      auditLogger.attendance('ATTENDANCE_RECORD_APPROVED', req.user?.id, {
        recordId: record.id,
        employeeId: record.employeeId,
        attendanceType: record.attendanceType,
        status,
        approvedBy: req.user?.id
      });

      res.json({
        success: true,
        message: `Attendance record ${status.toLowerCase()} successfully`,
        data: record.toJSON()
      });

    } catch (error) {
      console.error('❌ Approve attendance error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to approve attendance record',
        error: 'APPROVAL_ERROR'
      });
    }
  }

  /**
   * Get pending attendance records (for manual review)
   */
  async getPendingAttendance(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const result = await AttendanceRecord.findAndCountAll({
        where: {
          status: 'MANUAL_REVIEW',
          deletedAt: null
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'ASC']],
        attributes: [
          'id', 'employeeId', 'employeeCode', 'employeeName', 'attendanceType',
          'recordTimestamp', 'biometricVerified', 'verificationSimilarity',
          'isLate', 'hasException', 'exceptionType', 'createdAt'
        ]
      });

      res.json({
        success: true,
        message: `Found ${result.rows.length} pending attendance records`,
        data: {
          records: result.rows.map(record => record.toJSON()),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: result.count,
            pages: Math.ceil(result.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ Get pending attendance error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve pending attendance records',
        error: 'PENDING_RETRIEVAL_ERROR'
      });
    }
  }

  /**
   * Helper method to get finger name
   */
  getFingerName(fingerIndex) {
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
    return fingerNames[fingerIndex] || 'Unknown Finger';
  }

  /**
   * Helper method to group records by date
   */
  groupRecordsByDate(records) {
    const grouped = {};

    records.forEach(record => {
      const date = record.recordTimestamp.toISOString().split('T')[0];

      if (!grouped[date]) {
        grouped[date] = {
          date,
          records: [],
          summary: {
            total: 0,
            checkIns: 0,
            checkOuts: 0,
            biometricVerified: 0
          }
        };
      }

      grouped[date].records.push(record.toJSON());
      grouped[date].summary.total++;

      if (record.attendanceType === 'CHECK_IN') {
        grouped[date].summary.checkIns++;
      } else if (record.attendanceType === 'CHECK_OUT') {
        grouped[date].summary.checkOuts++;
      }

      if (record.biometricVerified) {
        grouped[date].summary.biometricVerified++;
      }
    });

    return grouped;
  }
}

// Create singleton instance
const attendanceController = new AttendanceController();

module.exports = attendanceController;