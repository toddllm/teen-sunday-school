import { Session, SessionStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';
import logger from '../config/logger';

export interface CreateSessionInput {
  organizationId: string;
  groupId: string;
  lessonId?: string;
  title?: string;
  scheduledDate: Date;
  startTime?: Date;
  endTime?: Date;
  checkInEnabled?: boolean;
  checkInOpensAt?: Date;
  checkInClosesAt?: Date;
  notes?: string;
  createdBy?: string;
}

export interface UpdateSessionInput {
  title?: string;
  scheduledDate?: Date;
  startTime?: Date;
  endTime?: Date;
  status?: SessionStatus;
  checkInEnabled?: boolean;
  checkInOpensAt?: Date;
  checkInClosesAt?: Date;
  notes?: string;
  lessonId?: string;
}

export interface SessionFilters {
  organizationId?: string;
  groupId?: string;
  status?: SessionStatus;
  startDate?: Date;
  endDate?: Date;
}

export class SessionService {
  /**
   * Create a new session
   */
  static async createSession(input: CreateSessionInput): Promise<Session> {
    try {
      logger.info(`Creating session for group ${input.groupId}`);

      const session = await prisma.session.create({
        data: {
          organizationId: input.organizationId,
          groupId: input.groupId,
          lessonId: input.lessonId,
          title: input.title,
          scheduledDate: input.scheduledDate,
          startTime: input.startTime,
          endTime: input.endTime,
          checkInEnabled: input.checkInEnabled ?? true,
          checkInOpensAt: input.checkInOpensAt,
          checkInClosesAt: input.checkInClosesAt,
          notes: input.notes,
          createdBy: input.createdBy,
        },
        include: {
          group: true,
          lesson: true,
          attendance: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.info(`Session created successfully: ${session.id}`);
      return session;
    } catch (error) {
      logger.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Get session by ID
   */
  static async getSessionById(sessionId: string): Promise<Session | null> {
    try {
      return await prisma.session.findUnique({
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
          lesson: true,
          attendance: {
            include: {
              user: true,
            },
          },
          organization: true,
        },
      });
    } catch (error) {
      logger.error(`Error fetching session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get sessions with filters
   */
  static async getSessions(filters: SessionFilters): Promise<Session[]> {
    try {
      const where: Prisma.SessionWhereInput = {};

      if (filters.organizationId) {
        where.organizationId = filters.organizationId;
      }

      if (filters.groupId) {
        where.groupId = filters.groupId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.startDate || filters.endDate) {
        where.scheduledDate = {};
        if (filters.startDate) {
          where.scheduledDate.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.scheduledDate.lte = filters.endDate;
        }
      }

      return await prisma.session.findMany({
        where,
        include: {
          group: true,
          lesson: true,
          attendance: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          scheduledDate: 'desc',
        },
      });
    } catch (error) {
      logger.error('Error fetching sessions:', error);
      throw error;
    }
  }

  /**
   * Update a session
   */
  static async updateSession(
    sessionId: string,
    input: UpdateSessionInput
  ): Promise<Session> {
    try {
      logger.info(`Updating session ${sessionId}`);

      const session = await prisma.session.update({
        where: { id: sessionId },
        data: input,
        include: {
          group: true,
          lesson: true,
          attendance: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.info(`Session updated successfully: ${session.id}`);
      return session;
    } catch (error) {
      logger.error(`Error updating session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      logger.info(`Deleting session ${sessionId}`);
      await prisma.session.delete({
        where: { id: sessionId },
      });
      logger.info(`Session deleted successfully: ${sessionId}`);
    } catch (error) {
      logger.error(`Error deleting session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Start a session (update status to IN_PROGRESS)
   */
  static async startSession(sessionId: string): Promise<Session> {
    try {
      logger.info(`Starting session ${sessionId}`);

      const session = await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'IN_PROGRESS',
          startTime: new Date(),
          checkInOpensAt: new Date(), // Open check-in when session starts
        },
        include: {
          group: true,
          lesson: true,
          attendance: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.info(`Session started successfully: ${session.id}`);
      return session;
    } catch (error) {
      logger.error(`Error starting session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * End a session (update status to COMPLETED)
   */
  static async endSession(sessionId: string): Promise<Session> {
    try {
      logger.info(`Ending session ${sessionId}`);

      const session = await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          endTime: new Date(),
          checkInClosesAt: new Date(), // Close check-in when session ends
        },
        include: {
          group: true,
          lesson: true,
          attendance: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.info(`Session ended successfully: ${session.id}`);
      return session;
    } catch (error) {
      logger.error(`Error ending session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a session
   */
  static async cancelSession(sessionId: string): Promise<Session> {
    try {
      logger.info(`Cancelling session ${sessionId}`);

      const session = await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'CANCELLED',
        },
        include: {
          group: true,
          lesson: true,
          attendance: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.info(`Session cancelled successfully: ${session.id}`);
      return session;
    } catch (error) {
      logger.error(`Error cancelling session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Check if check-in is currently open for a session
   */
  static async isCheckInOpen(sessionId: string): Promise<boolean> {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: {
          checkInEnabled: true,
          checkInOpensAt: true,
          checkInClosesAt: true,
          status: true,
        },
      });

      if (!session || !session.checkInEnabled) {
        return false;
      }

      const now = new Date();

      // Check-in is open if session is in progress or scheduled
      if (session.status !== 'IN_PROGRESS' && session.status !== 'SCHEDULED') {
        return false;
      }

      // Check time window if specified
      if (session.checkInOpensAt && now < session.checkInOpensAt) {
        return false;
      }

      if (session.checkInClosesAt && now > session.checkInClosesAt) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`Error checking if check-in is open for session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Get attendance statistics for a session
   */
  static async getSessionStats(sessionId: string) {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          group: {
            include: {
              members: true,
            },
          },
          attendance: {
            where: {
              status: {
                in: ['PRESENT', 'LATE'],
              },
            },
          },
        },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      const totalMembers = session.group.members.length;
      const presentCount = session.attendance.length;
      const absentCount = totalMembers - presentCount;
      const attendanceRate = totalMembers > 0 ? (presentCount / totalMembers) * 100 : 0;

      return {
        totalMembers,
        presentCount,
        absentCount,
        attendanceRate: Math.round(attendanceRate * 10) / 10, // Round to 1 decimal
      };
    } catch (error) {
      logger.error(`Error getting stats for session ${sessionId}:`, error);
      throw error;
    }
  }
}
