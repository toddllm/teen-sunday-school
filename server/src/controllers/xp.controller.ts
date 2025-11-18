import { Request, Response } from 'express';
import * as xpService from '../services/xp.service';
import logger from '../config/logger';

/**
 * GET /api/me/xp
 * Get current user's XP information
 */
export async function getMyXP(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userXP = await xpService.getUserXP(req.user.userId);
    const progress = xpService.getLevelProgress(userXP.xpTotal);

    res.json({
      xpTotal: userXP.xpTotal,
      level: userXP.level,
      progress,
      recentEvents: userXP.events,
      rewards: userXP.rewards.map((ur) => ({
        id: ur.reward.id,
        type: ur.reward.type,
        name: ur.reward.name,
        description: ur.reward.description,
        unlockLevel: ur.reward.unlockLevel,
        data: ur.reward.data,
        isActive: ur.isActive,
        unlockedAt: ur.unlockedAt,
      })),
    });
  } catch (error) {
    logger.error('Error getting user XP:', error);
    res.status(500).json({ error: 'Failed to retrieve XP information' });
  }
}

/**
 * GET /api/me/xp/stats
 * Get detailed XP statistics for current user
 */
export async function getMyXPStats(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const stats = await xpService.getUserXPStats(req.user.userId);
    res.json(stats);
  } catch (error) {
    logger.error('Error getting user XP stats:', error);
    res.status(500).json({ error: 'Failed to retrieve XP statistics' });
  }
}

/**
 * POST /api/me/xp
 * Award XP to current user (internal use - called by other endpoints)
 */
export async function awardMyXP(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { actionType, metadata, amount } = req.body;

    if (!actionType) {
      res.status(400).json({ error: 'actionType is required' });
      return;
    }

    const result = await xpService.awardXP(
      req.user.userId,
      actionType,
      metadata,
      amount
    );

    res.json({
      success: true,
      xpAwarded: result.xpAwarded,
      totalXP: result.xpTotal,
      level: result.level,
      leveledUp: result.leveledUp,
      oldLevel: result.oldLevel,
      progress: xpService.getLevelProgress(result.xpTotal),
    });
  } catch (error) {
    logger.error('Error awarding XP:', error);
    res.status(500).json({ error: 'Failed to award XP' });
  }
}

/**
 * GET /api/admin/xp/leaderboard
 * Get XP leaderboard for organization (admin only)
 */
export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Require admin role
    if (req.user.role !== 'ORG_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await xpService.getXPLeaderboard(
      req.user.organizationId,
      limit
    );

    res.json(leaderboard);
  } catch (error) {
    logger.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to retrieve leaderboard' });
  }
}

/**
 * POST /api/me/xp/rewards/:rewardId/activate
 * Activate a reward (e.g., select avatar or theme)
 */
export async function activateReward(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { rewardId } = req.params;

    // Get user's reward
    const userReward = await req.prisma.userReward.findFirst({
      where: {
        userId: req.user.userId,
        rewardId,
      },
      include: {
        reward: true,
      },
    });

    if (!userReward) {
      res.status(404).json({ error: 'Reward not found or not unlocked' });
      return;
    }

    // Deactivate other rewards of same type
    await req.prisma.userReward.updateMany({
      where: {
        userId: req.user.userId,
        reward: {
          type: userReward.reward.type,
        },
      },
      data: {
        isActive: false,
      },
    });

    // Activate this reward
    const updated = await req.prisma.userReward.update({
      where: {
        id: userReward.id,
      },
      data: {
        isActive: true,
      },
      include: {
        reward: true,
      },
    });

    res.json({
      success: true,
      reward: updated,
    });
  } catch (error) {
    logger.error('Error activating reward:', error);
    res.status(500).json({ error: 'Failed to activate reward' });
  }
}

/**
 * GET /api/rewards
 * Get all available rewards
 */
export async function getAllRewards(req: Request, res: Response): Promise<void> {
  try {
    const rewards = await req.prisma.reward.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        unlockLevel: 'asc',
      },
    });

    res.json(rewards);
  } catch (error) {
    logger.error('Error getting rewards:', error);
    res.status(500).json({ error: 'Failed to retrieve rewards' });
  }
}
