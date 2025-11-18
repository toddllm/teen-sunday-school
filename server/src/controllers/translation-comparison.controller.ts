import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Translation Comparison Notes Controller
 * Manages teen-friendly translation comparison notes
 */

/**
 * GET /api/translation-comparisons
 * List all translation comparison notes (public + org-specific)
 */
export const listComparisonNotes = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { category, difficulty, passageRef, search } = req.query;

    const where: any = {
      OR: [
        { organizationId, isPublic: false }, // Org-specific notes
        { isPublic: true }, // Public notes
      ],
    };

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (passageRef) {
      where.passageRef = { contains: passageRef as string, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { passageRef: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const notes = await prisma.translationComparisonNote.findMany({
      where,
      orderBy: [
        { difficulty: 'asc' },
        { passageRef: 'asc' },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        passageRef: true,
        category: true,
        difficulty: true,
        tags: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { metrics: true },
        },
      },
    });

    res.json(notes);
  } catch (error) {
    logger.error('Error listing comparison notes:', error);
    res.status(500).json({ error: 'Failed to list comparison notes' });
  }
};

/**
 * GET /api/translation-comparisons/:id
 * Get a specific comparison note with full details
 */
export const getComparisonNote = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    const note = await prisma.translationComparisonNote.findFirst({
      where: {
        id,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
    });

    if (!note) {
      return res.status(404).json({ error: 'Comparison note not found' });
    }

    res.json(note);
  } catch (error) {
    logger.error('Error fetching comparison note:', error);
    res.status(500).json({ error: 'Failed to fetch comparison note' });
  }
};

/**
 * POST /api/translation-comparisons
 * Create a new comparison note (admin only)
 */
export const createComparisonNote = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const {
      title,
      description,
      passageRef,
      translations,
      comparisonPoints,
      teenSummary,
      whyItMatters,
      keyTakeaway,
      category,
      difficulty,
      tags,
      isPublic,
    } = req.body;

    // Validate required fields
    if (!title || !passageRef || !translations || !comparisonPoints) {
      return res.status(400).json({
        error: 'title, passageRef, translations, and comparisonPoints are required',
      });
    }

    // Validate arrays
    if (!Array.isArray(translations) || !Array.isArray(comparisonPoints)) {
      return res.status(400).json({
        error: 'translations and comparisonPoints must be arrays',
      });
    }

    // Validate at least 2 translations
    if (translations.length < 2) {
      return res.status(400).json({
        error: 'At least 2 translations are required for comparison',
      });
    }

    const note = await prisma.translationComparisonNote.create({
      data: {
        organizationId,
        title,
        description,
        passageRef,
        translations,
        comparisonPoints,
        teenSummary,
        whyItMatters,
        keyTakeaway,
        category,
        difficulty: difficulty || 'beginner',
        tags: tags || [],
        isPublic: isPublic || false,
        createdBy: userId,
      },
    });

    logger.info(`Translation comparison note created: ${note.id} by user ${userId}`);
    res.status(201).json(note);
  } catch (error) {
    logger.error('Error creating comparison note:', error);
    res.status(500).json({ error: 'Failed to create comparison note' });
  }
};

/**
 * PATCH /api/translation-comparisons/:id
 * Update a comparison note (admin only)
 */
export const updateComparisonNote = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;
    const {
      title,
      description,
      passageRef,
      translations,
      comparisonPoints,
      teenSummary,
      whyItMatters,
      keyTakeaway,
      category,
      difficulty,
      tags,
      isPublic,
    } = req.body;

    // Check if note exists and belongs to org
    const existing = await prisma.translationComparisonNote.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Comparison note not found or does not belong to your organization',
      });
    }

    // Validate arrays if provided
    if (translations && !Array.isArray(translations)) {
      return res.status(400).json({ error: 'translations must be an array' });
    }
    if (comparisonPoints && !Array.isArray(comparisonPoints)) {
      return res.status(400).json({ error: 'comparisonPoints must be an array' });
    }
    if (translations && translations.length < 2) {
      return res.status(400).json({
        error: 'At least 2 translations are required for comparison',
      });
    }

    const note = await prisma.translationComparisonNote.update({
      where: { id },
      data: {
        title,
        description,
        passageRef,
        translations,
        comparisonPoints,
        teenSummary,
        whyItMatters,
        keyTakeaway,
        category,
        difficulty,
        tags,
        isPublic,
      },
    });

    logger.info(`Translation comparison note updated: ${note.id}`);
    res.json(note);
  } catch (error) {
    logger.error('Error updating comparison note:', error);
    res.status(500).json({ error: 'Failed to update comparison note' });
  }
};

/**
 * DELETE /api/translation-comparisons/:id
 * Delete a comparison note (admin only)
 */
export const deleteComparisonNote = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    // Check if note exists and belongs to org
    const existing = await prisma.translationComparisonNote.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Comparison note not found or does not belong to your organization',
      });
    }

    await prisma.translationComparisonNote.delete({
      where: { id },
    });

    logger.info(`Translation comparison note deleted: ${id}`);
    res.json({ success: true, message: 'Comparison note deleted successfully' });
  } catch (error) {
    logger.error('Error deleting comparison note:', error);
    res.status(500).json({ error: 'Failed to delete comparison note' });
  }
};

/**
 * POST /api/translation-comparisons/:id/view
 * Record a comparison note view for metrics
 */
export const recordComparisonNoteView = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const { id: noteId } = req.params;
    const { featureContext, timeSpentMs, usedInLesson, lessonId, wasHelpful } = req.body;

    // Verify note exists and is accessible
    const note = await prisma.translationComparisonNote.findFirst({
      where: {
        id: noteId,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
    });

    if (!note) {
      return res.status(404).json({ error: 'Comparison note not found' });
    }

    // Create metric
    const metric = await prisma.comparisonNoteMetric.create({
      data: {
        noteId,
        organizationId,
        userId,
        featureContext: featureContext || 'browse',
        timeSpentMs: timeSpentMs || 0,
        viewCount: 1,
        usedInLesson: usedInLesson || false,
        lessonId: lessonId || null,
        wasHelpful: wasHelpful !== undefined ? wasHelpful : null,
      },
    });

    res.json({ success: true, metricId: metric.id });
  } catch (error) {
    logger.error('Error recording comparison note view:', error);
    res.status(500).json({ error: 'Failed to record comparison note view' });
  }
};

/**
 * GET /api/translation-comparisons/:id/metrics
 * Get metrics for a specific comparison note (admin only)
 */
export const getComparisonNoteMetrics = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id: noteId } = req.params;
    const { startDate, endDate, limit = 100, offset = 0 } = req.query;

    // Verify note belongs to org
    const note = await prisma.translationComparisonNote.findFirst({
      where: { id: noteId, organizationId },
    });

    if (!note) {
      return res.status(404).json({ error: 'Comparison note not found' });
    }

    const where: any = { noteId, organizationId };

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
      prisma.comparisonNoteMetric.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.comparisonNoteMetric.count({ where }),
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
    logger.error('Error fetching comparison note metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

/**
 * GET /api/translation-comparisons/metrics/summary
 * Get aggregated metrics across all comparison notes (admin only)
 */
export const getComparisonNoteMetricsSummary = async (req: Request, res: Response) => {
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

    // Get total views per note
    const viewsByNote = await prisma.comparisonNoteMetric.groupBy({
      by: ['noteId'],
      where,
      _sum: {
        viewCount: true,
        timeSpentMs: true,
      },
      _count: {
        id: true,
      },
    });

    // Get note details
    const noteIds = viewsByNote.map((v) => v.noteId);
    const notes = await prisma.translationComparisonNote.findMany({
      where: {
        id: { in: noteIds },
        organizationId,
      },
      select: {
        id: true,
        title: true,
        passageRef: true,
        category: true,
        difficulty: true,
      },
    });

    // Combine data
    const summary = viewsByNote.map((view) => {
      const note = notes.find((n) => n.id === view.noteId);
      return {
        noteId: view.noteId,
        title: note?.title || 'Unknown',
        passageRef: note?.passageRef,
        category: note?.category,
        difficulty: note?.difficulty,
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
    const lessonUsage = await prisma.comparisonNoteMetric.count({
      where: {
        ...where,
        usedInLesson: true,
      },
    });

    // Get views by feature context
    const viewsByContext = await prisma.comparisonNoteMetric.groupBy({
      by: ['featureContext'],
      where,
      _count: {
        id: true,
      },
    });

    // Get helpfulness stats
    const helpfulnessStats = await prisma.comparisonNoteMetric.groupBy({
      by: ['wasHelpful'],
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
      helpfulness: helpfulnessStats.map((h) => ({
        wasHelpful: h.wasHelpful,
        count: h._count.id,
      })),
      totalNotes: notes.length,
    });
  } catch (error) {
    logger.error('Error fetching comparison note metrics summary:', error);
    res.status(500).json({ error: 'Failed to fetch metrics summary' });
  }
};
