import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, getDay } from 'date-fns';

/**
 * Get calendar view with scheduled lessons
 * Supports month and week views, filtered by group
 */
export async function getCalendar(req: Request, res: Response): Promise<void> {
  try {
    const { groupId, startDate, endDate, view = 'month' } = req.query;

    if (!groupId || typeof groupId !== 'string') {
      res.status(400).json({ error: 'Group ID required' });
      return;
    }

    if (!startDate || typeof startDate !== 'string') {
      res.status(400).json({ error: 'Start date required' });
      return;
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate as string) :
      view === 'week' ? endOfWeek(start, { weekStartsOn: 0 }) :
      endOfMonth(start);

    // Fetch scheduled lessons for the date range
    const schedules = await prisma.lessonSchedule.findMany({
      where: {
        groupId,
        scheduledDate: {
          gte: start,
          lte: end,
        },
      },
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
        series: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        leader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    res.json({ schedules, dateRange: { start, end } });
  } catch (error) {
    logger.error('Error getting calendar:', error);
    res.status(500).json({ error: 'Failed to get calendar' });
  }
}

/**
 * Get calendar metrics
 * Returns scheduled sessions count and unscheduled Sundays
 */
export async function getCalendarMetrics(req: Request, res: Response): Promise<void> {
  try {
    const { groupId, startDate, endDate } = req.query;

    if (!groupId || typeof groupId !== 'string') {
      res.status(400).json({ error: 'Group ID required' });
      return;
    }

    const start = startDate ? new Date(startDate as string) : new Date();
    const end = endDate ? new Date(endDate as string) : endOfMonth(new Date());

    // Count scheduled sessions
    const scheduledCount = await prisma.lessonSchedule.count({
      where: {
        groupId,
        scheduledDate: {
          gte: start,
          lte: end,
        },
        status: 'SCHEDULED',
      },
    });

    // Get all Sundays in the date range
    const allDays = eachDayOfInterval({ start, end });
    const sundays = allDays.filter(day => getDay(day) === 0);

    // Get scheduled Sundays
    const scheduledDates = await prisma.lessonSchedule.findMany({
      where: {
        groupId,
        scheduledDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        scheduledDate: true,
      },
    });

    const scheduledSundays = scheduledDates.filter(
      s => getDay(s.scheduledDate) === 0
    ).length;

    const unscheduledSundays = sundays.length - scheduledSundays;

    // Count by status
    const statusCounts = await prisma.lessonSchedule.groupBy({
      by: ['status'],
      where: {
        groupId,
        scheduledDate: {
          gte: start,
          lte: end,
        },
      },
      _count: true,
    });

    res.json({
      totalScheduled: scheduledCount,
      totalSundays: sundays.length,
      scheduledSundays,
      unscheduledSundays,
      statusBreakdown: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    logger.error('Error getting calendar metrics:', error);
    res.status(500).json({ error: 'Failed to get calendar metrics' });
  }
}

/**
 * Assign a lesson to a date (create schedule)
 */
export async function assignLesson(req: Request, res: Response): Promise<void> {
  try {
    const { scheduledDate, lessonId, seriesId, groupId, leaderId, notes } = req.body;

    if (!scheduledDate || !groupId) {
      res.status(400).json({ error: 'Scheduled date and group ID required' });
      return;
    }

    if (!lessonId && !seriesId) {
      res.status(400).json({ error: 'Either lesson ID or series ID required' });
      return;
    }

    // Check for existing schedule on this date for this group
    const existing = await prisma.lessonSchedule.findFirst({
      where: {
        groupId,
        scheduledDate: new Date(scheduledDate),
      },
    });

    if (existing) {
      res.status(409).json({ error: 'A lesson is already scheduled for this date and group' });
      return;
    }

    const schedule = await prisma.lessonSchedule.create({
      data: {
        scheduledDate: new Date(scheduledDate),
        lessonId: lessonId || null,
        seriesId: seriesId || null,
        groupId,
        leaderId: leaderId || null,
        notes,
        status: 'SCHEDULED',
      },
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
        series: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        leader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({ schedule });
  } catch (error) {
    logger.error('Error assigning lesson:', error);
    res.status(500).json({ error: 'Failed to assign lesson' });
  }
}

/**
 * Update a scheduled lesson (e.g., reschedule, change teacher)
 */
export async function updateSchedule(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { scheduledDate, lessonId, seriesId, leaderId, notes, status } = req.body;

    // Check if schedule exists
    const existing = await prisma.lessonSchedule.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    // If rescheduling, check for conflicts
    if (scheduledDate && scheduledDate !== existing.scheduledDate.toISOString()) {
      const conflict = await prisma.lessonSchedule.findFirst({
        where: {
          groupId: existing.groupId,
          scheduledDate: new Date(scheduledDate),
          id: { not: id },
        },
      });

      if (conflict) {
        res.status(409).json({ error: 'A lesson is already scheduled for this date and group' });
        return;
      }
    }

    const schedule = await prisma.lessonSchedule.update({
      where: { id },
      data: {
        ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
        ...(lessonId !== undefined && { lessonId }),
        ...(seriesId !== undefined && { seriesId }),
        ...(leaderId !== undefined && { leaderId }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
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
        series: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        leader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({ schedule });
  } catch (error) {
    logger.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
}

/**
 * Delete a scheduled lesson
 */
export async function deleteSchedule(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await prisma.lessonSchedule.delete({
      where: { id },
    });

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    logger.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
}

/**
 * Get schedule details
 */
export async function getSchedule(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const schedule = await prisma.lessonSchedule.findUnique({
      where: { id },
      include: {
        lesson: true,
        series: true,
        leader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        group: true,
      },
    });

    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    res.json({ schedule });
  } catch (error) {
    logger.error('Error getting schedule:', error);
    res.status(500).json({ error: 'Failed to get schedule' });
  }
}
