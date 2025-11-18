import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Start a new live teaching session
 */
export async function startSession(req: Request, res: Response): Promise<void> {
  try {
    const { lessonId, groupId, sessionCode } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Validate input
    if (!lessonId) {
      res.status(400).json({ error: 'Lesson ID is required' });
      return;
    }

    // Check if user has TEACHER or ORG_ADMIN role
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'TEACHER' && user.role !== 'ORG_ADMIN' && user.role !== 'SUPER_ADMIN') {
      res.status(403).json({ error: 'Only leaders can start teaching sessions' });
      return;
    }

    // Get lesson to calculate total slides
    // Note: In production, you would fetch the lesson from the database
    // For now, we'll accept totalSlides from the request body
    const totalSlides = req.body.totalSlides || 0;

    // Create session
    const session = await prisma.liveSession.create({
      data: {
        lessonId,
        organizationId: user.organizationId,
        startedBy: user.id,
        groupId: groupId || null,
        sessionCode: sessionCode || null,
        totalSlides,
        currentStepIndex: 0,
        status: 'ACTIVE',
      },
    });

    logger.info(`Live session started: ${session.id} by user ${user.id} for lesson ${lessonId}`);

    res.status(201).json({ session });
  } catch (error: any) {
    logger.error('Start session error:', error);

    // Handle unique constraint violation for sessionCode
    if (error.code === 'P2002' && error.meta?.target?.includes('sessionCode')) {
      res.status(409).json({ error: 'Session code already in use' });
      return;
    }

    res.status(500).json({ error: 'Failed to start session' });
  }
}

/**
 * Get session by ID
 */
export async function getSession(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const session = await prisma.liveSession.findUnique({
      where: { id },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ session });
  } catch (error) {
    logger.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
}

/**
 * Get session by session code (for students to join)
 */
export async function getSessionByCode(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.params;

    const session = await prisma.liveSession.findUnique({
      where: { sessionCode: code },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Return limited info for students
    res.json({
      session: {
        id: session.id,
        lessonId: session.lessonId,
        currentStepIndex: session.currentStepIndex,
        status: session.status,
      },
    });
  } catch (error) {
    logger.error('Get session by code error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
}

/**
 * Advance to next/previous slide
 */
export async function advanceSession(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { stepIndex } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (stepIndex === undefined || stepIndex < 0) {
      res.status(400).json({ error: 'Valid step index is required' });
      return;
    }

    const session = await prisma.liveSession.findUnique({
      where: { id },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Check if user is the session presenter
    if (session.startedBy !== req.user.userId) {
      res.status(403).json({ error: 'Only the presenter can advance the session' });
      return;
    }

    // Check if session is active
    if (session.status !== 'ACTIVE') {
      res.status(400).json({ error: 'Session is not active' });
      return;
    }

    // Update session
    const updatedSession = await prisma.liveSession.update({
      where: { id },
      data: {
        currentStepIndex: stepIndex,
        slidesAdvanced: session.slidesAdvanced + 1,
        lastActivityAt: new Date(),
      },
    });

    logger.info(`Session ${id} advanced to step ${stepIndex}`);

    res.json({ session: updatedSession });
  } catch (error) {
    logger.error('Advance session error:', error);
    res.status(500).json({ error: 'Failed to advance session' });
  }
}

/**
 * End a live teaching session
 */
export async function endSession(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const session = await prisma.liveSession.findUnique({
      where: { id },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Check if user is the session presenter or an admin
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const canEnd =
      session.startedBy === req.user.userId ||
      user.role === 'ORG_ADMIN' ||
      user.role === 'SUPER_ADMIN';

    if (!canEnd) {
      res.status(403).json({ error: 'Only the presenter or an admin can end the session' });
      return;
    }

    // Calculate duration in minutes
    const durationMs = new Date().getTime() - session.startedAt.getTime();
    const durationMinutes = Math.round(durationMs / 60000);

    // Update session
    const updatedSession = await prisma.liveSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        durationMinutes,
      },
    });

    logger.info(`Session ${id} ended after ${durationMinutes} minutes`);

    res.json({ session: updatedSession });
  } catch (error) {
    logger.error('End session error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
}

/**
 * Get session metrics for analytics
 */
export async function getSessionMetrics(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get metrics for the organization
    const totalSessions = await prisma.liveSession.count({
      where: { organizationId: user.organizationId },
    });

    const completedSessions = await prisma.liveSession.count({
      where: {
        organizationId: user.organizationId,
        status: 'COMPLETED',
      },
    });

    const activeSessions = await prisma.liveSession.count({
      where: {
        organizationId: user.organizationId,
        status: 'ACTIVE',
      },
    });

    // Get average session length
    const sessions = await prisma.liveSession.findMany({
      where: {
        organizationId: user.organizationId,
        status: 'COMPLETED',
        durationMinutes: { not: null },
      },
      select: {
        durationMinutes: true,
        slidesAdvanced: true,
      },
    });

    const avgDuration = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / sessions.length
      : 0;

    const avgSlidesAdvanced = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.slidesAdvanced, 0) / sessions.length
      : 0;

    res.json({
      metrics: {
        totalSessions,
        completedSessions,
        activeSessions,
        averageSessionLength: Math.round(avgDuration),
        averageSlidesAdvanced: Math.round(avgSlidesAdvanced),
      },
    });
  } catch (error) {
    logger.error('Get session metrics error:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
}

/**
 * Get active sessions for an organization
 */
export async function getActiveSessions(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const sessions = await prisma.liveSession.findMany({
      where: {
        organizationId: user.organizationId,
        status: 'ACTIVE',
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    res.json({ sessions });
  } catch (error) {
    logger.error('Get active sessions error:', error);
    res.status(500).json({ error: 'Failed to get active sessions' });
  }
}
