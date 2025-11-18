import express from 'express';
import { authenticate, requireLeaderOrAdmin } from '../middleware/auth';
import * as questionController from '../controllers/question.controller';

const router = express.Router();

// Public endpoint - submit anonymous question (no auth required)
router.post('/groups/:groupId/questions', questionController.submitQuestion);

// Admin endpoints - require authentication and leader/admin role
router.get(
  '/admin/questions',
  authenticate,
  requireLeaderOrAdmin,
  questionController.getQuestionsForAdmin
);

router.get(
  '/admin/questions/stats',
  authenticate,
  requireLeaderOrAdmin,
  questionController.getStats
);

router.get(
  '/admin/questions/:id',
  authenticate,
  requireLeaderOrAdmin,
  questionController.getQuestionById
);

router.put(
  '/admin/questions/:id/answer',
  authenticate,
  requireLeaderOrAdmin,
  questionController.markAsAnswered
);

router.put(
  '/admin/questions/:id/status',
  authenticate,
  requireLeaderOrAdmin,
  questionController.updateQuestionStatus
);

router.delete(
  '/admin/questions/:id',
  authenticate,
  requireLeaderOrAdmin,
  questionController.deleteQuestion
);

export default router;
