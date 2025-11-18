import React, { createContext, useState, useContext, useEffect } from 'react';

// Available Bible translations from scripture.api.bible
export const AVAILABLE_TRANSLATIONS = [
  { id: 'de4e12af7f28f599-02', code: 'NIV', name: 'New International Version', language: 'English' },
  { id: '06125adad2d5898a-01', code: 'KJV', name: 'King James Version', language: 'English' },
  { id: '01b29f36342e1091-01', code: 'ESV', name: 'English Standard Version', language: 'English' },
  { id: 'de4e12af7f28f599-01', code: 'NKJV', name: 'New King James Version', language: 'English' },
  { id: '7142879509583d59-04', code: 'NLT', name: 'New Living Translation', language: 'English' },
  { id: '685d1470fe4d5c3b-01', code: 'NASB', name: 'New American Standard Bible', language: 'English' },
  { id: 'c315fa9f71d4af3a-01', code: 'MSG', name: 'The Message', language: 'English' },
  { id: '40072c4a5aba4022-01', code: 'CSB', name: 'Christian Standard Bible', language: 'English' },
  { id: '9879dbb7cfe39e4d-04', code: 'NRSV', name: 'New Revised Standard Version', language: 'English' },
  { id: '01b29f36342e1091-02', code: 'AMP', name: 'Amplified Bible', language: 'English' }
];

const TranslationContext = createContext();

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  // Load preferences from localStorage or use defaults
  const [primaryTranslation, setPrimaryTranslation] = useState(() => {
    const saved = localStorage.getItem('primary-translation');
    return saved || 'de4e12af7f28f599-02'; // Default to NIV
  });

  const [secondaryTranslation, setSecondaryTranslation] = useState(() => {
    const saved = localStorage.getItem('secondary-translation');
    return saved || '06125adad2d5898a-01'; // Default to KJV
  });

  const [parallelModeEnabled, setParallelModeEnabled] = useState(() => {
    const saved = localStorage.getItem('parallel-mode-enabled');
    return saved === 'true';
  });

  // Persist to localStorage whenever preferences change
  useEffect(() => {
    localStorage.setItem('primary-translation', primaryTranslation);
  }, [primaryTranslation]);

  useEffect(() => {
    localStorage.setItem('secondary-translation', secondaryTranslation);
  }, [secondaryTranslation]);

  useEffect(() => {
    localStorage.setItem('parallel-mode-enabled', parallelModeEnabled);
  }, [parallelModeEnabled]);

  // Helper functions to get translation info
  const getTranslationById = (id) => {
    return AVAILABLE_TRANSLATIONS.find(t => t.id === id) || AVAILABLE_TRANSLATIONS[0];
  };

  const getPrimaryTranslationInfo = () => getTranslationById(primaryTranslation);
  const getSecondaryTranslationInfo = () => getTranslationById(secondaryTranslation);

  const toggleParallelMode = () => {
    setParallelModeEnabled(prev => !prev);
  };

  const value = {
    // Translation IDs
    primaryTranslation,
    secondaryTranslation,

    // Translation setters
    setPrimaryTranslation,
    setSecondaryTranslation,

    // Parallel mode
    parallelModeEnabled,
    setParallelModeEnabled,
    toggleParallelMode,

    // Helper functions
    getTranslationById,
    getPrimaryTranslationInfo,
    getSecondaryTranslationInfo,

    // Available translations list
    availableTranslations: AVAILABLE_TRANSLATIONS
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationContext;
