const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate, optionalAuth, authorize, authorizeSelf } = require('../middleware/auth');
const { body, param, query } = require('express-validator');

/**
 * Employee Routes - Secure employee management API
 * Replaces insecure endpoints from original server.js with enterprise-grade implementation
 */

// Validation rules
const createEmployeeValidation = [
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Employee ID must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Employee ID can only contain letters, numbers, hyphens, and underscores'),
  body('employeeCode')
    .notEmpty()
    .withMessage('Employee code is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Employee code must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Employee code can only contain letters, numbers, hyphens, and underscores'),
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s-()]+$/)
    .withMessage('Invalid phone number format'),
  body('departmentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),
  body('outletId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Outlet ID must be a positive integer'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'])
    .withMessage('Invalid employee status')
];

const updateEmployeeValidation = [
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s-()]+$/)
    .withMessage('Invalid phone number format'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'])
    .withMessage('Invalid employee status')
];

const employeeIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Employee ID is required')
];

const searchValidation = [
  query('query')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

/**
 * @swagger
 * /api/employees/search:
 *   post:
 *     summary: Search for employees (SECURE VERSION)
 *     description: Search employees by name, ID, or code with enterprise-grade security and validation
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: Search query for employee name, ID, or code
 *                 example: "John"
 *               page:
 *                 type: integer
 *                 default: 1
 *                 minimum: 1
 *                 description: Page number
 *               limit:
 *                 type: integer
 *                 default: 20
 *                 minimum: 1
 *                 maximum: 100
 *                 description: Number of results per page
 *               departmentId:
 *                 type: integer
 *                 description: Filter by department ID
 *               outletId:
 *                 type: integer
 *                 description: Filter by outlet ID
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED, TERMINATED]
 *                 description: Filter by employee status
 *     responses:
 *       200:
 *         description: Search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     employees:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Employee'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.post('/search',
  authenticate,
  searchValidation,
  employeeController.searchEmployees
);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     description: Retrieve detailed employee information by ID, employee code, or employee ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID, code, or database ID
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 */
router.get('/:id',
  authenticate,
  employeeIdValidation,
  employeeController.getEmployeeById
);

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create new employee
 *     description: Create a new employee record with validation and duplicate checking
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - employeeCode
 *               - fullName
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: Unique employee identifier
 *                 example: "EMP001"
 *               employeeCode:
 *                 type: string
 *                 description: Employee code for attendance system
 *                 example: "0001"
 *               fullName:
 *                 type: string
 *                 description: Full name of employee
 *                 example: "John Doe"
 *               firstName:
 *                 type: string
 *                 description: First name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: Last name
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *                 example: "john.doe@company.com"
 *               phone:
 *                 type: string
 *                 description: Phone number
 *                 example: "+1234567890"
 *               departmentId:
 *                 type: integer
 *                 description: Department ID
 *               departmentName:
 *                 type: string
 *                 description: Department name
 *                 example: "Engineering"
 *               position:
 *                 type: string
 *                 description: Job position
 *                 example: "Software Engineer"
 *               outletId:
 *                 type: integer
 *                 description: Outlet/branch ID
 *               outletName:
 *                 type: string
 *                 description: Outlet/branch name
 *                 example: "Main Office"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED, TERMINATED]
 *                 default: "ACTIVE"
 *                 description: Employee status
 *               hireDate:
 *                 type: string
 *                 format: date
 *                 description: Hire date
 *                 example: "2024-01-15"
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Validation failed or duplicate employee
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post('/',
  authenticate,
  authorize(['ADMIN', 'HR']), // Only admin/HR can create employees
  createEmployeeValidation,
  employeeController.createEmployee
);

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Update employee
 *     description: Update employee information with validation and authorization checks
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID, code, or database ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of employee
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               departmentId:
 *                 type: integer
 *                 description: Department ID
 *               departmentName:
 *                 type: string
 *                 description: Department name
 *               position:
 *                 type: string
 *                 description: Job position
 *               outletId:
 *                 type: integer
 *                 description: Outlet/branch ID
 *               outletName:
 *                 type: string
 *                 description: Outlet/branch name
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED, TERMINATED]
 *                 description: Employee status
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Employee not found
 *       403:
 *         description: Insufficient permissions
 */
router.put('/:id',
  authenticate,
  employeeIdValidation,
  updateEmployeeValidation,
  employeeController.updateEmployee
);

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete employee
 *     description: Soft delete an employee record (sets deletedAt timestamp)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID, code, or database ID
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       404:
 *         description: Employee not found
 *       403:
 *         description: Insufficient permissions
 */
router.delete('/:id',
  authenticate,
  authorize(['ADMIN', 'HR']), // Only admin/HR can delete employees
  employeeIdValidation,
  employeeController.deleteEmployee
);

/**
 * @swagger
 * /api/employees/statistics:
 *   get:
 *     summary: Get employee statistics
 *     description: Retrieve comprehensive employee statistics with filtering options
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *         description: Filter by department ID
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: integer
 *         description: Filter by outlet ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED, TERMINATED]
 *         description: Filter by employee status
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         biometricEnrolled:
 *                           type: integer
 *                         withDepartment:
 *                           type: integer
 *                         withOutlet:
 *                           type: integer
 *                     statusBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     departmentBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           department:
 *                             type: string
 *                           count:
 *                             type: integer
 */
router.get('/statistics',
  authenticate,
  authorize(['ADMIN', 'HR']), // Only admin/HR can view statistics
  employeeController.getEmployeeStatistics
);

/**
 * @swagger
 * /api/employees/{id}/biometric-status:
 *   get:
 *     summary: Get employee biometric enrollment status
 *     description: Retrieve biometric enrollment status and capabilities for an employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID, code, or database ID
 *     responses:
 *       200:
 *         description: Biometric status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     employeeId:
 *                       type: string
 *                     employeeCode:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     biometricEnrolled:
 *                       type: boolean
 *                     biometricCount:
 *                       type: integer
 *                     lastBiometricUpdate:
 *                       type: string
 *                       format: date-time
 *                     canRecordAttendance:
 *                       type: boolean
 *       404:
 *         description: Employee not found
 */
router.get('/:id/biometric-status',
  authenticate,
  employeeIdValidation,
  authorizeSelf('employeeId'), // Employees can check their own status
  employeeController.getEmployeeBiometricStatus
);

/**
 * @swagger
 * /api/employees/test-connection:
 *   get:
 *     summary: Test database connection
 *     description: Test database connectivity and basic query execution
 *     tags: [Employees, System]
 *     responses:
 *       200:
 *         description: Database connection successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     testQuery:
 *                       type: object
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     environment:
 *                       type: string
 *       500:
 *         description: Database connection failed
 */
router.get('/test-connection',
  employeeController.testConnection
);

/**
 * @swagger
 * /api/employees/contents:
 *   get:
 *     summary: Get database contents
 *     description: Retrieve database table contents and record counts
 *     tags: [Employees, System]
 *     responses:
 *       200:
 *         description: Database contents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     tables:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           count:
 *                             type: integer
 *                       example:
 *                         employees:
 *                           count: 150
 *                         biometric_templates:
 *                           count: 300
 *                         attendance_records:
 *                           count: 15000
 */
router.get('/contents',
  employeeController.getDatabaseContents
);

module.exports = router;