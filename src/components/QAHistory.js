import React, { useState } from 'react';
import { useQA } from '../contexts/QAContext';
import './QAHistory.css';

const QAHistory = ({ onQuestionClick }) => {
  const { history, deleteQA, clearHistory, getStats } = useQA();
  const [selectedId, setSelectedId] = useState(null);

  const stats = getStats();

  const handleDelete = (e, qaId) => {
    e.stopPropagation();
    if (window.confirm('Delete this question and answer?')) {
      deleteQA(qaId);
      if (selectedId === qaId) {
        setSelectedId(null);
      }
    }
  };

  const toggleExpand = (qaId) => {
    setSelectedId(selectedId === qaId ? null : qaId);
  };

  const getRatingIcon = (rating) => {
    if (rating === 'up') return '👍';
    if (rating === 'down') return '👎';
    return '';
  };

  return (
    <div className="qa-history">
      {/* Statistics */}
      <div className="history-stats">
        <div className="stat-card">
          <span className="stat-value">{stats.totalQuestions}</span>
          <span className="stat-label">Questions Asked</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.upvotes}</span>
          <span className="stat-label">Helpful Answers</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.satisfactionRate}%</span>
          <span className="stat-label">Satisfaction Rate</span>
        </div>
      </div>

      {/* Top Themes */}
      {stats.topThemes.length > 0 && (
        <div className="top-themes">
          <h4>Most Explored Themes:</h4>
          <div className="theme-list">
            {stats.topThemes.map((item, index) => (
              <span key={index} className="theme-badge">
                {item.theme} ({item.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* History List */}
      <div className="history-header">
        <h3>Question History</h3>
        {history.length > 0 && (
          <button onClick={clearHistory} className="clear-history-button">
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="no-history">
          <p>No questions asked yet. Start by asking a question above!</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((qa) => (
            <div
              key={qa.id}
              className={`history-item ${selectedId === qa.id ? 'expanded' : ''}`}
            >
              <div
                className="history-item-header"
                onClick={() => toggleExpand(qa.id)}
              >
                <div className="history-question">
                  <span className="question-icon">❓</span>
                  <span className="question-preview">{qa.question}</span>
                </div>
                <div className="history-meta">
                  {qa.rating && (
                    <span className="rating-indicator">
                      {getRatingIcon(qa.rating)}
                    </span>
                  )}
                  <span className="history-date">
                    {new Date(qa.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, qa.id)}
                    className="delete-button"
                    aria-label="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {selectedId === qa.id && (
                <div className="history-item-details">
                  <div className="history-answer">
                    <strong>Answer:</strong>
                    <p>{qa.answer}</p>
                  </div>

                  {qa.references && qa.references.length > 0 && (
                    <div className="history-references">
                      <strong>References:</strong>
                      <ul>
                        {qa.references.map((ref, index) => (
                          <li key={index}>
                            <button
                              onClick={() => onQuestionClick && onQuestionClick(`Tell me more about ${ref.verse}`)}
                              className="ref-link"
                            >
                              {ref.verse}
                            </button>
                            {ref.relevance && (
                              <span className="ref-note"> - {ref.relevance}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {qa.themes && qa.themes.length > 0 && (
                    <div className="history-themes">
                      <strong>Themes:</strong>
                      <div className="theme-tags-small">
                        {qa.themes.map((theme, index) => (
                          <span key={index} className="theme-tag-small">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="history-actions">
                    <button
                      onClick={() => onQuestionClick && onQuestionClick(qa.question)}
                      className="ask-again-button"
                    >
                      Ask Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QAHistory;
