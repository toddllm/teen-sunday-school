import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get the current week's word
 * GET /api/weekly-word/current
 */
export const getCurrentWord = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    // Find the featured word for the current week
    const word = await prisma.weeklyWord.findFirst({
      where: {
        isActive: true,
        isFeatured: true,
        weekStart: {
          lte: now,
        },
        weekEnd: {
          gte: now,
        },
        OR: [
          { organizationId: null }, // Global words
          { organizationId: req.user?.organizationId }, // Org-specific
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!word) {
      return res.status(404).json({
        success: false,
        message: 'No weekly word found for the current week',
      });
    }

    // Track the view
    if (req.user?.id) {
      await trackWordEvent({
        wordId: word.id,
        userId: req.user.id,
        eventType: 'VIEW',
        viewSource: req.query.source as string || 'unknown',
      });
    }

    res.json({
      success: true,
      data: word,
    });
  } catch (error) {
    console.error('Error fetching current word:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current word',
    });
  }
};

/**
 * Get archive of past weekly words
 * GET /api/weekly-word/archive
 */
export const getWordArchive = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      OR: [
        { organizationId: null },
        { organizationId: req.user?.organizationId },
      ],
    };

    const [words, total] = await Promise.all([
      prisma.weeklyWord.findMany({
        where,
        orderBy: {
          weekStart: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.weeklyWord.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        words,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching word archive:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch word archive',
    });
  }
};

/**
 * Get a specific word by ID
 * GET /api/weekly-word/:id
 */
export const getWordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const word = await prisma.weeklyWord.findFirst({
      where: {
        id,
        isActive: true,
        OR: [
          { organizationId: null },
          { organizationId: req.user?.organizationId },
        ],
      },
    });

    if (!word) {
      return res.status(404).json({
        success: false,
        message: 'Word not found',
      });
    }

    // Track archive view
    if (req.user?.id) {
      await trackWordEvent({
        wordId: word.id,
        userId: req.user.id,
        eventType: 'ARCHIVE_VIEW',
        viewSource: 'archive',
      });
    }

    res.json({
      success: true,
      data: word,
    });
  } catch (error) {
    console.error('Error fetching word:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch word',
    });
  }
};

/**
 * Track a verse click or other interaction
 * POST /api/weekly-word/:id/track
 */
export const trackWordInteraction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { eventType, verseRef, viewSource } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        message: 'eventType is required',
      });
    }

    await trackWordEvent({
      wordId: id,
      userId: req.user?.id,
      eventType,
      verseRef,
      viewSource,
    });

    res.json({
      success: true,
      message: 'Interaction tracked',
    });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track interaction',
    });
  }
};

/**
 * Create a new weekly word (Admin only)
 * POST /api/weekly-word
 */
export const createWord = async (req: Request, res: Response) => {
  try {
    const {
      lemma,
      language,
      transliteration,
      gloss,
      blurb,
      verseRefs,
      verseTexts,
      weekStart,
      weekEnd,
      organizationId,
    } = req.body;

    // Validation
    if (!lemma || !language || !transliteration || !gloss || !blurb || !verseRefs || !weekStart) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if word already exists for this week
    const existing = await prisma.weeklyWord.findFirst({
      where: {
        weekStart: new Date(weekStart),
        organizationId: organizationId || null,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A word already exists for this week',
      });
    }

    const word = await prisma.weeklyWord.create({
      data: {
        lemma,
        language,
        transliteration,
        gloss,
        blurb,
        verseRefs,
        verseTexts: verseTexts || null,
        weekStart: new Date(weekStart),
        weekEnd: weekEnd ? new Date(weekEnd) : new Date(new Date(weekStart).getTime() + 7 * 24 * 60 * 60 * 1000),
        organizationId: organizationId || null,
        createdBy: req.user?.id,
        isFeatured: false, // Admin must explicitly feature it
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      data: word,
    });
  } catch (error) {
    console.error('Error creating word:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create word',
    });
  }
};

/**
 * Update a weekly word (Admin only)
 * PUT /api/weekly-word/:id
 */
export const updateWord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      lemma,
      language,
      transliteration,
      gloss,
      blurb,
      verseRefs,
      verseTexts,
      weekStart,
      weekEnd,
      isFeatured,
      isActive,
    } = req.body;

    const word = await prisma.weeklyWord.update({
      where: { id },
      data: {
        ...(lemma && { lemma }),
        ...(language && { language }),
        ...(transliteration && { transliteration }),
        ...(gloss && { gloss }),
        ...(blurb && { blurb }),
        ...(verseRefs && { verseRefs }),
        ...(verseTexts !== undefined && { verseTexts }),
        ...(weekStart && { weekStart: new Date(weekStart) }),
        ...(weekEnd && { weekEnd: new Date(weekEnd) }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({
      success: true,
      data: word,
    });
  } catch (error) {
    console.error('Error updating word:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update word',
    });
  }
};

/**
 * Delete a weekly word (Admin only)
 * DELETE /api/weekly-word/:id
 */
export const deleteWord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete by setting isActive to false
    await prisma.weeklyWord.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Word deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting word:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete word',
    });
  }
};

/**
 * Get metrics for weekly word feature
 * GET /api/weekly-word/metrics
 */
export const getWordMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, wordId } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    if (wordId) {
      where.wordId = wordId;
    }

    // Get aggregated metrics
    const [totalViews, verseClicks, eventBreakdown] = await Promise.all([
      prisma.weeklyWordMetric.count({
        where: { ...where, eventType: 'VIEW' },
      }),
      prisma.weeklyWordMetric.count({
        where: { ...where, eventType: 'VERSE_CLICK' },
      }),
      prisma.weeklyWordMetric.groupBy({
        by: ['eventType'],
        where,
        _count: true,
      }),
    ]);

    // Get top words by views
    const topWords = await prisma.weeklyWordMetric.groupBy({
      by: ['wordId'],
      where: { ...where, eventType: 'VIEW' },
      _count: true,
      orderBy: {
        _count: {
          wordId: 'desc',
        },
      },
      take: 10,
    });

    // Fetch word details for top words
    const wordIds = topWords.map((w) => w.wordId);
    const words = await prisma.weeklyWord.findMany({
      where: { id: { in: wordIds } },
      select: { id: true, lemma: true, language: true, weekStart: true },
    });

    const topWordsWithDetails = topWords.map((tw) => ({
      word: words.find((w) => w.id === tw.wordId),
      views: tw._count,
    }));

    res.json({
      success: true,
      data: {
        summary: {
          totalViews,
          verseClicks,
          eventBreakdown: eventBreakdown.map((e) => ({
            eventType: e.eventType,
            count: e._count,
          })),
        },
        topWords: topWordsWithDetails,
      },
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics',
    });
  }
};

/**
 * Helper function to track word events
 */
async function trackWordEvent({
  wordId,
  userId,
  eventType,
  verseRef,
  viewSource,
}: {
  wordId: string;
  userId?: string;
  eventType: string;
  verseRef?: string;
  viewSource?: string;
}) {
  try {
    await prisma.weeklyWordMetric.create({
      data: {
        wordId,
        userId: userId || null,
        eventType: eventType as any,
        verseRef: verseRef || null,
        viewSource: viewSource || null,
      },
    });
  } catch (error) {
    console.error('Error tracking word event:', error);
    // Don't throw - tracking failures shouldn't break the main flow
  }
}
