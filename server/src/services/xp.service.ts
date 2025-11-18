import prisma from '../config/database';
import logger from '../config/logger';

// XP amounts for each action type
export const XP_AMOUNTS = {
  CHAPTER_READ: 10,
  READING_PLAN_DAY: 15,
  LESSON_COMPLETED: 20,
  QUIZ_CORRECT: 5,
  PRAYER_LOGGED: 10,
  VERSE_MEMORIZED: 25,
  JOURNAL_ENTRY: 10,
  DAILY_LOGIN: 5,
  STREAK_BONUS: 0, // Variable, calculated separately
};

/**
 * Calculate the total XP required to reach a specific level
 * Formula: XP = 100 * (level ^ 1.5)
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculate the current level based on total XP
 */
export function getLevelFromXP(totalXP: number): number {
  let level = 1;

  while (getXPForLevel(level + 1) <= totalXP) {
    level++;
  }

  return level;
}

/**
 * Get XP progress for current level
 * Returns: { level, currentXP, xpForCurrentLevel, xpForNextLevel, xpNeeded, progress }
 */
export function getLevelProgress(totalXP: number) {
  const level = getLevelFromXP(totalXP);
  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevel = getXPForLevel(level + 1);
  const currentXP = totalXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progress = (currentXP / xpNeeded) * 100;

  return {
    level,
    totalXP,
    currentXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpNeeded,
    progress: Math.min(100, Math.max(0, progress)),
  };
}

/**
 * Calculate streak bonus XP
 * Every 7 days of streak = bonus XP
 */
export function calculateStreakBonus(currentStreak: number): number {
  if (currentStreak < 7) return 0;

  const weeks = Math.floor(currentStreak / 7);
  return weeks * 10; // 10 XP per week of streak
}

/**
 * Get or create UserXP record for a user
 */
export async function getUserXP(userId: string) {
  let userXP = await prisma.userXP.findUnique({
    where: { userId },
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      rewards: {
        include: {
          reward: true,
        },
      },
    },
  });

  // Create if doesn't exist
  if (!userXP) {
    userXP = await prisma.userXP.create({
      data: {
        userId,
        xpTotal: 0,
        level: 1,
      },
      include: {
        events: true,
        rewards: {
          include: {
            reward: true,
          },
        },
      },
    });
  }

  return userXP;
}

/**
 * Award XP to a user
 */
export async function awardXP(
  userId: string,
  actionType: string,
  metadata?: any,
  customAmount?: number
) {
  try {
    // Get or create user XP record
    let userXP = await getUserXP(userId);

    // Calculate XP amount
    const xpAmount = customAmount || XP_AMOUNTS[actionType as keyof typeof XP_AMOUNTS] || 0;

    if (xpAmount === 0) {
      logger.warn(`No XP amount defined for action type: ${actionType}`);
      return userXP;
    }

    // Calculate old and new level
    const oldLevel = userXP.level;
    const newTotalXP = userXP.xpTotal + xpAmount;
    const newLevel = getLevelFromXP(newTotalXP);
    const leveledUp = newLevel > oldLevel;

    // Update UserXP and create XPEvent in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create XP event
      await tx.xPEvent.create({
        data: {
          userId,
          userXPId: userXP!.id,
          actionType: actionType as any,
          amount: xpAmount,
          description: metadata?.description || `Earned ${xpAmount} XP for ${actionType}`,
          metadata: metadata || {},
        },
      });

      // Update user XP
      const updatedUserXP = await tx.userXP.update({
        where: { id: userXP!.id },
        data: {
          xpTotal: newTotalXP,
          level: newLevel,
        },
        include: {
          events: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          rewards: {
            include: {
              reward: true,
            },
          },
        },
      });

      // If leveled up, unlock new rewards
      if (leveledUp) {
        await unlockRewardsForLevel(tx, userId, userXP!.id, newLevel);
      }

      return updatedUserXP;
    });

    logger.info(`Awarded ${xpAmount} XP to user ${userId} for ${actionType}. Total XP: ${newTotalXP}, Level: ${newLevel}`);

    return {
      ...result,
      leveledUp,
      oldLevel,
      xpAwarded: xpAmount,
    };
  } catch (error) {
    logger.error('Error awarding XP:', error);
    throw error;
  }
}

/**
 * Unlock rewards for a user when they reach a new level
 */
async function unlockRewardsForLevel(tx: any, userId: string, userXPId: string, level: number) {
  // Find all rewards that should be unlocked at this level
  const rewardsToUnlock = await tx.reward.findMany({
    where: {
      unlockLevel: {
        lte: level,
      },
      isActive: true,
    },
  });

  // Check which rewards user doesn't have yet
  const existingRewards = await tx.userReward.findMany({
    where: { userId },
    select: { rewardId: true },
  });

  const existingRewardIds = new Set(existingRewards.map((r: any) => r.rewardId));

  // Unlock new rewards
  const newRewards = rewardsToUnlock.filter((r) => !existingRewardIds.has(r.id));

  if (newRewards.length > 0) {
    await tx.userReward.createMany({
      data: newRewards.map((reward) => ({
        userId,
        userXPId,
        rewardId: reward.id,
      })),
    });

    logger.info(`Unlocked ${newRewards.length} new rewards for user ${userId} at level ${level}`);
  }
}

/**
 * Get XP leaderboard (for admin/metrics only, not public)
 */
export async function getXPLeaderboard(organizationId: string, limit: number = 10) {
  const leaderboard = await prisma.userXP.findMany({
    where: {
      user: {
        organizationId,
        isActive: true,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      xpTotal: 'desc',
    },
    take: limit,
  });

  return leaderboard.map((entry, index) => ({
    rank: index + 1,
    userId: entry.user.id,
    name: `${entry.user.firstName} ${entry.user.lastName}`,
    xpTotal: entry.xpTotal,
    level: entry.level,
  }));
}

/**
 * Get XP statistics for a user
 */
export async function getUserXPStats(userId: string) {
  const userXP = await getUserXP(userId);
  const progress = getLevelProgress(userXP.xpTotal);

  // Get XP events from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentEvents = await prisma.xPEvent.findMany({
    where: {
      userId,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate XP by action type
  const xpByAction: Record<string, number> = {};
  recentEvents.forEach((event) => {
    if (!xpByAction[event.actionType]) {
      xpByAction[event.actionType] = 0;
    }
    xpByAction[event.actionType] += event.amount;
  });

  // Calculate daily XP (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const weeklyEvents = recentEvents.filter(
    (event) => event.createdAt >= sevenDaysAgo
  );

  const dailyXP: Record<string, number> = {};
  weeklyEvents.forEach((event) => {
    const dateKey = event.createdAt.toISOString().split('T')[0];
    if (!dailyXP[dateKey]) {
      dailyXP[dateKey] = 0;
    }
    dailyXP[dateKey] += event.amount;
  });

  return {
    ...progress,
    xpLast30Days: recentEvents.reduce((sum, event) => sum + event.amount, 0),
    xpLast7Days: weeklyEvents.reduce((sum, event) => sum + event.amount, 0),
    xpByAction,
    dailyXP,
    totalEvents: recentEvents.length,
    unlockedRewards: userXP.rewards.filter((r) => r.isActive).length,
  };
}
