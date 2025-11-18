import { Request, Response } from 'express';
import { SessionService } from '../services/session.service';
import logger from '../config/logger';
import { SessionStatus } from '@prisma/client';

/**
 * Create a new session
 */
export async function createSession(req: Request, res: Response): Promise<void> {
  try {
    const {
      groupId,
      lessonId,
      title,
      scheduledDate,
      startTime,
      endTime,
      checkInEnabled,
      checkInOpensAt,
      checkInClosesAt,
      notes,
    } = req.body;

    // Validate required fields
    if (!groupId || !scheduledDate) {
      res.status(400).json({ error: 'groupId and scheduledDate are required' });
      return;
    }

    // Get organization ID from authenticated user
    const organizationId = (req as any).user.organizationId;
    const createdBy = (req as any).user.userId;

    const session = await SessionService.createSession({
      organizationId,
      groupId,
      lessonId,
      title,
      scheduledDate: new Date(scheduledDate),
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      checkInEnabled,
      checkInOpensAt: checkInOpensAt ? new Date(checkInOpensAt) : undefined,
      checkInClosesAt: checkInClosesAt ? new Date(checkInClosesAt) : undefined,
      notes,
      createdBy,
    });

    res.status(201).json(session);
  } catch (error) {
    logger.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
}

/**
 * Get session by ID
 */
export async function getSession(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const session = await SessionService.getSessionById(id);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Verify user has access to this session's organization
    const userOrgId = (req as any).user.organizationId;
    if (session.organizationId !== userOrgId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(session);
  } catch (error) {
    logger.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
}

/**
 * Get sessions with filters
 */
export async function getSessions(req: Request, res: Response): Promise<void> {
  try {
    const { groupId, status, startDate, endDate } = req.query;
    const organizationId = (req as any).user.organizationId;

    const sessions = await SessionService.getSessions({
      organizationId,
      groupId: groupId as string,
      status: status as SessionStatus,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json(sessions);
  } catch (error) {
    logger.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}

/**
 * Update a session
 */
export async function updateSession(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const {
      title,
      scheduledDate,
      startTime,
      endTime,
      status,
      checkInEnabled,
      checkInOpensAt,
      checkInClosesAt,
      notes,
      lessonId,
    } = req.body;

    // Verify session exists and user has access
    const existingSession = await SessionService.getSessionById(id);
    if (!existingSession) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const userOrgId = (req as any).user.organizationId;
    if (existingSession.organizationId !== userOrgId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const session = await SessionService.updateSession(id, {
      title,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      status,
      checkInEnabled,
      checkInOpensAt: checkInOpensAt ? new Date(checkInOpensAt) : undefined,
      checkInClosesAt: checkInClosesAt ? new Date(checkInClosesAt) : undefined,
      notes,
      lessonId,
    });

    res.json(session);
  } catch (error) {
    logger.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
}

/**
 * Delete a session
 */
export async function deleteSession(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verify session exists and user has access
    const session = await SessionService.getSessionById(id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const userOrgId = (req as any).user.organizationId;
    if (session.organizationId !== userOrgId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await SessionService.deleteSession(id);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
}

/**
 * Start a session
 */
export async function startSession(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verify session exists and user has access
    const existingSession = await SessionService.getSessionById(id);
    if (!existingSession) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const userOrgId = (req as any).user.organizationId;
    if (existingSession.organizationId !== userOrgId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const session = await SessionService.startSession(id);
    res.json(session);
  } catch (error) {
    logger.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
}

/**
 * End a session
 */
export async function endSession(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verify session exists and user has access
    const existingSession = await SessionService.getSessionById(id);
    if (!existingSession) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const userOrgId = (req as any).user.organizationId;
    if (existingSession.organizationId !== userOrgId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const session = await SessionService.endSession(id);
    res.json(session);
  } catch (error) {
    logger.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
}

/**
 * Cancel a session
 */
export async function cancelSession(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verify session exists and user has access
    const existingSession = await SessionService.getSessionById(id);
    if (!existingSession) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const userOrgId = (req as any).user.organizationId;
    if (existingSession.organizationId !== userOrgId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const session = await SessionService.cancelSession(id);
    res.json(session);
  } catch (error) {
    logger.error('Error cancelling session:', error);
    res.status(500).json({ error: 'Failed to cancel session' });
  }
}

/**
 * Get session statistics
 */
export async function getSessionStats(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verify session exists and user has access
    const session = await SessionService.getSessionById(id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const userOrgId = (req as any).user.organizationId;
    if (session.organizationId !== userOrgId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const stats = await SessionService.getSessionStats(id);
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching session stats:', error);
    res.status(500).json({ error: 'Failed to fetch session stats' });
  }
}
