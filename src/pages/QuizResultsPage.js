import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../contexts/QuizContext';
import './QuizResultsPage.css';

const QuizResultsPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { getQuizAnalytics, getAllQuizAttempts, getQuizById } = useQuiz();

  const [quiz, setQuiz] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('analytics'); // 'analytics' or 'attempts'

  useEffect(() => {
    loadData();
  }, [quizId]);

  const loadData = async () => {
    setLoading(true);
    const [quizData, analyticsData, attemptsData] = await Promise.all([
      getQuizById(quizId),
      getQuizAnalytics(quizId),
      getAllQuizAttempts(quizId),
    ]);

    setQuiz(quizData);
    setAnalytics(analyticsData);
    setAttempts(attemptsData);
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="quiz-results-page">
        <div className="loading">Loading results...</div>
      </div>
    );
  }

  if (!quiz || !analytics) {
    return (
      <div className="quiz-results-page">
        <div className="error-message">
          <h2>Quiz not found</h2>
          <button onClick={() => navigate('/admin')} className="back-btn">
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-results-page">
      <div className="results-header">
        <button onClick={() => navigate('/admin')} className="back-btn">
          ← Back to Admin
        </button>
        <h1>Quiz Results: {quiz.title}</h1>
        <div className="view-toggle">
          <button
            onClick={() => setView('analytics')}
            className={`toggle-btn ${view === 'analytics' ? 'active' : ''}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setView('attempts')}
            className={`toggle-btn ${view === 'attempts' ? 'active' : ''}`}
          >
            All Attempts
          </button>
        </div>
      </div>

      {view === 'analytics' && (
        <div className="analytics-view">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <div className="card-value">{analytics.totalAttempts}</div>
                <div className="card-label">Total Attempts</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">👤</div>
              <div className="card-content">
                <div className="card-value">{analytics.uniqueUsers}</div>
                <div className="card-label">Unique Students</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <div className="card-value">{analytics.averageScore}%</div>
                <div className="card-label">Average Score</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">✓</div>
              <div className="card-content">
                <div className="card-value">{analytics.passRate}%</div>
                <div className="card-label">Pass Rate</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">⏱</div>
              <div className="card-content">
                <div className="card-value">{formatTime(analytics.averageTimeSpent)}</div>
                <div className="card-label">Avg Time Spent</div>
              </div>
            </div>
          </div>

          {/* Question Statistics */}
          <div className="question-stats section">
            <h2>Question Performance</h2>
            <p className="section-description">
              Questions are sorted by difficulty (most missed first)
            </p>

            {analytics.questionStats.length === 0 ? (
              <div className="empty-state">
                No attempts yet
              </div>
            ) : (
              <div className="question-stats-list">
                {analytics.questionStats.map((stat, index) => (
                  <div key={stat.questionId} className="question-stat-card">
                    <div className="stat-header">
                      <div className="stat-title">
                        <span className="stat-number">Q{index + 1}</span>
                        <span className="stat-question">{stat.questionText}</span>
                      </div>
                      <div className={`stat-percentage ${
                        stat.correctPercentage >= 80 ? 'good' :
                        stat.correctPercentage >= 60 ? 'medium' : 'poor'
                      }`}>
                        {Math.round(stat.correctPercentage)}%
                      </div>
                    </div>
                    <div className="stat-details">
                      <span className="stat-type">{stat.type.replace('_', ' ')}</span>
                      <span className="stat-attempts">
                        {stat.correctCount} of {stat.totalAttempts} correct
                      </span>
                    </div>
                    <div className="stat-bar">
                      <div
                        className={`stat-fill ${
                          stat.correctPercentage >= 80 ? 'good' :
                          stat.correctPercentage >= 60 ? 'medium' : 'poor'
                        }`}
                        style={{ width: `${stat.correctPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Score Distribution */}
          {analytics.totalAttempts > 0 && (
            <div className="score-distribution section">
              <h2>Score Distribution</h2>
              <div className="distribution-chart">
                {attempts.filter(a => a.completedAt).map((attempt, index) => (
                  <div
                    key={attempt.id}
                    className="score-bar"
                    style={{
                      height: `${Math.max(attempt.score || 0, 5)}%`,
                      background: (attempt.score || 0) >= (quiz.passingScore || 70)
                        ? '#28a745'
                        : '#dc3545'
                    }}
                    title={`${attempt.user.firstName} ${attempt.user.lastName}: ${Math.round(attempt.score || 0)}%`}
                  >
                    <span className="score-label">{Math.round(attempt.score || 0)}%</span>
                  </div>
                ))}
              </div>
              {quiz.passingScore && (
                <div className="passing-line" style={{ bottom: `${quiz.passingScore}%` }}>
                  <span>Passing: {quiz.passingScore}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'attempts' && (
        <div className="attempts-view section">
          <h2>All Attempts ({attempts.length})</h2>

          {attempts.length === 0 ? (
            <div className="empty-state">
              No attempts yet
            </div>
          ) : (
            <div className="attempts-table">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Time Spent</th>
                    <th>Completed At</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td>
                        <div className="student-info">
                          <div className="student-name">
                            {attempt.user.firstName} {attempt.user.lastName}
                          </div>
                          <div className="student-email">{attempt.user.email}</div>
                        </div>
                      </td>
                      <td>
                        <div className={`score-badge ${
                          (attempt.score || 0) >= 80 ? 'excellent' :
                          (attempt.score || 0) >= 70 ? 'good' :
                          (attempt.score || 0) >= 60 ? 'fair' : 'poor'
                        }`}>
                          {Math.round(attempt.score || 0)}%
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${attempt.passed ? 'passed' : 'failed'}`}>
                          {attempt.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td>{formatTime(attempt.timeSpent)}</td>
                      <td>{formatDate(attempt.completedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizResultsPage;
