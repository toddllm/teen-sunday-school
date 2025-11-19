import React, { createContext, useContext, useState, useEffect } from 'react';

const ReadingPreferencesContext = createContext();

// Font size options (in rem units)
export const FONT_SIZES = {
  SMALL: { label: 'Small', value: 0.9 },
  MEDIUM: { label: 'Medium', value: 1.0 },
  LARGE: { label: 'Large', value: 1.15 },
  EXTRA_LARGE: { label: 'Extra Large', value: 1.3 }
};

// Line spacing options
export const LINE_SPACINGS = {
  COMPACT: { label: 'Compact', value: 1.4 },
  NORMAL: { label: 'Normal', value: 1.6 },
  RELAXED: { label: 'Relaxed', value: 1.8 },
  SPACIOUS: { label: 'Spacious', value: 2.0 }
};

// Reading themes
export const READING_THEMES = {
  LIGHT: { label: 'Light', value: 'light' },
  DARK: { label: 'Dark', value: 'dark' },
  SEPIA: { label: 'Sepia', value: 'sepia' }
};

const DEFAULT_PREFERENCES = {
  fontSize: FONT_SIZES.MEDIUM.value,
  lineSpacing: LINE_SPACINGS.NORMAL.value,
  theme: READING_THEMES.LIGHT.value,
  focusModeDefault: false
};

export function ReadingPreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem('reading-preferences');
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Error loading reading preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  });

  const [focusModeActive, setFocusModeActive] = useState(false);

  // Persist preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('reading-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving reading preferences:', error);
    }
  }, [preferences]);

  // Update individual preference
  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update multiple preferences at once
  const updatePreferences = (updates) => {
    setPreferences(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Reset to defaults
  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  // Toggle focus mode
  const toggleFocusMode = () => {
    setFocusModeActive(prev => !prev);
  };

  // Set focus mode
  const setFocusMode = (active) => {
    setFocusModeActive(active);
  };

  // Get style object for applying to reading content
  const getReadingStyles = () => ({
    fontSize: `${preferences.fontSize}rem`,
    lineHeight: preferences.lineSpacing
  });

  const value = {
    preferences,
    focusModeActive,
    updatePreference,
    updatePreferences,
    resetPreferences,
    toggleFocusMode,
    setFocusMode,
    getReadingStyles,
    FONT_SIZES,
    LINE_SPACINGS,
    READING_THEMES
  };

  return (
    <ReadingPreferencesContext.Provider value={value}>
      {children}
    </ReadingPreferencesContext.Provider>
  );
}

export function useReadingPreferences() {
  const context = useContext(ReadingPreferencesContext);
  if (!context) {
    throw new Error('useReadingPreferences must be used within ReadingPreferencesProvider');
  }
  return context;
}
