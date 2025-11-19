import express from 'express';
import {
  getTodaysProverb,
  getRandomProverb,
  listProverbs,
  getProverb,
  createProverb,
  updateProverb,
  deleteProverb,
  recordView,
  recordInteraction,
  getProverbStats,
  getProverbsByCategory,
} from '../controllers/proverb.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Proverb of the Day Routes
 *
 * Public routes (authenticated users):
 * - Get today's proverb
 * - Get random proverb
 * - List proverbs
 * - Get proverb details
 * - Record views and interactions
 * - Get proverbs by category
 *
 * Admin routes:
 * - Create, update, delete proverbs
 * - View detailed stats
 */

// Get today's proverb
router.get(
  '/today',
  authenticate,
  getTodaysProverb
);

// Get a random proverb
router.get(
  '/random',
  authenticate,
  getRandomProverb
);

// Get proverbs by category
router.get(
  '/category/:category',
  authenticate,
  getProverbsByCategory
);

// Get engagement stats for a proverb
router.get(
  '/:id/stats',
  authenticate,
  getProverbStats
);

// List all proverbs (with filtering and pagination)
router.get(
  '/',
  authenticate,
  listProverbs
);

// Get a specific proverb
router.get(
  '/:id',
  authenticate,
  getProverb
);

// Create a new proverb (admin only)
router.post(
  '/',
  authenticate,
  requireOrgAdmin,
  createProverb
);

// Update a proverb (admin only)
router.patch(
  '/:id',
  authenticate,
  requireOrgAdmin,
  updateProverb
);

// Delete a proverb (admin only)
router.delete(
  '/:id',
  authenticate,
  requireOrgAdmin,
  deleteProverb
);

// Record a proverb view (for engagement metrics)
router.post(
  '/:id/view',
  authenticate,
  recordView
);

// Record a proverb interaction (like, share, bookmark, etc.)
router.post(
  '/:id/interact',
  authenticate,
  recordInteraction
);

export default router;
