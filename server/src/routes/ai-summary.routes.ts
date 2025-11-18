import express from 'express';
import {
  generatePassageSummary,
  getRecent,
  getPopular,
  deleteSummaryById,
} from '../controllers/ai-summary.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * AI Passage Summary Routes
 *
 * Note: Generate summary endpoint doesn't require authentication
 * to allow public access to passage summaries
 */

// Generate or retrieve passage summary
// Public endpoint - no auth required
router.post('/', generatePassageSummary);

// Get recent summaries (requires authentication)
router.get('/recent', authenticate, getRecent);

// Get popular summaries (requires authentication)
router.get('/popular', authenticate, getPopular);

// Delete a summary (requires authentication)
router.delete('/:id', authenticate, deleteSummaryById);

export default router;
