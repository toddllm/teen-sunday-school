import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

// Base Bible translations from scripture.api.bible
export const BASE_TRANSLATIONS = [
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

// Initialize translation configurations with admin settings
const initializeTranslationConfigs = () => {
  const stored = localStorage.getItem('translation-configs');
  if (stored) {
    return JSON.parse(stored);
  }

  // Default: all translations enabled globally
  return BASE_TRANSLATIONS.map(t => ({
    ...t,
    isEnabled: true,
    allowedRegions: [], // Empty array = available globally
    licenseNotes: ''
  }));
};

// Maintain backward compatibility
export const AVAILABLE_TRANSLATIONS = BASE_TRANSLATIONS;

const TranslationContext = createContext();

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  // Translation configurations (admin-managed)
  const [translationConfigs, setTranslationConfigs] = useState(initializeTranslationConfigs);

  // User's current region (could be detected via IP geolocation API in production)
  const [userRegion, setUserRegion] = useState(() => {
    const saved = localStorage.getItem('user-region');
    return saved || 'US'; // Default to US
  });

  // Translation usage analytics
  const [translationUsage, setTranslationUsage] = useState(() => {
    const saved = localStorage.getItem('translation-usage');
    return saved ? JSON.parse(saved) : {};
  });

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

  // Persist translation configs to localStorage
  useEffect(() => {
    localStorage.setItem('translation-configs', JSON.stringify(translationConfigs));
  }, [translationConfigs]);

  // Persist user region to localStorage
  useEffect(() => {
    localStorage.setItem('user-region', userRegion);
  }, [userRegion]);

  // Persist translation usage to localStorage
  useEffect(() => {
    localStorage.setItem('translation-usage', JSON.stringify(translationUsage));
  }, [translationUsage]);

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

  // Get available translations for the current user's region (cached with useMemo)
  const availableTranslations = useMemo(() => {
    return translationConfigs.filter(config => {
      // Must be enabled
      if (!config.isEnabled) return false;

      // If no region restrictions, available globally
      if (!config.allowedRegions || config.allowedRegions.length === 0) return true;

      // Check if user's region is in allowed list
      return config.allowedRegions.includes(userRegion);
    });
  }, [translationConfigs, userRegion]);

  // Helper functions to get translation info
  const getTranslationById = (id) => {
    const config = translationConfigs.find(t => t.id === id);
    if (config) return config;
    // Fallback to base translations for backward compatibility
    return AVAILABLE_TRANSLATIONS.find(t => t.id === id) || AVAILABLE_TRANSLATIONS[0];
  };

  const getPrimaryTranslationInfo = () => getTranslationById(primaryTranslation);
  const getSecondaryTranslationInfo = () => getTranslationById(secondaryTranslation);

  const toggleParallelMode = () => {
    setParallelModeEnabled(prev => !prev);
  };

  // Track translation usage for analytics
  const trackTranslationUsage = (translationId) => {
    setTranslationUsage(prev => {
      const current = prev[translationId] || 0;
      return { ...prev, [translationId]: current + 1 };
    });
  };

  // Admin functions for managing translation configurations
  const updateTranslationConfig = (translationId, updates) => {
    setTranslationConfigs(prev =>
      prev.map(config =>
        config.id === translationId ? { ...config, ...updates } : config
      )
    );
  };

  const toggleTranslationEnabled = (translationId) => {
    setTranslationConfigs(prev =>
      prev.map(config =>
        config.id === translationId ? { ...config, isEnabled: !config.isEnabled } : config
      )
    );
  };

  const setTranslationRegions = (translationId, regions) => {
    setTranslationConfigs(prev =>
      prev.map(config =>
        config.id === translationId ? { ...config, allowedRegions: regions } : config
      )
    );
  };

  const resetTranslationConfigs = () => {
    const defaultConfigs = BASE_TRANSLATIONS.map(t => ({
      ...t,
      isEnabled: true,
      allowedRegions: [],
      licenseNotes: ''
    }));
    setTranslationConfigs(defaultConfigs);
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

    // Available translations list (filtered by region and enabled status)
    availableTranslations,

    // Admin: Translation configurations
    translationConfigs,
    updateTranslationConfig,
    toggleTranslationEnabled,
    setTranslationRegions,
    resetTranslationConfigs,

    // User region
    userRegion,
    setUserRegion,

    // Analytics
    translationUsage,
    trackTranslationUsage
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationContext;
