import express from 'express';
import {
  recordAttendance,
  recordBulkAttendance,
  getGroupAttendance,
  getGroupAttendanceStats,
  getStudentPattern,
  recalculatePattern,
  getFollowUpSuggestions,
  getFollowUpSuggestion,
  updateFollowUpSuggestion,
  dismissFollowUpSuggestion,
  getDashboardOverview,
} from '../controllers/attendance.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Attendance Routes
 * Most routes require authentication; some require admin privileges
 */

// Dashboard overview
router.get(
  '/dashboard',
  authenticate,
  requireOrgAdmin,
  getDashboardOverview
);

// Record attendance
router.post(
  '/record',
  authenticate,
  requireOrgAdmin,
  recordAttendance
);

// Record bulk attendance
router.post(
  '/record-bulk',
  authenticate,
  requireOrgAdmin,
  recordBulkAttendance
);

// Get group attendance records
router.get(
  '/group/:groupId',
  authenticate,
  getGroupAttendance
);

// Get group attendance statistics
router.get(
  '/group/:groupId/stats',
  authenticate,
  getGroupAttendanceStats
);

// Get student attendance pattern
router.get(
  '/patterns/:userId/:groupId',
  authenticate,
  getStudentPattern
);

// Recalculate student attendance pattern
router.post(
  '/patterns/:userId/:groupId/recalculate',
  authenticate,
  requireOrgAdmin,
  recalculatePattern
);

// Follow-up suggestions
router.get(
  '/follow-ups',
  authenticate,
  requireOrgAdmin,
  getFollowUpSuggestions
);

// Get specific follow-up suggestion
router.get(
  '/follow-ups/:suggestionId',
  authenticate,
  requireOrgAdmin,
  getFollowUpSuggestion
);

// Update follow-up suggestion
router.patch(
  '/follow-ups/:suggestionId',
  authenticate,
  requireOrgAdmin,
  updateFollowUpSuggestion
);

// Dismiss follow-up suggestion
router.delete(
  '/follow-ups/:suggestionId',
  authenticate,
  requireOrgAdmin,
  dismissFollowUpSuggestion
);

export default router;
