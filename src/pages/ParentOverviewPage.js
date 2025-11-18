import React, { useState, useEffect } from 'react';
import './ParentOverviewPage.css';

/**
 * Parent Overview Mode
 * Provides read-only overview of lessons and content
 * Does NOT expose private teen data (notes, streaks, scores)
 */
function ParentOverviewPage() {
  const [overview, setOverview] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Please log in to view parent dashboard');
        setLoading(false);
        return;
      }

      // Fetch overview data
      const overviewResponse = await fetch('/api/parent/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!overviewResponse.ok) {
        throw new Error('Failed to fetch parent overview');
      }

      const overviewData = await overviewResponse.json();
      setOverview(overviewData);

      // Fetch calendar data
      const calendarResponse = await fetch('/api/parent/calendar', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!calendarResponse.ok) {
        throw new Error('Failed to fetch parent calendar');
      }

      const calendarData = await calendarResponse.json();
      setCalendar(calendarData);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching parent data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const formatScripture = (scripture) => {
    if (typeof scripture === 'string') {
      return scripture;
    }
    if (Array.isArray(scripture)) {
      return scripture.join(', ');
    }
    return 'N/A';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="parent-overview-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading parent dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="parent-overview-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchParentData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-overview-page">
      <header className="parent-header">
        <h1>Parent Dashboard</h1>
        <p className="subtitle">Stay informed about your teen's Sunday School journey</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
        <button
          className={`tab ${activeTab === 'children' ? 'active' : ''}`}
          onClick={() => setActiveTab('children')}
        >
          My Children
        </button>
      </div>

      {activeTab === 'overview' && overview && (
        <div className="overview-tab">
          {/* Children Overview */}
          {overview.children && overview.children.length > 0 && (
            <section className="section">
              <h2>My Children</h2>
              <div className="children-grid">
                {overview.children.map((child) => (
                  <div key={child.id} className="child-card">
                    <h3>{child.firstName} {child.lastName}</h3>
                    <div className="child-groups">
                      {child.groups && child.groups.length > 0 ? (
                        child.groups.map((group) => (
                          <div key={group.id} className="group-badge">
                            {group.name}
                            {group.grade && ` (${group.grade})`}
                          </div>
                        ))
                      ) : (
                        <p className="no-groups">Not assigned to any groups yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {overview.children && overview.children.length === 0 && (
            <section className="section">
              <div className="empty-state">
                <h2>No Children Linked</h2>
                <p>Link your child's account to view their Sunday School information.</p>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="primary-button"
                >
                  Link Child Account
                </button>
              </div>
            </section>
          )}

          {/* Recent Lessons */}
          {overview.recentLessons && overview.recentLessons.length > 0 && (
            <section className="section">
              <h2>Recent Lessons</h2>
              <div className="lessons-list">
                {overview.recentLessons.map((lesson) => (
                  <div key={lesson.id} className="lesson-card">
                    <div className="lesson-header">
                      <h3>{lesson.title}</h3>
                      <span className="lesson-meta">
                        Q{lesson.quarter} / U{lesson.unit} / L{lesson.lessonNumber}
                      </span>
                    </div>
                    <div className="lesson-content">
                      <div className="scripture">
                        <strong>Scripture:</strong> {formatScripture(lesson.scripture)}
                      </div>
                      {lesson.groups && lesson.groups.length > 0 && (
                        <div className="lesson-groups">
                          {lesson.groups.map((group) => (
                            <span key={group.id} className="group-tag">
                              {group.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="lesson-date">
                        Updated: {formatDate(lesson.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Series */}
          {overview.upcomingSeries && overview.upcomingSeries.length > 0 && (
            <section className="section">
              <h2>Upcoming Series</h2>
              <div className="series-list">
                {overview.upcomingSeries.map((series, index) => (
                  <div key={index} className="series-card">
                    <h3>{series.title}</h3>
                    <span className="series-meta">
                      Quarter {series.quarter}, Unit {series.unit}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {activeTab === 'calendar' && calendar && (
        <div className="calendar-tab">
          <section className="section">
            <h2>Lesson Calendar</h2>
            <p className="section-subtitle">
              {calendar.totalLessons} lessons planned
            </p>
            <div className="calendar-list">
              {calendar.calendar && calendar.calendar.length > 0 ? (
                calendar.calendar.map((lesson) => (
                  <div key={lesson.id} className="calendar-item">
                    <div className="calendar-date">
                      {formatDate(lesson.estimatedDate)}
                    </div>
                    <div className="calendar-content">
                      <h3>{lesson.title}</h3>
                      <p className="scripture">{formatScripture(lesson.scripture)}</p>
                      <div className="calendar-meta">
                        <span>Q{lesson.quarter}</span>
                        <span>U{lesson.unit}</span>
                        <span>L{lesson.lessonNumber}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No lessons scheduled yet</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'children' && overview && (
        <div className="children-tab">
          <section className="section">
            <div className="section-header">
              <h2>Linked Children</h2>
              <button
                onClick={() => setShowLinkModal(true)}
                className="primary-button"
              >
                + Link Child
              </button>
            </div>
            {overview.children && overview.children.length > 0 ? (
              <div className="children-detailed-list">
                {overview.children.map((child) => (
                  <div key={child.id} className="child-detail-card">
                    <div className="child-info">
                      <h3>{child.firstName} {child.lastName}</h3>
                      <div className="permissions">
                        <h4>Permissions</h4>
                        <ul>
                          <li className={child.permissions.canViewProgress ? 'enabled' : 'disabled'}>
                            {child.permissions.canViewProgress ? '✓' : '✗'} View Progress
                          </li>
                          <li className={child.permissions.canViewLessons ? 'enabled' : 'disabled'}>
                            {child.permissions.canViewLessons ? '✓' : '✗'} View Lessons
                          </li>
                          <li className={child.permissions.canViewActivities ? 'enabled' : 'disabled'}>
                            {child.permissions.canViewActivities ? '✓' : '✗'} View Activities
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="child-groups-section">
                      <h4>Groups</h4>
                      {child.groups && child.groups.length > 0 ? (
                        <div className="groups-list">
                          {child.groups.map((group) => (
                            <div key={group.id} className="group-card">
                              <h5>{group.name}</h5>
                              {group.description && <p>{group.description}</p>}
                              {group.grade && <span className="grade-badge">{group.grade}</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>Not assigned to any groups</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No children linked yet</p>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="primary-button"
                >
                  Link Your First Child
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="privacy-notice">
        <p>
          <strong>Privacy Protected:</strong> This dashboard shows lesson content and topics
          only. Individual teen activities, notes, streaks, and scores are kept private.
        </p>
      </div>

      {/* Link Child Modal */}
      {showLinkModal && (
        <LinkChildModal
          onClose={() => setShowLinkModal(false)}
          onSuccess={() => {
            setShowLinkModal(false);
            fetchParentData();
          }}
        />
      )}
    </div>
  );
}

/**
 * Modal component for linking a child account
 */
function LinkChildModal({ onClose, onSuccess }) {
  const [childEmail, setChildEmail] = useState('');
  const [canViewActivities, setCanViewActivities] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/parent/children', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childEmail,
          canViewActivities,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to link child');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Link Child Account</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="childEmail">Child's Email Address</label>
            <input
              type="email"
              id="childEmail"
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
              required
              placeholder="child@example.com"
            />
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={canViewActivities}
                onChange={(e) => setCanViewActivities(e.target.checked)}
              />
              <span>Allow viewing private activities (optional)</span>
            </label>
            <p className="help-text">
              By default, only lesson content is visible. Check this to also view
              your teen's activities, notes, and progress.
            </p>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="secondary-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="primary-button">
              {loading ? 'Linking...' : 'Link Child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ParentOverviewPage;
