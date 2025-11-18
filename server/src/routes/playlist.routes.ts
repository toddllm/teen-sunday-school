import express from 'express';
import {
  getPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderPlaylist,
} from '../controllers/song.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Playlist Routes
 * All routes require authentication
 */

// Playlist CRUD
router.get('/', authenticate, getPlaylists);
router.get('/:id', authenticate, getPlaylist);
router.post('/', authenticate, createPlaylist);
router.put('/:id', authenticate, updatePlaylist);
router.delete('/:id', authenticate, deletePlaylist);

// Playlist song management
router.post('/:id/songs', authenticate, addSongToPlaylist);
router.delete('/:id/songs/:songId', authenticate, removeSongFromPlaylist);
router.put('/:id/reorder', authenticate, reorderPlaylist);

export default router;
