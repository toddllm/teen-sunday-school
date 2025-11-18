import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Get active events for an organization
 */
export async function getActiveEvents(req: Request, res: Response): Promise<void> {
  try {
    const { orgId } = req.params;
    const now = new Date();

    const events = await prisma.seasonalEvent.findMany({
      where: {
        organizationId: orgId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: [
        { isPinned: 'desc' },
        { startDate: 'desc' },
      ],
    });

    res.json(events);
  } catch (error) {
    logger.error('Get active events error:', error);
    res.status(500).json({ error: 'Failed to fetch active events' });
  }
}

/**
 * List all events for an organization (with optional filters)
 */
export async function listEvents(req: Request, res: Response): Promise<void> {
  try {
    const { orgId } = req.params;
    const { season, active } = req.query;

    const where: any = {
      organizationId: orgId,
    };

    if (season) {
      where.season = season;
    }

    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const events = await prisma.seasonalEvent.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { startDate: 'desc' },
      ],
      include: {
        _count: {
          select: {
            participations: true,
          },
        },
      },
    });

    res.json(events);
  } catch (error) {
    logger.error('List events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}

/**
 * Get a specific event by ID
 */
export async function getEvent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const event = await prisma.seasonalEvent.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            participations: true,
            activities: true,
          },
        },
      },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Check if user is participating
    let userParticipation = null;
    if (userId) {
      userParticipation = await prisma.eventParticipation.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId: id,
          },
        },
      });
    }

    res.json({
      ...event,
      userParticipation,
    });
  } catch (error) {
    logger.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
}

/**
 * Join/participate in an event
 */
export async function joinEvent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if event exists and is active
    const event = await prisma.seasonalEvent.findUnique({
      where: { id },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (!event.isActive) {
      res.status(400).json({ error: 'Event is not active' });
      return;
    }

    // Check if already participating
    const existing = await prisma.eventParticipation.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: id,
        },
      },
    });

    if (existing) {
      res.json(existing);
      return;
    }

    // Create participation
    const participation = await prisma.eventParticipation.create({
      data: {
        userId,
        eventId: id,
      },
    });

    res.status(201).json(participation);
  } catch (error) {
    logger.error('Join event error:', error);
    res.status(500).json({ error: 'Failed to join event' });
  }
}

/**
 * Get user's participation in an event
 */
export async function getParticipation(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const participation = await prisma.eventParticipation.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: id,
        },
      },
      include: {
        event: true,
      },
    });

    if (!participation) {
      res.status(404).json({ error: 'Participation not found' });
      return;
    }

    // Get user's activities for this event
    const activities = await prisma.eventActivity.findMany({
      where: {
        eventId: id,
        userId,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({
      ...participation,
      activities,
    });
  } catch (error) {
    logger.error('Get participation error:', error);
    res.status(500).json({ error: 'Failed to fetch participation' });
  }
}

/**
 * Log an event activity
 */
export async function logActivity(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const { activityType, points, metadata } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!activityType) {
      res.status(400).json({ error: 'Activity type is required' });
      return;
    }

    // Check if user is participating
    const participation = await prisma.eventParticipation.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: id,
        },
      },
    });

    if (!participation) {
      res.status(400).json({ error: 'User not participating in this event' });
      return;
    }

    // Create activity
    const activity = await prisma.eventActivity.create({
      data: {
        eventId: id,
        userId,
        activityType,
        points: points || 0,
        metadata: metadata || {},
      },
    });

    // Update participation points and progress
    const updatedParticipation = await prisma.eventParticipation.update({
      where: {
        userId_eventId: {
          userId,
          eventId: id,
        },
      },
      data: {
        pointsEarned: {
          increment: points || 0,
        },
      },
    });

    res.status(201).json({
      activity,
      participation: updatedParticipation,
    });
  } catch (error) {
    logger.error('Log activity error:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
}

/**
 * Get event leaderboard
 */
export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;

    const leaderboard = await prisma.eventParticipation.findMany({
      where: { eventId: id },
      orderBy: [
        { pointsEarned: 'desc' },
        { progress: 'desc' },
      ],
      take: limit,
      select: {
        userId: true,
        pointsEarned: true,
        progress: true,
        isCompleted: true,
        startedAt: true,
      },
    });

    res.json(leaderboard);
  } catch (error) {
    logger.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * Create a new seasonal event
 */
export async function createEvent(req: Request, res: Response): Promise<void> {
  try {
    const { orgId } = req.params;
    const userId = req.user?.userId;
    const {
      title,
      description,
      season,
      startDate,
      endDate,
      icon,
      bannerColor,
      bannerImage,
      challenges,
      rewards,
      readingPlanIds,
      isActive,
      isPinned,
    } = req.body;

    // Validate required fields
    if (!title || !description || !season || !startDate || !endDate) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'description', 'season', 'startDate', 'endDate'],
      });
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      res.status(400).json({ error: 'End date must be after start date' });
      return;
    }

    // Create event
    const event = await prisma.seasonalEvent.create({
      data: {
        organizationId: orgId,
        title,
        description,
        season,
        startDate: start,
        endDate: end,
        icon,
        bannerColor,
        bannerImage,
        challenges: challenges || [],
        rewards: rewards || {},
        readingPlanIds: readingPlanIds || [],
        isActive: isActive !== undefined ? isActive : true,
        isPinned: isPinned || false,
        createdBy: userId,
      },
    });

    logger.info(`Event created: ${event.id} by user ${userId}`);
    res.status(201).json(event);
  } catch (error) {
    logger.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
}

/**
 * Update an event
 */
export async function updateEvent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.organizationId;
    delete updates.createdBy;
    delete updates.createdAt;

    // Validate dates if provided
    if (updates.startDate && updates.endDate) {
      const start = new Date(updates.startDate);
      const end = new Date(updates.endDate);

      if (start >= end) {
        res.status(400).json({ error: 'End date must be after start date' });
        return;
      }
    }

    const event = await prisma.seasonalEvent.update({
      where: { id },
      data: updates,
    });

    logger.info(`Event updated: ${id} by user ${userId}`);
    res.json(event);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    logger.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
}

/**
 * Delete an event
 */
export async function deleteEvent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    await prisma.seasonalEvent.delete({
      where: { id },
    });

    logger.info(`Event deleted: ${id} by user ${userId}`);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    logger.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
}

/**
 * Get event statistics
 */
export async function getEventStats(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const event = await prisma.seasonalEvent.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            participations: true,
            activities: true,
          },
        },
      },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Get participation statistics
    const participationStats = await prisma.eventParticipation.aggregate({
      where: { eventId: id },
      _avg: {
        progress: true,
        pointsEarned: true,
      },
      _sum: {
        pointsEarned: true,
      },
      _count: {
        isCompleted: true,
      },
    });

    const completedCount = await prisma.eventParticipation.count({
      where: {
        eventId: id,
        isCompleted: true,
      },
    });

    // Get activity breakdown
    const activityBreakdown = await prisma.eventActivity.groupBy({
      by: ['activityType'],
      where: { eventId: id },
      _count: {
        id: true,
      },
      _sum: {
        points: true,
      },
    });

    res.json({
      event,
      stats: {
        totalParticipants: event._count.participations,
        totalActivities: event._count.activities,
        completedParticipants: completedCount,
        completionRate: event._count.participations > 0
          ? (completedCount / event._count.participations) * 100
          : 0,
        averageProgress: participationStats._avg.progress || 0,
        averagePoints: participationStats._avg.pointsEarned || 0,
        totalPoints: participationStats._sum.pointsEarned || 0,
        activityBreakdown,
      },
    });
  } catch (error) {
    logger.error('Get event stats error:', error);
    res.status(500).json({ error: 'Failed to fetch event statistics' });
  }
}

/**
 * Get all participants for an event
 */
export async function getParticipants(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [participants, total] = await Promise.all([
      prisma.eventParticipation.findMany({
        where: { eventId: id },
        skip,
        take: limit,
        orderBy: { pointsEarned: 'desc' },
        select: {
          userId: true,
          progress: true,
          pointsEarned: true,
          isCompleted: true,
          completedAt: true,
          startedAt: true,
        },
      }),
      prisma.eventParticipation.count({
        where: { eventId: id },
      }),
    ]);

    res.json({
      participants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get participants error:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
}
