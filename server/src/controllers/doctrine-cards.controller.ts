import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Doctrine Cards Controller
 * Manages simple, non-denominational doctrine overview cards
 */

/**
 * GET /api/doctrine-cards
 * List all doctrine cards (public + org-specific)
 */
export const listDoctrineCards = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { category, search } = req.query;

    const where: any = {
      OR: [
        { organizationId: null, isPublic: true }, // Global public cards
        { organizationId, isPublic: false }, // Org-specific cards
      ],
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { shortSummary: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const doctrineCards = await prisma.doctrineCard.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { category: 'asc' },
        { title: 'asc' },
      ],
      select: {
        id: true,
        title: true,
        category: true,
        shortSummary: true,
        displayOrder: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { metrics: true },
        },
      },
    });

    res.json(doctrineCards);
  } catch (error) {
    logger.error('Error listing doctrine cards:', error);
    res.status(500).json({ error: 'Failed to list doctrine cards' });
  }
};

/**
 * GET /api/doctrine-cards/:id
 * Get a specific doctrine card with full details
 */
export const getDoctrineCard = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    const doctrineCard = await prisma.doctrineCard.findFirst({
      where: {
        id,
        OR: [
          { organizationId: null }, // Global cards
          { organizationId }, // Org-specific cards
        ],
      },
    });

    if (!doctrineCard) {
      return res.status(404).json({ error: 'Doctrine card not found' });
    }

    res.json(doctrineCard);
  } catch (error) {
    logger.error('Error fetching doctrine card:', error);
    res.status(500).json({ error: 'Failed to fetch doctrine card' });
  }
};

/**
 * POST /api/doctrine-cards
 * Create a new doctrine card (admin only)
 */
export const createDoctrineCard = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const {
      title,
      category,
      shortSummary,
      fullDescription,
      keyVerses,
      simpleExplanation,
      discussionQuestions,
      relatedDoctrine,
      isPublic,
      displayOrder,
    } = req.body;

    // Validate required fields
    if (!title || !category || !shortSummary || !fullDescription || !keyVerses) {
      return res.status(400).json({
        error: 'title, category, shortSummary, fullDescription, and keyVerses are required',
      });
    }

    // Validate keyVerses is an array
    if (!Array.isArray(keyVerses)) {
      return res.status(400).json({
        error: 'keyVerses must be an array',
      });
    }

    const doctrineCard = await prisma.doctrineCard.create({
      data: {
        title,
        category,
        shortSummary,
        fullDescription,
        keyVerses,
        simpleExplanation,
        discussionQuestions,
        relatedDoctrine,
        isPublic: isPublic !== undefined ? isPublic : true,
        displayOrder: displayOrder || 0,
        organizationId,
        createdBy: userId,
      },
    });

    logger.info(`Doctrine card created: ${doctrineCard.id} by user ${userId}`);
    res.status(201).json(doctrineCard);
  } catch (error) {
    logger.error('Error creating doctrine card:', error);
    res.status(500).json({ error: 'Failed to create doctrine card' });
  }
};

/**
 * PATCH /api/doctrine-cards/:id
 * Update a doctrine card (admin only)
 */
export const updateDoctrineCard = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;
    const {
      title,
      category,
      shortSummary,
      fullDescription,
      keyVerses,
      simpleExplanation,
      discussionQuestions,
      relatedDoctrine,
      isPublic,
      displayOrder,
    } = req.body;

    // Check if doctrine card exists and belongs to org
    const existing = await prisma.doctrineCard.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Doctrine card not found or does not belong to your organization',
      });
    }

    // Validate keyVerses if provided
    if (keyVerses && !Array.isArray(keyVerses)) {
      return res.status(400).json({ error: 'keyVerses must be an array' });
    }

    const doctrineCard = await prisma.doctrineCard.update({
      where: { id },
      data: {
        title,
        category,
        shortSummary,
        fullDescription,
        keyVerses,
        simpleExplanation,
        discussionQuestions,
        relatedDoctrine,
        isPublic,
        displayOrder,
      },
    });

    logger.info(`Doctrine card updated: ${doctrineCard.id}`);
    res.json(doctrineCard);
  } catch (error) {
    logger.error('Error updating doctrine card:', error);
    res.status(500).json({ error: 'Failed to update doctrine card' });
  }
};

/**
 * DELETE /api/doctrine-cards/:id
 * Delete a doctrine card (admin only)
 */
export const deleteDoctrineCard = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    // Check if doctrine card exists and belongs to org
    const existing = await prisma.doctrineCard.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Doctrine card not found or does not belong to your organization',
      });
    }

    await prisma.doctrineCard.delete({
      where: { id },
    });

    logger.info(`Doctrine card deleted: ${id}`);
    res.json({ success: true, message: 'Doctrine card deleted successfully' });
  } catch (error) {
    logger.error('Error deleting doctrine card:', error);
    res.status(500).json({ error: 'Failed to delete doctrine card' });
  }
};

/**
 * POST /api/doctrine-cards/:id/view
 * Record a doctrine card view for metrics
 */
export const recordDoctrineCardView = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const { id: doctrineId } = req.params;
    const { featureContext, timeSpentMs, usedInLesson, lessonId } = req.body;

    // Verify doctrine card exists and is accessible
    const doctrineCard = await prisma.doctrineCard.findFirst({
      where: {
        id: doctrineId,
        OR: [
          { organizationId: null },
          { organizationId },
        ],
      },
    });

    if (!doctrineCard) {
      return res.status(404).json({ error: 'Doctrine card not found' });
    }

    // Create metric
    const metric = await prisma.doctrineMetric.create({
      data: {
        doctrineId,
        organizationId,
        userId,
        featureContext: featureContext || 'doctrine_list',
        timeSpentMs: timeSpentMs || 0,
        viewCount: 1,
        usedInLesson: usedInLesson || false,
        lessonId: lessonId || null,
      },
    });

    res.json({ success: true, metricId: metric.id });
  } catch (error) {
    logger.error('Error recording doctrine card view:', error);
    res.status(500).json({ error: 'Failed to record doctrine card view' });
  }
};

/**
 * GET /api/doctrine-cards/:id/metrics
 * Get metrics for a specific doctrine card (admin only)
 */
export const getDoctrineCardMetrics = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id: doctrineId } = req.params;
    const { startDate, endDate, limit = 100, offset = 0 } = req.query;

    // Verify doctrine card belongs to org or is global
    const doctrineCard = await prisma.doctrineCard.findFirst({
      where: {
        id: doctrineId,
        OR: [
          { organizationId: null },
          { organizationId },
        ],
      },
    });

    if (!doctrineCard) {
      return res.status(404).json({ error: 'Doctrine card not found' });
    }

    const where: any = { doctrineId, organizationId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const [metrics, total] = await Promise.all([
      prisma.doctrineMetric.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.doctrineMetric.count({ where }),
    ]);

    res.json({
      metrics,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    logger.error('Error fetching doctrine card metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

/**
 * GET /api/doctrine-cards/metrics/summary
 * Get aggregated metrics across all doctrine cards (admin only)
 */
export const getDoctrineCardMetricsSummary = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { startDate, endDate } = req.query;

    const where: any = { organizationId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    // Get total views per doctrine card
    const viewsByDoctrine = await prisma.doctrineMetric.groupBy({
      by: ['doctrineId'],
      where,
      _sum: {
        viewCount: true,
        timeSpentMs: true,
      },
      _count: {
        id: true,
      },
    });

    // Get doctrine card details
    const doctrineIds = viewsByDoctrine.map((v) => v.doctrineId);
    const doctrineCards = await prisma.doctrineCard.findMany({
      where: {
        id: { in: doctrineIds },
        OR: [
          { organizationId: null },
          { organizationId },
        ],
      },
      select: {
        id: true,
        title: true,
        category: true,
      },
    });

    // Combine data
    const summary = viewsByDoctrine.map((view) => {
      const doctrineCard = doctrineCards.find((d) => d.id === view.doctrineId);
      return {
        doctrineId: view.doctrineId,
        title: doctrineCard?.title || 'Unknown',
        category: doctrineCard?.category,
        totalViews: view._sum.viewCount || 0,
        totalTimeSpentMs: view._sum.timeSpentMs || 0,
        avgTimeSpentMs:
          view._count.id > 0
            ? Math.round((view._sum.timeSpentMs || 0) / view._count.id)
            : 0,
        uniqueViewers: view._count.id,
      };
    });

    // Get usage in lessons
    const lessonUsage = await prisma.doctrineMetric.count({
      where: {
        ...where,
        usedInLesson: true,
      },
    });

    // Get views by feature context
    const viewsByContext = await prisma.doctrineMetric.groupBy({
      by: ['featureContext'],
      where,
      _count: {
        id: true,
      },
    });

    res.json({
      summary,
      lessonUsage,
      viewsByContext: viewsByContext.map((v) => ({
        context: v.featureContext,
        count: v._count.id,
      })),
      totalDoctrineCards: doctrineCards.length,
    });
  } catch (error) {
    logger.error('Error fetching doctrine card metrics summary:', error);
    res.status(500).json({ error: 'Failed to fetch metrics summary' });
  }
};
