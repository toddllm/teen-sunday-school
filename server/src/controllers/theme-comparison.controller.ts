import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Comparative Theme View Controller
 * Manages OT vs NT theme comparisons
 */

/**
 * GET /api/themes
 * List all comparative themes (public + org-specific)
 */
export const listThemes = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { category, search } = req.query;

    const where: any = {
      OR: [
        { organizationId, isPublic: false }, // Org-specific themes
        { isPublic: true }, // Public themes
      ],
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { themeName: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const themes = await prisma.comparativeTheme.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { themeName: 'asc' },
      ],
      select: {
        id: true,
        themeName: true,
        description: true,
        category: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { metrics: true },
        },
      },
    });

    res.json(themes);
  } catch (error) {
    logger.error('Error listing themes:', error);
    res.status(500).json({ error: 'Failed to list themes' });
  }
};

/**
 * GET /api/themes/:id
 * Get a specific theme with full details
 */
export const getTheme = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    const theme = await prisma.comparativeTheme.findFirst({
      where: {
        id,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
    });

    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    res.json(theme);
  } catch (error) {
    logger.error('Error fetching theme:', error);
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
};

/**
 * POST /api/themes
 * Create a new comparative theme (admin only)
 */
export const createTheme = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const {
      themeName,
      description,
      category,
      otPassages,
      ntPassages,
      themeNotes,
      isPublic,
    } = req.body;

    // Validate required fields
    if (!themeName || !otPassages || !ntPassages) {
      return res.status(400).json({
        error: 'themeName, otPassages, and ntPassages are required',
      });
    }

    // Validate passages are arrays
    if (!Array.isArray(otPassages) || !Array.isArray(ntPassages)) {
      return res.status(400).json({
        error: 'otPassages and ntPassages must be arrays',
      });
    }

    const theme = await prisma.comparativeTheme.create({
      data: {
        organizationId,
        themeName,
        description,
        category,
        otPassages,
        ntPassages,
        themeNotes,
        isPublic: isPublic || false,
        createdBy: userId,
      },
    });

    logger.info(`Theme created: ${theme.id} by user ${userId}`);
    res.status(201).json(theme);
  } catch (error) {
    logger.error('Error creating theme:', error);
    res.status(500).json({ error: 'Failed to create theme' });
  }
};

/**
 * PATCH /api/themes/:id
 * Update a theme (admin only)
 */
export const updateTheme = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;
    const {
      themeName,
      description,
      category,
      otPassages,
      ntPassages,
      themeNotes,
      isPublic,
    } = req.body;

    // Check if theme exists and belongs to org
    const existing = await prisma.comparativeTheme.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Theme not found or does not belong to your organization',
      });
    }

    // Validate passages if provided
    if (otPassages && !Array.isArray(otPassages)) {
      return res.status(400).json({ error: 'otPassages must be an array' });
    }
    if (ntPassages && !Array.isArray(ntPassages)) {
      return res.status(400).json({ error: 'ntPassages must be an array' });
    }

    const theme = await prisma.comparativeTheme.update({
      where: { id },
      data: {
        themeName,
        description,
        category,
        otPassages,
        ntPassages,
        themeNotes,
        isPublic,
      },
    });

    logger.info(`Theme updated: ${theme.id}`);
    res.json(theme);
  } catch (error) {
    logger.error('Error updating theme:', error);
    res.status(500).json({ error: 'Failed to update theme' });
  }
};

/**
 * DELETE /api/themes/:id
 * Delete a theme (admin only)
 */
export const deleteTheme = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    // Check if theme exists and belongs to org
    const existing = await prisma.comparativeTheme.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Theme not found or does not belong to your organization',
      });
    }

    await prisma.comparativeTheme.delete({
      where: { id },
    });

    logger.info(`Theme deleted: ${id}`);
    res.json({ success: true, message: 'Theme deleted successfully' });
  } catch (error) {
    logger.error('Error deleting theme:', error);
    res.status(500).json({ error: 'Failed to delete theme' });
  }
};

/**
 * POST /api/themes/:id/view
 * Record a theme view for metrics
 */
export const recordThemeView = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const { id: themeId } = req.params;
    const { featureContext, timeSpentMs, usedInLesson, lessonId } = req.body;

    // Verify theme exists and is accessible
    const theme = await prisma.comparativeTheme.findFirst({
      where: {
        id: themeId,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
    });

    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    // Create or update metric
    const metric = await prisma.themeMetric.create({
      data: {
        themeId,
        organizationId,
        userId,
        featureContext: featureContext || 'direct',
        timeSpentMs: timeSpentMs || 0,
        viewCount: 1,
        usedInLesson: usedInLesson || false,
        lessonId: lessonId || null,
      },
    });

    res.json({ success: true, metricId: metric.id });
  } catch (error) {
    logger.error('Error recording theme view:', error);
    res.status(500).json({ error: 'Failed to record theme view' });
  }
};

/**
 * GET /api/themes/:id/metrics
 * Get metrics for a specific theme (admin only)
 */
export const getThemeMetrics = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id: themeId } = req.params;
    const { startDate, endDate, limit = 100, offset = 0 } = req.query;

    // Verify theme belongs to org
    const theme = await prisma.comparativeTheme.findFirst({
      where: { id: themeId, organizationId },
    });

    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    const where: any = { themeId, organizationId };

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
      prisma.themeMetric.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.themeMetric.count({ where }),
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
    logger.error('Error fetching theme metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

/**
 * GET /api/themes/metrics/summary
 * Get aggregated metrics across all themes (admin only)
 */
export const getThemeMetricsSummary = async (req: Request, res: Response) => {
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

    // Get total views per theme
    const viewsByTheme = await prisma.themeMetric.groupBy({
      by: ['themeId'],
      where,
      _sum: {
        viewCount: true,
        timeSpentMs: true,
      },
      _count: {
        id: true,
      },
    });

    // Get theme details
    const themeIds = viewsByTheme.map((v) => v.themeId);
    const themes = await prisma.comparativeTheme.findMany({
      where: {
        id: { in: themeIds },
        organizationId,
      },
      select: {
        id: true,
        themeName: true,
        category: true,
      },
    });

    // Combine data
    const summary = viewsByTheme.map((view) => {
      const theme = themes.find((t) => t.id === view.themeId);
      return {
        themeId: view.themeId,
        themeName: theme?.themeName || 'Unknown',
        category: theme?.category,
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
    const lessonUsage = await prisma.themeMetric.count({
      where: {
        ...where,
        usedInLesson: true,
      },
    });

    // Get views by feature context
    const viewsByContext = await prisma.themeMetric.groupBy({
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
      totalThemes: themes.length,
    });
  } catch (error) {
    logger.error('Error fetching theme metrics summary:', error);
    res.status(500).json({ error: 'Failed to fetch metrics summary' });
  }
};
