import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * List all icebreakers for an organization
 */
export async function listIcebreakers(req: Request, res: Response): Promise<void> {
  try {
    const { orgId } = req.params;
    const { category, ageGroup, groupSize, energyLevel, isPublic } = req.query;

    // Build where clause
    const where: any = {
      organizationId: orgId,
    };

    if (category) where.category = category;
    if (ageGroup) where.ageGroup = ageGroup;
    if (groupSize) where.groupSize = groupSize;
    if (energyLevel) where.energyLevel = energyLevel;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';

    const icebreakers = await prisma.icebreaker.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ icebreakers });
  } catch (error) {
    logger.error('Error listing icebreakers:', error);
    res.status(500).json({ error: 'Failed to list icebreakers' });
  }
}

/**
 * Get a single icebreaker by ID
 */
export async function getIcebreaker(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const icebreaker = await prisma.icebreaker.findUnique({
      where: { id },
    });

    if (!icebreaker) {
      res.status(404).json({ error: 'Icebreaker not found' });
      return;
    }

    res.json({ icebreaker });
  } catch (error) {
    logger.error('Error getting icebreaker:', error);
    res.status(500).json({ error: 'Failed to get icebreaker' });
  }
}

/**
 * Get a random icebreaker based on filters
 */
export async function getRandomIcebreaker(req: Request, res: Response): Promise<void> {
  try {
    const { orgId } = req.params;
    const { category, ageGroup, groupSize, energyLevel } = req.query;

    // Build where clause
    const where: any = {
      organizationId: orgId,
    };

    if (category) where.category = category;
    if (ageGroup) where.ageGroup = ageGroup;
    if (groupSize) where.groupSize = groupSize;
    if (energyLevel) where.energyLevel = energyLevel;

    // Get all matching icebreakers
    const icebreakers = await prisma.icebreaker.findMany({
      where,
    });

    if (icebreakers.length === 0) {
      res.status(404).json({ error: 'No icebreakers found matching criteria' });
      return;
    }

    // Select a random one
    const randomIndex = Math.floor(Math.random() * icebreakers.length);
    const icebreaker = icebreakers[randomIndex];

    res.json({ icebreaker });
  } catch (error) {
    logger.error('Error getting random icebreaker:', error);
    res.status(500).json({ error: 'Failed to get random icebreaker' });
  }
}

/**
 * Create a new icebreaker
 */
export async function createIcebreaker(req: Request, res: Response): Promise<void> {
  try {
    const { orgId } = req.params;
    const {
      title,
      description,
      instructions,
      category,
      ageGroup,
      groupSize,
      energyLevel,
      durationMinutes,
      materialsNeeded,
      questions,
      isPublic,
      isTemplate,
      tags,
    } = req.body;

    // Validate required fields
    if (!title || !category || !ageGroup || !groupSize || !energyLevel || !durationMinutes) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const icebreaker = await prisma.icebreaker.create({
      data: {
        organizationId: orgId,
        title,
        description,
        instructions,
        category,
        ageGroup,
        groupSize,
        energyLevel,
        durationMinutes: parseInt(durationMinutes),
        materialsNeeded,
        questions,
        isPublic: isPublic || false,
        isTemplate: isTemplate || false,
        tags,
        createdBy: req.user?.userId,
      },
    });

    res.status(201).json({ icebreaker });
  } catch (error) {
    logger.error('Error creating icebreaker:', error);
    res.status(500).json({ error: 'Failed to create icebreaker' });
  }
}

/**
 * Update an icebreaker
 */
export async function updateIcebreaker(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      instructions,
      category,
      ageGroup,
      groupSize,
      energyLevel,
      durationMinutes,
      materialsNeeded,
      questions,
      isPublic,
      isTemplate,
      tags,
    } = req.body;

    // Check if icebreaker exists
    const existing = await prisma.icebreaker.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Icebreaker not found' });
      return;
    }

    const icebreaker = await prisma.icebreaker.update({
      where: { id },
      data: {
        title,
        description,
        instructions,
        category,
        ageGroup,
        groupSize,
        energyLevel,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
        materialsNeeded,
        questions,
        isPublic,
        isTemplate,
        tags,
      },
    });

    res.json({ icebreaker });
  } catch (error) {
    logger.error('Error updating icebreaker:', error);
    res.status(500).json({ error: 'Failed to update icebreaker' });
  }
}

/**
 * Delete an icebreaker
 */
export async function deleteIcebreaker(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Check if icebreaker exists
    const existing = await prisma.icebreaker.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Icebreaker not found' });
      return;
    }

    await prisma.icebreaker.delete({
      where: { id },
    });

    res.json({ message: 'Icebreaker deleted successfully' });
  } catch (error) {
    logger.error('Error deleting icebreaker:', error);
    res.status(500).json({ error: 'Failed to delete icebreaker' });
  }
}

/**
 * Duplicate an icebreaker
 */
export async function duplicateIcebreaker(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { orgId } = req.body;

    // Get original icebreaker
    const original = await prisma.icebreaker.findUnique({
      where: { id },
    });

    if (!original) {
      res.status(404).json({ error: 'Icebreaker not found' });
      return;
    }

    // Create duplicate
    const duplicate = await prisma.icebreaker.create({
      data: {
        organizationId: orgId || original.organizationId,
        title: `${original.title} (Copy)`,
        description: original.description,
        instructions: original.instructions,
        category: original.category,
        ageGroup: original.ageGroup,
        groupSize: original.groupSize,
        energyLevel: original.energyLevel,
        durationMinutes: original.durationMinutes,
        materialsNeeded: original.materialsNeeded,
        questions: original.questions,
        isPublic: false, // Always make copies private by default
        isTemplate: false,
        tags: original.tags,
        createdBy: req.user?.userId,
      },
    });

    res.status(201).json({ icebreaker: duplicate });
  } catch (error) {
    logger.error('Error duplicating icebreaker:', error);
    res.status(500).json({ error: 'Failed to duplicate icebreaker' });
  }
}

/**
 * Track icebreaker usage
 */
export async function trackUsage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { lessonId, groupId } = req.body;

    // Increment usage count
    await prisma.icebreaker.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
      },
    });

    // Create usage record
    await prisma.icebreakerUsage.create({
      data: {
        icebreakerId: id,
        userId: req.user?.userId,
        lessonId,
        groupId,
      },
    });

    res.json({ message: 'Usage tracked successfully' });
  } catch (error) {
    logger.error('Error tracking usage:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check if already favorited
    const existing = await prisma.icebreakerFavorite.findUnique({
      where: {
        icebreakerId_userId: {
          icebreakerId: id,
          userId,
        },
      },
    });

    if (existing) {
      // Remove favorite
      await prisma.icebreakerFavorite.delete({
        where: {
          icebreakerId_userId: {
            icebreakerId: id,
            userId,
          },
        },
      });

      // Decrement count
      await prisma.icebreaker.update({
        where: { id },
        data: {
          favoriteCount: { decrement: 1 },
        },
      });

      res.json({ favorited: false });
    } else {
      // Add favorite
      await prisma.icebreakerFavorite.create({
        data: {
          icebreakerId: id,
          userId,
        },
      });

      // Increment count
      await prisma.icebreaker.update({
        where: { id },
        data: {
          favoriteCount: { increment: 1 },
        },
      });

      res.json({ favorited: true });
    }
  } catch (error) {
    logger.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
}

/**
 * Get user's favorites
 */
export async function getFavorites(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const favorites = await prisma.icebreakerFavorite.findMany({
      where: { userId },
      include: {
        icebreaker: true,
      },
    });

    const icebreakers = favorites.map((f: any) => f.icebreaker);

    res.json({ icebreakers });
  } catch (error) {
    logger.error('Error getting favorites:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
}
