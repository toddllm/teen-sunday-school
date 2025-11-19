/**
 * Notes and Highlights Service
 *
 * Manages user notes and verse highlights with offline support
 */

import offlineDB from './offlineDB';

// Highlight colors
export const HIGHLIGHT_COLORS = {
  YELLOW: '#fff59d',
  GREEN: '#a5d6a7',
  BLUE: '#90caf9',
  PINK: '#f48fb1',
  ORANGE: '#ffcc80',
  PURPLE: '#ce93d8'
};

class NotesService {
  /**
   * Create or update a note
   */
  async saveNote(noteData, addToSyncQueue = null) {
    try {
      const note = {
        ...noteData,
        id: noteData.id || `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: noteData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false
      };

      await offlineDB.saveNote(note);

      // Add to sync queue if callback provided
      if (addToSyncQueue) {
        await addToSyncQueue({
          actionType: noteData.id ? 'update_note' : 'create_note',
          data: {
            noteId: note.id,
            reference: note.reference,
            content: note.content
          }
        });
      }

      return note;
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  }

  /**
   * Get a note by ID
   */
  async getNote(noteId) {
    try {
      return await offlineDB.getNote(noteId);
    } catch (error) {
      console.error('Error getting note:', error);
      return null;
    }
  }

  /**
   * Get all notes for a specific verse
   */
  async getNotesByReference(reference) {
    try {
      return await offlineDB.getNotesByReference(reference);
    } catch (error) {
      console.error('Error getting notes by reference:', error);
      return [];
    }
  }

  /**
   * Get all notes
   */
  async getAllNotes() {
    try {
      const notes = await offlineDB.getAllNotes();
      // Sort by most recent first
      return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
      console.error('Error getting all notes:', error);
      return [];
    }
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId, addToSyncQueue = null) {
    try {
      await offlineDB.deleteNote(noteId);

      // Add to sync queue if callback provided
      if (addToSyncQueue) {
        await addToSyncQueue({
          actionType: 'delete_note',
          data: { noteId }
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  /**
   * Search notes by content
   */
  async searchNotes(searchTerm) {
    try {
      const allNotes = await this.getAllNotes();
      const term = searchTerm.toLowerCase();

      return allNotes.filter(note =>
        note.content?.toLowerCase().includes(term) ||
        note.reference?.toLowerCase().includes(term) ||
        note.title?.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  }

  /**
   * Create or update a highlight
   */
  async saveHighlight(highlightData, addToSyncQueue = null) {
    try {
      const highlight = {
        ...highlightData,
        id: highlightData.id || `highlight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: highlightData.createdAt || new Date().toISOString(),
        color: highlightData.color || HIGHLIGHT_COLORS.YELLOW,
        synced: false
      };

      await offlineDB.saveHighlight(highlight);

      // Add to sync queue if callback provided
      if (addToSyncQueue) {
        await addToSyncQueue({
          actionType: 'create_highlight',
          data: {
            highlightId: highlight.id,
            reference: highlight.reference,
            color: highlight.color
          }
        });
      }

      return highlight;
    } catch (error) {
      console.error('Error saving highlight:', error);
      throw error;
    }
  }

  /**
   * Get a highlight by ID
   */
  async getHighlight(highlightId) {
    try {
      return await offlineDB.getHighlight(highlightId);
    } catch (error) {
      console.error('Error getting highlight:', error);
      return null;
    }
  }

  /**
   * Get all highlights for a specific verse
   */
  async getHighlightsByReference(reference) {
    try {
      return await offlineDB.getHighlightsByReference(reference);
    } catch (error) {
      console.error('Error getting highlights by reference:', error);
      return [];
    }
  }

  /**
   * Get all highlights
   */
  async getAllHighlights() {
    try {
      const highlights = await offlineDB.getAllHighlights();
      // Sort by most recent first
      return highlights.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error getting all highlights:', error);
      return [];
    }
  }

  /**
   * Delete a highlight
   */
  async deleteHighlight(highlightId, addToSyncQueue = null) {
    try {
      await offlineDB.deleteHighlight(highlightId);

      // Add to sync queue if callback provided
      if (addToSyncQueue) {
        await addToSyncQueue({
          actionType: 'delete_highlight',
          data: { highlightId }
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting highlight:', error);
      throw error;
    }
  }

  /**
   * Get highlights grouped by color
   */
  async getHighlightsByColor(color) {
    try {
      const allHighlights = await this.getAllHighlights();
      return allHighlights.filter(h => h.color === color);
    } catch (error) {
      console.error('Error getting highlights by color:', error);
      return [];
    }
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    try {
      const [notes, highlights] = await Promise.all([
        this.getAllNotes(),
        this.getAllHighlights()
      ]);

      const unsyncedNotes = notes.filter(n => !n.synced);
      const unsyncedHighlights = highlights.filter(h => !h.synced);

      const highlightsByColor = {};
      for (const color of Object.values(HIGHLIGHT_COLORS)) {
        highlightsByColor[color] = highlights.filter(h => h.color === color).length;
      }

      return {
        totalNotes: notes.length,
        totalHighlights: highlights.length,
        unsyncedNotes: unsyncedNotes.length,
        unsyncedHighlights: unsyncedHighlights.length,
        highlightsByColor,
        recentNotes: notes.slice(0, 5),
        recentHighlights: highlights.slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    }
  }
}

// Export singleton instance
const notesService = new NotesService();
export default notesService;
