import { Attendance, AttendanceStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';
import logger from '../config/logger';
import { SessionService } from './session.service';

export interface CheckInInput {
  sessionId: string;
  userId: string;
  checkedInBy?: string; // For manual check-ins by leaders
}

export interface ManualAttendanceInput {
  sessionId: string;
  userId: string;
  status: AttendanceStatus;
  checkedInBy: string;
  notes?: string;
}

export interface AttendanceReport {
  sessionId: string;
  sessionTitle?: string;
  scheduledDate: Date;
  totalMembers: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  attendanceRate: number;
  attendanceRecords: Attendance[];
}

export class AttendanceService {
  /**
   * Check-in a user to a session (self check-in)
   */
  static async checkIn(input: CheckInInput): Promise<Attendance> {
    try {
      logger.info(`User ${input.userId} checking in to session ${input.sessionId}`);

      // Verify check-in is open
      const isOpen = await SessionService.isCheckInOpen(input.sessionId);
      if (!isOpen) {
        throw new Error('Check-in is not currently open for this session');
      }

      // Check if user is a member of the group
      const session = await prisma.session.findUnique({
        where: { id: input.sessionId },
        include: {
          group: {
            include: {
              members: true,
            },
          },
        },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      const isMember = session.group.members.some(
        (member) => member.userId === input.userId
      );

      if (!isMember) {
        throw new Error('User is not a member of this group');
      }

      // Check if already checked in
      const existingAttendance = await prisma.attendance.findUnique({
        where: {
          sessionId_userId: {
            sessionId: input.sessionId,
            userId: input.userId,
          },
        },
      });

      if (existingAttendance) {
        logger.info(`User ${input.userId} already checked in to session ${input.sessionId}`);
        return existingAttendance;
      }

      // Determine if late (if session has started)
      const now = new Date();
      const isLate = session.startTime && now > session.startTime;

      // Create attendance record
      const attendance = await prisma.attendance.create({
        data: {
          sessionId: input.sessionId,
          userId: input.userId,
          status: isLate ? 'LATE' : 'PRESENT',
          checkedInAt: now,
          checkedInMethod: input.checkedInBy ? 'manual' : 'self',
          checkedInBy: input.checkedInBy,
        },
        include: {
          user: true,
          session: true,
        },
      });

      logger.info(
        `User ${input.userId} successfully checked in to session ${input.sessionId} as ${attendance.status}`
      );
      return attendance;
    } catch (error) {
      logger.error('Error during check-in:', error);
      throw error;
    }
  }

  /**
   * Manual attendance marking by leader
   */
  static async markAttendance(input: ManualAttendanceInput): Promise<Attendance> {
    try {
      logger.info(
        `Leader ${input.checkedInBy} marking attendance for user ${input.userId} in session ${input.sessionId}`
      );

      // Verify user is member of the group
      const session = await prisma.session.findUnique({
        where: { id: input.sessionId },
        include: {
          group: {
            include: {
              members: true,
            },
          },
        },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      const isMember = session.group.members.some(
        (member) => member.userId === input.userId
      );

      if (!isMember) {
        throw new Error('User is not a member of this group');
      }

      // Upsert attendance record
      const attendance = await prisma.attendance.upsert({
        where: {
          sessionId_userId: {
            sessionId: input.sessionId,
            userId: input.userId,
          },
        },
        update: {
          status: input.status,
          checkedInAt: input.status === 'PRESENT' || input.status === 'LATE' ? new Date() : null,
          checkedInBy: input.checkedInBy,
          checkedInMethod: 'manual',
          notes: input.notes,
        },
        create: {
          sessionId: input.sessionId,
          userId: input.userId,
          status: input.status,
          checkedInAt: input.status === 'PRESENT' || input.status === 'LATE' ? new Date() : null,
          checkedInBy: input.checkedInBy,
          checkedInMethod: 'manual',
          notes: input.notes,
        },
        include: {
          user: true,
          session: true,
        },
      });

      logger.info(
        `Attendance marked successfully for user ${input.userId} in session ${input.sessionId}`
      );
      return attendance;
    } catch (error) {
      logger.error('Error marking attendance:', error);
      throw error;
    }
  }

  /**
   * Get attendance for a specific session
   */
  static async getSessionAttendance(sessionId: string): Promise<Attendance[]> {
    try {
      return await prisma.attendance.findMany({
        where: { sessionId },
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
          checkedInAt: 'asc',
        },
      });
    } catch (error) {
      logger.error(`Error fetching attendance for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get attendance for a specific user
   */
  static async getUserAttendance(
    userId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      groupId?: string;
    }
  ): Promise<Attendance[]> {
    try {
      const where: Prisma.AttendanceWhereInput = {
        userId,
      };

      if (options?.startDate || options?.endDate || options?.groupId) {
        where.session = {};

        if (options?.groupId) {
          where.session.groupId = options.groupId;
        }

        if (options?.startDate || options?.endDate) {
          where.session.scheduledDate = {};

          if (options?.startDate) {
            where.session.scheduledDate.gte = options.startDate;
          }

          if (options?.endDate) {
            where.session.scheduledDate.lte = options.endDate;
          }
        }
      }

      return await prisma.attendance.findMany({
        where,
        include: {
          session: {
            include: {
              group: true,
              lesson: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      logger.error(`Error fetching attendance for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get attendance report for a session
   */
  static async getAttendanceReport(sessionId: string): Promise<AttendanceReport> {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          group: {
            include: {
              members: {
                include: {
                  user: true,
                },
              },
            },
          },
          attendance: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      const totalMembers = session.group.members.length;
      const presentCount = session.attendance.filter(
        (a) => a.status === 'PRESENT'
      ).length;
      const lateCount = session.attendance.filter((a) => a.status === 'LATE').length;
      const excusedCount = session.attendance.filter(
        (a) => a.status === 'EXCUSED'
      ).length;
      const absentCount = totalMembers - presentCount - lateCount - excusedCount;

      const attendanceRate =
        totalMembers > 0 ? ((presentCount + lateCount) / totalMembers) * 100 : 0;

      return {
        sessionId: session.id,
        sessionTitle: session.title || undefined,
        scheduledDate: session.scheduledDate,
        totalMembers,
        presentCount,
        lateCount,
        absentCount,
        excusedCount,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        attendanceRecords: session.attendance,
      };
    } catch (error) {
      logger.error(`Error generating attendance report for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get attendance summary for a group over a date range
   */
  static async getGroupAttendanceSummary(
    groupId: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
      const sessions = await prisma.session.findMany({
        where: {
          groupId,
          scheduledDate: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            not: 'CANCELLED',
          },
        },
        include: {
          attendance: {
            where: {
              status: {
                in: ['PRESENT', 'LATE'],
              },
            },
          },
          group: {
            include: {
              members: true,
            },
          },
        },
      });

      const totalSessions = sessions.length;
      const totalMembers = sessions[0]?.group.members.length || 0;

      let totalAttendance = 0;
      const memberAttendance: { [userId: string]: number } = {};

      sessions.forEach((session) => {
        totalAttendance += session.attendance.length;

        session.attendance.forEach((att) => {
          memberAttendance[att.userId] = (memberAttendance[att.userId] || 0) + 1;
        });
      });

      const averageAttendance =
        totalSessions > 0 ? totalAttendance / totalSessions : 0;
      const averageAttendanceRate =
        totalMembers > 0 && totalSessions > 0
          ? (averageAttendance / totalMembers) * 100
          : 0;

      // Find most/least regular attenders
      const sortedMembers = Object.entries(memberAttendance)
        .map(([userId, count]) => ({
          userId,
          sessionsAttended: count,
          attendanceRate: totalSessions > 0 ? (count / totalSessions) * 100 : 0,
        }))
        .sort((a, b) => b.sessionsAttended - a.sessionsAttended);

      return {
        groupId,
        startDate,
        endDate,
        totalSessions,
        totalMembers,
        averageAttendance: Math.round(averageAttendance * 10) / 10,
        averageAttendanceRate: Math.round(averageAttendanceRate * 10) / 10,
        memberAttendance: sortedMembers,
      };
    } catch (error) {
      logger.error(`Error generating group attendance summary for group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Delete an attendance record
   */
  static async deleteAttendance(attendanceId: string): Promise<void> {
    try {
      logger.info(`Deleting attendance record ${attendanceId}`);
      await prisma.attendance.delete({
        where: { id: attendanceId },
      });
      logger.info(`Attendance record deleted successfully: ${attendanceId}`);
    } catch (error) {
      logger.error(`Error deleting attendance record ${attendanceId}:`, error);
      throw error;
    }
  }
}
