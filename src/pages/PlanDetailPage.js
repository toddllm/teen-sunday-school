import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useReadingPlans } from '../contexts/ReadingPlansContext';
import { useAuth } from '../contexts/AuthContext';
import './PlanDetailPage.css';

function PlanDetailPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { getPlanById, startPlan, getUserPlans } = useReadingPlans();
  const { user, ensureUser } = useAuth();

  const [planData, setPlanData] = useState(null);
  const [userPlanProgress, setUserPlanProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  useEffect(() => {
    loadPlanData();
  }, [planId]);

  const loadPlanData = () => {
    try {
      setLoading(true);
      const data = getPlanById(planId);
      if (!data) {
        setError('Plan not found');
        return;
      }
      setPlanData(data);

      // Check if user has already started this plan
      if (user) {
        const userPlans = getUserPlans();
        const userPlan = userPlans.find(up => up.plan.id === planId);
        setUserPlanProgress(userPlan);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPlan = async () => {
    try {
      setError(null);
      ensureUser(); // Ensure user is logged in
      await startPlan(planId);
      navigate(`/plans/${planId}/progress`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleContinuePlan = () => {
    navigate(`/plans/${planId}/progress`);
  };

  if (loading) {
    return (
      <div className="plan-detail-page">
        <div className="container">
          <div className="loading">Loading plan...</div>
        </div>
      </div>
    );
  }

  if (error || !planData) {
    return (
      <div className="plan-detail-page">
        <div className="container">
          <div className="error-state card">
            <h2>Plan Not Found</h2>
            <p>{error || 'The requested plan could not be found.'}</p>
            <Link to="/plans" className="btn btn-primary">
              Back to Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { plan, days } = planData;

  const getDurationLabel = (daysCount) => {
    if (daysCount <= 7) return `${daysCount} days`;
    if (daysCount <= 30) return `${daysCount} days`;
    if (daysCount <= 90) return `${Math.round(daysCount / 7)} weeks`;
    return `${Math.round(daysCount / 30)} months`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'badge-success';
      case 'Intermediate': return 'badge-primary';
      case 'Advanced': return 'badge-accent';
      default: return 'badge-secondary';
    }
  };

  const previewDays = showFullSchedule ? days : days.slice(0, 5);
  const hasMoreDays = days.length > 5;

  return (
    <div className="plan-detail-page">
      <div className="container">
        {/* Back button */}
        <Link to="/plans" className="back-link">
          ← Back to Plans
        </Link>

        {/* Plan header */}
        <div className="plan-header card">
          {plan.is_featured && (
            <div className="featured-badge">Featured</div>
          )}

          <h1>{plan.title}</h1>
          <p className="plan-description">{plan.description}</p>

          <div className="plan-meta-grid">
            <div className="plan-meta-item">
              <span className="meta-label">Duration</span>
              <span className="meta-value">📅 {getDurationLabel(plan.duration_days)}</span>
            </div>
            <div className="plan-meta-item">
              <span className="meta-label">Daily Time</span>
              <span className="meta-value">⏱️ {plan.estimated_daily_minutes} minutes</span>
            </div>
            <div className="plan-meta-item">
              <span className="meta-label">Difficulty</span>
              <span className={`badge ${getDifficultyColor(plan.difficulty)}`}>
                {plan.difficulty}
              </span>
            </div>
            <div className="plan-meta-item">
              <span className="meta-label">Topics</span>
              <div className="plan-tags">
                {plan.tags.map(tag => (
                  <span key={tag} className="badge badge-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="plan-actions">
            {userPlanProgress ? (
              <div className="already-started">
                <div className="progress-summary">
                  <p>
                    You've completed {userPlanProgress.completedDays.length} of {days.length} days
                    ({userPlanProgress.completionPercentage}%)
                  </p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${userPlanProgress.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <button onClick={handleContinuePlan} className="btn btn-primary btn-large">
                  {userPlanProgress.userPlan.status === 'completed'
                    ? 'Review Plan'
                    : 'Continue Plan'}
                </button>
              </div>
            ) : (
              <button onClick={handleStartPlan} className="btn btn-primary btn-large">
                Start This Plan
              </button>
            )}
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}
        </div>

        {/* Schedule preview */}
        <div className="plan-schedule card">
          <h2>Reading Schedule</h2>
          <p className="schedule-description">
            Here's what you'll read each day. Each session includes scripture passages and reflection prompts.
          </p>

          <div className="schedule-list">
            {previewDays.map(day => (
              <div key={day.day_index} className="schedule-day">
                <div className="day-number">Day {day.day_index}</div>
                <div className="day-content">
                  <div className="day-passages">
                    {day.passage_refs.map((ref, idx) => (
                      <span key={idx} className="passage-ref">{ref}</span>
                    ))}
                  </div>
                  {day.notes && (
                    <p className="day-notes">{day.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasMoreDays && (
            <button
              onClick={() => setShowFullSchedule(!showFullSchedule)}
              className="btn btn-outline btn-block"
            >
              {showFullSchedule ? 'Show Less' : `Show All ${days.length} Days`}
            </button>
          )}
        </div>

        {/* Additional info */}
        <div className="plan-tips card">
          <h3>Tips for Success</h3>
          <ul>
            <li>Set a consistent time each day for your reading</li>
            <li>Find a quiet place where you can focus</li>
            <li>Keep a journal to write down insights and prayers</li>
            <li>Don't worry if you miss a day - just pick up where you left off</li>
            <li>Share what you're learning with friends or family</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PlanDetailPage;
