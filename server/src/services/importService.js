const { ImportJob, ImportRow, User, Invitation, Organization } = require('../models');
const csvParser = require('./csvParser');
const emailService = require('./emailService');
const { sequelize } = require('../config/database');

class ImportService {
  /**
   * Process import job
   * @param {string} jobId - Import job ID
   * @returns {Promise<object>} Processing result
   */
  async processImportJob(jobId) {
    const transaction = await sequelize.transaction();

    try {
      const job = await ImportJob.findByPk(jobId, {
        include: [{
          model: ImportRow,
          as: 'rows',
          where: { status: 'validated' },
          required: false
        }, {
          model: Organization,
          as: 'organization'
        }],
        transaction
      });

      if (!job) {
        throw new Error('Import job not found');
      }

      if (job.status !== 'validated') {
        throw new Error('Import job must be validated before processing');
      }

      // Update job status
      await job.update({
        status: 'processing',
        startedAt: new Date()
      }, { transaction });

      const results = {
        successful: 0,
        failed: 0,
        skipped: 0,
        invitations: []
      };

      // Process each row
      for (const row of job.rows) {
        try {
          await row.update({ status: 'processing' }, { transaction });

          const rowData = row.dataJson;

          // Check if user already exists
          const existingUser = await User.findOne({
            where: {
              email: rowData.email.toLowerCase(),
              organizationId: job.organizationId
            },
            transaction
          });

          if (existingUser) {
            if (job.settings.skipDuplicates) {
              await row.update({
                status: 'skipped',
                errors: [{ message: 'User already exists' }],
                processedAt: new Date()
              }, { transaction });
              results.skipped++;
              continue;
            } else {
              throw new Error('User already exists');
            }
          }

          // Create user
          const user = await User.create({
            organizationId: job.organizationId,
            email: rowData.email.toLowerCase(),
            firstName: rowData.firstName,
            lastName: rowData.lastName,
            role: rowData.role || job.settings.defaultRole || 'student',
            group: rowData.group,
            status: 'invited'
          }, { transaction });

          // Create invitation if enabled
          let invitation = null;
          if (job.settings.sendInvitations) {
            invitation = await Invitation.create({
              organizationId: job.organizationId,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              group: user.group,
              userId: user.id,
              invitedBy: job.createdBy,
              status: 'pending'
            }, { transaction });

            results.invitations.push(invitation);
          }

          // Update row as successful
          await row.update({
            status: 'success',
            userId: user.id,
            invitationId: invitation?.id,
            processedAt: new Date()
          }, { transaction });

          results.successful++;
        } catch (error) {
          // Update row as failed
          await row.update({
            status: 'failed',
            errors: [{ message: error.message }],
            processedAt: new Date()
          }, { transaction });

          results.failed++;
        }
      }

      // Update job status
      await job.update({
        status: results.failed > 0 ? 'completed' : 'completed',
        successfulRows: results.successful,
        failedRows: results.failed,
        completedAt: new Date()
      }, { transaction });

      await transaction.commit();

      // Send invitations (outside transaction to avoid blocking)
      if (results.invitations.length > 0 && job.settings.sendInvitations) {
        this.sendInvitationsAsync(results.invitations, job.organization);
      }

      return {
        success: true,
        jobId: job.id,
        ...results
      };
    } catch (error) {
      await transaction.rollback();

      // Update job as failed
      await ImportJob.update({
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date()
      }, {
        where: { id: jobId }
      });

      throw error;
    }
  }

  /**
   * Send invitations asynchronously (fire and forget)
   * @param {Array} invitations
   * @param {object} organization
   */
  async sendInvitationsAsync(invitations, organization) {
    try {
      const results = await emailService.sendBulkInvitations(invitations, organization);

      // Update invitation statuses based on send results
      for (const result of results) {
        if (result.invitationId) {
          await Invitation.update(
            {
              status: result.success ? 'sent' : 'bounced',
              sentAt: result.success ? new Date() : null
            },
            {
              where: { id: result.invitationId }
            }
          );
        }
      }
    } catch (error) {
      console.error('Error sending bulk invitations:', error);
    }
  }

  /**
   * Validate import rows
   * @param {string} jobId - Import job ID
   * @returns {Promise<object>} Validation result
   */
  async validateImportRows(jobId) {
    const transaction = await sequelize.transaction();

    try {
      const job = await ImportJob.findByPk(jobId, {
        include: [{
          model: ImportRow,
          as: 'rows'
        }],
        transaction
      });

      if (!job) {
        throw new Error('Import job not found');
      }

      await job.update({ status: 'validating' }, { transaction });

      const validationErrors = [];
      let validCount = 0;
      let errorCount = 0;

      // Check for duplicate emails in the database
      const emails = job.rows.map(row => row.dataJson.email.toLowerCase());
      const existingUsers = await User.findAll({
        where: {
          email: emails,
          organizationId: job.organizationId
        },
        attributes: ['email'],
        transaction
      });

      const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));

      // Validate each row
      for (const row of job.rows) {
        const rowErrors = [];
        const data = row.dataJson;

        // Check if email already exists in database
        if (existingEmails.has(data.email.toLowerCase())) {
          if (!job.settings.skipDuplicates) {
            rowErrors.push('Email already exists in organization');
          }
        }

        if (rowErrors.length > 0) {
          await row.update({
            status: 'failed',
            errors: rowErrors.map(msg => ({ message: msg }))
          }, { transaction });

          validationErrors.push({
            row: row.rowNumber,
            email: data.email,
            errors: rowErrors
          });
          errorCount++;
        } else {
          await row.update({
            status: 'validated',
            errors: []
          }, { transaction });
          validCount++;
        }
      }

      // Update job
      await job.update({
        status: errorCount > 0 && !job.settings.skipDuplicates ? 'failed' : 'validated',
        validationErrors,
        successfulRows: validCount,
        failedRows: errorCount
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        valid: errorCount === 0 || job.settings.skipDuplicates,
        totalRows: job.rows.length,
        validRows: validCount,
        errorRows: errorCount,
        errors: validationErrors
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get import job status with detailed row information
   * @param {string} jobId
   * @returns {Promise<object>}
   */
  async getImportJobStatus(jobId) {
    const job = await ImportJob.findByPk(jobId, {
      include: [{
        model: ImportRow,
        as: 'rows',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'status']
        }, {
          model: Invitation,
          as: 'invitation',
          attributes: ['id', 'status', 'sentAt', 'acceptedAt']
        }]
      }, {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name']
      }, {
        model: User,
        as: 'creator',
        attributes: ['id', 'email', 'firstName', 'lastName']
      }]
    });

    if (!job) {
      throw new Error('Import job not found');
    }

    return job;
  }
}

module.exports = new ImportService();
