import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  // High Contrast Mode
  const [highContrast, setHighContrast] = useState(() => {
    const saved = localStorage.getItem('accessibility-high-contrast');
    if (saved !== null) {
      return saved === 'true';
    }
    // Default to false - user must explicitly enable
    return false;
  });

  // Reduced Motion Mode
  const [reduceMotion, setReduceMotion] = useState(() => {
    const saved = localStorage.getItem('accessibility-reduce-motion');
    if (saved !== null) {
      return saved === 'true';
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return false;
  });

  // Apply accessibility attributes to document
  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
    localStorage.setItem('accessibility-high-contrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.setAttribute('data-reduce-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduce-motion');
    }
    localStorage.setItem('accessibility-reduce-motion', reduceMotion.toString());
  }, [reduceMotion]);

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const toggleReduceMotion = () => {
    setReduceMotion(prev => !prev);
  };

  // Check if system prefers reduced motion
  const systemPrefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Dyslexia-friendly mode
  const [dyslexiaFriendly, setDyslexiaFriendly] = useState(() => {
    const saved = localStorage.getItem('dyslexiaFriendly');
    return saved === 'true';
  });

  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('fontSize');
    return saved || 'medium';
  });

  const [lineSpacing, setLineSpacing] = useState(() => {
    const saved = localStorage.getItem('lineSpacing');
    return saved || 'normal';
  });

  useEffect(() => {
    // Apply dyslexia-friendly mode to document
    if (dyslexiaFriendly) {
      document.documentElement.setAttribute('data-dyslexia', 'true');
    } else {
      document.documentElement.removeAttribute('data-dyslexia');
    }

    // Save to localStorage
    localStorage.setItem('dyslexiaFriendly', dyslexiaFriendly);
  }, [dyslexiaFriendly]);

  useEffect(() => {
    // Apply font size to document
    document.documentElement.setAttribute('data-font-size', fontSize);

    // Save to localStorage
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    // Apply line spacing to document
    document.documentElement.setAttribute('data-line-spacing', lineSpacing);

    // Save to localStorage
    localStorage.setItem('lineSpacing', lineSpacing);
  }, [lineSpacing]);

  const toggleDyslexiaMode = () => {
    setDyslexiaFriendly(prev => !prev);
  };

  const value = {
    highContrast,
    reduceMotion,
    toggleHighContrast,
    toggleReduceMotion,
    systemPrefersReducedMotion,
    dyslexiaFriendly,
    fontSize,
    lineSpacing,
    toggleDyslexiaMode,
    setFontSize,
    setLineSpacing
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
