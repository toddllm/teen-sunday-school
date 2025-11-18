const { ImportJob, ImportRow, Organization } = require('../models');
const csvParser = require('../services/csvParser');
const importService = require('../services/importService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024 // Default 5MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  }
});

class ImportController {
  /**
   * Get multer middleware for file upload
   */
  getUploadMiddleware() {
    return upload.single('file');
  }

  /**
   * Upload CSV and create import job
   */
  async uploadCSV(req, res) {
    try {
      const { orgId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Parse CSV to detect columns
      const columns = await csvParser.detectColumns(req.file.path);

      // Suggest column mapping
      const suggestedMapping = csvParser.suggestColumnMapping(columns);

      // Parse all rows
      const rows = await csvParser.parseFile(req.file.path);

      if (rows.length === 0) {
        await fs.unlink(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'CSV file is empty'
        });
      }

      if (rows.length > (parseInt(process.env.MAX_IMPORT_ROWS) || 1000)) {
        await fs.unlink(req.file.path);
        return res.status(400).json({
          success: false,
          message: `CSV file exceeds maximum allowed rows (${process.env.MAX_IMPORT_ROWS || 1000})`
        });
      }

      // Create import job
      const job = await ImportJob.create({
        organizationId: orgId,
        createdBy: req.userId,
        fileName: req.file.originalname,
        status: 'pending',
        totalRows: rows.length
      });

      // Store file path temporarily for processing
      await job.update({
        settings: {
          ...job.settings,
          tempFilePath: req.file.path
        }
      });

      res.status(201).json({
        success: true,
        message: 'CSV uploaded successfully',
        data: {
          jobId: job.id,
          columns,
          suggestedMapping,
          rowCount: rows.length,
          preview: rows.slice(0, 5) // First 5 rows as preview
        }
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }

      console.error('Upload CSV error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload CSV',
        error: error.message
      });
    }
  }

  /**
   * Set column mapping and validate import
   */
  async setColumnMapping(req, res) {
    try {
      const { jobId } = req.params;
      const { columnMapping, settings } = req.body;

      const job = await ImportJob.findByPk(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Import job not found'
        });
      }

      if (job.organizationId !== req.organizationId && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Validate required mappings
      if (!columnMapping.email || !columnMapping.firstName || !columnMapping.lastName) {
        return res.status(400).json({
          success: false,
          message: 'Email, first name, and last name mappings are required'
        });
      }

      // Parse CSV with mapping
      const filePath = job.settings.tempFilePath;
      const rows = await csvParser.parseFile(filePath);

      // Validate rows
      const validation = csvParser.validateRows(rows, columnMapping);

      if (!validation.valid && !settings?.skipDuplicates) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          data: validation
        });
      }

      // Update job with column mapping and settings
      await job.update({
        columnMapping,
        settings: {
          ...job.settings,
          ...settings
        }
      });

      // Create import rows
      const importRows = validation.validatedData.map(rowData => ({
        importJobId: job.id,
        rowNumber: rowData.row,
        dataJson: {
          email: rowData.email,
          firstName: rowData.firstName,
          lastName: rowData.lastName,
          group: rowData.group,
          role: rowData.role
        },
        status: 'pending'
      }));

      await ImportRow.bulkCreate(importRows);

      // Update job totals
      await job.update({
        totalRows: validation.totalRows,
        successfulRows: validation.validRows,
        failedRows: validation.errorRows,
        validationErrors: validation.errors
      });

      // Validate against database
      const dbValidation = await importService.validateImportRows(job.id);

      // Clean up temp file
      await fs.unlink(filePath).catch(console.error);
      await job.update({
        settings: {
          ...job.settings,
          tempFilePath: null
        }
      });

      res.json({
        success: true,
        message: 'Column mapping set and validation complete',
        data: {
          jobId: job.id,
          validation: dbValidation
        }
      });
    } catch (error) {
      console.error('Set column mapping error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set column mapping',
        error: error.message
      });
    }
  }

  /**
   * Start processing import job
   */
  async processImport(req, res) {
    try {
      const { jobId } = req.params;

      const job = await ImportJob.findByPk(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Import job not found'
        });
      }

      if (job.organizationId !== req.organizationId && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      if (job.status !== 'validated') {
        return res.status(400).json({
          success: false,
          message: 'Import job must be validated before processing'
        });
      }

      // Process import asynchronously
      importService.processImportJob(jobId)
        .then(result => {
          console.log('Import job completed:', result);
        })
        .catch(error => {
          console.error('Import job failed:', error);
        });

      res.json({
        success: true,
        message: 'Import processing started',
        data: {
          jobId: job.id,
          status: 'processing'
        }
      });
    } catch (error) {
      console.error('Process import error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start import processing',
        error: error.message
      });
    }
  }

  /**
   * Get import job status
   */
  async getImportStatus(req, res) {
    try {
      const { jobId } = req.params;

      const job = await importService.getImportJobStatus(jobId);

      if (job.organizationId !== req.organizationId && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: { job }
      });
    } catch (error) {
      console.error('Get import status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get import status',
        error: error.message
      });
    }
  }

  /**
   * Get all import jobs for organization
   */
  async getOrganizationImports(req, res) {
    try {
      const { orgId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      const { count, rows: jobs } = await ImportJob.findAndCountAll({
        where: { organizationId: orgId },
        include: [{
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: {
          jobs,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get organization imports error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get import jobs',
        error: error.message
      });
    }
  }

  /**
   * Cancel import job
   */
  async cancelImport(req, res) {
    try {
      const { jobId } = req.params;

      const job = await ImportJob.findByPk(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Import job not found'
        });
      }

      if (job.organizationId !== req.organizationId && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      if (['completed', 'failed', 'cancelled'].includes(job.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel job in current status'
        });
      }

      await job.update({
        status: 'cancelled',
        completedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Import job cancelled',
        data: { job }
      });
    } catch (error) {
      console.error('Cancel import error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel import job',
        error: error.message
      });
    }
  }
}

module.exports = new ImportController();
