import express from 'express';
import { authenticate } from '../middleware/auth';
import * as bibleController from '../controllers/bible.controller';

const router = express.Router();

// Timeline routes (public)
router.get('/timeline/chronological', bibleController.getChronologicalTimeline);
router.get('/timeline/events/:id', bibleController.getTimelineEvent);

// User reading plan routes (authenticated)
router.post('/me/plans/chronological/start', authenticate, bibleController.startChronologicalPlan);
router.get('/me/plans/chronological/progress', authenticate, bibleController.getChronologicalProgress);
router.post('/me/plans/:planId/progress', authenticate, bibleController.updatePlanProgress);

// Admin metrics (authenticated - should add admin check in production)
router.get('/admin/metrics/chronological-plan', authenticate, bibleController.getChronologicalPlanMetrics);

export default router;
