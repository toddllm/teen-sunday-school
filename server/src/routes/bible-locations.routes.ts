import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import * as bibleLocationsController from '../controllers/bible-locations.controller';
import { Role } from '@prisma/client';

const router = express.Router();

// Public routes - no authentication required (as per spec: "Public read")
router.get(
  '/locations',
  bibleLocationsController.getAllLocations
);

router.get(
  '/locations/:id',
  bibleLocationsController.getLocationById
);

router.get(
  '/locations/region/:region',
  bibleLocationsController.getLocationsByRegion
);

router.get(
  '/lessons/:lessonId/locations',
  bibleLocationsController.getLocationsByLessonId
);

// Track map interactions (public - can be anonymous)
router.post(
  '/track',
  bibleLocationsController.trackMapAction
);

// Protected routes - require TEACHER or ORG_ADMIN role
router.post(
  '/locations',
  authenticate,
  requireRole(Role.TEACHER, Role.ORG_ADMIN, Role.SUPER_ADMIN),
  bibleLocationsController.createLocation
);

router.put(
  '/locations/:id',
  authenticate,
  requireRole(Role.TEACHER, Role.ORG_ADMIN, Role.SUPER_ADMIN),
  bibleLocationsController.updateLocation
);

router.delete(
  '/locations/:id',
  authenticate,
  requireRole(Role.ORG_ADMIN, Role.SUPER_ADMIN),
  bibleLocationsController.deleteLocation
);

// Lesson-location linking (requires TEACHER or ORG_ADMIN)
router.post(
  '/lessons/:lessonId/locations/:locationId',
  authenticate,
  requireRole(Role.TEACHER, Role.ORG_ADMIN, Role.SUPER_ADMIN),
  bibleLocationsController.linkLocationToLesson
);

router.delete(
  '/lessons/:lessonId/locations/:locationId',
  authenticate,
  requireRole(Role.TEACHER, Role.ORG_ADMIN, Role.SUPER_ADMIN),
  bibleLocationsController.unlinkLocationFromLesson
);

// Metrics - requires ORG_ADMIN
router.get(
  '/metrics',
  authenticate,
  requireRole(Role.ORG_ADMIN, Role.SUPER_ADMIN),
  bibleLocationsController.getMapMetrics
);

export default router;
