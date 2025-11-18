import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Tagging Taxonomy Manager Controller
 * Manages topic and theme tags for organizing content
 */

/**
 * Helper function to generate URL-friendly slug from tag name
 */
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * GET /api/taxonomy
 * List all tags (public + org-specific)
 */
export const listTags = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { parentId, search } = req.query;

    const where: any = {
      OR: [
        { organizationId, isPublic: false }, // Org-specific tags
        { isPublic: true }, // Public tags
      ],
    };

    // Filter by parent tag (for hierarchical browsing)
    if (parentId === 'null' || parentId === '') {
      where.parentTagId = null;
    } else if (parentId) {
      where.parentTagId = parentId as string;
    }

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const tags = await prisma.tag.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
      include: {
        parentTag: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        childTags: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            taggedLessons: true,
            childTags: true,
          },
        },
      },
    });

    res.json(tags);
  } catch (error) {
    logger.error('Error listing tags:', error);
    res.status(500).json({ error: 'Failed to list tags' });
  }
};

/**
 * GET /api/taxonomy/search
 * Search tags by name or description
 */
export const searchTags = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const tags = await prisma.tag.findMany({
      where: {
        OR: [
          { organizationId, isPublic: false },
          { isPublic: true },
        ],
        AND: {
          OR: [
            { name: { contains: q as string, mode: 'insensitive' } },
            { description: { contains: q as string, mode: 'insensitive' } },
            { slug: { contains: q as string, mode: 'insensitive' } },
          ],
        },
      },
      orderBy: { name: 'asc' },
      take: Number(limit),
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        icon: true,
        parentTag: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            taggedLessons: true,
          },
        },
      },
    });

    res.json(tags);
  } catch (error) {
    logger.error('Error searching tags:', error);
    res.status(500).json({ error: 'Failed to search tags' });
  }
};

/**
 * GET /api/taxonomy/hierarchy
 * Get full taxonomy hierarchy as a tree structure
 */
export const getTaxonomyHierarchy = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;

    // Get all tags accessible to the user
    const allTags = await prisma.tag.findMany({
      where: {
        OR: [
          { organizationId, isPublic: false },
          { isPublic: true },
        ],
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
      include: {
        _count: {
          select: {
            taggedLessons: true,
            childTags: true,
          },
        },
      },
    });

    // Build tree structure (only root tags)
    const rootTags = allTags.filter((tag) => !tag.parentTagId);

    // Helper function to recursively build tree
    const buildTree = (parentId: string | null): any[] => {
      return allTags
        .filter((tag) => tag.parentTagId === parentId)
        .map((tag) => ({
          ...tag,
          children: buildTree(tag.id),
        }));
    };

    const hierarchy = rootTags.map((tag) => ({
      ...tag,
      children: buildTree(tag.id),
    }));

    res.json(hierarchy);
  } catch (error) {
    logger.error('Error fetching taxonomy hierarchy:', error);
    res.status(500).json({ error: 'Failed to fetch taxonomy hierarchy' });
  }
};

/**
 * GET /api/taxonomy/:id
 * Get a specific tag with full details
 */
export const getTag = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    const tag = await prisma.tag.findFirst({
      where: {
        id,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
      include: {
        parentTag: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        childTags: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
        _count: {
          select: {
            taggedLessons: true,
            childTags: true,
          },
        },
      },
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(tag);
  } catch (error) {
    logger.error('Error fetching tag:', error);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
};

/**
 * POST /api/taxonomy
 * Create a new tag (admin only)
 */
export const createTag = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const {
      name,
      slug,
      description,
      color,
      icon,
      parentTagId,
      isPublic,
      order,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(name);

    // Check if slug already exists in this org
    const existing = await prisma.tag.findFirst({
      where: {
        organizationId,
        slug: finalSlug,
      },
    });

    if (existing) {
      return res.status(400).json({
        error: 'A tag with this slug already exists in your organization',
      });
    }

    // If parentTagId is provided, verify it exists and belongs to the org
    if (parentTagId) {
      const parentTag = await prisma.tag.findFirst({
        where: {
          id: parentTagId,
          OR: [
            { organizationId },
            { isPublic: true },
          ],
        },
      });

      if (!parentTag) {
        return res.status(400).json({ error: 'Parent tag not found' });
      }
    }

    const tag = await prisma.tag.create({
      data: {
        organizationId,
        name,
        slug: finalSlug,
        description,
        color,
        icon,
        parentTagId: parentTagId || null,
        isPublic: isPublic || false,
        order: order || 0,
        createdBy: userId,
      },
      include: {
        parentTag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`Tag created: ${tag.id} (${tag.name}) by user ${userId}`);
    res.status(201).json(tag);
  } catch (error) {
    logger.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
};

/**
 * PATCH /api/taxonomy/:id
 * Update a tag (admin only)
 */
export const updateTag = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      color,
      icon,
      parentTagId,
      isPublic,
      order,
    } = req.body;

    // Check if tag exists and belongs to org
    const existing = await prisma.tag.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Tag not found or does not belong to your organization',
      });
    }

    // If updating slug, check for conflicts
    if (slug && slug !== existing.slug) {
      const conflicting = await prisma.tag.findFirst({
        where: {
          organizationId,
          slug,
          id: { not: id },
        },
      });

      if (conflicting) {
        return res.status(400).json({
          error: 'A tag with this slug already exists',
        });
      }
    }

    // Prevent circular parent relationships
    if (parentTagId) {
      // Check if the new parent is a descendant of this tag
      let currentParentId = parentTagId;
      while (currentParentId) {
        if (currentParentId === id) {
          return res.status(400).json({
            error: 'Cannot create circular parent-child relationships',
          });
        }
        const parent = await prisma.tag.findUnique({
          where: { id: currentParentId },
          select: { parentTagId: true },
        });
        currentParentId = parent?.parentTagId || null;
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        color,
        icon,
        parentTagId: parentTagId === null ? null : parentTagId,
        isPublic,
        order,
      },
      include: {
        parentTag: {
          select: {
            id: true,
            name: true,
          },
        },
        childTags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`Tag updated: ${tag.id}`);
    res.json(tag);
  } catch (error) {
    logger.error('Error updating tag:', error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
};

/**
 * DELETE /api/taxonomy/:id
 * Delete a tag (admin only)
 */
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    // Check if tag exists and belongs to org
    const existing = await prisma.tag.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: {
            childTags: true,
            taggedLessons: true,
          },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Tag not found or does not belong to your organization',
      });
    }

    // Check if tag has children (optional: you might want to cascade)
    if (existing._count.childTags > 0) {
      return res.status(400).json({
        error: `Cannot delete tag with ${existing._count.childTags} child tags. Please delete or reassign child tags first.`,
      });
    }

    await prisma.tag.delete({
      where: { id },
    });

    logger.info(`Tag deleted: ${id} (had ${existing._count.taggedLessons} associations)`);
    res.json({
      success: true,
      message: 'Tag deleted successfully',
      associationsRemoved: existing._count.taggedLessons,
    });
  } catch (error) {
    logger.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
};

/**
 * POST /api/taxonomy/:id/lesson/:lessonId
 * Add tag to a lesson (admin only)
 */
export const addTagToLesson = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const { id: tagId, lessonId } = req.params;

    // Verify tag exists and is accessible
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Verify lesson exists and belongs to org
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        organizationId,
      },
    });

    if (!lesson) {
      return res.status(404).json({
        error: 'Lesson not found or does not belong to your organization',
      });
    }

    // Create association (will fail if already exists due to unique constraint)
    const association = await prisma.tagAssociation.create({
      data: {
        tagId,
        lessonId,
        createdBy: userId,
      },
    });

    // Update tag metrics
    await prisma.tagMetric.upsert({
      where: {
        tagId_organizationId: {
          tagId,
          organizationId,
        },
      },
      update: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
        featureContext: 'lesson_tagging',
      },
      create: {
        tagId,
        organizationId,
        usageCount: 1,
        featureContext: 'lesson_tagging',
      },
    });

    logger.info(`Tag ${tagId} added to lesson ${lessonId}`);
    res.status(201).json(association);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Tag already associated with this lesson' });
    }
    logger.error('Error adding tag to lesson:', error);
    res.status(500).json({ error: 'Failed to add tag to lesson' });
  }
};

/**
 * DELETE /api/taxonomy/:id/lesson/:lessonId
 * Remove tag from a lesson (admin only)
 */
export const removeTagFromLesson = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id: tagId, lessonId } = req.params;

    // Verify lesson belongs to org
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        organizationId,
      },
    });

    if (!lesson) {
      return res.status(404).json({
        error: 'Lesson not found or does not belong to your organization',
      });
    }

    // Delete association
    await prisma.tagAssociation.deleteMany({
      where: {
        tagId,
        lessonId,
      },
    });

    logger.info(`Tag ${tagId} removed from lesson ${lessonId}`);
    res.json({ success: true, message: 'Tag removed from lesson' });
  } catch (error) {
    logger.error('Error removing tag from lesson:', error);
    res.status(500).json({ error: 'Failed to remove tag from lesson' });
  }
};

/**
 * POST /api/taxonomy/:id/theme/:themeId
 * Add tag to a theme (admin only)
 */
export const addTagToTheme = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const { id: tagId, themeId } = req.params;

    // Verify tag exists and is accessible
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Verify theme exists and belongs to org
    const theme = await prisma.comparativeTheme.findFirst({
      where: {
        id: themeId,
        organizationId,
      },
    });

    if (!theme) {
      return res.status(404).json({
        error: 'Theme not found or does not belong to your organization',
      });
    }

    // Create association
    const association = await prisma.tagAssociation.create({
      data: {
        tagId,
        themeId,
        createdBy: userId,
      },
    });

    // Update tag metrics
    await prisma.tagMetric.upsert({
      where: {
        tagId_organizationId: {
          tagId,
          organizationId,
        },
      },
      update: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
        featureContext: 'theme_tagging',
      },
      create: {
        tagId,
        organizationId,
        usageCount: 1,
        featureContext: 'theme_tagging',
      },
    });

    logger.info(`Tag ${tagId} added to theme ${themeId}`);
    res.status(201).json(association);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Tag already associated with this theme' });
    }
    logger.error('Error adding tag to theme:', error);
    res.status(500).json({ error: 'Failed to add tag to theme' });
  }
};

/**
 * DELETE /api/taxonomy/:id/theme/:themeId
 * Remove tag from a theme (admin only)
 */
export const removeTagFromTheme = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id: tagId, themeId } = req.params;

    // Verify theme belongs to org
    const theme = await prisma.comparativeTheme.findFirst({
      where: {
        id: themeId,
        organizationId,
      },
    });

    if (!theme) {
      return res.status(404).json({
        error: 'Theme not found or does not belong to your organization',
      });
    }

    // Delete association
    await prisma.tagAssociation.deleteMany({
      where: {
        tagId,
        themeId,
      },
    });

    logger.info(`Tag ${tagId} removed from theme ${themeId}`);
    res.json({ success: true, message: 'Tag removed from theme' });
  } catch (error) {
    logger.error('Error removing tag from theme:', error);
    res.status(500).json({ error: 'Failed to remove tag from theme' });
  }
};

/**
 * GET /api/taxonomy/lesson/:lessonId
 * Get all tags for a specific lesson
 */
export const getLessonTags = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { lessonId } = req.params;

    // Verify lesson exists and is accessible
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const associations = await prisma.tagAssociation.findMany({
      where: { lessonId },
      include: {
        tag: {
          include: {
            parentTag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        tag: {
          order: 'asc',
        },
      },
    });

    const tags = associations.map((a) => a.tag);
    res.json(tags);
  } catch (error) {
    logger.error('Error fetching lesson tags:', error);
    res.status(500).json({ error: 'Failed to fetch lesson tags' });
  }
};

/**
 * GET /api/taxonomy/theme/:themeId
 * Get all tags for a specific theme
 */
export const getThemeTags = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { themeId } = req.params;

    // Verify theme exists and is accessible
    const theme = await prisma.comparativeTheme.findFirst({
      where: {
        id: themeId,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
    });

    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    const associations = await prisma.tagAssociation.findMany({
      where: { themeId },
      include: {
        tag: {
          include: {
            parentTag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        tag: {
          order: 'asc',
        },
      },
    });

    const tags = associations.map((a) => a.tag);
    res.json(tags);
  } catch (error) {
    logger.error('Error fetching theme tags:', error);
    res.status(500).json({ error: 'Failed to fetch theme tags' });
  }
};

/**
 * GET /api/taxonomy/:id/metrics
 * Get metrics for a specific tag (admin only)
 */
export const getTagMetrics = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id: tagId } = req.params;

    // Verify tag belongs to org
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, organizationId },
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    const metric = await prisma.tagMetric.findUnique({
      where: {
        tagId_organizationId: {
          tagId,
          organizationId,
        },
      },
    });

    // Get association counts
    const associations = await prisma.tagAssociation.groupBy({
      by: ['tagId'],
      where: { tagId },
      _count: {
        id: true,
      },
    });

    res.json({
      metric: metric || {
        usageCount: 0,
        searchCount: 0,
        lastUsedAt: null,
        lastSearchedAt: null,
      },
      totalAssociations: associations[0]?._count.id || 0,
    });
  } catch (error) {
    logger.error('Error fetching tag metrics:', error);
    res.status(500).json({ error: 'Failed to fetch tag metrics' });
  }
};

/**
 * GET /api/taxonomy/admin/metrics/summary
 * Get aggregated metrics across all tags (admin only)
 */
export const getTagMetricsSummary = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;

    // Get all tags for the org
    const tags = await prisma.tag.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: {
            taggedLessons: true,
            childTags: true,
          },
        },
      },
    });

    // Get metrics for all tags
    const metrics = await prisma.tagMetric.findMany({
      where: { organizationId },
    });

    // Combine data
    const summary = tags.map((tag) => {
      const metric = metrics.find((m) => m.tagId === tag.id);
      return {
        tagId: tag.id,
        tagName: tag.name,
        slug: tag.slug,
        color: tag.color,
        usageCount: metric?.usageCount || 0,
        searchCount: metric?.searchCount || 0,
        lastUsedAt: metric?.lastUsedAt,
        totalAssociations: tag._count.taggedLessons,
        childTagCount: tag._count.childTags,
      };
    });

    // Sort by usage count
    summary.sort((a, b) => b.usageCount - a.usageCount);

    res.json({
      summary,
      totalTags: tags.length,
      totalAssociations: summary.reduce((sum, t) => sum + t.totalAssociations, 0),
      totalUsage: summary.reduce((sum, t) => sum + t.usageCount, 0),
    });
  } catch (error) {
    logger.error('Error fetching tag metrics summary:', error);
    res.status(500).json({ error: 'Failed to fetch metrics summary' });
  }
};
