import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../contexts/QuizContext';
import { useAuth } from '../contexts/AuthContext';
import './QuizTakePage.css';

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { getQuizById, submitQuizAttempt, loading } = useQuiz();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz && quiz.timeLimit && !submitted) {
      setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
      setStartTime(Date.now());
    }
  }, [quiz, submitted]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, submitted]);

  const loadQuiz = async () => {
    const quizData = await getQuizById(quizId);
    if (quizData) {
      setQuiz(quizData);

      // Check if user has already taken this quiz
      const hasAttempts = quizData.attempts && quizData.attempts.length > 0;
      if (hasAttempts && !quizData.allowRetakes) {
        const lastAttempt = quizData.attempts[0];
        setSubmitted(true);
        setResult(lastAttempt);
      }
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit your quiz?')) {
      return;
    }

    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

    const submitResult = await submitQuizAttempt(quizId, answers, timeSpent);

    if (submitResult.success) {
      setSubmitted(true);
      setResult(submitResult.data);
    } else {
      alert('Failed to submit quiz: ' + submitResult.error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading && !quiz) {
    return (
      <div className="quiz-take-page">
        <div className="loading">Loading quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-take-page">
        <div className="error-message">
          <h2>Quiz not found</h2>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="quiz-take-page">
        <div className="quiz-result">
          <div className="result-header">
            <h1>Quiz Completed!</h1>
            <div className={`score-badge ${result.passed ? 'passed' : 'failed'}`}>
              {Math.round(result.score)}%
            </div>
          </div>

          <div className="result-details">
            <p className="result-status">
              {result.passed ? '✓ Passed' : '✗ Did not pass'}
            </p>
            {quiz.passingScore && (
              <p className="passing-score">Passing score: {quiz.passingScore}%</p>
            )}
            {result.timeSpent && (
              <p className="time-spent">Time spent: {formatTime(result.timeSpent)}</p>
            )}
          </div>

          {quiz.showCorrectAnswers && (
            <div className="answers-review">
              <h2>Review Your Answers</h2>
              {quiz.questions.map((question, index) => {
                const userAnswerData = result.answersJson[question.id];
                const isCorrect = userAnswerData?.isCorrect;

                return (
                  <div key={question.id} className={`review-question ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="review-header">
                      <span className="question-number">Question {index + 1}</span>
                      <span className={`result-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? '✓' : '✗'}
                      </span>
                    </div>

                    <p className="question-text">{question.questionText}</p>

                    <div className="answer-info">
                      <p>
                        <strong>Your answer:</strong>{' '}
                        {question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE'
                          ? question.options[userAnswerData?.answer] || 'Not answered'
                          : userAnswerData?.answer || 'Not answered'}
                      </p>

                      {!isCorrect && userAnswerData?.correctAnswer !== null && (
                        <p className="correct-answer">
                          <strong>Correct answer:</strong>{' '}
                          {question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE'
                            ? question.options[userAnswerData.correctAnswer]
                            : userAnswerData.correctAnswer}
                        </p>
                      )}

                      {userAnswerData?.explanation && (
                        <p className="explanation">
                          <strong>Explanation:</strong> {userAnswerData.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="result-actions">
            {quiz.allowRetakes && (
              <button onClick={() => window.location.reload()} className="retake-btn">
                Retake Quiz
              </button>
            )}
            <button onClick={() => navigate(-1)} className="back-btn">
              Back to Lesson
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="quiz-take-page">
      <div className="quiz-header">
        <div className="quiz-info">
          <h1>{quiz.title}</h1>
          {quiz.description && <p className="quiz-description">{quiz.description}</p>}
        </div>

        <div className="quiz-meta">
          <div className="progress-info">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
            <span className="answered-count">
              ({getAnsweredCount()} answered)
            </span>
          </div>
          {timeRemaining !== null && (
            <div className={`time-remaining ${timeRemaining < 60 ? 'warning' : ''}`}>
              ⏱ {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-container">
          <div className="question-header">
            <span className="question-number">Question {currentQuestionIndex + 1}</span>
            <span className="question-points">{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}</span>
          </div>

          <h2 className="question-text">{currentQuestion.questionText}</h2>

          <div className="answer-options">
            {/* Multiple Choice */}
            {currentQuestion.type === 'MULTIPLE_CHOICE' && (
              <div className="multiple-choice">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="option-label">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={index}
                      checked={answers[currentQuestion.id] === String(index)}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* True/False */}
            {currentQuestion.type === 'TRUE_FALSE' && (
              <div className="true-false">
                <label className="option-label">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value="0"
                    checked={answers[currentQuestion.id] === '0'}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  />
                  <span className="option-text">True</span>
                </label>
                <label className="option-label">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value="1"
                    checked={answers[currentQuestion.id] === '1'}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  />
                  <span className="option-text">False</span>
                </label>
              </div>
            )}

            {/* Short Answer / Fill in Blank */}
            {(currentQuestion.type === 'SHORT_ANSWER' || currentQuestion.type === 'FILL_IN_BLANK') && (
              <div className="text-answer">
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Enter your answer"
                  className="answer-input"
                />
              </div>
            )}
          </div>
        </div>

        <div className="quiz-navigation">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="nav-btn prev-btn"
          >
            ← Previous
          </button>

          <div className="question-dots">
            {quiz.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`question-dot ${index === currentQuestionIndex ? 'active' : ''} ${
                  answers[q.id] !== undefined ? 'answered' : ''
                }`}
                title={`Question ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button onClick={handleNextQuestion} className="nav-btn next-btn">
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTakePage;
