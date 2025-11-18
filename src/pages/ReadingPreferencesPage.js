import React, { useState } from 'react';
import { useReadingPreferences } from '../contexts/ReadingPreferencesContext';
import { useNavigate } from 'react-router-dom';
import './ReadingPreferencesPage.css';

const ReadingPreferencesPage = () => {
  const navigate = useNavigate();
  const {
    preferences,
    updatePreferences,
    resetPreferences,
    FONT_SIZES,
    LINE_SPACINGS,
    READING_THEMES
  } = useReadingPreferences();

  const [tempPreferences, setTempPreferences] = useState(preferences);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    updatePreferences(tempPreferences);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const handleReset = () => {
    setTempPreferences(preferences);
  };

  const handleResetToDefaults = () => {
    resetPreferences();
    setTempPreferences({
      fontSize: FONT_SIZES.MEDIUM.value,
      lineSpacing: LINE_SPACINGS.NORMAL.value,
      theme: READING_THEMES.LIGHT.value,
      focusModeDefault: false
    });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const updateTempPreference = (key, value) => {
    setTempPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const hasChanges = JSON.stringify(tempPreferences) !== JSON.stringify(preferences);

  // Get font size label
  const getFontSizeLabel = (value) => {
    return Object.values(FONT_SIZES).find(fs => fs.value === value)?.label || 'Custom';
  };

  // Get line spacing label
  const getLineSpacingLabel = (value) => {
    return Object.values(LINE_SPACINGS).find(ls => ls.value === value)?.label || 'Custom';
  };

  return (
    <div className="reading-preferences-page">
      <header className="settings-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Reading Preferences</h1>
        <p>Customize your Bible reading experience for comfort and accessibility</p>
      </header>

      {showSaved && (
        <div className="save-notification">
          Preferences saved successfully!
        </div>
      )}

      <div className="settings-container">
        {/* Font Size Section */}
        <section className="settings-section">
          <h2>Font Size</h2>
          <p className="section-description">
            Adjust the text size for comfortable reading
          </p>

          <div className="setting-item">
            <label htmlFor="font-size">
              <strong>Text Size: {getFontSizeLabel(tempPreferences.fontSize)}</strong>
              <span className="label-description">
                Current: {(tempPreferences.fontSize * 100).toFixed(0)}%
              </span>
            </label>
            <input
              type="range"
              id="font-size"
              min={FONT_SIZES.SMALL.value}
              max={FONT_SIZES.EXTRA_LARGE.value}
              step="0.05"
              value={tempPreferences.fontSize}
              onChange={(e) => updateTempPreference('fontSize', parseFloat(e.target.value))}
              className="slider"
            />
            <div className="size-labels">
              {Object.values(FONT_SIZES).map(fs => (
                <button
                  key={fs.label}
                  className={`size-button ${tempPreferences.fontSize === fs.value ? 'active' : ''}`}
                  onClick={() => updateTempPreference('fontSize', fs.value)}
                >
                  {fs.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Line Spacing Section */}
        <section className="settings-section">
          <h2>Line Spacing</h2>
          <p className="section-description">
            Adjust spacing between lines for easier reading
          </p>

          <div className="setting-item">
            <label htmlFor="line-spacing">
              <strong>Spacing: {getLineSpacingLabel(tempPreferences.lineSpacing)}</strong>
              <span className="label-description">
                Current: {tempPreferences.lineSpacing.toFixed(1)}
              </span>
            </label>
            <input
              type="range"
              id="line-spacing"
              min={LINE_SPACINGS.COMPACT.value}
              max={LINE_SPACINGS.SPACIOUS.value}
              step="0.1"
              value={tempPreferences.lineSpacing}
              onChange={(e) => updateTempPreference('lineSpacing', parseFloat(e.target.value))}
              className="slider"
            />
            <div className="size-labels">
              {Object.values(LINE_SPACINGS).map(ls => (
                <button
                  key={ls.label}
                  className={`size-button ${tempPreferences.lineSpacing === ls.value ? 'active' : ''}`}
                  onClick={() => updateTempPreference('lineSpacing', ls.value)}
                >
                  {ls.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <section className="settings-section">
          <h2>Reading Theme</h2>
          <p className="section-description">
            Choose a color theme for Bible reading (independent of app theme)
          </p>

          <div className="theme-options">
            {Object.values(READING_THEMES).map(theme => (
              <button
                key={theme.value}
                className={`theme-card ${tempPreferences.theme === theme.value ? 'active' : ''} theme-${theme.value}`}
                onClick={() => updateTempPreference('theme', theme.value)}
              >
                <div className="theme-preview">
                  <div className="theme-preview-text">Aa</div>
                </div>
                <div className="theme-label">{theme.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Focus Mode Section */}
        <section className="settings-section">
          <h2>Focus Mode</h2>
          <p className="section-description">
            Configure distraction-free reading experience
          </p>

          <div className="setting-item checkbox-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={tempPreferences.focusModeDefault}
                onChange={(e) => updateTempPreference('focusModeDefault', e.target.checked)}
              />
              <div>
                <strong>Enable Focus Mode by Default</strong>
                <span className="label-description">
                  Automatically hide navigation, footers, and non-essential UI when reading
                </span>
              </div>
            </label>
          </div>
        </section>

        {/* Preview Section */}
        <section className="settings-section preview-section">
          <h2>Preview</h2>
          <p className="section-description">
            See how your reading preferences will look
          </p>

          <div
            className={`preview-content theme-${tempPreferences.theme}`}
            style={{
              fontSize: `${tempPreferences.fontSize}rem`,
              lineHeight: tempPreferences.lineSpacing
            }}
          >
            <p className="preview-verse-ref">John 3:16</p>
            <p className="preview-verse-text">
              For God so loved the world that he gave his one and only Son,
              that whoever believes in him shall not perish but have eternal life.
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="settings-actions">
          <button
            onClick={handleReset}
            className="reset-button"
            disabled={!hasChanges}
          >
            Reset Changes
          </button>
          <button
            onClick={handleResetToDefaults}
            className="default-button"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            className="save-button"
            disabled={!hasChanges}
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h3>About Reading Preferences</h3>
        <div className="help-grid">
          <div className="help-item">
            <h4>Why customize reading settings?</h4>
            <p>
              Personalizing font size, spacing, and theme can significantly improve
              reading comfort and comprehension, especially during extended Bible study sessions.
            </p>
          </div>
          <div className="help-item">
            <h4>What is Focus Mode?</h4>
            <p>
              Focus Mode creates a distraction-free environment by hiding navigation
              and non-essential UI elements, allowing you to concentrate fully on Scripture.
              You can toggle it anytime with the 'Aa' button while reading.
            </p>
          </div>
          <div className="help-item">
            <h4>Accessibility benefits</h4>
            <p>
              These customization options help make Bible reading accessible for everyone,
              including users with visual impairments or reading difficulties. Larger text
              and increased spacing can reduce eye strain significantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingPreferencesPage;
