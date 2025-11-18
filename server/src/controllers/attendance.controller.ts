import { Request, Response } from 'express';
import { PrismaClient, AttendanceStatus, FollowUpStatus } from '@prisma/client';
import logger from '../config/logger';
import * as attendanceService from '../services/attendance.service';

const prisma = new PrismaClient();

/**
 * Attendance Controller
 * Manages attendance tracking and follow-up suggestions
 */

/**
 * POST /api/attendance/record
 * Record attendance for a single student
 */
export const recordAttendance = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: recordedBy } = req.user!;
    const { groupId, userId, classDate, status, notes } = req.body;

    // Validation
    if (!groupId || !userId || !classDate || !status) {
      return res.status(400).json({
        error: 'Missing required fields: groupId, userId, classDate, status',
      });
    }

    const validStatuses = Object.values(AttendanceStatus);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const record = await attendanceService.recordAttendance({
      organizationId,
      groupId,
      userId,
      classDate: new Date(classDate),
      status,
      notes,
      recordedBy,
    });

    res.status(201).json(record);
  } catch (error) {
    logger.error('Error recording attendance:', error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
};

/**
 * POST /api/attendance/record-bulk
 * Record attendance for multiple students
 */
export const recordBulkAttendance = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: recordedBy } = req.user!;
    const { groupId, classDate, attendanceData } = req.body;

    // Validation
    if (!groupId || !classDate || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        error: 'Missing required fields: groupId, classDate, attendanceData (array)',
      });
    }

    // Validate each attendance entry
    const validStatuses = Object.values(AttendanceStatus);
    for (const entry of attendanceData) {
      if (!entry.userId || !entry.status) {
        return res.status(400).json({
          error: 'Each attendance entry must have userId and status',
        });
      }
      if (!validStatuses.includes(entry.status)) {
        return res.status(400).json({
          error: `Invalid status for user ${entry.userId}. Must be one of: ${validStatuses.join(', ')}`,
        });
      }
    }

    const records = await attendanceService.recordBulkAttendance(
      organizationId,
      groupId,
      new Date(classDate),
      attendanceData,
      recordedBy
    );

    res.status(201).json({
      message: `Attendance recorded for ${records.length} students`,
      records,
    });
  } catch (error) {
    logger.error('Error recording bulk attendance:', error);
    res.status(500).json({ error: 'Failed to record bulk attendance' });
  }
};

/**
 * GET /api/attendance/group/:groupId
 * Get attendance records for a group
 */
export const getGroupAttendance = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const records = await attendanceService.getGroupAttendance(groupId, start, end);

    res.json(records);
  } catch (error) {
    logger.error('Error fetching group attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
};

/**
 * GET /api/attendance/group/:groupId/stats
 * Get attendance statistics for a group
 */
export const getGroupAttendanceStats = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { weeks } = req.query;

    const weeksNumber = weeks ? parseInt(weeks as string, 10) : 12;

    const stats = await attendanceService.getGroupAttendanceStats(groupId, weeksNumber);

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching group attendance stats:', error);
    res.status(500).json({ error: 'Failed to fetch attendance statistics' });
  }
};

/**
 * GET /api/attendance/patterns/:userId/:groupId
 * Get attendance pattern for a specific student in a group
 */
export const getStudentPattern = async (req: Request, res: Response) => {
  try {
    const { userId, groupId } = req.params;

    const pattern = await prisma.attendancePattern.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      include: {
        followUpSuggestions: {
          where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!pattern) {
      return res.status(404).json({ error: 'No attendance pattern found' });
    }

    res.json(pattern);
  } catch (error) {
    logger.error('Error fetching student pattern:', error);
    res.status(500).json({ error: 'Failed to fetch attendance pattern' });
  }
};

/**
 * POST /api/attendance/patterns/:userId/:groupId/recalculate
 * Manually recalculate attendance pattern for a student
 */
export const recalculatePattern = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { userId, groupId } = req.params;

    const analysis = await attendanceService.updateAttendancePattern(
      organizationId,
      groupId,
      userId
    );

    res.json({
      message: 'Pattern recalculated successfully',
      analysis,
    });
  } catch (error) {
    logger.error('Error recalculating pattern:', error);
    res.status(500).json({ error: 'Failed to recalculate pattern' });
  }
};

/**
 * GET /api/attendance/follow-ups
 * Get follow-up suggestions
 */
export const getFollowUpSuggestions = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { groupId, status, priority } = req.query;

    let suggestions = await attendanceService.getFollowUpSuggestions(
      organizationId,
      groupId as string | undefined,
      status as FollowUpStatus | undefined
    );

    // Filter by priority if specified
    if (priority) {
      suggestions = suggestions.filter(s => s.priority === priority);
    }

    // Enrich with user data
    const enriched = await Promise.all(
      suggestions.map(async (suggestion) => {
        const user = await prisma.user.findUnique({
          where: { id: suggestion.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        });

        const group = await prisma.group.findUnique({
          where: { id: suggestion.groupId },
          select: {
            id: true,
            name: true,
          },
        });

        return {
          ...suggestion,
          user,
          group,
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    logger.error('Error fetching follow-up suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch follow-up suggestions' });
  }
};

/**
 * GET /api/attendance/follow-ups/:suggestionId
 * Get a specific follow-up suggestion
 */
export const getFollowUpSuggestion = async (req: Request, res: Response) => {
  try {
    const { suggestionId } = req.params;

    const suggestion = await prisma.followUpSuggestion.findUnique({
      where: { id: suggestionId },
      include: {
        pattern: true,
      },
    });

    if (!suggestion) {
      return res.status(404).json({ error: 'Follow-up suggestion not found' });
    }

    // Enrich with user data
    const user = await prisma.user.findUnique({
      where: { id: suggestion.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    const group = await prisma.group.findUnique({
      where: { id: suggestion.groupId },
      select: {
        id: true,
        name: true,
      },
    });

    res.json({
      ...suggestion,
      user,
      group,
    });
  } catch (error) {
    logger.error('Error fetching follow-up suggestion:', error);
    res.status(500).json({ error: 'Failed to fetch follow-up suggestion' });
  }
};

/**
 * PATCH /api/attendance/follow-ups/:suggestionId
 * Update a follow-up suggestion
 */
export const updateFollowUpSuggestion = async (req: Request, res: Response) => {
  try {
    const { suggestionId } = req.params;
    const { id: userId } = req.user!;
    const {
      status,
      assignedTo,
      contactMethod,
      contactNotes,
      resolution,
      outcome,
    } = req.body;

    const updates: any = {};

    if (status) {
      const validStatuses = Object.values(FollowUpStatus);
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }
      updates.status = status;

      // Auto-set timestamps based on status changes
      if (status === 'CONTACTED' && !updates.contactedAt) {
        updates.contactedAt = new Date();
      }
      if (status === 'RESOLVED' && !updates.resolvedAt) {
        updates.resolvedAt = new Date();
      }
    }

    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (contactMethod) {
      updates.contactMethod = contactMethod;
      if (!updates.contactedAt) {
        updates.contactedAt = new Date();
      }
    }
    if (contactNotes) updates.contactNotes = contactNotes;
    if (resolution) updates.resolution = resolution;
    if (outcome) updates.outcome = outcome;

    const suggestion = await attendanceService.updateFollowUpSuggestion(
      suggestionId,
      updates
    );

    logger.info(`Follow-up suggestion ${suggestionId} updated by user ${userId}`);
    res.json(suggestion);
  } catch (error) {
    logger.error('Error updating follow-up suggestion:', error);
    res.status(500).json({ error: 'Failed to update follow-up suggestion' });
  }
};

/**
 * DELETE /api/attendance/follow-ups/:suggestionId
 * Dismiss a follow-up suggestion
 */
export const dismissFollowUpSuggestion = async (req: Request, res: Response) => {
  try {
    const { suggestionId } = req.params;
    const { id: userId } = req.user!;

    const suggestion = await prisma.followUpSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: 'DISMISSED',
        resolvedAt: new Date(),
      },
    });

    logger.info(`Follow-up suggestion ${suggestionId} dismissed by user ${userId}`);
    res.json({
      message: 'Follow-up suggestion dismissed',
      suggestion,
    });
  } catch (error) {
    logger.error('Error dismissing follow-up suggestion:', error);
    res.status(500).json({ error: 'Failed to dismiss follow-up suggestion' });
  }
};

/**
 * GET /api/attendance/dashboard
 * Get attendance dashboard overview
 */
export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;

    // Get all groups for this organization
    const groups = await prisma.group.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true },
    });

    // Get overall statistics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRecords = await prisma.attendanceRecord.findMany({
      where: {
        organizationId,
        classDate: { gte: thirtyDaysAgo },
      },
    });

    const totalRecords = recentRecords.length;
    const totalPresent = recentRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const overallRate = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

    // Get pending follow-ups
    const pendingFollowUps = await prisma.followUpSuggestion.findMany({
      where: {
        organizationId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      orderBy: { priority: 'desc' },
      take: 10,
      include: {
        pattern: true,
      },
    });

    // Enrich follow-ups with user/group data
    const enrichedFollowUps = await Promise.all(
      pendingFollowUps.map(async (followUp) => {
        const user = await prisma.user.findUnique({
          where: { id: followUp.userId },
          select: { id: true, firstName: true, lastName: true },
        });
        const group = await prisma.group.findUnique({
          where: { id: followUp.groupId },
          select: { id: true, name: true },
        });
        return { ...followUp, user, group };
      })
    );

    // Get patterns needing attention
    const patternsNeedingAttention = await prisma.attendancePattern.findMany({
      where: {
        organizationId,
        OR: [
          { consecutiveAbsences: { gte: 3 } },
          { attendanceRate: { lt: 50 } },
        ],
      },
      orderBy: { consecutiveAbsences: 'desc' },
      take: 10,
    });

    res.json({
      summary: {
        totalRecords,
        totalPresent,
        overallRate: overallRate.toFixed(1),
        groupCount: groups.length,
        pendingFollowUpCount: pendingFollowUps.length,
        patternsNeedingAttentionCount: patternsNeedingAttention.length,
      },
      groups,
      recentFollowUps: enrichedFollowUps,
      patternsNeedingAttention,
    });
  } catch (error) {
    logger.error('Error fetching dashboard overview:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
};

export default {
  recordAttendance,
  recordBulkAttendance,
  getGroupAttendance,
  getGroupAttendanceStats,
  getStudentPattern,
  recalculatePattern,
  getFollowUpSuggestions,
  getFollowUpSuggestion,
  updateFollowUpSuggestion,
  dismissFollowUpSuggestion,
  getDashboardOverview,
};
