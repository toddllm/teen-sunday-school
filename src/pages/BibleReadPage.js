import React, { useState, useEffect } from 'react';
import { getVerseText } from '../services/bibleAPI';
import notesService, { HIGHLIGHT_COLORS } from '../services/notesService';
import { useOffline } from '../contexts/OfflineContext';
import './BibleReadPage.css';

const BibleReadPage = () => {
  const { isOnline, addToSyncQueue, trackAnalytics } = useOffline();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentVerse, setCurrentVerse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [notes, setNotes] = useState([]);
  const [highlights, setHighlights] = useState([]);

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);

  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS.YELLOW);

  // Popular verses for quick access
  const popularVerses = [
    'John 3:16',
    'Psalm 23:1',
    'Romans 8:28',
    'Philippians 4:13',
    'Jeremiah 29:11',
    'Proverbs 3:5-6'
  ];

  useEffect(() => {
    if (currentVerse) {
      loadNotesAndHighlights(currentVerse.reference);
    }
  }, [currentVerse]);

  const loadNotesAndHighlights = async (reference) => {
    try {
      const [notesData, highlightsData] = await Promise.all([
        notesService.getNotesByReference(reference),
        notesService.getHighlightsByReference(reference)
      ]);
      setNotes(notesData);
      setHighlights(highlightsData);
    } catch (error) {
      console.error('Error loading notes/highlights:', error);
    }
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const verse = await getVerseText(query);
      if (verse) {
        setCurrentVerse(verse);
        trackAnalytics('verse_viewed', {
          reference: verse.reference,
          cached: verse.cached,
          isOnline
        });
      } else {
        setError('Verse not found. Try a different reference or download the translation for offline use.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to load verse. Please check your connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !currentVerse) return;

    try {
      const note = await notesService.saveNote({
        id: editingNoteId,
        reference: currentVerse.reference,
        content: noteText,
        verseText: currentVerse.text
      }, addToSyncQueue);

      trackAnalytics(editingNoteId ? 'note_updated' : 'note_created', {
        reference: currentVerse.reference
      });

      await loadNotesAndHighlights(currentVerse.reference);
      setNoteText('');
      setShowNoteForm(false);
      setEditingNoteId(null);
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleEditNote = (note) => {
    setNoteText(note.content);
    setEditingNoteId(note.id);
    setShowNoteForm(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      await notesService.deleteNote(noteId, addToSyncQueue);
      trackAnalytics('note_deleted', { reference: currentVerse?.reference });
      await loadNotesAndHighlights(currentVerse.reference);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleAddHighlight = async (color) => {
    if (!currentVerse) return;

    try {
      await notesService.saveHighlight({
        reference: currentVerse.reference,
        verseText: currentVerse.text,
        color: color
      }, addToSyncQueue);

      trackAnalytics('highlight_created', {
        reference: currentVerse.reference,
        color
      });

      await loadNotesAndHighlights(currentVerse.reference);
      setShowHighlightPicker(false);
    } catch (error) {
      console.error('Error saving highlight:', error);
      alert('Failed to save highlight. Please try again.');
    }
  };

  const handleDeleteHighlight = async (highlightId) => {
    try {
      await notesService.deleteHighlight(highlightId, addToSyncQueue);
      trackAnalytics('highlight_deleted', { reference: currentVerse?.reference });
      await loadNotesAndHighlights(currentVerse.reference);
    } catch (error) {
      console.error('Error deleting highlight:', error);
      alert('Failed to delete highlight. Please try again.');
    }
  };

  return (
    <div className="bible-read-page">
      <div className="page-header">
        <h1>📖 Bible Reading</h1>
        <div className="connection-badge">
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter verse reference (e.g., John 3:16)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={() => handleSearch()} disabled={loading}>
            {loading ? '⏳' : '🔍'} Search
          </button>
        </div>

        <div className="popular-verses">
          <p>Popular verses:</p>
          <div className="verse-chips">
            {popularVerses.map(verse => (
              <button
                key={verse}
                className="verse-chip"
                onClick={() => handleSearch(verse)}
              >
                {verse}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Verse Display */}
      {currentVerse && !loading && (
        <div className="verse-container">
          <div className="verse-header">
            <h2>{currentVerse.reference}</h2>
            <div className="verse-actions">
              <button
                className="action-btn"
                onClick={() => setShowHighlightPicker(!showHighlightPicker)}
              >
                🎨 Highlight
              </button>
              <button
                className="action-btn"
                onClick={() => {
                  setShowNoteForm(!showNoteForm);
                  setEditingNoteId(null);
                  setNoteText('');
                }}
              >
                📝 Add Note
              </button>
            </div>
          </div>

          {/* Highlight Color Picker */}
          {showHighlightPicker && (
            <div className="highlight-picker">
              <p>Choose highlight color:</p>
              <div className="color-options">
                {Object.entries(HIGHLIGHT_COLORS).map(([name, color]) => (
                  <button
                    key={name}
                    className="color-option"
                    style={{ backgroundColor: color }}
                    onClick={() => handleAddHighlight(color)}
                    title={name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Verse Text */}
          <div
            className="verse-text"
            style={{
              backgroundColor: highlights.length > 0 ? highlights[0].color : 'transparent',
              padding: highlights.length > 0 ? '15px' : '0',
              borderRadius: highlights.length > 0 ? '8px' : '0'
            }}
          >
            {currentVerse.text}
          </div>

          {currentVerse.cached && (
            <div className="cached-indicator">
              💾 Loaded from offline cache
            </div>
          )}

          {/* Current Highlights */}
          {highlights.length > 0 && (
            <div className="highlights-section">
              <h3>Highlights</h3>
              <div className="highlights-list">
                {highlights.map(highlight => (
                  <div key={highlight.id} className="highlight-item">
                    <div
                      className="highlight-color"
                      style={{ backgroundColor: highlight.color }}
                    />
                    <span>Added {new Date(highlight.createdAt).toLocaleDateString()}</span>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteHighlight(highlight.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note Form */}
          {showNoteForm && (
            <div className="note-form">
              <h3>{editingNoteId ? 'Edit Note' : 'Add Note'}</h3>
              <textarea
                placeholder="Write your thoughts, reflections, or insights..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={5}
              />
              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleAddNote}>
                  {editingNoteId ? 'Update' : 'Save'} Note
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowNoteForm(false);
                    setNoteText('');
                    setEditingNoteId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notes List */}
          {notes.length > 0 && (
            <div className="notes-section">
              <h3>Your Notes</h3>
              <div className="notes-list">
                {notes.map(note => (
                  <div key={note.id} className="note-item">
                    <div className="note-header">
                      <span className="note-date">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                      {!note.synced && (
                        <span className="sync-badge">⏳ Not synced</span>
                      )}
                    </div>
                    <div className="note-content">{note.content}</div>
                    <div className="note-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditNote(note)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading verse...</p>
        </div>
      )}

      {/* Empty State */}
      {!currentVerse && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <h2>Search for a verse to get started</h2>
          <p>Enter a Bible reference above or click one of the popular verses</p>
        </div>
      )}
    </div>
  );
};

export default BibleReadPage;
