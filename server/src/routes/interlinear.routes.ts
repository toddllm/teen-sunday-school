import express from 'express';
import {
  getInterlinearVerse,
  getKeyVerses,
  trackInteraction,
  getMetrics,
  seedKeyVerses,
} from '../controllers/interlinear.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Interlinear Bible Routes
 * Provides simplified interlinear views for curated key verses
 */

// Public routes (no authentication required for reading)
// Get all key verses
router.get('/interlinear', getKeyVerses);

// Get interlinear data for a specific verse
router.get('/interlinear/:verseRef', getInterlinearVerse);

// Authenticated routes
// Track user interaction (optional auth - tracks if authenticated)
router.post('/interlinear/:verseRef/track', authenticate, trackInteraction);

// Admin routes
// Get metrics
router.get(
  '/admin/interlinear/metrics',
  authenticate,
  requireOrgAdmin,
  getMetrics
);

// Seed key verses
router.post(
  '/admin/interlinear/seed',
  authenticate,
  requireOrgAdmin,
  seedKeyVerses
);

export default router;
