import express from 'express';
import { authenticate, requireOrgAdmin } from '../middleware/auth';
import * as xpController from '../controllers/xp.controller';

const router = express.Router();

// User XP endpoints
router.get('/me/xp', authenticate, xpController.getMyXP);
router.get('/me/xp/stats', authenticate, xpController.getMyXPStats);
router.post('/me/xp', authenticate, xpController.awardMyXP);
router.post('/me/xp/rewards/:rewardId/activate', authenticate, xpController.activateReward);

// Admin endpoints
router.get('/admin/xp/leaderboard', authenticate, requireOrgAdmin, xpController.getLeaderboard);

// Public rewards list
router.get('/rewards', xpController.getAllRewards);

export default router;
