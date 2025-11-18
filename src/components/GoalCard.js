import React, { useState } from 'react';
import { useGoals } from '../contexts/GoalContext';
import GoalForm from './GoalForm';
import GoalProgressTracker from './GoalProgressTracker';
import './GoalCard.css';

const GoalCard = ({ goal }) => {
  const { updateGoal, deleteGoal, getLatestProgress } = useGoals();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const latestProgress = getLatestProgress(goal);

  const formatDate = (dateString) => {
    if (!dateString) return 'No target date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryLabel = (category) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'status-completed';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'NOT_STARTED':
        return 'status-not-started';
      case 'PAUSED':
        return 'status-paused';
      case 'ABANDONED':
        return 'status-abandoned';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-low';
      default:
        return '';
    }
  };

  const handleQuickStatusChange = async (newStatus) => {
    try {
      await updateGoal(goal.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGoal(goal.id);
      setShowConfirmDelete(false);
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const isOverdue =
    goal.targetDate &&
    new Date(goal.targetDate) < new Date() &&
    goal.status !== 'COMPLETED';

  return (
    <>
      <div className={`goal-card ${getStatusColor(goal.status)}`}>
        {/* Header */}
        <div className="goal-card-header">
          <div className="goal-title-section">
            <h3>{goal.title}</h3>
            <div className="goal-badges">
              <span className={`badge priority ${getPriorityColor(goal.priority)}`}>
                {goal.priority}
              </span>
              <span className="badge category">{getCategoryLabel(goal.category)}</span>
            </div>
          </div>
          <div className="goal-actions">
            <button
              className="btn-icon"
              onClick={() => setShowProgressTracker(true)}
              title="Update Progress"
            >
              📊
            </button>
            <button
              className="btn-icon"
              onClick={() => setShowEditForm(true)}
              title="Edit Goal"
            >
              ✏️
            </button>
            <button
              className="btn-icon delete"
              onClick={() => setShowConfirmDelete(true)}
              title="Delete Goal"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Description */}
        {goal.description && (
          <p className="goal-description">{goal.description}</p>
        )}

        {/* Progress Bar */}
        <div className="goal-progress">
          <div className="progress-header">
            <span>Progress</span>
            <span className="progress-percentage">{latestProgress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${latestProgress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="goal-footer">
          <div className="goal-status">
            <span className={`status-badge ${getStatusColor(goal.status)}`}>
              {goal.status.replace('_', ' ')}
            </span>
            {isOverdue && <span className="overdue-badge">⚠️ Overdue</span>}
          </div>
          <div className="goal-date">
            <span className={isOverdue ? 'date-overdue' : ''}>
              🎯 {formatDate(goal.targetDate)}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="goal-quick-actions">
          {goal.status !== 'COMPLETED' && (
            <button
              className="btn-quick-action complete"
              onClick={() => handleQuickStatusChange('COMPLETED')}
            >
              ✓ Mark Complete
            </button>
          )}
          {goal.status === 'NOT_STARTED' && (
            <button
              className="btn-quick-action start"
              onClick={() => handleQuickStatusChange('IN_PROGRESS')}
            >
              ▶ Start Goal
            </button>
          )}
          {goal.status === 'IN_PROGRESS' && (
            <button
              className="btn-quick-action pause"
              onClick={() => handleQuickStatusChange('PAUSED')}
            >
              ⏸ Pause Goal
            </button>
          )}
          {goal.status === 'PAUSED' && (
            <button
              className="btn-quick-action resume"
              onClick={() => handleQuickStatusChange('IN_PROGRESS')}
            >
              ▶ Resume Goal
            </button>
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <GoalForm goal={goal} onClose={() => setShowEditForm(false)} />
      )}

      {/* Progress Tracker Modal */}
      {showProgressTracker && (
        <GoalProgressTracker
          goal={goal}
          onClose={() => setShowProgressTracker(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="modal-overlay" onClick={() => setShowConfirmDelete(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Goal?</h3>
            <p>
              Are you sure you want to delete "{goal.title}"? This action cannot
              be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoalCard;
