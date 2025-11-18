import { Router } from 'express';
import {
  getParentOverview,
  getParentCalendar,
  linkChild,
  unlinkChild,
  getLinkedChildren,
  submitFeedback,
} from '../controllers/parent.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

/**
 * All routes require authentication and PARENT role
 */

// Parent overview dashboard
router.get('/overview', authenticate, requireRole('PARENT'), getParentOverview);

// Parent calendar view
router.get('/calendar', authenticate, requireRole('PARENT'), getParentCalendar);

// Child linking management
router.get('/children', authenticate, requireRole('PARENT'), getLinkedChildren);
router.post('/children', authenticate, requireRole('PARENT'), linkChild);
router.delete('/children/:childId', authenticate, requireRole('PARENT'), unlinkChild);

// Parent feedback
router.post('/feedback', authenticate, requireRole('PARENT'), submitFeedback);

export default router;
