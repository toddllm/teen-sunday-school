import express from 'express';
import {
  listComics,
  getTemplates,
  getComic,
  createComic,
  updateComic,
  deleteComic,
  trackMetric,
} from '../controllers/comic.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Comic Storyboard Routes
 *
 * Authenticated user routes:
 * - List comics
 * - Get templates
 * - Get specific comic
 * - Create new comic
 * - Update own comic
 * - Delete own comic
 * - Track usage metrics
 */

// List comics with filters
router.get(
  '/',
  authenticate,
  listComics
);

// Get public comic templates
router.get(
  '/templates',
  authenticate,
  getTemplates
);

// Get a specific comic by ID
router.get(
  '/:id',
  authenticate,
  getComic
);

// Create a new comic
router.post(
  '/',
  authenticate,
  createComic
);

// Update an existing comic (user must be creator)
router.patch(
  '/:id',
  authenticate,
  updateComic
);

// Delete a comic (user must be creator)
router.delete(
  '/:id',
  authenticate,
  deleteComic
);

// Track comic metric (view, download, share)
router.post(
  '/:id/track',
  authenticate,
  trackMetric
);

export default router;
