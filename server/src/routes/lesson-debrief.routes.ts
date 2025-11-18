import express from 'express';
import { authenticate } from '../middleware/auth';
import * as debriefController from '../controllers/lesson-debrief.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new debrief for a lesson
router.post(
  '/lessons/:lessonId/debriefs',
  debriefController.createDebrief
);

// Get all debriefs for a lesson (with optional filters)
router.get(
  '/lessons/:lessonId/debriefs',
  debriefController.getDebriefs
);

// Get a specific debrief
router.get(
  '/debriefs/:id',
  debriefController.getDebrief
);

// Update a debrief
router.put(
  '/debriefs/:id',
  debriefController.updateDebrief
);

// Delete a debrief
router.delete(
  '/debriefs/:id',
  debriefController.deleteDebrief
);

export default router;
