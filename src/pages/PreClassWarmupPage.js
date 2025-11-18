import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWarmup, WARMUP_ACTIVITY_TYPES } from '../contexts/WarmupContext';
import { getActivityTypeIcon, getActivityTypeLabel } from '../services/warmupActivityService';
import './PreClassWarmupPage.css';

function PreClassWarmupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const playlistId = searchParams.get('playlist');

  const {
    activePlaylist,
    currentActivityIndex,
    startWarmupSession,
    nextActivity,
    previousActivity,
    endWarmupSession,
    getCurrentActivity
  } = useWarmup();

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Start the warmup session when component mounts
  useEffect(() => {
    if (playlistId && !activePlaylist) {
      const started = startWarmupSession(playlistId);
      if (!started) {
        navigate('/admin/warmup');
      }
    }
  }, [playlistId, activePlaylist, startWarmupSession, navigate]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Reset state when activity changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowAnswer(false);
    setTimerSeconds(0);
    setTimerRunning(false);
  }, [currentActivityIndex]);

  if (!activePlaylist) {
    return (
      <div className="warmup-page">
        <div className="warmup-container">
          <div className="warmup-loading">
            <h2>Loading warmup session...</h2>
            <p>If this takes too long, please return to the warmup admin page.</p>
            <button onClick={() => navigate('/admin/warmup')} className="btn-secondary">
              Go to Warmup Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentActivity = getCurrentActivity();
  const isLastActivity = currentActivityIndex === activePlaylist.activities.length - 1;
  const progress = ((currentActivityIndex + 1) / activePlaylist.activities.length) * 100;

  const handleNext = () => {
    if (isLastActivity) {
      if (window.confirm('This is the last activity. End warmup session?')) {
        endWarmupSession();
        navigate('/admin/warmup');
      }
    } else {
      nextActivity();
    }
  };

  const handlePrevious = () => {
    previousActivity();
  };

  const handleEnd = () => {
    if (window.confirm('Are you sure you want to end this warmup session?')) {
      endWarmupSession();
      navigate('/admin/warmup');
    }
  };

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const startTimer = (seconds) => {
    setTimerSeconds(seconds);
    setTimerRunning(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderActivity = () => {
    if (!currentActivity) {
      return <div className="activity-error">No activity to display</div>;
    }

    const activityIcon = getActivityTypeIcon(currentActivity.type);
    const activityLabel = getActivityTypeLabel(currentActivity.type);

    switch (currentActivity.type) {
      case WARMUP_ACTIVITY_TYPES.BIBLE_TRIVIA:
        return (
          <div className="activity-content trivia">
            <div className="activity-header">
              <span className="activity-icon">{activityIcon}</span>
              <h3 className="activity-type">{activityLabel}</h3>
            </div>
            <div className="trivia-question">
              <h2>{currentActivity.question}</h2>
            </div>
            <div className="trivia-options">
              {currentActivity.options.map((option, index) => (
                <button
                  key={index}
                  className={`trivia-option ${selectedAnswer === index ? 'selected' : ''} ${
                    showAnswer
                      ? index === currentActivity.correctAnswer
                        ? 'correct'
                        : selectedAnswer === index
                        ? 'incorrect'
                        : ''
                      : ''
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showAnswer}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>
            {!showAnswer && (
              <button className="btn-primary show-answer-btn" onClick={handleShowAnswer}>
                Show Answer
              </button>
            )}
            {showAnswer && (
              <div className="trivia-explanation">
                <p>✓ {currentActivity.explanation}</p>
              </div>
            )}
          </div>
        );

      case WARMUP_ACTIVITY_TYPES.VERSE_REVIEW:
        return (
          <div className="activity-content verse-review">
            <div className="activity-header">
              <span className="activity-icon">{activityIcon}</span>
              <h3 className="activity-type">{activityLabel}</h3>
            </div>
            <div className="verse-reference">
              <h2>{currentActivity.verse}</h2>
            </div>
            <div className="verse-partial">
              <p>{currentActivity.partialText}</p>
            </div>
            {!showAnswer && (
              <button className="btn-primary show-answer-btn" onClick={handleShowAnswer}>
                Show Full Verse
              </button>
            )}
            {showAnswer && (
              <div className="verse-full">
                <blockquote>{currentActivity.fullVerse}</blockquote>
              </div>
            )}
          </div>
        );

      case WARMUP_ACTIVITY_TYPES.WORD_OF_DAY:
        return (
          <div className="activity-content word-of-day">
            <div className="activity-header">
              <span className="activity-icon">{activityIcon}</span>
              <h3 className="activity-type">{activityLabel}</h3>
            </div>
            <div className="word-display">
              <h1>{currentActivity.word}</h1>
            </div>
            <div className="word-definition">
              <p><strong>Definition:</strong> {currentActivity.definition}</p>
            </div>
            <div className="word-context">
              <p><strong>Bible Context:</strong></p>
              <blockquote>{currentActivity.bibleContext}</blockquote>
            </div>
            <div className="word-discussion">
              <p><strong>Discussion:</strong> {currentActivity.discussion}</p>
            </div>
          </div>
        );

      case WARMUP_ACTIVITY_TYPES.DISCUSSION_STARTER:
        return (
          <div className="activity-content discussion">
            <div className="activity-header">
              <span className="activity-icon">{activityIcon}</span>
              <h3 className="activity-type">{activityLabel}</h3>
            </div>
            <div className="discussion-prompt">
              <h2>{currentActivity.prompt}</h2>
            </div>
            {showAnswer && (
              <div className="discussion-followup">
                <p><strong>Follow-up:</strong> {currentActivity.followUp}</p>
              </div>
            )}
            {!showAnswer && (
              <button className="btn-primary show-answer-btn" onClick={handleShowAnswer}>
                Show Follow-Up Question
              </button>
            )}
            <div className="discussion-timer">
              {timerSeconds === 0 && !timerRunning && (
                <button className="btn-secondary" onClick={() => startTimer(120)}>
                  Start 2-Minute Timer
                </button>
              )}
              {timerSeconds > 0 && (
                <div className="timer-display">
                  Time Remaining: {formatTime(timerSeconds)}
                </div>
              )}
            </div>
          </div>
        );

      case WARMUP_ACTIVITY_TYPES.MEMORY_VERSE:
        return (
          <div className="activity-content memory-verse">
            <div className="activity-header">
              <span className="activity-icon">{activityIcon}</span>
              <h3 className="activity-type">{activityLabel}</h3>
            </div>
            <div className="verse-reference">
              <h2>{currentActivity.reference}</h2>
            </div>
            <div className="verse-text">
              <blockquote>{currentActivity.verse}</blockquote>
            </div>
            <div className="verse-instruction">
              <p>📝 {currentActivity.instruction}</p>
            </div>
          </div>
        );

      case WARMUP_ACTIVITY_TYPES.REFLECTION:
        return (
          <div className="activity-content reflection">
            <div className="activity-header">
              <span className="activity-icon">{activityIcon}</span>
              <h3 className="activity-type">{activityLabel}</h3>
            </div>
            <div className="reflection-question">
              <h2>{currentActivity.question}</h2>
            </div>
            <div className="reflection-timer">
              {timerSeconds === 0 && !timerRunning && (
                <button
                  className="btn-primary"
                  onClick={() => startTimer(currentActivity.quietTime || 60)}
                >
                  Start Quiet Time ({currentActivity.quietTime || 60}s)
                </button>
              )}
              {timerSeconds > 0 && (
                <div className="timer-display large">
                  {formatTime(timerSeconds)}
                </div>
              )}
              {timerSeconds === 0 && timerRunning === false && showAnswer && (
                <div className="share-prompt">
                  <p>{currentActivity.sharePrompt}</p>
                </div>
              )}
            </div>
            {!showAnswer && timerSeconds === 0 && (
              <button className="btn-secondary" onClick={handleShowAnswer}>
                Show Share Prompt
              </button>
            )}
          </div>
        );

      case WARMUP_ACTIVITY_TYPES.QUICK_GAME:
        return (
          <div className="activity-content quick-game">
            <div className="activity-header">
              <span className="activity-icon">{activityIcon}</span>
              <h3 className="activity-type">{activityLabel}</h3>
            </div>
            <div className="game-name">
              <h1>{currentActivity.name}</h1>
            </div>
            <div className="game-instructions">
              <p>{currentActivity.instructions}</p>
            </div>
            <div className="game-timer">
              {timerSeconds === 0 && !timerRunning && (
                <button
                  className="btn-primary"
                  onClick={() => startTimer(currentActivity.timeLimit || 300)}
                >
                  Start Game Timer
                </button>
              )}
              {timerSeconds > 0 && (
                <div className="timer-display large">
                  {formatTime(timerSeconds)}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="activity-content">
            <p>Unknown activity type</p>
          </div>
        );
    }
  };

  return (
    <div className="warmup-page">
      <div className="warmup-container">
        {/* Header */}
        <div className="warmup-header">
          <div className="warmup-title">
            <h1>Pre-Class Warmup</h1>
            <p className="playlist-name">{activePlaylist.name}</p>
          </div>
          <button className="btn-danger" onClick={handleEnd}>
            End Session
          </button>
        </div>

        {/* Progress Bar */}
        <div className="warmup-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-text">
            Activity {currentActivityIndex + 1} of {activePlaylist.activities.length}
          </div>
        </div>

        {/* Activity Display */}
        <div className="warmup-activity">
          {renderActivity()}
        </div>

        {/* Navigation Controls */}
        <div className="warmup-controls">
          <button
            className="btn-secondary"
            onClick={handlePrevious}
            disabled={currentActivityIndex === 0}
          >
            ← Previous
          </button>
          <div className="activity-indicator">
            {activePlaylist.activities.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentActivityIndex ? 'active' : ''} ${
                  index < currentActivityIndex ? 'completed' : ''
                }`}
              ></span>
            ))}
          </div>
          <button
            className="btn-primary"
            onClick={handleNext}
          >
            {isLastActivity ? 'Finish' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreClassWarmupPage;
