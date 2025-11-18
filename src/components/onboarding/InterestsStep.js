import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './OnboardingSteps.css';

const InterestsStep = ({ onNext, onBack }) => {
  const { userProfile, toggleInterest } = useOnboarding();

  const interestOptions = [
    { id: 'old-testament', label: 'Old Testament', icon: '📜' },
    { id: 'new-testament', label: 'New Testament', icon: '✝️' },
    { id: 'parables', label: 'Parables', icon: '🌱' },
    { id: 'prophecy', label: 'Prophecy', icon: '🔮' },
    { id: 'history', label: 'Biblical History', icon: '🏛️' },
    { id: 'jesus-life', label: 'Life of Jesus', icon: '✨' },
    { id: 'epistles', label: 'Epistles/Letters', icon: '📝' },
    { id: 'gospel-stories', label: 'Gospel Stories', icon: '📖' },
    { id: 'practical-living', label: 'Practical Living', icon: '🌟' },
    { id: 'deep-theology', label: 'Deep Theology', icon: '🤔' },
    { id: 'psalms-poetry', label: 'Psalms & Poetry', icon: '🎵' },
    { id: 'wisdom-literature', label: 'Wisdom Literature', icon: '💡' }
  ];

  const handleNext = () => {
    // Can continue even with no selections - interests are optional
    onNext();
  };

  return (
    <div className="onboarding-step interests-step">
      <div className="step-icon">❤️</div>
      <h2>What interests you most?</h2>
      <p className="step-subtitle">
        Select all that apply - we'll recommend content you'll love
      </p>

      <div className="interests-grid">
        {interestOptions.map(interest => (
          <div
            key={interest.id}
            className={`interest-tag ${userProfile.interests.includes(interest.id) ? 'selected' : ''}`}
            onClick={() => toggleInterest(interest.id)}
          >
            <span className="interest-icon">{interest.icon}</span>
            <span className="interest-label">{interest.label}</span>
          </div>
        ))}
      </div>

      {userProfile.interests.length > 0 && (
        <p className="selection-count">
          {userProfile.interests.length} {userProfile.interests.length === 1 ? 'topic' : 'topics'} selected
        </p>
      )}

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>
          Back
        </button>
        <button className="btn-primary" onClick={handleNext}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default InterestsStep;
