import { Request, Response } from 'express';
import * as sessionService from '../services/session.service';
import logger from '../config/logger';

/**
 * Create a new live session
 * POST /api/sessions/create
 */
export async function createSession(req: Request, res: Response) {
  try {
    const { lessonId, groupId } = req.body;
    const userId = (req as any).user.userId;
    const organizationId = (req as any).user.organizationId;

    if (!lessonId) {
      return res.status(400).json({ error: 'lessonId is required' });
    }

    const session = await sessionService.createSession({
      lessonId,
      teacherId: userId,
      organizationId,
      groupId,
    });

    res.status(201).json({
      success: true,
      session: {
        id: session.id,
        code: session.code,
        lessonId: session.lessonId,
        currentSlideIndex: session.currentSlideIndex,
        status: session.status,
        startedAt: session.startedAt,
      },
    });
  } catch (error: any) {
    logger.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
}

/**
 * Get session by code
 * GET /api/sessions/code/:code
 */
export async function getSessionByCode(req: Request, res: Response) {
  try {
    const { code } = req.params;

    const session = await sessionService.getSessionByCode(code);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      success: true,
      session: {
        id: session.id,
        code: session.code,
        lessonId: session.lessonId,
        currentSlideIndex: session.currentSlideIndex,
        status: session.status,
        participantCount: session.participants.length,
        startedAt: session.startedAt,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching session by code:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
}

/**
 * Get session by ID
 * GET /api/sessions/:id
 */
export async function getSession(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const session = await sessionService.getSessionById(id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      success: true,
      session: {
        id: session.id,
        code: session.code,
        lessonId: session.lessonId,
        teacherId: session.teacherId,
        groupId: session.groupId,
        currentSlideIndex: session.currentSlideIndex,
        status: session.status,
        participants: session.participants,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
}

/**
 * Get session state (for polling)
 * GET /api/sessions/:id/state
 */
export async function getSessionState(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const session = await sessionService.getSessionById(id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      success: true,
      state: {
        currentSlideIndex: session.currentSlideIndex,
        status: session.status,
        participantCount: session.participants.length,
        lastActivityAt: session.lastActivityAt,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching session state:', error);
    res.status(500).json({ error: 'Failed to fetch session state' });
  }
}

/**
 * End a session
 * POST /api/sessions/:id/end
 */
export async function endSession(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const session = await sessionService.endSession(id, userId);

    res.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        endedAt: session.endedAt,
      },
    });
  } catch (error: any) {
    logger.error('Error ending session:', error);

    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }

    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to end session' });
  }
}

/**
 * Get session statistics
 * GET /api/sessions/:id/stats
 */
export async function getSessionStats(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const stats = await sessionService.getSessionStats(id);

    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    logger.error('Error fetching session stats:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to fetch session stats' });
  }
}

/**
 * Get participant notes for a session
 * GET /api/sessions/:id/notes/:participantId
 */
export async function getParticipantNotes(req: Request, res: Response) {
  try {
    const { id, participantId } = req.params;

    const notes = await sessionService.getParticipantNotes(participantId, id);

    res.json({
      success: true,
      notes,
    });
  } catch (error: any) {
    logger.error('Error fetching participant notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
}

/**
 * Get all active sessions for the user's organization
 * GET /api/sessions/active
 */
export async function getActiveSessions(req: Request, res: Response) {
  try {
    const organizationId = (req as any).user.organizationId;

    const sessions = await sessionService.getActiveSessions(organizationId);

    res.json({
      success: true,
      sessions: sessions.map(s => ({
        id: s.id,
        code: s.code,
        lessonId: s.lessonId,
        teacherId: s.teacherId,
        currentSlideIndex: s.currentSlideIndex,
        participantCount: s.participants.length,
        startedAt: s.startedAt,
      })),
    });
  } catch (error: any) {
    logger.error('Error fetching active sessions:', error);
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
}

/**
 * Get session history for the current user
 * GET /api/sessions/my-sessions
 */
export async function getMySessionHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const limit = parseInt(req.query.limit as string) || 20;

    const sessions = await sessionService.getTeacherSessions(userId, limit);

    res.json({
      success: true,
      sessions: sessions.map(s => ({
        id: s.id,
        code: s.code,
        lessonId: s.lessonId,
        status: s.status,
        participantCount: s.participants.length,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
      })),
    });
  } catch (error: any) {
    logger.error('Error fetching session history:', error);
    res.status(500).json({ error: 'Failed to fetch session history' });
  }
}

/**
 * Join a session (alternative to WebSocket join)
 * POST /api/sessions/code/:code/join
 */
export async function joinSession(req: Request, res: Response) {
  try {
    const { code } = req.params;
    const { displayName, anonymousId } = req.body;
    const userId = (req as any).user?.userId; // Optional auth

    const session = await sessionService.getSessionByCode(code);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Session is not active' });
    }

    res.json({
      success: true,
      session: {
        id: session.id,
        code: session.code,
        lessonId: session.lessonId,
        currentSlideIndex: session.currentSlideIndex,
        status: session.status,
      },
      message: 'Connect to WebSocket to receive real-time updates',
    });
  } catch (error: any) {
    logger.error('Error joining session:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
}
