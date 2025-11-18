import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVerseText } from '../services/bibleAPI';
import './ChronologicalPlanPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const ChronologicalPlanPage = () => {
  const [planData, setplanData] = useState(null);
  const [currentDayData, setCurrentDayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlanProgress();
  }, []);

  useEffect(() => {
    if (planData && selectedDay !== null) {
      loadDayContent(selectedDay);
    }
  }, [selectedDay, planData]);

  const fetchPlanProgress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('Please log in to view your reading plan');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/bible/me/plans/chronological/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('You are not enrolled in the chronological reading plan. Visit the timeline to start.');
          return;
        }
        throw new Error('Failed to fetch plan progress');
      }

      const data = await response.json();

      if (data.success) {
        setplanData(data.data);
        // Set selected day to current day or first incomplete day
        const enrollment = data.data.enrollment;
        setSelectedDay(enrollment.currentDay);
      } else {
        setError(data.error || 'Failed to load reading plan');
      }
    } catch (err) {
      console.error('Error fetching plan progress:', err);
      setError('Failed to load reading plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDayContent = async (dayNumber) => {
    try {
      const plan = planData.enrollment.plan;
      const dayData = plan.days.find(d => d.dayNumber === dayNumber);

      if (!dayData) return;

      setCurrentDayData(dayData);
    } catch (err) {
      console.error('Error loading day content:', err);
    }
  };

  const toggleDayCompletion = async (dayNumber) => {
    try {
      setUpdatingProgress(true);
      const token = localStorage.getItem('authToken');

      const progress = planData.enrollment.progress || {};
      const isCurrentlyCompleted = progress[dayNumber]?.completed || false;

      const response = await fetch(
        `${API_BASE_URL}/api/bible/me/plans/${planData.enrollment.planId}/progress`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dayNumber,
            completed: !isCurrentlyCompleted,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update local state
        await fetchPlanProgress();
      } else {
        alert(data.error || 'Failed to update progress');
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      alert('Failed to update progress. Please try again.');
    } finally {
      setUpdatingProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="plan-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your reading plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plan-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => navigate('/bible/timeline')} className="btn-primary">
            Go to Timeline
          </button>
        </div>
      </div>
    );
  }

  if (!planData) {
    return null;
  }

  const { enrollment, overallProgress } = planData;
  const plan = enrollment.plan;
  const progress = enrollment.progress || {};

  return (
    <div className="plan-page">
      {/* Header with Overall Progress */}
      <div className="plan-header">
        <h1>{plan.title}</h1>
        <p className="plan-description">{plan.description}</p>

        <div className="overall-progress">
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-value">{overallProgress.currentDay}</span>
              <span className="stat-label">Current Day</span>
            </div>
            <div className="stat">
              <span className="stat-value">{overallProgress.completedDays}</span>
              <span className="stat-label">Days Complete</span>
            </div>
            <div className="stat">
              <span className="stat-value">{overallProgress.totalDays}</span>
              <span className="stat-label">Total Days</span>
            </div>
            <div className="stat">
              <span className="stat-value">{Math.round(overallProgress.percentComplete)}%</span>
              <span className="stat-label">Progress</span>
            </div>
          </div>

          <div className="progress-bar-large">
            <div
              className="progress-bar-fill"
              style={{ width: `${overallProgress.percentComplete}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="plan-content">
        {/* Day Selector Sidebar */}
        <div className="day-sidebar">
          <h3>Reading Schedule</h3>
          <div className="day-list">
            {plan.days.map((day) => {
              const isCompleted = progress[day.dayNumber]?.completed || false;
              const isCurrent = day.dayNumber === selectedDay;

              return (
                <button
                  key={day.dayNumber}
                  className={`day-item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => setSelectedDay(day.dayNumber)}
                >
                  <span className="day-number">Day {day.dayNumber}</span>
                  <span className="day-status">
                    {isCompleted ? '✓' : '○'}
                  </span>
                  {day.timelineEventTitle && (
                    <span className="day-event">{day.timelineEventTitle}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Day Content */}
        <div className="day-content">
          {currentDayData ? (
            <>
              <div className="day-header">
                <h2>Day {currentDayData.dayNumber}</h2>
                {currentDayData.timelineEventTitle && (
                  <h3 className="event-title">{currentDayData.timelineEventTitle}</h3>
                )}
              </div>

              <div className="day-passages">
                <h4>Today's Reading:</h4>
                <div className="passages-list">
                  {(Array.isArray(currentDayData.passages)
                    ? currentDayData.passages
                    : JSON.parse(currentDayData.passages || '[]')
                  ).map((passage, index) => (
                    <div key={index} className="passage-item">
                      <span className="passage-ref">{passage}</span>
                    </div>
                  ))}
                </div>
              </div>

              {currentDayData.notes && (
                <div className="day-notes">
                  <h4>Notes:</h4>
                  <p>{currentDayData.notes}</p>
                </div>
              )}

              {currentDayData.reflectionPrompts && currentDayData.reflectionPrompts.length > 0 && (
                <div className="reflection-prompts">
                  <h4>Reflection Questions:</h4>
                  <ul>
                    {currentDayData.reflectionPrompts.map((prompt, index) => (
                      <li key={index}>{prompt}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="day-actions">
                <button
                  className={`btn-complete ${progress[currentDayData.dayNumber]?.completed ? 'completed' : ''}`}
                  onClick={() => toggleDayCompletion(currentDayData.dayNumber)}
                  disabled={updatingProgress}
                >
                  {updatingProgress ? (
                    'Updating...'
                  ) : progress[currentDayData.dayNumber]?.completed ? (
                    <>✓ Completed</>
                  ) : (
                    'Mark as Complete'
                  )}
                </button>

                <div className="day-navigation">
                  <button
                    className="btn-nav"
                    onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                    disabled={selectedDay === 1}
                  >
                    ← Previous Day
                  </button>
                  <button
                    className="btn-nav"
                    onClick={() => setSelectedDay(Math.min(plan.days.length, selectedDay + 1))}
                    disabled={selectedDay === plan.days.length}
                  >
                    Next Day →
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-day-selected">
              <p>Select a day from the sidebar to view the reading plan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChronologicalPlanPage;
