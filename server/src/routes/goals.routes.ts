import express from 'express';
import {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  logProgress,
  getProgress,
  getStats,
} from '../controllers/goals.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Personal Spiritual Goals Routes
 *
 * All routes require authentication and are scoped to the authenticated user.
 * Users can only view and manage their own goals.
 */

// Get user's goal statistics
router.get('/stats', authenticate, getStats);

// List all user's goals
router.get('/', authenticate, listGoals);

// Get a specific goal with progress history
router.get('/:id', authenticate, getGoal);

// Create a new goal
router.post('/', authenticate, createGoal);

// Update an existing goal
router.patch('/:id', authenticate, updateGoal);

// Delete a goal
router.delete('/:id', authenticate, deleteGoal);

// Log progress update for a goal
router.post('/:id/progress', authenticate, logProgress);

// Get progress history for a goal
router.get('/:id/progress', authenticate, getProgress);

export default router;
