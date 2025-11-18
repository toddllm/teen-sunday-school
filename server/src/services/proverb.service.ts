import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Proverb of the Day Service
 * Manages daily proverbs with teen applications
 */

interface GetProverbOptions {
  organizationId: string;
  date?: Date;
}

/**
 * Get the proverb for a specific date (or today)
 */
export async function getProverbForDate(options: GetProverbOptions) {
  const { organizationId, date = new Date() } = options;

  try {
    // Normalize date to start of day in organization's timezone
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // First try to find a scheduled proverb for this date
    let proverb = await prisma.proverbOfTheDay.findFirst({
      where: {
        OR: [
          { organizationId },
          { organizationId: null }, // Global proverbs
        ],
        isActive: true,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: [
        { isPinned: 'desc' }, // Pinned proverbs first
        { createdAt: 'desc' },
      ],
    });

    // If no scheduled proverb, get a random active one
    if (!proverb) {
      // Get count of active proverbs
      const count = await prisma.proverbOfTheDay.count({
        where: {
          OR: [
            { organizationId },
            { organizationId: null },
          ],
          isActive: true,
        },
      });

      if (count === 0) {
        return null;
      }

      // Use date as seed for consistent "random" selection per day
      const dayNumber = Math.floor(startOfDay.getTime() / (1000 * 60 * 60 * 24));
      const skip = dayNumber % count;

      proverb = await prisma.proverbOfTheDay.findFirst({
        where: {
          OR: [
            { organizationId },
            { organizationId: null },
          ],
          isActive: true,
        },
        skip,
        orderBy: {
          chapter: 'asc',
        },
      });
    }

    return proverb;
  } catch (error) {
    logger.error('Error fetching proverb for date:', error);
    throw error;
  }
}

/**
 * Get a random proverb
 */
export async function getRandomProverb(organizationId: string) {
  try {
    const count = await prisma.proverbOfTheDay.count({
      where: {
        OR: [
          { organizationId },
          { organizationId: null },
        ],
        isActive: true,
      },
    });

    if (count === 0) {
      return null;
    }

    const skip = Math.floor(Math.random() * count);

    const proverb = await prisma.proverbOfTheDay.findFirst({
      where: {
        OR: [
          { organizationId },
          { organizationId: null },
        ],
        isActive: true,
      },
      skip,
    });

    return proverb;
  } catch (error) {
    logger.error('Error fetching random proverb:', error);
    throw error;
  }
}

/**
 * Record a proverb view
 */
export async function recordProverbView(
  proverbId: string,
  userId?: string,
  organizationId?: string,
  timeSpentMs?: number
) {
  try {
    const view = await prisma.proverbView.create({
      data: {
        proverbId,
        userId,
        organizationId,
        timeSpentMs,
        completed: timeSpentMs ? timeSpentMs > 10000 : false, // >10s = completed
      },
    });

    return view;
  } catch (error) {
    logger.error('Error recording proverb view:', error);
    throw error;
  }
}

/**
 * Record a proverb interaction (like, share, bookmark, etc.)
 */
export async function recordProverbInteraction(
  proverbId: string,
  interactionType: string,
  userId?: string,
  organizationId?: string,
  notes?: string,
  rating?: number
) {
  try {
    const interaction = await prisma.proverbInteraction.create({
      data: {
        proverbId,
        userId,
        organizationId,
        interactionType,
        notes,
        rating,
      },
    });

    return interaction;
  } catch (error) {
    logger.error('Error recording proverb interaction:', error);
    throw error;
  }
}

/**
 * Get proverb engagement stats
 */
export async function getProverbStats(proverbId: string) {
  try {
    const [views, interactions, avgTimeSpent] = await Promise.all([
      // Total views
      prisma.proverbView.count({
        where: { proverbId },
      }),

      // Interactions by type
      prisma.proverbInteraction.groupBy({
        by: ['interactionType'],
        where: { proverbId },
        _count: true,
      }),

      // Average time spent
      prisma.proverbView.aggregate({
        where: {
          proverbId,
          timeSpentMs: { not: null },
        },
        _avg: {
          timeSpentMs: true,
        },
      }),
    ]);

    return {
      views,
      interactions: interactions.reduce((acc, curr) => {
        acc[curr.interactionType] = curr._count;
        return acc;
      }, {} as Record<string, number>),
      avgTimeSpentMs: avgTimeSpent._avg.timeSpentMs || 0,
    };
  } catch (error) {
    logger.error('Error fetching proverb stats:', error);
    throw error;
  }
}

/**
 * Get proverbs by category
 */
export async function getProverbsByCategory(
  organizationId: string,
  category: string
) {
  try {
    const proverbs = await prisma.proverbOfTheDay.findMany({
      where: {
        OR: [
          { organizationId },
          { organizationId: null },
        ],
        category,
        isActive: true,
      },
      orderBy: {
        chapter: 'asc',
      },
    });

    return proverbs;
  } catch (error) {
    logger.error('Error fetching proverbs by category:', error);
    throw error;
  }
}

/**
 * Search proverbs by text, tags, or category
 */
export async function searchProverbs(
  organizationId: string,
  searchTerm: string
) {
  try {
    const proverbs = await prisma.proverbOfTheDay.findMany({
      where: {
        OR: [
          { organizationId },
          { organizationId: null },
        ],
        isActive: true,
        OR: [
          { proverbText: { contains: searchTerm, mode: 'insensitive' } },
          { teenTitle: { contains: searchTerm, mode: 'insensitive' } },
          { teenApplication: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        chapter: 'asc',
      },
    });

    return proverbs;
  } catch (error) {
    logger.error('Error searching proverbs:', error);
    throw error;
  }
}
