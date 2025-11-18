import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../contexts/OnboardingContext';
import WelcomeStep from '../components/onboarding/WelcomeStep';
import ProfileStep from '../components/onboarding/ProfileStep';
import InterestsStep from '../components/onboarding/InterestsStep';
import ExperienceStep from '../components/onboarding/ExperienceStep';
import PreferencesStep from '../components/onboarding/PreferencesStep';
import CompletionStep from '../components/onboarding/CompletionStep';
import './OnboardingPage.css';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { isOnboardingComplete, currentStep, setCurrentStep } = useOnboarding();
  const [localStep, setLocalStep] = useState(currentStep || 0);

  const steps = [
    { component: WelcomeStep, title: 'Welcome' },
    { component: ProfileStep, title: 'Profile' },
    { component: InterestsStep, title: 'Interests' },
    { component: ExperienceStep, title: 'Experience' },
    { component: PreferencesStep, title: 'Preferences' },
    { component: CompletionStep, title: 'Complete' }
  ];

  useEffect(() => {
    // If already completed, redirect to home
    if (isOnboardingComplete && localStep !== steps.length - 1) {
      navigate('/');
    }
  }, [isOnboardingComplete, navigate, localStep, steps.length]);

  useEffect(() => {
    setCurrentStep(localStep);
  }, [localStep, setCurrentStep]);

  const handleNext = (skip = false) => {
    if (skip) {
      // Skip to completion
      setLocalStep(steps.length - 1);
    } else if (localStep < steps.length - 1) {
      setLocalStep(localStep + 1);
    }
  };

  const handleBack = () => {
    if (localStep > 0) {
      setLocalStep(localStep - 1);
    }
  };

  const CurrentStepComponent = steps[localStep].component;
  const isLastStep = localStep === steps.length - 1;

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {!isLastStep && (
          <div className="onboarding-header">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((localStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="progress-steps">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`progress-step ${index <= localStep ? 'active' : ''} ${index === localStep ? 'current' : ''}`}
                >
                  <div className="step-circle">
                    {index < localStep ? '✓' : index + 1}
                  </div>
                  <span className="step-label">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="onboarding-content">
          <CurrentStepComponent
            onNext={handleNext}
            onBack={handleBack}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
