import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TranslationComparisonList from '../components/TranslationComparisonList';
import TranslationComparisonViewer from '../components/TranslationComparisonViewer';
import {
  listComparisonNotes,
  getComparisonNote,
  recordComparisonNoteView,
} from '../services/translationComparisonService';
import './TranslationComparisonPage.css';

/**
 * TranslationComparisonPage
 *
 * Main page for viewing and browsing translation comparison notes
 */
const TranslationComparisonPage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'list-only', 'viewer-only'

  // Load all comparison notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  // Load specific note when noteId changes
  useEffect(() => {
    if (noteId && notes.length > 0) {
      loadNoteById(noteId);
    } else if (!noteId && notes.length > 0) {
      // If no noteId in URL, select the first note
      handleSelectNote(notes[0]);
    }
  }, [noteId, notes.length]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listComparisonNotes();
      setNotes(data);
    } catch (err) {
      console.error('Error loading comparison notes:', err);
      setError('Failed to load comparison notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadNoteById = async (id) => {
    try {
      const data = await getComparisonNote(id);
      setSelectedNote(data);
    } catch (err) {
      console.error('Error loading comparison note:', err);
      setError('Failed to load comparison note.');
    }
  };

  const handleSelectNote = (note) => {
    navigate(`/translation-comparisons/${note.id}`);
    setSelectedNote(note);

    // Record view metric
    recordComparisonNoteView(note.id, {
      featureContext: 'browse',
    }).catch((err) => console.error('Error recording view:', err));
  };

  const handleFeedback = async (noteId, wasHelpful, timeSpentMs) => {
    try {
      await recordComparisonNoteView(noteId, {
        featureContext: 'browse',
        timeSpentMs,
        wasHelpful,
      });
      alert(wasHelpful ? 'Thanks for the feedback! 😊' : 'Thanks for letting us know.');
    } catch (err) {
      console.error('Error recording feedback:', err);
    }
  };

  // Determine view mode based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode(selectedNote ? 'viewer-only' : 'list-only');
      } else {
        setViewMode('split');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedNote]);

  if (error) {
    return (
      <div className="translation-comparison-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={loadNotes} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="translation-comparison-page">
      <div className="page-header">
        <h1>Translation Comparison Notes</h1>
        <p className="page-subtitle">
          Understand the differences between Bible translations in a teen-friendly way!
        </p>
      </div>

      <div className="translation-comparison-container">
        {/* Mobile Back Button */}
        {viewMode === 'viewer-only' && (
          <button
            className="mobile-back-button"
            onClick={() => {
              navigate('/translation-comparisons');
              setSelectedNote(null);
            }}
          >
            ← Back to List
          </button>
        )}

        {/* List Panel */}
        {(viewMode === 'split' || viewMode === 'list-only') && (
          <div className="list-panel">
            <TranslationComparisonList
              notes={notes}
              onSelectNote={handleSelectNote}
              selectedNoteId={selectedNote?.id}
              loading={loading}
            />
          </div>
        )}

        {/* Viewer Panel */}
        {(viewMode === 'split' || viewMode === 'viewer-only') && (
          <div className="viewer-panel">
            {selectedNote ? (
              <TranslationComparisonViewer
                note={selectedNote}
                onFeedback={handleFeedback}
              />
            ) : (
              <div className="viewer-placeholder">
                <div className="placeholder-icon">📖</div>
                <h3>Select a translation comparison to get started</h3>
                <p>Choose from the list on the left to see the comparison details</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationComparisonPage;
