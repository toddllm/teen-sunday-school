import { NotificationPreference, DigestFrequency } from '@prisma/client';
import prisma from '../config/database';
import logger from '../config/logger';

export interface CreatePreferenceDto {
  userId: string;
  emailEnabled?: boolean;
  emailLessonReminders?: boolean;
  emailEventReminders?: boolean;
  emailAnnouncements?: boolean;
  emailGroupUpdates?: boolean;
  emailDigest?: boolean;
  emailDigestFrequency?: DigestFrequency;
  inAppEnabled?: boolean;
  inAppLessonReminders?: boolean;
  inAppEventReminders?: boolean;
  inAppAnnouncements?: boolean;
  inAppGroupUpdates?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursTimezone?: string;
  preferredDays?: number[];
  lessonReminderDays?: number;
  lessonReminderTime?: string;
  eventReminderHours?: number;
  batchNotifications?: boolean;
  maxNotificationsPerDay?: number;
}

export interface UpdatePreferenceDto extends Partial<CreatePreferenceDto> {}

export class NotificationPreferenceService {
  /**
   * Get user's notification preferences
   * Creates default preferences if none exist
   */
  async getUserPreferences(userId: string): Promise<NotificationPreference> {
    try {
      let preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      // Create default preferences if none exist
      if (!preferences) {
        preferences = await this.createDefaultPreferences(userId);
        logger.info(`Created default notification preferences for user ${userId}`);
      }

      return preferences;
    } catch (error: any) {
      logger.error(`Error fetching preferences for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create default notification preferences for a user
   */
  async createDefaultPreferences(userId: string): Promise<NotificationPreference> {
    try {
      // Get user's organization timezone
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          quietHoursTimezone: user.organization.timezone,
        },
      });

      return preferences;
    } catch (error: any) {
      logger.error(`Error creating default preferences for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user's notification preferences
   */
  async updatePreferences(
    userId: string,
    updates: UpdatePreferenceDto
  ): Promise<NotificationPreference> {
    try {
      // Validate quiet hours format if provided
      if (updates.quietHoursStart) {
        this.validateTimeFormat(updates.quietHoursStart);
      }
      if (updates.quietHoursEnd) {
        this.validateTimeFormat(updates.quietHoursEnd);
      }
      if (updates.lessonReminderTime) {
        this.validateTimeFormat(updates.lessonReminderTime);
      }

      // Ensure preferences exist
      await this.getUserPreferences(userId);

      const preferences = await prisma.notificationPreference.update({
        where: { userId },
        data: {
          ...updates,
          userId: undefined, // Don't allow userId to be updated
        },
      });

      logger.info(`Updated notification preferences for user ${userId}`);
      return preferences;
    } catch (error: any) {
      logger.error(`Error updating preferences for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Check if user should receive a notification based on their preferences
   */
  async shouldReceiveNotification(
    userId: string,
    notificationType: string,
    deliveryMethod: 'email' | 'inApp'
  ): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);

      // Check if delivery method is enabled
      if (deliveryMethod === 'email' && !preferences.emailEnabled) {
        return false;
      }
      if (deliveryMethod === 'inApp' && !preferences.inAppEnabled) {
        return false;
      }

      // Check specific notification type preferences
      const typeMap: { [key: string]: boolean } = {
        LESSON_REMINDER:
          deliveryMethod === 'email'
            ? preferences.emailLessonReminders
            : preferences.inAppLessonReminders,
        EVENT_REMINDER:
          deliveryMethod === 'email'
            ? preferences.emailEventReminders
            : preferences.inAppEventReminders,
        ANNOUNCEMENT:
          deliveryMethod === 'email'
            ? preferences.emailAnnouncements
            : preferences.inAppAnnouncements,
        GROUP_UPDATE:
          deliveryMethod === 'email'
            ? preferences.emailGroupUpdates
            : preferences.inAppGroupUpdates,
      };

      return typeMap[notificationType] ?? true; // Default to true for unknown types
    } catch (error: any) {
      logger.error(
        `Error checking notification preferences for user ${userId}:`,
        error
      );
      // Fail open - allow notification if there's an error
      return true;
    }
  }

  /**
   * Check if current time is within user's quiet hours
   */
  async isInQuietHours(userId: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);

      if (!preferences.quietHoursEnabled || !preferences.quietHoursStart || !preferences.quietHoursEnd) {
        return false;
      }

      const now = new Date();
      const userTimezone = preferences.quietHoursTimezone;

      // Convert current time to user's timezone
      const userTime = new Date(
        now.toLocaleString('en-US', { timeZone: userTimezone })
      );
      const currentHour = userTime.getHours();
      const currentMinute = userTime.getMinutes();
      const currentTimeMinutes = currentHour * 60 + currentMinute;

      // Parse quiet hours
      const [startHour, startMinute] = preferences.quietHoursStart.split(':').map(Number);
      const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number);
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;

      // Handle quiet hours that span midnight
      if (startTimeMinutes > endTimeMinutes) {
        // Quiet hours span midnight (e.g., 22:00 to 08:00)
        return currentTimeMinutes >= startTimeMinutes || currentTimeMinutes < endTimeMinutes;
      } else {
        // Normal quiet hours (e.g., 08:00 to 22:00)
        return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes;
      }
    } catch (error: any) {
      logger.error(`Error checking quiet hours for user ${userId}:`, error);
      // Fail open - assume not in quiet hours if there's an error
      return false;
    }
  }

  /**
   * Check if today is a preferred day for notifications
   */
  async isPreferredDay(userId: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);

      if (!preferences.preferredDays || (preferences.preferredDays as any).length === 0) {
        return true; // No preference means all days are okay
      }

      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
      const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert to ISO (1 = Monday, 7 = Sunday)

      return (preferences.preferredDays as number[]).includes(isoDayOfWeek);
    } catch (error: any) {
      logger.error(`Error checking preferred day for user ${userId}:`, error);
      return true;
    }
  }

  /**
   * Get notification count for today
   */
  async getTodayNotificationCount(userId: string): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const count = await prisma.notification.count({
        where: {
          userId,
          sentAt: {
            gte: today,
          },
        },
      });

      return count;
    } catch (error: any) {
      logger.error(`Error getting notification count for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Check if user has reached max notifications for today
   */
  async hasReachedDailyLimit(userId: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);

      // 0 means unlimited
      if (preferences.maxNotificationsPerDay === 0) {
        return false;
      }

      const count = await this.getTodayNotificationCount(userId);
      return count >= preferences.maxNotificationsPerDay;
    } catch (error: any) {
      logger.error(`Error checking daily limit for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Validate time format (HH:MM)
   */
  private validateTimeFormat(time: string): void {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new Error(`Invalid time format: ${time}. Expected HH:MM format (e.g., "14:30")`);
    }
  }

  /**
   * Delete user's notification preferences
   */
  async deletePreferences(userId: string): Promise<void> {
    try {
      await prisma.notificationPreference.delete({
        where: { userId },
      });
      logger.info(`Deleted notification preferences for user ${userId}`);
    } catch (error: any) {
      if (error.code === 'P2025') {
        // Record not found - already deleted
        return;
      }
      logger.error(`Error deleting preferences for user ${userId}:`, error);
      throw error;
    }
  }
}
