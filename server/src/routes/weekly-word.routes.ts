import express from 'express';
import {
  getCurrentWord,
  getWordArchive,
  getWordById,
  trackWordInteraction,
  createWord,
  updateWord,
  deleteWord,
  getWordMetrics,
} from '../controllers/weekly-word.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Weekly Word Routes
 * Public routes for users, admin routes for content management
 */

// ============================================================================
// USER ROUTES (authenticated)
// ============================================================================

// Get current week's word
router.get(
  '/current',
  authenticate,
  getCurrentWord
);

// Get word archive
router.get(
  '/archive',
  authenticate,
  getWordArchive
);

// Get specific word by ID
router.get(
  '/:id',
  authenticate,
  getWordById
);

// Track interaction (verse click, share, etc.)
router.post(
  '/:id/track',
  authenticate,
  trackWordInteraction
);

// ============================================================================
// ADMIN ROUTES (require admin privileges)
// ============================================================================

// Get metrics
router.get(
  '/admin/metrics',
  authenticate,
  requireOrgAdmin,
  getWordMetrics
);

// Create new word
router.post(
  '/admin',
  authenticate,
  requireOrgAdmin,
  createWord
);

// Update word
router.put(
  '/admin/:id',
  authenticate,
  requireOrgAdmin,
  updateWord
);

// Delete word (soft delete)
router.delete(
  '/admin/:id',
  authenticate,
  requireOrgAdmin,
  deleteWord
);

export default router;
