import React, { createContext, useState, useEffect, useContext } from 'react';

const KidsModeContext = createContext();

export const useKidsMode = () => {
  const context = useContext(KidsModeContext);
  if (!context) {
    throw new Error('useKidsMode must be used within a KidsModeProvider');
  }
  return context;
};

export const KidsModeProvider = ({ children }) => {
  const [kidsMode, setKidsMode] = useState(() => {
    const saved = localStorage.getItem('kids-mode-enabled');
    return saved === 'true';
  });

  const [parentalPin, setParentalPin] = useState(() => {
    return localStorage.getItem('kids-mode-pin') || null;
  });

  const [kidsModeStartTime, setKidsModeStartTime] = useState(() => {
    const saved = localStorage.getItem('kids-mode-start-time');
    return saved ? parseInt(saved, 10) : null;
  });

  const [analytics, setAnalytics] = useState(() => {
    const saved = localStorage.getItem('kids-mode-analytics');
    return saved ? JSON.parse(saved) : {
      totalUsageTime: 0,
      storiesCompleted: [],
      sessionsCount: 0,
      lastSessionDate: null
    };
  });

  // Save kids mode state
  useEffect(() => {
    localStorage.setItem('kids-mode-enabled', kidsMode.toString());

    // Apply data attribute to DOM for CSS styling
    document.documentElement.setAttribute('data-kids-mode', kidsMode ? 'true' : 'false');
  }, [kidsMode]);

  // Save analytics
  useEffect(() => {
    localStorage.setItem('kids-mode-analytics', JSON.stringify(analytics));
  }, [analytics]);

  // Track session time when kids mode is active
  useEffect(() => {
    if (kidsMode && kidsModeStartTime) {
      const interval = setInterval(() => {
        // Update analytics periodically (add 10 seconds every 10 seconds)
        setAnalytics(prev => ({
          ...prev,
          totalUsageTime: prev.totalUsageTime + 10
        }));
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [kidsMode, kidsModeStartTime]);

  const setupPin = (pin) => {
    if (pin && pin.length >= 4) {
      localStorage.setItem('kids-mode-pin', pin);
      setParentalPin(pin);
      return true;
    }
    return false;
  };

  const verifyPin = (inputPin) => {
    return inputPin === parentalPin;
  };

  const enableKidsMode = () => {
    const startTime = Date.now();
    setKidsMode(true);
    setKidsModeStartTime(startTime);
    localStorage.setItem('kids-mode-start-time', startTime.toString());

    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      sessionsCount: prev.sessionsCount + 1,
      lastSessionDate: new Date().toISOString()
    }));
  };

  const disableKidsMode = () => {
    // Calculate session duration before disabling
    if (kidsModeStartTime) {
      const sessionDuration = Math.floor((Date.now() - kidsModeStartTime) / 1000);
      setAnalytics(prev => ({
        ...prev,
        totalUsageTime: prev.totalUsageTime + sessionDuration
      }));
    }

    setKidsMode(false);
    setKidsModeStartTime(null);
    localStorage.removeItem('kids-mode-start-time');
  };

  const markStoryCompleted = (storyId) => {
    setAnalytics(prev => ({
      ...prev,
      storiesCompleted: [...new Set([...prev.storiesCompleted, storyId])]
    }));
  };

  const resetPin = () => {
    localStorage.removeItem('kids-mode-pin');
    setParentalPin(null);
  };

  const getAnalytics = () => {
    const usageHours = Math.floor(analytics.totalUsageTime / 3600);
    const usageMinutes = Math.floor((analytics.totalUsageTime % 3600) / 60);

    return {
      ...analytics,
      formattedUsageTime: `${usageHours}h ${usageMinutes}m`,
      uniqueStoriesCompleted: analytics.storiesCompleted.length
    };
  };

  const value = {
    kidsMode,
    parentalPin,
    hasPinSetup: !!parentalPin,
    enableKidsMode,
    disableKidsMode,
    setupPin,
    verifyPin,
    resetPin,
    markStoryCompleted,
    getAnalytics,
    analytics: getAnalytics()
  };

  return (
    <KidsModeContext.Provider value={value}>
      {children}
    </KidsModeContext.Provider>
  );
};
