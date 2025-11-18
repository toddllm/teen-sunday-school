import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReadingMetrics } from '../contexts/ReadingMetricsContext';
import PassageMetrics from '../components/PassageMetrics';
import SettingsNavigation from '../components/SettingsNavigation';
import './ReadingMetricsSettingsPage.css';

const ReadingMetricsSettingsPage = () => {
  const navigate = useNavigate();
  const {
    readingSpeedPreset,
    customReadingSpeed,
    setReadingSpeedPreset,
    setCustomReadingSpeed,
    showMetrics,
    showDifficulty,
    showReadingTime,
    toggleMetrics,
    toggleDifficulty,
    toggleReadingTime,
    getWordsPerMinute,
    availablePresets
  } = useReadingMetrics();

  const [customValue, setCustomValue] = useState(customReadingSpeed);

  const handlePresetChange = (presetId) => {
    setReadingSpeedPreset(presetId);
  };

  const handleCustomSpeedChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 50 && value <= 500) {
      setCustomValue(value);
      setCustomReadingSpeed(value);
    }
  };

  const handleCustomSpeedBlur = () => {
    // Ensure value is within valid range
    if (customValue < 50) {
      setCustomValue(50);
      setCustomReadingSpeed(50);
    } else if (customValue > 500) {
      setCustomValue(500);
      setCustomReadingSpeed(500);
    }
  };

  // Sample content for preview
  const sampleContent = `
    <p><span class="verse-num">16</span>For God so loved the world that he gave his one and only Son,
    that whoever believes in him shall not perish but have eternal life.</p>
    <p><span class="verse-num">17</span>For God did not send his Son into the world to condemn the world,
    but to save the world through him.</p>
    <p><span class="verse-num">18</span>Whoever believes in him is not condemned, but whoever does not believe
    stands condemned already because they have not believed in the name of God's one and only Son.</p>
  `;

  return (
    <div className="reading-metrics-settings-page">
      <header className="settings-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Settings</h1>
        <p>Customize how reading time and difficulty are calculated and displayed</p>
      </header>

      <SettingsNavigation />

      <div className="settings-container">
        {/* Display Preferences */}
        <section className="settings-section">
          <h2>Display Preferences</h2>
          <p className="section-description">
            Choose which metrics to show when reading Bible passages
          </p>

          <div className="settings-grid">
            <label className="setting-item">
              <input
                type="checkbox"
                checked={showMetrics}
                onChange={toggleMetrics}
              />
              <div className="setting-content">
                <span className="setting-label">Show Reading Metrics</span>
                <span className="setting-description">
                  Display reading time and difficulty estimates
                </span>
              </div>
            </label>

            <label className="setting-item" disabled={!showMetrics}>
              <input
                type="checkbox"
                checked={showReadingTime}
                onChange={toggleReadingTime}
                disabled={!showMetrics}
              />
              <div className="setting-content">
                <span className="setting-label">Show Reading Time</span>
                <span className="setting-description">
                  Display estimated reading time for passages
                </span>
              </div>
            </label>

            <label className="setting-item" disabled={!showMetrics}>
              <input
                type="checkbox"
                checked={showDifficulty}
                onChange={toggleDifficulty}
                disabled={!showMetrics}
              />
              <div className="setting-content">
                <span className="setting-label">Show Difficulty Level</span>
                <span className="setting-description">
                  Display difficulty rating for passages
                </span>
              </div>
            </label>
          </div>
        </section>

        {/* Reading Speed Settings */}
        <section className="settings-section">
          <h2>Reading Speed</h2>
          <p className="section-description">
            Select a reading speed preset or set a custom pace (Words Per Minute)
          </p>

          <div className="reading-speed-presets">
            {availablePresets.map(preset => (
              <label
                key={preset.id}
                className={`preset-card ${readingSpeedPreset === preset.id ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="reading-speed"
                  value={preset.id}
                  checked={readingSpeedPreset === preset.id}
                  onChange={() => handlePresetChange(preset.id)}
                />
                <div className="preset-content">
                  <div className="preset-header">
                    <span className="preset-label">{preset.label}</span>
                    {readingSpeedPreset === preset.id && (
                      <span className="selected-badge">✓ Active</span>
                    )}
                  </div>
                  <span className="preset-description">{preset.description}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Custom Speed Input */}
          {readingSpeedPreset === 'custom' && (
            <div className="custom-speed-input">
              <label htmlFor="custom-wpm">Custom Reading Speed (WPM):</label>
              <div className="input-group">
                <input
                  id="custom-wpm"
                  type="number"
                  min="50"
                  max="500"
                  step="10"
                  value={customValue}
                  onChange={handleCustomSpeedChange}
                  onBlur={handleCustomSpeedBlur}
                />
                <span className="input-suffix">words/min</span>
              </div>
              <span className="input-help">
                Range: 50-500 WPM (Average reader: ~200 WPM)
              </span>
            </div>
          )}

          <div className="current-speed-info">
            <span className="info-icon">ℹ️</span>
            <span>
              Current reading speed: <strong>{getWordsPerMinute()} WPM</strong>
            </span>
          </div>
        </section>

        {/* Preview */}
        <section className="settings-section preview-section">
          <h2>Preview</h2>
          <p className="section-description">
            See how metrics will appear with your current settings
          </p>

          <div className="preview-container">
            <div className="preview-label">John 3:16-18</div>

            {showMetrics ? (
              <>
                <PassageMetrics
                  content={sampleContent}
                  compact={false}
                  showDetails={true}
                />

                <div className="preview-divider"></div>

                <div className="compact-preview-label">Compact View:</div>
                <PassageMetrics
                  content={sampleContent}
                  compact={true}
                />
              </>
            ) : (
              <div className="preview-disabled">
                <p>Metrics display is currently disabled.</p>
                <p>Enable "Show Reading Metrics" above to see the preview.</p>
              </div>
            )}
          </div>
        </section>

        {/* Information */}
        <section className="settings-section info-section">
          <h2>How It Works</h2>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">⏱️</div>
              <h3>Reading Time</h3>
              <p>
                Calculated based on word count and your selected reading speed.
                Includes a range to account for comprehension and reflection time.
              </p>
            </div>

            <div className="info-card">
              <div className="info-icon">📊</div>
              <h3>Difficulty Level</h3>
              <p>
                Determined by analyzing sentence length, vocabulary complexity,
                and archaic language patterns. Levels range from Easy to Difficult.
              </p>
            </div>

            <div className="info-card">
              <div className="info-icon">🎯</div>
              <h3>Accuracy</h3>
              <p>
                Metrics are calculated from actual passage content when available.
                For reading plans, estimates are based on typical chapter lengths.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReadingMetricsSettingsPage;
