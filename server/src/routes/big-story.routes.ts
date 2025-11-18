import express from 'express';
import {
  listSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
  recordSectionView,
  getSectionMetrics,
  getSectionMetricsSummary,
} from '../controllers/big-story.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Big Story Overview Routes (Creation → New Creation)
 *
 * Public routes (authenticated users):
 * - List sections
 * - Get section details
 * - Record view metrics
 *
 * Admin routes:
 * - Create, update, delete sections
 * - View metrics
 */

// List all sections (public + org-specific)
router.get(
  '/',
  authenticate,
  listSections
);

// Get a specific section
router.get(
  '/:id',
  authenticate,
  getSection
);

// Create a new section (admin only)
router.post(
  '/',
  authenticate,
  requireOrgAdmin,
  createSection
);

// Update a section (admin only)
router.patch(
  '/:id',
  authenticate,
  requireOrgAdmin,
  updateSection
);

// Delete a section (admin only)
router.delete(
  '/:id',
  authenticate,
  requireOrgAdmin,
  deleteSection
);

// Record a section view (for metrics)
router.post(
  '/:id/view',
  authenticate,
  recordSectionView
);

// Get metrics for a section (admin only)
router.get(
  '/:id/metrics',
  authenticate,
  requireOrgAdmin,
  getSectionMetrics
);

// Get metrics summary across all sections (admin only)
router.get(
  '/metrics/summary',
  authenticate,
  requireOrgAdmin,
  getSectionMetricsSummary
);

export default router;
