import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';
import { generateJoinCode } from '../utils/joinCode';

/**
 * Create a new session and generate join code
 * POST /api/sessions
 */
export async function createSession(req: Request, res: Response): Promise<void> {
  try {
    const { groupId, durationMinutes = 120 } = req.body;

    if (!groupId) {
      res.status(400).json({ error: 'Group ID is required' });
      return;
    }

    // Verify group exists and user has access
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { userId: req.user?.userId },
        },
      },
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Check if user is a leader or has permission
    const member = group.members[0];
    if (!member || (member.role !== 'leader' && member.role !== 'assistant')) {
      res.status(403).json({ error: 'Only leaders can create sessions' });
      return;
    }

    // End any active sessions for this group
    await prisma.session.updateMany({
      where: {
        groupId,
        endedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        endedAt: new Date(),
      },
    });

    // Generate unique join code
    let joinCode = generateJoinCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await prisma.session.findUnique({
        where: { joinCode },
      });

      if (!existing) {
        isUnique = true;
      } else {
        joinCode = generateJoinCode();
        attempts++;
      }
    }

    if (!isUnique) {
      res.status(500).json({ error: 'Failed to generate unique join code' });
      return;
    }

    // Create session
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    const session = await prisma.session.create({
      data: {
        groupId,
        joinCode,
        expiresAt,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    logger.info(`Session created: ${session.id} with code ${joinCode} for group ${groupId}`);

    res.status(201).json({
      session: {
        id: session.id,
        joinCode: session.joinCode,
        expiresAt: session.expiresAt,
        startedAt: session.startedAt,
        group: session.group,
      },
    });
  } catch (error) {
    logger.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
}

/**
 * Join a session via join code
 * POST /api/sessions/join/:code
 */
export async function joinSession(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.params;
    const { nickname } = req.body;
    const userId = req.user?.userId;

    if (!code) {
      res.status(400).json({ error: 'Join code is required' });
      return;
    }

    // Find session by join code
    const session = await prisma.session.findUnique({
      where: { joinCode: code },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            organizationId: true,
          },
        },
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Invalid join code' });
      return;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      res.status(410).json({ error: 'This session has expired' });
      return;
    }

    // Check if session has ended
    if (session.endedAt) {
      res.status(410).json({ error: 'This session has ended' });
      return;
    }

    // Increment code uses
    await prisma.session.update({
      where: { id: session.id },
      data: { codeUses: { increment: 1 } },
    });

    // If user is authenticated
    if (userId) {
      // Check if user is already a member
      const existingMember = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId: session.groupId,
          },
        },
      });

      if (!existingMember) {
        // Add user to group
        await prisma.groupMember.create({
          data: {
            userId,
            groupId: session.groupId,
            role: 'member',
          },
        });
      }

      // Increment member joins
      await prisma.session.update({
        where: { id: session.id },
        data: { memberJoins: { increment: 1 } },
      });

      logger.info(`User ${userId} joined session ${session.id}`);

      res.json({
        success: true,
        session: {
          id: session.id,
          group: session.group,
          joinedAs: 'member',
        },
      });
    } else {
      // Guest join (no authentication)
      if (!nickname || nickname.trim().length === 0) {
        res.status(400).json({ error: 'Nickname is required for guest join' });
        return;
      }

      // Create guest session
      const tempId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const guest = await prisma.sessionGuest.create({
        data: {
          sessionId: session.id,
          tempId,
          nickname: nickname.trim(),
        },
      });

      // Increment guest joins
      await prisma.session.update({
        where: { id: session.id },
        data: { guestJoins: { increment: 1 } },
      });

      logger.info(`Guest ${guest.nickname} (${tempId}) joined session ${session.id}`);

      res.json({
        success: true,
        session: {
          id: session.id,
          group: session.group,
          joinedAs: 'guest',
          guestId: tempId,
          nickname: guest.nickname,
        },
      });
    }
  } catch (error) {
    logger.error('Join session error:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
}

/**
 * Get session details
 * GET /api/sessions/:id
 */
export async function getSession(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            organizationId: true,
          },
        },
        guests: {
          select: {
            id: true,
            nickname: true,
            joinedAt: true,
            lastSeenAt: true,
          },
        },
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Check if user has access to this session
    if (req.user) {
      const member = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: req.user.userId,
            groupId: session.groupId,
          },
        },
      });

      if (!member) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    res.json({
      session: {
        id: session.id,
        joinCode: session.joinCode,
        expiresAt: session.expiresAt,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        group: session.group,
        metrics: {
          guestJoins: session.guestJoins,
          memberJoins: session.memberJoins,
          codeUses: session.codeUses,
          activeGuests: session.guests.length,
        },
        guests: session.guests,
      },
    });
  } catch (error) {
    logger.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
}

/**
 * Get sessions for a group
 * GET /api/groups/:groupId/sessions
 */
export async function getGroupSessions(req: Request, res: Response): Promise<void> {
  try {
    const { groupId } = req.params;
    const { active, limit = 10 } = req.query;

    // Verify user has access to group
    if (req.user) {
      const member = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: req.user.userId,
            groupId,
          },
        },
      });

      if (!member) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    const whereClause: any = { groupId };

    if (active === 'true') {
      whereClause.endedAt = null;
      whereClause.expiresAt = { gt: new Date() };
    }

    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            guests: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: parseInt(limit as string),
    });

    res.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        joinCode: s.joinCode,
        expiresAt: s.expiresAt,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        group: s.group,
        metrics: {
          guestJoins: s.guestJoins,
          memberJoins: s.memberJoins,
          codeUses: s.codeUses,
          activeGuests: s._count.guests,
        },
      })),
    });
  } catch (error) {
    logger.error('Get group sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
}

/**
 * End a session
 * PUT /api/sessions/:id/end
 */
export async function endSession(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        group: {
          include: {
            members: {
              where: { userId: req.user?.userId },
            },
          },
        },
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Check if user is a leader
    const member = session.group.members[0];
    if (!member || (member.role !== 'leader' && member.role !== 'assistant')) {
      res.status(403).json({ error: 'Only leaders can end sessions' });
      return;
    }

    // End session
    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        endedAt: new Date(),
      },
    });

    logger.info(`Session ${id} ended by user ${req.user?.userId}`);

    res.json({
      success: true,
      session: {
        id: updatedSession.id,
        endedAt: updatedSession.endedAt,
      },
    });
  } catch (error) {
    logger.error('End session error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
}

/**
 * Update guest last seen time
 * PUT /api/sessions/guests/:tempId/heartbeat
 */
export async function updateGuestHeartbeat(req: Request, res: Response): Promise<void> {
  try {
    const { tempId } = req.params;

    const guest = await prisma.sessionGuest.update({
      where: { tempId },
      data: {
        lastSeenAt: new Date(),
      },
    });

    res.json({ success: true });
  } catch (error) {
    logger.error('Update guest heartbeat error:', error);
    res.status(500).json({ error: 'Failed to update heartbeat' });
  }
}
