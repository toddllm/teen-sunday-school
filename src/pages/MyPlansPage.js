import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReadingPlans } from '../contexts/ReadingPlansContext';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import './MyPlansPage.css';

function MyPlansPage() {
  const { getUserPlans } = useReadingPlans();
  const { user, ensureUser } = useAuth();
  const [activePlans, setActivePlans] = useState([]);
  const [pausedPlans, setPausedPlans] = useState([]);
  const [completedPlans, setCompletedPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    loadUserPlans();
  }, [user]);

  const loadUserPlans = () => {
    if (!user) {
      ensureUser();
      return;
    }

    const allPlans = getUserPlans();
    setActivePlans(allPlans.filter(up => up.userPlan.status === 'active'));
    setPausedPlans(allPlans.filter(up => up.userPlan.status === 'paused'));
    setCompletedPlans(allPlans.filter(up => up.userPlan.status === 'completed'));
  };

  const renderPlanCard = (userPlanProgress) => {
    const { plan, userPlan, completedDays, days, currentDayIndex, completionPercentage } = userPlanProgress;
    const isCompleted = userPlan.status === 'completed';

    return (
      <Link
        key={userPlan.id}
        to={`/plans/${plan.id}/progress`}
        className="my-plan-card card"
      >
        <div className="plan-card-header">
          <h3>{plan.title}</h3>
          {userPlan.status === 'paused' && (
            <span className="badge badge-secondary">Paused</span>
          )}
          {isCompleted && (
            <span className="badge badge-success">Completed</span>
          )}
        </div>

        <p className="plan-description">{plan.description}</p>

        <div className="plan-progress">
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

        <div className="plan-card-footer">
          <div className="plan-meta-item">
            <span className="meta-icon">📅</span>
            <span className="meta-text">
              Started {format(new Date(userPlan.start_date), 'MMM d, yyyy')}
            </span>
          </div>
          {!isCompleted && (
            <div className="plan-meta-item">
              <span className="meta-icon">📖</span>
              <span className="meta-text">
                Next: Day {currentDayIndex}
              </span>
            </div>
          )}
        </div>
      </Link>
    );
  };

  const renderEmptyState = (message) => (
    <div className="empty-state card">
      <p>{message}</p>
      <Link to="/plans" className="btn btn-primary">
        Browse Reading Plans
      </Link>
    </div>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case 'active':
        return activePlans.length > 0 ? (
          <div className="plans-grid">
            {activePlans.map(renderPlanCard)}
          </div>
        ) : (
          renderEmptyState("You don't have any active plans. Start one today!")
        );

      case 'paused':
        return pausedPlans.length > 0 ? (
          <div className="plans-grid">
            {pausedPlans.map(renderPlanCard)}
          </div>
        ) : (
          renderEmptyState("You don't have any paused plans.")
        );

      case 'completed':
        return completedPlans.length > 0 ? (
          <div className="plans-grid">
            {completedPlans.map(renderPlanCard)}
          </div>
        ) : (
          renderEmptyState("You haven't completed any plans yet. Keep going!")
        );

      default:
        return null;
    }
  };

  const totalPlans = activePlans.length + pausedPlans.length + completedPlans.length;

  return (
    <div className="my-plans-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>My Reading Plans</h1>
            <p className="page-subtitle">
              Track your progress and continue your Bible reading journey
            </p>
          </div>
          <Link to="/plans" className="btn btn-outline">
            Browse Plans
          </Link>
        </div>

        {/* Stats */}
        {totalPlans > 0 && (
          <div className="stats-grid">
            <div className="stat-card card">
              <div className="stat-value">{activePlans.length}</div>
              <div className="stat-label">Active Plans</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">{completedPlans.length}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">
                {activePlans.reduce((sum, up) => sum + up.completedDays.length, 0)}
              </div>
              <div className="stat-label">Days Read</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        {totalPlans > 0 && (
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active ({activePlans.length})
            </button>
            <button
              className={`tab ${activeTab === 'paused' ? 'active' : ''}`}
              onClick={() => setActiveTab('paused')}
            >
              Paused ({pausedPlans.length})
            </button>
            <button
              className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed ({completedPlans.length})
            </button>
          </div>
        )}

        {/* Content */}
        {getTabContent()}
      </div>
    </div>
  );
}

export default MyPlansPage;
