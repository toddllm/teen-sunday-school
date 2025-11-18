import express from 'express';
import { authenticate, requireOrgAdmin, requireOrgAccess } from '../middleware/auth';
import * as eventController from '../controllers/seasonal-events.controller';

const router = express.Router();

// ============================================================================
// PUBLIC/USER ENDPOINTS
// ============================================================================

/**
 * Get active events for an organization
 * GET /api/orgs/:orgId/events/active
 */
router.get(
  '/orgs/:orgId/events/active',
  authenticate,
  requireOrgAccess,
  eventController.getActiveEvents
);

/**
 * Get all events for an organization (with filters)
 * GET /api/orgs/:orgId/events
 */
router.get(
  '/orgs/:orgId/events',
  authenticate,
  requireOrgAccess,
  eventController.listEvents
);

/**
 * Get a specific event by ID
 * GET /api/events/:id
 */
router.get(
  '/events/:id',
  authenticate,
  eventController.getEvent
);

/**
 * Join/participate in an event
 * POST /api/events/:id/participate
 */
router.post(
  '/events/:id/participate',
  authenticate,
  eventController.joinEvent
);

/**
 * Get user's participation in an event
 * GET /api/events/:id/participation
 */
router.get(
  '/events/:id/participation',
  authenticate,
  eventController.getParticipation
);

/**
 * Log an event activity
 * POST /api/events/:id/activity
 */
router.post(
  '/events/:id/activity',
  authenticate,
  eventController.logActivity
);

/**
 * Get event leaderboard
 * GET /api/events/:id/leaderboard
 */
router.get(
  '/events/:id/leaderboard',
  authenticate,
  eventController.getLeaderboard
);

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * Create a new seasonal event
 * POST /api/admin/orgs/:orgId/events
 */
router.post(
  '/admin/orgs/:orgId/events',
  authenticate,
  requireOrgAccess,
  requireOrgAdmin,
  eventController.createEvent
);

/**
 * Update an event
 * PUT /api/admin/events/:id
 */
router.put(
  '/admin/events/:id',
  authenticate,
  requireOrgAdmin,
  eventController.updateEvent
);

/**
 * Delete an event
 * DELETE /api/admin/events/:id
 */
router.delete(
  '/admin/events/:id',
  authenticate,
  requireOrgAdmin,
  eventController.deleteEvent
);

/**
 * Get event statistics (admin)
 * GET /api/admin/events/:id/stats
 */
router.get(
  '/admin/events/:id/stats',
  authenticate,
  requireOrgAdmin,
  eventController.getEventStats
);

/**
 * Get all participants for an event (admin)
 * GET /api/admin/events/:id/participants
 */
router.get(
  '/admin/events/:id/participants',
  authenticate,
  requireOrgAdmin,
  eventController.getParticipants
);

export default router;
