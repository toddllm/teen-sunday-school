import express from 'express';
import {
  getSongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
  trackMetric,
  getMetrics,
  getStats,
} from '../controllers/song.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Song Routes
 * Public routes for viewing songs, admin routes for management
 */

// Public song endpoints (require authentication)
router.get('/', authenticate, getSongs);
router.get('/:id', authenticate, getSong);
router.post('/:id/metrics', trackMetric); // Can work without auth for anonymous tracking

// Admin song management endpoints
router.post('/', authenticate, requireOrgAdmin, createSong);
router.put('/:id', authenticate, requireOrgAdmin, updateSong);
router.delete('/:id', authenticate, requireOrgAdmin, deleteSong);

// Admin metrics endpoints
router.get('/admin/metrics', authenticate, requireOrgAdmin, getMetrics);
router.get('/admin/stats', authenticate, requireOrgAdmin, getStats);

export default router;
