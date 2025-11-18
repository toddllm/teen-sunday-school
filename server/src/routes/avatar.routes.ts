import express from 'express';
import { authenticate } from '../middleware/auth';
import * as avatarController from '../controllers/avatar.controller';

const router = express.Router();

// Public routes (no authentication required)

// Get all active avatars
// Query param: ?groupBy=category to group by category
router.get('/', avatarController.getAvatars);

// Get avatar categories
router.get('/categories', avatarController.getCategories);

// Get most popular avatars
// Query param: ?limit=5 (default: 5, max: 20)
router.get('/popular', avatarController.getPopularAvatars);

// Get avatars by specific category
router.get('/by-category/:category', avatarController.getAvatarsByCategory_endpoint);

// Get a single avatar by ID
router.get('/:id', avatarController.getAvatar);

// Protected admin routes
router.get('/stats', authenticate, avatarController.getAvatarStats);

export default router;
