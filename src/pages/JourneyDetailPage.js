import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useThematicJourneys } from '../contexts/ThematicJourneyContext';
import { useStreak } from '../contexts/StreakContext';
import { searchPassage } from '../services/bibleAPI';
import './JourneyDetailPage.css';

const JourneyDetailPage = () => {
  const { journeyId } = useParams();
  const navigate = useNavigate();
  const {
    getJourneyById,
    getJourneyProgress,
    getProgressPercentage,
    isStepCompleted,
    completeStep
  } = useThematicJourneys();
  const { logActivity } = useStreak();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [passageContent, setPassageContent] = useState({});
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const journey = getJourneyById(journeyId);
  const progress = getJourneyProgress(journeyId);
  const progressPercentage = getProgressPercentage(journeyId);

  useEffect(() => {
    if (!journey) {
      navigate('/journeys');
      return;
    }

    // Start at first incomplete step, or first step if all complete
    const firstIncompleteIndex = journey.steps.findIndex(
      (step, idx) => !isStepCompleted(journeyId, idx)
    );
    setCurrentStepIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
  }, [journey, journeyId, isStepCompleted, navigate]);

  const loadPassages = useCallback(async () => {
    if (!journey || !journey.steps[currentStepIndex]) return;

    const step = journey.steps[currentStepIndex];
    setLoadingPassage(true);

    const content = {};
    for (const ref of step.passageRefs) {
      try {
        const result = await searchPassage(ref);
        if (result?.data?.verses?.length > 0) {
          content[ref] = {
            text: result.data.verses[0].text,
            reference: result.data.verses[0].reference
          };
        }
      } catch (error) {
        console.error(`Error loading passage ${ref}:`, error);
      }
    }

    setPassageContent(content);
    setLoadingPassage(false);
  }, [journey, currentStepIndex]);

  useEffect(() => {
    loadPassages();
  }, [loadPassages]);

  const handleCompleteStep = () => {
    completeStep(journeyId, currentStepIndex);
    logActivity('journey_step_completed');

    // Show celebration if this was the last step
    if (currentStepIndex === journey.steps.length - 1) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }

    // Move to next step if available
    if (currentStepIndex < journey.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepClick = (index) => {
    setCurrentStepIndex(index);
  };

  if (!journey) {
    return <div className="container"><div className="loading">Loading...</div></div>;
  }

  const currentStep = journey.steps[currentStepIndex];
  const isCurrentStepCompleted = isStepCompleted(journeyId, currentStepIndex);
  const allStepsCompleted = progressPercentage === 100;

  return (
    <div className="journey-detail-page">
      <div className="container-wide">
        {/* Header */}
        <div className="journey-header">
          <button className="back-btn" onClick={() => navigate('/journeys')}>
            ← Back to Journeys
          </button>
          <div className="journey-title-section">
            <h1>{journey.title}</h1>
            <p className="journey-desc">{journey.description}</p>
          </div>
          <div className="journey-progress-header">
            <div className="progress-info">
              <span className="progress-text">
                {progress.completedStepIndexes.length} of {journey.steps.length} steps completed
              </span>
              <span className="progress-percentage">{progressPercentage}%</span>
            </div>
            <div className="progress-bar-header">
              <div
                className="progress-fill-header"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Celebration Message */}
        {showCelebration && (
          <div className="celebration-banner">
            🎉 Congratulations! You've completed the {journey.title} journey! 🎉
          </div>
        )}

        <div className="journey-content">
          {/* Step Navigation Sidebar */}
          <div className="steps-sidebar">
            <h3>Journey Steps</h3>
            <div className="steps-list">
              {journey.steps.map((step, index) => (
                <div
                  key={index}
                  className={`step-item ${currentStepIndex === index ? 'active' : ''} ${
                    isStepCompleted(journeyId, index) ? 'completed' : ''
                  }`}
                  onClick={() => handleStepClick(index)}
                >
                  <div className="step-number">
                    {isStepCompleted(journeyId, index) ? '✓' : index + 1}
                  </div>
                  <div className="step-title">{step.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="step-content">
            <div className="step-header">
              <h2>
                Step {currentStepIndex + 1}: {currentStep.title}
              </h2>
              {isCurrentStepCompleted && (
                <span className="completed-badge">✓ Completed</span>
              )}
            </div>

            <div className="step-intro">
              <p>{currentStep.introText}</p>
            </div>

            {/* Bible Passages */}
            <div className="passages-section">
              <h3>Scripture Readings</h3>
              {loadingPassage ? (
                <div className="loading-passage">Loading passages...</div>
              ) : (
                <div className="passages-list">
                  {currentStep.passageRefs.map((ref, index) => (
                    <div key={index} className="passage-card">
                      <h4>{ref}</h4>
                      {passageContent[ref] ? (
                        <div className="passage-text">
                          {passageContent[ref].text}
                        </div>
                      ) : (
                        <div className="passage-placeholder">
                          Read {ref} in your Bible
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reflection Questions */}
            <div className="questions-section">
              <h3>Reflection Questions</h3>
              <div className="questions-list">
                {currentStep.questions.map((question, index) => (
                  <div key={index} className="question-card">
                    <div className="question-number">{index + 1}</div>
                    <p className="question-text">{question}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="step-actions">
              {!isCurrentStepCompleted && (
                <button
                  className="btn btn-primary complete-btn"
                  onClick={handleCompleteStep}
                >
                  ✓ Mark Step as Complete
                </button>
              )}

              {isCurrentStepCompleted && currentStepIndex < journey.steps.length - 1 && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                >
                  Next Step →
                </button>
              )}

              {allStepsCompleted && (
                <div className="completion-message">
                  <h3>🎉 Journey Complete!</h3>
                  <p>You've completed all steps in this journey. Great work!</p>
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate('/journeys')}
                  >
                    Explore More Journeys
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyDetailPage;
