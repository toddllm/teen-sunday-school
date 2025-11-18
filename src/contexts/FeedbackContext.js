import React, { createContext, useContext, useState, useEffect } from 'react';

const FeedbackContext = createContext();

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export const FeedbackProvider = ({ children }) => {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load feedback from localStorage on mount
  useEffect(() => {
    const storedFeedback = localStorage.getItem('sunday-school-feedback');
    if (storedFeedback) {
      try {
        setFeedbackItems(JSON.parse(storedFeedback));
      } catch (error) {
        console.error('Error loading feedback:', error);
        setFeedbackItems([]);
      }
    }
    setLoading(false);
  }, []);

  // Save feedback to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('sunday-school-feedback', JSON.stringify(feedbackItems));
    }
  }, [feedbackItems, loading]);

  // Add new feedback
  const addFeedback = (feedback) => {
    const newFeedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: feedback.name || 'Anonymous',
      email: feedback.email || '',
      category: feedback.category,
      subject: feedback.subject,
      message: feedback.message,
      status: 'new',
      priority: feedback.priority || 'medium',
      assignedTo: '',
      tags: [],
      adminNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setFeedbackItems(prev => [newFeedback, ...prev]);
    return newFeedback;
  };

  // Update feedback (for admin actions)
  const updateFeedback = (id, updates) => {
    setFeedbackItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  // Delete feedback
  const deleteFeedback = (id) => {
    setFeedbackItems(prev => prev.filter(item => item.id !== id));
  };

  // Get feedback by ID
  const getFeedbackById = (id) => {
    return feedbackItems.find(item => item.id === id);
  };

  // Get feedback statistics
  const getStats = () => {
    const total = feedbackItems.length;
    const newCount = feedbackItems.filter(item => item.status === 'new').length;
    const reviewingCount = feedbackItems.filter(item => item.status === 'reviewing').length;
    const resolvedCount = feedbackItems.filter(item => item.status === 'resolved').length;

    const byCategory = {
      bug: feedbackItems.filter(item => item.category === 'bug').length,
      feature: feedbackItems.filter(item => item.category === 'feature').length,
      general: feedbackItems.filter(item => item.category === 'general').length,
      content: feedbackItems.filter(item => item.category === 'content').length
    };

    return {
      total,
      newCount,
      reviewingCount,
      resolvedCount,
      byCategory
    };
  };

  // Get filtered feedback
  const getFilteredFeedback = (filters = {}) => {
    let filtered = [...feedbackItems];

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    if (filters.priority) {
      filtered = filtered.filter(item => item.priority === filters.priority);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.subject.toLowerCase().includes(term) ||
        item.message.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const value = {
    feedbackItems,
    loading,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    getFeedbackById,
    getStats,
    getFilteredFeedback
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};
