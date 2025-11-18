import {
  GroupChallenge,
  ChallengeType,
  ChallengeStatus,
  ChallengeParticipant,
  ChallengeContribution
} from '@prisma/client';
import prisma from '../config/database';
import logger from '../config/logger';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CreateChallengeInput {
  groupId: string;
  name: string;
  description?: string;
  type: ChallengeType;
  targetValue: number;
  startDate: Date;
  endDate: Date;
  createdBy: string;
  badgeId?: string;
  celebrationMessage?: string;
  showIndividualProgress?: boolean;
  allowLateJoins?: boolean;
}

export interface RecordContributionInput {
  challengeId: string;
  userId: string;
  amount?: number;
  sourceActivityType: string;
  sourceActivityId?: string;
  sourceMetadata?: any;
}

export interface ChallengeWithDetails extends GroupChallenge {
  group: {
    id: string;
    name: string;
    description: string | null;
  };
  participants: ChallengeParticipant[];
  metrics: {
    totalProgress: number;
    progressPercentage: number;
    participantCount: number;
    activeParticipants: number;
    topContributors?: any;
    averageContributionsPerDay?: number;
    estimatedCompletionDate?: Date;
  } | null;
  _count?: {
    participants: number;
    contributions: number;
  };
}

export interface LeaderboardEntry {
  userId: string;
  firstName: string;
  lastName: string;
  totalContributions: number;
  lastContributionAt: Date | null;
  rank: number;
}

// ============================================================================
// CHALLENGE SERVICE
// ============================================================================

export class ChallengeService {
  /**
   * Create a new group challenge
   */
  async createChallenge(input: CreateChallengeInput): Promise<ChallengeWithDetails> {
    try {
      logger.info(`Creating challenge for group ${input.groupId}`);

      // Validate dates
      if (new Date(input.startDate) >= new Date(input.endDate)) {
        throw new Error('End date must be after start date');
      }

      if (input.targetValue <= 0) {
        throw new Error('Target value must be greater than 0');
      }

      // Verify group exists and creator has access
      const group = await prisma.group.findUnique({
        where: { id: input.groupId },
        include: {
          members: {
            where: { userId: input.createdBy }
          }
        }
      });

      if (!group) {
        throw new Error('Group not found');
      }

      if (group.members.length === 0) {
        throw new Error('User is not a member of this group');
      }

      // Create challenge
      const challenge = await prisma.groupChallenge.create({
        data: {
          groupId: input.groupId,
          name: input.name,
          description: input.description,
          type: input.type,
          targetValue: input.targetValue,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          createdBy: input.createdBy,
          badgeId: input.badgeId,
          celebrationMessage: input.celebrationMessage,
          showIndividualProgress: input.showIndividualProgress ?? true,
          allowLateJoins: input.allowLateJoins ?? true,
          status: new Date(input.startDate) > new Date() ? 'DRAFT' : 'ACTIVE',
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              description: true,
            }
          },
          participants: true,
          metrics: true,
        }
      });

      // Initialize metrics
      await this.initializeMetrics(challenge.id);

      // Auto-enroll all group members if challenge starts now
      if (challenge.status === 'ACTIVE') {
        await this.autoEnrollGroupMembers(challenge.id, input.groupId);
      }

      logger.info(`Challenge ${challenge.id} created successfully`);

      return this.getChallengeById(challenge.id);
    } catch (error: any) {
      logger.error('Error creating challenge:', error);
      throw error;
    }
  }

  /**
   * Get a challenge by ID with full details
   */
  async getChallengeById(challengeId: string): Promise<ChallengeWithDetails> {
    const challenge = await prisma.groupChallenge.findUnique({
      where: { id: challengeId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        metrics: true,
        _count: {
          select: {
            participants: true,
            contributions: true,
          }
        }
      }
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    return challenge as any;
  }

  /**
   * Get all challenges for a group
   */
  async getChallengesForGroup(
    groupId: string,
    status?: ChallengeStatus
  ): Promise<ChallengeWithDetails[]> {
    const where: any = { groupId };

    if (status) {
      where.status = status;
    }

    const challenges = await prisma.groupChallenge.findMany({
      where,
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        participants: true,
        metrics: true,
        _count: {
          select: {
            participants: true,
            contributions: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return challenges as any;
  }

  /**
   * Get active challenges for a user (across all their groups)
   */
  async getActiveChallengesForUser(userId: string): Promise<ChallengeWithDetails[]> {
    // Get all groups the user is a member of
    const userGroups = await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true }
    });

    const groupIds = userGroups.map(g => g.groupId);

    const challenges = await prisma.groupChallenge.findMany({
      where: {
        groupId: { in: groupIds },
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        participants: {
          where: { userId }
        },
        metrics: true,
        _count: {
          select: {
            participants: true,
            contributions: true,
          }
        }
      },
      orderBy: {
        endDate: 'asc'
      }
    });

    return challenges as any;
  }

  /**
   * Join a challenge (auto or manual)
   */
  async joinChallenge(challengeId: string, userId: string): Promise<ChallengeParticipant> {
    try {
      logger.info(`User ${userId} joining challenge ${challengeId}`);

      const challenge = await prisma.groupChallenge.findUnique({
        where: { id: challengeId }
      });

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      if (challenge.status !== 'ACTIVE' && challenge.status !== 'DRAFT') {
        throw new Error('Challenge is not accepting new participants');
      }

      if (!challenge.allowLateJoins && new Date() > challenge.startDate) {
        throw new Error('Late joins are not allowed for this challenge');
      }

      // Verify user is a member of the group
      const membership = await prisma.groupMember.findFirst({
        where: {
          groupId: challenge.groupId,
          userId: userId
        }
      });

      if (!membership) {
        throw new Error('User is not a member of this group');
      }

      // Check if already joined
      const existing = await prisma.challengeParticipant.findUnique({
        where: {
          challengeId_userId: {
            challengeId,
            userId
          }
        }
      });

      if (existing) {
        return existing;
      }

      // Join challenge
      const participant = await prisma.challengeParticipant.create({
        data: {
          challengeId,
          userId,
          joinedAt: new Date(),
        }
      });

      // Update metrics
      await this.updateMetrics(challengeId);

      logger.info(`User ${userId} joined challenge ${challengeId}`);

      return participant;
    } catch (error: any) {
      logger.error('Error joining challenge:', error);
      throw error;
    }
  }

  /**
   * Record a contribution to a challenge
   */
  async recordContribution(input: RecordContributionInput): Promise<ChallengeContribution> {
    try {
      const { challengeId, userId, sourceActivityType, sourceActivityId, sourceMetadata } = input;
      const amount = input.amount ?? 1;

      logger.info(`Recording contribution for user ${userId} to challenge ${challengeId}`);

      // Verify challenge is active
      const challenge = await prisma.groupChallenge.findUnique({
        where: { id: challengeId }
      });

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      if (challenge.status !== 'ACTIVE') {
        logger.warn(`Challenge ${challengeId} is not active, skipping contribution`);
        throw new Error('Challenge is not active');
      }

      // Verify user is a participant
      let participant = await prisma.challengeParticipant.findUnique({
        where: {
          challengeId_userId: {
            challengeId,
            userId
          }
        }
      });

      // Auto-join if allowed
      if (!participant && challenge.allowLateJoins) {
        participant = await this.joinChallenge(challengeId, userId);
      } else if (!participant) {
        throw new Error('User is not a participant in this challenge');
      }

      // Record contribution
      const contribution = await prisma.challengeContribution.create({
        data: {
          challengeId,
          userId,
          amount,
          sourceActivityType,
          sourceActivityId,
          sourceMetadata,
        }
      });

      // Update participant stats
      await prisma.challengeParticipant.update({
        where: { id: participant.id },
        data: {
          totalContributions: { increment: amount },
          lastContributionAt: new Date(),
        }
      });

      // Update metrics
      await this.updateMetrics(challengeId);

      // Check if challenge is completed
      await this.checkChallengeCompletion(challengeId);

      logger.info(`Contribution recorded for challenge ${challengeId}`);

      return contribution;
    } catch (error: any) {
      logger.error('Error recording contribution:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard for a challenge
   */
  async getLeaderboard(challengeId: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    const participants = await prisma.challengeParticipant.findMany({
      where: {
        challengeId,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        totalContributions: 'desc'
      },
      take: limit
    });

    return participants.map((p, index) => ({
      userId: p.userId,
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      totalContributions: p.totalContributions,
      lastContributionAt: p.lastContributionAt,
      rank: index + 1
    }));
  }

  /**
   * Update challenge status (e.g., activate draft, cancel, etc.)
   */
  async updateChallengeStatus(
    challengeId: string,
    status: ChallengeStatus
  ): Promise<GroupChallenge> {
    const challenge = await prisma.groupChallenge.update({
      where: { id: challengeId },
      data: { status }
    });

    // If activating, auto-enroll group members
    if (status === 'ACTIVE') {
      await this.autoEnrollGroupMembers(challengeId, challenge.groupId);
    }

    return challenge;
  }

  /**
   * Delete a challenge (only if no contributions)
   */
  async deleteChallenge(challengeId: string): Promise<void> {
    const contributionCount = await prisma.challengeContribution.count({
      where: { challengeId }
    });

    if (contributionCount > 0) {
      throw new Error('Cannot delete challenge with existing contributions');
    }

    await prisma.groupChallenge.delete({
      where: { id: challengeId }
    });

    logger.info(`Challenge ${challengeId} deleted`);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Initialize metrics for a new challenge
   */
  private async initializeMetrics(challengeId: string): Promise<void> {
    await prisma.challengeMetric.create({
      data: {
        challengeId,
        totalProgress: 0,
        progressPercentage: 0,
        participantCount: 0,
        activeParticipants: 0,
      }
    });
  }

  /**
   * Auto-enroll all group members in a challenge
   */
  private async autoEnrollGroupMembers(challengeId: string, groupId: string): Promise<void> {
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true }
    });

    for (const member of members) {
      try {
        await this.joinChallenge(challengeId, member.userId);
      } catch (error) {
        logger.warn(`Failed to auto-enroll user ${member.userId}:`, error);
      }
    }
  }

  /**
   * Update challenge metrics (progress, percentages, etc.)
   */
  private async updateMetrics(challengeId: string): Promise<void> {
    const challenge = await prisma.groupChallenge.findUnique({
      where: { id: challengeId },
      include: {
        participants: true,
        contributions: true,
      }
    });

    if (!challenge) {
      return;
    }

    // Calculate total progress
    const totalProgress = challenge.contributions.reduce(
      (sum, c) => sum + c.amount,
      0
    );

    const progressPercentage = Math.min(
      (totalProgress / challenge.targetValue) * 100,
      100
    );

    // Count active participants (those with contributions)
    const activeParticipants = challenge.participants.filter(
      p => p.totalContributions > 0
    ).length;

    // Get top contributors
    const topContributors = challenge.participants
      .filter(p => p.totalContributions > 0)
      .sort((a, b) => b.totalContributions - a.totalContributions)
      .slice(0, 5)
      .map(p => ({
        userId: p.userId,
        contributions: p.totalContributions
      }));

    // Calculate average contributions per day
    const daysSinceStart = Math.max(
      1,
      Math.floor((Date.now() - challenge.startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const averageContributionsPerDay = totalProgress / daysSinceStart;

    // Estimate completion date
    let estimatedCompletionDate: Date | null = null;
    if (averageContributionsPerDay > 0 && totalProgress < challenge.targetValue) {
      const remainingProgress = challenge.targetValue - totalProgress;
      const daysToComplete = remainingProgress / averageContributionsPerDay;
      estimatedCompletionDate = new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000);
    }

    // Update metrics
    await prisma.challengeMetric.upsert({
      where: { challengeId },
      create: {
        challengeId,
        totalProgress,
        progressPercentage,
        participantCount: challenge.participants.length,
        activeParticipants,
        topContributors,
        averageContributionsPerDay,
        estimatedCompletionDate,
      },
      update: {
        totalProgress,
        progressPercentage,
        participantCount: challenge.participants.length,
        activeParticipants,
        topContributors,
        averageContributionsPerDay,
        estimatedCompletionDate,
      }
    });
  }

  /**
   * Check if a challenge has reached its goal
   */
  private async checkChallengeCompletion(challengeId: string): Promise<void> {
    const metrics = await prisma.challengeMetric.findUnique({
      where: { challengeId }
    });

    if (!metrics) {
      return;
    }

    const challenge = await prisma.groupChallenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge) {
      return;
    }

    // Check if goal reached
    if (
      metrics.totalProgress >= challenge.targetValue &&
      challenge.status === 'ACTIVE'
    ) {
      await prisma.groupChallenge.update({
        where: { id: challengeId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        }
      });

      logger.info(`Challenge ${challengeId} completed!`);

      // TODO: Trigger celebration notification/badge award
    }
  }

  /**
   * Expire challenges that have passed their end date
   * (Called by background job)
   */
  async expireOldChallenges(): Promise<number> {
    const result = await prisma.groupChallenge.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: { lt: new Date() }
      },
      data: {
        status: 'EXPIRED'
      }
    });

    logger.info(`Expired ${result.count} challenges`);
    return result.count;
  }

  /**
   * Activate draft challenges whose start date has arrived
   * (Called by background job)
   */
  async activateDraftChallenges(): Promise<number> {
    const draftChallenges = await prisma.groupChallenge.findMany({
      where: {
        status: 'DRAFT',
        startDate: { lte: new Date() }
      }
    });

    for (const challenge of draftChallenges) {
      await this.updateChallengeStatus(challenge.id, 'ACTIVE');
    }

    logger.info(`Activated ${draftChallenges.length} draft challenges`);
    return draftChallenges.length;
  }
}

export default ChallengeService;
