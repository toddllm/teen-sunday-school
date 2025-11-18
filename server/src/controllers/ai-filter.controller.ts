import { Request, Response } from 'express';
import { PrismaClient, FilterAction, FilterCategory } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * AI Filter Controller
 * Manages safe-mode content filters for AI features
 */

// Default filter configuration
const DEFAULT_FILTER_RULES = {
  RELATIONSHIPS_SEXUALITY: 'REDIRECT',
  MENTAL_HEALTH: 'GUIDANCE',
  CONTROVERSIAL_DOCTRINE: 'GUIDANCE',
  VIOLENCE_ABUSE: 'REDIRECT',
  SUBSTANCE_USE: 'REDIRECT',
  POLITICS: 'GUIDANCE',
  FAMILY_ISSUES: 'GUIDANCE',
  DEATH_GRIEF: 'GUIDANCE',
  DOUBTS_FAITH: 'MONITOR',
  PEER_PRESSURE: 'GUIDANCE',
};

const DEFAULT_REDIRECT_MESSAGE =
  "This is a great question! For topics like this, we think it's best to talk with a youth leader who can give you personalized guidance. Please reach out to your group leader or pastor.";

/**
 * GET /api/admin/ai-filters
 * Get AI filter configuration for an organization
 */
export const getFilterConfig = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;

    let config = await prisma.aIFilterConfig.findUnique({
      where: { organizationId },
      include: {
        metrics: {
          take: 100,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // If no org-specific config exists, get or create global default
    if (!config) {
      config = await prisma.aIFilterConfig.findUnique({
        where: { organizationId: null },
      });

      if (!config) {
        // Create global default config
        config = await prisma.aIFilterConfig.create({
          data: {
            organizationId: null,
            filterRules: DEFAULT_FILTER_RULES,
            redirectMessage: DEFAULT_REDIRECT_MESSAGE,
            isActive: true,
          },
          include: {
            metrics: true,
          },
        });
      }
    }

    res.json(config);
  } catch (error) {
    logger.error('Error fetching AI filter config:', error);
    res.status(500).json({ error: 'Failed to fetch filter configuration' });
  }
};

/**
 * PATCH /api/admin/ai-filters
 * Update AI filter configuration
 */
export const updateFilterConfig = async (req: Request, res: Response) => {
  try {
    const { organizationId, role } = req.user!;
    const { filterRules, customKeywords, redirectMessage, isActive } = req.body;

    // Validate filter rules
    if (filterRules) {
      const validActions = Object.values(FilterAction);
      const validCategories = Object.values(FilterCategory);

      for (const [category, action] of Object.entries(filterRules)) {
        if (!validCategories.includes(category as FilterCategory)) {
          return res.status(400).json({
            error: `Invalid filter category: ${category}`,
            validCategories,
          });
        }
        if (!validActions.includes(action as FilterAction)) {
          return res.status(400).json({
            error: `Invalid filter action: ${action}`,
            validActions,
          });
        }
      }
    }

    // Check if config exists
    const existingConfig = await prisma.aIFilterConfig.findUnique({
      where: { organizationId },
    });

    let config;
    if (existingConfig) {
      // Update existing config
      config = await prisma.aIFilterConfig.update({
        where: { organizationId },
        data: {
          ...(filterRules && { filterRules }),
          ...(customKeywords !== undefined && { customKeywords }),
          ...(redirectMessage !== undefined && { redirectMessage }),
          ...(isActive !== undefined && { isActive }),
        },
      });
    } else {
      // Create new config for this organization
      config = await prisma.aIFilterConfig.create({
        data: {
          organizationId,
          filterRules: filterRules || DEFAULT_FILTER_RULES,
          customKeywords,
          redirectMessage: redirectMessage || DEFAULT_REDIRECT_MESSAGE,
          isActive: isActive !== undefined ? isActive : true,
        },
      });
    }

    logger.info(`AI filter config updated for org ${organizationId}`);
    res.json(config);
  } catch (error) {
    logger.error('Error updating AI filter config:', error);
    res.status(500).json({ error: 'Failed to update filter configuration' });
  }
};

/**
 * GET /api/admin/ai-filters/metrics
 * Get filter metrics with optional filters
 */
export const getFilterMetrics = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const {
      category,
      action,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = req.query;

    const where: any = { organizationId };

    if (category) {
      where.detectedCategory = category;
    }
    if (action) {
      where.actionTaken = action;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const [metrics, total] = await Promise.all([
      prisma.aIFilterMetric.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.aIFilterMetric.count({ where }),
    ]);

    // Get summary statistics
    const stats = await prisma.aIFilterMetric.groupBy({
      by: ['detectedCategory', 'actionTaken'],
      where: { organizationId },
      _count: true,
    });

    res.json({
      metrics,
      total,
      stats,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + metrics.length < total,
      },
    });
  } catch (error) {
    logger.error('Error fetching AI filter metrics:', error);
    res.status(500).json({ error: 'Failed to fetch filter metrics' });
  }
};

/**
 * GET /api/admin/ai-filters/metrics/summary
 * Get summary statistics for filter metrics
 */
export const getFilterMetricsSummary = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get counts by category
    const byCategory = await prisma.aIFilterMetric.groupBy({
      by: ['detectedCategory'],
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    // Get counts by action
    const byAction = await prisma.aIFilterMetric.groupBy({
      by: ['actionTaken'],
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    // Get leader follow-up counts
    const leaderFollowUpStats = await prisma.aIFilterMetric.aggregate({
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
      _count: {
        _all: true,
        leaderResponse: true,
      },
    });

    // Get daily trend
    const dailyTrend = await prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM "AIFilterMetric"
      WHERE organization_id = ${organizationId}
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    res.json({
      period: {
        days: Number(days),
        startDate,
        endDate: new Date(),
      },
      byCategory: byCategory.map(item => ({
        category: item.detectedCategory,
        count: item._count,
      })),
      byAction: byAction.map(item => ({
        action: item.actionTaken,
        count: item._count,
      })),
      leaderFollowUp: {
        totalQueries: leaderFollowUpStats._count._all,
        withResponse: leaderFollowUpStats._count.leaderResponse,
        pendingResponse: leaderFollowUpStats._count._all - leaderFollowUpStats._count.leaderResponse,
      },
      dailyTrend,
    });
  } catch (error) {
    logger.error('Error fetching filter metrics summary:', error);
    res.status(500).json({ error: 'Failed to fetch metrics summary' });
  }
};

/**
 * PATCH /api/admin/ai-filters/metrics/:metricId
 * Update a specific metric (e.g., mark as resolved, add leader response)
 */
export const updateMetric = async (req: Request, res: Response) => {
  try {
    const { metricId } = req.params;
    const { organizationId } = req.user!;
    const { leaderNotified, leaderResponse, resolvedAt } = req.body;

    // Verify the metric belongs to this organization
    const metric = await prisma.aIFilterMetric.findFirst({
      where: {
        id: metricId,
        organizationId,
      },
    });

    if (!metric) {
      return res.status(404).json({ error: 'Metric not found' });
    }

    const updated = await prisma.aIFilterMetric.update({
      where: { id: metricId },
      data: {
        ...(leaderNotified !== undefined && { leaderNotified }),
        ...(leaderResponse !== undefined && { leaderResponse }),
        ...(resolvedAt !== undefined && {
          resolvedAt: resolvedAt ? new Date(resolvedAt) : null
        }),
      },
    });

    res.json(updated);
  } catch (error) {
    logger.error('Error updating filter metric:', error);
    res.status(500).json({ error: 'Failed to update metric' });
  }
};

/**
 * GET /api/admin/ai-filters/categories
 * Get available filter categories and actions
 */
export const getFilterCategories = async (req: Request, res: Response) => {
  try {
    const categories = Object.values(FilterCategory).map(cat => ({
      value: cat,
      label: cat.split('_').map(word =>
        word.charAt(0) + word.slice(1).toLowerCase()
      ).join(' '),
    }));

    const actions = Object.values(FilterAction).map(action => ({
      value: action,
      label: action.charAt(0) + action.slice(1).toLowerCase(),
      description: getActionDescription(action),
    }));

    res.json({ categories, actions });
  } catch (error) {
    logger.error('Error fetching filter categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

function getActionDescription(action: FilterAction): string {
  switch (action) {
    case 'REDIRECT':
      return 'Show a message encouraging the user to ask a leader';
    case 'GUIDANCE':
      return 'Provide high-level, age-appropriate guidance';
    case 'BLOCK':
      return 'Block the query with a generic message';
    case 'MONITOR':
      return 'Allow the query but log it for leader review';
    default:
      return '';
  }
}
