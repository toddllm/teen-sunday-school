import { Request, Response } from 'express';
import logger from '../config/logger';
import { NotificationService } from '../services/notification.service';
import { NotificationType, NotificationDeliveryMethod, NotificationPriority } from '@prisma/client';

const notificationService = new NotificationService();

/**
 * Get user's notifications
 */
export async function getNotifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const unreadOnly = req.query.unreadOnly === 'true';

    const notifications = await notificationService.getUserNotifications(userId, {
      limit,
      offset,
      unreadOnly,
    });

    res.status(200).json(notifications);
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;

    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({ count });
  } catch (error) {
    logger.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
}

/**
 * Create a new notification (admin only)
 */
export async function createNotification(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = (req as any).user.organizationId;
    const {
      userId,
      type,
      title,
      message,
      actionUrl,
      deliveryMethod,
      priority,
      scheduledFor,
      groupId,
      lessonId,
      eventId,
      metadata,
    } = req.body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      res.status(400).json({ error: 'userId, type, title, and message are required' });
      return;
    }

    // Validate enum values
    if (!Object.values(NotificationType).includes(type)) {
      res.status(400).json({ error: 'Invalid notification type' });
      return;
    }

    if (deliveryMethod && !Object.values(NotificationDeliveryMethod).includes(deliveryMethod)) {
      res.status(400).json({ error: 'Invalid delivery method' });
      return;
    }

    if (priority && !Object.values(NotificationPriority).includes(priority)) {
      res.status(400).json({ error: 'Invalid priority' });
      return;
    }

    const notification = await notificationService.createNotification({
      userId,
      organizationId,
      type,
      title,
      message,
      actionUrl,
      deliveryMethod,
      priority,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      groupId,
      lessonId,
      eventId,
      metadata,
    });

    res.status(201).json(notification);
  } catch (error) {
    logger.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;
    const { notificationId } = req.params;

    if (!notificationId) {
      res.status(400).json({ error: 'notificationId is required' });
      return;
    }

    const notification = await notificationService.markAsRead(notificationId, userId);

    res.status(200).json(notification);
  } catch (error: any) {
    logger.error('Error marking notification as read:', error);

    // Handle not found error
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;

    const count = await notificationService.markAllAsRead(userId);

    res.status(200).json({ count, message: `Marked ${count} notifications as read` });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;
    const { notificationId } = req.params;

    if (!notificationId) {
      res.status(400).json({ error: 'notificationId is required' });
      return;
    }

    await notificationService.deleteNotification(notificationId, userId);

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting notification:', error);

    // Handle not found error
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    res.status(500).json({ error: 'Failed to delete notification' });
  }
}

/**
 * Send test notification
 */
export async function sendTestNotification(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;
    const organizationId = (req as any).user.organizationId;

    const notification = await notificationService.createNotification({
      userId,
      organizationId,
      type: 'CUSTOM',
      title: 'Test Notification',
      message: 'This is a test notification to verify your notification settings are working correctly.',
      priority: 'NORMAL',
    });

    res.status(200).json({
      message: 'Test notification sent',
      notification,
    });
  } catch (error) {
    logger.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
}
