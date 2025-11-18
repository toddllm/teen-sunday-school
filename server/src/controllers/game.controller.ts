import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Submit a character guess attempt
 * POST /api/games/character-guess/attempts
 */
export async function submitCharacterGuessAttempt(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      characterId,
      characterName,
      difficulty,
      hintsRevealed,
      isCorrect,
      attempts,
      timeSpentMs,
      mode,
      groupId,
      lessonId,
      organizationId,
    } = req.body;

    // Validate required fields
    if (!characterId || !characterName || hintsRevealed === undefined || isCorrect === undefined || attempts === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Get user ID from authenticated request (optional)
    const userId = (req as any).user?.userId || null;

    // Create attempt record
    const attempt = await prisma.characterGuessAttempt.create({
      data: {
        userId,
        organizationId,
        lessonId,
        characterId,
        characterName,
        difficulty: difficulty || 'medium',
        hintsRevealed,
        isCorrect,
        attempts,
        timeSpentMs,
        mode: mode || 'solo',
        groupId,
      },
    });

    // Update aggregated metrics
    await updateCharacterMetrics(
      characterId,
      characterName,
      organizationId,
      lessonId,
      isCorrect,
      hintsRevealed
    );

    res.status(201).json({
      data: attempt,
      message: 'Attempt recorded successfully',
    });
  } catch (error) {
    logger.error('Error submitting character guess attempt:', error);
    res.status(500).json({ error: 'Failed to record attempt' });
  }
}

/**
 * Get character guess metrics for a lesson
 * GET /api/games/character-guess/metrics?lessonId=xxx&organizationId=xxx
 */
export async function getCharacterGuessMetrics(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { lessonId, organizationId, characterId } = req.query;

    const where: any = {};
    if (lessonId) where.lessonId = lessonId as string;
    if (organizationId) where.organizationId = organizationId as string;
    if (characterId) where.characterId = characterId as string;

    const metrics = await prisma.characterGuessMetric.findMany({
      where,
      orderBy: {
        popularityScore: 'desc',
      },
    });

    res.json({ data: metrics });
  } catch (error) {
    logger.error('Error fetching character guess metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
}

/**
 * Get popular/favorite characters
 * GET /api/games/character-guess/popular?limit=10
 */
export async function getPopularCharacters(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const organizationId = req.query.organizationId as string;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;

    const popularCharacters = await prisma.characterGuessMetric.findMany({
      where,
      orderBy: [
        { popularityScore: 'desc' },
        { totalPlays: 'desc' },
      ],
      take: limit,
    });

    res.json({ data: popularCharacters });
  } catch (error) {
    logger.error('Error fetching popular characters:', error);
    res.status(500).json({ error: 'Failed to fetch popular characters' });
  }
}

/**
 * Get user's game history
 * GET /api/games/character-guess/history
 */
export async function getUserGameHistory(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;

    const history = await prisma.characterGuessAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Calculate user stats
    const stats = {
      totalGames: history.length,
      correctGuesses: history.filter((h) => h.isCorrect).length,
      successRate: history.length > 0
        ? (history.filter((h) => h.isCorrect).length / history.length) * 100
        : 0,
      avgHintsUsed: history.length > 0
        ? history.reduce((sum, h) => sum + h.hintsRevealed, 0) / history.length
        : 0,
    };

    res.json({ data: { history, stats } });
  } catch (error) {
    logger.error('Error fetching user game history:', error);
    res.status(500).json({ error: 'Failed to fetch game history' });
  }
}

/**
 * Helper function to update aggregated character metrics
 */
async function updateCharacterMetrics(
  characterId: string,
  characterName: string,
  organizationId: string | undefined,
  lessonId: string | undefined,
  isCorrect: boolean,
  hintsRevealed: number
): Promise<void> {
  try {
    // Find or create metric record
    const existing = await prisma.characterGuessMetric.findUnique({
      where: {
        characterId_organizationId_lessonId: {
          characterId,
          organizationId: organizationId || '',
          lessonId: lessonId || '',
        },
      },
    });

    if (existing) {
      // Update existing metrics
      const newTotalPlays = existing.totalPlays + 1;
      const newTotalCorrect = existing.totalCorrect + (isCorrect ? 1 : 0);
      const newTotalIncorrect = existing.totalIncorrect + (isCorrect ? 0 : 1);
      const newSuccessRate = (newTotalCorrect / newTotalPlays) * 100;

      // Calculate new average hints used
      const totalHints = (existing.avgHintsUsed * existing.totalPlays) + hintsRevealed;
      const newAvgHintsUsed = totalHints / newTotalPlays;

      // Calculate popularity score (weighted: plays * success rate)
      const newPopularityScore = newTotalPlays * (newSuccessRate / 100);

      await prisma.characterGuessMetric.update({
        where: {
          characterId_organizationId_lessonId: {
            characterId,
            organizationId: organizationId || '',
            lessonId: lessonId || '',
          },
        },
        data: {
          totalPlays: newTotalPlays,
          totalCorrect: newTotalCorrect,
          totalIncorrect: newTotalIncorrect,
          successRate: newSuccessRate,
          avgHintsUsed: newAvgHintsUsed,
          popularityScore: newPopularityScore,
          lastPlayedAt: new Date(),
        },
      });
    } else {
      // Create new metric record
      const successRate = isCorrect ? 100 : 0;
      const popularityScore = isCorrect ? 1 : 0;

      await prisma.characterGuessMetric.create({
        data: {
          characterId,
          characterName,
          organizationId,
          lessonId,
          totalPlays: 1,
          totalCorrect: isCorrect ? 1 : 0,
          totalIncorrect: isCorrect ? 0 : 1,
          successRate,
          avgHintsUsed: hintsRevealed,
          popularityScore,
          lastPlayedAt: new Date(),
        },
      });
    }
  } catch (error) {
    logger.error('Error updating character metrics:', error);
    // Don't throw - we don't want to fail the attempt submission if metrics fail
  }
}
