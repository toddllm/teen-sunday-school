import express from 'express';
import {
  listEntries,
  getTodayEntry,
  getStats,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
} from '../controllers/gratitude.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Daily Gratitude Log Routes
 *
 * All routes require authentication.
 * Users can only access their own gratitude entries.
 */

// Get today's gratitude entry (must come before /:id)
router.get(
  '/today',
  authenticate,
  getTodayEntry
);

// Get gratitude statistics
router.get(
  '/stats',
  authenticate,
  getStats
);

// List all gratitude entries for the current user
router.get(
  '/',
  authenticate,
  listEntries
);

// Get a specific gratitude entry
router.get(
  '/:id',
  authenticate,
  getEntry
);

// Create a new gratitude entry
router.post(
  '/',
  authenticate,
  createEntry
);

// Update a gratitude entry
router.patch(
  '/:id',
  authenticate,
  updateEntry
);

// Delete a gratitude entry
router.delete(
  '/:id',
  authenticate,
  deleteEntry
);

export default router;
