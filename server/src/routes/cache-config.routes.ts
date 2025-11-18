import express from 'express';
import {
  getCacheConfig,
  updateCacheConfig,
  triggerCacheSync,
  getCacheStats,
  getCacheOptions,
} from '../controllers/cache-config.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Cache Configuration Routes
 * All routes require authentication and admin privileges
 */

// Get available cache options (strategies, frequencies, policies)
router.get(
  '/options',
  authenticate,
  requireOrgAdmin,
  getCacheOptions
);

// Get cache configuration
router.get(
  '/',
  authenticate,
  requireOrgAdmin,
  getCacheConfig
);

// Update cache configuration
router.patch(
  '/',
  authenticate,
  requireOrgAdmin,
  updateCacheConfig
);

// Get cache statistics
router.get(
  '/stats',
  authenticate,
  requireOrgAdmin,
  getCacheStats
);

// Trigger manual cache sync
router.post(
  '/sync',
  authenticate,
  requireOrgAdmin,
  triggerCacheSync
);

export default router;
