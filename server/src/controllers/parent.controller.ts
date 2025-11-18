import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

/**
 * Get parent overview dashboard data
 * Shows recent lessons, upcoming series, and child's progress overview
 * Does NOT expose private teen data (notes, streaks, scores)
 */
export async function getParentOverview(req: Request, res: Response): Promise<void> {
  try {
    const parentId = req.user!.id;
    const organizationId = req.user!.organizationId;

    // Get parent's children
    const parentChildRelations = await prisma.parentChild.findMany({
      where: { parentId },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            groupMemberships: {
              include: {
                group: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    ageMin: true,
                    ageMax: true,
                    grade: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (parentChildRelations.length === 0) {
      res.json({
        children: [],
        recentLessons: [],
        upcomingSeries: [],
        message: 'No children linked to this parent account',
      });
      return;
    }

    // Get all group IDs for the children
    const groupIds = parentChildRelations.flatMap((relation) =>
      relation.child.groupMemberships.map((gm) => gm.groupId)
    );

    // Get recent lessons (last 10) for these groups
    const recentLessons = await prisma.lesson.findMany({
      where: {
        organizationId,
        groups: {
          some: {
            groupId: {
              in: groupIds,
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        quarter: true,
        unit: true,
        lessonNumber: true,
        scripture: true,
        createdAt: true,
        updatedAt: true,
        groups: {
          select: {
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
    });

    // Get upcoming series overview (next 5 unique quarter/unit combinations)
    const upcomingLessons = await prisma.lesson.findMany({
      where: {
        organizationId,
        groups: {
          some: {
            groupId: {
              in: groupIds,
            },
          },
        },
      },
      select: {
        quarter: true,
        unit: true,
        title: true,
      },
      orderBy: [
        { quarter: 'asc' },
        { unit: 'asc' },
      ],
      take: 20, // Get more to ensure we have unique quarter/unit combos
    });

    // Create series overview by grouping lessons by quarter/unit
    const seriesMap = new Map<string, any>();
    upcomingLessons.forEach((lesson) => {
      const key = `Q${lesson.quarter}-U${lesson.unit}`;
      if (!seriesMap.has(key)) {
        seriesMap.set(key, {
          quarter: lesson.quarter,
          unit: lesson.unit,
          title: lesson.title.split(':')[0].trim(), // Get series title before colon
        });
      }
    });
    const upcomingSeries = Array.from(seriesMap.values()).slice(0, 5);

    // Prepare children overview (without private data)
    const childrenOverview = parentChildRelations.map((relation) => ({
      id: relation.child.id,
      firstName: relation.child.firstName,
      lastName: relation.child.lastName,
      groups: relation.child.groupMemberships.map((gm) => ({
        id: gm.group.id,
        name: gm.group.name,
        description: gm.group.description,
        grade: gm.group.grade,
      })),
      permissions: {
        canViewProgress: relation.canViewProgress,
        canViewLessons: relation.canViewLessons,
        canViewActivities: relation.canViewActivities,
      },
    }));

    res.json({
      children: childrenOverview,
      recentLessons: recentLessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        quarter: lesson.quarter,
        unit: lesson.unit,
        lessonNumber: lesson.lessonNumber,
        scripture: lesson.scripture,
        groups: lesson.groups.map((lg) => lg.group),
        date: lesson.updatedAt,
      })),
      upcomingSeries,
    });
  } catch (error) {
    logger.error('Error fetching parent overview', error);
    res.status(500).json({ error: 'Failed to fetch parent overview' });
  }
}

/**
 * Get parent calendar view
 * Shows upcoming lessons and series schedule
 */
export async function getParentCalendar(req: Request, res: Response): Promise<void> {
  try {
    const parentId = req.user!.id;
    const organizationId = req.user!.organizationId;

    // Get parent's children and their groups
    const parentChildRelations = await prisma.parentChild.findMany({
      where: { parentId },
      include: {
        child: {
          select: {
            groupMemberships: {
              select: {
                groupId: true,
              },
            },
          },
        },
      },
    });

    if (parentChildRelations.length === 0) {
      res.json({
        calendar: [],
        message: 'No children linked to this parent account',
      });
      return;
    }

    // Get all group IDs
    const groupIds = parentChildRelations.flatMap((relation) =>
      relation.child.groupMemberships.map((gm) => gm.groupId)
    );

    // Get all lessons for these groups, ordered by quarter/unit/lesson
    const lessons = await prisma.lesson.findMany({
      where: {
        organizationId,
        groups: {
          some: {
            groupId: {
              in: groupIds,
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        quarter: true,
        unit: true,
        lessonNumber: true,
        scripture: true,
        updatedAt: true,
        groups: {
          select: {
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { quarter: 'asc' },
        { unit: 'asc' },
        { lessonNumber: 'asc' },
      ],
    });

    // Format calendar data
    const calendar = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      quarter: lesson.quarter,
      unit: lesson.unit,
      lessonNumber: lesson.lessonNumber,
      scripture: lesson.scripture,
      groups: lesson.groups.map((lg) => lg.group),
      // Calculate approximate date based on quarter
      // Assuming quarter 1 starts on first Sunday of January
      estimatedDate: calculateLessonDate(lesson.quarter, lesson.unit, lesson.lessonNumber),
    }));

    res.json({
      calendar,
      totalLessons: lessons.length,
    });
  } catch (error) {
    logger.error('Error fetching parent calendar', error);
    res.status(500).json({ error: 'Failed to fetch parent calendar' });
  }
}

/**
 * Link a child to parent account
 */
export async function linkChild(req: Request, res: Response): Promise<void> {
  try {
    const parentId = req.user!.id;
    const { childEmail, canViewActivities = false } = req.body;

    if (!childEmail) {
      res.status(400).json({ error: 'Child email is required' });
      return;
    }

    // Find the child user
    const child = await prisma.user.findUnique({
      where: { email: childEmail },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organizationId: true,
        role: true,
      },
    });

    if (!child) {
      res.status(404).json({ error: 'Child user not found' });
      return;
    }

    // Verify child is in the same organization
    if (child.organizationId !== req.user!.organizationId) {
      res.status(403).json({ error: 'Cannot link child from different organization' });
      return;
    }

    // Verify child is a MEMBER role (not admin, teacher, or another parent)
    if (child.role !== 'MEMBER') {
      res.status(400).json({ error: 'Can only link accounts with MEMBER role' });
      return;
    }

    // Check if relationship already exists
    const existing = await prisma.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId,
          childId: child.id,
        },
      },
    });

    if (existing) {
      res.status(400).json({ error: 'Child is already linked to this parent account' });
      return;
    }

    // Create the parent-child relationship
    const relationship = await prisma.parentChild.create({
      data: {
        parentId,
        childId: child.id,
        canViewProgress: true,
        canViewLessons: true,
        canViewActivities, // Default false for privacy
      },
      include: {
        child: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info(`Parent ${parentId} linked to child ${child.id}`);

    res.status(201).json({
      message: 'Child linked successfully',
      relationship: {
        id: relationship.id,
        child: relationship.child,
        permissions: {
          canViewProgress: relationship.canViewProgress,
          canViewLessons: relationship.canViewLessons,
          canViewActivities: relationship.canViewActivities,
        },
      },
    });
  } catch (error) {
    logger.error('Error linking child to parent', error);
    res.status(500).json({ error: 'Failed to link child' });
  }
}

/**
 * Unlink a child from parent account
 */
export async function unlinkChild(req: Request, res: Response): Promise<void> {
  try {
    const parentId = req.user!.id;
    const { childId } = req.params;

    if (!childId) {
      res.status(400).json({ error: 'Child ID is required' });
      return;
    }

    // Delete the relationship
    const deleted = await prisma.parentChild.deleteMany({
      where: {
        parentId,
        childId,
      },
    });

    if (deleted.count === 0) {
      res.status(404).json({ error: 'Child relationship not found' });
      return;
    }

    logger.info(`Parent ${parentId} unlinked from child ${childId}`);

    res.json({ message: 'Child unlinked successfully' });
  } catch (error) {
    logger.error('Error unlinking child from parent', error);
    res.status(500).json({ error: 'Failed to unlink child' });
  }
}

/**
 * Get parent's linked children
 */
export async function getLinkedChildren(req: Request, res: Response): Promise<void> {
  try {
    const parentId = req.user!.id;

    const relationships = await prisma.parentChild.findMany({
      where: { parentId },
      include: {
        child: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            groupMemberships: {
              include: {
                group: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    grade: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const children = relationships.map((rel) => ({
      id: rel.child.id,
      email: rel.child.email,
      firstName: rel.child.firstName,
      lastName: rel.child.lastName,
      groups: rel.child.groupMemberships.map((gm) => gm.group),
      permissions: {
        canViewProgress: rel.canViewProgress,
        canViewLessons: rel.canViewLessons,
        canViewActivities: rel.canViewActivities,
      },
      linkedAt: rel.createdAt,
    }));

    res.json({ children });
  } catch (error) {
    logger.error('Error fetching linked children', error);
    res.status(500).json({ error: 'Failed to fetch linked children' });
  }
}

/**
 * Submit parent feedback
 */
export async function submitFeedback(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { rating, comment, category, lessonId } = req.body;

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    const feedback = await prisma.parentFeedback.create({
      data: {
        userId,
        rating,
        comment,
        category,
        lessonId,
      },
    });

    logger.info(`Parent feedback received from user ${userId}`);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback.id,
        rating: feedback.rating,
        category: feedback.category,
        createdAt: feedback.createdAt,
      },
    });
  } catch (error) {
    logger.error('Error submitting parent feedback', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
}

/**
 * Helper function to calculate estimated lesson date based on quarter
 * Assumes quarterly schedule starting first Sunday of January
 */
function calculateLessonDate(quarter: number, unit: number, lessonNumber: number): string {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1); // January 1st

  // Find first Sunday of the year
  while (startDate.getDay() !== 0) {
    startDate.setDate(startDate.getDate() + 1);
  }

  // Calculate weeks offset
  const weeksOffset = (quarter - 1) * 13 + (unit - 1) * 4 + (lessonNumber - 1);
  const estimatedDate = new Date(startDate);
  estimatedDate.setDate(estimatedDate.getDate() + weeksOffset * 7);

  return estimatedDate.toISOString().split('T')[0]; // Return YYYY-MM-DD
}
