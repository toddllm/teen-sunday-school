import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Daily Gratitude Log Controller
 * Manages gratitude entries for users
 */

/**
 * GET /api/gratitude
 * List all gratitude entries for the current user
 */
export const listEntries = async (req: Request, res: Response) => {
  try {
    const { id: userId, organizationId } = req.user!;
    const { limit = 30, offset = 0, startDate, endDate } = req.query;

    const where: any = {
      userId,
      organizationId,
    };

    if (startDate || endDate) {
      where.entryDate = {};
      if (startDate) {
        where.entryDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.entryDate.lte = new Date(endDate as string);
      }
    }

    const [entries, total] = await Promise.all([
      prisma.gratitudeEntry.findMany({
        where,
        orderBy: { entryDate: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.gratitudeEntry.count({ where }),
    ]);

    res.json({
      entries,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    logger.error('Error listing gratitude entries:', error);
    res.status(500).json({ error: 'Failed to list gratitude entries' });
  }
};

/**
 * GET /api/gratitude/today
 * Get today's gratitude entry for the current user
 */
export const getTodayEntry = async (req: Request, res: Response) => {
  try {
    const { id: userId, organizationId } = req.user!;

    // Get today's date (start of day in UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const entry = await prisma.gratitudeEntry.findFirst({
      where: {
        userId,
        organizationId,
        entryDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (!entry) {
      return res.status(404).json({ error: 'No entry found for today' });
    }

    res.json(entry);
  } catch (error) {
    logger.error('Error fetching today\'s gratitude entry:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s entry' });
  }
};

/**
 * GET /api/gratitude/stats
 * Get gratitude statistics for the current user
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const { id: userId, organizationId } = req.user!;

    // Get all entries for the user
    const entries = await prisma.gratitudeEntry.findMany({
      where: { userId, organizationId },
      orderBy: { entryDate: 'desc' },
      select: {
        entryDate: true,
        mood: true,
        category: true,
      },
    });

    // Calculate total entries
    const totalEntries = entries.length;

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (entries.length > 0) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Sort by date descending
      const sortedDates = entries.map(e => new Date(e.entryDate).setUTCHours(0, 0, 0, 0));

      // Check current streak
      let checkDate = today.getTime();
      for (const entryDate of sortedDates) {
        if (entryDate === checkDate || entryDate === checkDate - 86400000) {
          currentStreak++;
          checkDate = entryDate - 86400000;
        } else {
          break;
        }
      }

      // Calculate longest streak
      let prevDate: number | null = null;
      for (const entryDate of sortedDates) {
        if (prevDate === null || prevDate - entryDate === 86400000) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
        prevDate = entryDate;
      }
    }

    // Calculate mood distribution
    const moodDistribution: Record<string, number> = {};
    const categoryDistribution: Record<string, number> = {};

    entries.forEach(entry => {
      if (entry.mood) {
        moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
      }
      if (entry.category) {
        categoryDistribution[entry.category] = (categoryDistribution[entry.category] || 0) + 1;
      }
    });

    res.json({
      totalEntries,
      currentStreak,
      longestStreak,
      moodDistribution,
      categoryDistribution,
      lastEntryDate: entries.length > 0 ? entries[0].entryDate : null,
    });
  } catch (error) {
    logger.error('Error fetching gratitude stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

/**
 * GET /api/gratitude/:id
 * Get a specific gratitude entry
 */
export const getEntry = async (req: Request, res: Response) => {
  try {
    const { id: userId, organizationId } = req.user!;
    const { id } = req.params;

    const entry = await prisma.gratitudeEntry.findFirst({
      where: {
        id,
        userId,
        organizationId,
      },
    });

    if (!entry) {
      return res.status(404).json({ error: 'Gratitude entry not found' });
    }

    res.json(entry);
  } catch (error) {
    logger.error('Error fetching gratitude entry:', error);
    res.status(500).json({ error: 'Failed to fetch gratitude entry' });
  }
};

/**
 * POST /api/gratitude
 * Create a new gratitude entry
 */
export const createEntry = async (req: Request, res: Response) => {
  try {
    const { id: userId, organizationId } = req.user!;
    const { gratitudeText, mood, category, entryDate } = req.body;

    // Validate required fields
    if (!gratitudeText) {
      return res.status(400).json({
        error: 'gratitudeText is required',
      });
    }

    // Parse and validate entry date
    const parsedDate = entryDate ? new Date(entryDate) : new Date();
    parsedDate.setUTCHours(0, 0, 0, 0);

    // Check if entry already exists for this date
    const existing = await prisma.gratitudeEntry.findFirst({
      where: {
        userId,
        entryDate: parsedDate,
      },
    });

    if (existing) {
      return res.status(400).json({
        error: 'An entry already exists for this date. Use PATCH to update it.',
      });
    }

    const entry = await prisma.gratitudeEntry.create({
      data: {
        userId,
        organizationId,
        gratitudeText,
        mood,
        category,
        entryDate: parsedDate,
      },
    });

    logger.info(`Gratitude entry created: ${entry.id} by user ${userId}`);
    res.status(201).json(entry);
  } catch (error) {
    logger.error('Error creating gratitude entry:', error);
    res.status(500).json({ error: 'Failed to create gratitude entry' });
  }
};

/**
 * PATCH /api/gratitude/:id
 * Update a gratitude entry
 */
export const updateEntry = async (req: Request, res: Response) => {
  try {
    const { id: userId, organizationId } = req.user!;
    const { id } = req.params;
    const { gratitudeText, mood, category } = req.body;

    // Check if entry exists and belongs to user
    const existing = await prisma.gratitudeEntry.findFirst({
      where: { id, userId, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Gratitude entry not found',
      });
    }

    const entry = await prisma.gratitudeEntry.update({
      where: { id },
      data: {
        gratitudeText,
        mood,
        category,
      },
    });

    logger.info(`Gratitude entry updated: ${entry.id}`);
    res.json(entry);
  } catch (error) {
    logger.error('Error updating gratitude entry:', error);
    res.status(500).json({ error: 'Failed to update gratitude entry' });
  }
};

/**
 * DELETE /api/gratitude/:id
 * Delete a gratitude entry
 */
export const deleteEntry = async (req: Request, res: Response) => {
  try {
    const { id: userId, organizationId } = req.user!;
    const { id } = req.params;

    // Check if entry exists and belongs to user
    const existing = await prisma.gratitudeEntry.findFirst({
      where: { id, userId, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Gratitude entry not found',
      });
    }

    await prisma.gratitudeEntry.delete({
      where: { id },
    });

    logger.info(`Gratitude entry deleted: ${id}`);
    res.json({ success: true, message: 'Gratitude entry deleted successfully' });
  } catch (error) {
    logger.error('Error deleting gratitude entry:', error);
    res.status(500).json({ error: 'Failed to delete gratitude entry' });
  }
};
