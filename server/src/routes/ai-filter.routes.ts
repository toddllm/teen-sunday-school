import express from 'express';
import {
  getFilterConfig,
  updateFilterConfig,
  getFilterMetrics,
  getFilterMetricsSummary,
  updateMetric,
  getFilterCategories,
} from '../controllers/ai-filter.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * AI Filter Routes
 * All routes require authentication and admin privileges
 */

// Get available categories and actions
router.get(
  '/categories',
  authenticate,
  requireOrgAdmin,
  getFilterCategories
);

// Get filter configuration
router.get(
  '/',
  authenticate,
  requireOrgAdmin,
  getFilterConfig
);

// Update filter configuration
router.patch(
  '/',
  authenticate,
  requireOrgAdmin,
  updateFilterConfig
);

// Get filter metrics
router.get(
  '/metrics',
  authenticate,
  requireOrgAdmin,
  getFilterMetrics
);

// Get metrics summary
router.get(
  '/metrics/summary',
  authenticate,
  requireOrgAdmin,
  getFilterMetricsSummary
);

// Update a specific metric
router.patch(
  '/metrics/:metricId',
  authenticate,
  requireOrgAdmin,
  updateMetric
);

export default router;
