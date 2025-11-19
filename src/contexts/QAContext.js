import React, { createContext, useContext, useState, useEffect } from 'react';
import { askBibleQuestion, getSuggestedFollowUps } from '../services/openaiAPI';
import { getVerseText } from '../services/bibleAPI';

const QAContext = createContext();

const QA_STORAGE_KEY = 'bible-qa-history';

/**
 * QA Context Provider
 *
 * Manages Bible Q&A state including:
 * - Question history
 * - Answers with references
 * - User ratings
 * - Analytics
 */
export const QAProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(QA_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (err) {
      console.error('Error loading Q&A history:', err);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
      console.error('Error saving Q&A history:', err);
    }
  }, [history]);

  /**
   * Ask a new question and get an AI-powered answer
   *
   * @param {string} question - The user's question
   * @param {string|null} userId - Optional user ID for tracking
   * @returns {Promise<Object>} - The Q&A entry with answer
   */
  const askQuestion = async (question, userId = null) => {
    setLoading(true);
    setError(null);

    try {
      // Get AI response
      const aiResponse = await askBibleQuestion(question);

      // Fetch actual Bible verse texts for the references
      const referencesWithText = await Promise.all(
        aiResponse.references.map(async (ref) => {
          try {
            const verseText = await getVerseText(ref.verse);
            return {
              ...ref,
              text: verseText
            };
          } catch (err) {
            console.warn(`Could not fetch verse ${ref.verse}:`, err);
            return {
              ...ref,
              text: null
            };
          }
        })
      );

      // Get suggested follow-up questions
      const followUps = await getSuggestedFollowUps(question, aiResponse.answer);

      // Create Q&A entry
      const qaEntry = {
        id: Date.now().toString(),
        question,
        answer: aiResponse.answer,
        references: referencesWithText,
        themes: aiResponse.themes,
        followUpQuestions: followUps,
        userId,
        rating: null, // null, 'up', or 'down'
        createdAt: new Date().toISOString(),
        modelMetadata: {
          model: aiResponse.model,
          usage: aiResponse.usage
        }
      };

      // Add to history
      setHistory(prev => [qaEntry, ...prev]);

      setLoading(false);
      return qaEntry;
    } catch (err) {
      console.error('Error asking question:', err);
      setError(err.message || 'Failed to get answer. Please try again.');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Rate an answer (thumbs up/down)
   *
   * @param {string} qaId - The Q&A entry ID
   * @param {string} rating - 'up' or 'down'
   */
  const rateAnswer = (qaId, rating) => {
    setHistory(prev =>
      prev.map(entry =>
        entry.id === qaId
          ? { ...entry, rating }
          : entry
      )
    );
  };

  /**
   * Delete a Q&A entry from history
   *
   * @param {string} qaId - The Q&A entry ID
   */
  const deleteQA = (qaId) => {
    setHistory(prev => prev.filter(entry => entry.id !== qaId));
  };

  /**
   * Clear all Q&A history
   */
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all Q&A history? This cannot be undone.')) {
      setHistory([]);
    }
  };

  /**
   * Get Q&A entry by ID
   *
   * @param {string} qaId - The Q&A entry ID
   * @returns {Object|null} - The Q&A entry or null
   */
  const getQAById = (qaId) => {
    return history.find(entry => entry.id === qaId) || null;
  };

  /**
   * Get analytics/statistics
   *
   * @returns {Object} - Statistics object
   */
  const getStats = () => {
    const total = history.length;
    const rated = history.filter(entry => entry.rating !== null).length;
    const upvoted = history.filter(entry => entry.rating === 'up').length;
    const downvoted = history.filter(entry => entry.rating === 'down').length;

    // Most common themes
    const themeCount = {};
    history.forEach(entry => {
      entry.themes?.forEach(theme => {
        themeCount[theme] = (themeCount[theme] || 0) + 1;
      });
    });

    const topThemes = Object.entries(themeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));

    return {
      totalQuestions: total,
      ratedAnswers: rated,
      upvotes: upvoted,
      downvotes: downvoted,
      satisfactionRate: rated > 0 ? (upvoted / rated * 100).toFixed(1) : 0,
      topThemes
    };
  };

  const value = {
    history,
    loading,
    error,
    askQuestion,
    rateAnswer,
    deleteQA,
    clearHistory,
    getQAById,
    getStats
  };

  return (
    <QAContext.Provider value={value}>
      {children}
    </QAContext.Provider>
  );
};

/**
 * Hook to use QA context
 */
export const useQA = () => {
  const context = useContext(QAContext);
  if (!context) {
    throw new Error('useQA must be used within a QAProvider');
  }
  return context;
};

export default QAContext;
