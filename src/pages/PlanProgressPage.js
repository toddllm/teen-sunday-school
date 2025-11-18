import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useReadingPlans } from '../contexts/ReadingPlansContext';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import './PlanProgressPage.css';

function PlanProgressPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { getPlanById, getUserPlans, completeDay, catchUpPlan, updatePlanStatus } = useReadingPlans();
  const { user } = useAuth();

  const [planData, setPlanData] = useState(null);
  const [userPlanProgress, setUserPlanProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCatchUpDialog, setShowCatchUpDialog] = useState(false);

  useEffect(() => {
    loadPlanData();
  }, [planId, user]);

  const loadPlanData = () => {
    if (!user) {
      navigate('/plans');
      return;
    }

    try {
      setLoading(true);
      const data = getPlanById(planId);
      if (!data) {
        setError('Plan not found');
        return;
      }
      setPlanData(data);

      // Get user's progress
      const userPlans = getUserPlans();
      const userPlan = userPlans.find(up => up.plan.id === planId);
      if (!userPlan) {
        // User hasn't started this plan yet
        navigate(`/plans/${planId}`);
        return;
      }
      setUserPlanProgress(userPlan);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDay = async (dayIndex) => {
    try {
      await completeDay(planId, dayIndex);
      loadPlanData(); // Refresh data
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCatchUp = async (untilDayIndex) => {
    try {
      await catchUpPlan(planId, untilDayIndex);
      setShowCatchUpDialog(false);
      loadPlanData(); // Refresh data
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePausePlan = async () => {
    try {
      await updatePlanStatus(planId, 'paused');
      loadPlanData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResumePlan = async () => {
    try {
      await updatePlanStatus(planId, 'active');
      loadPlanData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="plan-progress-page">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !planData || !userPlanProgress) {
    return (
      <div className="plan-progress-page">
        <div className="container">
          <div className="error-state card">
            <h2>Error</h2>
            <p>{error || 'Could not load plan progress.'}</p>
            <Link to="/plans/my-plans" className="btn btn-primary">
              Back to My Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { plan, days } = planData;
  const { userPlan, completedDays, currentDayIndex, completionPercentage } = userPlanProgress;
  const completedIndices = new Set(completedDays.map(cd => cd.day_index));

  const isCompleted = userPlan.status === 'completed';
  const isPaused = userPlan.status === 'paused';

  return (
    <div className="plan-progress-page">
      <div className="container">
        {/* Back button */}
        <Link to="/plans/my-plans" className="back-link">
          ← Back to My Plans
        </Link>

        {/* Plan header */}
        <div className="plan-header card">
          <div className="header-content">
            <div>
              <h1>{plan.title}</h1>
              <p className="plan-subtitle">
                Started {format(new Date(userPlan.start_date), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="header-actions">
              {isCompleted ? (
                <span className="badge badge-success badge-large">Completed! 🎉</span>
              ) : isPaused ? (
                <button onClick={handleResumePlan} className="btn btn-primary">
                  Resume Plan
                </button>
              ) : (
                <button onClick={handlePausePlan} className="btn btn-outline">
                  Pause Plan
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">
                {completedDays.length} of {days.length} days completed
              </span>
              <span className="progress-percentage">{completionPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}
        </div>

        {/* Catch up option */}
        {!isCompleted && currentDayIndex > 1 && (
          <div className="catch-up-section card">
            <p>Behind schedule? You can catch up by marking previous days as complete.</p>
            <button
              onClick={() => setShowCatchUpDialog(true)}
              className="btn btn-secondary"
            >
              Catch Up to Day {currentDayIndex}
            </button>
          </div>
        )}

        {/* Days list */}
        <div className="days-section">
          <h2>Daily Readings</h2>
          <div className="days-list">
            {days.map(day => {
              const isComplete = completedIndices.has(day.day_index);
              const isCurrent = day.day_index === currentDayIndex;

              return (
                <div
                  key={day.day_index}
                  className={`day-card card ${isComplete ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="day-header">
                    <div className="day-title">
                      <span className="day-number">Day {day.day_index}</span>
                      {isCurrent && !isComplete && (
                        <span className="badge badge-primary">Current</span>
                      )}
                      {isComplete && (
                        <span className="badge badge-success">✓ Complete</span>
                      )}
                    </div>
                    {!isComplete && !isCompleted && (
                      <button
                        onClick={() => handleCompleteDay(day.day_index)}
                        className="btn btn-small btn-primary"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>

                  <div className="day-content">
                    <div className="day-passages">
                      <strong>Read:</strong>{' '}
                      {day.passage_refs.map((ref, idx) => (
                        <span key={idx} className="passage-ref">
                          {ref}
                          {idx < day.passage_refs.length - 1 && ', '}
                        </span>
                      ))}
                    </div>

                    {day.notes && (
                      <div className="day-notes">
                        <strong>Reflection:</strong>
                        <p>{day.notes}</p>
                      </div>
                    )}
                  </div>

                  {isComplete && completedDays.find(cd => cd.day_index === day.day_index) && (
                    <div className="completion-info">
                      Completed {format(
                        new Date(completedDays.find(cd => cd.day_index === day.day_index).completed_at),
                        'MMM d, yyyy'
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion message */}
        {isCompleted && (
          <div className="completion-celebration card">
            <h2>🎉 Congratulations!</h2>
            <p>You've completed the {plan.title} reading plan!</p>
            <p>Keep growing in your faith by starting another plan.</p>
            <Link to="/plans" className="btn btn-primary">
              Browse More Plans
            </Link>
          </div>
        )}

        {/* Catch up dialog */}
        {showCatchUpDialog && (
          <div className="modal-overlay" onClick={() => setShowCatchUpDialog(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Catch Up</h3>
              <p>
                This will mark days 1 through {currentDayIndex} as complete.
                Are you sure you want to do this?
              </p>
              <div className="modal-actions">
                <button
                  onClick={() => setShowCatchUpDialog(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCatchUp(currentDayIndex)}
                  className="btn btn-primary"
                >
                  Catch Up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlanProgressPage;
