import { Request, Response } from 'express';
import logger from '../config/logger';
import {
  getActiveAvatars,
  getAvatarsByCategory,
  getAvatarById,
  getAvatarCategories,
  getAvatarsBySpecificCategory,
  getAvatarUsageStats,
  getMostPopularAvatars,
} from '../services/avatar.service';

/**
 * Avatar Controller
 *
 * Handles avatar-related operations.
 */

/**
 * Get all active avatars
 * GET /api/avatars
 */
export async function getAvatars(req: Request, res: Response): Promise<void> {
  try {
    const { groupBy } = req.query;

    if (groupBy === 'category') {
      // Return avatars grouped by category
      const avatarsByCategory = await getAvatarsByCategory();
      res.json({
        avatars: avatarsByCategory,
        grouped: true,
      });
    } else {
      // Return flat list of avatars
      const avatars = await getActiveAvatars();
      res.json({
        avatars,
        grouped: false,
      });
    }
  } catch (error) {
    logger.error('Error fetching avatars:', error);
    res.status(500).json({ error: 'Failed to fetch avatars' });
  }
}

/**
 * Get a single avatar by ID
 * GET /api/avatars/:id
 */
export async function getAvatar(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const avatar = await getAvatarById(id);

    if (!avatar) {
      res.status(404).json({ error: 'Avatar not found' });
      return;
    }

    res.json({ avatar });
  } catch (error) {
    logger.error('Error fetching avatar:', error);
    res.status(500).json({ error: 'Failed to fetch avatar' });
  }
}

/**
 * Get all avatar categories
 * GET /api/avatars/categories
 */
export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await getAvatarCategories();
    res.json({ categories });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

/**
 * Get avatars by category
 * GET /api/avatars/by-category/:category
 */
export async function getAvatarsByCategory_endpoint(req: Request, res: Response): Promise<void> {
  try {
    const { category } = req.params;

    const avatars = await getAvatarsBySpecificCategory(category);
    res.json({ avatars, category });
  } catch (error) {
    logger.error('Error fetching avatars by category:', error);
    res.status(500).json({ error: 'Failed to fetch avatars for category' });
  }
}

/**
 * Get avatar usage statistics (Admin only)
 * GET /api/admin/avatars/stats
 */
export async function getAvatarStats(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if user is admin
    const role = req.user.role;
    if (role !== 'ORG_ADMIN' && role !== 'SUPER_ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const stats = await getAvatarUsageStats();
    res.json({ stats });
  } catch (error) {
    logger.error('Error fetching avatar stats:', error);
    res.status(500).json({ error: 'Failed to fetch avatar statistics' });
  }
}

/**
 * Get most popular avatars
 * GET /api/avatars/popular
 */
export async function getPopularAvatars(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    if (limit < 1 || limit > 20) {
      res.status(400).json({ error: 'Limit must be between 1 and 20' });
      return;
    }

    const popularAvatars = await getMostPopularAvatars(limit);
    res.json({ avatars: popularAvatars });
  } catch (error) {
    logger.error('Error fetching popular avatars:', error);
    res.status(500).json({ error: 'Failed to fetch popular avatars' });
  }
}
