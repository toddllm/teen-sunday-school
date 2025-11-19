import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemoryVerse } from '../contexts/MemoryVerseContext';
import { useStreak } from '../contexts/StreakContext';
import './ReviewSessionPage.css';

const EXERCISE_TYPES = ['recall', 'fill-blank', 'type'];

const ReviewSessionPage = () => {
  const navigate = useNavigate();
  const { getDueVerses, reviewVerse } = useMemoryVerse();
  const { logActivity } = useStreak();

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [exerciseType, setExerciseType] = useState('recall');
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    easy: 0,
    good: 0,
    hard: 0,
    forgot: 0,
  });

  useEffect(() => {
    const dueVerses = getDueVerses();
    if (dueVerses.length === 0) {
      navigate('/memory-verses');
      return;
    }

    // Shuffle verses and assign random exercise types
    const shuffled = [...dueVerses].sort(() => Math.random() - 0.5);
    const withExercises = shuffled.map(verse => ({
      ...verse,
      exerciseType: EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)],
    }));

    setSession(withExercises);
    setExerciseType(withExercises[0]?.exerciseType || 'recall');
    setSessionStats({ total: withExercises.length, easy: 0, good: 0, hard: 0, forgot: 0 });
  }, [getDueVerses, navigate]);

  if (!session || session.length === 0) {
    return <div className="loading">Loading review session...</div>;
  }

  const currentVerse = session[currentIndex];
  const progress = ((currentIndex + 1) / session.length) * 100;

  const handleDifficultyRating = (difficulty) => {
    reviewVerse(currentVerse.id, difficulty);

    // Log to streak system
    logActivity('VERSE_MEMORIZED');

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      [difficulty]: prev[difficulty] + 1,
    }));

    // Move to next verse or complete session
    if (currentIndex < session.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setUserInput('');
      setExerciseType(session[currentIndex + 1].exerciseType);
    } else {
      setSessionComplete(true);
    }
  };

  const createFillInBlank = (text) => {
    const words = text.split(' ');
    const numBlanks = Math.max(1, Math.floor(words.length * 0.25)); // Blank out 25% of words
    const blankedIndices = new Set();

    while (blankedIndices.size < numBlanks) {
      const randomIndex = Math.floor(Math.random() * words.length);
      if (words[randomIndex].length > 3) { // Only blank words with more than 3 letters
        blankedIndices.add(randomIndex);
      }
    }

    return words.map((word, index) => {
      if (blankedIndices.has(index)) {
        return {
          word,
          isBlank: true,
        };
      }
      return {
        word,
        isBlank: false,
      };
    });
  };

  const calculateSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase().replace(/[^\w\s]/g, '');
    const s2 = str2.toLowerCase().replace(/[^\w\s]/g, '');

    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);

    const commonWords = words1.filter(word => words2.includes(word));
    const similarity = (commonWords.length / Math.max(words1.length, words2.length)) * 100;

    return Math.round(similarity);
  };

  if (sessionComplete) {
    const accuracy = ((sessionStats.easy + sessionStats.good) / sessionStats.total) * 100;

    return (
      <div className="review-session-page">
        <div className="session-complete">
          <div className="complete-icon">🎉</div>
          <h1>Review Complete!</h1>
          <p className="complete-message">
            You've reviewed {sessionStats.total} verse{sessionStats.total !== 1 ? 's' : ''} today.
            Great job building your Bible memory!
          </p>

          <div className="session-summary">
            <h3>Session Summary</h3>
            <div className="summary-stats">
              <div className="summary-item easy">
                <div className="summary-count">{sessionStats.easy}</div>
                <div className="summary-label">Easy</div>
              </div>
              <div className="summary-item good">
                <div className="summary-count">{sessionStats.good || 0}</div>
                <div className="summary-label">Good</div>
              </div>
              <div className="summary-item hard">
                <div className="summary-count">{sessionStats.hard}</div>
                <div className="summary-label">Hard</div>
              </div>
              <div className="summary-item forgot">
                <div className="summary-count">{sessionStats.forgot}</div>
                <div className="summary-label">Forgot</div>
              </div>
            </div>
            <div className="accuracy-bar">
              <div className="accuracy-fill" style={{ width: `${accuracy}%` }}></div>
            </div>
            <p className="accuracy-text">{accuracy.toFixed(0)}% accuracy</p>
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate('/memory-verses')}
          >
            Back to Memory Verses
          </button>
        </div>
      </div>
    );
  }

  const renderExercise = () => {
    switch (exerciseType) {
      case 'recall':
        return (
          <div className="exercise-recall">
            <h2 className="exercise-title">Recall the Verse</h2>
            <div className="verse-reference-display">
              {currentVerse.reference}
            </div>
            <p className="exercise-instruction">
              Try to recall the text of this verse, then click "Show Answer" to check.
            </p>
            {showAnswer && (
              <div className="answer-reveal">
                <div className="verse-text-answer">{currentVerse.text}</div>
              </div>
            )}
          </div>
        );

      case 'fill-blank':
        const blankedWords = createFillInBlank(currentVerse.text);
        return (
          <div className="exercise-fill-blank">
            <h2 className="exercise-title">Fill in the Blanks</h2>
            <div className="verse-reference-small">{currentVerse.reference}</div>
            <div className="fill-blank-text">
              {blankedWords.map((item, index) => (
                <span key={index}>
                  {item.isBlank ? (
                    <span className="blank-word">
                      {showAnswer ? item.word : '______'}
                    </span>
                  ) : (
                    <span>{item.word}</span>
                  )}
                  {index < blankedWords.length - 1 && ' '}
                </span>
              ))}
            </div>
            <p className="exercise-instruction">
              {showAnswer ? 'Here are the missing words!' : 'Try to recall the missing words, then click "Show Answer".'}
            </p>
          </div>
        );

      case 'type':
        const similarity = userInput ? calculateSimilarity(userInput, currentVerse.text) : 0;
        return (
          <div className="exercise-type">
            <h2 className="exercise-title">Type the Verse</h2>
            <div className="verse-reference-small">{currentVerse.reference}</div>
            <textarea
              className="type-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type the verse here..."
              rows={6}
            />
            {showAnswer && (
              <div className="answer-comparison">
                <div className="similarity-score">
                  Similarity: {similarity}%
                </div>
                <div className="correct-text">
                  <strong>Correct text:</strong>
                  <p>{currentVerse.text}</p>
                </div>
              </div>
            )}
            <p className="exercise-instruction">
              {showAnswer ? 'Compare your answer with the correct text above.' : 'Type the verse from memory, then click "Show Answer".'}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="review-session-page">
      <div className="session-header">
        <button className="back-btn" onClick={() => navigate('/memory-verses')}>
          ← Back
        </button>
        <div className="session-progress">
          <span className="progress-text">
            {currentIndex + 1} of {session.length}
          </span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="exercise-container">
        {renderExercise()}

        <div className="exercise-actions">
          {!showAnswer ? (
            <button
              className="btn-show-answer"
              onClick={() => setShowAnswer(true)}
            >
              Show Answer
            </button>
          ) : (
            <div className="difficulty-buttons">
              <p className="difficulty-prompt">How well did you remember this verse?</p>
              <div className="difficulty-grid">
                <button
                  className="difficulty-btn forgot"
                  onClick={() => handleDifficultyRating('forgot')}
                >
                  <span className="btn-emoji">😓</span>
                  <span className="btn-text">Forgot</span>
                  <span className="btn-detail">Review tomorrow</span>
                </button>
                <button
                  className="difficulty-btn hard"
                  onClick={() => handleDifficultyRating('hard')}
                >
                  <span className="btn-emoji">😅</span>
                  <span className="btn-text">Hard</span>
                  <span className="btn-detail">Review in 2 days</span>
                </button>
                <button
                  className="difficulty-btn good"
                  onClick={() => handleDifficultyRating('good')}
                >
                  <span className="btn-emoji">😊</span>
                  <span className="btn-text">Good</span>
                  <span className="btn-detail">Review in 4 days</span>
                </button>
                <button
                  className="difficulty-btn easy"
                  onClick={() => handleDifficultyRating('easy')}
                >
                  <span className="btn-emoji">😄</span>
                  <span className="btn-text">Easy</span>
                  <span className="btn-detail">Review in 1 week</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSessionPage;
