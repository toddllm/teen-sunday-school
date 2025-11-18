import Bull from 'bull';
import prisma from '../config/database';
import logger from '../config/logger';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';
import { NotificationPreferenceService } from '../services/notification-preference.service';

// Create queues
export const notificationQueue = new Bull('notifications', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 1000,
    removeOnFail: 500,
  },
});

export const digestQueue = new Bull('notification-digests', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

const notificationService = new NotificationService();
const emailService = new EmailService();
const preferenceService = new NotificationPreferenceService();

// ============================================================================
// NOTIFICATION QUEUE PROCESSOR
// ============================================================================

notificationQueue.process(async (job) => {
  const { notificationId } = job.data;

  logger.info(`Processing notification job ${notificationId}`);

  try {
    const result = await notificationService.sendNotification(notificationId);

    if (!result.success) {
      throw new Error(result.error || 'Failed to send notification');
    }

    return result;
  } catch (error) {
    logger.error(`Notification job failed for ${notificationId}:`, error);
    throw error;
  }
});

// Event listeners for notification queue
notificationQueue.on('completed', (job, result) => {
  logger.info(`Notification job ${job.id} completed successfully`);
});

notificationQueue.on('failed', (job, err) => {
  logger.error(`Notification job ${job?.id} failed:`, err);
});

notificationQueue.on('error', (error) => {
  logger.error('Notification queue error:', error);
});

// ============================================================================
// DIGEST QUEUE PROCESSOR
// ============================================================================

digestQueue.process(async (job) => {
  const { userId, period } = job.data;

  logger.info(`Processing ${period} digest for user ${userId}`);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Get notifications from the digest period
    const startDate = new Date();
    if (period === 'daily') {
      startDate.setDate(startDate.getDate() - 1);
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
        status: {
          in: ['SENT', 'DELIVERED'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Skip if no notifications
    if (notifications.length === 0) {
      logger.info(`No notifications for ${period} digest for user ${userId}`);
      return { sent: false, reason: 'no_notifications' };
    }

    // Send digest email
    const notificationData = notifications.map((n) => ({
      title: n.title,
      message: n.message,
      actionUrl: n.actionUrl || undefined,
    }));

    await emailService.sendDigestEmail(user.email, notificationData, period);

    logger.info(`Sent ${period} digest to ${user.email} with ${notifications.length} notifications`);

    return { sent: true, count: notifications.length };
  } catch (error) {
    logger.error(`Digest job failed for user ${userId}:`, error);
    throw error;
  }
});

// Event listeners for digest queue
digestQueue.on('completed', (job, result) => {
  logger.info(`Digest job ${job.id} completed:`, result);
});

digestQueue.on('failed', (job, err) => {
  logger.error(`Digest job ${job?.id} failed:`, err);
});

digestQueue.on('error', (error) => {
  logger.error('Digest queue error:', error);
});

// ============================================================================
// JOB SCHEDULING FUNCTIONS
// ============================================================================

/**
 * Schedule a notification to be sent
 */
export async function scheduleNotification(
  notificationId: string,
  delay?: number
): Promise<void> {
  await notificationQueue.add(
    { notificationId },
    {
      delay: delay || 0,
      jobId: `notification-${notificationId}`,
    }
  );

  logger.info(`Scheduled notification ${notificationId}${delay ? ` with delay ${delay}ms` : ''}`);
}

/**
 * Process all pending scheduled notifications
 * This should be called periodically (e.g., every minute)
 */
export async function processPendingNotifications(): Promise<void> {
  try {
    logger.info('Processing pending notifications...');

    await notificationService.processPendingNotifications();

    logger.info('Pending notifications processed');
  } catch (error) {
    logger.error('Error processing pending notifications:', error);
  }
}

/**
 * Retry failed notifications
 * This should be called periodically (e.g., every hour)
 */
export async function retryFailedNotifications(): Promise<void> {
  try {
    logger.info('Retrying failed notifications...');

    await notificationService.retryFailedNotifications();

    logger.info('Failed notifications retry completed');
  } catch (error) {
    logger.error('Error retrying failed notifications:', error);
  }
}

/**
 * Schedule daily digests for all users who have it enabled
 */
export async function scheduleDailyDigests(): Promise<void> {
  try {
    logger.info('Scheduling daily digests...');

    const preferences = await prisma.notificationPreference.findMany({
      where: {
        emailDigest: true,
        emailDigestFrequency: 'DAILY',
      },
      include: {
        user: true,
      },
    });

    for (const pref of preferences) {
      await digestQueue.add(
        { userId: pref.userId, period: 'daily' },
        {
          jobId: `daily-digest-${pref.userId}-${new Date().toISOString().split('T')[0]}`,
        }
      );
    }

    logger.info(`Scheduled daily digests for ${preferences.length} users`);
  } catch (error) {
    logger.error('Error scheduling daily digests:', error);
  }
}

/**
 * Schedule weekly digests for all users who have it enabled
 */
export async function scheduleWeeklyDigests(): Promise<void> {
  try {
    logger.info('Scheduling weekly digests...');

    const preferences = await prisma.notificationPreference.findMany({
      where: {
        emailDigest: true,
        emailDigestFrequency: 'WEEKLY',
      },
      include: {
        user: true,
      },
    });

    for (const pref of preferences) {
      await digestQueue.add(
        { userId: pref.userId, period: 'weekly' },
        {
          jobId: `weekly-digest-${pref.userId}-${new Date().toISOString().split('T')[0]}`,
        }
      );
    }

    logger.info(`Scheduled weekly digests for ${preferences.length} users`);
  } catch (error) {
    logger.error('Error scheduling weekly digests:', error);
  }
}

/**
 * Initialize notification job scheduling
 * Sets up cron-like jobs for periodic processing
 */
export async function initializeNotificationJobs(): Promise<void> {
  logger.info('Initializing notification jobs...');

  // Process pending notifications every minute
  await notificationQueue.add(
    'process-pending',
    {},
    {
      repeat: {
        cron: '* * * * *', // Every minute
      },
      jobId: 'process-pending-notifications',
    }
  );

  // Retry failed notifications every hour
  await notificationQueue.add(
    'retry-failed',
    {},
    {
      repeat: {
        cron: '0 * * * *', // Every hour
      },
      jobId: 'retry-failed-notifications',
    }
  );

  // Schedule daily digests at 8 AM
  await digestQueue.add(
    'schedule-daily',
    {},
    {
      repeat: {
        cron: '0 8 * * *', // 8 AM daily
      },
      jobId: 'schedule-daily-digests',
    }
  );

  // Schedule weekly digests on Monday at 8 AM
  await digestQueue.add(
    'schedule-weekly',
    {},
    {
      repeat: {
        cron: '0 8 * * 1', // Monday 8 AM
      },
      jobId: 'schedule-weekly-digests',
    }
  );

  logger.info('Notification jobs initialized successfully');
}

/**
 * Handle special job types
 */
notificationQueue.process('process-pending', async (job) => {
  await processPendingNotifications();
  return { processed: true };
});

notificationQueue.process('retry-failed', async (job) => {
  await retryFailedNotifications();
  return { retried: true };
});

digestQueue.process('schedule-daily', async (job) => {
  await scheduleDailyDigests();
  return { scheduled: true };
});

digestQueue.process('schedule-weekly', async (job) => {
  await scheduleWeeklyDigests();
  return { scheduled: true };
});

/**
 * Clean up old jobs
 */
export async function cleanupOldJobs(): Promise<void> {
  try {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

    await notificationQueue.clean(dayAgo, 'completed');
    await notificationQueue.clean(dayAgo, 'failed');
    await digestQueue.clean(dayAgo, 'completed');
    await digestQueue.clean(dayAgo, 'failed');

    logger.info('Old notification jobs cleaned up');
  } catch (error) {
    logger.error('Error cleaning up old jobs:', error);
  }
}
