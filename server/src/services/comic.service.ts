import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Comic Service
 * Handles CRUD operations for comic storyboards
 */

interface CreateComicData {
  title: string;
  description?: string;
  verseReferences: string[];
  panels: any[];
  layoutType: string;
  stylePreset: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  isPublic?: boolean;
  isTemplate?: boolean;
  organizationId: string;
  createdBy?: string;
}

interface UpdateComicData {
  title?: string;
  description?: string;
  verseReferences?: string[];
  panels?: any[];
  layoutType?: string;
  stylePreset?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  isPublic?: boolean;
  isTemplate?: boolean;
}

interface ListComicsFilters {
  organizationId?: string;
  createdBy?: string;
  isPublic?: boolean;
  isTemplate?: boolean;
  layoutType?: string;
}

/**
 * Create a new comic storyboard
 */
export async function createComic(data: CreateComicData) {
  try {
    const comic = await prisma.comicStoryboard.create({
      data: {
        title: data.title,
        description: data.description,
        verseReferences: data.verseReferences,
        panels: data.panels,
        layoutType: data.layoutType,
        stylePreset: data.stylePreset,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        fontFamily: data.fontFamily,
        isPublic: data.isPublic ?? false,
        isTemplate: data.isTemplate ?? false,
        organizationId: data.organizationId,
        createdBy: data.createdBy,
      },
    });

    logger.info(`Comic created: ${comic.id} by user ${data.createdBy}`);
    return comic;
  } catch (error) {
    logger.error('Error creating comic:', error);
    throw new Error('Failed to create comic');
  }
}

/**
 * Get comic by ID
 */
export async function getComicById(comicId: string, organizationId: string) {
  try {
    const comic = await prisma.comicStoryboard.findFirst({
      where: {
        id: comicId,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
      include: {
        metrics: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!comic) {
      throw new Error('Comic not found');
    }

    return comic;
  } catch (error) {
    logger.error(`Error fetching comic ${comicId}:`, error);
    throw error;
  }
}

/**
 * List comics with filters
 */
export async function listComics(filters: ListComicsFilters, limit = 50, offset = 0) {
  try {
    const where: any = {};

    if (filters.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters.createdBy) {
      where.createdBy = filters.createdBy;
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.isTemplate !== undefined) {
      where.isTemplate = filters.isTemplate;
    }

    if (filters.layoutType) {
      where.layoutType = filters.layoutType;
    }

    const [comics, total] = await Promise.all([
      prisma.comicStoryboard.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
        include: {
          _count: {
            select: {
              metrics: true,
            },
          },
        },
      }),
      prisma.comicStoryboard.count({ where }),
    ]);

    return {
      comics,
      total,
      limit,
      offset,
    };
  } catch (error) {
    logger.error('Error listing comics:', error);
    throw new Error('Failed to list comics');
  }
}

/**
 * Update comic
 */
export async function updateComic(
  comicId: string,
  userId: string,
  organizationId: string,
  data: UpdateComicData
) {
  try {
    // Verify ownership or admin rights
    const existingComic = await prisma.comicStoryboard.findFirst({
      where: {
        id: comicId,
        organizationId,
      },
    });

    if (!existingComic) {
      throw new Error('Comic not found');
    }

    if (existingComic.createdBy !== userId) {
      throw new Error('Unauthorized to update this comic');
    }

    const updatedComic = await prisma.comicStoryboard.update({
      where: { id: comicId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    logger.info(`Comic updated: ${comicId} by user ${userId}`);
    return updatedComic;
  } catch (error) {
    logger.error(`Error updating comic ${comicId}:`, error);
    throw error;
  }
}

/**
 * Delete comic
 */
export async function deleteComic(
  comicId: string,
  userId: string,
  organizationId: string
) {
  try {
    // Verify ownership or admin rights
    const existingComic = await prisma.comicStoryboard.findFirst({
      where: {
        id: comicId,
        organizationId,
      },
    });

    if (!existingComic) {
      throw new Error('Comic not found');
    }

    if (existingComic.createdBy !== userId) {
      throw new Error('Unauthorized to delete this comic');
    }

    await prisma.comicStoryboard.delete({
      where: { id: comicId },
    });

    logger.info(`Comic deleted: ${comicId} by user ${userId}`);
    return { success: true };
  } catch (error) {
    logger.error(`Error deleting comic ${comicId}:`, error);
    throw error;
  }
}

/**
 * Track comic usage metric
 */
export async function trackComicMetric(
  comicId: string,
  organizationId: string,
  metricType: 'view' | 'download' | 'share',
  userId?: string,
  additionalData?: {
    featureContext?: string;
    timeSpentMs?: number;
    usedInLesson?: boolean;
    lessonId?: string;
  }
) {
  try {
    const comic = await prisma.comicStoryboard.findUnique({
      where: { id: comicId },
    });

    if (!comic) {
      throw new Error('Comic not found');
    }

    // Find or create metric record for this user/comic combination
    const existingMetric = await prisma.comicMetric.findFirst({
      where: {
        comicId,
        userId: userId || null,
      },
    });

    if (existingMetric) {
      // Update existing metric
      const updateData: any = {
        lastViewedAt: new Date(),
      };

      if (metricType === 'view') {
        updateData.viewCount = { increment: 1 };
      } else if (metricType === 'download') {
        updateData.downloadCount = { increment: 1 };
      } else if (metricType === 'share') {
        updateData.shareCount = { increment: 1 };
      }

      if (additionalData?.timeSpentMs) {
        updateData.timeSpentMs = additionalData.timeSpentMs;
      }

      if (additionalData?.usedInLesson) {
        updateData.usedInLesson = true;
        updateData.lessonId = additionalData.lessonId;
      }

      await prisma.comicMetric.update({
        where: { id: existingMetric.id },
        data: updateData,
      });
    } else {
      // Create new metric
      await prisma.comicMetric.create({
        data: {
          comicId,
          organizationId,
          viewCount: metricType === 'view' ? 1 : 0,
          downloadCount: metricType === 'download' ? 1 : 0,
          shareCount: metricType === 'share' ? 1 : 0,
          userId,
          featureContext: additionalData?.featureContext,
          timeSpentMs: additionalData?.timeSpentMs,
          usedInLesson: additionalData?.usedInLesson ?? false,
          lessonId: additionalData?.lessonId,
        },
      });
    }

    logger.info(`Comic metric tracked: ${comicId}, type: ${metricType}`);
  } catch (error) {
    logger.error(`Error tracking comic metric for ${comicId}:`, error);
    // Don't throw error - metrics tracking shouldn't break the main flow
  }
}

/**
 * Get comic templates (pre-made public comics)
 */
export async function getComicTemplates(limit = 20) {
  try {
    const templates = await prisma.comicStoryboard.findMany({
      where: {
        isTemplate: true,
        isPublic: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return templates;
  } catch (error) {
    logger.error('Error fetching comic templates:', error);
    throw new Error('Failed to fetch templates');
  }
}

export default {
  createComic,
  getComicById,
  listComics,
  updateComic,
  deleteComic,
  trackComicMetric,
  getComicTemplates,
};
