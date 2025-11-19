import express from 'express';
import {
  generateSermonIllustrations,
  getTypeSuggestions,
  saveToLesson,
  getIllustrationHistory,
} from '../controllers/sermon-illustration.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = express.Router();

/**
 * Sermon Illustration Routes
 * All routes require authentication and TEACHER role or higher
 */

// Generate sermon illustrations
router.post(
  '/generate',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  generateSermonIllustrations
);

// Get illustration type suggestions
router.post(
  '/suggestions',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  getTypeSuggestions
);

// Save illustration to a lesson
router.post(
  '/save-to-lesson',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  saveToLesson
);

// Get illustration history
router.get(
  '/history',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  getIllustrationHistory
);

export default router;
