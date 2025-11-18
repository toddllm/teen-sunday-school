import express from 'express';
import { authenticate } from '../middleware/auth';
import * as gameController from '../controllers/find-reference-game.controller';

const router = express.Router();

/**
 * GET /api/games/find-reference
 * Get random questions for the game
 * Query params: scope, difficulty, limit
 */
router.get('/', gameController.getQuestions);

/**
 * POST /api/games/find-reference/attempts
 * Submit a user's answer attempt
 */
router.post('/attempts', gameController.submitAttempt);

/**
 * GET /api/games/find-reference/stats
 * Get game statistics for the current user/session
 * Query params: sessionId, gameMode
 */
router.get('/stats', gameController.getStats);

/**
 * GET /api/games/find-reference/books
 * Get list of available books for filtering
 */
router.get('/books', gameController.getAvailableBooks);

export default router;
