import express from 'express';
import {
  listComparisonNotes,
  getComparisonNote,
  createComparisonNote,
  updateComparisonNote,
  deleteComparisonNote,
  recordComparisonNoteView,
  getComparisonNoteMetrics,
  getComparisonNoteMetricsSummary,
} from '../controllers/translation-comparison.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Translation Comparison Notes Routes (Teen-Friendly)
 *
 * Public routes (authenticated users):
 * - List comparison notes
 * - Get note details
 * - Record view metrics
 *
 * Admin routes:
 * - Create, update, delete notes
 * - View metrics
 */

// Get metrics summary across all notes (admin only)
// NOTE: This must come before /:id to avoid matching "metrics" as an id
router.get(
  '/metrics/summary',
  authenticate,
  requireOrgAdmin,
  getComparisonNoteMetricsSummary
);

// List all comparison notes (public + org-specific)
router.get(
  '/',
  authenticate,
  listComparisonNotes
);

// Get a specific comparison note
router.get(
  '/:id',
  authenticate,
  getComparisonNote
);

// Create a new comparison note (admin only)
router.post(
  '/',
  authenticate,
  requireOrgAdmin,
  createComparisonNote
);

// Update a comparison note (admin only)
router.patch(
  '/:id',
  authenticate,
  requireOrgAdmin,
  updateComparisonNote
);

// Delete a comparison note (admin only)
router.delete(
  '/:id',
  authenticate,
  requireOrgAdmin,
  deleteComparisonNote
);

// Record a comparison note view (for metrics)
router.post(
  '/:id/view',
  authenticate,
  recordComparisonNoteView
);

// Get metrics for a specific note (admin only)
router.get(
  '/:id/metrics',
  authenticate,
  requireOrgAdmin,
  getComparisonNoteMetrics
);

export default router;
