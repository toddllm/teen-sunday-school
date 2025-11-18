import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { plansAPI } from '../services/api';
import './PlansPage.css';

const PlansPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });

  useEffect(() => {
    loadPlans();
  }, [filters]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await plansAPI.getPlans(filters);
      setPlans(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load plans');
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleEnroll = async (planId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await plansAPI.enrollPlan(planId);
      navigate('/today');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll in plan');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading reading plans...</p>
      </div>
    );
  }

  return (
    <div className="plans-page">
      <div className="plans-header">
        <h1>Reading Plans</h1>
        <p>Choose a plan to guide your daily Bible reading</p>
      </div>

      {/* Filters */}
      <div className="plans-filters">
        <div className="filter-group">
          <label htmlFor="search">Search</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search plans..."
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            <option value="gospels">Gospels</option>
            <option value="epistles">Epistles</option>
            <option value="old-testament">Old Testament</option>
            <option value="wisdom">Wisdom</option>
            <option value="prophets">Prophets</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="no-plans">
          <p>No reading plans found matching your criteria.</p>
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan._id} className="plan-card">
              <div className="plan-card-header">
                <h3>{plan.name}</h3>
                <div className="plan-badges">
                  <span className={`badge badge-${plan.difficulty}`}>
                    {plan.difficulty}
                  </span>
                  <span className="badge badge-category">
                    {plan.category}
                  </span>
                </div>
              </div>

              <p className="plan-description">{plan.description}</p>

              <div className="plan-meta">
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span>{plan.duration} days</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">👥</span>
                  <span>{plan.enrollmentCount} enrolled</span>
                </div>
              </div>

              <div className="plan-actions">
                <Link to={`/plans/${plan._id}`} className="btn-outline">
                  View Details
                </Link>
                <button
                  onClick={() => handleEnroll(plan._id)}
                  className="btn-primary"
                >
                  Start Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlansPage;
