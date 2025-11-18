import React, { useState, useEffect, useCallback } from 'react';
import { miracles, miracleCategories, getMiraclesByCategory, getMiracleStats } from '../data/miracles';
import MiracleCard from '../components/MiracleCard';
import './MiraclesExplorerPage.css';

function MiraclesExplorerPage() {
  const [filteredMiracles, setFilteredMiracles] = useState(miracles);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMiracle, setExpandedMiracle] = useState(null);
  const [stats] = useState(getMiracleStats());

  const filterMiracles = useCallback(() => {
    let filtered = miracles;

    // Apply category filter
    if (selectedCategory !== 'ALL') {
      filtered = getMiraclesByCategory(selectedCategory);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(miracle =>
        miracle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miracle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miracle.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMiracles(filtered);
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    filterMiracles();
  }, [filterMiracles]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setExpandedMiracle(null); // Collapse any expanded miracle
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setExpandedMiracle(null); // Collapse any expanded miracle
  };

  const toggleMiracleExpansion = (miracleId) => {
    setExpandedMiracle(expandedMiracle === miracleId ? null : miracleId);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case miracleCategories.HEALING:
        return '🩹';
      case miracleCategories.NATURE:
        return '🌊';
      case miracleCategories.RESURRECTION:
        return '✨';
      case miracleCategories.EXORCISM:
        return '⚡';
      case miracleCategories.OTHER:
        return '✝️';
      default:
        return '📖';
    }
  };

  return (
    <div className="miracles-explorer-page">
      <div className="miracles-header">
        <h1>Miracles of Jesus Explorer</h1>
        <p className="miracles-subtitle">
          Explore the {stats.total} recorded miracles Jesus performed during his earthly ministry
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="miracles-stats">
        <div className="stat-card">
          <div className="stat-icon">🩹</div>
          <div className="stat-number">{stats.healing}</div>
          <div className="stat-label">Healing Miracles</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌊</div>
          <div className="stat-number">{stats.nature}</div>
          <div className="stat-label">Nature Miracles</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✨</div>
          <div className="stat-number">{stats.resurrection}</div>
          <div className="stat-label">Resurrections</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-number">{stats.exorcism}</div>
          <div className="stat-label">Exorcisms</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="miracles-search">
        <input
          type="text"
          placeholder="Search miracles by title, description, or location..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Category Filter */}
      <div className="miracles-filters">
        <button
          className={`filter-btn ${selectedCategory === 'ALL' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('ALL')}
        >
          📖 All Miracles
        </button>
        <button
          className={`filter-btn ${selectedCategory === miracleCategories.HEALING ? 'active' : ''}`}
          onClick={() => handleCategoryChange(miracleCategories.HEALING)}
        >
          {getCategoryIcon(miracleCategories.HEALING)} Healing
        </button>
        <button
          className={`filter-btn ${selectedCategory === miracleCategories.NATURE ? 'active' : ''}`}
          onClick={() => handleCategoryChange(miracleCategories.NATURE)}
        >
          {getCategoryIcon(miracleCategories.NATURE)} Nature
        </button>
        <button
          className={`filter-btn ${selectedCategory === miracleCategories.RESURRECTION ? 'active' : ''}`}
          onClick={() => handleCategoryChange(miracleCategories.RESURRECTION)}
        >
          {getCategoryIcon(miracleCategories.RESURRECTION)} Resurrection
        </button>
        <button
          className={`filter-btn ${selectedCategory === miracleCategories.EXORCISM ? 'active' : ''}`}
          onClick={() => handleCategoryChange(miracleCategories.EXORCISM)}
        >
          {getCategoryIcon(miracleCategories.EXORCISM)} Exorcism
        </button>
      </div>

      {/* Results Count */}
      <div className="miracles-count">
        {filteredMiracles.length === miracles.length
          ? `Showing all ${filteredMiracles.length} miracles`
          : `Found ${filteredMiracles.length} miracle${filteredMiracles.length !== 1 ? 's' : ''}`}
      </div>

      {/* Miracles List */}
      <div className="miracles-list">
        {filteredMiracles.length > 0 ? (
          filteredMiracles.map((miracle) => (
            <MiracleCard
              key={miracle.id}
              miracle={miracle}
              isExpanded={expandedMiracle === miracle.id}
              onToggleExpand={toggleMiracleExpansion}
              categoryIcon={getCategoryIcon(miracle.category)}
            />
          ))
        ) : (
          <div className="no-results">
            <p>No miracles found matching your search.</p>
            <button onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="miracles-footer">
        <div className="footer-content">
          <h3>Why Study Jesus's Miracles?</h3>
          <p>
            Jesus's miracles reveal his divine nature, his compassion for people, and his power over all creation.
            Each miracle teaches us something important about who Jesus is and how he wants to work in our lives today.
          </p>
          <div className="key-lessons">
            <div className="lesson-item">
              <strong>Faith Matters:</strong> Many miracles happened in response to faith.
            </div>
            <div className="lesson-item">
              <strong>Jesus Cares:</strong> Miracles show Jesus's deep compassion for human suffering.
            </div>
            <div className="lesson-item">
              <strong>Divine Authority:</strong> Jesus has power over nature, disease, demons, and even death.
            </div>
            <div className="lesson-item">
              <strong>The Kingdom is Here:</strong> Miracles demonstrated that God's kingdom had come to earth.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MiraclesExplorerPage;
