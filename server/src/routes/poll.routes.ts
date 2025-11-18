import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import * as pollController from '../controllers/poll.controller';

const router = express.Router();

// All poll routes require authentication
router.use(authenticate);

// Lesson-specific poll routes
router.post(
  '/lessons/:lessonId/polls',
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  pollController.createPoll
);
router.get('/lessons/:lessonId/polls', pollController.getLessonPolls);

// Poll management routes
router.get('/polls/:pollId', pollController.getPoll);
router.patch(
  '/polls/:pollId/activate',
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  pollController.activatePoll
);
router.patch(
  '/polls/:pollId/close',
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  pollController.closePoll
);
router.delete(
  '/polls/:pollId',
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  pollController.deletePoll
);

// Poll response routes (any authenticated user can respond)
router.post('/polls/:pollId/responses', pollController.submitPollResponse);
router.get('/polls/:pollId/results', pollController.getPollResults);

export default router;
