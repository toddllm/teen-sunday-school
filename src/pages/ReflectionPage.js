import React, { useState } from 'react';
import { useReflection } from '../contexts/ReflectionContext';
import { Link } from 'react-router-dom';
import './ReflectionPage.css';

function ReflectionPage() {
  const {
    getRecentResponses,
    savedForLater,
    deleteResponse,
    getPromptById,
    getAnalytics
  } = useReflection();

  const [expandedResponse, setExpandedResponse] = useState(null);
  const recentResponses = getRecentResponses(20);
  const analytics = getAnalytics();

  const handleDeleteResponse = (responseId) => {
    if (window.confirm('Are you sure you want to delete this reflection?')) {
      deleteResponse(responseId);
    }
  };

  const toggleExpand = (responseId) => {
    setExpandedResponse(expandedResponse === responseId ? null : responseId);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPassageRef = (ref) => {
    // Format passage reference for display (e.g., "JHN.3" -> "John 3")
    if (!ref) return 'Unknown';
    return ref.replace(/\./g, ' ');
  };

  return (
    <div className="reflection-page">
      <div className="reflection-container">
        <header className="reflection-header">
          <h1>My Reflections</h1>
          <p className="reflection-subtitle">
            Your journey of faith through Scripture
          </p>
        </header>

        {/* Analytics Overview */}
        <div className="analytics-cards">
          <div className="analytics-card">
            <div className="analytics-icon">📝</div>
            <div className="analytics-content">
              <div className="analytics-number">{analytics.totalResponses}</div>
              <div className="analytics-label">Total Reflections</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon">✅</div>
            <div className="analytics-content">
              <div className="analytics-number">{analytics.completionRate}%</div>
              <div className="analytics-label">Completion Rate</div>
            </div>
          </div>

          {savedForLater.length > 0 && (
            <div className="analytics-card highlight">
              <div className="analytics-icon">⏰</div>
              <div className="analytics-content">
                <div className="analytics-number">{savedForLater.length}</div>
                <div className="analytics-label">Saved for Later</div>
              </div>
            </div>
          )}
        </div>

        {/* Saved for Later Section */}
        {savedForLater.length > 0 && (
          <section className="saved-section">
            <h2>Saved for Later</h2>
            <div className="saved-list">
              {savedForLater.map(item => (
                <div key={item.id} className="saved-item">
                  <div className="saved-header">
                    <span className="saved-passage">
                      {formatPassageRef(item.passageRef)}
                    </span>
                    <span className="saved-date">
                      {formatDate(item.savedAt)}
                    </span>
                  </div>
                  <div className="saved-prompts">
                    {item.prompts.map(prompt => (
                      <div key={prompt.id} className="saved-prompt">
                        • {prompt.text}
                      </div>
                    ))}
                  </div>
                  <Link
                    to={`/bible?passage=${item.passageRef}`}
                    className="saved-action"
                  >
                    Return to reading →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Reflections */}
        <section className="reflections-section">
          <h2>Recent Reflections</h2>

          {recentResponses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✍️</div>
              <h3>No reflections yet</h3>
              <p>Start reading Scripture and answer reflection prompts to build your spiritual journal.</p>
              <Link to="/bible" className="cta-button">
                Start Reading
              </Link>
            </div>
          ) : (
            <div className="reflections-list">
              {recentResponses.map(response => {
                const prompt = getPromptById(response.promptId);
                const isExpanded = expandedResponse === response.id;

                return (
                  <div key={response.id} className="reflection-item">
                    <div className="reflection-meta">
                      <span className="reflection-passage">
                        {formatPassageRef(response.passageRef)}
                      </span>
                      <span className="reflection-date">
                        {formatDate(response.createdAt)}
                      </span>
                    </div>

                    <div className="reflection-prompt">
                      {prompt?.text || 'Question not found'}
                    </div>

                    <div className={`reflection-response ${isExpanded ? 'expanded' : ''}`}>
                      {response.responseText}
                    </div>

                    <div className="reflection-actions">
                      <button
                        onClick={() => toggleExpand(response.id)}
                        className="action-button"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                      <button
                        onClick={() => handleDeleteResponse(response.id)}
                        className="action-button delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Category Insights */}
        {Object.keys(analytics.categoryStats).length > 0 && (
          <section className="insights-section">
            <h2>Your Reflection Patterns</h2>
            <div className="category-grid">
              {Object.entries(analytics.categoryStats).map(([category, count]) => (
                <div key={category} className="category-stat">
                  <div className="category-count">{count}</div>
                  <div className="category-name">{category}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ReflectionPage;
