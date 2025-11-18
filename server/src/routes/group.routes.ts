import express from 'express';
import { authenticate } from '../middleware/auth';
import * as groupController from '../controllers/group.controller';

const router = express.Router();

/**
 * Get all groups for the user's organization
 */
router.get('/groups', authenticate, groupController.getGroups);

/**
 * Get groups the current user is a member of
 */
router.get('/groups/my-groups', authenticate, groupController.getMyGroups);

/**
 * Get a specific group by ID
 */
router.get('/groups/:groupId', authenticate, groupController.getGroupById);

export default router;
