import React, { useEffect, useState } from 'react';
import { useWeeklyWord } from '../contexts/WeeklyWordContext';
import WeeklyWordCard from '../components/WeeklyWordCard';
import './WeeklyWordArchivePage.css';

const WeeklyWordArchivePage = () => {
  const { archive, loading, error, pagination, fetchArchive } = useWeeklyWord();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchArchive(currentPage, 10);
  }, [currentPage, fetchArchive]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="weekly-word-archive-page">
      <div className="archive-header">
        <h1>📚 Word of the Week Archive</h1>
        <p className="archive-subtitle">
          Explore past featured words from Greek and Hebrew scriptures
        </p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading words...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && archive.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <h3>No words yet</h3>
          <p>Check back soon for featured words!</p>
        </div>
      )}

      {!loading && !error && archive.length > 0 && (
        <>
          <div className="archive-grid">
            {archive.map((word) => (
              <div key={word.id} className="archive-card-wrapper">
                <WeeklyWordCard word={word} viewSource="archive" compact />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              <div className="pagination-info">
                <span className="page-numbers">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <span className="total-words">
                  ({pagination.total} words total)
                </span>
              </div>

              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WeeklyWordArchivePage;
