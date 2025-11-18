import React, { createContext, useState, useContext, useEffect } from 'react';

// Reading speed presets
export const READING_SPEED_PRESETS = [
  { id: 'slow', label: 'Slow (150 WPM)', wpm: 150, description: 'For careful study and meditation' },
  { id: 'average', label: 'Average (200 WPM)', wpm: 200, description: 'Standard reading pace' },
  { id: 'fast', label: 'Fast (250 WPM)', wpm: 250, description: 'For quick reading' },
  { id: 'very-fast', label: 'Very Fast (300 WPM)', wpm: 300, description: 'Speed reading' },
  { id: 'custom', label: 'Custom', wpm: 200, description: 'Set your own pace' }
];

const ReadingMetricsContext = createContext();

export const useReadingMetrics = () => {
  const context = useContext(ReadingMetricsContext);
  if (!context) {
    throw new Error('useReadingMetrics must be used within a ReadingMetricsProvider');
  }
  return context;
};

export const ReadingMetricsProvider = ({ children }) => {
  // Load preferences from localStorage or use defaults
  const [readingSpeedPreset, setReadingSpeedPreset] = useState(() => {
    const saved = localStorage.getItem('reading-speed-preset');
    return saved || 'average';
  });

  const [customReadingSpeed, setCustomReadingSpeed] = useState(() => {
    const saved = localStorage.getItem('custom-reading-speed');
    return saved ? parseInt(saved, 10) : 200;
  });

  const [showMetrics, setShowMetrics] = useState(() => {
    const saved = localStorage.getItem('show-reading-metrics');
    return saved !== 'false'; // Default to true
  });

  const [showDifficulty, setShowDifficulty] = useState(() => {
    const saved = localStorage.getItem('show-difficulty');
    return saved !== 'false'; // Default to true
  });

  const [showReadingTime, setShowReadingTime] = useState(() => {
    const saved = localStorage.getItem('show-reading-time');
    return saved !== 'false'; // Default to true
  });

  // Persist to localStorage whenever preferences change
  useEffect(() => {
    localStorage.setItem('reading-speed-preset', readingSpeedPreset);
  }, [readingSpeedPreset]);

  useEffect(() => {
    localStorage.setItem('custom-reading-speed', customReadingSpeed.toString());
  }, [customReadingSpeed]);

  useEffect(() => {
    localStorage.setItem('show-reading-metrics', showMetrics.toString());
  }, [showMetrics]);

  useEffect(() => {
    localStorage.setItem('show-difficulty', showDifficulty.toString());
  }, [showDifficulty]);

  useEffect(() => {
    localStorage.setItem('show-reading-time', showReadingTime.toString());
  }, [showReadingTime]);

  // Get current words per minute based on preset or custom
  const getWordsPerMinute = () => {
    if (readingSpeedPreset === 'custom') {
      return customReadingSpeed;
    }

    const preset = READING_SPEED_PRESETS.find(p => p.id === readingSpeedPreset);
    return preset ? preset.wpm : 200;
  };

  // Helper functions
  const getCurrentPresetInfo = () => {
    return READING_SPEED_PRESETS.find(p => p.id === readingSpeedPreset) || READING_SPEED_PRESETS[1];
  };

  const updateReadingSpeed = (presetId, customWpm = null) => {
    setReadingSpeedPreset(presetId);
    if (presetId === 'custom' && customWpm !== null) {
      setCustomReadingSpeed(customWpm);
    }
  };

  const toggleMetrics = () => {
    setShowMetrics(prev => !prev);
  };

  const toggleDifficulty = () => {
    setShowDifficulty(prev => !prev);
  };

  const toggleReadingTime = () => {
    setShowReadingTime(prev => !prev);
  };

  const value = {
    // Reading speed settings
    readingSpeedPreset,
    customReadingSpeed,
    setReadingSpeedPreset,
    setCustomReadingSpeed,
    updateReadingSpeed,

    // Display preferences
    showMetrics,
    showDifficulty,
    showReadingTime,
    setShowMetrics,
    setShowDifficulty,
    setShowReadingTime,
    toggleMetrics,
    toggleDifficulty,
    toggleReadingTime,

    // Helper functions
    getWordsPerMinute,
    getCurrentPresetInfo,

    // Available presets
    availablePresets: READING_SPEED_PRESETS
  };

  return (
    <ReadingMetricsContext.Provider value={value}>
      {children}
    </ReadingMetricsContext.Provider>
  );
};

export default ReadingMetricsContext;
