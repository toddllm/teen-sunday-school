import express from 'express';
import { authenticate, requireOrgAdmin } from '../middleware/auth';
import * as notificationController from '../controllers/notification.controller';
import * as notificationPreferenceController from '../controllers/notification-preference.controller';

const router = express.Router();

// ============================================================================
// NOTIFICATION PREFERENCES (all authenticated users)
// ============================================================================

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
router.get(
  '/preferences',
  authenticate,
  notificationPreferenceController.getPreferences
);

/**
 * PUT /api/notifications/preferences
 * Update user's notification preferences
 */
router.put(
  '/preferences',
  authenticate,
  notificationPreferenceController.updatePreferences
);

/**
 * POST /api/notifications/preferences/reset
 * Reset user's notification preferences to defaults
 */
router.post(
  '/preferences/reset',
  authenticate,
  notificationPreferenceController.resetPreferences
);

/**
 * GET /api/notifications/preferences/stats
 * Get notification statistics for user
 */
router.get(
  '/preferences/stats',
  authenticate,
  notificationPreferenceController.getNotificationStats
);

// ============================================================================
// NOTIFICATIONS (all authenticated users)
// ============================================================================

/**
 * GET /api/notifications
 * Get user's notifications
 * Query params: limit, offset, unreadOnly
 */
router.get(
  '/',
  authenticate,
  notificationController.getNotifications
);

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get(
  '/unread-count',
  authenticate,
  notificationController.getUnreadCount
);

/**
 * POST /api/notifications/test
 * Send test notification
 */
router.post(
  '/test',
  authenticate,
  notificationController.sendTestNotification
);

/**
 * PUT /api/notifications/:notificationId/read
 * Mark notification as read
 */
router.put(
  '/:notificationId/read',
  authenticate,
  notificationController.markAsRead
);

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read
 */
router.post(
  '/mark-all-read',
  authenticate,
  notificationController.markAllAsRead
);

/**
 * DELETE /api/notifications/:notificationId
 * Delete notification
 */
router.delete(
  '/:notificationId',
  authenticate,
  notificationController.deleteNotification
);

// ============================================================================
// ADMIN ONLY - CREATE NOTIFICATIONS
// ============================================================================

/**
 * POST /api/notifications
 * Create a new notification (admin only)
 */
router.post(
  '/',
  authenticate,
  requireOrgAdmin,
  notificationController.createNotification
);

export default router;
