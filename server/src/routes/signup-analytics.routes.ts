import express from 'express';
import {
  trackSignupEvent,
  getSignupEvents,
  getFunnelStats,
  getCohortAnalysis,
  getReferralAnalysis,
  getTimeToComplete,
} from '../controllers/signup-analytics.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Signup Funnel Analytics Routes
 */

// Track signup event (public - for tracking before authentication)
router.post('/track', trackSignupEvent);

// Get signup events (admin only)
router.get(
  '/events',
  authenticate,
  requireOrgAdmin,
  getSignupEvents
);

// Get funnel conversion statistics (admin only)
router.get(
  '/funnel',
  authenticate,
  requireOrgAdmin,
  getFunnelStats
);

// Get cohort analysis (admin only)
router.get(
  '/cohorts',
  authenticate,
  requireOrgAdmin,
  getCohortAnalysis
);

// Get referral source analysis (admin only)
router.get(
  '/referrals',
  authenticate,
  requireOrgAdmin,
  getReferralAnalysis
);

// Get time to complete analysis (admin only)
router.get(
  '/time-to-complete',
  authenticate,
  requireOrgAdmin,
  getTimeToComplete
);

export default router;
