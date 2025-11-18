import express from 'express';
import { authenticate, requireRole, requireOrgAdmin } from '../middleware/auth';
import * as seriesController from '../controllers/series.controller';

const router = express.Router();

// Public/Member routes (require authentication)
router.get('/series', authenticate, seriesController.getAllSeries);
router.get('/series/:id', authenticate, seriesController.getSeriesById);
router.post(
  '/series/:id/complete/:lessonId',
  authenticate,
  seriesController.completeSeriesLesson
);

// Admin/Teacher routes (require elevated permissions)
router.post(
  '/admin/series',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  seriesController.createSeries
);

router.patch(
  '/admin/series/:id',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  seriesController.updateSeries
);

router.delete(
  '/admin/series/:id',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  seriesController.deleteSeries
);

router.put(
  '/admin/series/:id/lessons',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  seriesController.updateSeriesLessons
);

// Metrics (Admin only)
router.get(
  '/admin/series/metrics',
  authenticate,
  requireOrgAdmin,
  seriesController.getSeriesMetrics
);

export default router;
