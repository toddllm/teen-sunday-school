import {
  Notification,
  NotificationType,
  NotificationDeliveryMethod,
  NotificationPriority,
  NotificationStatus,
} from '@prisma/client';
import prisma from '../config/database';
import logger from '../config/logger';
import { NotificationPreferenceService } from './notification-preference.service';
import { EmailService } from './email.service';

export interface CreateNotificationDto {
  userId: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  deliveryMethod?: NotificationDeliveryMethod;
  priority?: NotificationPriority;
  scheduledFor?: Date;
  groupId?: string;
  lessonId?: string;
  eventId?: string;
  metadata?: any;
}

export interface SendNotificationResult {
  success: boolean;
  notification?: Notification;
  error?: string;
  emailSent?: boolean;
  inAppCreated?: boolean;
}

export class NotificationService {
  private preferenceService: NotificationPreferenceService;
  private emailService: EmailService;

  constructor() {
    this.preferenceService = new NotificationPreferenceService();
    this.emailService = new EmailService();
  }

  /**
   * Create and optionally send a notification
   */
  async createNotification(
    data: CreateNotificationDto
  ): Promise<Notification> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          organizationId: data.organizationId,
          type: data.type,
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
          deliveryMethod: data.deliveryMethod || 'BOTH',
          priority: data.priority || 'NORMAL',
          scheduledFor: data.scheduledFor,
          status: data.scheduledFor ? 'SCHEDULED' : 'PENDING',
          groupId: data.groupId,
          lessonId: data.lessonId,
          eventId: data.eventId,
          metadata: data.metadata,
        },
      });

      logger.info(`Created notification ${notification.id} for user ${data.userId}`);

      // Send immediately if not scheduled
      if (!data.scheduledFor) {
        await this.sendNotification(notification.id);
      }

      return notification;
    } catch (error: any) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send a notification (email and/or in-app)
   */
  async sendNotification(notificationId: string): Promise<SendNotificationResult> {
    const result: SendNotificationResult = {
      success: false,
      emailSent: false,
      inAppCreated: false,
    };

    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        include: {
          user: true,
        },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      // Check if already sent
      if (notification.status === 'SENT' || notification.status === 'DELIVERED') {
        return { success: true, notification };
      }

      // Update status to SENDING
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'SENDING' },
      });

      // Check user preferences and quiet hours
      const canSend = await this.canSendNotification(notification);
      if (!canSend) {
        // Reschedule for later (after quiet hours)
        await this.rescheduleNotification(notification);
        return { success: false, error: 'User in quiet hours or daily limit reached' };
      }

      const deliveryStatus: any = {};
      let hasError = false;

      // Send email if configured
      if (
        notification.deliveryMethod === 'EMAIL' ||
        notification.deliveryMethod === 'BOTH'
      ) {
        const shouldSendEmail = await this.preferenceService.shouldReceiveNotification(
          notification.userId,
          notification.type,
          'email'
        );

        if (shouldSendEmail) {
          try {
            await this.emailService.sendNotificationEmail(
              notification.user.email,
              notification.title,
              notification.message,
              notification.actionUrl
            );
            deliveryStatus.email = { status: 'sent', sentAt: new Date() };
            result.emailSent = true;
          } catch (error: any) {
            logger.error(`Error sending email for notification ${notificationId}:`, error);
            deliveryStatus.email = { status: 'failed', error: error.message };
            hasError = true;
          }
        } else {
          deliveryStatus.email = { status: 'skipped', reason: 'user_preference' };
        }
      }

      // In-app notification is created in database
      if (
        notification.deliveryMethod === 'IN_APP' ||
        notification.deliveryMethod === 'BOTH'
      ) {
        const shouldSendInApp = await this.preferenceService.shouldReceiveNotification(
          notification.userId,
          notification.type,
          'inApp'
        );

        if (shouldSendInApp) {
          deliveryStatus.inApp = { status: 'delivered', deliveredAt: new Date() };
          result.inAppCreated = true;
        } else {
          deliveryStatus.inApp = { status: 'skipped', reason: 'user_preference' };
        }
      }

      // Update notification status
      const finalStatus: NotificationStatus = hasError ? 'FAILED' : 'SENT';
      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: finalStatus,
          sentAt: new Date(),
          deliveryStatus,
          failureReason: hasError ? 'Partial delivery failure' : null,
        },
      });

      result.success = !hasError;
      result.notification = updatedNotification;

      logger.info(`Notification ${notificationId} sent with status: ${finalStatus}`);
      return result;
    } catch (error: any) {
      logger.error(`Error sending notification ${notificationId}:`, error);

      // Update notification as failed
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'FAILED',
          failureReason: error.message,
          retryCount: { increment: 1 },
        },
      });

      result.error = error.message;
      return result;
    }
  }

  /**
   * Check if notification can be sent based on user preferences
   */
  private async canSendNotification(notification: Notification): Promise<boolean> {
    try {
      // Check quiet hours
      const inQuietHours = await this.preferenceService.isInQuietHours(notification.userId);
      if (inQuietHours && notification.priority !== 'URGENT') {
        return false;
      }

      // Check preferred days
      const isPreferredDay = await this.preferenceService.isPreferredDay(notification.userId);
      if (!isPreferredDay && notification.priority !== 'URGENT') {
        return false;
      }

      // Check daily limit
      const reachedLimit = await this.preferenceService.hasReachedDailyLimit(
        notification.userId
      );
      if (reachedLimit && notification.priority !== 'URGENT') {
        return false;
      }

      return true;
    } catch (error: any) {
      logger.error('Error checking if notification can be sent:', error);
      // Fail open - allow sending if there's an error
      return true;
    }
  }

  /**
   * Reschedule notification for after quiet hours
   */
  private async rescheduleNotification(notification: Notification): Promise<void> {
    try {
      const preferences = await this.preferenceService.getUserPreferences(notification.userId);

      let scheduledFor = new Date();

      // If in quiet hours, schedule for end of quiet hours
      if (preferences.quietHoursEnabled && preferences.quietHoursEnd) {
        const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number);
        scheduledFor.setHours(endHour, endMinute, 0, 0);

        // If the end time has already passed today, schedule for tomorrow
        if (scheduledFor < new Date()) {
          scheduledFor.setDate(scheduledFor.getDate() + 1);
        }
      } else {
        // Otherwise, schedule for 1 hour from now
        scheduledFor.setHours(scheduledFor.getHours() + 1);
      }

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          scheduledFor,
          status: 'SCHEDULED',
        },
      });

      logger.info(`Rescheduled notification ${notification.id} for ${scheduledFor}`);
    } catch (error: any) {
      logger.error(`Error rescheduling notification ${notification.id}:`, error);
    }
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    }
  ): Promise<Notification[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          readAt: options?.unreadOnly ? null : undefined,
          status: {
            in: ['SENT', 'DELIVERED', 'READ'],
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      });

      return notifications;
    } catch (error: any) {
      logger.error(`Error fetching notifications for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId, // Ensure user owns this notification
        },
        data: {
          readAt: new Date(),
          status: 'READ',
        },
      });

      logger.info(`Marked notification ${notificationId} as read`);
      return notification;
    } catch (error: any) {
      logger.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          readAt: null,
        },
        data: {
          readAt: new Date(),
          status: 'READ',
        },
      });

      logger.info(`Marked ${result.count} notifications as read for user ${userId}`);
      return result.count;
    } catch (error: any) {
      logger.error(`Error marking all notifications as read for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          readAt: null,
          status: {
            in: ['SENT', 'DELIVERED'],
          },
        },
      });

      return count;
    } catch (error: any) {
      logger.error(`Error getting unread count for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Process pending notifications (called by scheduler)
   */
  async processPendingNotifications(): Promise<void> {
    try {
      const now = new Date();

      // Get all scheduled notifications that are due
      const notifications = await prisma.notification.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledFor: {
            lte: now,
          },
        },
        take: 100, // Process in batches
      });

      logger.info(`Processing ${notifications.length} scheduled notifications`);

      for (const notification of notifications) {
        try {
          await this.sendNotification(notification.id);
        } catch (error: any) {
          logger.error(`Error processing notification ${notification.id}:`, error);
          // Continue with other notifications
        }
      }
    } catch (error: any) {
      logger.error('Error processing pending notifications:', error);
    }
  }

  /**
   * Retry failed notifications
   */
  async retryFailedNotifications(): Promise<void> {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          status: 'FAILED',
          retryCount: {
            lt: prisma.notification.fields.maxRetries,
          },
        },
        take: 50,
      });

      logger.info(`Retrying ${notifications.length} failed notifications`);

      for (const notification of notifications) {
        try {
          await this.sendNotification(notification.id);
        } catch (error: any) {
          logger.error(`Error retrying notification ${notification.id}:`, error);
        }
      }
    } catch (error: any) {
      logger.error('Error retrying failed notifications:', error);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.notification.delete({
        where: {
          id: notificationId,
          userId, // Ensure user owns this notification
        },
      });

      logger.info(`Deleted notification ${notificationId}`);
    } catch (error: any) {
      logger.error(`Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  }
}
