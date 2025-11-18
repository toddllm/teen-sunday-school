import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Get a random question for the game
 * Query params:
 * - scope: optional filter by book name
 * - difficulty: optional filter by difficulty (easy, medium, hard)
 * - limit: number of questions to return (default: 1)
 */
export async function getQuestions(req: Request, res: Response): Promise<void> {
  try {
    const { scope, difficulty, limit = '1' } = req.query;
    const questionLimit = Math.min(parseInt(limit as string, 10) || 1, 10);

    // Build where clause
    const where: any = { isActive: true };

    if (scope && scope !== 'random') {
      where.book = scope;
    }

    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty;
    }

    // Get total count for random selection
    const totalCount = await prisma.guessReferenceQuestion.count({ where });

    if (totalCount === 0) {
      res.status(404).json({ error: 'No questions found matching criteria' });
      return;
    }

    // Get random questions by skipping random amount
    const questions = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < Math.min(questionLimit, totalCount); i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * totalCount);
      } while (usedIndices.has(randomIndex));

      usedIndices.add(randomIndex);

      const question = await prisma.guessReferenceQuestion.findMany({
        where,
        skip: randomIndex,
        take: 1,
        select: {
          id: true,
          displayText: true,
          correctAnswer: true,
          distractorRefs: true,
          book: true,
          difficulty: true,
        },
      });

      if (question.length > 0) {
        // Shuffle the answer options
        const options = [
          question[0].correctAnswer,
          ...(question[0].distractorRefs as string[]),
        ];

        // Fisher-Yates shuffle
        for (let j = options.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [options[j], options[k]] = [options[k], options[j]];
        }

        questions.push({
          id: question[0].id,
          displayText: question[0].displayText,
          options,
          book: question[0].book,
          difficulty: question[0].difficulty,
        });
      }
    }

    res.json({ questions });
  } catch (error) {
    logger.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
}

/**
 * Submit an attempt and get feedback
 * Body:
 * - questionId: the question ID
 * - selectedAnswer: the reference the user selected
 * - timeToAnswerMs: optional time taken
 * - gameMode: optional game mode (e.g., "random", "book:John")
 * - roundNumber: optional round number in session
 * - sessionId: optional session ID for anonymous users
 */
export async function submitAttempt(req: Request, res: Response): Promise<void> {
  try {
    const {
      questionId,
      selectedAnswer,
      timeToAnswerMs,
      gameMode,
      roundNumber,
      sessionId,
    } = req.body;

    // Validate input
    if (!questionId || !selectedAnswer) {
      res.status(400).json({ error: 'questionId and selectedAnswer are required' });
      return;
    }

    // Get the question
    const question = await prisma.guessReferenceQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    // Check if answer is correct
    const isCorrect = selectedAnswer === question.correctAnswer;

    // Save attempt
    const attempt = await prisma.guessReferenceAttempt.create({
      data: {
        questionId,
        userId: req.user?.userId || null,
        sessionId: sessionId || null,
        selectedAnswer,
        isCorrect,
        timeToAnswerMs: timeToAnswerMs || null,
        gameMode: gameMode || null,
        roundNumber: roundNumber || null,
      },
    });

    // Return result with correct answer and verse reference
    res.json({
      attemptId: attempt.id,
      isCorrect,
      correctAnswer: question.correctAnswer,
      verseReference: question.verseReference,
      explanation: isCorrect
        ? 'Correct! Great job!'
        : `Not quite. The correct answer is ${question.correctAnswer}`,
    });
  } catch (error) {
    logger.error('Submit attempt error:', error);
    res.status(500).json({ error: 'Failed to submit attempt' });
  }
}

/**
 * Get game statistics for the current user or session
 * Query params:
 * - sessionId: optional session ID for anonymous users
 * - gameMode: optional filter by game mode
 */
export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId, gameMode } = req.query;
    const userId = req.user?.userId;

    if (!userId && !sessionId) {
      res.status(400).json({ error: 'User must be logged in or provide sessionId' });
      return;
    }

    // Build where clause
    const where: any = {};

    if (userId) {
      where.userId = userId;
    } else if (sessionId) {
      where.sessionId = sessionId;
    }

    if (gameMode) {
      where.gameMode = gameMode;
    }

    // Get all attempts
    const attempts = await prisma.guessReferenceAttempt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        question: {
          select: {
            book: true,
            difficulty: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a) => a.isCorrect).length;
    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    // Calculate average time to answer
    const attemptsWithTime = attempts.filter((a) => a.timeToAnswerMs !== null);
    const avgTimeMs =
      attemptsWithTime.length > 0
        ? attemptsWithTime.reduce((sum, a) => sum + (a.timeToAnswerMs || 0), 0) /
          attemptsWithTime.length
        : null;

    // Calculate current streak
    let currentStreak = 0;
    for (const attempt of attempts) {
      if (attempt.isCorrect) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate best streak
    let bestStreak = 0;
    let tempStreak = 0;
    for (const attempt of attempts.reverse()) {
      if (attempt.isCorrect) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Book statistics
    const bookStats: { [key: string]: { total: number; correct: number } } = {};
    attempts.forEach((attempt) => {
      const book = attempt.question.book || 'Unknown';
      if (!bookStats[book]) {
        bookStats[book] = { total: 0, correct: 0 };
      }
      bookStats[book].total++;
      if (attempt.isCorrect) {
        bookStats[book].correct++;
      }
    });

    res.json({
      totalAttempts,
      correctAttempts,
      accuracy: Math.round(accuracy * 10) / 10,
      currentStreak,
      bestStreak,
      avgTimeMs: avgTimeMs ? Math.round(avgTimeMs) : null,
      bookStats,
      recentAttempts: attempts.slice(0, 10).map((a) => ({
        id: a.id,
        isCorrect: a.isCorrect,
        selectedAnswer: a.selectedAnswer,
        book: a.question.book,
        difficulty: a.question.difficulty,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
}

/**
 * Get available books for filtering
 */
export async function getAvailableBooks(req: Request, res: Response): Promise<void> {
  try {
    const books = await prisma.guessReferenceQuestion.findMany({
      where: { isActive: true },
      select: { book: true },
      distinct: ['book'],
    });

    const bookList = books
      .map((b) => b.book)
      .filter((book) => book !== null)
      .sort();

    res.json({ books: bookList });
  } catch (error) {
    logger.error('Get available books error:', error);
    res.status(500).json({ error: 'Failed to get available books' });
  }
}
