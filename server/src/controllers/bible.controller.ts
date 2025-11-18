import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Get chronological timeline with all events and reading segments
 * GET /bible/timeline/chronological
 */
export const getChronologicalTimeline = async (req: Request, res: Response) => {
  try {
    const events = await prisma.timelineEvent.findMany({
      where: {
        isActive: true,
      },
      include: {
        readingSegments: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    logger.error('Error fetching chronological timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chronological timeline',
    });
  }
};

/**
 * Get a specific timeline event by ID
 * GET /bible/timeline/events/:id
 */
export const getTimelineEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await prisma.timelineEvent.findUnique({
      where: { id },
      include: {
        readingSegments: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Timeline event not found',
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    logger.error('Error fetching timeline event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timeline event',
    });
  }
};

/**
 * Start a chronological reading plan for the current user
 * POST /me/plans/chronological/start
 */
export const startChronologicalPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Check if chronological plan exists, if not create it
    let chronoPlan = await prisma.readingPlan.findFirst({
      where: {
        planType: 'CHRONOLOGICAL',
        status: 'PUBLISHED',
      },
    });

    if (!chronoPlan) {
      // Generate chronological plan from timeline events
      const events = await prisma.timelineEvent.findMany({
        include: {
          readingSegments: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      });

      // Build days array from timeline segments
      const days: any[] = [];
      let dayNumber = 1;

      for (const event of events) {
        for (const segment of event.readingSegments) {
          days.push({
            dayNumber,
            passages: segment.passages,
            notes: segment.notes || `Read about: ${event.title}`,
            reflectionPrompts: [
              `What does this event reveal about God's character?`,
              `How does this fit into the larger story of the Bible?`,
            ],
            timelineEventId: event.id,
            timelineEventTitle: event.title,
          });
          dayNumber++;
        }
      }

      chronoPlan = await prisma.readingPlan.create({
        data: {
          title: 'Chronological Bible Reading Plan',
          description: 'Read the Bible in the order events occurred, following the timeline of biblical history.',
          planType: 'CHRONOLOGICAL',
          duration: days.length,
          days: days,
          tags: ['chronological', 'timeline', 'biblical-history'],
          status: 'PUBLISHED',
          isPublic: true,
        },
      });
    }

    // Check if user already has this plan enrolled
    const existingEnrollment = await prisma.userReadingPlan.findUnique({
      where: {
        userId_planId: {
          userId,
          planId: chronoPlan.id,
        },
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'You are already enrolled in the chronological reading plan',
        data: existingEnrollment,
      });
    }

    // Create user enrollment
    const enrollment = await prisma.userReadingPlan.create({
      data: {
        userId,
        planId: chronoPlan.id,
        currentDay: 1,
        totalDays: chronoPlan.duration,
        completedDays: 0,
        progress: {},
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId,
        activityType: 'READING_PLAN_STARTED',
        metadata: {
          planId: chronoPlan.id,
          planTitle: chronoPlan.title,
          planType: 'CHRONOLOGICAL',
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        enrollment,
        plan: chronoPlan,
      },
    });
  } catch (error) {
    logger.error('Error starting chronological plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start chronological reading plan',
    });
  }
};

/**
 * Get user's progress on chronological plan
 * GET /me/plans/chronological/progress
 */
export const getChronologicalProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const chronoPlan = await prisma.readingPlan.findFirst({
      where: {
        planType: 'CHRONOLOGICAL',
        status: 'PUBLISHED',
      },
    });

    if (!chronoPlan) {
      return res.status(404).json({
        success: false,
        error: 'Chronological reading plan not found',
      });
    }

    const enrollment = await prisma.userReadingPlan.findUnique({
      where: {
        userId_planId: {
          userId,
          planId: chronoPlan.id,
        },
      },
      include: {
        plan: true,
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'You are not enrolled in the chronological reading plan',
      });
    }

    // Get timeline events with user progress
    const events = await prisma.timelineEvent.findMany({
      where: { isActive: true },
      include: {
        readingSegments: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Annotate events with progress
    const eventsWithProgress = events.map((event) => {
      const progress = enrollment.progress as any;
      const eventDays = (chronoPlan.days as any[]).filter(
        (day) => day.timelineEventId === event.id
      );

      const completedDaysInEvent = eventDays.filter(
        (day) => progress[day.dayNumber]?.completed
      ).length;

      return {
        ...event,
        totalDays: eventDays.length,
        completedDays: completedDaysInEvent,
        percentComplete: eventDays.length > 0
          ? (completedDaysInEvent / eventDays.length) * 100
          : 0,
      };
    });

    res.json({
      success: true,
      data: {
        enrollment,
        timeline: eventsWithProgress,
        overallProgress: {
          currentDay: enrollment.currentDay,
          totalDays: enrollment.totalDays,
          completedDays: enrollment.completedDays,
          percentComplete: (enrollment.completedDays / enrollment.totalDays) * 100,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching chronological progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chronological progress',
    });
  }
};

/**
 * Update progress for a specific day
 * POST /me/plans/:planId/progress
 */
export const updatePlanProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { planId } = req.params;
    const { dayNumber, completed } = req.body;

    if (typeof dayNumber !== 'number' || typeof completed !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'dayNumber and completed are required',
      });
    }

    const enrollment = await prisma.userReadingPlan.findUnique({
      where: {
        userId_planId: {
          userId,
          planId,
        },
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Reading plan enrollment not found',
      });
    }

    // Update progress
    const progress = enrollment.progress as any;
    const wasCompleted = progress[dayNumber]?.completed || false;

    progress[dayNumber] = {
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    };

    // Calculate new completed days count
    const completedDays = Object.values(progress).filter(
      (p: any) => p.completed
    ).length;

    // Update enrollment
    const updatedEnrollment = await prisma.userReadingPlan.update({
      where: {
        userId_planId: {
          userId,
          planId,
        },
      },
      data: {
        progress,
        completedDays,
        currentDay: completed ? Math.max(enrollment.currentDay, dayNumber + 1) : enrollment.currentDay,
        completedAt: completedDays === enrollment.totalDays ? new Date() : null,
      },
    });

    // Log activity if day was just completed
    if (completed && !wasCompleted) {
      await prisma.activity.create({
        data: {
          userId,
          activityType: 'TIMELINE_PROGRESS',
          metadata: {
            planId,
            dayNumber,
          },
        },
      });

      // Log plan completion if all days are done
      if (completedDays === enrollment.totalDays) {
        await prisma.activity.create({
          data: {
            userId,
            activityType: 'READING_PLAN_COMPLETED',
            metadata: {
              planId,
              totalDays: enrollment.totalDays,
            },
          },
        });
      }
    }

    res.json({
      success: true,
      data: updatedEnrollment,
    });
  } catch (error) {
    logger.error('Error updating plan progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update plan progress',
    });
  }
};

/**
 * Get metrics for chronological plan
 * GET /admin/metrics/chronological-plan
 */
export const getChronologicalPlanMetrics = async (req: Request, res: Response) => {
  try {
    const chronoPlan = await prisma.readingPlan.findFirst({
      where: {
        planType: 'CHRONOLOGICAL',
      },
    });

    if (!chronoPlan) {
      return res.json({
        success: true,
        data: {
          totalStarts: 0,
          totalCompletions: 0,
          activeUsers: 0,
        },
      });
    }

    const [totalStarts, totalCompletions, activeUsers] = await Promise.all([
      prisma.activity.count({
        where: {
          activityType: 'READING_PLAN_STARTED',
          metadata: {
            path: ['planId'],
            equals: chronoPlan.id,
          },
        },
      }),
      prisma.activity.count({
        where: {
          activityType: 'READING_PLAN_COMPLETED',
          metadata: {
            path: ['planId'],
            equals: chronoPlan.id,
          },
        },
      }),
      prisma.userReadingPlan.count({
        where: {
          planId: chronoPlan.id,
          completedAt: null,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalStarts,
        totalCompletions,
        activeUsers,
        completionRate: totalStarts > 0 ? (totalCompletions / totalStarts) * 100 : 0,
      },
    });
  } catch (error) {
    logger.error('Error fetching chronological plan metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
    });
  }
};
