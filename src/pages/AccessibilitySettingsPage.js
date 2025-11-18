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
    systemPrefersReducedMotion,
    dyslexiaFriendly,
    fontSize,
    lineSpacing,
    toggleDyslexiaMode,
    setFontSize,
    setLineSpacing
  } = useAccessibility();

  const [tempHighContrast, setTempHighContrast] = useState(highContrast);
  const [tempReduceMotion, setTempReduceMotion] = useState(reduceMotion);
  const [tempDyslexia, setTempDyslexia] = useState(dyslexiaFriendly);
  const [tempFontSize, setTempFontSize] = useState(fontSize);
  const [tempLineSpacing, setTempLineSpacing] = useState(lineSpacing);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    if (tempHighContrast !== highContrast) {
      toggleHighContrast();
    }
    if (tempReduceMotion !== reduceMotion) {
      toggleReduceMotion();
    }
    if (tempDyslexia !== dyslexiaFriendly) {
      toggleDyslexiaMode();
    }
    setFontSize(tempFontSize);
    setLineSpacing(tempLineSpacing);

    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const handleReset = () => {
    setTempHighContrast(highContrast);
    setTempReduceMotion(reduceMotion);
    setTempDyslexia(dyslexiaFriendly);
    setTempFontSize(fontSize);
    setTempLineSpacing(lineSpacing);
  };

  const hasChanges = tempHighContrast !== highContrast ||
    tempReduceMotion !== reduceMotion ||
    tempDyslexia !== dyslexiaFriendly ||
    tempFontSize !== fontSize ||
    tempLineSpacing !== lineSpacing;

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
          Accessibility settings saved successfully!
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
          <h2>Dyslexia-Friendly Mode</h2>
          <p className="section-description">
            Enable features designed to make reading easier for people with dyslexia
          </p>

          <div className="checkbox-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={tempDyslexia}
                onChange={(e) => setTempDyslexia(e.target.checked)}
              />
              <div>
                <strong>Enable Dyslexia-Friendly Font</strong>
                <span className="label-description">
                  Uses fonts optimized for better readability (Comic Sans MS, Trebuchet MS, Verdana)
                  with increased letter spacing
                </span>
              </div>
            </label>
          </div>
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

        <section className="settings-section">
          <h2>Text Size</h2>
          <p className="section-description">
            Adjust the base font size for more comfortable reading
          </p>

          <div className="setting-item">
            <label htmlFor="font-size">
              <strong>Font Size</strong>
              <span className="label-description">Choose your preferred text size</span>
            </label>
            <select
              id="font-size"
              value={tempFontSize}
              onChange={(e) => setTempFontSize(e.target.value)}
              className="accessibility-dropdown"
            >
              <option value="small">Small (14px)</option>
              <option value="medium">Medium (16px) - Default</option>
              <option value="large">Large (18px)</option>
              <option value="extra-large">Extra Large (20px)</option>
            </select>
            <div className="preview-box">
              <strong>Preview:</strong>
              <p style={{ fontSize: tempFontSize === 'small' ? '14px' : tempFontSize === 'medium' ? '16px' : tempFontSize === 'large' ? '18px' : '20px' }}>
                "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." - John 3:16
              </p>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Line Spacing</h2>
          <p className="section-description">
            Adjust the space between lines of text for improved readability
          </p>

          <div className="setting-item">
            <label htmlFor="line-spacing">
              <strong>Line Spacing</strong>
              <span className="label-description">Choose spacing that works best for you</span>
            </label>
            <select
              id="line-spacing"
              value={tempLineSpacing}
              onChange={(e) => setTempLineSpacing(e.target.value)}
              className="accessibility-dropdown"
            >
              <option value="compact">Compact (1.4)</option>
              <option value="normal">Normal (1.6) - Default</option>
              <option value="relaxed">Relaxed (1.8)</option>
              <option value="loose">Loose (2.0)</option>
            </select>
            <div className="preview-box">
              <strong>Preview:</strong>
              <p style={{ lineHeight: tempLineSpacing === 'compact' ? '1.4' : tempLineSpacing === 'normal' ? '1.6' : tempLineSpacing === 'relaxed' ? '1.8' : '2.0' }}>
                In the beginning God created the heavens and the earth. Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.
              </p>
            </div>
          </div>
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
            <h4>Dyslexia-Friendly Font</h4>
            <p>
              Uses fonts with distinct letter shapes and increased spacing to reduce visual crowding
              and improve reading accuracy for people with dyslexia.
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
            <h4>Text Size & Spacing</h4>
            <p>
              Larger text and increased line spacing can reduce eye strain and make it easier
              to focus on reading. Choose settings that feel comfortable for extended reading sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettingsPage;
