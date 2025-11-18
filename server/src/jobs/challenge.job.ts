import Bull from 'bull';
import logger from '../config/logger';
import { ChallengeService } from '../services/challenge.service';

const challengeService = new ChallengeService();

// Create queue
export const challengeQueue = new Bull('challenge-automation', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

// ============================================================================
// JOB PROCESSORS
// ============================================================================

/**
 * Process challenge automation jobs
 * - Expire old challenges
 * - Activate draft challenges
 */
challengeQueue.process('daily-automation', async (job) => {
  logger.info('Processing daily challenge automation');

  try {
    // Expire challenges that have passed their end date
    const expiredCount = await challengeService.expireOldChallenges();

    // Activate draft challenges whose start date has arrived
    const activatedCount = await challengeService.activateDraftChallenges();

    const result = {
      expiredChallenges: expiredCount,
      activatedChallenges: activatedCount,
      timestamp: new Date().toISOString(),
    };

    logger.info('Challenge automation completed:', result);

    return result;
  } catch (error) {
    logger.error('Challenge automation failed:', error);
    throw error;
  }
});

// ============================================================================
// EVENT LISTENERS
// ============================================================================

challengeQueue.on('completed', (job, result) => {
  logger.info(`Challenge job ${job.id} completed:`, result);
});

challengeQueue.on('failed', (job, err) => {
  logger.error(`Challenge job ${job?.id} failed:`, err);
});

challengeQueue.on('error', (error) => {
  logger.error('Challenge queue error:', error);
});

// ============================================================================
// SCHEDULING
// ============================================================================

/**
 * Schedule daily automation job
 * Runs every day at 1 AM
 */
export async function scheduleDailyAutomation(): Promise<void> {
  // Remove any existing daily automation jobs to prevent duplicates
  const existingJobs = await challengeQueue.getRepeatableJobs();
  for (const job of existingJobs) {
    if (job.name === 'daily-automation') {
      await challengeQueue.removeRepeatableByKey(job.key);
    }
  }

  // Schedule daily automation
  await challengeQueue.add(
    'daily-automation',
    {},
    {
      repeat: {
        cron: '0 1 * * *', // Every day at 1 AM
      },
      jobId: 'daily-automation',
    }
  );

  logger.info('✓ Challenge daily automation scheduled (1 AM daily)');
}

/**
 * Initialize challenge jobs on server startup
 */
export async function initializeChallengeJobs(): Promise<void> {
  try {
    await scheduleDailyAutomation();
    logger.info('✓ Challenge jobs initialized');
  } catch (error) {
    logger.error('Failed to initialize challenge jobs:', error);
    throw error;
  }
}

export default challengeQueue;
