import React, { useState, useMemo } from 'react';
import { useNotes } from '../contexts/NotesContext';
import NoteCard from '../components/notes/NoteCard';
import NoteForm from '../components/notes/NoteForm';
import './JournalPage.css';

const JournalPage = () => {
  const { notes, addNote, updateNote, deleteNote, searchNotes, getAllTags, getStats } = useNotes();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const stats = getStats();
  const allTags = getAllTags();

  // Filter notes based on search, tag, and date
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Search filter
    if (searchTerm) {
      filtered = searchNotes(searchTerm);
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(note => note.tags && note.tags.includes(selectedTag));
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(note => {
        const noteDate = new Date(note.createdAt);
        if (dateFilter === 'today') return noteDate >= startOfToday;
        if (dateFilter === 'week') return noteDate >= startOfWeek;
        if (dateFilter === 'month') return noteDate >= startOfMonth;
        return true;
      });
    }

    return filtered;
  }, [notes, searchTerm, selectedTag, dateFilter, searchNotes]);

  const handleSaveNote = (noteData) => {
    if (editingNote) {
      updateNote(editingNote.id, noteData);
    } else {
      addNote(noteData);
    }
    setShowForm(false);
    setEditingNote(null);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleDeleteNote = (noteId) => {
    deleteNote(noteId);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  const handleNoteClick = (note) => {
    // Expand to show full note (could also navigate to detail page)
    setEditingNote(note);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <div className="journal-page">
        <div className="container">
          <NoteForm
            note={editingNote}
            onSave={handleSaveNote}
            onCancel={handleCancelForm}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="journal-page">
      <div className="container">
        <div className="journal-header">
          <div>
            <h1>My Journal</h1>
            <p className="journal-subtitle">
              Your personal reflections and Bible study notes
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + New Note
          </button>
        </div>

        <div className="journal-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalNotes}</div>
            <div className="stat-label">Total Notes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.notesWithVerses}</div>
            <div className="stat-label">Verse Notes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.notesThisWeek}</div>
            <div className="stat-label">This Week</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.notesThisMonth}</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>

        <div className="journal-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="🔍 Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          {allTags.length > 0 && (
            <div className="filter-group">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="filter-select"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}

          {(searchTerm || selectedTag || dateFilter !== 'all') && (
            <button
              className="btn btn-outline btn-small"
              onClick={() => {
                setSearchTerm('');
                setSelectedTag('');
                setDateFilter('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="journal-content">
          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              {notes.length === 0 ? (
                <>
                  <div className="empty-icon">📝</div>
                  <h2>Start Your Journaling Journey</h2>
                  <p>
                    Create your first note to record your thoughts, prayers, and reflections
                    as you study God's Word.
                  </p>
                  <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    Create Your First Note
                  </button>
                </>
              ) : (
                <>
                  <div className="empty-icon">🔍</div>
                  <h2>No Notes Found</h2>
                  <p>
                    Try adjusting your filters or search terms.
                  </p>
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTag('');
                      setDateFilter('all');
                    }}
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="notes-list">
              {filteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  onClick={handleNoteClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
