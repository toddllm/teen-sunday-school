import express from 'express';
import {
  listTags,
  getTag,
  searchTags,
  createTag,
  updateTag,
  deleteTag,
  getTaxonomyHierarchy,
  getTagMetrics,
  getTagMetricsSummary,
  addTagToLesson,
  removeTagFromLesson,
  addTagToTheme,
  removeTagFromTheme,
  getLessonTags,
  getThemeTags,
} from '../controllers/tagging-taxonomy.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Tagging Taxonomy Manager Routes
 *
 * Public routes (authenticated users):
 * - List tags
 * - Get tag details
 * - Search tags
 * - Get taxonomy hierarchy
 * - Get tags for lessons/themes
 *
 * Admin routes:
 * - Create, update, delete tags
 * - Manage tag associations
 * - View metrics
 */

// ============================================================================
// PUBLIC ROUTES (Authenticated Users)
// ============================================================================

// List all tags (public + org-specific)
router.get(
  '/',
  authenticate,
  listTags
);

// Search tags by name or description
router.get(
  '/search',
  authenticate,
  searchTags
);

// Get taxonomy hierarchy (tree structure)
router.get(
  '/hierarchy',
  authenticate,
  getTaxonomyHierarchy
);

// Get a specific tag
router.get(
  '/:id',
  authenticate,
  getTag
);

// Get all tags for a specific lesson
router.get(
  '/lesson/:lessonId',
  authenticate,
  getLessonTags
);

// Get all tags for a specific theme
router.get(
  '/theme/:themeId',
  authenticate,
  getThemeTags
);

// ============================================================================
// ADMIN ROUTES (Organization Admins)
// ============================================================================

// Create a new tag
router.post(
  '/',
  authenticate,
  requireOrgAdmin,
  createTag
);

// Update a tag
router.patch(
  '/:id',
  authenticate,
  requireOrgAdmin,
  updateTag
);

// Delete a tag
router.delete(
  '/:id',
  authenticate,
  requireOrgAdmin,
  deleteTag
);

// Add tag to lesson
router.post(
  '/:id/lesson/:lessonId',
  authenticate,
  requireOrgAdmin,
  addTagToLesson
);

// Remove tag from lesson
router.delete(
  '/:id/lesson/:lessonId',
  authenticate,
  requireOrgAdmin,
  removeTagFromLesson
);

// Add tag to theme
router.post(
  '/:id/theme/:themeId',
  authenticate,
  requireOrgAdmin,
  addTagToTheme
);

// Remove tag from theme
router.delete(
  '/:id/theme/:themeId',
  authenticate,
  requireOrgAdmin,
  removeTagFromTheme
);

// Get metrics for a specific tag
router.get(
  '/:id/metrics',
  authenticate,
  requireOrgAdmin,
  getTagMetrics
);

// Get metrics summary across all tags
router.get(
  '/admin/metrics/summary',
  authenticate,
  requireOrgAdmin,
  getTagMetricsSummary
);

export default router;
