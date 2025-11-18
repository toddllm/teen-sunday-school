import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReadingPlans } from '../contexts/ReadingPlansContext';
import './PlansListPage.css';

function PlansListPage() {
  const { getPlans } = useReadingPlans();
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);

  // Filter state
  const [filters, setFilters] = useState({
    duration: '',
    topic: '',
    difficulty: '',
    search: '',
    sort: 'recommended',
  });

  // Load plans on mount
  useEffect(() => {
    const loadedPlans = getPlans();
    setPlans(loadedPlans);
    setFilteredPlans(loadedPlans);
  }, [getPlans]);

  // Apply filters whenever they change
  useEffect(() => {
    const filtered = getPlans(filters);
    setFilteredPlans(filtered);
  }, [filters, getPlans]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      duration: '',
      topic: '',
      difficulty: '',
      search: '',
      sort: 'recommended',
    });
  };

  const hasActiveFilters = filters.duration || filters.topic || filters.difficulty || filters.search;

  // Get unique topics from all plans
  const allTopics = [...new Set(plans.flatMap(p => p.tags))].sort();

  const getDurationLabel = (days) => {
    if (days <= 7) return `${days} days`;
    if (days <= 30) return `${days} days`;
    if (days <= 90) return `${Math.round(days / 7)} weeks`;
    return `${Math.round(days / 30)} months`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'badge-success';
      case 'Intermediate': return 'badge-primary';
      case 'Advanced': return 'badge-accent';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="plans-list-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Reading Plans</h1>
            <p className="page-subtitle">
              Explore Bible reading plans designed for teens. Build consistency, grow your faith, and discover God's Word.
            </p>
          </div>
          <Link to="/plans/my-plans" className="btn btn-primary">
            My Plans
          </Link>
        </div>

        {/* Filters */}
        <div className="filters-section card">
          <div className="filters-grid">
            {/* Search */}
            <div className="form-group">
              <label htmlFor="search">Search</label>
              <input
                id="search"
                type="text"
                className="form-input"
                placeholder="Search plans..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Duration */}
            <div className="form-group">
              <label htmlFor="duration">Duration</label>
              <select
                id="duration"
                className="form-select"
                value={filters.duration}
                onChange={(e) => handleFilterChange('duration', e.target.value)}
              >
                <option value="">All Durations</option>
                <option value="7">7 days or less</option>
                <option value="30">30 days or less</option>
                <option value="90">90 days or less</option>
                <option value="365">1 year or less</option>
              </select>
            </div>

            {/* Topic */}
            <div className="form-group">
              <label htmlFor="topic">Topic</label>
              <select
                id="topic"
                className="form-select"
                value={filters.topic}
                onChange={(e) => handleFilterChange('topic', e.target.value)}
              >
                <option value="">All Topics</option>
                {allTopics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                className="form-select"
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Sort */}
            <div className="form-group">
              <label htmlFor="sort">Sort By</label>
              <select
                id="sort"
                className="form-select"
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="recommended">Recommended</option>
                <option value="popular">Most Popular</option>
                <option value="new">Newest</option>
              </select>
            </div>

            {/* Clear button */}
            {hasActiveFilters && (
              <div className="form-group">
                <label>&nbsp;</label>
                <button onClick={clearFilters} className="btn btn-outline btn-block">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="results-header">
          <p>
            {filteredPlans.length} {filteredPlans.length === 1 ? 'plan' : 'plans'} found
          </p>
        </div>

        {/* Plans grid */}
        {filteredPlans.length === 0 ? (
          <div className="empty-state card">
            <p>No plans match your filters. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="plans-grid">
            {filteredPlans.map(plan => (
              <Link
                key={plan.id}
                to={`/plans/${plan.id}`}
                className="plan-card card"
              >
                {plan.is_featured && (
                  <div className="featured-badge">Featured</div>
                )}

                <h3>{plan.title}</h3>
                <p className="plan-description">{plan.description}</p>

                <div className="plan-meta">
                  <div className="plan-meta-item">
                    <span className="meta-icon">📅</span>
                    <span>{getDurationLabel(plan.duration_days)}</span>
                  </div>
                  <div className="plan-meta-item">
                    <span className="meta-icon">⏱️</span>
                    <span>{plan.estimated_daily_minutes} min/day</span>
                  </div>
                </div>

                <div className="plan-tags">
                  <span className={`badge ${getDifficultyColor(plan.difficulty)}`}>
                    {plan.difficulty}
                  </span>
                  {plan.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="badge badge-secondary">
                      {tag}
                    </span>
                  ))}
                  {plan.tags.length > 3 && (
                    <span className="badge badge-secondary">
                      +{plan.tags.length - 3}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlansListPage;
