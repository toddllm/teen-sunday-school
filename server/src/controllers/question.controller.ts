import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Submit an anonymous question
 * Public endpoint - no authentication required
 */
export async function submitQuestion(req: Request, res: Response): Promise<void> {
  try {
    const { groupId } = req.params;
    const { category, body, sessionId } = req.body;

    // Validate input
    if (!category || !body) {
      res.status(400).json({ error: 'Category and question body are required' });
      return;
    }

    if (!['BIBLE', 'LIFE', 'DOUBT'].includes(category)) {
      res.status(400).json({ error: 'Invalid category. Must be BIBLE, LIFE, or DOUBT' });
      return;
    }

    // Verify group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Verify session exists if provided
    if (sessionId) {
      const session = await prisma.lesson.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
    }

    // Create question
    const question = await prisma.anonymousQuestion.create({
      data: {
        groupId,
        sessionId: sessionId || null,
        category,
        body,
        status: 'UNANSWERED',
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    logger.info(`Anonymous question submitted to group ${groupId}`);

    res.status(201).json({
      message: 'Question submitted successfully',
      question: {
        id: question.id,
        category: question.category,
        createdAt: question.createdAt,
      },
    });
  } catch (error) {
    logger.error('Question submission error:', error);
    res.status(500).json({ error: 'Failed to submit question' });
  }
}

/**
 * Get all questions for admin (filtered by group, status, category)
 * Requires authentication and leader/admin role
 */
export async function getQuestionsForAdmin(req: Request, res: Response): Promise<void> {
  try {
    const { groupId, status, category, sessionId } = req.query;

    // Build filter
    const where: any = {};

    if (groupId) {
      where.groupId = groupId as string;
    }

    if (status) {
      where.status = status as string;
    }

    if (category) {
      where.category = category as string;
    }

    if (sessionId) {
      where.sessionId = sessionId as string;
    }

    // Fetch questions
    const questions = await prisma.anonymousQuestion.findMany({
      where,
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            lessonNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get statistics
    const stats = await getQuestionStats(groupId as string | undefined);

    res.json({
      questions,
      stats,
    });
  } catch (error) {
    logger.error('Error fetching admin questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
}

/**
 * Get a single question by ID
 * Requires authentication and leader/admin role
 */
export async function getQuestionById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const question = await prisma.anonymousQuestion.findUnique({
      where: { id },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            lessonNumber: true,
          },
        },
      },
    });

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    res.json(question);
  } catch (error) {
    logger.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
}

/**
 * Mark question as answered
 * Requires authentication and leader/admin role
 */
export async function markAsAnswered(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { answerText, answerMethod } = req.body;
    const userId = (req as any).user?.id; // From auth middleware

    // Validate answer method
    if (answerMethod && !['WRITTEN', 'IN_CLASS'].includes(answerMethod)) {
      res.status(400).json({ error: 'Invalid answer method. Must be WRITTEN or IN_CLASS' });
      return;
    }

    // If WRITTEN method, answerText is required
    if (answerMethod === 'WRITTEN' && !answerText) {
      res.status(400).json({ error: 'Answer text is required for WRITTEN method' });
      return;
    }

    const question = await prisma.anonymousQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    // Update question
    const updatedQuestion = await prisma.anonymousQuestion.update({
      where: { id },
      data: {
        status: 'ANSWERED',
        answeredBy: userId,
        answeredAt: new Date(),
        answerText: answerText || null,
        answerMethod: answerMethod || null,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    logger.info(`Question ${id} marked as answered by user ${userId}`);

    res.json(updatedQuestion);
  } catch (error) {
    logger.error('Error marking question as answered:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
}

/**
 * Update question status (answered/unanswered/archived)
 * Requires authentication and leader/admin role
 */
export async function updateQuestionStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['UNANSWERED', 'ANSWERED', 'ARCHIVED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be UNANSWERED, ANSWERED, or ARCHIVED' });
      return;
    }

    const question = await prisma.anonymousQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const updatedQuestion = await prisma.anonymousQuestion.update({
      where: { id },
      data: { status },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    logger.info(`Question ${id} status updated to ${status}`);

    res.json(updatedQuestion);
  } catch (error) {
    logger.error('Error updating question status:', error);
    res.status(500).json({ error: 'Failed to update question status' });
  }
}

/**
 * Delete a question
 * Requires authentication and leader/admin role
 */
export async function deleteQuestion(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const question = await prisma.anonymousQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    await prisma.anonymousQuestion.delete({
      where: { id },
    });

    logger.info(`Question ${id} deleted`);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    logger.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
}

/**
 * Get question statistics
 * Helper function
 */
async function getQuestionStats(groupId?: string) {
  const where: any = groupId ? { groupId } : {};

  const [total, unanswered, answered, archived, byCategory] = await Promise.all([
    // Total questions
    prisma.anonymousQuestion.count({ where }),

    // Unanswered questions
    prisma.anonymousQuestion.count({
      where: { ...where, status: 'UNANSWERED' },
    }),

    // Answered questions
    prisma.anonymousQuestion.count({
      where: { ...where, status: 'ANSWERED' },
    }),

    // Archived questions
    prisma.anonymousQuestion.count({
      where: { ...where, status: 'ARCHIVED' },
    }),

    // Questions by category
    prisma.anonymousQuestion.groupBy({
      by: ['category'],
      where,
      _count: {
        category: true,
      },
    }),
  ]);

  // Calculate response rate
  const responseRate = total > 0 ? Math.round((answered / total) * 100) : 0;

  return {
    total,
    unanswered,
    answered,
    archived,
    responseRate,
    byCategory: byCategory.reduce((acc, item) => {
      acc[item.category] = item._count.category;
      return acc;
    }, {} as Record<string, number>),
  };
}

/**
 * Get question statistics endpoint
 * Requires authentication and leader/admin role
 */
export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const { groupId } = req.query;

    const stats = await getQuestionStats(groupId as string | undefined);

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching question stats:', error);
    res.status(500).json({ error: 'Failed to fetch question statistics' });
  }
}
