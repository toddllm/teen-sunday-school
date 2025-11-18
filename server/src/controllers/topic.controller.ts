import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * List all topics
 * Query params:
 * - category: Filter by category
 * - search: Search by name or tags
 * - includeOrgTopics: Include organization-specific topics (default: true)
 */
export async function listTopics(req: Request, res: Response): Promise<void> {
  try {
    const { category, search, includeOrgTopics = 'true' } = req.query;
    const user = (req as any).user;

    // Build where clause
    const where: any = {
      isActive: true,
      OR: [
        { isGlobal: true },
      ],
    };

    // Include organization-specific topics if requested and user has org
    if (includeOrgTopics === 'true' && user?.organizationId) {
      where.OR.push({ organizationId: user.organizationId });
    }

    // Filter by category
    if (category && typeof category === 'string') {
      where.category = category;
    }

    // Search by name or tags
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const topics = await prisma.topic.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        tags: true,
        popularityRank: true,
        isGlobal: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            verses: true,
            views: true,
          },
        },
      },
      orderBy: [
        { popularityRank: 'desc' },
        { name: 'asc' },
      ],
    });

    res.json({ topics });
  } catch (error) {
    logger.error('Error listing topics:', error);
    res.status(500).json({ error: 'Failed to list topics' });
  }
}

/**
 * Get topic details by ID
 */
export async function getTopic(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        verses: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            views: true,
          },
        },
      },
    });

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    // Check if user has access to this topic
    if (!topic.isGlobal && topic.organizationId !== user?.organizationId) {
      res.status(403).json({ error: 'Access denied to this topic' });
      return;
    }

    // Track view (if user is authenticated)
    if (user?.id) {
      await prisma.topicView.create({
        data: {
          topicId: id,
          userId: user.id,
        },
      }).catch((err) => {
        logger.warn('Failed to track topic view:', err);
      });
    }

    res.json({ topic });
  } catch (error) {
    logger.error('Error getting topic:', error);
    res.status(500).json({ error: 'Failed to get topic' });
  }
}

/**
 * Get all unique categories
 */
export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;

    // Build where clause to include global and org topics
    const where: any = {
      isActive: true,
      OR: [
        { isGlobal: true },
      ],
    };

    if (user?.organizationId) {
      where.OR.push({ organizationId: user.organizationId });
    }

    const topics = await prisma.topic.findMany({
      where,
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    const categories = topics
      .map(t => t.category)
      .filter((c): c is string => c !== null)
      .sort();

    res.json({ categories });
  } catch (error) {
    logger.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
}

/**
 * Create a new topic (Admin only)
 */
export async function createTopic(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      description,
      category,
      tags,
      popularityRank,
      isGlobal,
      verses,
    } = req.body;
    const user = (req as any).user;

    // Validate input
    if (!name) {
      res.status(400).json({ error: 'Topic name is required' });
      return;
    }

    // Determine organizationId
    const organizationId = isGlobal ? null : user.organizationId;

    // Create topic with verses
    const topic = await prisma.topic.create({
      data: {
        name,
        description,
        category,
        tags: tags || [],
        popularityRank: popularityRank || 0,
        isGlobal: isGlobal || false,
        organizationId,
        createdBy: user.id,
        verses: {
          create: verses?.map((v: any, index: number) => ({
            verseRef: v.verseRef,
            note: v.note,
            sortOrder: v.sortOrder ?? index,
          })) || [],
        },
      },
      include: {
        verses: true,
      },
    });

    res.status(201).json({ topic });
  } catch (error) {
    logger.error('Error creating topic:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
}

/**
 * Update a topic (Admin only)
 */
export async function updateTopic(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      tags,
      popularityRank,
      isActive,
    } = req.body;

    const topic = await prisma.topic.update({
      where: { id },
      data: {
        name,
        description,
        category,
        tags,
        popularityRank,
        isActive,
      },
      include: {
        verses: true,
      },
    });

    res.json({ topic });
  } catch (error) {
    logger.error('Error updating topic:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
}

/**
 * Delete a topic (Admin only)
 */
export async function deleteTopic(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await prisma.topic.delete({
      where: { id },
    });

    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    logger.error('Error deleting topic:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
}

/**
 * Add a verse to a topic (Admin only)
 */
export async function addVerse(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { verseRef, note, sortOrder } = req.body;

    if (!verseRef) {
      res.status(400).json({ error: 'Verse reference is required' });
      return;
    }

    const verse = await prisma.topicVerse.create({
      data: {
        topicId: id,
        verseRef,
        note,
        sortOrder: sortOrder ?? 0,
      },
    });

    res.status(201).json({ verse });
  } catch (error) {
    logger.error('Error adding verse:', error);
    res.status(500).json({ error: 'Failed to add verse' });
  }
}

/**
 * Update a verse (Admin only)
 */
export async function updateVerse(req: Request, res: Response): Promise<void> {
  try {
    const { verseId } = req.params;
    const { verseRef, note, sortOrder } = req.body;

    const verse = await prisma.topicVerse.update({
      where: { id: verseId },
      data: {
        verseRef,
        note,
        sortOrder,
      },
    });

    res.json({ verse });
  } catch (error) {
    logger.error('Error updating verse:', error);
    res.status(500).json({ error: 'Failed to update verse' });
  }
}

/**
 * Delete a verse (Admin only)
 */
export async function deleteVerse(req: Request, res: Response): Promise<void> {
  try {
    const { verseId } = req.params;

    await prisma.topicVerse.delete({
      where: { id: verseId },
    });

    res.json({ message: 'Verse deleted successfully' });
  } catch (error) {
    logger.error('Error deleting verse:', error);
    res.status(500).json({ error: 'Failed to delete verse' });
  }
}

/**
 * Track when a user starts a reading plan from a topic
 */
export async function trackPlanStart(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user?.id) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Find the most recent view for this user and topic
    const recentView = await prisma.topicView.findFirst({
      where: {
        topicId: id,
        userId: user.id,
      },
      orderBy: {
        viewedAt: 'desc',
      },
    });

    if (recentView && !recentView.startedPlan) {
      // Update the view to mark that a plan was started
      await prisma.topicView.update({
        where: { id: recentView.id },
        data: { startedPlan: true },
      });
    }

    res.json({ message: 'Plan start tracked successfully' });
  } catch (error) {
    logger.error('Error tracking plan start:', error);
    res.status(500).json({ error: 'Failed to track plan start' });
  }
}

/**
 * Get topic metrics (Admin only)
 */
export async function getTopicMetrics(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const [viewCount, planStartCount, recentViews] = await Promise.all([
      prisma.topicView.count({
        where: { topicId: id },
      }),
      prisma.topicView.count({
        where: {
          topicId: id,
          startedPlan: true,
        },
      }),
      prisma.topicView.findMany({
        where: { topicId: id },
        orderBy: { viewedAt: 'desc' },
        take: 50,
        select: {
          viewedAt: true,
          startedPlan: true,
        },
      }),
    ]);

    res.json({
      metrics: {
        viewCount,
        planStartCount,
        conversionRate: viewCount > 0 ? (planStartCount / viewCount) * 100 : 0,
        recentViews,
      },
    });
  } catch (error) {
    logger.error('Error getting topic metrics:', error);
    res.status(500).json({ error: 'Failed to get topic metrics' });
  }
}
