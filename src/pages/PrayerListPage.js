import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrayer } from '../contexts/PrayerContext';
import { formatDistanceToNow } from 'date-fns';
import './PrayerListPage.css';

const PrayerListPage = () => {
  const navigate = useNavigate();
  const { getPrayersByStatus, getStats } = usePrayer();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const stats = getStats();

  const categories = ['all', 'personal', 'family', 'church', 'friends', 'world'];

  // Filter prayers by status and category
  const getFilteredPrayers = () => {
    let filtered = getPrayersByStatus(activeTab);
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    return filtered;
  };

  const filteredPrayers = getFilteredPrayers();

  const getCategoryColor = (category) => {
    const colors = {
      personal: '#3b82f6',
      family: '#10b981',
      church: '#8b5cf6',
      friends: '#f59e0b',
      world: '#ef4444'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="prayer-list-page">
      <div className="prayer-header">
        <div className="prayer-header-content">
          <h1>Prayer Journal</h1>
          <p className="prayer-subtitle">Keep track of your prayers and see God's faithfulness</p>
        </div>
        <button
          className="btn-primary btn-add-prayer"
          onClick={() => navigate('/prayers/new')}
        >
          + Add Prayer Request
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="prayer-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active Prayers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.answered}</div>
          <div className="stat-label">Answered Prayers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.recentAnswered}</div>
          <div className="stat-label">Answered (Last 30 Days)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Prayers</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="prayer-tabs">
        <button
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active ({stats.active})
        </button>
        <button
          className={`tab ${activeTab === 'answered' ? 'active' : ''}`}
          onClick={() => setActiveTab('answered')}
        >
          Answered ({stats.answered})
        </button>
        <button
          className={`tab ${activeTab === 'archived' ? 'active' : ''}`}
          onClick={() => setActiveTab('archived')}
        >
          Archived ({stats.archived})
        </button>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <label>Filter by category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Prayer List */}
      <div className="prayers-container">
        {filteredPrayers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🙏</div>
            <h3>No prayers found</h3>
            <p>
              {activeTab === 'active'
                ? 'Add your first prayer request to begin your prayer journey'
                : activeTab === 'answered'
                ? 'Answered prayers will appear here'
                : 'Archived prayers will appear here'}
            </p>
            {activeTab === 'active' && (
              <button
                className="btn-primary"
                onClick={() => navigate('/prayers/new')}
              >
                Add Prayer Request
              </button>
            )}
          </div>
        ) : (
          <div className="prayers-grid">
            {filteredPrayers.map(prayer => (
              <div
                key={prayer.id}
                className="prayer-card"
                onClick={() => navigate(`/prayers/${prayer.id}`)}
              >
                <div className="prayer-card-header">
                  <span
                    className="prayer-category-badge"
                    style={{ backgroundColor: getCategoryColor(prayer.category) }}
                  >
                    {prayer.category}
                  </span>
                  {prayer.status === 'answered' && (
                    <span className="prayer-answered-badge">✓ Answered</span>
                  )}
                </div>
                <h3 className="prayer-title">{prayer.title}</h3>
                {prayer.description && (
                  <p className="prayer-description">
                    {prayer.description.length > 120
                      ? `${prayer.description.substring(0, 120)}...`
                      : prayer.description}
                  </p>
                )}
                <div className="prayer-footer">
                  <div className="prayer-meta">
                    {prayer.status === 'answered' && prayer.answeredAt ? (
                      <span className="prayer-date">
                        Answered {formatDistanceToNow(new Date(prayer.answeredAt), { addSuffix: true })}
                      </span>
                    ) : (
                      <span className="prayer-date">
                        Created {formatDistanceToNow(new Date(prayer.createdAt), { addSuffix: true })}
                      </span>
                    )}
                    {prayer.logEntries && prayer.logEntries.length > 0 && (
                      <span className="prayer-entries">
                        {prayer.logEntries.length} {prayer.logEntries.length === 1 ? 'entry' : 'entries'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerListPage;
