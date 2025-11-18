import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Cohort Progress Tracking Controller
 * Manages student progress, attendance, and class analytics
 */

/**
 * GET /api/groups/:groupId/progress
 * Get overall progress for a group/cohort
 */
export const getGroupProgress = async (req: Request, res: Response) => {
  try {
    const { organizationId, role } = req.user!;
    const { groupId } = req.params;

    // Verify group belongs to organization
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        lessons: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                quarter: true,
                unit: true,
                lessonNumber: true,
                scripture: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get progress for all members across all lessons
    const progress = await prisma.lessonProgress.findMany({
      where: {
        groupId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            quarter: true,
            unit: true,
            lessonNumber: true,
          },
        },
      },
      orderBy: [
        { lesson: { quarter: 'desc' } },
        { lesson: { unit: 'desc' } },
        { lesson: { lessonNumber: 'desc' } },
      ],
    });

    // Calculate aggregate stats
    const totalMembers = group.members.length;
    const totalLessons = group.lessons.length;
    const completedLessons = progress.filter((p) => p.status === 'COMPLETED').length;
    const totalPossibleCompletions = totalMembers * totalLessons;
    const completionRate =
      totalPossibleCompletions > 0
        ? (completedLessons / totalPossibleCompletions) * 100
        : 0;

    const avgTimeSpent =
      progress.length > 0
        ? progress.reduce((sum, p) => sum + (p.timeSpentMs || 0), 0) / progress.length
        : 0;

    res.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        totalMembers,
        totalLessons,
      },
      stats: {
        completionRate: Math.round(completionRate * 100) / 100,
        completedLessons,
        totalPossibleCompletions,
        avgTimeSpentMs: Math.round(avgTimeSpent),
      },
      progress,
    });
  } catch (error) {
    logger.error('Error fetching group progress:', error);
    res.status(500).json({ error: 'Failed to fetch group progress' });
  }
};

/**
 * GET /api/groups/:groupId/lessons/:lessonId/progress
 * Get progress for a specific lesson in a group
 */
export const getLessonProgress = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { groupId, lessonId } = req.params;

    // Verify group belongs to organization
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId,
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get progress for this lesson
    const progress = await prisma.lessonProgress.findMany({
      where: {
        groupId,
        lessonId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Get lesson details
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        quarter: true,
        unit: true,
        lessonNumber: true,
        scripture: true,
      },
    });

    // Calculate stats
    const totalMembers = await prisma.groupMember.count({ where: { groupId } });
    const completedCount = progress.filter((p) => p.status === 'COMPLETED').length;
    const inProgressCount = progress.filter((p) => p.status === 'IN_PROGRESS').length;
    const notStartedCount = totalMembers - progress.length;

    res.json({
      lesson,
      stats: {
        total: totalMembers,
        completed: completedCount,
        inProgress: inProgressCount,
        notStarted: notStartedCount,
        completionRate:
          totalMembers > 0 ? Math.round((completedCount / totalMembers) * 100 * 100) / 100 : 0,
      },
      progress,
    });
  } catch (error) {
    logger.error('Error fetching lesson progress:', error);
    res.status(500).json({ error: 'Failed to fetch lesson progress' });
  }
};

/**
 * GET /api/groups/:groupId/attendance
 * Get attendance records for a group
 */
export const getGroupAttendance = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { groupId } = req.params;
    const { startDate, endDate, limit = 100, offset = 0 } = req.query;

    // Verify group belongs to organization
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId,
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const where: any = { groupId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
              quarter: true,
              unit: true,
              lessonNumber: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.attendance.count({ where }),
    ]);

    res.json({
      attendance,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    logger.error('Error fetching group attendance:', error);
    res.status(500).json({ error: 'Failed to fetch group attendance' });
  }
};

/**
 * GET /api/groups/:groupId/progress/timeline
 * Get historical progress over time
 */
export const getProgressTimeline = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { groupId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify group belongs to organization
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId,
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const where: any = { groupId };

    if (startDate || endDate) {
      where.completedAt = {};
      if (startDate) {
        where.completedAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.completedAt.lte = new Date(endDate as string);
      }
    }

    // Get completed lessons over time
    const completedProgress = await prisma.lessonProgress.findMany({
      where: {
        ...where,
        status: 'COMPLETED',
        completedAt: { not: null },
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            quarter: true,
            unit: true,
            lessonNumber: true,
          },
        },
      },
      orderBy: {
        completedAt: 'asc',
      },
    });

    // Group by week
    const weeklyData: { [key: string]: any } = {};

    completedProgress.forEach((progress) => {
      if (!progress.completedAt) return;

      const week = getWeekKey(progress.completedAt);

      if (!weeklyData[week]) {
        weeklyData[week] = {
          week,
          completions: 0,
          totalTimeMs: 0,
          lessons: new Set(),
          students: new Set(),
        };
      }

      weeklyData[week].completions++;
      weeklyData[week].totalTimeMs += progress.timeSpentMs || 0;
      weeklyData[week].lessons.add(progress.lessonId);
      weeklyData[week].students.add(progress.userId);
    });

    // Convert to array and format
    const timeline = Object.values(weeklyData).map((week: any) => ({
      week: week.week,
      completions: week.completions,
      avgTimeMs: week.completions > 0 ? Math.round(week.totalTimeMs / week.completions) : 0,
      uniqueLessons: week.lessons.size,
      uniqueStudents: week.students.size,
    }));

    res.json({ timeline });
  } catch (error) {
    logger.error('Error fetching progress timeline:', error);
    res.status(500).json({ error: 'Failed to fetch progress timeline' });
  }
};

/**
 * POST /api/progress
 * Log lesson completion/progress
 */
export const recordProgress = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: currentUserId } = req.user!;
    const {
      userId,
      lessonId,
      groupId,
      status,
      timeSpentMs,
      slidesViewed,
      gamesPlayed,
      score,
      notes,
    } = req.body;

    // Validate required fields
    if (!userId || !lessonId || !groupId) {
      return res.status(400).json({
        error: 'userId, lessonId, and groupId are required',
      });
    }

    // Verify group belongs to organization
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId,
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Verify user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        userId,
        groupId,
      },
    });

    if (!membership) {
      return res.status(400).json({ error: 'User is not a member of this group' });
    }

    // Create or update progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId_groupId: {
          userId,
          lessonId,
          groupId,
        },
      },
      update: {
        status: status || undefined,
        timeSpentMs: timeSpentMs || undefined,
        slidesViewed: slidesViewed || undefined,
        gamesPlayed: gamesPlayed || undefined,
        score: score || undefined,
        notes: notes || undefined,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
      create: {
        userId,
        lessonId,
        groupId,
        status: status || 'IN_PROGRESS',
        startedAt: new Date(),
        timeSpentMs,
        slidesViewed,
        gamesPlayed,
        score,
        notes,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    logger.info(`Progress recorded: ${progress.id} by user ${currentUserId}`);
    res.status(201).json(progress);
  } catch (error) {
    logger.error('Error recording progress:', error);
    res.status(500).json({ error: 'Failed to record progress' });
  }
};

/**
 * POST /api/attendance
 * Record attendance
 */
export const recordAttendance = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: currentUserId } = req.user!;
    const { userId, groupId, lessonId, date, status, arrivedAt, departedAt, notes } = req.body;

    // Validate required fields
    if (!userId || !groupId || !date) {
      return res.status(400).json({
        error: 'userId, groupId, and date are required',
      });
    }

    // Verify group belongs to organization
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId,
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Create or update attendance
    const attendance = await prisma.attendance.upsert({
      where: {
        userId_groupId_date: {
          userId,
          groupId,
          date: new Date(date),
        },
      },
      update: {
        status: status || undefined,
        lessonId: lessonId || undefined,
        arrivedAt: arrivedAt ? new Date(arrivedAt) : undefined,
        departedAt: departedAt ? new Date(departedAt) : undefined,
        notes: notes || undefined,
      },
      create: {
        userId,
        groupId,
        lessonId,
        date: new Date(date),
        status: status || 'PRESENT',
        arrivedAt: arrivedAt ? new Date(arrivedAt) : null,
        departedAt: departedAt ? new Date(departedAt) : null,
        notes,
      },
    });

    logger.info(`Attendance recorded: ${attendance.id} by user ${currentUserId}`);
    res.status(201).json(attendance);
  } catch (error) {
    logger.error('Error recording attendance:', error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
};

/**
 * GET /api/groups/:groupId/analytics
 * Get comprehensive analytics for a group
 */
export const getGroupAnalytics = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { groupId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify group belongs to organization
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId,
      },
      include: {
        members: true,
        lessons: {
          include: {
            lesson: true,
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) {
        dateFilter.gte = new Date(startDate as string);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate as string);
      }
    }

    // Get progress stats
    const progressStats = await prisma.lessonProgress.groupBy({
      by: ['status'],
      where: {
        groupId,
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
      },
      _count: {
        id: true,
      },
      _avg: {
        timeSpentMs: true,
      },
    });

    // Get attendance stats
    const attendanceStats = await prisma.attendance.groupBy({
      by: ['status'],
      where: {
        groupId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      _count: {
        id: true,
      },
    });

    // Get top performers (most completions)
    const topPerformers = await prisma.lessonProgress.groupBy({
      by: ['userId'],
      where: {
        groupId,
        status: 'COMPLETED',
        ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {}),
      },
      _count: {
        id: true,
      },
      _avg: {
        timeSpentMs: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get user details for top performers
    const userIds = topPerformers.map((p) => p.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    const topPerformersWithNames = topPerformers.map((performer) => {
      const user = users.find((u) => u.id === performer.userId);
      return {
        userId: performer.userId,
        firstName: user?.firstName,
        lastName: user?.lastName,
        completions: performer._count.id,
        avgTimeMs: Math.round(performer._avg.timeSpentMs || 0),
      };
    });

    res.json({
      group: {
        id: group.id,
        name: group.name,
        totalMembers: group.members.length,
        totalLessons: group.lessons.length,
      },
      progress: {
        byStatus: progressStats.map((stat) => ({
          status: stat.status,
          count: stat._count.id,
          avgTimeMs: Math.round(stat._avg.timeSpentMs || 0),
        })),
      },
      attendance: {
        byStatus: attendanceStats.map((stat) => ({
          status: stat.status,
          count: stat._count.id,
        })),
      },
      topPerformers: topPerformersWithNames,
    });
  } catch (error) {
    logger.error('Error fetching group analytics:', error);
    res.status(500).json({ error: 'Failed to fetch group analytics' });
  }
};

/**
 * GET /api/students/:userId/progress
 * Get progress for a specific student across all groups
 */
export const getStudentProgress = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { userId } = req.params;
    const { groupId } = req.query;

    // Verify user belongs to organization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const where: any = { userId };
    if (groupId) {
      where.groupId = groupId;
    }

    const progress = await prisma.lessonProgress.findMany({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            quarter: true,
            unit: true,
            lessonNumber: true,
            scripture: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { group: { name: 'asc' } },
        { lesson: { quarter: 'desc' } },
        { lesson: { unit: 'desc' } },
        { lesson: { lessonNumber: 'desc' } },
      ],
    });

    const stats = {
      total: progress.length,
      completed: progress.filter((p) => p.status === 'COMPLETED').length,
      inProgress: progress.filter((p) => p.status === 'IN_PROGRESS').length,
      totalTimeMs: progress.reduce((sum, p) => sum + (p.timeSpentMs || 0), 0),
    };

    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      stats,
      progress,
    });
  } catch (error) {
    logger.error('Error fetching student progress:', error);
    res.status(500).json({ error: 'Failed to fetch student progress' });
  }
};

// Helper function to get week key (e.g., "2025-W03")
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const numberOfDays = Math.floor((date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}
