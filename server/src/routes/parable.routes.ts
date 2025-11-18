import express from 'express';
import {
  listParables,
  getParable,
  createParable,
  updateParable,
  deleteParable,
  recordParableView,
  getParableMetrics,
  getParableMetricsSummary,
} from '../controllers/parable.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Parables Explorer Routes
 *
 * Public routes (authenticated users):
 * - List parables
 * - Get parable details
 * - Record view metrics
 *
 * Admin routes:
 * - Create, update, delete parables
 * - View metrics
 */

// List all parables (public + org-specific)
router.get(
  '/',
  authenticate,
  listParables
);

// Get a specific parable
router.get(
  '/:id',
  authenticate,
  getParable
);

// Create a new parable (admin only)
router.post(
  '/',
  authenticate,
  requireOrgAdmin,
  createParable
);

// Update a parable (admin only)
router.patch(
  '/:id',
  authenticate,
  requireOrgAdmin,
  updateParable
);

// Delete a parable (admin only)
router.delete(
  '/:id',
  authenticate,
  requireOrgAdmin,
  deleteParable
);

// Record a parable view (for metrics)
router.post(
  '/:id/view',
  authenticate,
  recordParableView
);

// Get metrics for a parable (admin only)
router.get(
  '/:id/metrics',
  authenticate,
  requireOrgAdmin,
  getParableMetrics
);

// Get metrics summary across all parables (admin only)
router.get(
  '/metrics/summary',
  authenticate,
  requireOrgAdmin,
  getParableMetricsSummary
);

export default router;
