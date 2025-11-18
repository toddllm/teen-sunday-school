import express from 'express';
import { authenticate, requireOrgAdmin, requireOrgAccess } from '../middleware/auth';
import * as integrationController from '../controllers/integration.controller';

const router = express.Router();

// OAuth routes (public)
router.get(
  '/planning-center/auth',
  integrationController.planningCenterAuth
);

router.get(
  '/planning-center/callback',
  integrationController.planningCenterCallback
);

// Integration management (requires auth + org admin)
router.get(
  '/orgs/:orgId/integrations',
  authenticate,
  requireOrgAccess,
  integrationController.listIntegrations
);

router.get(
  '/integrations/:id',
  authenticate,
  integrationController.getIntegration
);

router.put(
  '/integrations/:id',
  authenticate,
  requireOrgAdmin,
  integrationController.updateIntegration
);

router.delete(
  '/integrations/:id',
  authenticate,
  requireOrgAdmin,
  integrationController.deleteIntegration
);

// Sync operations
router.post(
  '/integrations/:id/sync',
  authenticate,
  requireOrgAdmin,
  integrationController.triggerSync
);

router.get(
  '/integrations/:id/sync/status',
  authenticate,
  integrationController.getSyncStatus
);

router.get(
  '/integrations/:id/sync/logs',
  authenticate,
  integrationController.getSyncLogs
);

// Group mappings
router.get(
  '/integrations/:id/groups',
  authenticate,
  integrationController.listExternalGroups
);

router.post(
  '/integrations/:id/mappings',
  authenticate,
  requireOrgAdmin,
  integrationController.createGroupMapping
);

router.put(
  '/integrations/mappings/:mappingId',
  authenticate,
  requireOrgAdmin,
  integrationController.updateGroupMapping
);

router.delete(
  '/integrations/mappings/:mappingId',
  authenticate,
  requireOrgAdmin,
  integrationController.deleteGroupMapping
);

export default router;
