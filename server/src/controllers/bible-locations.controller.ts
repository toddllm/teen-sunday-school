import { Request, Response } from 'express';
import logger from '../config/logger';
import bibleLocationsService, { BibleLocationsService } from '../services/bible-locations.service';
import { MapActionType } from '@prisma/client';

/**
 * Get all bible locations with optional filters
 * Query params: region, search, isActive
 */
export async function getAllLocations(req: Request, res: Response): Promise<void> {
  try {
    const { region, search, isActive } = req.query;

    const filters = {
      region: region as string | undefined,
      search: search as string | undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };

    const locations = await bibleLocationsService.getAll(filters);

    res.json({ locations, count: locations.length });
  } catch (error) {
    logger.error('Error fetching bible locations:', error);
    res.status(500).json({ error: 'Failed to fetch bible locations' });
  }
}

/**
 * Get a single bible location by ID
 */
export async function getLocationById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const location = await bibleLocationsService.getById(id);

    if (!location) {
      res.status(404).json({ error: 'Bible location not found' });
      return;
    }

    // Track location view
    const userId = (req as any).user?.id; // From auth middleware
    await bibleLocationsService.trackMapAction(
      MapActionType.LOCATION_VIEW,
      id,
      userId
    );

    res.json({ location });
  } catch (error) {
    logger.error('Error fetching bible location by ID:', error);
    res.status(500).json({ error: 'Failed to fetch bible location' });
  }
}

/**
 * Get locations by region
 */
export async function getLocationsByRegion(req: Request, res: Response): Promise<void> {
  try {
    const { region } = req.params;

    const locations = await bibleLocationsService.getByRegion(region);

    res.json({ locations, count: locations.length, region });
  } catch (error) {
    logger.error('Error fetching locations by region:', error);
    res.status(500).json({ error: 'Failed to fetch locations by region' });
  }
}

/**
 * Get locations associated with a lesson
 */
export async function getLocationsByLessonId(req: Request, res: Response): Promise<void> {
  try {
    const { lessonId } = req.params;

    const locations = await bibleLocationsService.getByLessonId(lessonId);

    res.json({ locations, count: locations.length, lessonId });
  } catch (error) {
    logger.error('Error fetching locations for lesson:', error);
    res.status(500).json({ error: 'Failed to fetch locations for lesson' });
  }
}

/**
 * Create a new bible location
 * Requires TEACHER or ORG_ADMIN role
 */
export async function createLocation(req: Request, res: Response): Promise<void> {
  try {
    const locationData = req.body;

    // Validate required fields
    if (!locationData.name || !locationData.latitude || !locationData.longitude || !locationData.summary || !locationData.relatedPassages) {
      res.status(400).json({
        error: 'Missing required fields: name, latitude, longitude, summary, relatedPassages',
      });
      return;
    }

    // Validate coordinates
    if (locationData.latitude < -90 || locationData.latitude > 90) {
      res.status(400).json({ error: 'Latitude must be between -90 and 90' });
      return;
    }

    if (locationData.longitude < -180 || locationData.longitude > 180) {
      res.status(400).json({ error: 'Longitude must be between -180 and 180' });
      return;
    }

    const location = await bibleLocationsService.create(locationData);

    res.status(201).json({ location });
  } catch (error) {
    logger.error('Error creating bible location:', error);
    res.status(500).json({ error: 'Failed to create bible location' });
  }
}

/**
 * Update a bible location
 * Requires TEACHER or ORG_ADMIN role
 */
export async function updateLocation(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate coordinates if provided
    if (updateData.latitude !== undefined && (updateData.latitude < -90 || updateData.latitude > 90)) {
      res.status(400).json({ error: 'Latitude must be between -90 and 90' });
      return;
    }

    if (updateData.longitude !== undefined && (updateData.longitude < -180 || updateData.longitude > 180)) {
      res.status(400).json({ error: 'Longitude must be between -180 and 180' });
      return;
    }

    const location = await bibleLocationsService.update(id, updateData);

    res.json({ location });
  } catch (error) {
    logger.error('Error updating bible location:', error);
    res.status(500).json({ error: 'Failed to update bible location' });
  }
}

/**
 * Delete a bible location (soft delete)
 * Requires ORG_ADMIN role
 */
export async function deleteLocation(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await bibleLocationsService.delete(id);

    res.json({ message: 'Bible location deleted successfully' });
  } catch (error) {
    logger.error('Error deleting bible location:', error);
    res.status(500).json({ error: 'Failed to delete bible location' });
  }
}

/**
 * Link a location to a lesson
 * Requires TEACHER or ORG_ADMIN role
 */
export async function linkLocationToLesson(req: Request, res: Response): Promise<void> {
  try {
    const { lessonId, locationId } = req.params;
    const { relevance } = req.body;

    await bibleLocationsService.linkToLesson(lessonId, locationId, relevance);

    res.json({ message: 'Location linked to lesson successfully' });
  } catch (error) {
    logger.error('Error linking location to lesson:', error);
    res.status(500).json({ error: 'Failed to link location to lesson' });
  }
}

/**
 * Unlink a location from a lesson
 * Requires TEACHER or ORG_ADMIN role
 */
export async function unlinkLocationFromLesson(req: Request, res: Response): Promise<void> {
  try {
    const { lessonId, locationId } = req.params;

    await bibleLocationsService.unlinkFromLesson(lessonId, locationId);

    res.json({ message: 'Location unlinked from lesson successfully' });
  } catch (error) {
    logger.error('Error unlinking location from lesson:', error);
    res.status(500).json({ error: 'Failed to unlink location from lesson' });
  }
}

/**
 * Track a map interaction
 * Public endpoint - no auth required
 */
export async function trackMapAction(req: Request, res: Response): Promise<void> {
  try {
    const { actionType, locationId, metadata } = req.body;

    if (!actionType) {
      res.status(400).json({ error: 'actionType is required' });
      return;
    }

    // Validate actionType
    const validActionTypes = ['MAP_VIEW', 'LOCATION_VIEW', 'PASSAGE_CLICK', 'LOCATION_HOVER'];
    if (!validActionTypes.includes(actionType)) {
      res.status(400).json({ error: 'Invalid actionType' });
      return;
    }

    const userId = (req as any).user?.id; // Optional - from auth middleware if available

    await bibleLocationsService.trackMapAction(
      actionType as MapActionType,
      locationId,
      userId,
      metadata
    );

    res.json({ message: 'Map action tracked successfully' });
  } catch (error) {
    logger.error('Error tracking map action:', error);
    // Don't fail - just log and return success
    res.json({ message: 'Map action tracking attempted' });
  }
}

/**
 * Get map usage metrics
 * Requires ORG_ADMIN role
 */
export async function getMapMetrics(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const metrics = await bibleLocationsService.getMetrics(start, end);

    res.json({ metrics });
  } catch (error) {
    logger.error('Error fetching map metrics:', error);
    res.status(500).json({ error: 'Failed to fetch map metrics' });
  }
}
