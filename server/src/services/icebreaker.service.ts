import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Service for icebreaker-related business logic
 */
export class IcebreakerService {
  /**
   * Generate AI-powered icebreaker suggestions
   * @param options - Generation options (topic, passage, ageGroup, etc.)
   * @returns Array of suggested icebreakers
   *
   * NOTE: This is a placeholder for future AI integration.
   * For now, it returns similar icebreakers based on category/tags.
   */
  async generateSuggestions(options: {
    organizationId: string;
    topic?: string;
    passage?: string;
    ageGroup?: string;
    category?: string;
    limit?: number;
  }) {
    try {
      const { organizationId, ageGroup, category, limit = 5 } = options;

      // For now, return matching icebreakers from the database
      // TODO: Implement AI generation using Claude/OpenAI API
      const icebreakers = await prisma.icebreaker.findMany({
        where: {
          organizationId,
          ...(ageGroup && { ageGroup }),
          ...(category && { category }),
        },
        take: limit,
        orderBy: {
          usageCount: 'desc', // Prioritize popular ones
        },
      });

      return icebreakers;
    } catch (error) {
      logger.error('Error generating icebreaker suggestions:', error);
      throw error;
    }
  }

  /**
   * Get icebreaker statistics for an organization
   */
  async getStatistics(organizationId: string) {
    try {
      const [total, byCategory, mostUsed, mostFavorited] = await Promise.all([
        // Total count
        prisma.icebreaker.count({
          where: { organizationId },
        }),

        // Count by category
        prisma.icebreaker.groupBy({
          by: ['category'],
          where: { organizationId },
          _count: true,
        }),

        // Most used
        prisma.icebreaker.findMany({
          where: { organizationId },
          orderBy: { usageCount: 'desc' },
          take: 10,
        }),

        // Most favorited
        prisma.icebreaker.findMany({
          where: { organizationId },
          orderBy: { favoriteCount: 'desc' },
          take: 10,
        }),
      ]);

      return {
        total,
        byCategory,
        mostUsed,
        mostFavorited,
      };
    } catch (error) {
      logger.error('Error getting icebreaker statistics:', error);
      throw error;
    }
  }

  /**
   * Get recommended icebreakers based on user history
   */
  async getRecommendations(userId: string, organizationId: string, limit = 5) {
    try {
      // Get user's usage history
      const recentUsage = await prisma.icebreakerUsage.findMany({
        where: { userId },
        orderBy: { usedAt: 'desc' },
        take: 10,
        include: {
          icebreaker: true,
        },
      });

      // Extract categories and age groups from recent usage
      const usedCategories = recentUsage.map((u: any) => u.icebreaker?.category).filter(Boolean);
      const usedAgeGroups = recentUsage.map((u: any) => u.icebreaker?.ageGroup).filter(Boolean);

      // Find similar icebreakers
      const recommendations = await prisma.icebreaker.findMany({
        where: {
          organizationId,
          OR: [
            { category: { in: usedCategories } },
            { ageGroup: { in: usedAgeGroups } },
          ],
          // Exclude recently used ones
          id: {
            notIn: recentUsage.map((u: any) => u.icebreakerId),
          },
        },
        take: limit,
        orderBy: [
          { usageCount: 'desc' },
          { favoriteCount: 'desc' },
        ],
      });

      return recommendations;
    } catch (error) {
      logger.error('Error getting icebreaker recommendations:', error);
      throw error;
    }
  }

  /**
   * Search icebreakers by text
   */
  async search(organizationId: string, query: string, filters?: any) {
    try {
      const icebreakers = await prisma.icebreaker.findMany({
        where: {
          organizationId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { instructions: { contains: query, mode: 'insensitive' } },
          ],
          ...filters,
        },
        orderBy: { createdAt: 'desc' },
      });

      return icebreakers;
    } catch (error) {
      logger.error('Error searching icebreakers:', error);
      throw error;
    }
  }
}

export default new IcebreakerService();
