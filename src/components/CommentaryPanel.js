import React, { useState, useEffect } from 'react';
import { useCommentary } from '../contexts/CommentaryContext';
import { useStreak } from '../contexts/StreakContext';

const CommentaryPanel = ({ passageRef, passageDisplay }) => {
  const { fetchCommentary, commentarySources, isSourceEnabled, toggleSource, enabledSourceIds } = useCommentary();
  const { logActivity } = useStreak();
  const [commentaries, setCommentaries] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [hasLoggedActivity, setHasLoggedActivity] = useState(false);

  // Fetch commentary when passage changes
  useEffect(() => {
    if (passageRef) {
      const entries = fetchCommentary(passageRef);
      setCommentaries(entries);

      // Auto-expand first commentary if available
      if (entries.length > 0) {
        setExpandedSections({ 0: true });
      }

      // Log activity only once per panel view
      if (entries.length > 0 && !hasLoggedActivity) {
        logActivity('COMMENTARY_VIEWED');
        setHasLoggedActivity(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passageRef, enabledSourceIds]);

  // Reset activity logging when passage changes
  useEffect(() => {
    setHasLoggedActivity(false);
  }, [passageRef]);

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSourceToggle = (sourceId) => {
    toggleSource(sourceId);
  };

  if (!passageRef) {
    return (
      <div className="commentary-panel">
        <div className="commentary-empty">
          <p>Select a verse to view commentaries</p>
        </div>
      </div>
    );
  }

  return (
    <div className="commentary-panel">
      <div className="commentary-header">
        <h3>Commentary: {passageDisplay || passageRef}</h3>
        <button
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
          title="Filter commentary sources"
        >
          <span className="filter-icon">⚙️</span>
          <span className="filter-text">Sources ({enabledSourceIds.length})</span>
        </button>
      </div>

      {showFilters && (
        <div className="commentary-filters">
          <div className="filter-header">
            <h4>Select Commentary Sources</h4>
            <div className="filter-actions">
              <button
                className="filter-action-btn"
                onClick={() => commentarySources.forEach(s => {
                  if (!isSourceEnabled(s.id)) toggleSource(s.id);
                })}
              >
                All
              </button>
              <button
                className="filter-action-btn"
                onClick={() => commentarySources.forEach(s => {
                  if (isSourceEnabled(s.id)) toggleSource(s.id);
                })}
              >
                None
              </button>
            </div>
          </div>
          <div className="source-list">
            {commentarySources.map(source => (
              <label key={source.id} className="source-checkbox">
                <input
                  type="checkbox"
                  checked={isSourceEnabled(source.id)}
                  onChange={() => handleSourceToggle(source.id)}
                />
                <div className="source-info">
                  <span className="source-name">{source.name}</span>
                  <span className="source-description">{source.description}</span>
                  <span className="source-license">{source.license_info}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="commentary-content">
        {commentaries.length === 0 ? (
          <div className="commentary-empty">
            <p>No commentaries available for this passage.</p>
            <p className="commentary-help">
              Try enabling more sources in the filter settings or select a different verse.
            </p>
          </div>
        ) : (
          <div className="commentary-list">
            {commentaries.map((entry, index) => (
              <div key={entry.id} className="commentary-item">
                <button
                  className="commentary-header-btn"
                  onClick={() => toggleSection(index)}
                >
                  <span className="expand-icon">
                    {expandedSections[index] ? '▼' : '▶'}
                  </span>
                  <div className="commentary-title">
                    <span className="commentary-source">{entry.source_name}</span>
                    <span className="commentary-license">{entry.source_license}</span>
                  </div>
                </button>

                {expandedSections[index] && (
                  <div className="commentary-body">
                    <p className="commentary-excerpt">{entry.excerpt}</p>
                    {entry.full_url && (
                      <a
                        href={entry.full_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="commentary-link"
                      >
                        Read full commentary →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .commentary-panel {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .commentary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e0e0e0;
        }

        .commentary-header h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.3rem;
        }

        .filter-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f0f0f0;
          border: 1px solid #d0d0d0;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .filter-toggle-btn:hover {
          background: #e0e0e0;
        }

        .filter-icon {
          font-size: 1rem;
        }

        .commentary-filters {
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .filter-header h4 {
          margin: 0;
          color: #2c3e50;
          font-size: 1rem;
        }

        .filter-actions {
          display: flex;
          gap: 8px;
        }

        .filter-action-btn {
          background: white;
          border: 1px solid #d0d0d0;
          border-radius: 4px;
          padding: 4px 12px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .filter-action-btn:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .source-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .source-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .source-checkbox:hover {
          background: #f5f7ff;
          border-color: #667eea;
        }

        .source-checkbox input[type="checkbox"] {
          margin-top: 3px;
          cursor: pointer;
        }

        .source-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .source-name {
          font-weight: 600;
          color: #2c3e50;
          font-size: 0.95rem;
        }

        .source-description {
          color: #666;
          font-size: 0.85rem;
        }

        .source-license {
          color: #999;
          font-size: 0.75rem;
          font-style: italic;
        }

        .commentary-content {
          margin-top: 15px;
        }

        .commentary-empty {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .commentary-empty p {
          margin: 10px 0;
        }

        .commentary-help {
          font-size: 0.9rem;
          color: #999;
        }

        .commentary-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .commentary-item {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .commentary-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .commentary-header-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f5f5f5;
          border: none;
          padding: 12px 15px;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s;
        }

        .commentary-header-btn:hover {
          background: #ebebeb;
        }

        .expand-icon {
          color: #667eea;
          font-size: 0.8rem;
          min-width: 15px;
        }

        .commentary-title {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .commentary-source {
          font-weight: 600;
          color: #2c3e50;
          font-size: 1rem;
        }

        .commentary-license {
          color: #999;
          font-size: 0.75rem;
          font-style: italic;
        }

        .commentary-body {
          padding: 15px;
          background: white;
          border-top: 1px solid #e0e0e0;
        }

        .commentary-excerpt {
          color: #444;
          line-height: 1.6;
          margin: 0 0 12px 0;
          font-size: 0.95rem;
        }

        .commentary-link {
          display: inline-block;
          color: #667eea;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .commentary-link:hover {
          color: #5568d3;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .commentary-panel {
            padding: 15px;
          }

          .commentary-header h3 {
            font-size: 1.1rem;
          }

          .filter-toggle-btn {
            padding: 6px 10px;
            font-size: 0.85rem;
          }

          .commentary-source {
            font-size: 0.9rem;
          }

          .commentary-excerpt {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CommentaryPanel;
