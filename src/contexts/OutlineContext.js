import React, { createContext, useContext, useState, useEffect } from 'react';

const OutlineContext = createContext();

export const useOutline = () => {
  const context = useContext(OutlineContext);
  if (!context) {
    throw new Error('useOutline must be used within OutlineProvider');
  }
  return context;
};

export const OutlineProvider = ({ children }) => {
  const [outlines, setOutlines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load outlines from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sunday-school-outlines');
      if (stored) {
        setOutlines(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading outlines from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save outlines to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('sunday-school-outlines', JSON.stringify(outlines));
      } catch (error) {
        console.error('Error saving outlines to localStorage:', error);
      }
    }
  }, [outlines, loading]);

  // Create a new outline
  const createOutline = (outlineData) => {
    const newOutline = {
      id: `outline-${Date.now()}`,
      userId: 'local-user', // Since there's no auth, use a placeholder
      passageRef: outlineData.passageRef,
      title: outlineData.title || '',
      contentMd: outlineData.contentMd || '',
      sections: outlineData.sections || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAiGenerated: outlineData.isAiGenerated || false,
    };

    setOutlines((prev) => [newOutline, ...prev]);
    return newOutline;
  };

  // Update an existing outline
  const updateOutline = (id, updates) => {
    setOutlines((prev) =>
      prev.map((outline) =>
        outline.id === id
          ? {
              ...outline,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : outline
      )
    );
  };

  // Delete an outline
  const deleteOutline = (id) => {
    setOutlines((prev) => prev.filter((outline) => outline.id !== id));
  };

  // Get outline by ID
  const getOutlineById = (id) => {
    return outlines.find((outline) => outline.id === id);
  };

  // Get outlines by passage reference
  const getOutlinesByPassage = (passageRef) => {
    return outlines.filter((outline) => outline.passageRef === passageRef);
  };

  const value = {
    outlines,
    loading,
    createOutline,
    updateOutline,
    deleteOutline,
    getOutlineById,
    getOutlinesByPassage,
  };

  return (
    <OutlineContext.Provider value={value}>
      {children}
    </OutlineContext.Provider>
  );
};
