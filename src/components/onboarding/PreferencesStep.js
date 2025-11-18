import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useTheme } from '../../contexts/ThemeContext';
import './OnboardingSteps.css';

const PreferencesStep = ({ onNext, onBack }) => {
  const { userProfile, updatePreference } = useOnboarding();
  const { theme, toggleTheme } = useTheme();

  const translations = [
    { id: 'de4e12af7f28f599-02', name: 'NIV', fullName: 'New International Version' },
    { id: '01b29f4b342acc35-01', name: 'ESV', fullName: 'English Standard Version' },
    { id: 'de4e12af7f28f599-01', name: 'KJV', fullName: 'King James Version' },
    { id: 'fb7ed0fa3e58fc0e-01', name: 'NKJV', fullName: 'New King James Version' },
    { id: '65eec8e0b60e656b-01', name: 'NLT', fullName: 'New Living Translation' }
  ];

  const learningStyles = [
    { id: 'visual', label: 'Visual Learner', icon: '👁️', description: 'I learn best with images and diagrams' },
    { id: 'text', label: 'Text-Based', icon: '📝', description: 'I prefer reading and written content' },
    { id: 'interactive', label: 'Interactive', icon: '🎮', description: 'I love games and hands-on activities' }
  ];

  return (
    <div className="onboarding-step preferences-step">
      <div className="step-icon">⚙️</div>
      <h2>Set your preferences</h2>
      <p className="step-subtitle">Customize your experience</p>

      <div className="preference-section">
        <label>Preferred Bible Translation</label>
        <select
          value={userProfile.preferences.primaryTranslation}
          onChange={(e) => updatePreference('primaryTranslation', e.target.value)}
          className="translation-select"
        >
          {translations.map(trans => (
            <option key={trans.id} value={trans.id}>
              {trans.name} - {trans.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="preference-section">
        <label>Learning Style</label>
        <div className="learning-style-grid">
          {learningStyles.map(style => (
            <div
              key={style.id}
              className={`learning-style-card ${userProfile.preferences.learningStyle === style.id ? 'selected' : ''}`}
              onClick={() => updatePreference('learningStyle', style.id)}
            >
              <span className="style-icon">{style.icon}</span>
              <h4>{style.label}</h4>
              <p>{style.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="preference-section">
        <label>Theme Preference</label>
        <div className="theme-toggle-section">
          <button
            className={`theme-option ${theme === 'light' ? 'selected' : ''}`}
            onClick={() => theme === 'dark' && toggleTheme()}
          >
            ☀️ Light Mode
          </button>
          <button
            className={`theme-option ${theme === 'dark' ? 'selected' : ''}`}
            onClick={() => theme === 'light' && toggleTheme()}
          >
            🌙 Dark Mode
          </button>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>
          Back
        </button>
        <button className="btn-primary" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default PreferencesStep;
