import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';
import * as proverbService from '../services/proverb.service';

const prisma = new PrismaClient();

/**
 * Proverb of the Day Controller
 * Manages proverbs with teen applications
 */

/**
 * GET /api/proverbs/today
 * Get the proverb of the day
 */
export const getTodaysProverb = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const date = req.query.date ? new Date(req.query.date as string) : new Date();

    const proverb = await proverbService.getProverbForDate({
      organizationId,
      date,
    });

    if (!proverb) {
      return res.status(404).json({
        error: 'No proverb available for this date',
        message: 'Please add some proverbs to get started',
      });
    }

    res.json(proverb);
  } catch (error) {
    logger.error('Error fetching today\'s proverb:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s proverb' });
  }
};

/**
 * GET /api/proverbs/random
 * Get a random proverb
 */
export const getRandomProverb = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;

    const proverb = await proverbService.getRandomProverb(organizationId);

    if (!proverb) {
      return res.status(404).json({
        error: 'No proverbs available',
        message: 'Please add some proverbs to get started',
      });
    }

    res.json(proverb);
  } catch (error) {
    logger.error('Error fetching random proverb:', error);
    res.status(500).json({ error: 'Failed to fetch random proverb' });
  }
};

/**
 * GET /api/proverbs
 * List all proverbs (with filtering and pagination)
 */
export const listProverbs = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const {
      category,
      search,
      isActive,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      OR: [
        { organizationId },
        { organizationId: null }, // Global proverbs
      ],
    };

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { proverbText: { contains: search as string, mode: 'insensitive' } },
        { teenTitle: { contains: search as string, mode: 'insensitive' } },
        { teenApplication: { contains: search as string, mode: 'insensitive' } },
        { reference: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [proverbs, total] = await Promise.all([
      prisma.proverbOfTheDay.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [
          { isPinned: 'desc' },
          { chapter: 'asc' },
          { verseStart: 'asc' },
        ],
        include: {
          _count: {
            select: {
              views: true,
              interactions: true,
            },
          },
        },
      }),
      prisma.proverbOfTheDay.count({ where }),
    ]);

    res.json({
      proverbs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Error listing proverbs:', error);
    res.status(500).json({ error: 'Failed to list proverbs' });
  }
};

/**
 * GET /api/proverbs/:id
 * Get a specific proverb
 */
export const getProverb = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    const proverb = await prisma.proverbOfTheDay.findFirst({
      where: {
        id,
        OR: [
          { organizationId },
          { organizationId: null },
        ],
      },
      include: {
        _count: {
          select: {
            views: true,
            interactions: true,
          },
        },
      },
    });

    if (!proverb) {
      return res.status(404).json({ error: 'Proverb not found' });
    }

    res.json(proverb);
  } catch (error) {
    logger.error('Error fetching proverb:', error);
    res.status(500).json({ error: 'Failed to fetch proverb' });
  }
};

/**
 * POST /api/proverbs
 * Create a new proverb (admin/teacher only)
 */
export const createProverb = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const {
      chapter,
      verseStart,
      verseEnd,
      reference,
      proverbText,
      translation = 'NIV',
      teenTitle,
      teenApplication,
      modernExample,
      discussionPrompt,
      tags,
      category,
      difficulty = 'MEDIUM',
      scheduledDate,
      isActive = true,
      isPinned = false,
    } = req.body;

    // Validate required fields
    if (!chapter || !verseStart || !reference || !proverbText || !teenTitle || !teenApplication) {
      return res.status(400).json({
        error: 'chapter, verseStart, reference, proverbText, teenTitle, and teenApplication are required',
      });
    }

    const proverb = await prisma.proverbOfTheDay.create({
      data: {
        organizationId,
        chapter: parseInt(chapter, 10),
        verseStart: parseInt(verseStart, 10),
        verseEnd: verseEnd ? parseInt(verseEnd, 10) : null,
        reference,
        proverbText,
        translation,
        teenTitle,
        teenApplication,
        modernExample,
        discussionPrompt,
        tags,
        category,
        difficulty,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        isActive,
        isPinned,
        createdBy: userId,
      },
    });

    logger.info(`Proverb created: ${proverb.id} by user ${userId}`);
    res.status(201).json(proverb);
  } catch (error) {
    logger.error('Error creating proverb:', error);
    res.status(500).json({ error: 'Failed to create proverb' });
  }
};

/**
 * PATCH /api/proverbs/:id
 * Update a proverb (admin/teacher only)
 */
export const updateProverb = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    // Check if proverb exists and belongs to organization
    const existing = await prisma.proverbOfTheDay.findFirst({
      where: {
        id,
        organizationId, // Can only update org-specific proverbs
      },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Proverb not found or you do not have permission to edit it',
      });
    }

    const updateData: any = { ...req.body };

    // Convert date strings to Date objects
    if (updateData.scheduledDate) {
      updateData.scheduledDate = new Date(updateData.scheduledDate);
    }

    // Convert numeric fields
    if (updateData.chapter) updateData.chapter = parseInt(updateData.chapter, 10);
    if (updateData.verseStart) updateData.verseStart = parseInt(updateData.verseStart, 10);
    if (updateData.verseEnd) updateData.verseEnd = parseInt(updateData.verseEnd, 10);

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.organizationId;
    delete updateData.createdBy;
    delete updateData.createdAt;

    const proverb = await prisma.proverbOfTheDay.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Proverb updated: ${proverb.id}`);
    res.json(proverb);
  } catch (error) {
    logger.error('Error updating proverb:', error);
    res.status(500).json({ error: 'Failed to update proverb' });
  }
};

/**
 * DELETE /api/proverbs/:id
 * Delete a proverb (admin only)
 */
export const deleteProverb = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    // Check if proverb exists and belongs to organization
    const existing = await prisma.proverbOfTheDay.findFirst({
      where: {
        id,
        organizationId, // Can only delete org-specific proverbs
      },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Proverb not found or you do not have permission to delete it',
      });
    }

    await prisma.proverbOfTheDay.delete({
      where: { id },
    });

    logger.info(`Proverb deleted: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting proverb:', error);
    res.status(500).json({ error: 'Failed to delete proverb' });
  }
};

/**
 * POST /api/proverbs/:id/view
 * Record a proverb view
 */
export const recordView = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const { id } = req.params;
    const { timeSpentMs } = req.body;

    const view = await proverbService.recordProverbView(
      id,
      userId,
      organizationId,
      timeSpentMs
    );

    res.status(201).json(view);
  } catch (error) {
    logger.error('Error recording proverb view:', error);
    res.status(500).json({ error: 'Failed to record view' });
  }
};

/**
 * POST /api/proverbs/:id/interact
 * Record a proverb interaction (like, share, bookmark, etc.)
 */
export const recordInteraction = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const { id } = req.params;
    const { interactionType, notes, rating } = req.body;

    if (!interactionType) {
      return res.status(400).json({ error: 'interactionType is required' });
    }

    const validTypes = ['like', 'share', 'save', 'discuss', 'bookmark'];
    if (!validTypes.includes(interactionType)) {
      return res.status(400).json({
        error: `Invalid interactionType. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    const interaction = await proverbService.recordProverbInteraction(
      id,
      interactionType,
      userId,
      organizationId,
      notes,
      rating
    );

    res.status(201).json(interaction);
  } catch (error) {
    logger.error('Error recording proverb interaction:', error);
    res.status(500).json({ error: 'Failed to record interaction' });
  }
};

/**
 * GET /api/proverbs/:id/stats
 * Get engagement statistics for a proverb
 */
export const getProverbStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stats = await proverbService.getProverbStats(id);

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching proverb stats:', error);
    res.status(500).json({ error: 'Failed to fetch proverb stats' });
  }
};

/**
 * GET /api/proverbs/category/:category
 * Get proverbs by category
 */
export const getProverbsByCategory = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { category } = req.params;

    const proverbs = await proverbService.getProverbsByCategory(
      organizationId,
      category
    );

    res.json(proverbs);
  } catch (error) {
    logger.error('Error fetching proverbs by category:', error);
    res.status(500).json({ error: 'Failed to fetch proverbs by category' });
  }
};
