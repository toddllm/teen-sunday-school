import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSeries } from '../contexts/SeriesContext';
import './SeriesBrowsePage.css';

function SeriesBrowsePage() {
  const { series, loading, fetchSeries } = useSeries();
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    fetchSeries({ isActive: true });
  }, [fetchSeries]);

  useEffect(() => {
    // Extract all unique tags from series
    const tags = new Set();
    series.forEach((s) => {
      s.tags?.forEach((tag) => tags.add(tag));
    });
    setAllTags(Array.from(tags));
  }, [series]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredSeries = series.filter((s) => {
    if (selectedTags.length === 0) return true;
    return selectedTags.some((tag) => s.tags?.includes(tag));
  });

  return (
    <div className="series-browse-page">
      <div className="container">
        <div className="page-header">
          <h1>Lesson Series</h1>
          <p>Explore multi-week series to deepen your faith</p>
        </div>

        {allTags.length > 0 && (
          <div className="filter-section">
            <h3>Filter by Tags:</h3>
            <div className="tag-filters">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`tag-filter ${selectedTags.includes(tag) ? 'active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading series...</div>
        ) : filteredSeries.length === 0 ? (
          <div className="empty-state">
            <p>
              {selectedTags.length > 0
                ? 'No series found with the selected tags.'
                : 'No series available yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="series-grid">
            {filteredSeries.map((s) => (
              <Link to={`/series/${s.id}`} key={s.id} className="series-card">
                {s.thumbnailUrl && (
                  <div className="series-thumbnail">
                    <img src={s.thumbnailUrl} alt={s.title} />
                  </div>
                )}
                <div className="series-card-content">
                  <h2>{s.title}</h2>
                  {s.subtitle && <p className="series-subtitle">{s.subtitle}</p>}
                  {s.description && (
                    <p className="series-description">
                      {s.description.substring(0, 120)}
                      {s.description.length > 120 && '...'}
                    </p>
                  )}
                  <div className="series-meta">
                    <span className="lesson-count">
                      {s._count?.lessons || 0} {s._count?.lessons === 1 ? 'lesson' : 'lessons'}
                    </span>
                    {s.ageMin && s.ageMax && (
                      <span className="age-range">
                        Ages {s.ageMin}-{s.ageMax}
                      </span>
                    )}
                  </div>
                  {s.tags && s.tags.length > 0 && (
                    <div className="series-tags">
                      {s.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
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

export default SeriesBrowsePage;
