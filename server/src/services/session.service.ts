import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Generate a unique session code (4-6 characters)
 */
function generateSessionCode(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar-looking characters
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new live session
 */
export async function createSession(data: {
  lessonId: string;
  teacherId: string;
  organizationId: string;
  groupId?: string;
}) {
  try {
    // Generate a unique session code
    let code = generateSessionCode(6);
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const existing = await prisma.session.findUnique({
        where: { code },
      });

      if (!existing) {
        break;
      }

      code = generateSessionCode(6);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique session code');
    }

    // Create the session
    const session = await prisma.session.create({
      data: {
        code,
        lessonId: data.lessonId,
        teacherId: data.teacherId,
        organizationId: data.organizationId,
        groupId: data.groupId || null,
        currentSlideIndex: 0,
        status: 'ACTIVE',
      },
      include: {
        participants: true,
      },
    });

    logger.info(`Session created: ${session.id} with code ${code}`);
    return session;
  } catch (error) {
    logger.error('Error creating session:', error);
    throw error;
  }
}

/**
 * Get session by code
 */
export async function getSessionByCode(code: string) {
  try {
    const session = await prisma.session.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        participants: {
          where: { isActive: true },
          orderBy: { joinedAt: 'desc' },
        },
      },
    });

    return session;
  } catch (error) {
    logger.error('Error fetching session by code:', error);
    throw error;
  }
}

/**
 * Get session by ID
 */
export async function getSessionById(sessionId: string) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        participants: {
          where: { isActive: true },
          orderBy: { joinedAt: 'desc' },
        },
      },
    });

    return session;
  } catch (error) {
    logger.error('Error fetching session:', error);
    throw error;
  }
}

/**
 * Update session slide index
 */
export async function updateSessionSlide(sessionId: string, slideIndex: number) {
  try {
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        currentSlideIndex: slideIndex,
        lastActivityAt: new Date(),
      },
    });

    return session;
  } catch (error) {
    logger.error('Error updating session slide:', error);
    throw error;
  }
}

/**
 * End a session
 */
export async function endSession(sessionId: string, teacherId: string) {
  try {
    // Verify the teacher owns this session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.teacherId !== teacherId) {
      throw new Error('Unauthorized: Only the teacher can end this session');
    }

    // End the session
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
      },
    });

    // Mark all participants as inactive
    await prisma.sessionParticipant.updateMany({
      where: { sessionId },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });

    logger.info(`Session ${sessionId} ended by teacher ${teacherId}`);
    return updatedSession;
  } catch (error) {
    logger.error('Error ending session:', error);
    throw error;
  }
}

/**
 * Get session statistics
 */
export async function getSessionStats(sessionId: string) {
  try {
    const [session, totalParticipants, activeParticipants, noteCount] = await Promise.all([
      prisma.session.findUnique({ where: { id: sessionId } }),
      prisma.sessionParticipant.count({ where: { sessionId } }),
      prisma.sessionParticipant.count({ where: { sessionId, isActive: true } }),
      prisma.sessionNote.count({ where: { sessionId } }),
    ]);

    if (!session) {
      throw new Error('Session not found');
    }

    const duration = session.endedAt
      ? session.endedAt.getTime() - session.startedAt.getTime()
      : Date.now() - session.startedAt.getTime();

    return {
      sessionId,
      code: session.code,
      status: session.status,
      totalParticipants,
      activeParticipants,
      noteCount,
      currentSlideIndex: session.currentSlideIndex,
      durationMs: duration,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    };
  } catch (error) {
    logger.error('Error fetching session stats:', error);
    throw error;
  }
}

/**
 * Get participant's notes for a session
 */
export async function getParticipantNotes(participantId: string, sessionId: string) {
  try {
    const notes = await prisma.sessionNote.findMany({
      where: {
        participantId,
        sessionId,
      },
      orderBy: { slideIndex: 'asc' },
    });

    return notes;
  } catch (error) {
    logger.error('Error fetching participant notes:', error);
    throw error;
  }
}

/**
 * Get all active sessions for an organization
 */
export async function getActiveSessions(organizationId: string) {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
      include: {
        participants: {
          where: { isActive: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    return sessions;
  } catch (error) {
    logger.error('Error fetching active sessions:', error);
    throw error;
  }
}

/**
 * Get session history for a teacher
 */
export async function getTeacherSessions(teacherId: string, limit: number = 20) {
  try {
    const sessions = await prisma.session.findMany({
      where: { teacherId },
      include: {
        participants: true,
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return sessions;
  } catch (error) {
    logger.error('Error fetching teacher sessions:', error);
    throw error;
  }
}

/**
 * Clean up old sessions (can be run as a scheduled job)
 */
export async function cleanupOldSessions(daysOld: number = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Find sessions older than cutoff
    const oldSessions = await prisma.session.findMany({
      where: {
        startedAt: { lt: cutoffDate },
        status: 'ENDED',
      },
      select: { id: true },
    });

    logger.info(`Found ${oldSessions.length} sessions older than ${daysOld} days`);

    // Archive or delete notes and participants associated with old sessions
    // For now, we'll just mark them but keep the data
    for (const session of oldSessions) {
      await prisma.sessionParticipant.updateMany({
        where: { sessionId: session.id },
        data: { isActive: false },
      });
    }

    return oldSessions.length;
  } catch (error) {
    logger.error('Error cleaning up old sessions:', error);
    throw error;
  }
}
