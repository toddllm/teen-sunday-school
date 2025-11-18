import { Request, Response } from 'express';
import { SongMetricType } from '@prisma/client';
import logger from '../config/logger';
import * as songService from '../services/song.service';

/**
 * Song Controller
 * Handles song references, playlists, and metrics
 */

// ============================================================================
// SONG ENDPOINTS
// ============================================================================

/**
 * GET /api/songs
 * Get songs with optional filters (passage_ref, theme)
 */
export const getSongs = async (req: Request, res: Response) => {
  try {
    const { passage_ref, theme } = req.query;
    const organizationId = req.user?.organizationId;

    const songs = await songService.getSongs({
      passageRef: passage_ref as string,
      theme: theme as string,
      organizationId,
    });

    res.json(songs);
  } catch (error) {
    logger.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
};

/**
 * GET /api/songs/:id
 * Get a single song by ID
 */
export const getSong = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    const song = await songService.getSongById(id, organizationId);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(song);
  } catch (error) {
    logger.error('Error fetching song:', error);
    res.status(500).json({ error: 'Failed to fetch song' });
  }
};

/**
 * POST /api/admin/songs
 * Create a new song (admin only)
 */
export const createSong = async (req: Request, res: Response) => {
  try {
    const { title, artist, linkUrl, themeTags, relatedVerses, gameSnippet, gameTheme } = req.body;
    const { organizationId, userId } = req.user!;

    // Validate required fields
    if (!title || !artist) {
      return res.status(400).json({ error: 'Title and artist are required' });
    }

    if (!Array.isArray(themeTags) || themeTags.length === 0) {
      return res.status(400).json({ error: 'At least one theme tag is required' });
    }

    if (!Array.isArray(relatedVerses) || relatedVerses.length === 0) {
      return res.status(400).json({ error: 'At least one related verse is required' });
    }

    const song = await songService.createSong({
      title,
      artist,
      linkUrl,
      themeTags,
      relatedVerses,
      gameSnippet,
      gameTheme,
      organizationId,
      curatedBy: userId,
    });

    logger.info(`Song created: ${song.id} by user ${userId}`);
    res.status(201).json(song);
  } catch (error) {
    logger.error('Error creating song:', error);
    res.status(500).json({ error: 'Failed to create song' });
  }
};

/**
 * PUT /api/admin/songs/:id
 * Update a song (admin only)
 */
export const updateSong = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, artist, linkUrl, themeTags, relatedVerses, gameSnippet, gameTheme, isApproved } =
      req.body;
    const { userId } = req.user!;

    const song = await songService.updateSong(id, {
      title,
      artist,
      linkUrl,
      themeTags,
      relatedVerses,
      gameSnippet,
      gameTheme,
      isApproved,
    });

    logger.info(`Song updated: ${song.id} by user ${userId}`);
    res.json(song);
  } catch (error) {
    logger.error('Error updating song:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
};

/**
 * DELETE /api/admin/songs/:id
 * Delete a song (admin only)
 */
export const deleteSong = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.user!;

    await songService.deleteSong(id);

    logger.info(`Song deleted: ${id} by user ${userId}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting song:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  }
};

/**
 * POST /api/songs/:id/metrics
 * Track a song metric (view, click, game play, etc.)
 */
export const trackMetric = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { metricType, passageRef, groupId } = req.body;
    const { organizationId, userId } = req.user || {};

    // Validate metric type
    if (!Object.values(SongMetricType).includes(metricType)) {
      return res.status(400).json({ error: 'Invalid metric type' });
    }

    const metric = await songService.trackSongMetric({
      songId: id,
      metricType,
      organizationId,
      userId,
      groupId,
      passageRef,
    });

    res.status(201).json(metric);
  } catch (error) {
    logger.error('Error tracking song metric:', error);
    res.status(500).json({ error: 'Failed to track metric' });
  }
};

/**
 * GET /api/admin/songs/metrics
 * Get song metrics (admin only)
 */
export const getMetrics = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { songId, metricType, startDate, endDate } = req.query;

    const metrics = await songService.getSongMetrics(organizationId, {
      songId: songId as string,
      metricType: metricType as SongMetricType,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching song metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

/**
 * GET /api/admin/songs/stats
 * Get song statistics summary (admin only)
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { days } = req.query;

    const stats = await songService.getSongStats(
      organizationId,
      days ? parseInt(days as string) : 30
    );

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching song stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// ============================================================================
// PLAYLIST ENDPOINTS
// ============================================================================

/**
 * GET /api/playlists
 * Get playlists with optional filters
 */
export const getPlaylists = async (req: Request, res: Response) => {
  try {
    const { lessonId, isPublic } = req.query;
    const { organizationId, userId } = req.user!;

    const playlists = await songService.getPlaylists({
      organizationId,
      userId: req.query.userId as string || userId, // Allow filtering by other users if public
      lessonId: lessonId as string,
      isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
    });

    res.json(playlists);
  } catch (error) {
    logger.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
};

/**
 * GET /api/playlists/:id
 * Get a single playlist by ID
 */
export const getPlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const playlist = await songService.getPlaylistById(id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check access: owner or public playlist
    const { userId, organizationId } = req.user!;
    if (playlist.userId !== userId && !playlist.isPublic && playlist.organizationId !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(playlist);
  } catch (error) {
    logger.error('Error fetching playlist:', error);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
};

/**
 * POST /api/playlists
 * Create a new playlist
 */
export const createPlaylist = async (req: Request, res: Response) => {
  try {
    const { name, description, lessonId, isPublic } = req.body;
    const { organizationId, userId } = req.user!;

    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const playlist = await songService.createPlaylist({
      name,
      description,
      organizationId,
      userId,
      lessonId,
      isPublic: isPublic || false,
    });

    logger.info(`Playlist created: ${playlist.id} by user ${userId}`);
    res.status(201).json(playlist);
  } catch (error) {
    logger.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
};

/**
 * PUT /api/playlists/:id
 * Update a playlist
 */
export const updatePlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, lessonId, isPublic } = req.body;
    const { userId } = req.user!;

    // Check ownership
    const existing = await songService.getPlaylistById(id);
    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const playlist = await songService.updatePlaylist(id, {
      name,
      description,
      lessonId,
      isPublic,
    });

    logger.info(`Playlist updated: ${playlist.id} by user ${userId}`);
    res.json(playlist);
  } catch (error) {
    logger.error('Error updating playlist:', error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
};

/**
 * DELETE /api/playlists/:id
 * Delete a playlist
 */
export const deletePlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.user!;

    // Check ownership
    const existing = await songService.getPlaylistById(id);
    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await songService.deletePlaylist(id);

    logger.info(`Playlist deleted: ${id} by user ${userId}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting playlist:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
};

/**
 * POST /api/playlists/:id/songs
 * Add a song to a playlist
 */
export const addSongToPlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { songId, notes } = req.body;
    const { userId } = req.user!;

    if (!songId) {
      return res.status(400).json({ error: 'Song ID is required' });
    }

    // Check ownership
    const existing = await songService.getPlaylistById(id);
    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const item = await songService.addSongToPlaylist({
      playlistId: id,
      songId,
      notes,
    });

    logger.info(`Song ${songId} added to playlist ${id} by user ${userId}`);
    res.status(201).json(item);
  } catch (error) {
    logger.error('Error adding song to playlist:', error);
    res.status(500).json({ error: 'Failed to add song to playlist' });
  }
};

/**
 * DELETE /api/playlists/:id/songs/:songId
 * Remove a song from a playlist
 */
export const removeSongFromPlaylist = async (req: Request, res: Response) => {
  try {
    const { id, songId } = req.params;
    const { userId } = req.user!;

    // Check ownership
    const existing = await songService.getPlaylistById(id);
    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await songService.removeSongFromPlaylist(id, songId);

    logger.info(`Song ${songId} removed from playlist ${id} by user ${userId}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error removing song from playlist:', error);
    res.status(500).json({ error: 'Failed to remove song from playlist' });
  }
};

/**
 * PUT /api/playlists/:id/reorder
 * Reorder songs in a playlist
 */
export const reorderPlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { songIds } = req.body;
    const { userId } = req.user!;

    if (!Array.isArray(songIds)) {
      return res.status(400).json({ error: 'songIds must be an array' });
    }

    // Check ownership
    const existing = await songService.getPlaylistById(id);
    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const playlist = await songService.reorderPlaylist(id, songIds);

    logger.info(`Playlist ${id} reordered by user ${userId}`);
    res.json(playlist);
  } catch (error) {
    logger.error('Error reordering playlist:', error);
    res.status(500).json({ error: 'Failed to reorder playlist' });
  }
};
