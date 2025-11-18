import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import * as challengeController from '../controllers/challenge.controller';

const router = express.Router();

// ============================================================================
// GROUP-SPECIFIC CHALLENGE ROUTES
// ============================================================================

/**
 * Create a challenge for a group
 * Requires: TEACHER, ORG_ADMIN, or group leader
 */
router.post(
  '/groups/:groupId/challenges',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  challengeController.createChallenge
);

/**
 * Get all challenges for a group
 * Requires: Authentication + group membership
 */
router.get(
  '/groups/:groupId/challenges',
  authenticate,
  challengeController.getGroupChallenges
);

// ============================================================================
// CHALLENGE OPERATIONS
// ============================================================================

/**
 * Get current user's active challenges
 */
router.get(
  '/challenges/my-challenges',
  authenticate,
  challengeController.getMyActiveChallenges
);

/**
 * Get a specific challenge by ID
 */
router.get(
  '/challenges/:challengeId',
  authenticate,
  challengeController.getChallengeById
);

/**
 * Update challenge status
 * Requires: TEACHER, ORG_ADMIN, or challenge creator
 */
router.patch(
  '/challenges/:challengeId/status',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  challengeController.updateChallengeStatus
);

/**
 * Delete a challenge
 * Requires: TEACHER, ORG_ADMIN, or challenge creator
 */
router.delete(
  '/challenges/:challengeId',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  challengeController.deleteChallenge
);

// ============================================================================
// PARTICIPATION
// ============================================================================

/**
 * Join a challenge
 */
router.post(
  '/challenges/:challengeId/join',
  authenticate,
  challengeController.joinChallenge
);

/**
 * Record a contribution to a challenge
 */
router.post(
  '/challenges/:challengeId/contributions',
  authenticate,
  challengeController.recordContribution
);

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get challenge leaderboard
 */
router.get(
  '/challenges/:challengeId/leaderboard',
  authenticate,
  challengeController.getChallengeLeaderboard
);

export default router;
