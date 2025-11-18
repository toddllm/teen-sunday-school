import express from 'express';
import { authenticate, requireOrgAccess, requireRole, requireOrgAdmin } from '../middleware/auth';
import * as icebreakerController from '../controllers/icebreaker.controller';

const router = express.Router();

// Public routes (require authentication but no special permissions)
router.get(
  '/orgs/:orgId/icebreakers',
  authenticate,
  requireOrgAccess,
  icebreakerController.listIcebreakers
);

router.get(
  '/orgs/:orgId/icebreakers/random',
  authenticate,
  requireOrgAccess,
  icebreakerController.getRandomIcebreaker
);

router.get(
  '/icebreakers/:id',
  authenticate,
  icebreakerController.getIcebreaker
);

// Teacher+ routes (TEACHER, ORG_ADMIN, SUPER_ADMIN)
router.post(
  '/orgs/:orgId/icebreakers',
  authenticate,
  requireOrgAccess,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  icebreakerController.createIcebreaker
);

router.put(
  '/icebreakers/:id',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'),
  icebreakerController.updateIcebreaker
);

router.post(
  '/icebreakers/:id/duplicate',
  authenticate,
  icebreakerController.duplicateIcebreaker
);

router.post(
  '/icebreakers/:id/usage',
  authenticate,
  icebreakerController.trackUsage
);

router.post(
  '/icebreakers/:id/favorite',
  authenticate,
  icebreakerController.toggleFavorite
);

router.get(
  '/icebreakers/favorites/me',
  authenticate,
  icebreakerController.getFavorites
);

// Admin routes (ORG_ADMIN, SUPER_ADMIN)
router.delete(
  '/icebreakers/:id',
  authenticate,
  requireOrgAdmin,
  icebreakerController.deleteIcebreaker
);

export default router;
