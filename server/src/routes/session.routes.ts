import express from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import * as sessionController from '../controllers/session.controller';

const router = express.Router();

// Create a new session (requires authentication and leader role)
router.post('/sessions', authenticate, sessionController.createSession);

// Join a session via code (optional authentication - works for both guests and members)
router.post('/sessions/join/:code', optionalAuthenticate, sessionController.joinSession);

// Get session details (requires authentication)
router.get('/sessions/:id', authenticate, sessionController.getSession);

// Get sessions for a group (requires authentication)
router.get('/groups/:groupId/sessions', authenticate, sessionController.getGroupSessions);

// End a session (requires authentication and leader role)
router.put('/sessions/:id/end', authenticate, sessionController.endSession);

// Update guest heartbeat (no authentication required - uses tempId)
router.put('/sessions/guests/:tempId/heartbeat', sessionController.updateGuestHeartbeat);

export default router;
