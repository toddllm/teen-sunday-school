import { PrismaClient, AttendanceStatus, SuggestionPriority, FollowUpCategory, FollowUpStatus } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Attendance Service
 * Handles attendance tracking, pattern analysis, and follow-up suggestions
 */

interface RecordAttendanceInput {
  organizationId: string;
  groupId: string;
  userId: string;
  classDate: Date;
  status: AttendanceStatus;
  notes?: string;
  recordedBy?: string;
}

interface AttendancePatternAnalysis {
  userId: string;
  attendanceRate: number;
  consecutiveAbsences: number;
  consecutivePresences: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  suggestionsGenerated: number;
}

/**
 * Record attendance for a student
 */
export async function recordAttendance(input: RecordAttendanceInput) {
  try {
    // Create or update attendance record
    const record = await prisma.attendanceRecord.upsert({
      where: {
        groupId_userId_classDate: {
          groupId: input.groupId,
          userId: input.userId,
          classDate: input.classDate,
        },
      },
      update: {
        status: input.status,
        notes: input.notes,
        recordedBy: input.recordedBy,
      },
      create: {
        organizationId: input.organizationId,
        groupId: input.groupId,
        userId: input.userId,
        classDate: input.classDate,
        status: input.status,
        notes: input.notes,
        recordedBy: input.recordedBy,
      },
    });

    // Update attendance pattern after recording
    await updateAttendancePattern(input.organizationId, input.groupId, input.userId);

    return record;
  } catch (error) {
    logger.error('Error recording attendance:', error);
    throw error;
  }
}

/**
 * Record attendance for multiple students (bulk operation)
 */
export async function recordBulkAttendance(
  organizationId: string,
  groupId: string,
  classDate: Date,
  attendanceData: Array<{ userId: string; status: AttendanceStatus; notes?: string }>,
  recordedBy?: string
) {
  try {
    const records = [];

    for (const data of attendanceData) {
      const record = await recordAttendance({
        organizationId,
        groupId,
        userId: data.userId,
        classDate,
        status: data.status,
        notes: data.notes,
        recordedBy,
      });
      records.push(record);
    }

    return records;
  } catch (error) {
    logger.error('Error recording bulk attendance:', error);
    throw error;
  }
}

/**
 * Update attendance pattern for a student
 */
export async function updateAttendancePattern(
  organizationId: string,
  groupId: string,
  userId: string
): Promise<AttendancePatternAnalysis> {
  try {
    // Get all attendance records for this student in this group
    const records = await prisma.attendanceRecord.findMany({
      where: {
        organizationId,
        groupId,
        userId,
      },
      orderBy: { classDate: 'desc' },
    });

    if (records.length === 0) {
      logger.warn(`No attendance records found for user ${userId} in group ${groupId}`);
      return {
        userId,
        attendanceRate: 0,
        consecutiveAbsences: 0,
        consecutivePresences: 0,
        trendDirection: 'stable',
        suggestionsGenerated: 0,
      };
    }

    // Calculate metrics
    const totalClassesHeld = records.length;
    const totalPresent = records.filter(r => r.status === 'PRESENT').length;
    const totalAbsent = records.filter(r => r.status === 'ABSENT').length;
    const totalExcused = records.filter(r => r.status === 'EXCUSED').length;
    const totalLate = records.filter(r => r.status === 'LATE').length;

    // Calculate attendance rate (present + late / total)
    const attendanceRate = ((totalPresent + totalLate) / totalClassesHeld) * 100;

    // Calculate consecutive absences/presences
    let consecutiveAbsences = 0;
    let consecutivePresences = 0;

    for (const record of records) {
      if (record.status === 'ABSENT') {
        consecutiveAbsences++;
        consecutivePresences = 0;
      } else if (record.status === 'PRESENT' || record.status === 'LATE') {
        consecutivePresences++;
        consecutiveAbsences = 0;
      } else {
        break; // Excused doesn't count for consecutive tracking
      }
    }

    // Calculate trend (compare last 4 weeks vs last 8 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const last4WeeksRecords = records.filter(r => r.classDate >= fourWeeksAgo);
    const last8WeeksRecords = records.filter(r => r.classDate >= eightWeeksAgo && r.classDate < fourWeeksAgo);

    let last4WeeksRate = 0;
    let last8WeeksRate = 0;

    if (last4WeeksRecords.length > 0) {
      const present4 = last4WeeksRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
      last4WeeksRate = (present4 / last4WeeksRecords.length) * 100;
    }

    if (last8WeeksRecords.length > 0) {
      const present8 = last8WeeksRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
      last8WeeksRate = (present8 / last8WeeksRecords.length) * 100;
    }

    let trendDirection: 'improving' | 'declining' | 'stable' = 'stable';
    if (last4WeeksRate > last8WeeksRate + 10) {
      trendDirection = 'improving';
    } else if (last4WeeksRate < last8WeeksRate - 10) {
      trendDirection = 'declining';
    }

    // Update or create attendance pattern
    const pattern = await prisma.attendancePattern.upsert({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      update: {
        totalClassesHeld,
        totalPresent,
        totalAbsent,
        totalExcused,
        totalLate,
        attendanceRate,
        consecutiveAbsences,
        consecutivePresences,
        lastAttendanceDate: records[0].classDate,
        lastAttendanceStatus: records[0].status,
        last4WeeksRate,
        last8WeeksRate,
        trendDirection,
        lastCalculatedAt: new Date(),
      },
      create: {
        organizationId,
        groupId,
        userId,
        totalClassesHeld,
        totalPresent,
        totalAbsent,
        totalExcused,
        totalLate,
        attendanceRate,
        consecutiveAbsences,
        consecutivePresences,
        lastAttendanceDate: records[0].classDate,
        lastAttendanceStatus: records[0].status,
        last4WeeksRate,
        last8WeeksRate,
        trendDirection,
        lastCalculatedAt: new Date(),
      },
    });

    // Generate follow-up suggestions if needed
    const suggestions = await generateFollowUpSuggestions(organizationId, groupId, userId, pattern);

    return {
      userId,
      attendanceRate,
      consecutiveAbsences,
      consecutivePresences,
      trendDirection,
      suggestionsGenerated: suggestions.length,
    };
  } catch (error) {
    logger.error('Error updating attendance pattern:', error);
    throw error;
  }
}

/**
 * Generate follow-up suggestions based on attendance patterns
 */
async function generateFollowUpSuggestions(
  organizationId: string,
  groupId: string,
  userId: string,
  pattern: any
) {
  const suggestions = [];

  try {
    // Rule 1: Consecutive absences (3+)
    if (pattern.consecutiveAbsences >= 3) {
      const existing = await prisma.followUpSuggestion.findFirst({
        where: {
          userId,
          groupId,
          category: 'CONSECUTIVE_ABSENCES',
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      });

      if (!existing) {
        const priority = pattern.consecutiveAbsences >= 5 ? 'URGENT' :
                        pattern.consecutiveAbsences >= 4 ? 'HIGH' : 'MEDIUM';

        const suggestion = await prisma.followUpSuggestion.create({
          data: {
            organizationId,
            groupId,
            userId,
            patternId: pattern.id,
            priority,
            category: 'CONSECUTIVE_ABSENCES',
            title: `${pattern.consecutiveAbsences} Consecutive Absences`,
            description: `Student has been absent for ${pattern.consecutiveAbsences} consecutive classes.`,
            suggestedAction: 'Reach out to check if there are any issues preventing attendance. Offer support and let them know they are missed.',
            triggerReason: `Consecutive absences threshold reached (${pattern.consecutiveAbsences} classes)`,
            triggerData: {
              consecutiveAbsences: pattern.consecutiveAbsences,
              attendanceRate: pattern.attendanceRate,
              lastAttendanceDate: pattern.lastAttendanceDate,
            },
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          },
        });
        suggestions.push(suggestion);
      }
    }

    // Rule 2: Low attendance rate (< 50%)
    if (pattern.attendanceRate < 50 && pattern.totalClassesHeld >= 4) {
      const existing = await prisma.followUpSuggestion.findFirst({
        where: {
          userId,
          groupId,
          category: 'LOW_ATTENDANCE_RATE',
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      });

      if (!existing) {
        const suggestion = await prisma.followUpSuggestion.create({
          data: {
            organizationId,
            groupId,
            userId,
            patternId: pattern.id,
            priority: pattern.attendanceRate < 30 ? 'HIGH' : 'MEDIUM',
            category: 'LOW_ATTENDANCE_RATE',
            title: `Low Attendance Rate (${pattern.attendanceRate.toFixed(1)}%)`,
            description: `Student's overall attendance rate is ${pattern.attendanceRate.toFixed(1)}% over ${pattern.totalClassesHeld} classes.`,
            suggestedAction: 'Have a conversation to understand barriers to attendance and explore ways to help.',
            triggerReason: `Attendance rate below threshold (${pattern.attendanceRate.toFixed(1)}%)`,
            triggerData: {
              attendanceRate: pattern.attendanceRate,
              totalPresent: pattern.totalPresent,
              totalClassesHeld: pattern.totalClassesHeld,
            },
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          },
        });
        suggestions.push(suggestion);
      }
    }

    // Rule 3: Declining trend
    if (pattern.trendDirection === 'declining' && pattern.last4WeeksRate < 60) {
      const existing = await prisma.followUpSuggestion.findFirst({
        where: {
          userId,
          groupId,
          category: 'DECLINING_TREND',
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      });

      if (!existing) {
        const suggestion = await prisma.followUpSuggestion.create({
          data: {
            organizationId,
            groupId,
            userId,
            patternId: pattern.id,
            priority: 'MEDIUM',
            category: 'DECLINING_TREND',
            title: 'Declining Attendance Trend',
            description: `Student's attendance has been declining. Recent rate: ${pattern.last4WeeksRate?.toFixed(1)}%`,
            suggestedAction: 'Check in to see if anything has changed or if they need additional support.',
            triggerReason: 'Attendance trend showing decline',
            triggerData: {
              last4WeeksRate: pattern.last4WeeksRate,
              last8WeeksRate: pattern.last8WeeksRate,
              trendDirection: pattern.trendDirection,
            },
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
        suggestions.push(suggestion);
      }
    }

    // Rule 4: First time absence (after good attendance)
    if (
      pattern.consecutiveAbsences === 1 &&
      pattern.consecutivePresences >= 5 &&
      pattern.lastAttendanceStatus === 'ABSENT'
    ) {
      const existing = await prisma.followUpSuggestion.findFirst({
        where: {
          userId,
          groupId,
          category: 'FIRST_TIME_ABSENCE',
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
        },
      });

      if (!existing) {
        const suggestion = await prisma.followUpSuggestion.create({
          data: {
            organizationId,
            groupId,
            userId,
            patternId: pattern.id,
            priority: 'LOW',
            category: 'FIRST_TIME_ABSENCE',
            title: 'First Absence After Good Attendance',
            description: `Student was absent for the first time after ${pattern.consecutivePresences} consecutive classes.`,
            suggestedAction: 'Send a quick note or text letting them know they were missed.',
            triggerReason: 'First absence after consistent attendance',
            triggerData: {
              previousConsecutivePresences: pattern.consecutivePresences,
              attendanceRate: pattern.attendanceRate,
            },
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          },
        });
        suggestions.push(suggestion);
      }
    }

    // Rule 5: Long-term absent (6+ weeks)
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

    if (pattern.lastAttendanceDate && pattern.lastAttendanceDate < sixWeeksAgo) {
      const existing = await prisma.followUpSuggestion.findFirst({
        where: {
          userId,
          groupId,
          category: 'LONG_TERM_ABSENT',
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      });

      if (!existing) {
        const weeksSinceAttendance = Math.floor(
          (Date.now() - pattern.lastAttendanceDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );

        const suggestion = await prisma.followUpSuggestion.create({
          data: {
            organizationId,
            groupId,
            userId,
            patternId: pattern.id,
            priority: 'URGENT',
            category: 'LONG_TERM_ABSENT',
            title: `Long-Term Absence (${weeksSinceAttendance} weeks)`,
            description: `Student has not attended in ${weeksSinceAttendance} weeks.`,
            suggestedAction: 'Important follow-up needed. Contact family to check on student and see if they plan to return.',
            triggerReason: `No attendance for ${weeksSinceAttendance} weeks`,
            triggerData: {
              lastAttendanceDate: pattern.lastAttendanceDate,
              weeksSinceAttendance,
            },
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
        });
        suggestions.push(suggestion);
      }
    }

    logger.info(`Generated ${suggestions.length} follow-up suggestions for user ${userId}`);
    return suggestions;
  } catch (error) {
    logger.error('Error generating follow-up suggestions:', error);
    return suggestions;
  }
}

/**
 * Get attendance records for a group
 */
export async function getGroupAttendance(
  groupId: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const where: any = { groupId };

    if (startDate || endDate) {
      where.classDate = {};
      if (startDate) where.classDate.gte = startDate;
      if (endDate) where.classDate.lte = endDate;
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      orderBy: { classDate: 'desc' },
    });

    return records;
  } catch (error) {
    logger.error('Error getting group attendance:', error);
    throw error;
  }
}

/**
 * Get attendance statistics for a group
 */
export async function getGroupAttendanceStats(groupId: string, weeks: number = 12) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const records = await prisma.attendanceRecord.findMany({
      where: {
        groupId,
        classDate: { gte: startDate },
      },
    });

    const patterns = await prisma.attendancePattern.findMany({
      where: { groupId },
    });

    // Calculate overall stats
    const totalRecords = records.length;
    const totalPresent = records.filter(r => r.status === 'PRESENT').length;
    const totalAbsent = records.filter(r => r.status === 'ABSENT').length;
    const totalExcused = records.filter(r => r.status === 'EXCUSED').length;
    const totalLate = records.filter(r => r.status === 'LATE').length;

    const overallRate = totalRecords > 0
      ? ((totalPresent + totalLate) / totalRecords) * 100
      : 0;

    // Get unique students
    const uniqueStudents = new Set(records.map(r => r.userId)).size;

    // Weekly breakdown
    const weeklyStats: Record<string, any> = {};
    records.forEach(record => {
      const weekKey = getWeekKey(record.classDate);
      if (!weeklyStats[weekKey]) {
        weeklyStats[weekKey] = {
          week: weekKey,
          total: 0,
          present: 0,
          absent: 0,
          excused: 0,
          late: 0,
        };
      }
      weeklyStats[weekKey].total++;
      if (record.status === 'PRESENT') weeklyStats[weekKey].present++;
      if (record.status === 'ABSENT') weeklyStats[weekKey].absent++;
      if (record.status === 'EXCUSED') weeklyStats[weekKey].excused++;
      if (record.status === 'LATE') weeklyStats[weekKey].late++;
    });

    return {
      overall: {
        totalRecords,
        totalPresent,
        totalAbsent,
        totalExcused,
        totalLate,
        attendanceRate: overallRate,
        uniqueStudents,
      },
      weekly: Object.values(weeklyStats),
      patterns: {
        total: patterns.length,
        needingFollowUp: patterns.filter(p => p.consecutiveAbsences >= 3 || p.attendanceRate < 50).length,
      },
    };
  } catch (error) {
    logger.error('Error getting group attendance stats:', error);
    throw error;
  }
}

/**
 * Get follow-up suggestions
 */
export async function getFollowUpSuggestions(
  organizationId: string,
  groupId?: string,
  status?: FollowUpStatus
) {
  try {
    const where: any = { organizationId };
    if (groupId) where.groupId = groupId;
    if (status) where.status = status;

    const suggestions = await prisma.followUpSuggestion.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return suggestions;
  } catch (error) {
    logger.error('Error getting follow-up suggestions:', error);
    throw error;
  }
}

/**
 * Update follow-up suggestion status
 */
export async function updateFollowUpSuggestion(
  suggestionId: string,
  updates: {
    status?: FollowUpStatus;
    assignedTo?: string;
    contactedAt?: Date;
    contactMethod?: string;
    contactNotes?: string;
    resolvedAt?: Date;
    resolution?: string;
    outcome?: string;
  }
) {
  try {
    const suggestion = await prisma.followUpSuggestion.update({
      where: { id: suggestionId },
      data: updates,
    });

    return suggestion;
  } catch (error) {
    logger.error('Error updating follow-up suggestion:', error);
    throw error;
  }
}

/**
 * Helper function to get week key from date
 */
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * Helper function to get week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export default {
  recordAttendance,
  recordBulkAttendance,
  updateAttendancePattern,
  getGroupAttendance,
  getGroupAttendanceStats,
  getFollowUpSuggestions,
  updateFollowUpSuggestion,
};
