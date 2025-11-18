import React, { useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useNavigate } from 'react-router-dom';
import './AccessibilitySettingsPage.css';

const AccessibilitySettingsPage = () => {
  const navigate = useNavigate();
  const {
    highContrast,
    reduceMotion,
    toggleHighContrast,
    toggleReduceMotion,
    systemPrefersReducedMotion
  } = useAccessibility();

  const [tempHighContrast, setTempHighContrast] = useState(highContrast);
  const [tempReduceMotion, setTempReduceMotion] = useState(reduceMotion);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    if (tempHighContrast !== highContrast) {
      toggleHighContrast();
    }
    if (tempReduceMotion !== reduceMotion) {
      toggleReduceMotion();
    }

    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const handleReset = () => {
    setTempHighContrast(highContrast);
    setTempReduceMotion(reduceMotion);
  };

  const hasChanges = tempHighContrast !== highContrast ||
    tempReduceMotion !== reduceMotion;

  return (
    <div className="accessibility-settings-page">
      <header className="settings-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Accessibility Settings</h1>
        <p>Configure display and motion preferences for better readability and comfort</p>
      </header>

      {showSaved && (
        <div className="save-notification">
          Settings saved successfully!
        </div>
      )}

      <div className="settings-container">
        <section className="settings-section">
          <h2>Visual Accessibility</h2>
          <p className="section-description">
            Enhance readability with high contrast colors and strong visual indicators
          </p>

          <div className="setting-item checkbox-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={tempHighContrast}
                onChange={(e) => setTempHighContrast(e.target.checked)}
              />
              <div>
                <strong>Enable High Contrast Mode</strong>
                <span className="label-description">
                  Uses stronger colors and bolder text for improved visibility.
                  Meets WCAG AAA accessibility standards.
                </span>
              </div>
            </label>
          </div>

          {tempHighContrast && (
            <div className="accessibility-info">
              <strong>High Contrast Mode is Active</strong>
              <p>All text and UI elements will use maximum contrast colors for better visibility.</p>
            </div>
          )}
        </section>

        <section className="settings-section">
          <h2>Motion & Animation</h2>
          <p className="section-description">
            Control animations and transitions for a more comfortable viewing experience
          </p>

          {systemPrefersReducedMotion && (
            <div className="system-preference-notice">
              <strong>System Preference Detected</strong>
              <p>Your system is configured to reduce motion. This setting will override your system preference.</p>
            </div>
          )}

          <div className="setting-item checkbox-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={tempReduceMotion}
                onChange={(e) => setTempReduceMotion(e.target.checked)}
              />
              <div>
                <strong>Reduce Motion</strong>
                <span className="label-description">
                  Minimizes animations and transitions throughout the app.
                  Helpful for users with vestibular disorders or motion sensitivity.
                </span>
              </div>
            </label>
          </div>

          {tempReduceMotion && (
            <div className="accessibility-info">
              <strong>Reduced Motion is Active</strong>
              <p>All animations and transitions are minimized for a calmer experience.</p>
            </div>
          )}
        </section>

        <div className="settings-actions">
          <button
            onClick={handleReset}
            className="reset-button"
            disabled={!hasChanges}
          >
            Reset Changes
          </button>
          <button
            onClick={handleSave}
            className="save-button"
            disabled={!hasChanges}
          >
            Save Settings
          </button>
        </div>
      </div>

      <div className="help-section">
        <h3>About Accessibility Features</h3>
        <div className="help-grid">
          <div className="help-item">
            <h4>High Contrast Mode</h4>
            <p>
              High contrast mode uses strong color combinations to make text and
              interactive elements easier to see. This is especially helpful for
              users with low vision, color blindness, or in bright lighting conditions.
            </p>
          </div>
          <div className="help-item">
            <h4>Reduced Motion</h4>
            <p>
              Some users find animations distracting or experience discomfort from
              motion on screen. Reduced motion mode removes most animations while
              keeping the app fully functional.
            </p>
          </div>
          <div className="help-item">
            <h4>Getting Started</h4>
            <p>
              Try each setting to see which works best for you. You can combine
              high contrast with dark mode for different visual experiences.
              Changes are saved automatically and apply across all pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettingsPage;
