import React, { createContext, useState, useContext, useEffect } from 'react';
import { bigStorySections } from '../data/bigStoryData';

const BigStoryContext = createContext();

export const useBigStory = () => {
  const context = useContext(BigStoryContext);
  if (!context) {
    throw new Error('useBigStory must be used within a BigStoryProvider');
  }
  return context;
};

export const BigStoryProvider = ({ children }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(null);

  // Load sections from localStorage or use default data
  useEffect(() => {
    loadSections();
  }, []);

  // Save to localStorage when sections change
  useEffect(() => {
    if (!loading && sections.length > 0) {
      localStorage.setItem('big-story-sections', JSON.stringify(sections));
    }
  }, [sections, loading]);

  const loadSections = () => {
    try {
      const saved = localStorage.getItem('big-story-sections');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSections(parsed);
      } else {
        // Use default data on first load
        setSections(bigStorySections);
      }
    } catch (error) {
      console.error('Error loading big story sections:', error);
      // Fall back to default data
      setSections(bigStorySections);
    } finally {
      setLoading(false);
    }
  };

  const getSectionBySlug = (slug) => {
    return sections.find((section) => section.sectionSlug === slug);
  };

  const getSectionById = (id) => {
    return sections.find((section) => section.id === id);
  };

  const getNextSection = (currentSlug) => {
    const currentIndex = sections.findIndex(
      (section) => section.sectionSlug === currentSlug
    );
    if (currentIndex === -1 || currentIndex === sections.length - 1) {
      return null;
    }
    return sections[currentIndex + 1];
  };

  const getPreviousSection = (currentSlug) => {
    const currentIndex = sections.findIndex(
      (section) => section.sectionSlug === currentSlug
    );
    if (currentIndex <= 0) {
      return null;
    }
    return sections[currentIndex - 1];
  };

  const updateSection = (sectionId, updates) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    );
  };

  const resetToDefault = () => {
    setSections(bigStorySections);
    localStorage.setItem('big-story-sections', JSON.stringify(bigStorySections));
  };

  const value = {
    sections,
    loading,
    currentSection,
    setCurrentSection,
    getSectionBySlug,
    getSectionById,
    getNextSection,
    getPreviousSection,
    updateSection,
    resetToDefault,
  };

  return (
    <BigStoryContext.Provider value={value}>
      {children}
    </BigStoryContext.Provider>
  );
};
