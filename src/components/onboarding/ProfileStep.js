import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './OnboardingSteps.css';

const ProfileStep = ({ onNext, onBack }) => {
  const { userProfile, updateProfile } = useOnboarding();
  const [errors, setErrors] = useState({});

  const roles = [
    {
      id: 'student',
      label: 'Student',
      icon: '🎓',
      description: 'I\'m here to learn and grow in my faith'
    },
    {
      id: 'teacher',
      label: 'Teacher/Leader',
      icon: '👨‍🏫',
      description: 'I lead Sunday school or youth groups'
    },
    {
      id: 'parent',
      label: 'Parent',
      icon: '👪',
      description: 'I\'m supporting my teen\'s faith journey'
    },
    {
      id: 'admin',
      label: 'Administrator',
      icon: '⚙️',
      description: 'I manage programs or curriculum'
    }
  ];

  const handleNext = () => {
    const newErrors = {};

    if (!userProfile.name.trim()) {
      newErrors.name = 'Please enter your name';
    }

    if (!userProfile.role) {
      newErrors.role = 'Please select your role';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  return (
    <div className="onboarding-step profile-step">
      <div className="step-icon">👤</div>
      <h2>Tell us about yourself</h2>
      <p className="step-subtitle">This helps us personalize your experience</p>

      <div className="form-group">
        <label htmlFor="name">What's your name?</label>
        <input
          type="text"
          id="name"
          className={errors.name ? 'error' : ''}
          placeholder="Enter your name"
          value={userProfile.name}
          onChange={(e) => {
            updateProfile('name', e.target.value);
            setErrors(prev => ({ ...prev, name: null }));
          }}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>What's your role?</label>
        <div className="role-grid">
          {roles.map(role => (
            <div
              key={role.id}
              className={`role-card ${userProfile.role === role.id ? 'selected' : ''}`}
              onClick={() => {
                updateProfile('role', role.id);
                setErrors(prev => ({ ...prev, role: null }));
              }}
            >
              <span className="role-icon">{role.icon}</span>
              <h3>{role.label}</h3>
              <p>{role.description}</p>
            </div>
          ))}
        </div>
        {errors.role && <span className="error-message">{errors.role}</span>}
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

export default ProfileStep;
