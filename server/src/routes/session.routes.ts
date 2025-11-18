import { Router } from 'express';
import * as sessionController from '../controllers/session.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// ============================================================================
// SESSION MANAGEMENT ROUTES
// ============================================================================

/**
 * Create a new session
 * Requires authentication (teacher/admin)
 */
router.post('/sessions/create', authenticate, sessionController.createSession);

/**
 * Get session by code (public - for students joining)
 */
router.get('/sessions/code/:code', sessionController.getSessionByCode);

/**
 * Join session by code (public - for students)
 */
router.post('/sessions/code/:code/join', sessionController.joinSession);

/**
 * Get session by ID
 * Requires authentication
 */
router.get('/sessions/:id', authenticate, sessionController.getSession);

/**
 * Get current session state
 * Public - for polling if WebSocket not available
 */
router.get('/sessions/:id/state', sessionController.getSessionState);

/**
 * End a session
 * Requires authentication (must be session owner)
 */
router.post('/sessions/:id/end', authenticate, sessionController.endSession);

/**
 * Get session statistics
 * Requires authentication
 */
router.get('/sessions/:id/stats', authenticate, sessionController.getSessionStats);

/**
 * Get participant notes for a session
 * Requires authentication
 */
router.get('/sessions/:id/notes/:participantId', authenticate, sessionController.getParticipantNotes);

/**
 * Get all active sessions for the organization
 * Requires authentication
 */
router.get('/sessions/active', authenticate, sessionController.getActiveSessions);

/**
 * Get session history for current user
 * Requires authentication
 */
router.get('/sessions/my-sessions', authenticate, sessionController.getMySessionHistory);

export default router;
