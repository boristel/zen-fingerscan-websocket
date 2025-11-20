const { body, param, query, validationResult } = require('express-validator');
const biometricService = require('../services/biometricService');
const { BiometricTemplate } = require('../models');
const { auditLogger } = require('../utils/logger');
const { authorizeBiometric } = require('../middleware/auth');

/**
 * Biometric Controller - Enterprise-grade biometric template management
 * Implements secure server-side biometric operations
 */
class BiometricController {
  /**
   * Verify biometric fingerprint (SERVER-SIDE - replaces insecure client verification)
   */
  async verifyFingerprint(req, res) {
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

      const { templateData, employeeId } = req.body;
      const verificationContext = {
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        deviceId: req.get('X-Device-ID') || req.body.deviceId
      };

      // Perform secure server-side verification
      const result = await biometricService.verifyBiometric(
        templateData,
        employeeId,
        verificationContext
      );

      auditLogger.biometric('BIOMETRIC_VERIFICATION_SUCCESS', req.user?.id, {
        employeeId,
        verified: result.verified,
        similarity: result.similarity,
        processingTime: result.processingTime
      });

      res.json({
        success: true,
        message: result.verified ? 'Biometric verification successful' : 'Biometric verification failed',
        data: result
      });

    } catch (error) {
      console.error('❌ Biometric verification error:', error);

      auditLogger.security('BIOMETRIC_VERIFICATION_ERROR', req.user?.id, {
        error: error.message,
        employeeId: req.body.employeeId,
        ip: req.ip
      });

      res.status(400).json({
        success: false,
        message: error.message || 'Biometric verification failed',
        error: 'VERIFICATION_ERROR'
      });
    }
  }

  /**
   * Register new biometric template
   */
  async registerTemplate(req, res) {
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

      const { templateData, fingerIndex, consentObtained, notes } = req.body;
      const employeeId = req.params.employeeId || req.user.employeeId;

      const enrollmentContext = {
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        deviceId: req.get('X-Device-ID') || req.body.deviceId,
        deviceModel: req.get('X-Device-Model') || req.body.deviceModel,
        captureSoftware: req.get('X-Capture-Software') || req.body.captureSoftware,
        attempts: req.body.attempts || 1,
        duration: req.body.duration,
        consentObtained,
        consentDate: consentObtained ? new Date() : null,
        notes
      };

      // Register template with secure server-side processing
      const result = await biometricService.registerTemplate(
        templateData,
        employeeId,
        fingerIndex,
        enrollmentContext
      );

      res.status(201).json({
        success: true,
        message: 'Biometric template registered successfully',
        data: result
      });

    } catch (error) {
      console.error('❌ Biometric registration error:', error);

      auditLogger.security('BIOMETRIC_REGISTRATION_ERROR', req.user?.id, {
        error: error.message,
        employeeId: req.params.employeeId,
        fingerIndex: req.body.fingerIndex,
        ip: req.ip
      });

      res.status(400).json({
        success: false,
        message: error.message || 'Biometric template registration failed',
        error: 'REGISTRATION_ERROR'
      });
    }
  }

  /**
   * Get employee's biometric templates
   */
  async getEmployeeTemplates(req, res) {
    try {
      const employeeId = req.params.employeeId;

      // Get active templates with security checks
      const templates = await BiometricTemplate.findActiveByEmployee(employeeId);

      // Remove sensitive template data from response
      const safeTemplates = templates.map(template => ({
        id: template.id,
        fingerIndex: template.fingerIndex,
        fingerName: template.getFingerName(),
        templateFormat: template.templateFormat,
        templateQuality: template.templateQuality,
        templateSize: template.templateSize,
        deviceId: template.deviceId,
        deviceModel: template.deviceModel,
        status: template.status,
        createdAt: template.createdAt,
        lastVerificationAt: template.lastVerificationAt,
        verificationCount: template.verificationCount,
        successfulVerifications: template.successfulVerifications
      }));

      auditLogger.biometric('BIOMETRIC_TEMPLATES_RETRIEVED', req.user?.id, {
        employeeId,
        templateCount: templates.length
      });

      res.json({
        success: true,
        message: `Found ${templates.length} biometric templates`,
        data: safeTemplates
      });

    } catch (error) {
      console.error('❌ Get templates error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve biometric templates',
        error: 'RETRIEVAL_ERROR'
      });
    }
  }

  /**
   * Update biometric template
   */
  async updateTemplate(req, res) {
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

      const templateId = req.params.id;
      const updates = req.body;

      // Find template
      const template = await BiometricTemplate.findByPk(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Biometric template not found',
          error: 'TEMPLATE_NOT_FOUND'
        });
      }

      // Authorization check - users can only update their own templates
      if (req.user.role !== 'ADMIN' && req.user.role !== 'HR' && template.employeeId !== req.user.employeeId) {
        auditLogger.security('BIOMETRIC_UPDATE_UNAUTHORIZED', req.user?.id, {
          templateId,
          templateEmployeeId: template.employeeId,
          userEmployeeId: req.user.employeeId
        });

        return res.status(403).json({
          success: false,
          message: 'You can only update your own biometric templates',
          error: 'UNAUTHORIZED'
        });
      }

      // Apply updates
      const allowedUpdates = ['notes', 'status', 'purposeOfUse'];
      const updateData = {};

      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          updateData[field] = updates[field];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update',
          error: 'NO_VALID_UPDATES'
        });
      }

      updateData.lastUpdatedBy = req.user?.id;

      // Update template
      await template.update(updateData);

      auditLogger.biometric('BIOMETRIC_TEMPLATE_UPDATED', req.user?.id, {
        templateId,
        employeeId: template.employeeId,
        fingerIndex: template.fingerIndex,
        updates: Object.keys(updateData)
      });

      res.json({
        success: true,
        message: 'Biometric template updated successfully',
        data: {
          id: template.id,
          employeeId: template.employeeId,
          fingerIndex: template.fingerIndex,
          updates: updateData
        }
      });

    } catch (error) {
      console.error('❌ Update template error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to update biometric template',
        error: 'UPDATE_ERROR'
      });
    }
  }

  /**
   * Delete biometric template
   */
  async deleteTemplate(req, res) {
    try {
      const templateId = req.params.id;

      // Find template
      const template = await BiometricTemplate.findByPk(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Biometric template not found',
          error: 'TEMPLATE_NOT_FOUND'
        });
      }

      // Authorization check
      if (req.user.role !== 'ADMIN' && req.user.role !== 'HR' && template.employeeId !== req.user.employeeId) {
        auditLogger.security('BIOMETRIC_DELETE_UNAUTHORIZED', req.user?.id, {
          templateId,
          templateEmployeeId: template.employeeId,
          userEmployeeId: req.user.employeeId
        });

        return res.status(403).json({
          success: false,
          message: 'You can only delete your own biometric templates',
          error: 'UNAUTHORIZED'
        });
      }

      // Soft delete template
      await template.destroy();

      auditLogger.biometric('BIOMETRIC_TEMPLATE_DELETED', req.user?.id, {
        templateId,
        employeeId: template.employeeId,
        fingerIndex: template.fingerIndex,
        fingerName: template.getFingerName()
      });

      res.json({
        success: true,
        message: 'Biometric template deleted successfully'
      });

    } catch (error) {
      console.error('❌ Delete template error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to delete biometric template',
        error: 'DELETE_ERROR'
      });
    }
  }

  /**
   * Get biometric statistics
   */
  async getStatistics(req, res) {
    try {
      const { startDate, endDate, employeeId, departmentId } = req.query;

      // Build query conditions
      const whereCondition = {
        deletedAt: null
      };

      if (employeeId) {
        whereCondition.employeeId = employeeId;
      }

      if (departmentId) {
        whereCondition.departmentId = departmentId;
      }

      if (startDate && endDate) {
        whereCondition.createdAt = {
          [require('sequelize').Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Get statistics
      const stats = await BiometricTemplate.findAll({
        where: whereCondition,
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalTemplates'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = "ACTIVE" THEN 1 END')), 'activeTemplates'],
          [require('sequelize').fn('SUM', require('sequelize').col('verificationCount')), 'totalVerifications'],
          [require('sequelize').fn('SUM', require('sequelize').col('successfulVerifications')), 'successfulVerifications'],
          [require('sequelize').fn('AVG', require('sequelize').col('templateQuality')), 'avgQuality']
        ]
      });

      const statistics = stats[0].get({ plain: true });

      res.json({
        success: true,
        message: 'Biometric statistics retrieved successfully',
        data: {
          totalTemplates: parseInt(statistics.totalTemplates) || 0,
          activeTemplates: parseInt(statistics.activeTemplates) || 0,
          totalVerifications: parseInt(statistics.totalVerifications) || 0,
          successfulVerifications: parseInt(statistics.successfulVerifications) || 0,
          averageQuality: parseFloat(statistics.avgQuality) || 0,
          successRate: statistics.totalVerifications > 0
            ? (statistics.successfulVerifications / statistics.totalVerifications * 100).toFixed(2)
            : 0
        }
      });

    } catch (error) {
      console.error('❌ Get statistics error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve biometric statistics',
        error: 'STATISTICS_ERROR'
      });
    }
  }

  /**
   * Validate template integrity
   */
  async validateTemplateIntegrity(req, res) {
    try {
      const templateId = req.params.id;

      // Find template
      const template = await BiometricTemplate.findByPk(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Biometric template not found',
          error: 'TEMPLATE_NOT_FOUND'
        });
      }

      // Verify template integrity
      const isValid = template.verifyIntegrity();

      auditLogger.biometric('BIOMETRIC_TEMPLATE_INTEGRITY_CHECK', req.user?.id, {
        templateId,
        employeeId: template.employeeId,
        fingerIndex: template.fingerIndex,
        isValid
      });

      res.json({
        success: true,
        message: `Template integrity ${isValid ? 'valid' : 'compromised'}`,
        data: {
          templateId,
          employeeId: template.employeeId,
          fingerIndex: template.fingerIndex,
          isValid,
          checksum: template.checksum,
          lastVerificationAt: template.lastVerificationAt
        }
      });

    } catch (error) {
      console.error('❌ Template integrity check error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to validate template integrity',
        error: 'INTEGRITY_CHECK_ERROR'
      });
    }
  }

  /**
   * Get system health for biometric services
   */
  async getHealthStatus(req, res) {
    try {
      // Check database connectivity
      const dbCheck = await BiometricTemplate.count().catch(() => -1);

      // Check service status
      const serviceStatus = {
        database: dbCheck >= 0 ? 'HEALTHY' : 'UNHEALTHY',
        encryption: 'ACTIVE',
        verification: 'ACTIVE',
        auditLogging: 'ACTIVE'
      };

      const isHealthy = Object.values(serviceStatus).every(status => status === 'HEALTHY' || status === 'ACTIVE');

      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        message: isHealthy ? 'Biometric services healthy' : 'Biometric services degraded',
        data: {
          status: isHealthy ? 'HEALTHY' : 'DEGRADED',
          services: serviceStatus,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Health check error:', error);

      res.status(503).json({
        success: false,
        message: 'Biometric services unavailable',
        error: 'HEALTH_CHECK_ERROR'
      });
    }
  }
}

// Create singleton instance
const biometricController = new BiometricController();

module.exports = biometricController;