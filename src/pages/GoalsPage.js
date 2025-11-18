import React, { useState, useEffect } from 'react';
import { useGoals } from '../contexts/GoalContext';
import GoalCard from '../components/GoalCard';
import GoalForm from '../components/GoalForm';
import './GoalsPage.css';

const GoalsPage = () => {
  const {
    goals,
    stats,
    loading,
    error,
    getActiveGoals,
    getCompletedGoals,
  } = useGoals();

  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('priority'); // priority, date, category

  // Filtered and sorted goals
  const getFilteredGoals = () => {
    let filtered = [...goals];

    // Apply status filter
    if (filterStatus === 'active') {
      filtered = getActiveGoals();
    } else if (filterStatus === 'completed') {
      filtered = getCompletedGoals();
    } else if (filterStatus !== 'all') {
      filtered = filtered.filter((g) => g.status === filterStatus);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((g) => g.category === filterCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'date') {
        return new Date(a.targetDate || '9999-12-31') - new Date(b.targetDate || '9999-12-31');
      } else if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });

    return filtered;
  };

  const filteredGoals = getFilteredGoals();

  const categoryOptions = [
    { value: 'PRAYER', label: 'Prayer' },
    { value: 'BIBLE_READING', label: 'Bible Reading' },
    { value: 'SCRIPTURE_MEMORIZATION', label: 'Scripture Memorization' },
    { value: 'SERVICE', label: 'Service' },
    { value: 'DISCIPLESHIP', label: 'Discipleship' },
    { value: 'WORSHIP', label: 'Worship' },
    { value: 'WITNESSING', label: 'Witnessing' },
    { value: 'FELLOWSHIP', label: 'Fellowship' },
    { value: 'SPIRITUAL_DISCIPLINE', label: 'Spiritual Discipline' },
    { value: 'CHARACTER_DEVELOPMENT', label: 'Character Development' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="goals-page">
      <div className="goals-header">
        <div className="goals-header-content">
          <h1>My Spiritual Goals</h1>
          <p>Track your personal spiritual growth journey</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + New Goal
        </button>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="goals-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Goals</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-value">{stats.byStatus.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">{stats.byStatus.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.averageProgress}%</div>
            <div className="stat-label">Average Progress</div>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="goals-controls">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="completed">Completed</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priority">Priority</option>
            <option value="date">Target Date</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <p>Loading goals...</p>
        </div>
      )}

      {/* Goals List */}
      {!loading && filteredGoals.length === 0 && (
        <div className="empty-state">
          <h3>No goals found</h3>
          <p>
            {filterStatus !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Start your spiritual growth journey by creating your first goal!'}
          </p>
          {filterStatus === 'all' && filterCategory === 'all' && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Create Your First Goal
            </button>
          )}
        </div>
      )}

      {!loading && filteredGoals.length > 0 && (
        <div className="goals-grid">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      {/* Goal Form Modal */}
      {showForm && (
        <GoalForm
          onClose={() => setShowForm(false)}
          categoryOptions={categoryOptions}
        />
      )}
    </div>
  );
};

export default GoalsPage;
