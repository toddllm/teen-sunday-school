import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAllCommentarySources,
  getCommentaryForPassage,
  getEnabledSourceIds,
  saveEnabledSourceIds
} from '../services/commentaryService';

const CommentaryContext = createContext();

export const useCommentary = () => {
  const context = useContext(CommentaryContext);
  if (!context) {
    throw new Error('useCommentary must be used within a CommentaryProvider');
  }
  return context;
};

export const CommentaryProvider = ({ children }) => {
  const [commentarySources, setCommentarySources] = useState([]);
  const [enabledSourceIds, setEnabledSourceIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load commentary sources and enabled settings on mount
  useEffect(() => {
    const sources = getAllCommentarySources();
    setCommentarySources(sources);

    const enabled = getEnabledSourceIds();
    setEnabledSourceIds(enabled);
  }, []);

  /**
   * Fetches commentary for a specific passage
   * @param {string} passageRef - Verse reference in format "JHN.3.16"
   * @returns {Array} Array of commentary entries
   */
  const fetchCommentary = (passageRef) => {
    setLoading(true);
    try {
      const entries = getCommentaryForPassage(passageRef, enabledSourceIds);
      return entries;
    } catch (error) {
      console.error('Error fetching commentary:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggles a commentary source on/off
   * @param {number} sourceId - ID of the source to toggle
   */
  const toggleSource = (sourceId) => {
    setEnabledSourceIds(prev => {
      let updated;
      if (prev.includes(sourceId)) {
        // Remove source
        updated = prev.filter(id => id !== sourceId);
      } else {
        // Add source
        updated = [...prev, sourceId];
      }
      saveEnabledSourceIds(updated);
      return updated;
    });
  };

  /**
   * Enables all commentary sources
   */
  const enableAllSources = () => {
    const allIds = commentarySources.map(s => s.id);
    setEnabledSourceIds(allIds);
    saveEnabledSourceIds(allIds);
  };

  /**
   * Disables all commentary sources
   */
  const disableAllSources = () => {
    setEnabledSourceIds([]);
    saveEnabledSourceIds([]);
  };

  /**
   * Checks if a source is enabled
   * @param {number} sourceId - ID of the source to check
   * @returns {boolean} Whether the source is enabled
   */
  const isSourceEnabled = (sourceId) => {
    return enabledSourceIds.includes(sourceId);
  };

  const value = {
    commentarySources,
    enabledSourceIds,
    loading,
    fetchCommentary,
    toggleSource,
    enableAllSources,
    disableAllSources,
    isSourceEnabled
  };

  return (
    <CommentaryContext.Provider value={value}>
      {children}
    </CommentaryContext.Provider>
  );
};
