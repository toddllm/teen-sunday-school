import React, { useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './OnboardingSteps.css';

const WelcomeStep = ({ onNext }) => {
  const { startQuiz } = useOnboarding();

  useEffect(() => {
    startQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="onboarding-step welcome-step">
      <div className="step-icon">👋</div>
      <h1>Welcome to Teen Sunday School!</h1>
      <p className="step-subtitle">
        Let's personalize your experience in just a few quick steps
      </p>

      <div className="welcome-features">
        <div className="welcome-feature">
          <span className="feature-icon">📖</span>
          <h3>Bible Study Tools</h3>
          <p>Explore verses, compare translations, and discover cross-references</p>
        </div>
        <div className="welcome-feature">
          <span className="feature-icon">🎮</span>
          <h3>Interactive Games</h3>
          <p>Make learning fun with word games and challenges</p>
        </div>
        <div className="welcome-feature">
          <span className="feature-icon">🏆</span>
          <h3>Streaks & Badges</h3>
          <p>Build reading habits and earn achievements</p>
        </div>
        <div className="welcome-feature">
          <span className="feature-icon">✏️</span>
          <h3>Lesson Creator</h3>
          <p>Teachers can build engaging lessons in minutes</p>
        </div>
      </div>

      <p className="step-note">
        This will only take about 2 minutes and helps us show you the content you'll love most
      </p>

      <button className="btn-primary" onClick={onNext}>
        Get Started
      </button>

      <button className="btn-text" onClick={() => onNext(true)}>
        Skip for now
      </button>
    </div>
  );
};

export default WelcomeStep;
