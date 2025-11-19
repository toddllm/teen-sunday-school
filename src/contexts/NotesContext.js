import React, { createContext, useContext, useState, useEffect } from 'react';

const NotesContext = createContext();

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem('sunday-school-notes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.error('Error loading notes from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('sunday-school-notes', JSON.stringify(notes));
      } catch (error) {
        console.error('Error saving notes to localStorage:', error);
      }
    }
  }, [notes, loading]);

  // Create a new note
  const addNote = (noteData) => {
    const newNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: noteData.title || '',
      body: noteData.body || '',
      verseRef: noteData.verseRef || null,
      verseText: noteData.verseText || null,
      tags: noteData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes(prevNotes => [newNote, ...prevNotes]); // Add to beginning for reverse chronological
    return newNote;
  };

  // Update an existing note
  const updateNote = (id, updates) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id
          ? {
              ...note,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
  };

  // Delete a note
  const deleteNote = (id) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  // Get a single note by ID
  const getNoteById = (id) => {
    return notes.find(note => note.id === id);
  };

  // Get notes by verse reference
  const getNotesByVerse = (verseRef) => {
    if (!verseRef) return [];
    return notes.filter(note => note.verseRef === verseRef);
  };

  // Get notes filtered by date range
  const getNotesByDateRange = (startDate, endDate) => {
    return notes.filter(note => {
      const noteDate = new Date(note.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && noteDate < start) return false;
      if (end && noteDate > end) return false;
      return true;
    });
  };

  // Search notes by text content
  const searchNotes = (searchTerm) => {
    if (!searchTerm) return notes;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return notes.filter(note =>
      note.title.toLowerCase().includes(lowerSearchTerm) ||
      note.body.toLowerCase().includes(lowerSearchTerm) ||
      (note.verseRef && note.verseRef.toLowerCase().includes(lowerSearchTerm)) ||
      (note.verseText && note.verseText.toLowerCase().includes(lowerSearchTerm))
    );
  };

  // Get notes by tag
  const getNotesByTag = (tag) => {
    return notes.filter(note => note.tags && note.tags.includes(tag));
  };

  // Get all unique tags
  const getAllTags = () => {
    const tagSet = new Set();
    notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  };

  // Get statistics
  const getStats = () => {
    const totalNotes = notes.length;
    const notesWithVerses = notes.filter(note => note.verseRef).length;
    const uniqueTags = getAllTags().length;

    // Calculate notes per week/month
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const notesThisWeek = notes.filter(note => new Date(note.createdAt) > oneWeekAgo).length;
    const notesThisMonth = notes.filter(note => new Date(note.createdAt) > oneMonthAgo).length;

    return {
      totalNotes,
      notesWithVerses,
      uniqueTags,
      notesThisWeek,
      notesThisMonth,
    };
  };

  const value = {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    getNoteById,
    getNotesByVerse,
    getNotesByDateRange,
    searchNotes,
    getNotesByTag,
    getAllTags,
    getStats,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};
