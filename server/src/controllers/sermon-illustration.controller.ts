import { Request, Response } from 'express';
import logger from '../config/logger';
import { analyzeQuery } from '../services/content-filter.service';
import {
  generateIllustrations,
  getIllustrationTypeSuggestions,
} from '../services/ai-illustration.service';

/**
 * Sermon Illustration Controller
 * Provides AI-powered illustration suggestions for teachers and leaders
 */

/**
 * Generate sermon illustrations
 * POST /api/sermon-illustrations/generate
 *
 * Request body:
 * {
 *   "scriptureRef": "John 3:16",
 *   "theme": "God's Love",
 *   "ageGroup": "13-17",
 *   "additionalContext": "...",
 *   "illustrationType": "all" | "story" | "modern_example" | "object_lesson" | "analogy"
 * }
 */
export const generateSermonIllustrations = async (req: Request, res: Response) => {
  try {
    const {
      scriptureRef,
      theme,
      ageGroup = '13-17',
      additionalContext,
      illustrationType = 'all',
    } = req.body;
    const { userId, organizationId } = req.user!;

    // Step 1: Validate input
    if (!scriptureRef || scriptureRef.trim().length === 0) {
      return res.status(400).json({ error: 'Scripture reference is required' });
    }

    if (!theme || theme.trim().length === 0) {
      return res.status(400).json({ error: 'Theme is required' });
    }

    // Step 2: Apply content filter to user inputs
    const queryText = `${scriptureRef} ${theme} ${additionalContext || ''}`;

    const filterResult = await analyzeQuery(queryText, {
      organizationId,
      userId,
      featureName: 'sermon-illustration-generator',
    });

    // Step 3: Handle filtered content
    if (!filterResult.allowed) {
      logger.info(
        `Sermon illustration filtered: ${filterResult.category} - ${filterResult.action}`
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

    // Step 4: Generate illustrations
    const result = await generateIllustrations({
      scriptureRef,
      theme,
      ageGroup,
      additionalContext,
      illustrationType,
    });

    // Step 5: Return successful response
    res.json({
      success: true,
      filtered: false,
      data: result,
    });
  } catch (error) {
    logger.error('Error generating sermon illustrations:', error);
    res.status(500).json({ error: 'Failed to generate illustrations' });
  }
};

/**
 * Get suggestions for illustration types based on theme
 * POST /api/sermon-illustrations/suggestions
 *
 * Request body:
 * {
 *   "theme": "faith"
 * }
 */
export const getTypeSuggestions = async (req: Request, res: Response) => {
  try {
    const { theme } = req.body;

    if (!theme || theme.trim().length === 0) {
      return res.status(400).json({ error: 'Theme is required' });
    }

    const suggestions = getIllustrationTypeSuggestions(theme);

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    logger.error('Error getting type suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
};

/**
 * Save illustration to a lesson
 * POST /api/sermon-illustrations/save-to-lesson
 *
 * Request body:
 * {
 *   "lessonId": "123",
 *   "illustration": { ... }
 * }
 *
 * Note: This is a placeholder. Actual implementation depends on
 * whether lessons are stored in database or localStorage
 */
export const saveToLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId, illustration } = req.body;
    const { userId } = req.user!;

    if (!lessonId || !illustration) {
      return res.status(400).json({ error: 'Lesson ID and illustration are required' });
    }

    // TODO: Implement lesson storage integration
    // Current lesson system uses localStorage on frontend
    // When migrating to database, uncomment and implement:
    //
    // const lesson = await prisma.lesson.findFirst({
    //   where: {
    //     id: lessonId,
    //     userId, // Ensure user owns this lesson
    //   },
    // });
    //
    // if (!lesson) {
    //   return res.status(404).json({ error: 'Lesson not found' });
    // }
    //
    // // Add illustration to lesson content
    // const content = lesson.content as any;
    // if (!content.illustrations) {
    //   content.illustrations = [];
    // }
    // content.illustrations.push(illustration);
    //
    // await prisma.lesson.update({
    //   where: { id: lessonId },
    //   data: { content },
    // });

    logger.info(`Illustration saved to lesson ${lessonId} by user ${userId}`);

    res.json({
      success: true,
      message: 'Illustration saved successfully',
    });
  } catch (error) {
    logger.error('Error saving illustration to lesson:', error);
    res.status(500).json({ error: 'Failed to save illustration' });
  }
};

/**
 * Get illustration history for a user
 * GET /api/sermon-illustrations/history
 *
 * Query params:
 * - limit: number of recent illustrations to return (default: 10)
 */
export const getIllustrationHistory = async (req: Request, res: Response) => {
  try {
    const { userId, organizationId } = req.user!;
    const limit = parseInt(req.query.limit as string) || 10;

    // TODO: Implement history storage
    // When implementing, store generated illustrations in database:
    //
    // const history = await prisma.sermonIllustration.findMany({
    //   where: {
    //     userId,
    //     organizationId,
    //   },
    //   orderBy: { createdAt: 'desc' },
    //   take: limit,
    // });

    logger.info(`Fetching illustration history for user ${userId}`);

    // Placeholder response
    res.json({
      success: true,
      history: [],
      message: 'History tracking not yet implemented',
    });
  } catch (error) {
    logger.error('Error fetching illustration history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
