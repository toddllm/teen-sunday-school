import express from 'express';
import { authenticate } from '../middleware/auth';
import * as substituteController from '../controllers/substitute.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all my substitute assignments
router.get('/assignments', substituteController.getMyAssignments);

// Get today's assignments for quick access
router.get('/assignments/today', substituteController.getTodayAssignments);

// Get quick-start package for a specific assignment
router.get('/assignments/:assignmentId/quick-start', substituteController.getQuickStartPackage);

// Update assignment status (accept, start, complete)
router.patch('/assignments/:assignmentId/status', substituteController.updateAssignmentStatus);

// Create a new substitute assignment (for admins/leaders)
router.post('/assignments', substituteController.createAssignment);

export default router;
