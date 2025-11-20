const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, optionalAuth, authorize, authorizeSelf } = require('../middleware/auth');
const { body, param, query } = require('express-validator');

/**
 * Attendance Routes - Secure attendance tracking API
 * Implements server-side attendance recording with biometric verification
 */

// Validation rules
const storeAttendanceValidation = [
  body('karyawanid')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isString()
    .withMessage('Employee ID must be a string'),
  body('kodekaryawan')
    .notEmpty()
    .withMessage('Employee code is required')
    .isString()
    .withMessage('Employee code must be a string'),
  body('namakaryawan')
    .notEmpty()
    .withMessage('Employee name is required')
    .isString()
    .withMessage('Employee name must be a string'),
  body('attendanceType')
    .notEmpty()
    .withMessage('Attendance type is required')
    .isIn(['CHECK_IN', 'CHECK_OUT', 'BREAK_IN', 'BREAK_OUT', 'OVERTIME_IN', 'OVERTIME_OUT'])
    .withMessage('Invalid attendance type'),
  body('fingerprintVerified')
    .optional()
    .isBoolean()
    .withMessage('Fingerprint verified must be a boolean'),
  body('verificationSimilarity')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Verification similarity must be between 0 and 100'),
  body('verificationTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Verification time must be a non-negative integer'),
  body('fingerindexMatched')
    .optional()
    .isInt({ min: 0, max: 9 })
    .withMessage('Finger index must be between 0 and 9'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const approveAttendanceValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Attendance ID must be a positive integer'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['APPROVED', 'REJECTED'])
    .withMessage('Status must be APPROVED or REJECTED'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const attendanceQueryValidation = [
  query('employeeId')
    .optional()
    .isString()
    .withMessage('Employee ID must be a string'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in ISO8601 format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in ISO8601 format'),
  query('attendanceType')
    .optional()
    .isIn(['CHECK_IN', 'CHECK_OUT', 'BREAK_IN', 'BREAK_OUT', 'OVERTIME_IN', 'OVERTIME_OUT'])
    .withMessage('Invalid attendance type'),
  query('status')
    .optional()
    .isIn(['PENDING', 'PROCESSED', 'APPROVED', 'REJECTED', 'MANUAL_REVIEW'])
    .withMessage('Invalid attendance status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const employeeIdValidation = [
  param('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isString()
    .withMessage('Employee ID must be a string')
];

/**
 * @swagger
 * components:
 *   schemas:
 *     AttendanceRecord:
 *       type: object
 *       required:
 *         - karyawanid
 *         - kodekaryawan
 *         - namakaryawan
 *         - attendanceType
 *       properties:
 *         karyawanid:
 *           type: string
 *           description: Employee identifier
 *           example: "00026"
 *         kodekaryawan:
 *           type: string
 *           description: Employee code
 *           example: "00026"
 *         namakaryawan:
 *           type: string
 *           description: Employee full name
 *           example: "John Doe"
 *         attendanceType:
 *           type: string
 *           enum: [CHECK_IN, CHECK_OUT, BREAK_IN, BREAK_OUT, OVERTIME_IN, OVERTIME_OUT]
 *           description: Type of attendance record
 *           example: "CHECK_IN"
 *         fingerprintVerified:
 *           type: boolean
 *           description: Whether attendance was verified using fingerprint
 *           example: true
 *         verificationSimilarity:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Biometric verification similarity percentage
 *           example: 85
 *         verificationTime:
 *           type: integer
 *           minimum: 0
 *           description: Verification processing time in milliseconds
 *           example: 1250
 *         fingerindexMatched:
 *           type: integer
 *           minimum: 0
 *           maximum: 9
 *           description: Finger index that matched during verification
 *           example: 1
 *         notes:
 *           type: string
 *           maxLength: 1000
 *           description: Additional notes about attendance record
 *           example: "Late due to traffic"
 */

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Store attendance record (SECURE VERSION)
 *     description: Record attendance with secure server-side biometric verification and duplicate prevention
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttendanceRecord'
 *     responses:
 *       201:
 *         description: Attendance recorded successfully
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
 *                   $ref: '#/components/schemas/AttendanceRecord'
 *       400:
 *         description: Validation failed or duplicate record
 *       404:
 *         description: Employee not found or inactive
 *       409:
 *         description: Duplicate attendance record detected
 *       401:
 *         description: Authentication required
 */
router.post('/',
  authenticate,
  storeAttendanceValidation,
  attendanceController.storeAttendance
);

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get attendance records
 *     description: Retrieve attendance records with filtering and pagination
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for filtering
 *       - in: query
 *         name: attendanceType
 *         schema:
 *           type: string
 *           enum: [CHECK_IN, CHECK_OUT, BREAK_IN, BREAK_OUT, OVERTIME_IN, OVERTIME_OUT]
 *         description: Filter by attendance type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSED, APPROVED, REJECTED, MANUAL_REVIEW]
 *         description: Filter by record status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
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
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AttendanceRecord'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/',
  authenticate,
  attendanceQueryValidation,
  attendanceController.getAttendanceRecords
);

/**
 * @swagger
 * /api/attendance/employee/{employeeId}:
 *   get:
 *     summary: Get employee attendance records
 *     description: Retrieve attendance records for a specific employee with date grouping and summary
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID, code, or database ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: attendanceType
 *         schema:
 *           type: string
 *           enum: [CHECK_IN, CHECK_OUT, BREAK_IN, BREAK_OUT, OVERTIME_IN, OVERTIME_OUT]
 *         description: Filter by attendance type
 *     responses:
 *       200:
 *         description: Employee attendance retrieved successfully
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
 *                     employee:
 *                       $ref: '#/components/schemas/Employee'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRecords:
 *                           type: integer
 *                         checkIns:
 *                           type: integer
 *                         checkOuts:
 *                           type: integer
 *                         biometricVerified:
 *                           type: integer
 *                         lateRecords:
 *                           type: integer
 *                     groupedRecords:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           records:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/AttendanceRecord'
 *                           summary:
 *                             type: object
 *                             properties:
 *                               total:
 *                                 type: integer
 *                               checkIns:
 *                                 type: integer
 *                               checkOuts:
 *                                 type: integer
 *                               biometricVerified:
 *                                 type: integer
 *                     rawRecords:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AttendanceRecord'
 *       404:
 *         description: Employee not found
 */
router.get('/employee/:employeeId',
  authenticate,
  employeeIdValidation,
  attendanceController.getEmployeeAttendance
);

/**
 * @swagger
 * /api/attendance/statistics:
 *   get:
 *     summary: Get attendance statistics
 *     description: Retrieve comprehensive attendance statistics with filtering options
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for statistics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for statistics
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
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
 *                         totalRecords:
 *                           type: integer
 *                         biometricVerified:
 *                           type: integer
 *                         lateRecords:
 *                           type: integer
 *                         checkIns:
 *                           type: integer
 *                         checkOuts:
 *                           type: integer
 *                         avgVerificationTime:
 *                           type: number
 *                         avgSimilarity:
 *                           type: number
 *                         biometricVerificationRate:
 *                           type: number
 *                         punctualityRate:
 *                           type: number
 *                     typeBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           attendanceType:
 *                             type: string
 *                           total:
 *                             type: integer
 *                           biometricVerified:
 *                             type: integer
 *                           verificationRate:
 *                             type: number
 *                     dailyBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           total:
 *                             type: integer
 *                           biometricVerified:
 *                             type: integer
 */
router.get('/statistics',
  authenticate,
  authorize(['ADMIN', 'HR', 'MANAGER']), // Managers and above can view statistics
  attendanceController.getAttendanceStatistics
);

/**
 * @swagger
 * /api/attendance/approve/{id}:
 *   put:
 *     summary: Approve attendance record
 *     description: Approve or reject attendance records that require manual review
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *                 description: Approval status
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Notes about the approval decision
 *     responses:
 *       200:
 *         description: Attendance record approved/rejected successfully
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
 *                   $ref: '#/components/schemas/AttendanceRecord'
 *       400:
 *         description: Invalid status or record not pending
 *       404:
 *         description: Attendance record not found
 *       403:
 *         description: Insufficient permissions
 */
router.put('/approve/:id',
  authenticate,
  approveAttendanceValidation,
  authorize(['ADMIN', 'HR', 'MANAGER']), // Managers and above can approve
  attendanceController.approveAttendance
);

/**
 * @swagger
 * /api/attendance/pending:
 *   get:
 *     summary: Get pending attendance records
 *     description: Retrieve attendance records that require manual review
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 50
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Pending attendance records retrieved successfully
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
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AttendanceRecord'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/pending',
  authenticate,
  authorize(['ADMIN', 'HR', 'MANAGER']), // Managers and above can review pending records
  attendanceQueryValidation,
  attendanceController.getPendingAttendance
);

module.exports = router;