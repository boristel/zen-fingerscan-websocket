const { body, param, query, validationResult } = require('express-validator');
const { Employee } = require('../models');
const { auditLogger } = require('../utils/logger');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * Employee Controller - Enterprise-grade employee management
 * Implements secure employee CRUD operations with proper validation
 */
class EmployeeController {
  /**
   * Search for employees (replaces the insecure search from original server.js)
   */
  async searchEmployees(req, res) {
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

      const { query, page = 1, limit = 20, departmentId, outletId, status } = req.query;
      const offset = (page - 1) * limit;

      // Build search conditions
      const whereCondition = {
        deletedAt: null
      };

      // Add department filter
      if (departmentId) {
        whereCondition.departmentId = departmentId;
      }

      // Add outlet filter
      if (outletId) {
        whereCondition.outletId = outletId;
      }

      // Add status filter
      if (status) {
        whereCondition.status = status;
      }

      let employees = [];
      let total = 0;

      if (query && query.trim().length > 0) {
        // Search with query
        const searchResults = await Employee.search(query.trim(), {
          where: whereCondition,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['fullName', 'ASC']],
          attributes: [
            'id', 'employeeId', 'employeeCode', 'fullName', 'email', 'phone',
            'departmentName', 'position', 'outletName', 'status', 'biometricEnrolled',
            'biometricCount', 'createdAt', 'lastLoginAt'
          ]
        });

        employees = searchResults;
        total = searchResults.length; // For search, we might want to count separately in production
      } else {
        // Get all employees without search query
        const result = await Employee.findAndCountAll({
          where: whereCondition,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['fullName', 'ASC']],
          attributes: [
            'id', 'employeeId', 'employeeCode', 'fullName', 'email', 'phone',
            'departmentName', 'position', 'outletName', 'status', 'biometricEnrolled',
            'biometricCount', 'createdAt', 'lastLoginAt'
          ]
        });

        employees = result.rows;
        total = result.count;
      }

      auditLogger.auth('EMPLOYEE_SEARCH_COMPLETED', req.user?.id, true, {
        query: query?.trim() || null,
        resultsCount: employees.length,
        page,
        limit
      });

      res.json({
        success: true,
        message: `Found ${employees.length} employees`,
        data: {
          employees: employees.map(emp => emp.toJSON()),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ Employee search error:', error);

      auditLogger.security('EMPLOYEE_SEARCH_ERROR', req.user?.id, {
        error: error.message,
        query: req.query.query
      });

      res.status(500).json({
        success: false,
        message: 'Failed to search employees',
        error: 'SEARCH_ERROR'
      });
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(req, res) {
    try {
      const employeeId = req.params.id;

      const employee = await Employee.findOne({
        where: {
          [Employee.sequelize.Sequelize.Op.or]: [
            { id: employeeId },
            { employeeId: employeeId },
            { employeeCode: employeeId }
          ],
          deletedAt: null
        },
        attributes: [
          'id', 'employeeId', 'employeeCode', 'firstName', 'lastName', 'fullName',
          'email', 'phone', 'departmentId', 'departmentName', 'position',
          'outletId', 'outletName', 'status', 'biometricEnrolled', 'biometricCount',
          'lastBiometricUpdate', 'hireDate', 'terminationDate', 'createdAt', 'updatedAt',
          'lastLoginAt'
        ]
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
          error: 'EMPLOYEE_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        message: 'Employee retrieved successfully',
        data: employee.toJSON()
      });

    } catch (error) {
      console.error('❌ Get employee error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve employee',
        error: 'RETRIEVAL_ERROR'
      });
    }
  }

  /**
   * Create new employee
   */
  async createEmployee(req, res) {
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

      const employeeData = {
        employeeId: req.body.employeeId,
        employeeCode: req.body.employeeCode,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        departmentId: req.body.departmentId,
        departmentName: req.body.departmentName,
        position: req.body.position,
        outletId: req.body.outletId,
        outletName: req.body.outletName,
        status: req.body.status || 'ACTIVE',
        hireDate: req.body.hireDate,
        createdBy: req.user?.id
      };

      // Check for duplicates
      const existingEmployee = await Employee.findOne({
        where: {
          [Employee.sequelize.Sequelize.Op.or]: [
            { employeeId: employeeData.employeeId },
            { employeeCode: employeeData.employeeCode },
            ...(employeeData.email ? [{ email: employeeData.email }] : [])
          ],
          deletedAt: null
        }
      });

      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          message: 'Employee with this ID, code, or email already exists',
          error: 'DUPLICATE_EMPLOYEE'
        });
      }

      // Create employee
      const employee = await Employee.create(employeeData);

      auditLogger.auth('EMPLOYEE_CREATED', req.user?.id, true, {
        newEmployeeId: employee.id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName
      });

      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee.toJSON()
      });

    } catch (error) {
      console.error('❌ Create employee error:', error);

      auditLogger.security('EMPLOYEE_CREATE_ERROR', req.user?.id, {
        error: error.message,
        employeeData: {
          employeeId: req.body.employeeId,
          employeeCode: req.body.employeeCode
        }
      });

      res.status(500).json({
        success: false,
        message: 'Failed to create employee',
        error: 'CREATE_ERROR'
      });
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(req, res) {
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

      const employeeId = req.params.id;
      const updateData = req.body;

      // Find employee
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

      // Check for duplicates (excluding current employee)
      if (updateData.email || updateData.employeeCode || updateData.employeeId) {
        const duplicateCheck = await Employee.findOne({
          where: {
            [Employee.sequelize.Sequelize.Op.or]: [
              ...(updateData.employeeId ? [{ employeeId: updateData.employeeId }] : []),
              ...(updateData.employeeCode ? [{ employeeCode: updateData.employeeCode }] : []),
              ...(updateData.email ? [{ email: updateData.email }] : [])
            ],
            id: { [Employee.sequelize.Sequelize.Op.ne]: employee.id },
            deletedAt: null
          }
        });

        if (duplicateCheck) {
          return res.status(409).json({
            success: false,
            message: 'Another employee with this ID, code, or email already exists',
            error: 'DUPLICATE_EMPLOYEE'
          });
        }
      }

      // Prevent critical field changes
      const protectedFields = ['id', 'employeeId', 'createdAt'];
      protectedFields.forEach(field => delete updateData[field]);

      updateData.updatedBy = req.user?.id;

      // Update employee
      await employee.update(updateData);

      auditLogger.auth('EMPLOYEE_UPDATED', req.user?.id, true, {
        updatedEmployeeId: employee.id,
        employeeCode: employee.employeeCode,
        changes: Object.keys(updateData)
      });

      res.json({
        success: true,
        message: 'Employee updated successfully',
        data: employee.toJSON()
      });

    } catch (error) {
      console.error('❌ Update employee error:', error);

      auditLogger.security('EMPLOYEE_UPDATE_ERROR', req.user?.id, {
        error: error.message,
        employeeId: req.params.id
      });

      res.status(500).json({
        success: false,
        message: 'Failed to update employee',
        error: 'UPDATE_ERROR'
      });
    }
  }

  /**
   * Delete (soft delete) employee
   */
  async deleteEmployee(req, res) {
    try {
      const employeeId = req.params.id;

      // Find employee
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

      // Soft delete employee
      await employee.destroy();

      auditLogger.auth('EMPLOYEE_DELETED', req.user?.id, true, {
        deletedEmployeeId: employee.id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName
      });

      res.json({
        success: true,
        message: 'Employee deleted successfully'
      });

    } catch (error) {
      console.error('❌ Delete employee error:', error);

      auditLogger.security('EMPLOYEE_DELETE_ERROR', req.user?.id, {
        error: error.message,
        employeeId: req.params.id
      });

      res.status(500).json({
        success: false,
        message: 'Failed to delete employee',
        error: 'DELETE_ERROR'
      });
    }
  }

  /**
   * Get employee statistics
   */
  async getEmployeeStatistics(req, res) {
    try {
      const { departmentId, outletId, status } = req.query;

      // Build where condition
      const whereCondition = { deletedAt: null };
      if (departmentId) whereCondition.departmentId = departmentId;
      if (outletId) whereCondition.outletId = outletId;
      if (status) whereCondition.status = status;

      // Get statistics
      const stats = await Employee.findAll({
        where: whereCondition,
        attributes: [
          [Employee.sequelize.Sequelize.fn('COUNT', Employee.sequelize.Sequelize.col('id')), 'total'],
          [Employee.sequelize.Sequelize.fn('COUNT', Employee.sequelize.Sequelize.literal('CASE WHEN status = "ACTIVE" THEN 1 END')), 'active'],
          [Employee.sequelize.Sequelize.fn('COUNT', Employee.sequelize.Sequelize.literal('CASE WHEN biometricEnrolled = true THEN 1 END')), 'biometricEnrolled'],
          [Employee.sequelize.Sequelize.fn('COUNT', Employee.sequelize.Sequelize.literal('CASE WHEN departmentId IS NOT NULL THEN 1 END')), 'withDepartment'],
          [Employee.sequelize.Sequelize.fn('COUNT', Employee.sequelize.Sequelize.literal('CASE WHEN outletId IS NOT NULL THEN 1 END')), 'withOutlet']
        ]
      });

      const statistics = stats[0].get({ plain: true });

      // Get status breakdown
      const statusBreakdown = await Employee.findAll({
        where: whereCondition,
        attributes: [
          'status',
          [Employee.sequelize.Sequelize.fn('COUNT', Employee.sequelize.Sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Get department breakdown
      const departmentBreakdown = await Employee.findAll({
        where: whereCondition,
        attributes: [
          'departmentName',
          [Employee.sequelize.Sequelize.fn('COUNT', Employee.sequelize.Sequelize.col('id')), 'count']
        ],
        group: ['departmentName'],
        having: Employee.sequelize.Sequelize.where(
          Employee.sequelize.Sequelize.col('departmentName'),
          { [Employee.sequelize.Sequelize.Op.ne]: null }
        )
      });

      res.json({
        success: true,
        message: 'Employee statistics retrieved successfully',
        data: {
          overview: {
            total: parseInt(statistics.total) || 0,
            active: parseInt(statistics.active) || 0,
            biometricEnrolled: parseInt(statistics.biometricEnrolled) || 0,
            withDepartment: parseInt(statistics.withDepartment) || 0,
            withOutlet: parseInt(statistics.withOutlet) || 0
          },
          statusBreakdown: statusBreakdown.map(item => ({
            status: item.status,
            count: parseInt(item.get('count'))
          })),
          departmentBreakdown: departmentBreakdown.map(item => ({
            department: item.departmentName,
            count: parseInt(item.get('count'))
          }))
        }
      });

    } catch (error) {
      console.error('❌ Get employee statistics error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve employee statistics',
        error: 'STATISTICS_ERROR'
      });
    }
  }

  /**
   * Get employee's biometric enrollment status
   */
  async getEmployeeBiometricStatus(req, res) {
    try {
      const employeeId = req.params.id || req.user.employeeId;

      const employee = await Employee.findOne({
        where: {
          [Employee.sequelize.Sequelize.Op.or]: [
            { id: employeeId },
            { employeeId: employeeId },
            { employeeCode: employeeId }
          ],
          deletedAt: null
        },
        attributes: [
          'id', 'employeeId', 'employeeCode', 'fullName',
          'biometricEnrolled', 'biometricCount', 'lastBiometricUpdate'
        ]
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
          error: 'EMPLOYEE_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        message: 'Employee biometric status retrieved successfully',
        data: {
          employeeId: employee.employeeId,
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          biometricEnrolled: employee.biometricEnrolled,
          biometricCount: employee.biometricCount,
          lastBiometricUpdate: employee.lastBiometricUpdate,
          canRecordAttendance: employee.canRecordAttendance()
        }
      });

    } catch (error) {
      console.error('❌ Get biometric status error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve employee biometric status',
        error: 'STATUS_RETRIEVAL_ERROR'
      });
    }
  }

  /**
   * Test database connection (from original server.js)
   */
  async testConnection(req, res) {
    try {
      // Test basic database connectivity
      await Employee.sequelize.authenticate();

      // Test basic query
      const [results] = await Employee.sequelize.query('SELECT 1 as test');

      res.json({
        success: true,
        message: 'Database connection successful',
        data: {
          testQuery: results[0],
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        }
      });

    } catch (error) {
      console.error('❌ Database connection test error:', error);

      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: error.message
      });
    }
  }

  /**
   * Get database contents (from original server.js)
   */
  async getDatabaseContents(req, res) {
    try {
      const tables = ['employees', 'biometric_templates', 'attendance_records'];
      const contents = {};

      for (const table of tables) {
        try {
          const [results] = await Employee.sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
          contents[table] = results[0];
        } catch (tableError) {
          contents[table] = { error: tableError.message };
        }
      }

      res.json({
        success: true,
        message: 'Database contents retrieved successfully',
        data: {
          tables: contents,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Get database contents error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve database contents',
        error: error.message
      });
    }
  }
}

// Create singleton instance
const employeeController = new EmployeeController();

module.exports = employeeController;