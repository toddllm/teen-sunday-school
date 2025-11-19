import express from 'express';
import {
  getErrorStatistics,
  listErrors,
  getErrorById,
  resolveError,
  getErrorTrendsData,
  listIncidents,
  createIncident,
  getIncidentById,
  updateIncident,
  assignIncident,
  resolveIncident,
} from '../controllers/error-dashboard.controller';
import { authenticate } from '../middleware/auth';
import { requireOrgAdmin } from '../middleware/permissions';

const router = express.Router();

// All routes require authentication and org admin role
router.use(authenticate);
router.use(requireOrgAdmin);

// Error endpoints
router.get('/errors/stats', getErrorStatistics);
router.get('/errors/trends', getErrorTrendsData);
router.get('/errors', listErrors);
router.get('/errors/:id', getErrorById);
router.post('/errors/:id/resolve', resolveError);

// Incident endpoints
router.get('/incidents', listIncidents);
router.post('/incidents', createIncident);
router.get('/incidents/:id', getIncidentById);
router.put('/incidents/:id', updateIncident);
router.post('/incidents/:id/assign', assignIncident);
router.post('/incidents/:id/resolve', resolveIncident);

export default router;
