import React, { useState } from 'react';
import { useReadingPreferences } from '../contexts/ReadingPreferencesContext';
import { useNavigate } from 'react-router-dom';
import './ReadingControlsMenu.css';

const ReadingControlsMenu = () => {
  const navigate = useNavigate();
  const {
    preferences,
    focusModeActive,
    updatePreference,
    toggleFocusMode,
    FONT_SIZES,
    LINE_SPACINGS,
    READING_THEMES
  } = useReadingPreferences();

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleFontSizeChange = (value) => {
    updatePreference('fontSize', value);
  };

  const handleLineSpacingChange = (value) => {
    updatePreference('lineSpacing', value);
  };

  const handleThemeChange = (value) => {
    updatePreference('theme', value);
  };

  const goToSettings = () => {
    setIsOpen(false);
    navigate('/settings/reading');
  };

  return (
    <div className="reading-controls-container">
      <button
        className={`reading-controls-toggle ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Reading controls"
        title="Adjust reading preferences"
      >
        Aa
      </button>

      {isOpen && (
        <div className="reading-controls-menu">
          <div className="reading-controls-header">
            <h3>Reading Options</h3>
            <button
              className="close-button"
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <div className="reading-controls-content">
            {/* Font Size Control */}
            <div className="control-section">
              <label className="control-label">
                <span className="control-icon">A</span>
                Font Size
              </label>
              <div className="button-group">
                {Object.values(FONT_SIZES).map(fs => (
                  <button
                    key={fs.label}
                    className={`control-button ${preferences.fontSize === fs.value ? 'active' : ''}`}
                    onClick={() => handleFontSizeChange(fs.value)}
                    title={fs.label}
                  >
                    {fs.label.charAt(0)}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Spacing Control */}
            <div className="control-section">
              <label className="control-label">
                <span className="control-icon">≡</span>
                Line Spacing
              </label>
              <div className="button-group">
                {Object.values(LINE_SPACINGS).map(ls => (
                  <button
                    key={ls.label}
                    className={`control-button ${preferences.lineSpacing === ls.value ? 'active' : ''}`}
                    onClick={() => handleLineSpacingChange(ls.value)}
                    title={ls.label}
                  >
                    {ls.label.charAt(0)}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Control */}
            <div className="control-section">
              <label className="control-label">
                <span className="control-icon">◐</span>
                Theme
              </label>
              <div className="theme-buttons">
                {Object.values(READING_THEMES).map(theme => (
                  <button
                    key={theme.value}
                    className={`theme-button theme-${theme.value} ${preferences.theme === theme.value ? 'active' : ''}`}
                    onClick={() => handleThemeChange(theme.value)}
                    title={theme.label}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Mode Toggle */}
            <div className="control-section">
              <button
                className={`focus-mode-button ${focusModeActive ? 'active' : ''}`}
                onClick={toggleFocusMode}
              >
                <span className="focus-icon">🎯</span>
                <span className="focus-text">
                  Focus Mode {focusModeActive ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* More Settings Link */}
            <div className="control-section">
              <button
                className="more-settings-button"
                onClick={goToSettings}
              >
                More Settings →
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="reading-controls-overlay"
          onClick={toggleMenu}
        />
      )}
    </div>
  );
};

export default ReadingControlsMenu;
