import Bull from 'bull';
import prisma from '../config/database';
import logger from '../config/logger';
import { SyncService } from '../services/sync.service';

// Create queue
export const syncQueue = new Bull('integration-sync', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500,     // Keep last 500 failed jobs
  },
});

// Process sync jobs
syncQueue.process(async (job) => {
  const { integrationId } = job.data;

  logger.info(`Processing sync job for integration ${integrationId}`);

  try {
    // Fetch integration
    const integration = await prisma.externalIntegration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    if (!integration.syncEnabled) {
      logger.info(`Sync disabled for integration ${integrationId}, skipping`);
      return;
    }

    // Perform sync
    const syncService = new SyncService(integration);
    const result = await syncService.performSync();

    logger.info(`Sync completed for integration ${integrationId}:`, result);

    // Schedule next sync based on frequency
    if (integration.syncEnabled) {
      await scheduleNextSync(integrationId, integration.syncFrequency);
    }

    return result;
  } catch (error) {
    logger.error(`Sync job failed for integration ${integrationId}:`, error);
    throw error;
  }
});

// Event listeners
syncQueue.on('completed', (job, result) => {
  logger.info(`Sync job ${job.id} completed:`, result);
});

syncQueue.on('failed', (job, err) => {
  logger.error(`Sync job ${job?.id} failed:`, err);
});

syncQueue.on('error', (error) => {
  logger.error('Queue error:', error);
});

/**
 * Schedule next sync based on frequency
 */
async function scheduleNextSync(integrationId: string, frequency: string): Promise<void> {
  let delay = 0;

  switch (frequency) {
    case 'HOURLY':
      delay = 60 * 60 * 1000; // 1 hour
      break;
    case 'DAILY':
      delay = 24 * 60 * 60 * 1000; // 24 hours
      break;
    case 'WEEKLY':
      delay = 7 * 24 * 60 * 60 * 1000; // 7 days
      break;
    default:
      return; // Manual sync only
  }

  const nextSyncAt = new Date(Date.now() + delay);

  // Schedule job
  await syncQueue.add(
    { integrationId },
    {
      delay,
      jobId: `sync-${integrationId}-${nextSyncAt.getTime()}`,
    }
  );

  // Update database
  await prisma.externalIntegration.update({
    where: { id: integrationId },
    data: { nextSyncAt },
  });

  logger.info(
    `Next sync scheduled for integration ${integrationId} at ${nextSyncAt.toISOString()}`
  );
}

/**
 * Schedule sync for an integration
 */
export async function scheduleSyncJob(integrationId: string): Promise<void> {
  const integration = await prisma.externalIntegration.findUnique({
    where: { id: integrationId },
  });

  if (!integration || !integration.syncEnabled) {
    logger.info(`Sync not enabled for integration ${integrationId}`);
    return;
  }

  await scheduleNextSync(integrationId, integration.syncFrequency);
}

/**
 * Trigger immediate sync
 */
export async function triggerImmediateSync(integrationId: string): Promise<void> {
  await syncQueue.add(
    { integrationId },
    {
      jobId: `sync-immediate-${integrationId}-${Date.now()}`,
      priority: 1, // High priority
    }
  );

  logger.info(`Immediate sync triggered for integration ${integrationId}`);
}

/**
 * Initialize scheduled syncs for all active integrations
 */
export async function initializeScheduledSyncs(): Promise<void> {
  logger.info('Initializing scheduled syncs...');

  const integrations = await prisma.externalIntegration.findMany({
    where: {
      syncEnabled: true,
      status: 'ACTIVE',
    },
  });

  for (const integration of integrations) {
    try {
      await scheduleSyncJob(integration.id);
    } catch (error) {
      logger.error(`Failed to schedule sync for integration ${integration.id}:`, error);
    }
  }

  logger.info(`Scheduled syncs for ${integrations.length} integrations`);
}

/**
 * Cancel scheduled sync for an integration
 */
export async function cancelScheduledSync(integrationId: string): Promise<void> {
  const jobs = await syncQueue.getJobs(['waiting', 'delayed']);

  for (const job of jobs) {
    if (job.data.integrationId === integrationId) {
      await job.remove();
      logger.info(`Cancelled sync job ${job.id} for integration ${integrationId}`);
    }
  }
}
