import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIcebreakers } from '../contexts/IcebreakerContext';
import { useAuth } from '../contexts/AuthContext';
import IcebreakerCard from '../components/icebreaker/IcebreakerCard';
import './IcebreakerAdminPage.css';

const IcebreakerAdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    icebreakers,
    loading,
    fetchIcebreakers,
    deleteIcebreaker,
    duplicateIcebreaker,
    getRandomIcebreaker,
  } = useIcebreakers();

  const [filters, setFilters] = useState({
    category: '',
    ageGroup: '',
    groupSize: '',
    energyLevel: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'popular', 'alphabetical'

  useEffect(() => {
    fetchIcebreakers(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      ageGroup: '',
      groupSize: '',
      energyLevel: '',
    });
    setSearchQuery('');
  };

  const handleCreateNew = () => {
    navigate('/admin/icebreaker/create');
  };

  const handleEdit = (id) => {
    navigate(`/admin/icebreaker/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this icebreaker?')) {
      try {
        await deleteIcebreaker(id);
      } catch (error) {
        console.error('Error deleting icebreaker:', error);
        alert('Failed to delete icebreaker');
      }
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const newId = await duplicateIcebreaker(id);
      if (newId) {
        navigate(`/admin/icebreaker/edit/${newId}`);
      }
    } catch (error) {
      console.error('Error duplicating icebreaker:', error);
      alert('Failed to duplicate icebreaker');
    }
  };

  const handleSurpriseMe = async () => {
    try {
      const random = await getRandomIcebreaker(filters);
      if (random) {
        navigate(`/icebreaker/${random.id}`);
      }
    } catch (error) {
      console.error('Error getting random icebreaker:', error);
      alert('No icebreakers found matching your filters');
    }
  };

  // Filter and search
  const filteredIcebreakers = icebreakers.filter(ice => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ice.title?.toLowerCase().includes(query) ||
        ice.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Sort
  const sortedIcebreakers = [...filteredIcebreakers].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.usageCount || 0) - (a.usageCount || 0);
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'recent':
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  if (loading) {
    return (
      <div className="icebreaker-admin-page">
        <div className="loading-state">Loading icebreakers...</div>
      </div>
    );
  }

  return (
    <div className="icebreaker-admin-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Icebreaker Library</h1>
          <p className="subtitle">
            Browse and manage icebreaker activities for your groups
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary surprise-btn" onClick={handleSurpriseMe}>
            🎲 Surprise Me!
          </button>
          <button className="btn btn-primary create-btn" onClick={handleCreateNew}>
            + Create Icebreaker
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search icebreakers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select
              id="category-filter"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="get-to-know">Get to Know</option>
              <option value="faith-based">Faith Based</option>
              <option value="energizer">Energizer</option>
              <option value="deep-discussion">Deep Discussion</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="age-group-filter">Age Group:</label>
            <select
              id="age-group-filter"
              value={filters.ageGroup}
              onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
              className="filter-select"
            >
              <option value="">All Ages</option>
              <option value="middle">Middle School</option>
              <option value="high">High School</option>
              <option value="college">College</option>
              <option value="all">All Ages</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="group-size-filter">Group Size:</label>
            <select
              id="group-size-filter"
              value={filters.groupSize}
              onChange={(e) => handleFilterChange('groupSize', e.target.value)}
              className="filter-select"
            >
              <option value="">Any Size</option>
              <option value="small">Small (2-8)</option>
              <option value="medium">Medium (9-20)</option>
              <option value="large">Large (20+)</option>
              <option value="any">Any Size</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="energy-filter">Energy Level:</label>
            <select
              id="energy-filter"
              value={filters.energyLevel}
              onChange={(e) => handleFilterChange('energyLevel', e.target.value)}
              className="filter-select"
            >
              <option value="">Any Energy</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              Clear Filters ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      <div className="toolbar">
        <div className="results-info">
          {sortedIcebreakers.length} icebreaker{sortedIcebreakers.length !== 1 ? 's' : ''}
        </div>

        <div className="toolbar-controls">
          <div className="sort-controls">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              title="Grid view"
            >
              ⊞
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
              title="List view"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {sortedIcebreakers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <h2>No icebreakers found</h2>
          <p>
            {searchQuery || activeFilterCount > 0
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first icebreaker'}
          </p>
          <button className="btn btn-primary" onClick={handleCreateNew}>
            Create Your First Icebreaker
          </button>
        </div>
      ) : (
        <div className={`icebreaker-${viewMode}`}>
          {sortedIcebreakers.map(icebreaker => (
            <IcebreakerCard
              key={icebreaker.id}
              icebreaker={icebreaker}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IcebreakerAdminPage;
