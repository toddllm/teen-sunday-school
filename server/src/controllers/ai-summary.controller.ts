import { Request, Response } from 'express';
import logger from '../config/logger';
import { analyzeQuery } from '../services/content-filter.service';
import {
  getOrCreateSummary,
  getRecentSummaries,
  getPopularSummaries,
  deleteSummary,
} from '../services/ai-summary.service';

/**
 * AI Passage Summary Controller
 * Handles requests for AI-generated Bible passage summaries
 */

/**
 * Generate or retrieve AI summary for a passage
 * POST /api/ai/passage-summary
 *
 * Request body:
 * {
 *   "verseId": "JHN.3.16",
 *   "verseReference": "John 3:16",
 *   "bibleId": "de4e12af7f28f599-02",
 *   "passageText": "For God so loved the world..."
 * }
 */
export const generatePassageSummary = async (req: Request, res: Response) => {
  try {
    const { verseId, verseReference, bibleId, passageText } = req.body;

    // Get user context (may be undefined if not authenticated)
    const userId = req.user?.userId;
    const organizationId = req.user?.organizationId;

    // Step 1: Validate input
    if (!verseId || !verseReference || !bibleId || !passageText) {
      return res.status(400).json({
        error: 'Missing required fields: verseId, verseReference, bibleId, passageText',
      });
    }

    // Step 2: Apply content filter to passage text
    // This ensures we're not generating summaries for potentially sensitive content
    if (organizationId) {
      const filterResult = await analyzeQuery(passageText, {
        organizationId,
        userId,
        featureName: 'ai-passage-summary',
      });

      // Step 3: Handle filtered content
      if (!filterResult.allowed) {
        logger.info(
          `Passage summary filtered: ${filterResult.category} - ${filterResult.action}`
        );

        return res.status(200).json({
          success: false,
          filtered: true,
          action: filterResult.action,
          category: filterResult.category,
          message: filterResult.message,
          metricId: filterResult.metricId,
        });
      }
    }

    // Step 4: Get or create summary
    const summary = await getOrCreateSummary({
      verseId,
      verseReference,
      bibleId,
      passageText,
      organizationId,
      userId,
    });

    // Step 5: Return successful response
    res.json({
      success: true,
      filtered: false,
      summary,
    });
  } catch (error) {
    logger.error('Error generating passage summary:', error);
    res.status(500).json({ error: 'Failed to generate passage summary' });
  }
};

/**
 * Get recent passage summaries
 * GET /api/ai/passage-summary/recent?limit=10
 */
export const getRecent = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const limit = parseInt(req.query.limit as string) || 10;

    const summaries = await getRecentSummaries(organizationId, limit);

    res.json({
      success: true,
      summaries,
    });
  } catch (error) {
    logger.error('Error getting recent summaries:', error);
    res.status(500).json({ error: 'Failed to get recent summaries' });
  }
};

/**
 * Get popular passage summaries (most viewed)
 * GET /api/ai/passage-summary/popular?limit=10
 */
export const getPopular = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const limit = parseInt(req.query.limit as string) || 10;

    const summaries = await getPopularSummaries(organizationId, limit);

    res.json({
      success: true,
      summaries,
    });
  } catch (error) {
    logger.error('Error getting popular summaries:', error);
    res.status(500).json({ error: 'Failed to get popular summaries' });
  }
};

/**
 * Delete a passage summary
 * DELETE /api/ai/passage-summary/:id
 */
export const deleteSummaryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user!;

    // TODO: Add authorization check to ensure user can delete this summary
    // For now, just delete it

    await deleteSummary(id);

    res.json({
      success: true,
      message: 'Summary deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting summary:', error);
    res.status(500).json({ error: 'Failed to delete summary' });
  }
};
