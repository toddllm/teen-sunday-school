import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Get all series for an organization
 */
export async function getAllSeries(req: Request, res: Response): Promise<void> {
  try {
    const { organizationId } = (req as any).user;
    const { tags, ageMin, ageMax, isActive } = req.query;

    // Build filter
    const where: any = {
      organizationId,
    };

    if (tags) {
      where.tags = {
        hasSome: Array.isArray(tags) ? tags : [tags],
      };
    }

    if (ageMin) {
      where.ageMin = { gte: parseInt(ageMin as string) };
    }

    if (ageMax) {
      where.ageMax = { lte: parseInt(ageMax as string) };
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const series = await prisma.lessonSeries.findMany({
      where,
      include: {
        lessons: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                scripture: true,
                quarter: true,
                unit: true,
                lessonNumber: true,
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            lessons: true,
            completions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ series });
  } catch (error) {
    logger.error('Error fetching series:', error);
    res.status(500).json({ error: 'Failed to fetch series' });
  }
}

/**
 * Get a specific series by ID
 */
export async function getSeriesById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { organizationId, userId } = (req as any).user;

    const series = await prisma.lessonSeries.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        lessons: {
          include: {
            lesson: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        completions: {
          where: {
            userId,
          },
        },
        _count: {
          select: {
            lessons: true,
            completions: true,
          },
        },
      },
    });

    if (!series) {
      res.status(404).json({ error: 'Series not found' });
      return;
    }

    // Calculate progress for current user
    const totalLessons = series.lessons.length;
    const completedLessons = series.completions.length;
    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    res.json({
      series: {
        ...series,
        progress: {
          total: totalLessons,
          completed: completedLessons,
          percentage: Math.round(progress),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching series:', error);
    res.status(500).json({ error: 'Failed to fetch series' });
  }
}

/**
 * Create a new series (Admin/Teacher only)
 */
export async function createSeries(req: Request, res: Response): Promise<void> {
  try {
    const { organizationId, userId } = (req as any).user;
    const {
      title,
      subtitle,
      description,
      tags,
      ageMin,
      ageMax,
      thumbnailUrl,
      isPublic,
      lessons, // Array of { lessonId, orderIndex, scheduledDate }
    } = req.body;

    // Validate input
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    // Create series with lessons in a transaction
    const series = await prisma.$transaction(async (tx) => {
      // Create the series
      const newSeries = await tx.lessonSeries.create({
        data: {
          organizationId,
          title,
          subtitle,
          description,
          tags: tags || [],
          ageMin,
          ageMax,
          thumbnailUrl,
          isPublic: isPublic || false,
          createdBy: userId,
        },
      });

      // Add lessons if provided
      if (lessons && lessons.length > 0) {
        await tx.seriesLesson.createMany({
          data: lessons.map((lesson: any, index: number) => ({
            seriesId: newSeries.id,
            lessonId: lesson.lessonId,
            orderIndex: lesson.orderIndex !== undefined ? lesson.orderIndex : index,
            scheduledDate: lesson.scheduledDate
              ? new Date(lesson.scheduledDate)
              : null,
          })),
        });
      }

      // Fetch the complete series with lessons
      return await tx.lessonSeries.findUnique({
        where: { id: newSeries.id },
        include: {
          lessons: {
            include: {
              lesson: true,
            },
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      });
    });

    logger.info(`Series created: ${series.id} by user ${userId}`);
    res.status(201).json({ series });
  } catch (error) {
    logger.error('Error creating series:', error);
    res.status(500).json({ error: 'Failed to create series' });
  }
}

/**
 * Update a series (Admin/Teacher only)
 */
export async function updateSeries(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { organizationId, userId } = (req as any).user;
    const {
      title,
      subtitle,
      description,
      tags,
      ageMin,
      ageMax,
      thumbnailUrl,
      isPublic,
      isActive,
    } = req.body;

    // Check if series exists and belongs to organization
    const existingSeries = await prisma.lessonSeries.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existingSeries) {
      res.status(404).json({ error: 'Series not found' });
      return;
    }

    // Update series
    const series = await prisma.lessonSeries.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(description !== undefined && { description }),
        ...(tags !== undefined && { tags }),
        ...(ageMin !== undefined && { ageMin }),
        ...(ageMax !== undefined && { ageMax }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(isPublic !== undefined && { isPublic }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        lessons: {
          include: {
            lesson: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    logger.info(`Series updated: ${id} by user ${userId}`);
    res.json({ series });
  } catch (error) {
    logger.error('Error updating series:', error);
    res.status(500).json({ error: 'Failed to update series' });
  }
}

/**
 * Delete a series (Admin/Teacher only)
 */
export async function deleteSeries(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { organizationId, userId } = (req as any).user;

    // Check if series exists and belongs to organization
    const existingSeries = await prisma.lessonSeries.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existingSeries) {
      res.status(404).json({ error: 'Series not found' });
      return;
    }

    // Delete series (cascade will handle lessons and completions)
    await prisma.lessonSeries.delete({
      where: { id },
    });

    logger.info(`Series deleted: ${id} by user ${userId}`);
    res.json({ message: 'Series deleted successfully' });
  } catch (error) {
    logger.error('Error deleting series:', error);
    res.status(500).json({ error: 'Failed to delete series' });
  }
}

/**
 * Update lessons in a series (for reordering)
 */
export async function updateSeriesLessons(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { organizationId, userId } = (req as any).user;
    const { lessons } = req.body; // Array of { lessonId, orderIndex, scheduledDate }

    // Check if series exists and belongs to organization
    const existingSeries = await prisma.lessonSeries.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existingSeries) {
      res.status(404).json({ error: 'Series not found' });
      return;
    }

    if (!lessons || !Array.isArray(lessons)) {
      res.status(400).json({ error: 'Lessons array is required' });
      return;
    }

    // Update lessons in a transaction
    const updatedSeries = await prisma.$transaction(async (tx) => {
      // Delete existing lessons
      await tx.seriesLesson.deleteMany({
        where: { seriesId: id },
      });

      // Create new lessons
      if (lessons.length > 0) {
        await tx.seriesLesson.createMany({
          data: lessons.map((lesson: any, index: number) => ({
            seriesId: id,
            lessonId: lesson.lessonId,
            orderIndex: lesson.orderIndex !== undefined ? lesson.orderIndex : index,
            scheduledDate: lesson.scheduledDate
              ? new Date(lesson.scheduledDate)
              : null,
          })),
        });
      }

      // Fetch the complete series with lessons
      return await tx.lessonSeries.findUnique({
        where: { id },
        include: {
          lessons: {
            include: {
              lesson: true,
            },
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      });
    });

    logger.info(`Series lessons updated: ${id} by user ${userId}`);
    res.json({ series: updatedSeries });
  } catch (error) {
    logger.error('Error updating series lessons:', error);
    res.status(500).json({ error: 'Failed to update series lessons' });
  }
}

/**
 * Mark a lesson in a series as complete
 */
export async function completeSeriesLesson(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id, lessonId } = req.params;
    const { organizationId, userId } = (req as any).user;

    // Check if series exists and belongs to organization
    const series = await prisma.lessonSeries.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        lessons: {
          where: {
            lessonId,
          },
        },
      },
    });

    if (!series) {
      res.status(404).json({ error: 'Series not found' });
      return;
    }

    if (series.lessons.length === 0) {
      res.status(404).json({ error: 'Lesson not found in this series' });
      return;
    }

    // Create or update completion
    const completion = await prisma.seriesCompletion.upsert({
      where: {
        seriesId_userId_lessonId: {
          seriesId: id,
          userId,
          lessonId,
        },
      },
      create: {
        seriesId: id,
        userId,
        lessonId,
      },
      update: {
        completedAt: new Date(),
      },
    });

    logger.info(`Lesson ${lessonId} marked complete in series ${id} by user ${userId}`);
    res.json({ completion });
  } catch (error) {
    logger.error('Error completing series lesson:', error);
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
}

/**
 * Get series metrics (Admin only)
 */
export async function getSeriesMetrics(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { organizationId } = (req as any).user;

    const [
      totalSeries,
      activeSeries,
      totalCompletions,
      seriesWithCompletions,
    ] = await Promise.all([
      // Total series created
      prisma.lessonSeries.count({
        where: { organizationId },
      }),
      // Active series
      prisma.lessonSeries.count({
        where: { organizationId, isActive: true },
      }),
      // Total completions
      prisma.seriesCompletion.count({
        where: {
          series: {
            organizationId,
          },
        },
      }),
      // Series with completion stats
      prisma.lessonSeries.findMany({
        where: { organizationId },
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              lessons: true,
              completions: true,
            },
          },
          completions: {
            distinct: ['userId'],
            select: {
              userId: true,
            },
          },
        },
      }),
    ]);

    // Calculate average completion rate
    const seriesStats = seriesWithCompletions.map((s) => ({
      seriesId: s.id,
      title: s.title,
      totalLessons: s._count.lessons,
      totalCompletions: s._count.completions,
      uniqueUsers: s.completions.length,
      avgCompletionRate:
        s._count.lessons > 0 && s.completions.length > 0
          ? (s._count.completions / (s._count.lessons * s.completions.length)) * 100
          : 0,
    }));

    res.json({
      metrics: {
        totalSeries,
        activeSeries,
        totalCompletions,
        seriesStats,
      },
    });
  } catch (error) {
    logger.error('Error fetching series metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
}
