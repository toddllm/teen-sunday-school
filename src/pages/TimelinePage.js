import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TimelinePage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const TimelinePage = () => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userProgress, setUserProgress] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const navigate = useNavigate();

  // Fetch timeline data
  useEffect(() => {
    fetchTimeline();
    checkEnrollment();
  }, []);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/bible/timeline/chronological`);
      const data = await response.json();

      if (data.success) {
        setTimeline(data.data);
      } else {
        setError('Failed to load timeline');
      }
    } catch (err) {
      console.error('Error fetching timeline:', err);
      setError('Failed to load timeline. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/bible/me/plans/chronological/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsEnrolled(true);
          setUserProgress(data.data);
        }
      }
    } catch (err) {
      // User is not enrolled or not authenticated
      console.log('Not enrolled in chronological plan');
    }
  };

  const handleStartPlan = async () => {
    try {
      setEnrolling(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        alert('Please log in to start the chronological reading plan');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/bible/me/plans/chronological/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setIsEnrolled(true);
        alert('Successfully enrolled in the chronological reading plan!');
        checkEnrollment(); // Refresh progress
      } else {
        alert(data.error || 'Failed to start reading plan');
      }
    } catch (err) {
      console.error('Error starting plan:', err);
      alert('Failed to start reading plan. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const categories = ['all', ...new Set(timeline.map(e => e.category).filter(Boolean))];

  const filteredTimeline = selectedCategory === 'all'
    ? timeline
    : timeline.filter(e => e.category === selectedCategory);

  const getEventProgress = (eventId) => {
    if (!userProgress || !userProgress.timeline) return null;
    const event = userProgress.timeline.find(e => e.id === eventId);
    return event ? {
      completedDays: event.completedDays,
      totalDays: event.totalDays,
      percentComplete: event.percentComplete,
    } : null;
  };

  if (loading) {
    return (
      <div className="timeline-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading Bible timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timeline-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchTimeline} className="btn-retry">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-page">
      {/* Header */}
      <div className="timeline-header">
        <h1>Bible Timeline</h1>
        <p className="timeline-subtitle">
          Explore the story of the Bible in chronological order
        </p>

        {!isEnrolled ? (
          <button
            onClick={handleStartPlan}
            className="btn-start-plan"
            disabled={enrolling}
          >
            {enrolling ? 'Starting...' : 'Start Chronological Reading Plan'}
          </button>
        ) : (
          <div className="progress-summary">
            <h3>Your Progress</h3>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${userProgress?.overallProgress?.percentComplete || 0}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {userProgress?.overallProgress?.completedDays || 0} of {userProgress?.overallProgress?.totalDays || 0} days complete
              ({Math.round(userProgress?.overallProgress?.percentComplete || 0)}%)
            </p>
            <button
              onClick={() => navigate('/bible/chronological-plan')}
              className="btn-view-plan"
            >
              View My Reading Plan
            </button>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <label>Filter by category:</label>
        <div className="category-buttons">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Events' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline-container">
        <div className="timeline-line"></div>

        {filteredTimeline.map((event, index) => {
          const progress = getEventProgress(event.id);
          const hasProgress = progress && progress.totalDays > 0;

          return (
            <div
              key={event.id}
              className={`timeline-event ${index % 2 === 0 ? 'left' : 'right'}`}
            >
              <div className="timeline-marker">
                {hasProgress && progress.percentComplete === 100 ? (
                  <span className="marker-completed">✓</span>
                ) : (
                  <span className="marker-dot"></span>
                )}
              </div>

              <div className="timeline-content">
                <div className="event-header">
                  <h3 className="event-title">{event.title}</h3>
                  <span className="event-date">{event.dateRange}</span>
                  {event.category && (
                    <span className="event-category">{event.category}</span>
                  )}
                </div>

                <p className="event-description">{event.description}</p>

                {event.readingSegments && event.readingSegments.length > 0 && (
                  <div className="reading-segments">
                    <h4>Reading Path:</h4>
                    {event.readingSegments.map((segment) => (
                      <div key={segment.id} className="reading-segment">
                        <div className="segment-passages">
                          {Array.isArray(segment.passages)
                            ? segment.passages.join(', ')
                            : JSON.parse(segment.passages).join(', ')}
                        </div>
                        {segment.notes && (
                          <p className="segment-notes">{segment.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {hasProgress && (
                  <div className="event-progress">
                    <div className="event-progress-bar">
                      <div
                        className="event-progress-fill"
                        style={{ width: `${progress.percentComplete}%` }}
                      ></div>
                    </div>
                    <p className="event-progress-text">
                      {progress.completedDays} / {progress.totalDays} segments complete
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTimeline.length === 0 && (
        <div className="no-events">
          <p>No events found for this category.</p>
        </div>
      )}

      {/* Footer CTA */}
      {!isEnrolled && timeline.length > 0 && (
        <div className="timeline-footer">
          <div className="footer-cta">
            <h2>Ready to read the Bible in story order?</h2>
            <p>Join the chronological reading plan and follow along with the timeline.</p>
            <button
              onClick={handleStartPlan}
              className="btn-start-plan-footer"
              disabled={enrolling}
            >
              {enrolling ? 'Starting...' : 'Start Reading Plan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinePage;
