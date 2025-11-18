import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Parables Explorer Controller
 * Manages biblical parables with interpretation and context
 */

/**
 * GET /api/parables
 * List all parables (public + org-specific)
 */
export const listParables = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { category, search } = req.query;

    const where: any = {
      OR: [
        { organizationId, isPublic: false }, // Org-specific parables
        { isPublic: true }, // Public parables
      ],
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { reference: { contains: search as string, mode: 'insensitive' } },
        { parableText: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const parables = await prisma.parable.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { title: 'asc' },
      ],
      select: {
        id: true,
        title: true,
        reference: true,
        category: true,
        keyTheme: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { metrics: true },
        },
      },
    });

    res.json(parables);
  } catch (error) {
    logger.error('Error listing parables:', error);
    res.status(500).json({ error: 'Failed to list parables' });
  }
};

/**
 * GET /api/parables/:id
 * Get a specific parable with full details
 */
export const getParable = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    const parable = await prisma.parable.findFirst({
      where: {
        id,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
    });

    if (!parable) {
      return res.status(404).json({ error: 'Parable not found' });
    }

    res.json(parable);
  } catch (error) {
    logger.error('Error fetching parable:', error);
    res.status(500).json({ error: 'Failed to fetch parable' });
  }
};

/**
 * POST /api/parables
 * Create a new parable (admin only)
 */
export const createParable = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const {
      title,
      reference,
      category,
      parableText,
      interpretation,
      historicalContext,
      applicationPoints,
      keyTheme,
      crossReferences,
      relatedParables,
      isPublic,
    } = req.body;

    // Validate required fields
    if (!title || !reference || !parableText) {
      return res.status(400).json({
        error: 'title, reference, and parableText are required',
      });
    }

    // Validate arrays if provided
    if (applicationPoints && !Array.isArray(applicationPoints)) {
      return res.status(400).json({
        error: 'applicationPoints must be an array',
      });
    }
    if (crossReferences && !Array.isArray(crossReferences)) {
      return res.status(400).json({
        error: 'crossReferences must be an array',
      });
    }
    if (relatedParables && !Array.isArray(relatedParables)) {
      return res.status(400).json({
        error: 'relatedParables must be an array',
      });
    }

    const parable = await prisma.parable.create({
      data: {
        organizationId,
        title,
        reference,
        category,
        parableText,
        interpretation,
        historicalContext,
        applicationPoints,
        keyTheme,
        crossReferences,
        relatedParables,
        isPublic: isPublic || false,
        createdBy: userId,
      },
    });

    logger.info(`Parable created: ${parable.id} by user ${userId}`);
    res.status(201).json(parable);
  } catch (error) {
    logger.error('Error creating parable:', error);
    res.status(500).json({ error: 'Failed to create parable' });
  }
};

/**
 * PATCH /api/parables/:id
 * Update a parable (admin only)
 */
export const updateParable = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;
    const {
      title,
      reference,
      category,
      parableText,
      interpretation,
      historicalContext,
      applicationPoints,
      keyTheme,
      crossReferences,
      relatedParables,
      isPublic,
    } = req.body;

    // Check if parable exists and belongs to org
    const existing = await prisma.parable.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Parable not found or does not belong to your organization',
      });
    }

    // Validate arrays if provided
    if (applicationPoints && !Array.isArray(applicationPoints)) {
      return res.status(400).json({ error: 'applicationPoints must be an array' });
    }
    if (crossReferences && !Array.isArray(crossReferences)) {
      return res.status(400).json({ error: 'crossReferences must be an array' });
    }
    if (relatedParables && !Array.isArray(relatedParables)) {
      return res.status(400).json({ error: 'relatedParables must be an array' });
    }

    const parable = await prisma.parable.update({
      where: { id },
      data: {
        title,
        reference,
        category,
        parableText,
        interpretation,
        historicalContext,
        applicationPoints,
        keyTheme,
        crossReferences,
        relatedParables,
        isPublic,
      },
    });

    logger.info(`Parable updated: ${parable.id}`);
    res.json(parable);
  } catch (error) {
    logger.error('Error updating parable:', error);
    res.status(500).json({ error: 'Failed to update parable' });
  }
};

/**
 * DELETE /api/parables/:id
 * Delete a parable (admin only)
 */
export const deleteParable = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    // Check if parable exists and belongs to org
    const existing = await prisma.parable.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Parable not found or does not belong to your organization',
      });
    }

    await prisma.parable.delete({
      where: { id },
    });

    logger.info(`Parable deleted: ${id}`);
    res.json({ success: true, message: 'Parable deleted successfully' });
  } catch (error) {
    logger.error('Error deleting parable:', error);
    res.status(500).json({ error: 'Failed to delete parable' });
  }
};

/**
 * POST /api/parables/:id/view
 * Record a parable view for metrics
 */
export const recordParableView = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const { id: parableId } = req.params;
    const { featureContext, timeSpentMs, usedInLesson, lessonId } = req.body;

    // Verify parable exists and is accessible
    const parable = await prisma.parable.findFirst({
      where: {
        id: parableId,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
    });

    if (!parable) {
      return res.status(404).json({ error: 'Parable not found' });
    }

    // Create metric
    const metric = await prisma.parableMetric.create({
      data: {
        parableId,
        organizationId,
        userId,
        featureContext: featureContext || 'explorer',
        timeSpentMs: timeSpentMs || 0,
        viewCount: 1,
        usedInLesson: usedInLesson || false,
        lessonId: lessonId || null,
      },
    });

    res.json({ success: true, metricId: metric.id });
  } catch (error) {
    logger.error('Error recording parable view:', error);
    res.status(500).json({ error: 'Failed to record parable view' });
  }
};

/**
 * GET /api/parables/:id/metrics
 * Get metrics for a specific parable (admin only)
 */
export const getParableMetrics = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id: parableId } = req.params;
    const { startDate, endDate, limit = 100, offset = 0 } = req.query;

    // Verify parable belongs to org
    const parable = await prisma.parable.findFirst({
      where: { id: parableId, organizationId },
    });

    if (!parable) {
      return res.status(404).json({ error: 'Parable not found' });
    }

    const where: any = { parableId, organizationId };

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
      prisma.parableMetric.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.parableMetric.count({ where }),
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
    logger.error('Error fetching parable metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

/**
 * GET /api/parables/metrics/summary
 * Get aggregated metrics across all parables (admin only)
 */
export const getParableMetricsSummary = async (req: Request, res: Response) => {
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

    // Get total views per parable
    const viewsByParable = await prisma.parableMetric.groupBy({
      by: ['parableId'],
      where,
      _sum: {
        viewCount: true,
        timeSpentMs: true,
      },
      _count: {
        id: true,
      },
    });

    // Get parable details
    const parableIds = viewsByParable.map((v) => v.parableId);
    const parables = await prisma.parable.findMany({
      where: {
        id: { in: parableIds },
        organizationId,
      },
      select: {
        id: true,
        title: true,
        category: true,
        reference: true,
      },
    });

    // Combine data
    const summary = viewsByParable.map((view) => {
      const parable = parables.find((p) => p.id === view.parableId);
      return {
        parableId: view.parableId,
        title: parable?.title || 'Unknown',
        reference: parable?.reference,
        category: parable?.category,
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
    const lessonUsage = await prisma.parableMetric.count({
      where: {
        ...where,
        usedInLesson: true,
      },
    });

    // Get views by feature context
    const viewsByContext = await prisma.parableMetric.groupBy({
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
      totalParables: parables.length,
    });
  } catch (error) {
    logger.error('Error fetching parable metrics summary:', error);
    res.status(500).json({ error: 'Failed to fetch metrics summary' });
  }
};
