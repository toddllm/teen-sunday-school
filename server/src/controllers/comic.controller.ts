import { Request, Response } from 'express';
import logger from '../config/logger';
import * as comicService from '../services/comic.service';

/**
 * Comic Controller
 * Handles HTTP requests for comic storyboard management
 */

/**
 * GET /api/comics
 * List comics with optional filters
 */
export const listComics = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const {
      createdBy,
      isPublic,
      isTemplate,
      layoutType,
      limit = '50',
      offset = '0',
    } = req.query;

    const filters: any = {
      organizationId,
    };

    if (createdBy) {
      filters.createdBy = createdBy as string;
    }

    if (isPublic !== undefined) {
      filters.isPublic = isPublic === 'true';
    }

    if (isTemplate !== undefined) {
      filters.isTemplate = isTemplate === 'true';
    }

    if (layoutType) {
      filters.layoutType = layoutType as string;
    }

    const result = await comicService.listComics(
      filters,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json(result);
  } catch (error) {
    logger.error('Error listing comics:', error);
    res.status(500).json({ error: 'Failed to list comics' });
  }
};

/**
 * GET /api/comics/templates
 * Get public comic templates
 */
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const { limit = '20' } = req.query;

    const templates = await comicService.getComicTemplates(
      parseInt(limit as string)
    );

    res.json(templates);
  } catch (error) {
    logger.error('Error fetching comic templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

/**
 * GET /api/comics/:id
 * Get a specific comic by ID
 */
export const getComic = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    const comic = await comicService.getComicById(id, organizationId);

    res.json(comic);
  } catch (error: any) {
    logger.error('Error fetching comic:', error);

    if (error.message === 'Comic not found') {
      return res.status(404).json({ error: 'Comic not found' });
    }

    res.status(500).json({ error: 'Failed to fetch comic' });
  }
};

/**
 * POST /api/comics
 * Create a new comic storyboard
 */
export const createComic = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const {
      title,
      description,
      verseReferences,
      panels,
      layoutType,
      stylePreset,
      backgroundColor,
      textColor,
      fontFamily,
      isPublic,
      isTemplate,
    } = req.body;

    // Validate required fields
    if (!title || !panels || !layoutType) {
      return res.status(400).json({
        error: 'title, panels, and layoutType are required',
      });
    }

    // Validate panels is an array
    if (!Array.isArray(panels)) {
      return res.status(400).json({
        error: 'panels must be an array',
      });
    }

    // Validate verseReferences is an array
    if (verseReferences && !Array.isArray(verseReferences)) {
      return res.status(400).json({
        error: 'verseReferences must be an array',
      });
    }

    const comic = await comicService.createComic({
      title,
      description,
      verseReferences: verseReferences || [],
      panels,
      layoutType,
      stylePreset: stylePreset || 'comic',
      backgroundColor: backgroundColor || '#FFFFFF',
      textColor: textColor || '#000000',
      fontFamily: fontFamily || 'Arial',
      isPublic: isPublic || false,
      isTemplate: isTemplate || false,
      organizationId,
      createdBy: userId,
    });

    logger.info(`Comic created: ${comic.id} by user ${userId}`);
    res.status(201).json(comic);
  } catch (error) {
    logger.error('Error creating comic:', error);
    res.status(500).json({ error: 'Failed to create comic' });
  }
};

/**
 * PATCH /api/comics/:id
 * Update an existing comic
 */
export const updateComic = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const { id } = req.params;
    const {
      title,
      description,
      verseReferences,
      panels,
      layoutType,
      stylePreset,
      backgroundColor,
      textColor,
      fontFamily,
      isPublic,
      isTemplate,
    } = req.body;

    // Validate arrays if provided
    if (panels && !Array.isArray(panels)) {
      return res.status(400).json({
        error: 'panels must be an array',
      });
    }

    if (verseReferences && !Array.isArray(verseReferences)) {
      return res.status(400).json({
        error: 'verseReferences must be an array',
      });
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (verseReferences !== undefined) updateData.verseReferences = verseReferences;
    if (panels !== undefined) updateData.panels = panels;
    if (layoutType !== undefined) updateData.layoutType = layoutType;
    if (stylePreset !== undefined) updateData.stylePreset = stylePreset;
    if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor;
    if (textColor !== undefined) updateData.textColor = textColor;
    if (fontFamily !== undefined) updateData.fontFamily = fontFamily;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (isTemplate !== undefined) updateData.isTemplate = isTemplate;

    const updatedComic = await comicService.updateComic(
      id,
      userId,
      organizationId,
      updateData
    );

    res.json(updatedComic);
  } catch (error: any) {
    logger.error('Error updating comic:', error);

    if (error.message === 'Comic not found') {
      return res.status(404).json({ error: 'Comic not found' });
    }

    if (error.message === 'Unauthorized to update this comic') {
      return res.status(403).json({ error: 'Unauthorized to update this comic' });
    }

    res.status(500).json({ error: 'Failed to update comic' });
  }
};

/**
 * DELETE /api/comics/:id
 * Delete a comic
 */
export const deleteComic = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const { id } = req.params;

    await comicService.deleteComic(id, userId, organizationId);

    res.json({ success: true, message: 'Comic deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting comic:', error);

    if (error.message === 'Comic not found') {
      return res.status(404).json({ error: 'Comic not found' });
    }

    if (error.message === 'Unauthorized to delete this comic') {
      return res.status(403).json({ error: 'Unauthorized to delete this comic' });
    }

    res.status(500).json({ error: 'Failed to delete comic' });
  }
};

/**
 * POST /api/comics/:id/track
 * Track comic usage metric (view, download, share)
 */
export const trackMetric = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const { id } = req.params;
    const {
      metricType,
      featureContext,
      timeSpentMs,
      usedInLesson,
      lessonId,
    } = req.body;

    // Validate metricType
    if (!['view', 'download', 'share'].includes(metricType)) {
      return res.status(400).json({
        error: 'metricType must be one of: view, download, share',
      });
    }

    await comicService.trackComicMetric(
      id,
      organizationId,
      metricType,
      userId,
      {
        featureContext,
        timeSpentMs,
        usedInLesson,
        lessonId,
      }
    );

    res.json({ success: true, message: 'Metric tracked successfully' });
  } catch (error: any) {
    logger.error('Error tracking comic metric:', error);

    if (error.message === 'Comic not found') {
      return res.status(404).json({ error: 'Comic not found' });
    }

    // Don't fail the request if metric tracking fails
    res.json({ success: true, message: 'Request completed (metric tracking failed)' });
  }
};

export default {
  listComics,
  getTemplates,
  getComic,
  createComic,
  updateComic,
  deleteComic,
  trackMetric,
};
