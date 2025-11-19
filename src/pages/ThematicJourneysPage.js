import React, { useState } from 'react';
import { useThematicJourneys } from '../contexts/ThematicJourneyContext';
import JourneyCard from '../components/JourneyCard';
import './ThematicJourneysPage.css';

const ThematicJourneysPage = () => {
  const { getJourneysWithProgress, getStats, loading } = useThematicJourneys();
  const [filter, setFilter] = useState('all'); // all, in-progress, not-started, completed

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading journeys...</div>
      </div>
    );
  }

  const journeysWithProgress = getJourneysWithProgress();
  const stats = getStats();

  // Filter journeys based on selected filter
  const filteredJourneys = journeysWithProgress.filter(journey => {
    if (filter === 'all') return true;
    if (filter === 'in-progress') return journey.isStarted && !journey.isCompleted;
    if (filter === 'not-started') return !journey.isStarted;
    if (filter === 'completed') return journey.isCompleted;
    return true;
  });

  return (
    <div className="thematic-journeys-page">
      <div className="container">
        {/* Header Section */}
        <div className="page-header">
          <h1>Thematic Bible Journeys</h1>
          <p className="page-subtitle">
            Explore themes across the entire Bible through curated study journeys
          </p>
        </div>

        {/* Stats Section */}
        <div className="journey-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.completedSteps}</div>
            <div className="stat-label">Steps Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.startedJourneys}</div>
            <div className="stat-label">Journeys Started</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completedJourneys}</div>
            <div className="stat-label">Journeys Completed</div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="journey-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({journeysWithProgress.length})
          </button>
          <button
            className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            In Progress ({journeysWithProgress.filter(j => j.isStarted && !j.isCompleted).length})
          </button>
          <button
            className={`filter-btn ${filter === 'not-started' ? 'active' : ''}`}
            onClick={() => setFilter('not-started')}
          >
            Not Started ({journeysWithProgress.filter(j => !j.isStarted).length})
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({journeysWithProgress.filter(j => j.isCompleted).length})
          </button>
        </div>

        {/* Journey Cards Grid */}
        <div className="journeys-grid">
          {filteredJourneys.length > 0 ? (
            filteredJourneys.map(journey => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                progressPercentage={journey.progressPercentage}
                isStarted={journey.isStarted}
                isCompleted={journey.isCompleted}
              />
            ))
          ) : (
            <div className="empty-state">
              <p>No journeys found for this filter.</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="journey-info">
          <h3>How Thematic Journeys Work</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-icon">1️⃣</span>
              <h4>Choose a Theme</h4>
              <p>Select a journey that interests you or addresses a topic you want to explore</p>
            </div>
            <div className="info-item">
              <span className="info-icon">2️⃣</span>
              <h4>Follow the Steps</h4>
              <p>Each journey has multiple steps with Bible passages and reflection questions</p>
            </div>
            <div className="info-item">
              <span className="info-icon">3️⃣</span>
              <h4>Reflect and Grow</h4>
              <p>Take your time to read, think, and answer the questions at your own pace</p>
            </div>
            <div className="info-item">
              <span className="info-icon">4️⃣</span>
              <span className="info-icon">✅</span>
              <h4>Track Progress</h4>
              <p>Mark steps complete as you go and see your journey progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThematicJourneysPage;
