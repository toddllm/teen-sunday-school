import express from 'express';
import {
  createIncident,
  getIncident,
  listIncidents,
  updateIncident,
  deleteIncident,
  getIncidentStats,
  getIncidentsRequiringAttention,
  getIncidentEnums,
} from '../controllers/incident.controller';
import { authenticate, requireOrgAdmin, requireRole } from '../middleware/auth';

const router = express.Router();

/**
 * Incident Reporting Routes
 * Teachers can create reports, admins can view/manage all reports
 */

// Get available enums (types, severity levels, statuses)
router.get(
  '/enums',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN'),
  getIncidentEnums
);

// Get incident statistics
router.get(
  '/stats',
  authenticate,
  requireOrgAdmin,
  getIncidentStats
);

// Get incidents requiring attention
router.get(
  '/attention',
  authenticate,
  requireOrgAdmin,
  getIncidentsRequiringAttention
);

// Create a new incident report
router.post(
  '/',
  authenticate,
  requireRole('TEACHER', 'ORG_ADMIN'),
  createIncident
);

// List incidents with filters
router.get(
  '/',
  authenticate,
  requireOrgAdmin,
  listIncidents
);

// Get a specific incident
router.get(
  '/:id',
  authenticate,
  requireOrgAdmin,
  getIncident
);

// Update an incident (for follow-up)
router.patch(
  '/:id',
  authenticate,
  requireOrgAdmin,
  updateIncident
);

// Delete an incident (admin only)
router.delete(
  '/:id',
  authenticate,
  requireOrgAdmin,
  deleteIncident
);

export default router;
