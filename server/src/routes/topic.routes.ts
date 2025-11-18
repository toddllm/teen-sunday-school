import express from 'express';
import { authenticate, requireOrgAdmin } from '../middleware/auth';
import * as topicController from '../controllers/topic.controller';

const router = express.Router();

// Public routes (no authentication required)
router.get('/topics', topicController.listTopics);
router.get('/topics/categories', topicController.getCategories);

// Authenticated routes (read-only)
router.get('/topics/:id', authenticate, topicController.getTopic);
router.post('/topics/:id/plan-start', authenticate, topicController.trackPlanStart);

// Admin routes (requires org admin)
router.post('/topics', authenticate, requireOrgAdmin, topicController.createTopic);
router.put('/topics/:id', authenticate, requireOrgAdmin, topicController.updateTopic);
router.delete('/topics/:id', authenticate, requireOrgAdmin, topicController.deleteTopic);

// Verse management (admin only)
router.post('/topics/:id/verses', authenticate, requireOrgAdmin, topicController.addVerse);
router.put('/topics/verses/:verseId', authenticate, requireOrgAdmin, topicController.updateVerse);
router.delete('/topics/verses/:verseId', authenticate, requireOrgAdmin, topicController.deleteVerse);

// Metrics (admin only)
router.get('/topics/:id/metrics', authenticate, requireOrgAdmin, topicController.getTopicMetrics);

export default router;
