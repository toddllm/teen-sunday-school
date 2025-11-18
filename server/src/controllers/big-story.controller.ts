import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Big Story Overview Controller
 * Manages Creation → New Creation narrative sections
 */

/**
 * GET /api/big-story
 * List all big story sections (public + org-specific)
 */
export const listSections = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { timelineEra, search } = req.query;

    const where: any = {
      OR: [
        { organizationId, isPublic: false }, // Org-specific sections
        { isPublic: true }, // Public sections
      ],
    };

    if (timelineEra) {
      where.timelineEra = timelineEra;
    }

    if (search) {
      where.OR = [
        { sectionTitle: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const sections = await prisma.bigStorySection.findMany({
      where,
      orderBy: [
        { order: 'asc' },
      ],
      select: {
        id: true,
        sectionTitle: true,
        sectionSlug: true,
        order: true,
        timelineEra: true,
        description: true,
        visualData: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { metrics: true },
        },
      },
    });

    res.json(sections);
  } catch (error) {
    logger.error('Error listing big story sections:', error);
    res.status(500).json({ error: 'Failed to list sections' });
  }
};

/**
 * GET /api/big-story/:id
 * Get a specific section with full details
 */
export const getSection = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    // Try to find by ID first, then by slug
    const section = await prisma.bigStorySection.findFirst({
      where: {
        OR: [
          { id },
          { sectionSlug: id },
        ],
        AND: {
          OR: [
            { organizationId },
            { isPublic: true },
          ],
        },
      },
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.json(section);
  } catch (error) {
    logger.error('Error fetching big story section:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
};

/**
 * POST /api/big-story
 * Create a new big story section (admin only)
 */
export const createSection = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const {
      sectionTitle,
      sectionSlug,
      order,
      timelineEra,
      description,
      keyPassages,
      keyEvents,
      narrative,
      visualData,
      isPublic,
    } = req.body;

    // Validate required fields
    if (!sectionTitle || !sectionSlug || order === undefined || !timelineEra) {
      return res.status(400).json({
        error: 'sectionTitle, sectionSlug, order, and timelineEra are required',
      });
    }

    // Validate arrays
    if (keyPassages && !Array.isArray(keyPassages)) {
      return res.status(400).json({ error: 'keyPassages must be an array' });
    }
    if (keyEvents && !Array.isArray(keyEvents)) {
      return res.status(400).json({ error: 'keyEvents must be an array' });
    }

    // Check if slug already exists for this org
    const existing = await prisma.bigStorySection.findUnique({
      where: {
        organizationId_sectionSlug: {
          organizationId,
          sectionSlug,
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        error: 'A section with this slug already exists',
      });
    }

    const section = await prisma.bigStorySection.create({
      data: {
        organizationId,
        sectionTitle,
        sectionSlug,
        order,
        timelineEra,
        description,
        keyPassages: keyPassages || [],
        keyEvents: keyEvents || [],
        narrative: narrative || {},
        visualData: visualData || {},
        isPublic: isPublic || false,
        createdBy: userId,
      },
    });

    logger.info(`Big story section created: ${section.id} by user ${userId}`);
    res.status(201).json(section);
  } catch (error) {
    logger.error('Error creating big story section:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
};

/**
 * PATCH /api/big-story/:id
 * Update a section (admin only)
 */
export const updateSection = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;
    const {
      sectionTitle,
      sectionSlug,
      order,
      timelineEra,
      description,
      keyPassages,
      keyEvents,
      narrative,
      visualData,
      isPublic,
    } = req.body;

    // Check if section exists and belongs to org
    const existing = await prisma.bigStorySection.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Section not found or does not belong to your organization',
      });
    }

    // Validate arrays if provided
    if (keyPassages && !Array.isArray(keyPassages)) {
      return res.status(400).json({ error: 'keyPassages must be an array' });
    }
    if (keyEvents && !Array.isArray(keyEvents)) {
      return res.status(400).json({ error: 'keyEvents must be an array' });
    }

    // If updating slug, check it's not already taken
    if (sectionSlug && sectionSlug !== existing.sectionSlug) {
      const slugTaken = await prisma.bigStorySection.findUnique({
        where: {
          organizationId_sectionSlug: {
            organizationId,
            sectionSlug,
          },
        },
      });

      if (slugTaken) {
        return res.status(400).json({
          error: 'A section with this slug already exists',
        });
      }
    }

    const section = await prisma.bigStorySection.update({
      where: { id },
      data: {
        sectionTitle,
        sectionSlug,
        order,
        timelineEra,
        description,
        keyPassages,
        keyEvents,
        narrative,
        visualData,
        isPublic,
      },
    });

    logger.info(`Big story section updated: ${section.id}`);
    res.json(section);
  } catch (error) {
    logger.error('Error updating big story section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
};

/**
 * DELETE /api/big-story/:id
 * Delete a section (admin only)
 */
export const deleteSection = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    // Check if section exists and belongs to org
    const existing = await prisma.bigStorySection.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Section not found or does not belong to your organization',
      });
    }

    await prisma.bigStorySection.delete({
      where: { id },
    });

    logger.info(`Big story section deleted: ${id}`);
    res.json({ success: true, message: 'Section deleted successfully' });
  } catch (error) {
    logger.error('Error deleting big story section:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
};

/**
 * POST /api/big-story/:id/view
 * Record a section view for metrics
 */
export const recordSectionView = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const { id: sectionId } = req.params;
    const { featureContext, timeSpentMs, usedInLesson, lessonId } = req.body;

    // Verify section exists and is accessible
    const section = await prisma.bigStorySection.findFirst({
      where: {
        id: sectionId,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Create metric
    const metric = await prisma.bigStoryMetric.create({
      data: {
        sectionId,
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
    logger.error('Error recording section view:', error);
    res.status(500).json({ error: 'Failed to record section view' });
  }
};

/**
 * GET /api/big-story/:id/metrics
 * Get metrics for a specific section (admin only)
 */
export const getSectionMetrics = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id: sectionId } = req.params;
    const { startDate, endDate, limit = 100, offset = 0 } = req.query;

    // Verify section belongs to org
    const section = await prisma.bigStorySection.findFirst({
      where: { id: sectionId, organizationId },
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const where: any = { sectionId, organizationId };

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
      prisma.bigStoryMetric.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.bigStoryMetric.count({ where }),
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
    logger.error('Error fetching section metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

/**
 * GET /api/big-story/metrics/summary
 * Get aggregated metrics across all sections (admin only)
 */
export const getSectionMetricsSummary = async (req: Request, res: Response) => {
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

    // Get total views per section
    const viewsBySection = await prisma.bigStoryMetric.groupBy({
      by: ['sectionId'],
      where,
      _sum: {
        viewCount: true,
        timeSpentMs: true,
      },
      _count: {
        id: true,
      },
    });

    // Get section details
    const sectionIds = viewsBySection.map((v) => v.sectionId);
    const sections = await prisma.bigStorySection.findMany({
      where: {
        id: { in: sectionIds },
        organizationId,
      },
      select: {
        id: true,
        sectionTitle: true,
        order: true,
        timelineEra: true,
      },
    });

    // Combine data
    const summary = viewsBySection.map((view) => {
      const section = sections.find((s) => s.id === view.sectionId);
      return {
        sectionId: view.sectionId,
        sectionTitle: section?.sectionTitle || 'Unknown',
        order: section?.order || 0,
        timelineEra: section?.timelineEra,
        totalViews: view._sum.viewCount || 0,
        totalTimeSpentMs: view._sum.timeSpentMs || 0,
        avgTimeSpentMs:
          view._count.id > 0
            ? Math.round((view._sum.timeSpentMs || 0) / view._count.id)
            : 0,
        uniqueViewers: view._count.id,
      };
    });

    // Sort by section order
    summary.sort((a, b) => a.order - b.order);

    // Get usage in lessons
    const lessonUsage = await prisma.bigStoryMetric.count({
      where: {
        ...where,
        usedInLesson: true,
      },
    });

    // Get views by feature context
    const viewsByContext = await prisma.bigStoryMetric.groupBy({
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
      totalSections: sections.length,
    });
  } catch (error) {
    logger.error('Error fetching section metrics summary:', error);
    res.status(500).json({ error: 'Failed to fetch metrics summary' });
  }
};
