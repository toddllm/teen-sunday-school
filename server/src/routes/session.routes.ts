import express from 'express';
import { authenticate } from '../middleware/auth';
import * as sessionController from '../controllers/session.controller';

const router = express.Router();

// Start a new live teaching session
router.post('/', authenticate, sessionController.startSession);

// Get session by ID
router.get('/:id', sessionController.getSession);

// Get session by session code (for students to join)
router.get('/code/:code', sessionController.getSessionByCode);

// Advance session to next/previous slide
router.patch('/:id/advance', authenticate, sessionController.advanceSession);

// End a live teaching session
router.patch('/:id/end', authenticate, sessionController.endSession);

// Get session metrics
router.get('/analytics/metrics', authenticate, sessionController.getSessionMetrics);

// Get active sessions
router.get('/active/list', authenticate, sessionController.getActiveSessions);

export default router;
