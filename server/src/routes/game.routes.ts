import express from 'express';
import { authenticate } from '../middleware/auth';
import * as gameController from '../controllers/game.controller';

const router = express.Router();

// Character Guess Game routes
router.post(
  '/character-guess/attempts',
  gameController.submitCharacterGuessAttempt
);

router.get(
  '/character-guess/metrics',
  gameController.getCharacterGuessMetrics
);

router.get(
  '/character-guess/popular',
  gameController.getPopularCharacters
);

router.get(
  '/character-guess/history',
  authenticate,
  gameController.getUserGameHistory
);

export default router;
