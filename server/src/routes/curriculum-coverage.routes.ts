import express from 'express';
import {
  recordCoverage,
  updateCoverage,
  deleteCoverage,
  getCoverageReport,
  getCoverageSummary,
  recordReportView,
  getReportMetrics,
} from '../controllers/curriculum-coverage.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Curriculum Coverage Reporting Routes
 *
 * Admin routes:
 * - Record, update, delete coverage
 * - Get coverage reports and summaries
 * - View metrics
 */

// Get coverage report (admin only)
router.get(
  '/report',
  authenticate,
  requireOrgAdmin,
  getCoverageReport
);

// Get coverage summary (admin only)
router.get(
  '/summary',
  authenticate,
  requireOrgAdmin,
  getCoverageSummary
);

// Get report metrics (admin only)
router.get(
  '/metrics',
  authenticate,
  requireOrgAdmin,
  getReportMetrics
);

// Record a coverage entry (admin only)
router.post(
  '/',
  authenticate,
  requireOrgAdmin,
  recordCoverage
);

// Update a coverage entry (admin only)
router.patch(
  '/:id',
  authenticate,
  requireOrgAdmin,
  updateCoverage
);

// Delete a coverage entry (admin only)
router.delete(
  '/:id',
  authenticate,
  requireOrgAdmin,
  deleteCoverage
);

// Record a report view (for metrics)
router.post(
  '/report/view',
  authenticate,
  requireOrgAdmin,
  recordReportView
);

export default router;
