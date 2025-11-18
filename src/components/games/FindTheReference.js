import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FindTheReference.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const FindTheReference = () => {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState('random');
  const [difficulty, setDifficulty] = useState('all');
  const [sessionId] = useState(() => {
    // Generate or retrieve session ID for anonymous users
    let sid = localStorage.getItem('findReferenceSessionId');
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('findReferenceSessionId', sid);
    }
    return sid;
  });
  const [roundNumber, setRoundNumber] = useState(1);
  const [answerStartTime, setAnswerStartTime] = useState(null);

  // Load available books on mount
  useEffect(() => {
    loadBooks();
    loadStats();
  }, []);

  // Load new question when filters change
  useEffect(() => {
    loadQuestion();
  }, [selectedBook, difficulty]);

  const loadBooks = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/games/find-reference/books`);
      setBooks(response.data.books || []);
    } catch (err) {
      console.error('Error loading books:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/games/find-reference/stats?sessionId=${sessionId}`
      );
      setStats(response.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        scope: selectedBook,
        difficulty: difficulty,
        limit: '1',
      });

      const response = await axios.get(
        `${API_URL}/api/games/find-reference?${params}`
      );

      if (response.data.questions && response.data.questions.length > 0) {
        setQuestion(response.data.questions[0]);
        setSelectedAnswer(null);
        setShowResult(false);
        setResult(null);
        setAnswerStartTime(Date.now());
      } else {
        setError('No questions available for the selected filters.');
        setQuestion(null);
      }
    } catch (err) {
      console.error('Error loading question:', err);
      setError('Failed to load question. Please try again.');
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answer) => {
    if (showResult) return; // Prevent re-selection

    setSelectedAnswer(answer);
    setShowResult(true);

    // Calculate time to answer
    const timeToAnswerMs = answerStartTime ? Date.now() - answerStartTime : null;

    try {
      const response = await axios.post(`${API_URL}/api/games/find-reference/attempts`, {
        questionId: question.id,
        selectedAnswer: answer,
        timeToAnswerMs,
        gameMode: selectedBook === 'random' ? 'random' : `book:${selectedBook}`,
        roundNumber,
        sessionId,
      });

      setResult(response.data);

      // Reload stats after submission
      setTimeout(loadStats, 500);
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer.');
    }
  };

  const handleNextQuestion = () => {
    setRoundNumber(roundNumber + 1);
    loadQuestion();
  };

  const handleNewGame = () => {
    setRoundNumber(1);
    loadQuestion();
  };

  if (loading && !question) {
    return (
      <div className="find-reference-container">
        <div className="find-reference-loading">Loading question...</div>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="find-reference-container">
        <div className="find-reference-error">{error}</div>
        <button onClick={loadQuestion} className="find-reference-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="find-reference-container">
      <div className="find-reference-header">
        <h2>Find the Reference</h2>
        <button onClick={handleNewGame} className="find-reference-new-game-btn">
          New Game
        </button>
      </div>

      {/* Game Stats */}
      {stats && (
        <div className="find-reference-stats">
          <div className="stat-item">
            <span className="stat-label">Streak:</span>
            <span className="stat-value">{stats.currentStreak}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Best:</span>
            <span className="stat-value">{stats.bestStreak}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Accuracy:</span>
            <span className="stat-value">{stats.accuracy}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{stats.totalAttempts}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="find-reference-filters">
        <div className="filter-group">
          <label htmlFor="book-filter">Book:</label>
          <select
            id="book-filter"
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="find-reference-select"
          >
            <option value="random">Random</option>
            {books.map((book) => (
              <option key={book} value={book}>
                {book}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="difficulty-filter">Difficulty:</label>
          <select
            id="difficulty-filter"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="find-reference-select"
          >
            <option value="all">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Round Number */}
      <div className="find-reference-round">
        <span>Round {roundNumber}</span>
        {question && question.difficulty && (
          <span className={`difficulty-badge ${question.difficulty}`}>
            {question.difficulty}
          </span>
        )}
      </div>

      {/* Question */}
      {question && (
        <div className="find-reference-question">
          <div className="verse-text">"{question.displayText}"</div>

          {/* Answer Options */}
          <div className="find-reference-options">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = result && option === result.correctAnswer;
              const isWrong = showResult && isSelected && !isCorrect;

              let buttonClass = 'find-reference-option';
              if (showResult) {
                if (isCorrect) {
                  buttonClass += ' correct';
                } else if (isWrong) {
                  buttonClass += ' wrong';
                } else {
                  buttonClass += ' disabled';
                }
              } else if (isSelected) {
                buttonClass += ' selected';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Result Message */}
          {showResult && result && (
            <div className={`find-reference-result ${result.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="result-message">{result.explanation}</div>
              {!result.isCorrect && (
                <div className="result-details">
                  <p>
                    <strong>Correct Answer:</strong> {result.correctAnswer}
                  </p>
                  <p>
                    <strong>Reference:</strong> {result.verseReference}
                  </p>
                </div>
              )}
              <button onClick={handleNextQuestion} className="find-reference-btn next-btn">
                Next Question →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!showResult && (
        <div className="find-reference-instructions">
          <p>Read the verse and select the correct Bible reference from the options above.</p>
        </div>
      )}
    </div>
  );
};

export default FindTheReference;
