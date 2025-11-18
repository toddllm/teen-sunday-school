import { Request, Response } from 'express';
import logger from '../config/logger';
import { analyzeQuery } from '../services/content-filter.service';

/**
 * Example AI Controller
 * Demonstrates how to integrate content filtering into AI features
 *
 * This is a template/example - adapt for your specific AI feature
 */

/**
 * Example: AI-powered lesson generation
 * POST /api/ai/generate-lesson
 *
 * Request body:
 * {
 *   "topic": "User's requested lesson topic",
 *   "ageGroup": "13-17",
 *   "additionalContext": "..."
 * }
 */
export const generateLesson = async (req: Request, res: Response) => {
  try {
    const { topic, ageGroup, additionalContext } = req.body;
    const { userId, organizationId } = req.user!;

    // Step 1: Validate input
    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Step 2: Apply content filter
    const filterResult = await analyzeQuery(topic, {
      organizationId,
      userId,
      featureName: 'ai-lesson-generation',
    });

    // Step 3: Handle filtered content
    if (!filterResult.allowed) {
      logger.info(`Lesson generation filtered: ${filterResult.category} - ${filterResult.action}`);

      return res.status(200).json({
        success: false,
        filtered: true,
        action: filterResult.action,
        category: filterResult.category,
        message: filterResult.message,
        metricId: filterResult.metricId,
      });
    }

    // Step 4: If allowed, proceed with AI generation
    // TODO: Replace with actual AI service call
    const generatedLesson = await generateLessonWithAI(topic, ageGroup, additionalContext);

    // Step 5: Return successful response
    res.json({
      success: true,
      filtered: false,
      lesson: generatedLesson,
    });

  } catch (error) {
    logger.error('Error generating lesson:', error);
    res.status(500).json({ error: 'Failed to generate lesson' });
  }
};

/**
 * Example: AI-powered discussion questions
 * POST /api/ai/generate-questions
 */
export const generateDiscussionQuestions = async (req: Request, res: Response) => {
  try {
    const { scripture, theme, count = 5 } = req.body;
    const { userId, organizationId } = req.user!;

    // Combine inputs for filtering
    const queryText = `${scripture} ${theme}`;

    // Apply content filter
    const filterResult = await analyzeQuery(queryText, {
      organizationId,
      userId,
      featureName: 'ai-discussion-questions',
    });

    if (!filterResult.allowed) {
      return res.status(200).json({
        success: false,
        filtered: true,
        action: filterResult.action,
        message: filterResult.message,
        metricId: filterResult.metricId,
      });
    }

    // Generate questions
    const questions = await generateQuestionsWithAI(scripture, theme, count);

    res.json({
      success: true,
      filtered: false,
      questions,
    });

  } catch (error) {
    logger.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
};

/**
 * Example: AI Bible Q&A
 * POST /api/ai/bible-qa
 */
export const answerBibleQuestion = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    const { userId, organizationId } = req.user!;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Apply content filter
    const filterResult = await analyzeQuery(question, {
      organizationId,
      userId,
      featureName: 'bible-qa',
    });

    // Handle different filter actions differently for Q&A
    if (filterResult.action === 'BLOCK' || filterResult.action === 'REDIRECT') {
      // For BLOCK and REDIRECT, don't answer the question
      return res.status(200).json({
        success: false,
        filtered: true,
        action: filterResult.action,
        message: filterResult.message,
        metricId: filterResult.metricId,
      });
    }

    // For GUIDANCE or MONITOR, we can still answer but with appropriate context
    let answer;
    if (filterResult.action === 'GUIDANCE') {
      // Use the guidance message instead of full AI answer
      answer = filterResult.message;
    } else {
      // MONITOR or not filtered - proceed with full answer
      answer = await generateBibleAnswerWithAI(question);
    }

    res.json({
      success: true,
      filtered: filterResult.action !== null,
      filterAction: filterResult.action,
      answer,
    });

  } catch (error) {
    logger.error('Error answering question:', error);
    res.status(500).json({ error: 'Failed to answer question' });
  }
};

// ============================================================================
// PLACEHOLDER AI FUNCTIONS
// Replace these with actual AI service integrations
// ============================================================================

async function generateLessonWithAI(
  topic: string,
  ageGroup: string,
  additionalContext?: string
): Promise<any> {
  // TODO: Integrate with your AI service (OpenAI, Claude, etc.)
  // This is a placeholder that returns mock data

  return {
    title: `Lesson on ${topic}`,
    ageGroup,
    scripture: 'Example reference',
    slides: [
      {
        type: 'title',
        content: `Understanding ${topic}`,
      },
      {
        type: 'text',
        content: 'This is where AI-generated content would appear...',
      },
    ],
    discussionQuestions: [
      'How does this apply to your life?',
      'What can we learn from this passage?',
    ],
    activities: [],
    generatedBy: 'AI',
    generatedAt: new Date(),
  };
}

async function generateQuestionsWithAI(
  scripture: string,
  theme: string,
  count: number
): Promise<string[]> {
  // TODO: Integrate with your AI service

  const questions = [];
  for (let i = 1; i <= count; i++) {
    questions.push(`AI-generated question ${i} about ${theme}`);
  }
  return questions;
}

async function generateBibleAnswerWithAI(question: string): Promise<string> {
  // TODO: Integrate with your AI service

  return `AI-generated answer to: ${question}`;
}

// ============================================================================
// EXAMPLE ROUTES SETUP
// ============================================================================

/**
 * Add these routes to your Express app:
 *
 * import express from 'express';
 * import { authenticate } from '../middleware/auth';
 * import * as aiController from '../controllers/ai-example.controller';
 *
 * const router = express.Router();
 *
 * router.post('/generate-lesson', authenticate, aiController.generateLesson);
 * router.post('/generate-questions', authenticate, aiController.generateDiscussionQuestions);
 * router.post('/bible-qa', authenticate, aiController.answerBibleQuestion);
 *
 * export default router;
 */
