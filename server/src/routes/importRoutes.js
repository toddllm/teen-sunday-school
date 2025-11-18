const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');
const { authenticate, isOrgAdmin } = require('../middleware/auth');
const { importLimiter } = require('../middleware/rateLimiter');

// All routes require authentication and org admin role
router.use(authenticate);

// Upload CSV file
router.post(
  '/orgs/:orgId/user-imports',
  isOrgAdmin,
  importLimiter,
  importController.getUploadMiddleware(),
  importController.uploadCSV
);

// Set column mapping and validate
router.post(
  '/orgs/:orgId/user-imports/:jobId/mapping',
  isOrgAdmin,
  importController.setColumnMapping
);

// Start processing import
router.post(
  '/orgs/:orgId/user-imports/:jobId/process',
  isOrgAdmin,
  importController.processImport
);

// Get import job status
router.get(
  '/orgs/:orgId/user-imports/:jobId',
  isOrgAdmin,
  importController.getImportStatus
);

// Get all import jobs for organization
router.get(
  '/orgs/:orgId/user-imports',
  isOrgAdmin,
  importController.getOrganizationImports
);

// Cancel import job
router.delete(
  '/orgs/:orgId/user-imports/:jobId',
  isOrgAdmin,
  importController.cancelImport
);

module.exports = router;
