import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSermonNotes } from '../contexts/SermonNotesContext';
import { useStreak } from '../contexts/StreakContext';
import { linkifyReferences, normalizeReference } from '../utils/referenceParser';
import { searchPassage } from '../services/bibleAPI';
import './SermonNoteViewPage.css';

function SermonNoteViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSermonNoteById, createSermonNote, updateSermonNote, deleteSermonNote } = useSermonNotes();
  const { logActivity } = useStreak();

  const isNew = id === 'new';
  const existingNote = isNew ? null : getSermonNoteById(id);

  const [isEditing, setIsEditing] = useState(isNew);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [selectedReference, setSelectedReference] = useState(null);
  const [passageText, setPassageText] = useState('');
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setBody(existingNote.body);
      setTags(existingNote.tags.join(', '));
    } else if (isNew) {
      // Set default title for new notes
      const now = new Date();
      const defaultTitle = `Sermon Notes - ${now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`;
      setTitle(defaultTitle);
    }
  }, [existingNote, isNew]);

  const handleSave = () => {
    const noteData = {
      title: title.trim() || 'Untitled Sermon Note',
      body: body.trim(),
      tags: tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    };

    if (isNew) {
      const newNote = createSermonNote(noteData);
      logActivity('sermon-note-created');
      navigate(`/sermon-notes/${newNote.id}`, { replace: true });
      setIsEditing(false);
    } else {
      updateSermonNote(id, noteData);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    deleteSermonNote(id);
    navigate('/sermon-notes');
  };

  const handleReferenceClick = async (ref) => {
    setSelectedReference(ref);
    setLoadingPassage(true);
    setPassageText('');

    try {
      // Log activity for analytics
      logActivity('sermon-note-reference-clicked');

      const normalizedRef = normalizeReference(ref.reference);
      const result = await searchPassage(normalizedRef);

      if (result && result.content) {
        // Strip HTML tags for cleaner display
        const cleanText = result.content.replace(/<[^>]*>/g, '');
        setPassageText(cleanText);
      } else {
        setPassageText('Passage not found. Try using the Bible Tool for more options.');
      }
    } catch (error) {
      console.error('Error fetching passage:', error);
      setPassageText('Unable to load passage. Please check your connection.');
    } finally {
      setLoadingPassage(false);
    }
  };

  const renderBody = () => {
    if (isEditing) {
      return (
        <textarea
          className="note-body-input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start typing your sermon notes here... Bible references like 'John 3:16' will be automatically linked when you save."
          rows={15}
        />
      );
    }

    // Parse and linkify the body text
    const elements = linkifyReferences(body, handleReferenceClick);

    return (
      <div className="note-body-display">
        {elements.map((element, index) => {
          if (typeof element === 'string') {
            // Preserve line breaks
            return element.split('\n').map((line, lineIndex) => (
              <React.Fragment key={`text-${index}-${lineIndex}`}>
                {line}
                {lineIndex < element.split('\n').length - 1 && <br />}
              </React.Fragment>
            ));
          } else if (element.type === 'reference') {
            return (
              <button
                key={element.key}
                className="reference-link"
                onClick={element.onClick}
                title={`Click to view ${element.reference}`}
              >
                {element.text}
              </button>
            );
          }
          return null;
        })}
      </div>
    );
  };

  if (!isNew && !existingNote) {
    return (
      <div className="sermon-note-view-page">
        <div className="error-state">
          <h2>Note Not Found</h2>
          <p>The sermon note you're looking for doesn't exist.</p>
          <button className="btn-primary" onClick={() => navigate('/sermon-notes')}>
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sermon-note-view-page">
      <div className="note-header">
        <button className="btn-back" onClick={() => navigate('/sermon-notes')}>
          ← Back to Notes
        </button>
        <div className="note-actions">
          {isEditing ? (
            <>
              <button className="btn-primary" onClick={handleSave}>
                Save
              </button>
              {!isNew && (
                <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              )}
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="note-content">
        <div className="note-main">
          {isEditing ? (
            <>
              <input
                type="text"
                className="note-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sermon Title"
              />
              <div className="note-meta-input">
                <label>
                  Tags (comma-separated):
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="faith, grace, salvation"
                  />
                </label>
              </div>
            </>
          ) : (
            <>
              <h1 className="note-title">{title}</h1>
              <div className="note-meta">
                <span className="note-date">
                  Created: {new Date(existingNote?.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {existingNote?.tags.length > 0 && (
                  <div className="note-tags">
                    {existingNote.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="note-body">
            {renderBody()}
          </div>

          {!isEditing && !body && (
            <div className="empty-note">
              <p>This note is empty. Click "Edit" to add your sermon notes.</p>
            </div>
          )}
        </div>

        {selectedReference && (
          <div className="passage-viewer">
            <div className="passage-header">
              <h3>{selectedReference.reference}</h3>
              <button
                className="btn-close"
                onClick={() => setSelectedReference(null)}
                title="Close"
              >
                ×
              </button>
            </div>
            <div className="passage-content">
              {loadingPassage ? (
                <div className="loading">Loading passage...</div>
              ) : (
                <p>{passageText}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Sermon Note?</h2>
            <p>Are you sure you want to delete "{title}"? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={handleDelete}>
                Delete
              </button>
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SermonNoteViewPage;
