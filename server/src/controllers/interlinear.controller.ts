import { Request, Response } from 'express';
import logger from '../config/logger';
import * as interlinearService from '../services/interlinear.service';

/**
 * Interlinear Controller
 * Handles requests for interlinear Bible verse data
 */

/**
 * GET /api/bible/interlinear/:verseRef
 * Get interlinear data for a specific verse
 */
export const getInterlinearVerse = async (req: Request, res: Response) => {
  try {
    const { verseRef } = req.params;

    if (!verseRef) {
      return res.status(400).json({ error: 'Verse reference is required' });
    }

    const interlinearData = await interlinearService.getInterlinearByVerseRef(verseRef);

    if (!interlinearData) {
      return res.status(404).json({
        error: 'Interlinear data not available for this verse',
        verseRef,
      });
    }

    // Track the view if user context is available
    if (req.user) {
      await interlinearService.trackInterlinearMetric(
        interlinearData.id,
        'view',
        {
          organizationId: req.user.organizationId,
          userId: req.user.id,
          featureName: 'bible_reader',
        }
      );
    }

    res.json(interlinearData);
  } catch (error) {
    logger.error('Error fetching interlinear verse:', error);
    res.status(500).json({ error: 'Failed to fetch interlinear data' });
  }
};

/**
 * GET /api/bible/interlinear
 * Get all key verses with interlinear data
 */
export const getKeyVerses = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const verses = await interlinearService.getKeyVerses(
      category as string | undefined
    );

    res.json({
      verses,
      count: verses.length,
    });
  } catch (error) {
    logger.error('Error fetching key verses:', error);
    res.status(500).json({ error: 'Failed to fetch key verses' });
  }
};

/**
 * POST /api/bible/interlinear/:verseRef/track
 * Track user interaction with interlinear data
 */
export const trackInteraction = async (req: Request, res: Response) => {
  try {
    const { verseRef } = req.params;
    const { action, wordIndex, featureName, sessionId } = req.body;

    if (!verseRef || !action) {
      return res.status(400).json({
        error: 'Verse reference and action are required',
      });
    }

    // Get the verse to find its ID
    const verse = await interlinearService.getInterlinearByVerseRef(verseRef);

    if (!verse) {
      return res.status(404).json({
        error: 'Verse not found',
        verseRef,
      });
    }

    // Track the metric
    await interlinearService.trackInterlinearMetric(
      verse.id,
      action,
      {
        organizationId: req.user?.organizationId,
        userId: req.user?.id,
        wordIndex,
        featureName,
        sessionId,
      }
    );

    res.json({ success: true });
  } catch (error) {
    logger.error('Error tracking interlinear interaction:', error);
    res.status(500).json({ error: 'Failed to track interaction' });
  }
};

/**
 * GET /api/admin/interlinear/metrics
 * Get metrics for interlinear views (admin only)
 */
export const getMetrics = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { startDate, endDate, limit, offset } = req.query;

    const options: any = {};

    if (startDate) {
      options.startDate = new Date(startDate as string);
    }
    if (endDate) {
      options.endDate = new Date(endDate as string);
    }
    if (limit) {
      options.limit = parseInt(limit as string, 10);
    }
    if (offset) {
      options.offset = parseInt(offset as string, 10);
    }

    const metricsData = await interlinearService.getInterlinearMetrics(
      organizationId,
      options
    );

    res.json(metricsData);
  } catch (error) {
    logger.error('Error fetching interlinear metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

/**
 * POST /api/admin/interlinear/seed
 * Seed initial key verses (admin only)
 */
export const seedKeyVerses = async (req: Request, res: Response) => {
  try {
    const { role } = req.user!;

    // Only super admins can seed data
    if (role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: 'Insufficient permissions. Super admin access required.',
      });
    }

    await interlinearService.seedKeyVerses();

    res.json({
      success: true,
      message: 'Key verses seeded successfully',
    });
  } catch (error) {
    logger.error('Error seeding key verses:', error);
    res.status(500).json({ error: 'Failed to seed key verses' });
  }
};
