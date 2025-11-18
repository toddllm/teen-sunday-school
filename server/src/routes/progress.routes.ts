import express from 'express';
import {
  getGroupProgress,
  getLessonProgress,
  getGroupAttendance,
  getProgressTimeline,
  recordProgress,
  recordAttendance,
  getGroupAnalytics,
  getStudentProgress,
} from '../controllers/progress.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Cohort Progress Tracking Routes
 *
 * Teacher/Admin routes:
 * - View group progress
 * - View lesson-specific progress
 * - View attendance records
 * - View analytics
 * - Record progress
 * - Record attendance
 *
 * Student routes:
 * - View own progress
 */

// Get overall group progress (teachers/admins can view)
router.get(
  '/groups/:groupId/progress',
  authenticate,
  getGroupProgress
);

// Get progress for a specific lesson in a group
router.get(
  '/groups/:groupId/lessons/:lessonId/progress',
  authenticate,
  getLessonProgress
);

// Get attendance records for a group
router.get(
  '/groups/:groupId/attendance',
  authenticate,
  getGroupAttendance
);

// Get historical progress timeline for a group
router.get(
  '/groups/:groupId/progress/timeline',
  authenticate,
  getProgressTimeline
);

// Get comprehensive analytics for a group (admin only)
router.get(
  '/groups/:groupId/analytics',
  authenticate,
  requireOrgAdmin,
  getGroupAnalytics
);

// Record lesson progress (teachers/students can record)
router.post(
  '/progress',
  authenticate,
  recordProgress
);

// Record attendance (teachers/admins can record)
router.post(
  '/attendance',
  authenticate,
  recordAttendance
);

// Get progress for a specific student
router.get(
  '/students/:userId/progress',
  authenticate,
  getStudentProgress
);

export default router;
