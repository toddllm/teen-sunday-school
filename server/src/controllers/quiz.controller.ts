import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Create a new quiz for a lesson
 */
export async function createQuiz(req: Request, res: Response): Promise<void> {
  try {
    const { lessonId } = req.params;
    const {
      title,
      description,
      passingScore,
      timeLimit,
      showCorrectAnswers,
      allowRetakes,
      questions,
    } = req.body;

    // Validate input
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ error: 'Title and questions are required' });
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

    // Create quiz with questions
    const quiz = await prisma.lessonQuiz.create({
      data: {
        lessonId,
        title,
        description,
        passingScore,
        timeLimit,
        showCorrectAnswers: showCorrectAnswers ?? true,
        allowRetakes: allowRetakes ?? true,
        questions: {
          create: questions.map((q: any, index: number) => ({
            questionText: q.questionText,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points || 1,
            orderIndex: index,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    logger.info(`Quiz created: ${quiz.id} for lesson ${lessonId}`);
    res.status(201).json(quiz);
  } catch (error: any) {
    logger.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
}

/**
 * Update an existing quiz
 */
export async function updateQuiz(req: Request, res: Response): Promise<void> {
  try {
    const { quizId } = req.params;
    const {
      title,
      description,
      passingScore,
      timeLimit,
      showCorrectAnswers,
      allowRetakes,
      isActive,
      questions,
    } = req.body;

    // Verify quiz exists
    const existingQuiz = await prisma.lessonQuiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    // Update quiz metadata
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (passingScore !== undefined) updateData.passingScore = passingScore;
    if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
    if (showCorrectAnswers !== undefined)
      updateData.showCorrectAnswers = showCorrectAnswers;
    if (allowRetakes !== undefined) updateData.allowRetakes = allowRetakes;
    if (isActive !== undefined) updateData.isActive = isActive;

    // If questions are provided, replace them
    if (questions && Array.isArray(questions)) {
      // Delete existing questions
      await prisma.quizQuestion.deleteMany({
        where: { quizId },
      });

      // Create new questions
      updateData.questions = {
        create: questions.map((q: any, index: number) => ({
          questionText: q.questionText,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points || 1,
          orderIndex: index,
        })),
      };
    }

    const updatedQuiz = await prisma.lessonQuiz.update({
      where: { id: quizId },
      data: updateData,
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    logger.info(`Quiz updated: ${quizId}`);
    res.json(updatedQuiz);
  } catch (error: any) {
    logger.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(req: Request, res: Response): Promise<void> {
  try {
    const { quizId } = req.params;

    // Verify quiz exists
    const quiz = await prisma.lessonQuiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    // Delete quiz (cascade will delete questions and attempts)
    await prisma.lessonQuiz.delete({
      where: { id: quizId },
    });

    logger.info(`Quiz deleted: ${quizId}`);
    res.status(204).send();
  } catch (error: any) {
    logger.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
}

/**
 * Get all quizzes for a lesson
 */
export async function getQuizzesForLesson(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { lessonId } = req.params;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    // For students, only return active quizzes without correct answers
    const includeCorrectAnswers = ['TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'].includes(
      userRole
    );

    const quizzes = await prisma.lessonQuiz.findMany({
      where: {
        lessonId,
        ...(includeCorrectAnswers ? {} : { isActive: true }),
      },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            questionText: true,
            type: true,
            options: true,
            correctAnswer: includeCorrectAnswers,
            explanation: includeCorrectAnswers,
            points: true,
            orderIndex: true,
          },
        },
        attempts: {
          where: { userId },
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
    });

    res.json(quizzes);
  } catch (error: any) {
    logger.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
}

/**
 * Get a specific quiz by ID
 */
export async function getQuizById(req: Request, res: Response): Promise<void> {
  try {
    const { quizId } = req.params;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    const includeCorrectAnswers = ['TEACHER', 'ORG_ADMIN', 'SUPER_ADMIN'].includes(
      userRole
    );

    const quiz = await prisma.lessonQuiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            questionText: true,
            type: true,
            options: true,
            correctAnswer: includeCorrectAnswers,
            explanation: includeCorrectAnswers,
            points: true,
            orderIndex: true,
          },
        },
        attempts: {
          where: { userId },
          orderBy: { completedAt: 'desc' },
        },
      },
    });

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    res.json(quiz);
  } catch (error: any) {
    logger.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
}

/**
 * Submit a quiz attempt
 */
export async function submitQuizAttempt(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { quizId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = (req as any).user.userId;

    // Validate input
    if (!answers || typeof answers !== 'object') {
      res.status(400).json({ error: 'Answers are required' });
      return;
    }

    // Get quiz with questions
    const quiz = await prisma.lessonQuiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        attempts: {
          where: { userId },
        },
      },
    });

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    if (!quiz.isActive) {
      res.status(400).json({ error: 'Quiz is not active' });
      return;
    }

    // Check if retakes are allowed
    const previousAttempts = quiz.attempts.filter((a) => a.completedAt !== null);
    if (previousAttempts.length > 0 && !quiz.allowRetakes) {
      res.status(400).json({ error: 'Retakes are not allowed for this quiz' });
      return;
    }

    // Calculate score
    let correctCount = 0;
    let totalPoints = 0;
    const answersWithResults: any = {};

    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      totalPoints += question.points;

      let isCorrect = false;

      // Check answer based on question type
      switch (question.type) {
        case 'MULTIPLE_CHOICE':
        case 'TRUE_FALSE':
          isCorrect = userAnswer === question.correctAnswer;
          break;
        case 'SHORT_ANSWER':
        case 'FILL_IN_BLANK':
          // Case-insensitive comparison, trim whitespace
          const userAnswerNormalized = String(userAnswer || '')
            .trim()
            .toLowerCase();
          const correctAnswerNormalized = String(question.correctAnswer)
            .trim()
            .toLowerCase();
          isCorrect = userAnswerNormalized === correctAnswerNormalized;
          break;
      }

      if (isCorrect) {
        correctCount += question.points;
      }

      answersWithResults[question.id] = {
        answer: userAnswer,
        isCorrect,
        correctAnswer: quiz.showCorrectAnswers ? question.correctAnswer : null,
        explanation: quiz.showCorrectAnswers ? question.explanation : null,
      };
    });

    const score = totalPoints > 0 ? (correctCount / totalPoints) * 100 : 0;
    const passed = quiz.passingScore ? score >= quiz.passingScore : true;

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        answersJson: answersWithResults,
        score,
        passed,
        timeSpent,
        completedAt: new Date(),
      },
    });

    logger.info(`Quiz attempt submitted: ${attempt.id} by user ${userId}`);
    res.status(201).json(attempt);
  } catch (error: any) {
    logger.error('Error submitting quiz attempt:', error);
    res.status(500).json({ error: 'Failed to submit quiz attempt' });
  }
}

/**
 * Get current user's quiz attempts
 */
export async function getMyQuizAttempts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { quizId } = req.params;
    const userId = (req as any).user.userId;

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId,
        userId,
      },
      orderBy: { completedAt: 'desc' },
    });

    res.json(attempts);
  } catch (error: any) {
    logger.error('Error fetching user quiz attempts:', error);
    res.status(500).json({ error: 'Failed to fetch quiz attempts' });
  }
}

/**
 * Get quiz analytics (for teachers/admins)
 */
export async function getQuizAnalytics(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { quizId } = req.params;

    // Get quiz with all attempts
    const quiz = await prisma.lessonQuiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
        attempts: {
          where: { completedAt: { not: null } },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    const completedAttempts = quiz.attempts;

    // Calculate overall statistics
    const totalAttempts = completedAttempts.length;
    const averageScore =
      totalAttempts > 0
        ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
          totalAttempts
        : 0;
    const passRate =
      totalAttempts > 0
        ? (completedAttempts.filter((a) => a.passed).length / totalAttempts) * 100
        : 0;
    const averageTimeSpent =
      totalAttempts > 0
        ? completedAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) /
          totalAttempts
        : 0;

    // Calculate per-question statistics
    const questionStats = quiz.questions.map((question) => {
      const questionId = question.id;
      let correctCount = 0;

      completedAttempts.forEach((attempt) => {
        const answers = attempt.answersJson as any;
        if (answers[questionId]?.isCorrect) {
          correctCount++;
        }
      });

      return {
        questionId,
        questionText: question.questionText,
        type: question.type,
        correctCount,
        totalAttempts,
        correctPercentage:
          totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0,
      };
    });

    // Sort questions by difficulty (most missed first)
    questionStats.sort((a, b) => a.correctPercentage - b.correctPercentage);

    const analytics = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      totalAttempts,
      uniqueUsers: new Set(completedAttempts.map((a) => a.userId)).size,
      averageScore: Math.round(averageScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      averageTimeSpent: Math.round(averageTimeSpent),
      questionStats,
    };

    res.json(analytics);
  } catch (error: any) {
    logger.error('Error fetching quiz analytics:', error);
    res.status(500).json({ error: 'Failed to fetch quiz analytics' });
  }
}

/**
 * Get all attempts for a quiz (for teachers/admins)
 */
export async function getAllQuizAttempts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { quizId } = req.params;

    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    res.json(attempts);
  } catch (error: any) {
    logger.error('Error fetching all quiz attempts:', error);
    res.status(500).json({ error: 'Failed to fetch quiz attempts' });
  }
}
