import React, { createContext, useState, useContext, useEffect } from 'react';

const HighlightContext = createContext();

// Available highlight colors
export const HIGHLIGHT_COLORS = {
  YELLOW: '#FFF59D',
  GREEN: '#A5D6A7',
  BLUE: '#90CAF9',
  PINK: '#F48FB1',
  PURPLE: '#CE93D8',
  ORANGE: '#FFCC80'
};

export const HighlightProvider = ({ children }) => {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load highlights from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bible-highlights');
      if (stored) {
        const parsed = JSON.parse(stored);
        setHighlights(parsed);
      }
    } catch (error) {
      console.error('Error loading highlights:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save highlights to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('bible-highlights', JSON.stringify(highlights));
      } catch (error) {
        console.error('Error saving highlights:', error);
      }
    }
  }, [highlights, loading]);

  // Add a new highlight
  const addHighlight = (verseRef, text, color, tags = [], note = '') => {
    const newHighlight = {
      id: `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      verseRef,
      text,
      color,
      tags: tags.filter(tag => tag.trim() !== ''),
      note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setHighlights(prev => [...prev, newHighlight]);
    return newHighlight;
  };

  // Update an existing highlight
  const updateHighlight = (id, updates) => {
    setHighlights(prev =>
      prev.map(highlight =>
        highlight.id === id
          ? { ...highlight, ...updates, updatedAt: new Date().toISOString() }
          : highlight
      )
    );
  };

  // Delete a highlight
  const deleteHighlight = (id) => {
    setHighlights(prev => prev.filter(highlight => highlight.id !== id));
  };

  // Get highlight for a specific verse reference
  const getHighlightsByVerse = (verseRef) => {
    return highlights.filter(h => h.verseRef === verseRef);
  };

  // Get all unique tags
  const getAllTags = () => {
    const tagSet = new Set();
    highlights.forEach(h => {
      h.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  // Filter highlights by various criteria
  const filterHighlights = ({ book, tag, color } = {}) => {
    return highlights.filter(h => {
      if (book && !h.verseRef.toLowerCase().includes(book.toLowerCase())) {
        return false;
      }
      if (tag && !h.tags.includes(tag)) {
        return false;
      }
      if (color && h.color !== color) {
        return false;
      }
      return true;
    });
  };

  // Get highlights grouped by book
  const getHighlightsByBook = () => {
    const byBook = {};
    highlights.forEach(h => {
      const book = h.verseRef.split(' ')[0];
      if (!byBook[book]) {
        byBook[book] = [];
      }
      byBook[book].push(h);
    });
    return byBook;
  };

  // Get highlights grouped by color
  const getHighlightsByColor = () => {
    const byColor = {};
    highlights.forEach(h => {
      if (!byColor[h.color]) {
        byColor[h.color] = [];
      }
      byColor[h.color].push(h);
    });
    return byColor;
  };

  // Get highlights grouped by tag
  const getHighlightsByTag = () => {
    const byTag = {};
    highlights.forEach(h => {
      h.tags.forEach(tag => {
        if (!byTag[tag]) {
          byTag[tag] = [];
        }
        byTag[tag].push(h);
      });
    });
    return byTag;
  };

  const value = {
    highlights,
    loading,
    addHighlight,
    updateHighlight,
    deleteHighlight,
    getHighlightsByVerse,
    getAllTags,
    filterHighlights,
    getHighlightsByBook,
    getHighlightsByColor,
    getHighlightsByTag
  };

  return (
    <HighlightContext.Provider value={value}>
      {children}
    </HighlightContext.Provider>
  );
};

export const useHighlights = () => {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlights must be used within a HighlightProvider');
  }
  return context;
};

export default HighlightContext;
