import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import * as quizController from '../controllers/quiz.controller';

const router = express.Router();

// Create a quiz for a lesson (Teachers and admins only)
router.post(
  '/lessons/:lessonId/quizzes',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  quizController.createQuiz
);

// Update a quiz (Teachers and admins only)
router.put(
  '/lessons/:lessonId/quizzes/:quizId',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  quizController.updateQuiz
);

// Delete a quiz (Teachers and admins only)
router.delete(
  '/lessons/:lessonId/quizzes/:quizId',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  quizController.deleteQuiz
);

// Get quiz for a lesson (All authenticated users)
router.get(
  '/lessons/:lessonId/quizzes',
  authenticate,
  quizController.getQuizzesForLesson
);

// Get a specific quiz by ID (All authenticated users)
router.get(
  '/quizzes/:quizId',
  authenticate,
  quizController.getQuizById
);

// Submit quiz attempt (All authenticated users - MEMBERS/students)
router.post(
  '/quizzes/:quizId/attempts',
  authenticate,
  quizController.submitQuizAttempt
);

// Get quiz results for current user
router.get(
  '/quizzes/:quizId/attempts/me',
  authenticate,
  quizController.getMyQuizAttempts
);

// Get quiz analytics (Teachers and admins only)
router.get(
  '/quizzes/:quizId/analytics',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  quizController.getQuizAnalytics
);

// Get all attempts for a quiz (Teachers and admins only)
router.get(
  '/quizzes/:quizId/attempts',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  quizController.getAllQuizAttempts
);

export default router;
