import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Create a new poll for a lesson
 * POST /api/lessons/:lessonId/polls
 * Requires: TEACHER, ORG_ADMIN, or SUPER_ADMIN role
 */
export async function createPoll(req: Request, res: Response): Promise<void> {
  try {
    const { lessonId } = req.params;
    const { question, options, type, showResultsLive, allowMultipleResponses } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Validate input
    if (!question || !type) {
      res.status(400).json({ error: 'Question and type are required' });
      return;
    }

    // Validate poll type
    if (!['MULTIPLE_CHOICE', 'OPEN_ENDED', 'RATING'].includes(type)) {
      res.status(400).json({ error: 'Invalid poll type' });
      return;
    }

    // For multiple choice polls, options are required
    if (type === 'MULTIPLE_CHOICE' && (!options || !Array.isArray(options) || options.length < 2)) {
      res.status(400).json({ error: 'Multiple choice polls require at least 2 options' });
      return;
    }

    // Verify lesson exists and user has access
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    // Verify user has access to this organization
    if (req.user.role !== 'SUPER_ADMIN' && req.user.organizationId !== lesson.organizationId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Create poll
    const poll = await prisma.poll.create({
      data: {
        question,
        options: options || null,
        type,
        lessonId,
        organizationId: lesson.organizationId,
        createdBy: req.user.userId,
        showResultsLive: showResultsLive !== undefined ? showResultsLive : true,
        allowMultipleResponses: allowMultipleResponses || false,
        status: 'DRAFT',
      },
      include: {
        responses: true,
      },
    });

    logger.info(`Poll created: ${poll.id} for lesson ${lessonId} by user ${req.user.userId}`);
    res.status(201).json({ poll });
  } catch (error) {
    logger.error('Create poll error:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
}

/**
 * Get all polls for a lesson
 * GET /api/lessons/:lessonId/polls
 */
export async function getLessonPolls(req: Request, res: Response): Promise<void> {
  try {
    const { lessonId } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    // Get polls
    const polls = await prisma.poll.findMany({
      where: { lessonId },
      include: {
        responses: {
          select: {
            id: true,
            userId: true,
            anonymousId: true,
            answer: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ polls });
  } catch (error) {
    logger.error('Get lesson polls error:', error);
    res.status(500).json({ error: 'Failed to get polls' });
  }
}

/**
 * Get a specific poll with details
 * GET /api/polls/:pollId
 */
export async function getPoll(req: Request, res: Response): Promise<void> {
  try {
    const { pollId } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        responses: {
          select: {
            id: true,
            userId: true,
            anonymousId: true,
            answer: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }

    // Verify user has access to this organization
    if (req.user.role !== 'SUPER_ADMIN' && req.user.organizationId !== poll.organizationId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ poll });
  } catch (error) {
    logger.error('Get poll error:', error);
    res.status(500).json({ error: 'Failed to get poll' });
  }
}

/**
 * Activate a poll (make it live)
 * PATCH /api/polls/:pollId/activate
 * Requires: TEACHER, ORG_ADMIN, or SUPER_ADMIN role
 */
export async function activatePoll(req: Request, res: Response): Promise<void> {
  try {
    const { pollId } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get poll
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }

    // Verify user has access
    if (req.user.role !== 'SUPER_ADMIN' && req.user.organizationId !== poll.organizationId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Verify user is teacher or admin
    if (!['TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      res.status(403).json({ error: 'Only teachers and admins can activate polls' });
      return;
    }

    // Update poll status
    const updatedPoll = await prisma.poll.update({
      where: { id: pollId },
      data: {
        status: 'ACTIVE',
        activatedAt: new Date(),
      },
      include: {
        responses: true,
      },
    });

    logger.info(`Poll activated: ${pollId} by user ${req.user.userId}`);
    res.json({ poll: updatedPoll });
  } catch (error) {
    logger.error('Activate poll error:', error);
    res.status(500).json({ error: 'Failed to activate poll' });
  }
}

/**
 * Close a poll (stop accepting responses)
 * PATCH /api/polls/:pollId/close
 * Requires: TEACHER, ORG_ADMIN, or SUPER_ADMIN role
 */
export async function closePoll(req: Request, res: Response): Promise<void> {
  try {
    const { pollId } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get poll
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }

    // Verify user has access
    if (req.user.role !== 'SUPER_ADMIN' && req.user.organizationId !== poll.organizationId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Verify user is teacher or admin
    if (!['TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      res.status(403).json({ error: 'Only teachers and admins can close polls' });
      return;
    }

    // Update poll status
    const updatedPoll = await prisma.poll.update({
      where: { id: pollId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
      include: {
        responses: true,
      },
    });

    logger.info(`Poll closed: ${pollId} by user ${req.user.userId}`);
    res.json({ poll: updatedPoll });
  } catch (error) {
    logger.error('Close poll error:', error);
    res.status(500).json({ error: 'Failed to close poll' });
  }
}

/**
 * Submit a response to a poll
 * POST /api/polls/:pollId/responses
 */
export async function submitPollResponse(req: Request, res: Response): Promise<void> {
  try {
    const { pollId } = req.params;
    const { answer, anonymousId } = req.body;

    // Validate answer
    if (answer === undefined || answer === null) {
      res.status(400).json({ error: 'Answer is required' });
      return;
    }

    // Get poll
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }

    // Check if poll is active
    if (poll.status !== 'ACTIVE') {
      res.status(400).json({ error: 'Poll is not active' });
      return;
    }

    // Determine user identification
    const userId = req.user?.userId || null;
    const anonId = !userId ? (anonymousId || null) : null;

    if (!userId && !anonId) {
      res.status(400).json({ error: 'User identification required (login or provide anonymousId)' });
      return;
    }

    // Check for existing response
    if (userId && !poll.allowMultipleResponses) {
      const existingResponse = await prisma.pollResponse.findUnique({
        where: {
          pollId_userId: {
            pollId,
            userId,
          },
        },
      });

      if (existingResponse) {
        // Update existing response
        const updatedResponse = await prisma.pollResponse.update({
          where: { id: existingResponse.id },
          data: { answer },
        });
        res.json({ response: updatedResponse, message: 'Response updated' });
        return;
      }
    }

    // Create new response
    const response = await prisma.pollResponse.create({
      data: {
        pollId,
        userId,
        anonymousId: anonId,
        answer,
      },
    });

    logger.info(`Poll response submitted: poll ${pollId}, user ${userId || anonId}`);
    res.status(201).json({ response });
  } catch (error: any) {
    // Handle unique constraint violation (if user tries to submit twice)
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'You have already responded to this poll' });
      return;
    }
    logger.error('Submit poll response error:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
}

/**
 * Get aggregated results for a poll
 * GET /api/polls/:pollId/results
 */
export async function getPollResults(req: Request, res: Response): Promise<void> {
  try {
    const { pollId } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get poll with responses
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        responses: {
          select: {
            answer: true,
            createdAt: true,
          },
        },
      },
    });

    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }

    // Verify user has access
    if (req.user.role !== 'SUPER_ADMIN' && req.user.organizationId !== poll.organizationId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Aggregate results based on poll type
    let aggregatedResults: any = {
      totalResponses: poll.responses.length,
      poll: {
        id: poll.id,
        question: poll.question,
        type: poll.type,
        status: poll.status,
        options: poll.options,
      },
    };

    if (poll.type === 'MULTIPLE_CHOICE') {
      // Count responses for each option
      const optionCounts: Record<string, number> = {};
      poll.responses.forEach((response: any) => {
        const answerValue = typeof response.answer === 'string'
          ? response.answer
          : JSON.stringify(response.answer);
        optionCounts[answerValue] = (optionCounts[answerValue] || 0) + 1;
      });
      aggregatedResults.results = optionCounts;
    } else if (poll.type === 'OPEN_ENDED') {
      // Return all text responses
      aggregatedResults.responses = poll.responses.map((r: any) => ({
        answer: r.answer,
        createdAt: r.createdAt,
      }));

      // Word frequency for word cloud
      const wordFrequency: Record<string, number> = {};
      poll.responses.forEach((response: any) => {
        const text = typeof response.answer === 'string'
          ? response.answer
          : JSON.stringify(response.answer);
        const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        words.forEach(word => {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
      });
      aggregatedResults.wordFrequency = wordFrequency;
    } else if (poll.type === 'RATING') {
      // Calculate average rating
      const ratings = poll.responses.map((r: any) => {
        return typeof r.answer === 'number' ? r.answer : parseInt(r.answer, 10);
      }).filter(n => !isNaN(n));

      if (ratings.length > 0) {
        const sum = ratings.reduce((a, b) => a + b, 0);
        const average = sum / ratings.length;
        aggregatedResults.averageRating = average.toFixed(2);
        aggregatedResults.ratings = ratings;
      }
    }

    res.json(aggregatedResults);
  } catch (error) {
    logger.error('Get poll results error:', error);
    res.status(500).json({ error: 'Failed to get poll results' });
  }
}

/**
 * Delete a poll
 * DELETE /api/polls/:pollId
 * Requires: TEACHER, ORG_ADMIN, or SUPER_ADMIN role
 */
export async function deletePoll(req: Request, res: Response): Promise<void> {
  try {
    const { pollId } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get poll
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }

    // Verify user has access
    if (req.user.role !== 'SUPER_ADMIN' && req.user.organizationId !== poll.organizationId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Verify user is teacher or admin
    if (!['TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      res.status(403).json({ error: 'Only teachers and admins can delete polls' });
      return;
    }

    // Delete poll (responses will be cascade deleted)
    await prisma.poll.delete({
      where: { id: pollId },
    });

    logger.info(`Poll deleted: ${pollId} by user ${req.user.userId}`);
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    logger.error('Delete poll error:', error);
    res.status(500).json({ error: 'Failed to delete poll' });
  }
}
