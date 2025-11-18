import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSermonNotes } from '../contexts/SermonNotesContext';
import { countReferences } from '../utils/referenceParser';
import './SermonNotesListPage.css';

function SermonNotesListPage() {
  const navigate = useNavigate();
  const { sermonNotes, getStats } = useSermonNotes();
  const [searchTerm, setSearchTerm] = useState('');

  const stats = getStats();

  // Filter notes based on search term
  const filteredNotes = sermonNotes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateNew = () => {
    navigate('/sermon-notes/new');
  };

  const handleNoteClick = (noteId) => {
    navigate(`/sermon-notes/${noteId}`);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPreview = (body, maxLength = 120) => {
    if (!body) return 'No content yet...';
    const preview = body.substring(0, maxLength);
    return body.length > maxLength ? `${preview}...` : preview;
  };

  return (
    <div className="sermon-notes-list-page">
      <div className="page-header">
        <h1>Sermon Notes</h1>
        <button className="btn-primary" onClick={handleCreateNew}>
          + New Note
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">{stats.totalNotes}</span>
          <span className="stat-label">Total Notes</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.notesThisWeek}</span>
          <span className="stat-label">This Week</span>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredNotes.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <>
              <p>No notes found matching "{searchTerm}"</p>
              <button className="btn-secondary" onClick={() => setSearchTerm('')}>
                Clear Search
              </button>
            </>
          ) : (
            <>
              <p>No sermon notes yet. Start capturing insights from sermons!</p>
              <button className="btn-primary" onClick={handleCreateNew}>
                Create Your First Note
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map(note => {
            const refCount = countReferences(note.body);
            return (
              <div
                key={note.id}
                className="note-card"
                onClick={() => handleNoteClick(note.id)}
              >
                <div className="note-card-header">
                  <h3 className="note-title">{note.title}</h3>
                  <span className="note-date">{formatDate(note.createdAt)}</span>
                </div>
                <p className="note-preview">{getPreview(note.body)}</p>
                <div className="note-card-footer">
                  {refCount > 0 && (
                    <span className="reference-count">
                      📖 {refCount} {refCount === 1 ? 'reference' : 'references'}
                    </span>
                  )}
                  {note.tags.length > 0 && (
                    <div className="tags">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="tag-more">+{note.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredNotes.length > 0 && !searchTerm && (
        <div className="quick-tip">
          💡 Tip: Scripture references like "John 3:16" are automatically detected and made clickable in your notes!
        </div>
      )}
    </div>
  );
}

export default SermonNotesListPage;
