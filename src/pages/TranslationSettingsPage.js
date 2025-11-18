import React, { useState } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { useNavigate } from 'react-router-dom';
import './TranslationSettingsPage.css';

const TranslationSettingsPage = () => {
  const navigate = useNavigate();
  const {
    primaryTranslation,
    secondaryTranslation,
    setPrimaryTranslation,
    setSecondaryTranslation,
    parallelModeEnabled,
    setParallelModeEnabled,
    getTranslationById,
    availableTranslations
  } = useTranslation();

  const [tempPrimary, setTempPrimary] = useState(primaryTranslation);
  const [tempSecondary, setTempSecondary] = useState(secondaryTranslation);
  const [tempParallelMode, setTempParallelMode] = useState(parallelModeEnabled);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    setPrimaryTranslation(tempPrimary);
    setSecondaryTranslation(tempSecondary);
    setParallelModeEnabled(tempParallelMode);

    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const handleReset = () => {
    setTempPrimary(primaryTranslation);
    setTempSecondary(secondaryTranslation);
    setTempParallelMode(parallelModeEnabled);
  };

  const hasChanges = tempPrimary !== primaryTranslation ||
    tempSecondary !== secondaryTranslation ||
    tempParallelMode !== parallelModeEnabled;

  return (
    <div className="translation-settings-page">
      <header className="settings-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Translation Settings</h1>
        <p>Configure your Bible reading preferences</p>
      </header>

      {showSaved && (
        <div className="save-notification">
          Settings saved successfully!
        </div>
      )}

      <div className="settings-container">
        <section className="settings-section">
          <h2>Default Translations</h2>
          <p className="section-description">
            Choose your preferred Bible translations for reading and comparison
          </p>

          <div className="setting-item">
            <label htmlFor="primary-translation">
              <strong>Primary Translation</strong>
              <span className="label-description">Your main Bible version</span>
            </label>
            <select
              id="primary-translation"
              value={tempPrimary}
              onChange={(e) => setTempPrimary(e.target.value)}
              className="translation-dropdown"
            >
              {availableTranslations.map(trans => (
                <option key={trans.id} value={trans.id}>
                  {trans.code} - {trans.name}
                </option>
              ))}
            </select>
            <div className="translation-info">
              <strong>Current:</strong> {getTranslationById(tempPrimary).name} ({getTranslationById(tempPrimary).code})
            </div>
          </div>

          <div className="setting-item">
            <label htmlFor="secondary-translation">
              <strong>Secondary Translation</strong>
              <span className="label-description">For parallel comparison view</span>
            </label>
            <select
              id="secondary-translation"
              value={tempSecondary}
              onChange={(e) => setTempSecondary(e.target.value)}
              className="translation-dropdown"
            >
              {availableTranslations.map(trans => (
                <option key={trans.id} value={trans.id}>
                  {trans.code} - {trans.name}
                </option>
              ))}
            </select>
            <div className="translation-info">
              <strong>Current:</strong> {getTranslationById(tempSecondary).name} ({getTranslationById(tempSecondary).code})
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Reading Preferences</h2>
          <p className="section-description">
            Customize your Bible reading experience
          </p>

          <div className="setting-item checkbox-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={tempParallelMode}
                onChange={(e) => setTempParallelMode(e.target.checked)}
              />
              <div>
                <strong>Enable Parallel Mode by Default</strong>
                <span className="label-description">
                  Automatically show translations side by side
                </span>
              </div>
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2>Available Translations</h2>
          <p className="section-description">
            Browse all available Bible translations
          </p>

          <div className="translations-grid">
            {availableTranslations.map(trans => (
              <div
                key={trans.id}
                className={`translation-card ${tempPrimary === trans.id ? 'is-primary' : ''} ${tempSecondary === trans.id ? 'is-secondary' : ''}`}
              >
                <h3>{trans.code}</h3>
                <p className="translation-name">{trans.name}</p>
                <p className="translation-lang">{trans.language}</p>
                {tempPrimary === trans.id && <span className="badge badge-primary">Primary</span>}
                {tempSecondary === trans.id && <span className="badge badge-secondary">Secondary</span>}
              </div>
            ))}
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
        <h3>About Bible Translations</h3>
        <div className="help-grid">
          <div className="help-item">
            <h4>Why compare translations?</h4>
            <p>
              Comparing multiple Bible translations helps you understand the nuances
              and deeper meanings of Scripture by seeing how different scholars have
              translated the original Hebrew, Aramaic, and Greek texts.
            </p>
          </div>
          <div className="help-item">
            <h4>Which translations should I use?</h4>
            <p>
              Popular combinations include NIV with KJV, ESV with NLT, or NASB with MSG.
              Choose translations that balance word-for-word accuracy with readability
              based on your study goals.
            </p>
          </div>
          <div className="help-item">
            <h4>Getting started</h4>
            <p>
              Select your primary translation for regular reading, and choose a
              secondary translation for comparison. You can change these anytime
              or switch translations on the fly in the parallel view.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationSettingsPage;
