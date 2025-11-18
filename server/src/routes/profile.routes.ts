import express from 'express';
import { authenticate } from '../middleware/auth';
import * as profileController from '../controllers/profile.controller';

const router = express.Router();

// All profile routes require authentication
router.use(authenticate);

// Get current user's profile
router.get('/', profileController.getMyProfile);

// Update current user's profile (nickname and/or avatar)
router.patch('/', profileController.updateMyProfile);

// Validate nickname without updating
router.post('/validate-nickname', profileController.validateNicknameEndpoint);

export default router;
