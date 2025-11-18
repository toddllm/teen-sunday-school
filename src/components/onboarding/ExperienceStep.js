import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './OnboardingSteps.css';

const ExperienceStep = ({ onNext, onBack }) => {
  const { userProfile, updateProfile } = useOnboarding();

  const experienceLevels = [
    {
      id: 'new',
      label: 'New to Bible Study',
      icon: '🌱',
      description: 'I\'m just starting my journey with Scripture',
      features: ['Context cards for difficult verses', 'Beginner-friendly lessons', 'Basic study tools']
    },
    {
      id: 'intermediate',
      label: 'Regular Bible Reader',
      icon: '📚',
      description: 'I study the Bible regularly and want to go deeper',
      features: ['Cross-references', 'Parallel translations', 'Themed studies']
    },
    {
      id: 'experienced',
      label: 'Experienced in Scripture',
      icon: '🎓',
      description: 'I have extensive knowledge and want advanced tools',
      features: ['Advanced study tools', 'Comparative analysis', 'Original language insights']
    }
  ];

  const handleSelect = (level) => {
    updateProfile('experience', level);
    // Auto-set difficulty based on experience
    const difficultyMap = {
      'new': 'beginner',
      'intermediate': 'intermediate',
      'experienced': 'advanced'
    };
    updateProfile('preferences', {
      ...userProfile.preferences,
      difficulty: difficultyMap[level]
    });
  };

  const handleNext = () => {
    if (!userProfile.experience) {
      // Default to intermediate if not selected
      handleSelect('intermediate');
    }
    onNext();
  };

  return (
    <div className="onboarding-step experience-step">
      <div className="step-icon">📊</div>
      <h2>What's your experience level?</h2>
      <p className="step-subtitle">
        This helps us show you the right content and tools
      </p>

      <div className="experience-options">
        {experienceLevels.map(level => (
          <div
            key={level.id}
            className={`experience-card ${userProfile.experience === level.id ? 'selected' : ''}`}
            onClick={() => handleSelect(level.id)}
          >
            <div className="experience-header">
              <span className="experience-icon">{level.icon}</span>
              <h3>{level.label}</h3>
            </div>
            <p className="experience-description">{level.description}</p>
            <div className="experience-features">
              <p className="features-title">You'll get:</p>
              <ul>
                {level.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

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

export default ExperienceStep;
