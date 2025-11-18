import { Request, Response } from 'express';
import { PrismaClient, CacheStrategy, CacheSyncFrequency, CachePolicy } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Cache Config Controller
 * Manages offline content caching configuration
 */

// Default cache configuration
const DEFAULT_CACHE_CONFIG = {
  cacheLessons: true,
  cacheReadingPlans: true,
  cacheScriptures: true,
  cacheImages: false,
  cacheAudio: false,
  maxCacheSize: 50, // MB
  strategy: 'CACHE_FIRST' as CacheStrategy,
  autoCache: true,
  autoSync: true,
  syncFrequency: 'DAILY' as CacheSyncFrequency,
  lessonCachePolicy: 'ALL_RECENT' as CachePolicy,
  planCachePolicy: 'ALL_ACTIVE' as CachePolicy,
  retentionDays: 30,
  isActive: true,
};

/**
 * GET /api/admin/cache-config
 * Get cache configuration for an organization
 */
export const getCacheConfig = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;

    let config = await prisma.cacheConfig.findUnique({
      where: { organizationId },
    });

    // If no config exists, create default
    if (!config) {
      config = await prisma.cacheConfig.create({
        data: {
          organizationId,
          ...DEFAULT_CACHE_CONFIG,
        },
      });
    }

    res.json(config);
  } catch (error) {
    logger.error('Error fetching cache config:', error);
    res.status(500).json({ error: 'Failed to fetch cache configuration' });
  }
};

/**
 * PATCH /api/admin/cache-config
 * Update cache configuration
 */
export const updateCacheConfig = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const {
      cacheLessons,
      cacheReadingPlans,
      cacheScriptures,
      cacheImages,
      cacheAudio,
      maxCacheSize,
      strategy,
      autoCache,
      autoSync,
      syncFrequency,
      cachedLessonIds,
      cachedPlanIds,
      lessonCachePolicy,
      planCachePolicy,
      retentionDays,
      isActive,
    } = req.body;

    // Validate strategy
    if (strategy && !Object.values(CacheStrategy).includes(strategy)) {
      return res.status(400).json({
        error: `Invalid cache strategy: ${strategy}`,
        validStrategies: Object.values(CacheStrategy),
      });
    }

    // Validate sync frequency
    if (syncFrequency && !Object.values(CacheSyncFrequency).includes(syncFrequency)) {
      return res.status(400).json({
        error: `Invalid sync frequency: ${syncFrequency}`,
        validFrequencies: Object.values(CacheSyncFrequency),
      });
    }

    // Validate cache policies
    if (lessonCachePolicy && !Object.values(CachePolicy).includes(lessonCachePolicy)) {
      return res.status(400).json({
        error: `Invalid lesson cache policy: ${lessonCachePolicy}`,
        validPolicies: Object.values(CachePolicy),
      });
    }

    if (planCachePolicy && !Object.values(CachePolicy).includes(planCachePolicy)) {
      return res.status(400).json({
        error: `Invalid plan cache policy: ${planCachePolicy}`,
        validPolicies: Object.values(CachePolicy),
      });
    }

    // Check if config exists
    const existingConfig = await prisma.cacheConfig.findUnique({
      where: { organizationId },
    });

    let config;
    if (existingConfig) {
      // Update existing config
      config = await prisma.cacheConfig.update({
        where: { organizationId },
        data: {
          ...(cacheLessons !== undefined && { cacheLessons }),
          ...(cacheReadingPlans !== undefined && { cacheReadingPlans }),
          ...(cacheScriptures !== undefined && { cacheScriptures }),
          ...(cacheImages !== undefined && { cacheImages }),
          ...(cacheAudio !== undefined && { cacheAudio }),
          ...(maxCacheSize !== undefined && { maxCacheSize }),
          ...(strategy !== undefined && { strategy }),
          ...(autoCache !== undefined && { autoCache }),
          ...(autoSync !== undefined && { autoSync }),
          ...(syncFrequency !== undefined && { syncFrequency }),
          ...(cachedLessonIds !== undefined && { cachedLessonIds }),
          ...(cachedPlanIds !== undefined && { cachedPlanIds }),
          ...(lessonCachePolicy !== undefined && { lessonCachePolicy }),
          ...(planCachePolicy !== undefined && { planCachePolicy }),
          ...(retentionDays !== undefined && { retentionDays }),
          ...(isActive !== undefined && { isActive }),
        },
      });
    } else {
      // Create new config for this organization
      config = await prisma.cacheConfig.create({
        data: {
          organizationId,
          ...DEFAULT_CACHE_CONFIG,
          ...(cacheLessons !== undefined && { cacheLessons }),
          ...(cacheReadingPlans !== undefined && { cacheReadingPlans }),
          ...(cacheScriptures !== undefined && { cacheScriptures }),
          ...(cacheImages !== undefined && { cacheImages }),
          ...(cacheAudio !== undefined && { cacheAudio }),
          ...(maxCacheSize !== undefined && { maxCacheSize }),
          ...(strategy !== undefined && { strategy }),
          ...(autoCache !== undefined && { autoCache }),
          ...(autoSync !== undefined && { autoSync }),
          ...(syncFrequency !== undefined && { syncFrequency }),
          ...(cachedLessonIds !== undefined && { cachedLessonIds }),
          ...(cachedPlanIds !== undefined && { cachedPlanIds }),
          ...(lessonCachePolicy !== undefined && { lessonCachePolicy }),
          ...(planCachePolicy !== undefined && { planCachePolicy }),
          ...(retentionDays !== undefined && { retentionDays }),
          ...(isActive !== undefined && { isActive }),
        },
      });
    }

    logger.info(`Cache config updated for org ${organizationId}`);
    res.json(config);
  } catch (error) {
    logger.error('Error updating cache config:', error);
    res.status(500).json({ error: 'Failed to update cache configuration' });
  }
};

/**
 * POST /api/admin/cache-config/sync
 * Trigger immediate cache sync
 */
export const triggerCacheSync = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;

    // Update last sync timestamp
    const config = await prisma.cacheConfig.update({
      where: { organizationId },
      data: {
        lastSyncAt: new Date(),
        nextSyncAt: calculateNextSync(new Date(), 'DAILY'),
      },
    });

    logger.info(`Manual cache sync triggered for org ${organizationId}`);
    res.json({
      success: true,
      message: 'Cache sync initiated',
      lastSyncAt: config.lastSyncAt,
      nextSyncAt: config.nextSyncAt,
    });
  } catch (error) {
    logger.error('Error triggering cache sync:', error);
    res.status(500).json({ error: 'Failed to trigger cache sync' });
  }
};

/**
 * GET /api/admin/cache-config/stats
 * Get cache statistics
 */
export const getCacheStats = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;

    const config = await prisma.cacheConfig.findUnique({
      where: { organizationId },
    });

    if (!config) {
      return res.status(404).json({ error: 'Cache configuration not found' });
    }

    // Get content counts
    const [lessonsCount, plansCount] = await Promise.all([
      prisma.lesson.count({ where: { organizationId } }),
      // Reading plans would need to be fetched from the reading plan table if it exists
      Promise.resolve(0), // Placeholder since reading plans are in localStorage
    ]);

    // Calculate estimated cache size
    const estimatedSize = calculateEstimatedCacheSize(
      config,
      lessonsCount,
      plansCount
    );

    res.json({
      config,
      stats: {
        totalLessons: lessonsCount,
        totalPlans: plansCount,
        cachedLessonsCount: config.cachedLessonIds ? (config.cachedLessonIds as any[]).length : 0,
        cachedPlansCount: config.cachedPlanIds ? (config.cachedPlanIds as any[]).length : 0,
        estimatedCacheSize: estimatedSize,
        maxCacheSize: config.maxCacheSize,
        utilizationPercent: Math.round((estimatedSize / config.maxCacheSize) * 100),
      },
    });
  } catch (error) {
    logger.error('Error fetching cache stats:', error);
    res.status(500).json({ error: 'Failed to fetch cache statistics' });
  }
};

/**
 * GET /api/admin/cache-config/options
 * Get available cache configuration options
 */
export const getCacheOptions = async (req: Request, res: Response) => {
  try {
    const strategies = Object.values(CacheStrategy).map(strategy => ({
      value: strategy,
      label: formatEnumLabel(strategy),
      description: getStrategyDescription(strategy),
    }));

    const frequencies = Object.values(CacheSyncFrequency).map(freq => ({
      value: freq,
      label: formatEnumLabel(freq),
    }));

    const policies = Object.values(CachePolicy).map(policy => ({
      value: policy,
      label: formatEnumLabel(policy),
      description: getPolicyDescription(policy),
    }));

    res.json({ strategies, frequencies, policies });
  } catch (error) {
    logger.error('Error fetching cache options:', error);
    res.status(500).json({ error: 'Failed to fetch cache options' });
  }
};

// Helper functions

function calculateNextSync(lastSync: Date, frequency: CacheSyncFrequency): Date {
  const next = new Date(lastSync);
  switch (frequency) {
    case 'HOURLY':
      next.setHours(next.getHours() + 1);
      break;
    case 'DAILY':
      next.setDate(next.getDate() + 1);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'MANUAL':
      // For manual, don't set a next sync
      return next;
  }
  return next;
}

function calculateEstimatedCacheSize(
  config: any,
  lessonsCount: number,
  plansCount: number
): number {
  let size = 0;

  // Rough estimates per item (in MB)
  const LESSON_SIZE = 0.5; // Average lesson with slides
  const PLAN_SIZE = 0.1; // Average reading plan
  const SCRIPTURE_SIZE = 0.05; // Average scripture passage
  const IMAGE_SIZE = 0.3; // Average image

  if (config.cacheLessons) {
    size += lessonsCount * LESSON_SIZE;
  }

  if (config.cacheReadingPlans) {
    size += plansCount * PLAN_SIZE;
  }

  if (config.cacheScriptures) {
    size += lessonsCount * SCRIPTURE_SIZE;
  }

  if (config.cacheImages) {
    size += lessonsCount * IMAGE_SIZE;
  }

  return Math.round(size * 10) / 10; // Round to 1 decimal
}

function formatEnumLabel(value: string): string {
  return value
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function getStrategyDescription(strategy: CacheStrategy): string {
  switch (strategy) {
    case 'CACHE_FIRST':
      return 'Try cache first, fallback to network. Best for offline use.';
    case 'NETWORK_FIRST':
      return 'Try network first, fallback to cache. Best for fresh content.';
    case 'CACHE_ONLY':
      return 'Only use cached content. Fully offline mode.';
    case 'NETWORK_ONLY':
      return 'Always fetch from network. No caching.';
    default:
      return '';
  }
}

function getPolicyDescription(policy: CachePolicy): string {
  switch (policy) {
    case 'ALL':
      return 'Cache all content';
    case 'ALL_RECENT':
      return 'Cache content from last 3 months';
    case 'ALL_ACTIVE':
      return 'Cache all published/active content';
    case 'SELECTED_ONLY':
      return 'Only cache manually selected items';
    case 'NONE':
      return "Don't cache this content type";
    default:
      return '';
  }
}
