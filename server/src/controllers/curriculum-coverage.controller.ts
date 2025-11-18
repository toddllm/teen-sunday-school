import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Curriculum Coverage Reporting Controller
 * Manages curriculum coverage tracking and reporting
 */

/**
 * POST /api/curriculum-coverage
 * Mark a lesson as covered/planned for a group
 */
export const recordCoverage = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const {
      lessonId,
      groupId,
      status,
      completedAt,
      scheduledDate,
      attendeeCount,
      notes,
    } = req.body;

    // Validate required fields
    if (!lessonId || !groupId || !status) {
      return res.status(400).json({
        error: 'lessonId, groupId, and status are required',
      });
    }

    // Verify lesson exists and belongs to org
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, organizationId },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Verify group exists and belongs to org
    const group = await prisma.group.findFirst({
      where: { id: groupId, organizationId },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get or create LessonGroup relationship
    let lessonGroup = await prisma.lessonGroup.findFirst({
      where: { lessonId, groupId },
    });

    if (!lessonGroup) {
      lessonGroup = await prisma.lessonGroup.create({
        data: { lessonId, groupId },
      });
    }

    // Create coverage record
    const coverage = await prisma.curriculumCoverage.create({
      data: {
        organizationId,
        lessonGroupId: lessonGroup.id,
        lessonId,
        groupId,
        status,
        completedAt: completedAt ? new Date(completedAt) : null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        attendeeCount,
        notes,
        markedBy: userId,
      },
      include: {
        lessonGroup: {
          include: {
            lesson: true,
            group: true,
          },
        },
      },
    });

    logger.info(`Coverage recorded: ${coverage.id} by user ${userId}`);
    res.status(201).json(coverage);
  } catch (error) {
    logger.error('Error recording coverage:', error);
    res.status(500).json({ error: 'Failed to record coverage' });
  }
};

/**
 * PATCH /api/curriculum-coverage/:id
 * Update a coverage record
 */
export const updateCoverage = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const { id } = req.params;
    const {
      status,
      completedAt,
      scheduledDate,
      attendeeCount,
      notes,
    } = req.body;

    // Verify coverage exists and belongs to org
    const existing = await prisma.curriculumCoverage.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Coverage record not found or does not belong to your organization',
      });
    }

    const coverage = await prisma.curriculumCoverage.update({
      where: { id },
      data: {
        status,
        completedAt: completedAt ? new Date(completedAt) : undefined,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        attendeeCount,
        notes,
        markedBy: userId,
      },
      include: {
        lessonGroup: {
          include: {
            lesson: true,
            group: true,
          },
        },
      },
    });

    logger.info(`Coverage updated: ${coverage.id}`);
    res.json(coverage);
  } catch (error) {
    logger.error('Error updating coverage:', error);
    res.status(500).json({ error: 'Failed to update coverage' });
  }
};

/**
 * DELETE /api/curriculum-coverage/:id
 * Delete a coverage record
 */
export const deleteCoverage = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    // Verify coverage exists and belongs to org
    const existing = await prisma.curriculumCoverage.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Coverage record not found or does not belong to your organization',
      });
    }

    await prisma.curriculumCoverage.delete({
      where: { id },
    });

    logger.info(`Coverage deleted: ${id}`);
    res.json({ success: true, message: 'Coverage record deleted successfully' });
  } catch (error) {
    logger.error('Error deleting coverage:', error);
    res.status(500).json({ error: 'Failed to delete coverage' });
  }
};

/**
 * GET /api/curriculum-coverage/report
 * Get curriculum coverage report with various filters
 */
export const getCoverageReport = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const {
      groupId,
      quarter,
      unit,
      status,
      startDate,
      endDate,
    } = req.query;

    // Build where clause
    const where: any = { organizationId };

    if (groupId) {
      where.groupId = groupId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.completedAt = {};
      if (startDate) {
        where.completedAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.completedAt.lte = new Date(endDate as string);
      }
    }

    // Get coverage records
    const coverageRecords = await prisma.curriculumCoverage.findMany({
      where,
      include: {
        lessonGroup: {
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
                grade: true,
              },
            },
          },
        },
      },
      orderBy: [
        { completedAt: 'desc' },
        { scheduledDate: 'asc' },
      ],
    });

    // Filter by quarter/unit if specified
    let filteredRecords = coverageRecords;
    if (quarter || unit) {
      filteredRecords = coverageRecords.filter((record) => {
        const lesson = record.lessonGroup.lesson;
        if (quarter && lesson.quarter !== Number(quarter)) {
          return false;
        }
        if (unit && lesson.unit !== Number(unit)) {
          return false;
        }
        return true;
      });
    }

    // Get all lessons for coverage calculation
    const lessonWhere: any = { organizationId };
    if (quarter) lessonWhere.quarter = Number(quarter);
    if (unit) lessonWhere.unit = Number(unit);

    const allLessons = await prisma.lesson.findMany({
      where: lessonWhere,
      select: {
        id: true,
        title: true,
        quarter: true,
        unit: true,
        lessonNumber: true,
      },
    });

    // Calculate coverage statistics
    const totalLessons = allLessons.length;
    const completedLessons = filteredRecords.filter(
      (r) => r.status === 'COMPLETED'
    ).length;
    const plannedLessons = filteredRecords.filter(
      (r) => r.status === 'PLANNED'
    ).length;
    const inProgressLessons = filteredRecords.filter(
      (r) => r.status === 'IN_PROGRESS'
    ).length;
    const skippedLessons = filteredRecords.filter(
      (r) => r.status === 'SKIPPED'
    ).length;

    const coveragePercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    res.json({
      coverageRecords: filteredRecords,
      statistics: {
        totalLessons,
        completedLessons,
        plannedLessons,
        inProgressLessons,
        skippedLessons,
        coveragePercentage,
      },
      allLessons,
    });
  } catch (error) {
    logger.error('Error fetching coverage report:', error);
    res.status(500).json({ error: 'Failed to fetch coverage report' });
  }
};

/**
 * GET /api/curriculum-coverage/summary
 * Get aggregated coverage summary across all groups and lessons
 */
export const getCoverageSummary = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { startDate, endDate } = req.query;

    const where: any = { organizationId };

    if (startDate || endDate) {
      where.completedAt = {};
      if (startDate) {
        where.completedAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.completedAt.lte = new Date(endDate as string);
      }
    }

    // Get coverage by status
    const coverageByStatus = await prisma.curriculumCoverage.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true,
      },
    });

    // Get coverage by group
    const coverageByGroup = await prisma.curriculumCoverage.groupBy({
      by: ['groupId'],
      where,
      _count: {
        id: true,
      },
    });

    // Get group details
    const groupIds = coverageByGroup.map((c) => c.groupId);
    const groups = await prisma.group.findMany({
      where: {
        id: { in: groupIds },
        organizationId,
      },
      select: {
        id: true,
        name: true,
        grade: true,
      },
    });

    // Get lessons with coverage data
    const lessonsWithCoverage = await prisma.lesson.findMany({
      where: { organizationId },
      select: {
        id: true,
        title: true,
        quarter: true,
        unit: true,
        lessonNumber: true,
        groups: {
          include: {
            coverageRecords: {
              where,
            },
          },
        },
      },
    });

    // Calculate coverage by quarter
    const quarterCoverage: Record<number, any> = {};
    lessonsWithCoverage.forEach((lesson) => {
      if (!quarterCoverage[lesson.quarter]) {
        quarterCoverage[lesson.quarter] = {
          quarter: lesson.quarter,
          totalLessons: 0,
          completedLessons: 0,
          plannedLessons: 0,
          inProgressLessons: 0,
          skippedLessons: 0,
        };
      }

      quarterCoverage[lesson.quarter].totalLessons++;

      lesson.groups.forEach((lessonGroup) => {
        const completed = lessonGroup.coverageRecords.some(
          (c) => c.status === 'COMPLETED'
        );
        const planned = lessonGroup.coverageRecords.some(
          (c) => c.status === 'PLANNED'
        );
        const inProgress = lessonGroup.coverageRecords.some(
          (c) => c.status === 'IN_PROGRESS'
        );
        const skipped = lessonGroup.coverageRecords.some(
          (c) => c.status === 'SKIPPED'
        );

        if (completed) quarterCoverage[lesson.quarter].completedLessons++;
        if (planned) quarterCoverage[lesson.quarter].plannedLessons++;
        if (inProgress) quarterCoverage[lesson.quarter].inProgressLessons++;
        if (skipped) quarterCoverage[lesson.quarter].skippedLessons++;
      });
    });

    // Get total attendance
    const totalAttendance = await prisma.curriculumCoverage.aggregate({
      where: {
        ...where,
        attendeeCount: { not: null },
      },
      _sum: {
        attendeeCount: true,
      },
      _avg: {
        attendeeCount: true,
      },
    });

    res.json({
      coverageByStatus: coverageByStatus.map((c) => ({
        status: c.status,
        count: c._count.id,
      })),
      coverageByGroup: coverageByGroup.map((c) => {
        const group = groups.find((g) => g.id === c.groupId);
        return {
          groupId: c.groupId,
          groupName: group?.name || 'Unknown',
          grade: group?.grade,
          count: c._count.id,
        };
      }),
      quarterCoverage: Object.values(quarterCoverage).map((qc) => ({
        ...qc,
        coveragePercentage:
          qc.totalLessons > 0
            ? Math.round((qc.completedLessons / qc.totalLessons) * 100)
            : 0,
      })),
      totalAttendance: totalAttendance._sum.attendeeCount || 0,
      avgAttendance: Math.round(totalAttendance._avg.attendeeCount || 0),
      totalLessons: lessonsWithCoverage.length,
      totalGroups: groups.length,
    });
  } catch (error) {
    logger.error('Error fetching coverage summary:', error);
    res.status(500).json({ error: 'Failed to fetch coverage summary' });
  }
};

/**
 * POST /api/curriculum-coverage/report/view
 * Record a report view for metrics
 */
export const recordReportView = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const { reportType, reportParams, timeSpentMs, exportFormat } = req.body;

    // Create metric record
    const metric = await prisma.coverageReportMetric.create({
      data: {
        organizationId,
        userId,
        reportType: reportType || 'overview',
        reportParams,
        timeSpentMs,
        exportFormat,
        exportedAt: exportFormat ? new Date() : null,
      },
    });

    res.json({ success: true, metricId: metric.id });
  } catch (error) {
    logger.error('Error recording report view:', error);
    res.status(500).json({ error: 'Failed to record report view' });
  }
};

/**
 * GET /api/curriculum-coverage/metrics
 * Get report usage metrics (admin only)
 */
export const getReportMetrics = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { startDate, endDate, limit = 100, offset = 0 } = req.query;

    const where: any = { organizationId };

    if (startDate || endDate) {
      where.viewedAt = {};
      if (startDate) {
        where.viewedAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.viewedAt.lte = new Date(endDate as string);
      }
    }

    const [metrics, total] = await Promise.all([
      prisma.coverageReportMetric.findMany({
        where,
        orderBy: { viewedAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.coverageReportMetric.count({ where }),
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
    logger.error('Error fetching report metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};
