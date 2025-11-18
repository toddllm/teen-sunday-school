import { Request, Response } from 'express';
import logger from '../config/logger';
import { NotificationPreferenceService } from '../services/notification-preference.service';

const preferenceService = new NotificationPreferenceService();

/**
 * Get user's notification preferences
 */
export async function getPreferences(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;

    const preferences = await preferenceService.getUserPreferences(userId);

    res.status(200).json(preferences);
  } catch (error) {
    logger.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
}

/**
 * Update user's notification preferences
 */
export async function updatePreferences(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;
    const updates = req.body;

    // Validate updates
    if (!updates || Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No updates provided' });
      return;
    }

    const preferences = await preferenceService.updatePreferences(userId, updates);

    res.status(200).json(preferences);
  } catch (error: any) {
    logger.error('Error updating notification preferences:', error);

    // Handle validation errors
    if (error.message?.includes('Invalid time format')) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
}

/**
 * Reset user's notification preferences to defaults
 */
export async function resetPreferences(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;

    // Delete existing preferences
    await preferenceService.deletePreferences(userId);

    // Create new default preferences
    const preferences = await preferenceService.createDefaultPreferences(userId);

    res.status(200).json(preferences);
  } catch (error) {
    logger.error('Error resetting notification preferences:', error);
    res.status(500).json({ error: 'Failed to reset notification preferences' });
  }
}

/**
 * Get notification statistics for user
 */
export async function getNotificationStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;

    const todayCount = await preferenceService.getTodayNotificationCount(userId);
    const preferences = await preferenceService.getUserPreferences(userId);
    const hasReachedLimit = await preferenceService.hasReachedDailyLimit(userId);
    const isInQuietHours = await preferenceService.isInQuietHours(userId);

    res.status(200).json({
      todayCount,
      maxPerDay: preferences.maxNotificationsPerDay,
      hasReachedLimit,
      isInQuietHours,
    });
  } catch (error) {
    logger.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
}
