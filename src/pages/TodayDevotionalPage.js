import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDevotionals } from '../contexts/DevotionalContext';
import { formatDate, calculateReadingTime } from '../services/devotionalService';
import './TodayDevotionalPage.css';

function TodayDevotionalPage() {
  const { id } = useParams();
  const {
    getTodayDevotional,
    getDevotionalById,
    getUpcomingDevotionals,
    getPastDevotionals,
    incrementReadCount
  } = useDevotionals();

  // Get the devotional to display
  const devotional = id ? getDevotionalById(id) : getTodayDevotional();
  const upcomingDevotionals = getUpcomingDevotionals(3);
  const pastDevotionals = getPastDevotionals(5);

  useEffect(() => {
    if (devotional?.id) {
      incrementReadCount(devotional.id);
    }
  }, [devotional?.id, incrementReadCount]);

  if (!devotional) {
    return (
      <div className="today-devotional-page">
        <div className="container">
          <div className="no-devotional">
            <h1>📖 Daily Devotional</h1>
            <div className="empty-state">
              <p>No devotional available {id ? 'with this ID' : 'for today'}.</p>
              {pastDevotionals.length > 0 && (
                <>
                  <p>Check out our recent devotionals below:</p>
                  <div className="devotional-list">
                    {pastDevotionals.map(d => (
                      <Link
                        key={d.id}
                        to={`/devotional/${d.id}`}
                        className="devotional-card-link"
                      >
                        <div className="devotional-card-small">
                          <div className="card-date">{formatDate(d.publishAt, 'short')}</div>
                          <h3>{d.title}</h3>
                          {d.subtitle && <p className="card-subtitle">{d.subtitle}</p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const readingTime = calculateReadingTime(devotional.body);

  return (
    <div className="today-devotional-page">
      <div className="container">
        {/* Main Devotional Content */}
        <article className="devotional-content">
          <header className="devotional-header">
            {!id && (
              <div className="today-badge">
                📖 Today's Devotional
              </div>
            )}
            <div className="devotional-meta">
              <span className="meta-date">{formatDate(devotional.publishAt, 'long')}</span>
              <span className="meta-separator">•</span>
              <span className="meta-reading-time">{readingTime} min read</span>
            </div>
            <h1 className="devotional-title">{devotional.title}</h1>
            {devotional.subtitle && (
              <p className="devotional-subtitle">{devotional.subtitle}</p>
            )}
            {devotional.author && (
              <p className="devotional-author">by {devotional.author}</p>
            )}
          </header>

          {/* Passage References */}
          {devotional.passageRefs && devotional.passageRefs.length > 0 && (
            <div className="devotional-passages">
              <h3>📜 Scripture Reading</h3>
              <div className="passage-list">
                {devotional.passageRefs.map((passage) => (
                  <div key={passage.ref} className="passage-ref">
                    <span className="passage-icon">📖</span>
                    <span className="passage-text">{passage.ref}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Devotional Body */}
          <div
            className="devotional-body"
            dangerouslySetInnerHTML={{ __html: devotional.body }}
          />

          {/* Tags */}
          {devotional.tags && devotional.tags.length > 0 && (
            <div className="devotional-tags">
              {devotional.tags.map(tag => (
                <span key={tag} className="devotional-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <footer className="devotional-footer">
            <div className="share-section">
              <p>Share this devotional with others!</p>
            </div>
          </footer>
        </article>

        {/* Sidebar */}
        <aside className="devotional-sidebar">
          {/* Upcoming Devotionals */}
          {upcomingDevotionals.length > 0 && (
            <div className="sidebar-section">
              <h3>🔜 Upcoming</h3>
              <div className="sidebar-list">
                {upcomingDevotionals.map(d => (
                  <Link
                    key={d.id}
                    to={`/devotional/${d.id}`}
                    className="sidebar-item"
                  >
                    <div className="sidebar-date">{formatDate(d.publishAt, 'relative')}</div>
                    <div className="sidebar-title">{d.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Devotionals */}
          {pastDevotionals.length > 0 && (
            <div className="sidebar-section">
              <h3>📚 Recent Devotionals</h3>
              <div className="sidebar-list">
                {pastDevotionals.map(d => (
                  <Link
                    key={d.id}
                    to={`/devotional/${d.id}`}
                    className="sidebar-item"
                  >
                    <div className="sidebar-date">{formatDate(d.publishAt, 'short')}</div>
                    <div className="sidebar-title">{d.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to Today */}
          {id && (
            <div className="sidebar-section">
              <Link to="/devotionals" className="btn btn-primary btn-block">
                📖 Today's Devotional
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default TodayDevotionalPage;
