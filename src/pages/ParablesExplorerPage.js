import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ParableViewer from '../components/ParableViewer';
import {
  listParables,
  getParable,
  recordParableView,
  PARABLE_CATEGORIES,
} from '../services/parableService';
import './ParablesExplorerPage.css';

const ParablesExplorerPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [parables, setParables] = useState([]);
  const [selectedParable, setSelectedParable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStartTime, setViewStartTime] = useState(null);

  // Load parables on mount
  useEffect(() => {
    loadParables();
  }, [selectedCategory, searchQuery]);

  // Load specific parable from URL parameter
  useEffect(() => {
    const parableId = searchParams.get('parableId');
    if (parableId && parables.length > 0) {
      loadParable(parableId);
    }
  }, [searchParams, parables]);

  const loadParables = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }

      const parablesData = await listParables(filters);
      setParables(parablesData);
    } catch (err) {
      console.error('Error loading parables:', err);
      setError('Failed to load parables. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadParable = async (parableId) => {
    try {
      setLoading(true);
      setError(null);

      const parableData = await getParable(parableId);
      setSelectedParable(parableData);

      // Record view start time for metrics
      setViewStartTime(Date.now());

      // Update URL
      setSearchParams({ parableId });
    } catch (err) {
      console.error('Error loading parable:', err);
      setError('Failed to load parable details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleParableSelect = (parableId) => {
    loadParable(parableId);
  };

  const handleReferenceClick = (reference) => {
    // Navigate to Bible tool with the passage reference
    navigate(`/bible?ref=${encodeURIComponent(reference)}`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Record metrics when component unmounts or parable changes
  useEffect(() => {
    return () => {
      if (selectedParable && viewStartTime) {
        const timeSpentMs = Date.now() - viewStartTime;
        recordParableView(selectedParable.id, {
          featureContext: searchParams.get('source') || 'explorer',
          timeSpentMs,
        }).catch((err) => console.error('Error recording view:', err));
      }
    };
  }, [selectedParable, viewStartTime, searchParams]);

  // Group parables by category
  const groupedParables = parables.reduce((acc, parable) => {
    const category = parable.category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(parable);
    return acc;
  }, {});

  return (
    <div className="parables-explorer-page">
      <div className="page-header">
        <h1>Parables Explorer</h1>
        <p className="page-subtitle">
          Explore the parables of Jesus with their interpretation, historical context, and practical application
        </p>
      </div>

      <div className="page-content">
        <aside className="parables-sidebar">
          <div className="sidebar-header">
            <h2>Parables</h2>
          </div>

          {/* Search */}
          <div className="parable-search">
            <input
              type="text"
              placeholder="Search parables..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          {/* Category filter */}
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="category-select"
            >
              <option value="all">All Categories</option>
              {PARABLE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Parable list */}
          <div className="parable-list">
            {loading && <div className="loading">Loading parables...</div>}
            {error && <div className="error-message">{error}</div>}

            {!loading && parables.length === 0 && (
              <div className="no-parables">
                <p>No parables found.</p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="clear-filters-btn"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {!loading &&
              selectedCategory === 'all' &&
              !searchQuery &&
              Object.entries(groupedParables).map(([category, categoryParables]) => (
                <div key={category} className="parable-category-group">
                  <h3 className="category-heading">
                    {category}
                  </h3>
                  {categoryParables.map((parable) => (
                    <div
                      key={parable.id}
                      className={`parable-item ${
                        selectedParable?.id === parable.id ? 'active' : ''
                      }`}
                      onClick={() => handleParableSelect(parable.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="parable-item-name">{parable.title}</div>
                      <div className="parable-item-ref">{parable.reference}</div>
                      {parable.keyTheme && (
                        <div className="parable-item-theme">{parable.keyTheme}</div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

            {!loading &&
              (selectedCategory !== 'all' || searchQuery) &&
              parables.map((parable) => (
                <div
                  key={parable.id}
                  className={`parable-item ${
                    selectedParable?.id === parable.id ? 'active' : ''
                  }`}
                  onClick={() => handleParableSelect(parable.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="parable-item-name">{parable.title}</div>
                  <div className="parable-item-ref">{parable.reference}</div>
                  <div className="parable-item-category">
                    {parable.category || 'uncategorized'}
                  </div>
                  {parable.keyTheme && (
                    <div className="parable-item-theme">{parable.keyTheme}</div>
                  )}
                </div>
              ))}
          </div>
        </aside>

        <main className="parable-main">
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading parable...</p>
            </div>
          )}

          {!loading && !selectedParable && (
            <div className="parable-placeholder">
              <h2>Select a parable to begin</h2>
              <p>
                Choose a parable from the sidebar to explore its meaning, historical context,
                and practical applications for today.
              </p>
            </div>
          )}

          {!loading && selectedParable && (
            <ParableViewer
              parable={selectedParable}
              onReferenceClick={handleReferenceClick}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default ParablesExplorerPage;
