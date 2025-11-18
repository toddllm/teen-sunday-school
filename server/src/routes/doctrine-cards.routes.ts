import express from 'express';
import {
  listDoctrineCards,
  getDoctrineCard,
  createDoctrineCard,
  updateDoctrineCard,
  deleteDoctrineCard,
  recordDoctrineCardView,
  getDoctrineCardMetrics,
  getDoctrineCardMetricsSummary,
} from '../controllers/doctrine-cards.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Doctrine Cards Routes
 *
 * Public routes (authenticated users):
 * - List doctrine cards
 * - Get doctrine card details
 * - Record view metrics
 *
 * Admin routes:
 * - Create, update, delete doctrine cards
 * - View metrics
 */

// Get metrics summary across all doctrine cards (admin only)
// NOTE: This must come BEFORE /:id route to avoid conflict
router.get(
  '/metrics/summary',
  authenticate,
  requireOrgAdmin,
  getDoctrineCardMetricsSummary
);

// List all doctrine cards (public + org-specific)
router.get(
  '/',
  authenticate,
  listDoctrineCards
);

// Get a specific doctrine card
router.get(
  '/:id',
  authenticate,
  getDoctrineCard
);

// Create a new doctrine card (admin only)
router.post(
  '/',
  authenticate,
  requireOrgAdmin,
  createDoctrineCard
);

// Update a doctrine card (admin only)
router.patch(
  '/:id',
  authenticate,
  requireOrgAdmin,
  updateDoctrineCard
);

// Delete a doctrine card (admin only)
router.delete(
  '/:id',
  authenticate,
  requireOrgAdmin,
  deleteDoctrineCard
);

// Record a doctrine card view (for metrics)
router.post(
  '/:id/view',
  authenticate,
  recordDoctrineCardView
);

// Get metrics for a doctrine card (admin only)
router.get(
  '/:id/metrics',
  authenticate,
  requireOrgAdmin,
  getDoctrineCardMetrics
);

export default router;
