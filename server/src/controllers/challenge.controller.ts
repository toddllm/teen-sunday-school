import { Request, Response } from 'express';
import logger from '../config/logger';
import { ChallengeService } from '../services/challenge.service';
import { ChallengeType, ChallengeStatus } from '@prisma/client';

const challengeService = new ChallengeService();

// ============================================================================
// CHALLENGE CRUD OPERATIONS
// ============================================================================

/**
 * Create a new group challenge
 * POST /api/groups/:groupId/challenges
 */
export async function createChallenge(req: Request, res: Response): Promise<void> {
  try {
    const { groupId } = req.params;
    const {
      name,
      description,
      type,
      targetValue,
      startDate,
      endDate,
      badgeId,
      celebrationMessage,
      showIndividualProgress,
      allowLateJoins,
    } = req.body;

    // Validate required fields
    if (!name || !type || !targetValue || !startDate || !endDate) {
      res.status(400).json({
        error: 'Missing required fields: name, type, targetValue, startDate, endDate'
      });
      return;
    }

    // Validate challenge type
    if (!Object.values(ChallengeType).includes(type)) {
      res.status(400).json({
        error: `Invalid challenge type. Must be one of: ${Object.values(ChallengeType).join(', ')}`
      });
      return;
    }

    const challenge = await challengeService.createChallenge({
      groupId,
      name,
      description,
      type,
      targetValue: parseInt(targetValue),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy: req.user!.userId,
      badgeId,
      celebrationMessage,
      showIndividualProgress,
      allowLateJoins,
    });

    res.status(201).json(challenge);
  } catch (error: any) {
    logger.error('Error creating challenge:', error);
    res.status(500).json({ error: error.message || 'Failed to create challenge' });
  }
}

/**
 * Get all challenges for a group
 * GET /api/groups/:groupId/challenges
 */
export async function getGroupChallenges(req: Request, res: Response): Promise<void> {
  try {
    const { groupId } = req.params;
    const { status } = req.query;

    let statusFilter: ChallengeStatus | undefined;
    if (status && Object.values(ChallengeStatus).includes(status as ChallengeStatus)) {
      statusFilter = status as ChallengeStatus;
    }

    const challenges = await challengeService.getChallengesForGroup(groupId, statusFilter);

    res.status(200).json(challenges);
  } catch (error: any) {
    logger.error('Error fetching group challenges:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch challenges' });
  }
}

/**
 * Get a single challenge by ID
 * GET /api/challenges/:challengeId
 */
export async function getChallengeById(req: Request, res: Response): Promise<void> {
  try {
    const { challengeId } = req.params;

    const challenge = await challengeService.getChallengeById(challengeId);

    res.status(200).json(challenge);
  } catch (error: any) {
    logger.error('Error fetching challenge:', error);
    res.status(404).json({ error: error.message || 'Challenge not found' });
  }
}

/**
 * Get all active challenges for the current user
 * GET /api/challenges/my-challenges
 */
export async function getMyActiveChallenges(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    const challenges = await challengeService.getActiveChallengesForUser(userId);

    res.status(200).json(challenges);
  } catch (error: any) {
    logger.error('Error fetching user challenges:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch challenges' });
  }
}

/**
 * Update challenge status
 * PATCH /api/challenges/:challengeId/status
 */
export async function updateChallengeStatus(req: Request, res: Response): Promise<void> {
  try {
    const { challengeId } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(ChallengeStatus).includes(status)) {
      res.status(400).json({
        error: `Invalid status. Must be one of: ${Object.values(ChallengeStatus).join(', ')}`
      });
      return;
    }

    const challenge = await challengeService.updateChallengeStatus(challengeId, status);

    res.status(200).json(challenge);
  } catch (error: any) {
    logger.error('Error updating challenge status:', error);
    res.status(500).json({ error: error.message || 'Failed to update challenge' });
  }
}

/**
 * Delete a challenge
 * DELETE /api/challenges/:challengeId
 */
export async function deleteChallenge(req: Request, res: Response): Promise<void> {
  try {
    const { challengeId } = req.params;

    await challengeService.deleteChallenge(challengeId);

    res.status(204).send();
  } catch (error: any) {
    logger.error('Error deleting challenge:', error);
    res.status(500).json({ error: error.message || 'Failed to delete challenge' });
  }
}

// ============================================================================
// PARTICIPATION
// ============================================================================

/**
 * Join a challenge
 * POST /api/challenges/:challengeId/join
 */
export async function joinChallenge(req: Request, res: Response): Promise<void> {
  try {
    const { challengeId } = req.params;
    const userId = req.user!.userId;

    const participant = await challengeService.joinChallenge(challengeId, userId);

    res.status(201).json(participant);
  } catch (error: any) {
    logger.error('Error joining challenge:', error);
    res.status(500).json({ error: error.message || 'Failed to join challenge' });
  }
}

/**
 * Record a contribution to a challenge
 * POST /api/challenges/:challengeId/contributions
 */
export async function recordContribution(req: Request, res: Response): Promise<void> {
  try {
    const { challengeId } = req.params;
    const userId = req.user!.userId;
    const { amount, sourceActivityType, sourceActivityId, sourceMetadata } = req.body;

    if (!sourceActivityType) {
      res.status(400).json({ error: 'sourceActivityType is required' });
      return;
    }

    const contribution = await challengeService.recordContribution({
      challengeId,
      userId,
      amount,
      sourceActivityType,
      sourceActivityId,
      sourceMetadata,
    });

    res.status(201).json(contribution);
  } catch (error: any) {
    logger.error('Error recording contribution:', error);
    res.status(500).json({ error: error.message || 'Failed to record contribution' });
  }
}

// ============================================================================
// STATISTICS & LEADERBOARDS
// ============================================================================

/**
 * Get challenge leaderboard
 * GET /api/challenges/:challengeId/leaderboard
 */
export async function getChallengeLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const { challengeId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const leaderboard = await challengeService.getLeaderboard(challengeId, limit);

    res.status(200).json(leaderboard);
  } catch (error: any) {
    logger.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch leaderboard' });
  }
}
