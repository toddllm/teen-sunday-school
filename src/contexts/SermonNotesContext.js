import React, { createContext, useContext, useState, useEffect } from 'react';

const SermonNotesContext = createContext();

export const useSermonNotes = () => {
  const context = useContext(SermonNotesContext);
  if (!context) {
    throw new Error('useSermonNotes must be used within a SermonNotesProvider');
  }
  return context;
};

export const SermonNotesProvider = ({ children }) => {
  const [sermonNotes, setSermonNotes] = useState([]);

  // Load sermon notes from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('sermon-notes');
    if (stored) {
      try {
        setSermonNotes(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse sermon notes from localStorage:', error);
        setSermonNotes([]);
      }
    }
  }, []);

  // Save sermon notes to localStorage whenever they change
  useEffect(() => {
    if (sermonNotes.length >= 0) {
      localStorage.setItem('sermon-notes', JSON.stringify(sermonNotes));
    }
  }, [sermonNotes]);

  // Create a new sermon note
  const createSermonNote = (noteData) => {
    const newNote = {
      id: `sermon-note-${Date.now()}`,
      title: noteData.title || `Sermon Notes - ${new Date().toLocaleDateString()}`,
      body: noteData.body || '',
      tags: noteData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSermonNotes(prevNotes => [newNote, ...prevNotes]);
    return newNote;
  };

  // Update an existing sermon note
  const updateSermonNote = (id, updates) => {
    setSermonNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id
          ? {
              ...note,
              ...updates,
              updatedAt: new Date().toISOString()
            }
          : note
      )
    );
  };

  // Delete a sermon note
  const deleteSermonNote = (id) => {
    setSermonNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  // Get a specific sermon note by ID
  const getSermonNoteById = (id) => {
    return sermonNotes.find(note => note.id === id);
  };

  // Get sermon notes sorted by date (newest first)
  const getSortedSermonNotes = () => {
    return [...sermonNotes].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  // Get statistics for analytics
  const getStats = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const notesThisWeek = sermonNotes.filter(note =>
      new Date(note.createdAt) >= oneWeekAgo
    ).length;

    return {
      totalNotes: sermonNotes.length,
      notesThisWeek
    };
  };

  const value = {
    sermonNotes: getSortedSermonNotes(),
    createSermonNote,
    updateSermonNote,
    deleteSermonNote,
    getSermonNoteById,
    getStats
  };

  return (
    <SermonNotesContext.Provider value={value}>
      {children}
    </SermonNotesContext.Provider>
  );
};
