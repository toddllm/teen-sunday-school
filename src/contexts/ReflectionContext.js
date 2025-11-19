import React, { createContext, useContext, useState, useEffect } from 'react';

const ReflectionContext = createContext();

// Pre-defined reflection prompts categorized by theme
export const DEFAULT_PROMPTS = [
  {
    id: 'general-1',
    text: 'What does this passage teach you about God\'s character?',
    category: 'general',
    source: 'manual'
  },
  {
    id: 'general-2',
    text: 'How can you apply this passage to your life today?',
    category: 'general',
    source: 'manual'
  },
  {
    id: 'general-3',
    text: 'What verse stood out to you most, and why?',
    category: 'general',
    source: 'manual'
  },
  {
    id: 'prayer-1',
    text: 'Based on this passage, what is God calling you to pray about?',
    category: 'prayer',
    source: 'manual'
  },
  {
    id: 'prayer-2',
    text: 'How does this passage change the way you think about prayer?',
    category: 'prayer',
    source: 'manual'
  },
  {
    id: 'action-1',
    text: 'What specific action can you take this week based on this teaching?',
    category: 'action',
    source: 'manual'
  },
  {
    id: 'action-2',
    text: 'Who in your life needs to hear about what you learned today?',
    category: 'action',
    source: 'manual'
  },
  {
    id: 'thankfulness-1',
    text: 'What in this passage can you thank God for today?',
    category: 'thankfulness',
    source: 'manual'
  },
  {
    id: 'challenge-1',
    text: 'What part of this passage challenges you or makes you uncomfortable? Why?',
    category: 'challenge',
    source: 'manual'
  },
  {
    id: 'challenge-2',
    text: 'What questions does this passage raise for you?',
    category: 'challenge',
    source: 'manual'
  },
  {
    id: 'community-1',
    text: 'How can this passage help you love and serve others better?',
    category: 'community',
    source: 'manual'
  },
  {
    id: 'worship-1',
    text: 'How does this passage increase your worship and awe of God?',
    category: 'worship',
    source: 'manual'
  }
];

export const useReflection = () => {
  const context = useContext(ReflectionContext);
  if (!context) {
    throw new Error('useReflection must be used within a ReflectionProvider');
  }
  return context;
};

export const ReflectionProvider = ({ children }) => {
  const [responses, setResponses] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('reflectionData');
      if (savedData) {
        const data = JSON.parse(savedData);
        setResponses(data.responses || []);
        setSavedForLater(data.savedForLater || []);
      }
    } catch (error) {
      console.error('Error loading reflection data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      const data = {
        responses,
        savedForLater
      };
      localStorage.setItem('reflectionData', JSON.stringify(data));
    }
  }, [responses, savedForLater, loading]);

  // Get prompts for a specific passage (returns 2-3 prompts)
  const getPromptsForPassage = (passageRef) => {
    // Select a good mix of prompts (general, prayer/action, and challenge)
    const generalPrompts = DEFAULT_PROMPTS.filter(p => p.category === 'general');
    const actionPrompts = DEFAULT_PROMPTS.filter(p => ['prayer', 'action', 'community'].includes(p.category));
    const deeperPrompts = DEFAULT_PROMPTS.filter(p => ['challenge', 'worship', 'thankfulness'].includes(p.category));

    // Pick one from each category randomly
    const selectedPrompts = [
      generalPrompts[Math.floor(Math.random() * generalPrompts.length)],
      actionPrompts[Math.floor(Math.random() * actionPrompts.length)],
      deeperPrompts[Math.floor(Math.random() * deeperPrompts.length)]
    ];

    return selectedPrompts.filter(Boolean);
  };

  // Save a reflection response
  const saveResponse = (promptId, responseText, passageRef) => {
    const newResponse = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      promptId,
      responseText,
      passageRef,
      createdAt: new Date().toISOString()
    };

    setResponses([...responses, newResponse]);

    // Remove from saved for later if it was there
    removeSavedForLater(passageRef);

    return newResponse;
  };

  // Save prompts for later
  const saveForLater = (passageRef, prompts) => {
    const newSaved = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      passageRef,
      prompts,
      savedAt: new Date().toISOString()
    };

    setSavedForLater([...savedForLater, newSaved]);
    return newSaved;
  };

  // Remove from saved for later
  const removeSavedForLater = (passageRef) => {
    setSavedForLater(savedForLater.filter(item => item.passageRef !== passageRef));
  };

  // Get all responses for a specific passage
  const getResponsesForPassage = (passageRef) => {
    return responses.filter(r => r.passageRef === passageRef);
  };

  // Get recent responses (for display on reflection page)
  const getRecentResponses = (limit = 10) => {
    return [...responses]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  };

  // Get analytics data
  const getAnalytics = () => {
    // Response completion rate (responses vs total prompts shown)
    const totalPromptsSeen = responses.length + savedForLater.length;
    const completionRate = totalPromptsSeen > 0
      ? (responses.length / totalPromptsSeen * 100).toFixed(1)
      : 0;

    // Most engaged prompts
    const promptEngagement = {};
    responses.forEach(r => {
      promptEngagement[r.promptId] = (promptEngagement[r.promptId] || 0) + 1;
    });

    const topPrompts = Object.entries(promptEngagement)
      .map(([promptId, count]) => ({
        prompt: DEFAULT_PROMPTS.find(p => p.id === promptId),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Responses by category
    const categoryStats = {};
    responses.forEach(r => {
      const prompt = DEFAULT_PROMPTS.find(p => p.id === r.promptId);
      if (prompt) {
        categoryStats[prompt.category] = (categoryStats[prompt.category] || 0) + 1;
      }
    });

    return {
      totalResponses: responses.length,
      completionRate,
      savedForLaterCount: savedForLater.length,
      topPrompts,
      categoryStats
    };
  };

  // Check if user has responded to passage
  const hasRespondedToPassage = (passageRef) => {
    return responses.some(r => r.passageRef === passageRef);
  };

  // Delete a response
  const deleteResponse = (responseId) => {
    setResponses(responses.filter(r => r.id !== responseId));
  };

  // Get prompt by ID
  const getPromptById = (promptId) => {
    return DEFAULT_PROMPTS.find(p => p.id === promptId);
  };

  const value = {
    responses,
    savedForLater,
    loading,
    getPromptsForPassage,
    saveResponse,
    saveForLater,
    removeSavedForLater,
    getResponsesForPassage,
    getRecentResponses,
    getAnalytics,
    hasRespondedToPassage,
    deleteResponse,
    getPromptById,
    DEFAULT_PROMPTS
  };

  return (
    <ReflectionContext.Provider value={value}>
      {children}
    </ReflectionContext.Provider>
  );
};
