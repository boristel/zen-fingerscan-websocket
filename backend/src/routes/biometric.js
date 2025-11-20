const express = require('express');
const router = express.Router();
const biometricController = require('../controllers/biometricController');
const { authenticate, authorizeBiometric, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');

/**
 * Biometric Routes - Secure server-side biometric operations
 * Replaces insecure client-side verification with enterprise-grade server processing
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BiometricVerification:
 *       type: object
 *       required:
 *         - templateData
 *         - employeeId
 *       properties:
 *         templateData:
 *           type: string
 *           description: Base64 encoded fingerprint template data
 *           example: "AOgmAcgp43NcwEE381mK6/VcZ8kwb4Bd2XN6T0Bc..."
 *         employeeId:
 *           type: string
 *           description: Employee identifier
 *           example: "00026"
 *
 *     BiometricRegistration:
 *       type: object
 *       required:
 *         - templateData
 *         - fingerIndex
 *       properties:
 *         templateData:
 *           type: string
 *           description: Base64 encoded fingerprint template data
 *         fingerIndex:
 *           type: integer
 *           minimum: 0
 *           maximum: 9
 *           description: Finger index (0=Right Thumb, 1=Right Index, ..., 9=Left Little)
 *         consentObtained:
 *           type: boolean
 *           description: Whether biometric consent was obtained
 *         notes:
 *           type: string
 *           description: Additional notes about registration
 */

// Validation rules
const verifyFingerprintValidation = [
  body('templateData')
    .notEmpty()
    .withMessage('Template data is required')
    .isLength({ min: 100, max: 1048576 })
    .withMessage('Template data must be between 100 and 1MB characters'),
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isString()
    .withMessage('Employee ID must be a string')
];

const registerTemplateValidation = [
  body('templateData')
    .notEmpty()
    .withMessage('Template data is required')
    .isLength({ min: 100, max: 1048576 })
    .withMessage('Template data must be between 100 and 1MB characters'),
  body('fingerIndex')
    .isInt({ min: 0, max: 9 })
    .withMessage('Finger index must be between 0 and 9'),
  body('consentObtained')
    .optional()
    .isBoolean()
    .withMessage('Consent obtained must be a boolean')
];

const updateTemplateValidation = [
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'DISABLED', 'REVOKED', 'EXPIRED'])
    .withMessage('Status must be one of: ACTIVE, DISABLED, REVOKED, EXPIRED')
];

const employeeIdValidation = [
  param('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isString()
    .withMessage('Employee ID must be a string')
];

const templateIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Template ID must be a positive integer')
];

/**
 * @swagger
 * /api/biometric/verify:
 *   post:
 *     summary: Verify biometric fingerprint (SERVER-SIDE)
 *     description: Secure server-side biometric verification that replaces insecure client-side processing
 *     tags: [Biometrics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BiometricVerification'
 *     responses:
 *       200:
 *         description: Verification completed successfully
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
 *                     verified:
 *                       type: boolean
 *                       description: Whether biometric verification succeeded
 *                     similarity:
 *                       type: integer
 *                       description: Similarity percentage (0-100)
 *                     processingTime:
 *                       type: integer
 *                       description: Processing time in milliseconds
 *                     verificationMethod:
 *                       type: string
 *                       description: Verification method used
 *                       example: "SERVER_SIDE_ISO_IEC_19794_2"
 *                     securityLevel:
 *                       type: string
 *                       example: "ENTERPRISE"
 *       400:
 *         description: Verification failed due to invalid input or processing error
 *       401:
 *         description: Authentication required
 */
router.post('/verify',
  authenticate,
  verifyFingerprintValidation,
  biometricController.verifyFingerprint
);

/**
 * @swagger
 * /api/biometric/templates:
 *   get:
 *     summary: Get employee's biometric templates
 *     description: Retrieve all active biometric templates for an employee
 *     tags: [Biometrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         required: false
 *         description: Employee ID filter
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       fingerIndex:
 *                         type: integer
 *                       fingerName:
 *                         type: string
 *                       templateFormat:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 */
router.get('/templates',
  authenticate,
  biometricController.getEmployeeTemplates
);

/**
 * @swagger
 * /api/biometric/templates/{employeeId}:
 *   post:
 *     summary: Register new biometric template
 *     description: Register a new fingerprint template with secure server-side processing
 *     tags: [Biometrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BiometricRegistration'
 *     responses:
 *       201:
 *         description: Template registered successfully
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
 *                     enrollmentId:
 *                       type: string
 *                       description: Unique enrollment identifier
 *                     templateId:
 *                       type: integer
 *                       description: Database template ID
 *                     finger:
 *                       type: object
 *                       properties:
 *                         index:
 *                           type: integer
 *                         name:
 *                           type: string
 *                     enrollmentMethod:
 *                       type: string
 *                       example: "SERVER_SIDE_SECURE"
 *       400:
 *         description: Registration failed due to validation or processing error
 *       403:
 *         description: Unauthorized to register template for this employee
 */
router.post('/templates/:employeeId',
  authenticate,
  authorizeBiometric('REGISTRATION'),
  employeeIdValidation,
  registerTemplateValidation,
  biometricController.registerTemplate
);

/**
 * @swagger
 * /api/biometric/templates/{id}:
 *   put:
 *     summary: Update biometric template
 *     description: Update biometric template metadata (notes, status, etc.)
 *     tags: [Biometrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, DISABLED, REVOKED, EXPIRED]
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       404:
 *         description: Template not found
 *       403:
 *         description: Unauthorized to update this template
 */
router.put('/templates/:id',
  authenticate,
  templateIdValidation,
  updateTemplateValidation,
  biometricController.updateTemplate
);

/**
 * @swagger
 * /api/biometric/templates/{id}:
 *   delete:
 *     summary: Delete biometric template
 *     description: Permanently delete a biometric template
 *     tags: [Biometrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       404:
 *         description: Template not found
 *       403:
 *         description: Unauthorized to delete this template
 */
router.delete('/templates/:id',
  authenticate,
  templateIdValidation,
  biometricController.deleteTemplate
);

/**
 * @swagger
 * /api/biometric/statistics:
 *   get:
 *     summary: Get biometric statistics
 *     description: Retrieve comprehensive biometric system statistics
 *     tags: [Biometrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
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
 *                     totalTemplates:
 *                       type: integer
 *                     activeTemplates:
 *                       type: integer
 *                     totalVerifications:
 *                       type: integer
 *                     successfulVerifications:
 *                       type: integer
 *                     averageQuality:
 *                       type: number
 *                     successRate:
 *                       type: number
 */
router.get('/statistics',
  authenticate,
  authorize(['ADMIN', 'HR']), // Only admin/HR can view statistics
  biometricController.getStatistics
);

/**
 * @swagger
 * /api/biometric/validate/{id}:
 *   get:
 *     summary: Validate template integrity
 *     description: Verify the cryptographic integrity of a stored biometric template
 *     tags: [Biometrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID to validate
 *     responses:
 *       200:
 *         description: Template integrity check completed
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
 *                     isValid:
 *                       type: boolean
 *                       description: Whether template integrity is valid
 *                     checksum:
 *                       type: string
 *                       description: Template SHA-256 checksum
 *       404:
 *         description: Template not found
 */
router.get('/validate/:id',
  authenticate,
  templateIdValidation,
  biometricController.validateTemplateIntegrity
);

/**
 * @swagger
 * /api/biometric/health:
 *   get:
 *     summary: Get biometric service health status
 *     description: Check the health status of biometric processing services
 *     tags: [Biometrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Services are healthy
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
 *                     status:
 *                       type: string
 *                       enum: [HEALTHY, DEGRADED]
 *                     services:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: string
 *                           enum: [HEALTHY, UNHEALTHY]
 *                         encryption:
 *                           type: string
 *                           enum: [ACTIVE, INACTIVE]
 *                         verification:
 *                           type: string
 *                           enum: [ACTIVE, INACTIVE]
 *                         auditLogging:
 *                           type: string
 *                           enum: [ACTIVE, INACTIVE]
 *       503:
 *         description: Services are degraded or unavailable
 */
router.get('/health',
  biometricController.getHealthStatus
);

module.exports = router;