import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Get all templates for an organization
 */
export async function getTemplates(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const templates = await prisma.lessonTemplate.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { usageMetrics: true },
        },
      },
    });

    res.json(templates);
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
}

/**
 * Get a single template by ID
 */
export async function getTemplate(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const template = await prisma.lessonTemplate.findFirst({
      where: {
        id,
        organizationId,
        isActive: true,
      },
      include: {
        _count: {
          select: { usageMetrics: true },
        },
      },
    });

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.json(template);
  } catch (error) {
    logger.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
}

/**
 * Create a new template (admin only)
 */
export async function createTemplate(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, sectionsJson } = req.body;
    const organizationId = req.user?.organizationId;
    const userId = req.user?.userId;

    if (!organizationId || !userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Validate input
    if (!name || !sectionsJson) {
      res.status(400).json({ error: 'Name and sections are required' });
      return;
    }

    // Validate sectionsJson is an array
    if (!Array.isArray(sectionsJson)) {
      res.status(400).json({ error: 'Sections must be an array' });
      return;
    }

    // Create template
    const template = await prisma.lessonTemplate.create({
      data: {
        organizationId,
        name,
        description: description || null,
        sectionsJson,
        createdBy: userId,
      },
      include: {
        _count: {
          select: { usageMetrics: true },
        },
      },
    });

    logger.info(`Template created: ${template.id} by user ${userId}`);
    res.status(201).json(template);
  } catch (error) {
    logger.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
}

/**
 * Update a template (admin only)
 */
export async function updateTemplate(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, sectionsJson } = req.body;
    const organizationId = req.user?.organizationId;
    const userId = req.user?.userId;

    if (!organizationId || !userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if template exists and belongs to organization
    const existingTemplate = await prisma.lessonTemplate.findFirst({
      where: {
        id,
        organizationId,
        isActive: true,
      },
    });

    if (!existingTemplate) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Validate sectionsJson if provided
    if (sectionsJson !== undefined && !Array.isArray(sectionsJson)) {
      res.status(400).json({ error: 'Sections must be an array' });
      return;
    }

    // Update template
    const template = await prisma.lessonTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(sectionsJson && { sectionsJson }),
      },
      include: {
        _count: {
          select: { usageMetrics: true },
        },
      },
    });

    logger.info(`Template updated: ${template.id} by user ${userId}`);
    res.json(template);
  } catch (error) {
    logger.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
}

/**
 * Delete a template (admin only) - soft delete
 */
export async function deleteTemplate(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;
    const userId = req.user?.userId;

    if (!organizationId || !userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if template exists and belongs to organization
    const existingTemplate = await prisma.lessonTemplate.findFirst({
      where: {
        id,
        organizationId,
        isActive: true,
      },
    });

    if (!existingTemplate) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Soft delete
    await prisma.lessonTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info(`Template deleted: ${id} by user ${userId}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
}

/**
 * Record template usage
 */
export async function recordTemplateUsage(req: Request, res: Response): Promise<void> {
  try {
    const { templateId, lessonId } = req.body;
    const organizationId = req.user?.organizationId;
    const userId = req.user?.userId;

    if (!organizationId || !userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!templateId) {
      res.status(400).json({ error: 'Template ID is required' });
      return;
    }

    // Verify template exists and belongs to organization
    const template = await prisma.lessonTemplate.findFirst({
      where: {
        id: templateId,
        organizationId,
        isActive: true,
      },
    });

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Record usage
    const metric = await prisma.templateUsageMetric.create({
      data: {
        templateId,
        lessonId: lessonId || null,
        createdBy: userId,
      },
    });

    logger.info(`Template usage recorded: ${templateId} by user ${userId}`);
    res.status(201).json(metric);
  } catch (error) {
    logger.error('Error recording template usage:', error);
    res.status(500).json({ error: 'Failed to record template usage' });
  }
}

/**
 * Get template usage statistics
 */
export async function getTemplateStats(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get total templates
    const totalTemplates = await prisma.lessonTemplate.count({
      where: {
        organizationId,
        isActive: true,
      },
    });

    // Get templates with usage counts
    const templates = await prisma.lessonTemplate.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      include: {
        _count: {
          select: { usageMetrics: true },
        },
      },
      orderBy: {
        usageMetrics: {
          _count: 'desc',
        },
      },
      take: 5, // Top 5 most used
    });

    // Get total lessons created from templates
    const totalLessonsFromTemplates = await prisma.templateUsageMetric.count({
      where: {
        template: {
          organizationId,
        },
      },
    });

    // Get total lessons (assuming Lesson model exists)
    const totalLessons = await prisma.lesson.count({
      where: {
        organizationId,
      },
    });

    // Calculate percentage
    const percentageFromTemplates = totalLessons > 0
      ? Math.round((totalLessonsFromTemplates / totalLessons) * 100)
      : 0;

    res.json({
      totalTemplates,
      totalLessonsFromTemplates,
      totalLessons,
      percentageFromTemplates,
      mostUsedTemplates: templates.map(t => ({
        id: t.id,
        name: t.name,
        usageCount: t._count.usageMetrics,
      })),
    });
  } catch (error) {
    logger.error('Error fetching template stats:', error);
    res.status(500).json({ error: 'Failed to fetch template statistics' });
  }
}
