import express from 'express';
import {
  listThemes,
  getTheme,
  createTheme,
  updateTheme,
  deleteTheme,
  recordThemeView,
  getThemeMetrics,
  getThemeMetricsSummary,
} from '../controllers/theme-comparison.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Comparative Theme View Routes (OT vs NT)
 *
 * Public routes (authenticated users):
 * - List themes
 * - Get theme details
 * - Record view metrics
 *
 * Admin routes:
 * - Create, update, delete themes
 * - View metrics
 */

// List all themes (public + org-specific)
router.get(
  '/',
  authenticate,
  listThemes
);

// Get a specific theme
router.get(
  '/:id',
  authenticate,
  getTheme
);

// Create a new theme (admin only)
router.post(
  '/',
  authenticate,
  requireOrgAdmin,
  createTheme
);

// Update a theme (admin only)
router.patch(
  '/:id',
  authenticate,
  requireOrgAdmin,
  updateTheme
);

// Delete a theme (admin only)
router.delete(
  '/:id',
  authenticate,
  requireOrgAdmin,
  deleteTheme
);

// Record a theme view (for metrics)
router.post(
  '/:id/view',
  authenticate,
  recordThemeView
);

// Get metrics for a theme (admin only)
router.get(
  '/:id/metrics',
  authenticate,
  requireOrgAdmin,
  getThemeMetrics
);

// Get metrics summary across all themes (admin only)
router.get(
  '/metrics/summary',
  authenticate,
  requireOrgAdmin,
  getThemeMetricsSummary
);

export default router;
