import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Personal Spiritual Goals Controller
 * Manages user spiritual goals and progress tracking
 */

/**
 * GET /api/goals
 * List all user's goals with optional filters
 */
export const listGoals = async (req: Request, res: Response) => {
  try {
    const { userId, organizationId } = req.user!;
    const { status, category, priority } = req.query;

    const where: any = {
      userId,
      organizationId,
    };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    const goals = await prisma.personalGoal.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { targetDate: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        _count: {
          select: { progressUpdates: true },
        },
      },
    });

    res.json(goals);
  } catch (error) {
    logger.error('Error listing goals:', error);
    res.status(500).json({ error: 'Failed to list goals' });
  }
};

/**
 * GET /api/goals/:id
 * Get a specific goal with progress history
 */
export const getGoal = async (req: Request, res: Response) => {
  try {
    const { userId, organizationId } = req.user!;
    const { id } = req.params;

    const goal = await prisma.personalGoal.findFirst({
      where: {
        id,
        userId,
        organizationId,
      },
      include: {
        progressUpdates: {
          orderBy: { timestamp: 'desc' },
          take: 50, // Last 50 updates
        },
      },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    logger.error('Error fetching goal:', error);
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
};

/**
 * POST /api/goals
 * Create a new personal goal
 */
export const createGoal = async (req: Request, res: Response) => {
  try {
    const { userId, organizationId } = req.user!;
    const {
      title,
      description,
      category,
      targetDate,
      priority,
      isPrivate,
      metadata,
    } = req.body;

    // Validation
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const validCategories = [
      'PRAYER',
      'BIBLE_READING',
      'SCRIPTURE_MEMORIZATION',
      'SERVICE',
      'DISCIPLESHIP',
      'WORSHIP',
      'WITNESSING',
      'FELLOWSHIP',
      'SPIRITUAL_DISCIPLINE',
      'CHARACTER_DEVELOPMENT',
      'OTHER',
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const goal = await prisma.personalGoal.create({
      data: {
        organizationId,
        userId,
        title,
        description,
        category,
        targetDate: targetDate ? new Date(targetDate) : null,
        priority: priority || 'MEDIUM',
        isPrivate: isPrivate ?? true,
        metadata: metadata || null,
      },
    });

    logger.info(`Goal created: ${goal.id} by user ${userId}`);
    res.status(201).json(goal);
  } catch (error) {
    logger.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

/**
 * PATCH /api/goals/:id
 * Update an existing goal
 */
export const updateGoal = async (req: Request, res: Response) => {
  try {
    const { userId, organizationId } = req.user!;
    const { id } = req.params;
    const {
      title,
      description,
      category,
      targetDate,
      status,
      priority,
      isPrivate,
      metadata,
    } = req.body;

    // Verify ownership
    const existingGoal = await prisma.personalGoal.findFirst({
      where: {
        id,
        userId,
        organizationId,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (targetDate !== undefined)
      updateData.targetDate = targetDate ? new Date(targetDate) : null;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
    if (metadata !== undefined) updateData.metadata = metadata;

    const goal = await prisma.personalGoal.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Goal updated: ${goal.id} by user ${userId}`);
    res.json(goal);
  } catch (error) {
    logger.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

/**
 * DELETE /api/goals/:id
 * Delete a goal
 */
export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const { userId, organizationId } = req.user!;
    const { id } = req.params;

    // Verify ownership
    const existingGoal = await prisma.personalGoal.findFirst({
      where: {
        id,
        userId,
        organizationId,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await prisma.personalGoal.delete({
      where: { id },
    });

    logger.info(`Goal deleted: ${id} by user ${userId}`);
    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    logger.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

/**
 * POST /api/goals/:id/progress
 * Log progress update for a goal
 */
export const logProgress = async (req: Request, res: Response) => {
  try {
    const { userId, organizationId } = req.user!;
    const { id } = req.params;
    const { progress, note } = req.body;

    // Validate progress
    if (progress === undefined || progress < 0 || progress > 100) {
      return res
        .status(400)
        .json({ error: 'Progress must be between 0 and 100' });
    }

    // Verify goal ownership
    const goal = await prisma.personalGoal.findFirst({
      where: {
        id,
        userId,
        organizationId,
      },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Create progress update
    const progressUpdate = await prisma.goalProgress.create({
      data: {
        goalId: id,
        userId,
        progress,
        note,
      },
    });

    // Auto-update goal status based on progress
    if (progress === 100 && goal.status !== 'COMPLETED') {
      await prisma.personalGoal.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });
    } else if (progress > 0 && goal.status === 'NOT_STARTED') {
      await prisma.personalGoal.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    logger.info(`Progress logged for goal ${id}: ${progress}%`);
    res.status(201).json(progressUpdate);
  } catch (error) {
    logger.error('Error logging progress:', error);
    res.status(500).json({ error: 'Failed to log progress' });
  }
};

/**
 * GET /api/goals/:id/progress
 * Get progress history for a goal
 */
export const getProgress = async (req: Request, res: Response) => {
  try {
    const { userId, organizationId } = req.user!;
    const { id } = req.params;

    // Verify goal ownership
    const goal = await prisma.personalGoal.findFirst({
      where: {
        id,
        userId,
        organizationId,
      },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const progressHistory = await prisma.goalProgress.findMany({
      where: { goalId: id },
      orderBy: { timestamp: 'desc' },
    });

    res.json(progressHistory);
  } catch (error) {
    logger.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

/**
 * GET /api/goals/stats
 * Get user's goal statistics
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const { userId, organizationId } = req.user!;

    // Get all user goals
    const goals = await prisma.personalGoal.findMany({
      where: {
        userId,
        organizationId,
      },
      include: {
        progressUpdates: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    // Calculate statistics
    const stats = {
      total: goals.length,
      byStatus: {
        notStarted: goals.filter((g) => g.status === 'NOT_STARTED').length,
        inProgress: goals.filter((g) => g.status === 'IN_PROGRESS').length,
        completed: goals.filter((g) => g.status === 'COMPLETED').length,
        paused: goals.filter((g) => g.status === 'PAUSED').length,
        abandoned: goals.filter((g) => g.status === 'ABANDONED').length,
      },
      byCategory: goals.reduce((acc, goal) => {
        acc[goal.category] = (acc[goal.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPriority: {
        high: goals.filter((g) => g.priority === 'HIGH').length,
        medium: goals.filter((g) => g.priority === 'MEDIUM').length,
        low: goals.filter((g) => g.priority === 'LOW').length,
      },
      completionRate:
        goals.length > 0
          ? Math.round(
              (goals.filter((g) => g.status === 'COMPLETED').length /
                goals.length) *
                100
            )
          : 0,
      averageProgress:
        goals.length > 0
          ? Math.round(
              goals.reduce((sum, goal) => {
                const latestProgress = goal.progressUpdates[0]?.progress || 0;
                return sum + latestProgress;
              }, 0) / goals.length
            )
          : 0,
    };

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching goal stats:', error);
    res.status(500).json({ error: 'Failed to fetch goal statistics' });
  }
};
