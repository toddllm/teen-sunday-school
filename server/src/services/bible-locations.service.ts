import { BibleLocation, MapActionType, Prisma } from '@prisma/client';
import prisma from '../config/database';
import logger from '../config/logger';

export interface CreateBibleLocationDTO {
  name: string;
  alternateNames?: string;
  latitude: number;
  longitude: number;
  summary: string;
  description?: string;
  keyEvents?: Array<{ title: string; description: string }>;
  relatedPassages: Array<{ reference: string; description?: string }>;
  imageUrl?: string;
  region?: string;
  modernName?: string;
}

export interface UpdateBibleLocationDTO {
  name?: string;
  alternateNames?: string;
  latitude?: number;
  longitude?: number;
  summary?: string;
  description?: string;
  keyEvents?: Array<{ title: string; description: string }>;
  relatedPassages?: Array<{ reference: string; description?: string }>;
  imageUrl?: string;
  region?: string;
  modernName?: string;
  isActive?: boolean;
}

export interface BibleLocationFilters {
  region?: string;
  search?: string;
  isActive?: boolean;
}

export class BibleLocationsService {
  /**
   * Get all bible locations with optional filters
   */
  async getAll(filters?: BibleLocationFilters): Promise<BibleLocation[]> {
    try {
      const where: Prisma.BibleLocationWhereInput = {};

      if (filters?.region) {
        where.region = filters.region;
      }

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { alternateNames: { contains: filters.search, mode: 'insensitive' } },
          { summary: { contains: filters.search, mode: 'insensitive' } },
          { modernName: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive;
      } else {
        // Default to active locations only
        where.isActive = true;
      }

      const locations = await prisma.bibleLocation.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      logger.info(`Retrieved ${locations.length} bible locations`, { filters });
      return locations;
    } catch (error) {
      logger.error('Error fetching bible locations', { error, filters });
      throw error;
    }
  }

  /**
   * Get a single bible location by ID
   */
  async getById(id: string): Promise<BibleLocation | null> {
    try {
      const location = await prisma.bibleLocation.findUnique({
        where: { id },
      });

      if (!location) {
        logger.warn(`Bible location not found: ${id}`);
        return null;
      }

      logger.info(`Retrieved bible location: ${location.name}`, { id });
      return location;
    } catch (error) {
      logger.error('Error fetching bible location by ID', { error, id });
      throw error;
    }
  }

  /**
   * Get locations by region
   */
  async getByRegion(region: string): Promise<BibleLocation[]> {
    try {
      const locations = await prisma.bibleLocation.findMany({
        where: {
          region,
          isActive: true,
        },
        orderBy: { name: 'asc' },
      });

      logger.info(`Retrieved ${locations.length} locations in region: ${region}`);
      return locations;
    } catch (error) {
      logger.error('Error fetching locations by region', { error, region });
      throw error;
    }
  }

  /**
   * Get locations associated with a lesson
   */
  async getByLessonId(lessonId: string): Promise<BibleLocation[]> {
    try {
      const lessonLocations = await prisma.lessonLocation.findMany({
        where: { lessonId },
        include: {
          location: true,
        },
      });

      const locations = lessonLocations.map(ll => ll.location);
      logger.info(`Retrieved ${locations.length} locations for lesson: ${lessonId}`);
      return locations;
    } catch (error) {
      logger.error('Error fetching locations for lesson', { error, lessonId });
      throw error;
    }
  }

  /**
   * Create a new bible location
   */
  async create(data: CreateBibleLocationDTO): Promise<BibleLocation> {
    try {
      const location = await prisma.bibleLocation.create({
        data: {
          name: data.name,
          alternateNames: data.alternateNames,
          latitude: data.latitude,
          longitude: data.longitude,
          summary: data.summary,
          description: data.description,
          keyEvents: data.keyEvents as Prisma.JsonArray,
          relatedPassages: data.relatedPassages as Prisma.JsonArray,
          imageUrl: data.imageUrl,
          region: data.region,
          modernName: data.modernName,
        },
      });

      logger.info(`Created bible location: ${location.name}`, { id: location.id });
      return location;
    } catch (error) {
      logger.error('Error creating bible location', { error, data });
      throw error;
    }
  }

  /**
   * Update a bible location
   */
  async update(id: string, data: UpdateBibleLocationDTO): Promise<BibleLocation> {
    try {
      const updateData: Prisma.BibleLocationUpdateInput = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.alternateNames !== undefined) updateData.alternateNames = data.alternateNames;
      if (data.latitude !== undefined) updateData.latitude = data.latitude;
      if (data.longitude !== undefined) updateData.longitude = data.longitude;
      if (data.summary !== undefined) updateData.summary = data.summary;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.keyEvents !== undefined) updateData.keyEvents = data.keyEvents as Prisma.JsonArray;
      if (data.relatedPassages !== undefined) updateData.relatedPassages = data.relatedPassages as Prisma.JsonArray;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
      if (data.region !== undefined) updateData.region = data.region;
      if (data.modernName !== undefined) updateData.modernName = data.modernName;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      const location = await prisma.bibleLocation.update({
        where: { id },
        data: updateData,
      });

      logger.info(`Updated bible location: ${location.name}`, { id });
      return location;
    } catch (error) {
      logger.error('Error updating bible location', { error, id, data });
      throw error;
    }
  }

  /**
   * Delete a bible location (soft delete by setting isActive = false)
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.bibleLocation.update({
        where: { id },
        data: { isActive: false },
      });

      logger.info(`Soft deleted bible location: ${id}`);
    } catch (error) {
      logger.error('Error deleting bible location', { error, id });
      throw error;
    }
  }

  /**
   * Link a location to a lesson
   */
  async linkToLesson(
    lessonId: string,
    locationId: string,
    relevance?: string
  ): Promise<void> {
    try {
      await prisma.lessonLocation.create({
        data: {
          lessonId,
          locationId,
          relevance,
        },
      });

      logger.info(`Linked location ${locationId} to lesson ${lessonId}`);
    } catch (error) {
      logger.error('Error linking location to lesson', { error, lessonId, locationId });
      throw error;
    }
  }

  /**
   * Unlink a location from a lesson
   */
  async unlinkFromLesson(lessonId: string, locationId: string): Promise<void> {
    try {
      await prisma.lessonLocation.deleteMany({
        where: {
          lessonId,
          locationId,
        },
      });

      logger.info(`Unlinked location ${locationId} from lesson ${lessonId}`);
    } catch (error) {
      logger.error('Error unlinking location from lesson', { error, lessonId, locationId });
      throw error;
    }
  }

  /**
   * Track a map view or interaction for metrics
   */
  async trackMapAction(
    actionType: MapActionType,
    locationId?: string,
    userId?: string,
    metadata?: any
  ): Promise<void> {
    try {
      await prisma.bibleMapView.create({
        data: {
          actionType,
          locationId,
          userId,
          metadata: metadata as Prisma.JsonObject,
        },
      });

      logger.info(`Tracked map action: ${actionType}`, { locationId, userId });
    } catch (error) {
      logger.error('Error tracking map action', { error, actionType, locationId });
      // Don't throw - metrics tracking shouldn't break the app
    }
  }

  /**
   * Get metrics for map usage
   */
  async getMetrics(startDate?: Date, endDate?: Date): Promise<{
    totalMapViews: number;
    totalLocationViews: number;
    totalPassageClicks: number;
    locationViewCounts: Array<{ locationId: string; locationName: string; count: number }>;
  }> {
    try {
      const where: Prisma.BibleMapViewWhereInput = {};

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      // Count by action type
      const [mapViews, locationViews, passageClicks] = await Promise.all([
        prisma.bibleMapView.count({
          where: { ...where, actionType: 'MAP_VIEW' },
        }),
        prisma.bibleMapView.count({
          where: { ...where, actionType: 'LOCATION_VIEW' },
        }),
        prisma.bibleMapView.count({
          where: { ...where, actionType: 'PASSAGE_CLICK' },
        }),
      ]);

      // Get most viewed locations
      const locationViewsRaw = await prisma.bibleMapView.groupBy({
        by: ['locationId'],
        where: {
          ...where,
          actionType: 'LOCATION_VIEW',
          locationId: { not: null },
        },
        _count: true,
        orderBy: {
          _count: {
            locationId: 'desc',
          },
        },
        take: 10,
      });

      // Get location names
      const locationIds = locationViewsRaw.map(lv => lv.locationId).filter(Boolean) as string[];
      const locations = await prisma.bibleLocation.findMany({
        where: { id: { in: locationIds } },
        select: { id: true, name: true },
      });

      const locationMap = new Map(locations.map(l => [l.id, l.name]));

      const locationViewCounts = locationViewsRaw.map(lv => ({
        locationId: lv.locationId!,
        locationName: locationMap.get(lv.locationId!) || 'Unknown',
        count: lv._count,
      }));

      logger.info('Retrieved map metrics', {
        totalMapViews: mapViews,
        totalLocationViews: locationViews,
        totalPassageClicks: passageClicks,
      });

      return {
        totalMapViews: mapViews,
        totalLocationViews: locationViews,
        totalPassageClicks: passageClicks,
        locationViewCounts,
      };
    } catch (error) {
      logger.error('Error fetching map metrics', { error });
      throw error;
    }
  }
}

export default new BibleLocationsService();
