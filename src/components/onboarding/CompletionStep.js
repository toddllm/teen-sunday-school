import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './OnboardingSteps.css';

const CompletionStep = () => {
  const navigate = useNavigate();
  const { userProfile, completeOnboarding, getRecommendations } = useOnboarding();
  const [recommendations, setRecommendations] = React.useState(null);

  useEffect(() => {
    completeOnboarding();
    setRecommendations(getRecommendations());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetStarted = () => {
    // Navigate based on role
    if (userProfile.role === 'teacher' || userProfile.role === 'admin') {
      navigate('/admin');
    } else if (userProfile.role === 'student') {
      navigate('/today');
    } else {
      navigate('/');
    }
  };

  const roleMessages = {
    student: {
      title: `Welcome, ${userProfile.name}! 🎉`,
      message: 'Your personalized dashboard is ready with games, streaks, and study tools!'
    },
    teacher: {
      title: `Welcome, ${userProfile.name}! 👨‍🏫`,
      message: 'Start creating engaging lessons with our powerful lesson builder!'
    },
    parent: {
      title: `Welcome, ${userProfile.name}! 👪`,
      message: 'Explore lessons and reading plans to support your teen\'s faith journey!'
    },
    admin: {
      title: `Welcome, ${userProfile.name}! ⚙️`,
      message: 'Access your admin dashboard to manage content and track engagement!'
    }
  };

  const currentMessage = roleMessages[userProfile.role] || roleMessages.student;

  return (
    <div className="onboarding-step completion-step">
      <div className="success-animation">
        <div className="checkmark">✓</div>
      </div>

      <h1>{currentMessage.title}</h1>
      <p className="step-subtitle">{currentMessage.message}</p>

      <div className="completion-summary">
        <h3>Your Profile</h3>
        <div className="profile-summary">
          <div className="summary-item">
            <span className="summary-label">Role:</span>
            <span className="summary-value">{userProfile.role}</span>
          </div>
          {userProfile.interests.length > 0 && (
            <div className="summary-item">
              <span className="summary-label">Interests:</span>
              <span className="summary-value">
                {userProfile.interests.map(i => i.replace('-', ' ')).join(', ')}
              </span>
            </div>
          )}
          <div className="summary-item">
            <span className="summary-label">Experience:</span>
            <span className="summary-value">{userProfile.experience}</span>
          </div>
        </div>
      </div>

      {recommendations && (
        <div className="recommendations-preview">
          <h3>Recommended for You</h3>
          <div className="recommendation-tags">
            {recommendations.features.slice(0, 4).map((feature, idx) => (
              <span key={idx} className="recommendation-tag">
                {feature.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      <button className="btn-primary btn-large" onClick={handleGetStarted}>
        Let's Get Started! 🚀
      </button>

      <p className="completion-note">
        You can update these preferences anytime in Settings
      </p>
    </div>
  );
};

export default CompletionStep;
