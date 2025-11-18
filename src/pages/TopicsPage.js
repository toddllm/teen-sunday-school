import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTopics } from '../contexts/TopicContext';
import './TopicsPage.css';

function TopicsPage() {
  const { topics, categories, loading, searchTopics, filterByCategory } = useTopics();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredTopics, setFilteredTopics] = useState([]);

  useEffect(() => {
    setFilteredTopics(topics);
  }, [topics]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const results = await searchTopics(searchTerm);
      setFilteredTopics(results);
    } else {
      setFilteredTopics(topics);
    }
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredTopics(topics);
    } else {
      const results = await filterByCategory(category);
      setFilteredTopics(results);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredTopics(topics);
  };

  return (
    <div className="topics-page">
      <div className="container">
        <div className="page-header">
          <h1>Explore Topics</h1>
          <p className="page-subtitle">
            Browse Bible topics and discover relevant passages for your spiritual journey
          </p>
        </div>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topics by name or tag..."
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="btn btn-secondary"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        <div className="category-filter">
          <h3>Filter by Category</h3>
          <div className="category-buttons">
            <button
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              All Topics
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading topics...</p>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="empty-state">
            <p>No topics found matching your criteria.</p>
            {searchTerm && (
              <button onClick={handleClearSearch} className="btn btn-primary">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="topics-grid">
            {filteredTopics.map((topic) => (
              <Link
                key={topic.id}
                to={`/topics/${topic.id}`}
                className="topic-card"
              >
                <div className="topic-card-header">
                  <h3>{topic.name}</h3>
                  {topic.category && (
                    <span className="topic-category">{topic.category}</span>
                  )}
                </div>
                {topic.description && (
                  <p className="topic-description">
                    {topic.description.length > 150
                      ? `${topic.description.substring(0, 150)}...`
                      : topic.description}
                  </p>
                )}
                <div className="topic-meta">
                  <span className="verse-count">
                    {topic._count?.verses || 0} verses
                  </span>
                  <span className="view-count">
                    {topic._count?.views || 0} views
                  </span>
                </div>
                {topic.tags && topic.tags.length > 0 && (
                  <div className="topic-tags">
                    {topic.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="tag">
                        {tag}
                      </span>
                    ))}
                    {topic.tags.length > 3 && (
                      <span className="tag">+{topic.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TopicsPage;
