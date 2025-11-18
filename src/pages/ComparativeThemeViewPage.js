import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ThemeComparisonViewer from '../components/ThemeComparisonViewer';
import {
  listThemes,
  getTheme,
  recordThemeView,
  THEME_CATEGORIES,
} from '../services/comparativeThemeService';
import './ComparativeThemeViewPage.css';

const ComparativeThemeViewPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStartTime, setViewStartTime] = useState(null);

  // Load themes on mount
  useEffect(() => {
    loadThemes();
  }, [selectedCategory, searchQuery]);

  // Load specific theme from URL parameter
  useEffect(() => {
    const themeId = searchParams.get('themeId');
    if (themeId && themes.length > 0) {
      loadTheme(themeId);
    }
  }, [searchParams, themes]);

  const loadThemes = async () => {
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

      const themesData = await listThemes(filters);
      setThemes(themesData);
    } catch (err) {
      console.error('Error loading themes:', err);
      setError('Failed to load themes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTheme = async (themeId) => {
    try {
      setLoading(true);
      setError(null);

      const themeData = await getTheme(themeId);
      setSelectedTheme(themeData);

      // Record view start time for metrics
      setViewStartTime(Date.now());

      // Update URL
      setSearchParams({ themeId });
    } catch (err) {
      console.error('Error loading theme:', err);
      setError('Failed to load theme details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = (themeId) => {
    loadTheme(themeId);
  };

  const handlePassageClick = (passageRef) => {
    // Navigate to Bible tool with the passage reference
    navigate(`/bible?ref=${encodeURIComponent(passageRef)}`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Record metrics when component unmounts or theme changes
  useEffect(() => {
    return () => {
      if (selectedTheme && viewStartTime) {
        const timeSpentMs = Date.now() - viewStartTime;
        recordThemeView(selectedTheme.id, {
          featureContext: searchParams.get('source') || 'direct',
          timeSpentMs,
        }).catch((err) => console.error('Error recording view:', err));
      }
    };
  }, [selectedTheme, viewStartTime, searchParams]);

  // Group themes by category
  const groupedThemes = themes.reduce((acc, theme) => {
    const category = theme.category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(theme);
    return acc;
  }, {});

  return (
    <div className="comparative-theme-page">
      <div className="page-header">
        <h1>OT vs NT Theme Comparison</h1>
        <p className="page-subtitle">
          Explore how key biblical themes develop from the Old Testament to the New Testament
        </p>
      </div>

      <div className="page-content">
        <aside className="theme-sidebar">
          <div className="sidebar-header">
            <h2>Themes</h2>
          </div>

          {/* Search */}
          <div className="theme-search">
            <input
              type="text"
              placeholder="Search themes..."
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
              {THEME_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Theme list */}
          <div className="theme-list">
            {loading && <div className="loading">Loading themes...</div>}
            {error && <div className="error-message">{error}</div>}

            {!loading && themes.length === 0 && (
              <div className="no-themes">
                <p>No themes found.</p>
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
              Object.entries(groupedThemes).map(([category, categoryThemes]) => (
                <div key={category} className="theme-category-group">
                  <h3 className="category-heading">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h3>
                  {categoryThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`theme-item ${
                        selectedTheme?.id === theme.id ? 'active' : ''
                      }`}
                      onClick={() => handleThemeSelect(theme.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="theme-item-name">{theme.themeName}</div>
                      {theme.description && (
                        <div className="theme-item-desc">
                          {theme.description.substring(0, 80)}
                          {theme.description.length > 80 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

            {!loading &&
              (selectedCategory !== 'all' || searchQuery) &&
              themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`theme-item ${
                    selectedTheme?.id === theme.id ? 'active' : ''
                  }`}
                  onClick={() => handleThemeSelect(theme.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="theme-item-name">{theme.themeName}</div>
                  <div className="theme-item-category">
                    {theme.category || 'uncategorized'}
                  </div>
                  {theme.description && (
                    <div className="theme-item-desc">
                      {theme.description.substring(0, 80)}
                      {theme.description.length > 80 ? '...' : ''}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </aside>

        <main className="theme-main">
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading theme...</p>
            </div>
          )}

          {!loading && !selectedTheme && (
            <div className="theme-placeholder">
              <h2>Select a theme to begin</h2>
              <p>
                Choose a theme from the sidebar to explore how it appears in both the
                Old Testament and New Testament.
              </p>
            </div>
          )}

          {!loading && selectedTheme && (
            <ThemeComparisonViewer
              theme={selectedTheme}
              onPassageClick={handlePassageClick}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default ComparativeThemeViewPage;
