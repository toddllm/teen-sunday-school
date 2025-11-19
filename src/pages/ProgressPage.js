import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBibleProgress } from '../contexts/BibleProgressContext';
import { BIBLE_BOOKS, CATEGORIES } from '../data/bibleBooks';
import './ProgressPage.css';

const ProgressPage = () => {
  const navigate = useNavigate();
  const {
    progressData,
    getOverallProgress,
    getNextUnreadChapterGlobal
  } = useBibleProgress();

  const [selectedTestament, setSelectedTestament] = useState('all');
  const overallProgress = getOverallProgress();
  const nextUnread = getNextUnreadChapterGlobal();

  // Get color intensity based on percentage (0-100)
  const getColorIntensity = (percentage) => {
    if (percentage === 0) return 'var(--progress-0)';
    if (percentage < 25) return 'var(--progress-25)';
    if (percentage < 50) return 'var(--progress-50)';
    if (percentage < 75) return 'var(--progress-75)';
    if (percentage < 100) return 'var(--progress-99)';
    return 'var(--progress-100)';
  };

  // Filter books by testament
  const getFilteredBooks = () => {
    if (selectedTestament === 'all') return BIBLE_BOOKS;
    return BIBLE_BOOKS.filter(book => book.testament === selectedTestament);
  };

  // Group books by category
  const groupByCategory = (books) => {
    const grouped = {};
    books.forEach(book => {
      if (!grouped[book.category]) {
        grouped[book.category] = [];
      }
      grouped[book.category].push(book);
    });
    return grouped;
  };

  const filteredBooks = getFilteredBooks();
  const groupedBooks = groupByCategory(filteredBooks);

  // Get category order based on testament
  const getCategoryOrder = () => {
    if (selectedTestament === 'old') return CATEGORIES.old;
    if (selectedTestament === 'new') return CATEGORIES.new;
    return [...CATEGORIES.old, ...CATEGORIES.new];
  };

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1>Bible Reading Progress</h1>
        <p className="progress-subtitle">
          Track your journey through God's Word
        </p>
      </div>

      {/* Overall Stats */}
      <div className="progress-stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-value">{overallProgress.percentage}%</div>
          <div className="stat-label">Overall Progress</div>
          <div className="stat-detail">
            {overallProgress.totalRead} of {overallProgress.totalChapters} chapters
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{overallProgress.booksCompleted}</div>
          <div className="stat-label">Books Completed</div>
          <div className="stat-detail">
            {overallProgress.booksStarted} books started
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{overallProgress.oldTestament.percentage}%</div>
          <div className="stat-label">Old Testament</div>
          <div className="stat-detail">
            {overallProgress.oldTestament.read} of {overallProgress.oldTestament.total} chapters
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{overallProgress.newTestament.percentage}%</div>
          <div className="stat-label">New Testament</div>
          <div className="stat-detail">
            {overallProgress.newTestament.read} of {overallProgress.newTestament.total} chapters
          </div>
        </div>
      </div>

      {/* Continue Reading CTA */}
      {nextUnread && (
        <div className="continue-reading-card">
          <div className="continue-reading-content">
            <h3>Continue Reading</h3>
            <p className="next-chapter">{nextUnread.reference}</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/bible?ref=${encodeURIComponent(nextUnread.reference)}`)}
          >
            Start Reading
          </button>
        </div>
      )}

      {overallProgress.percentage === 100 && (
        <div className="completion-banner">
          <h2>Congratulations!</h2>
          <p>You've read the entire Bible! What an incredible journey through God's Word.</p>
        </div>
      )}

      {/* Testament Filter */}
      <div className="testament-filter">
        <button
          className={`filter-btn ${selectedTestament === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedTestament('all')}
        >
          All Books ({BIBLE_BOOKS.length})
        </button>
        <button
          className={`filter-btn ${selectedTestament === 'old' ? 'active' : ''}`}
          onClick={() => setSelectedTestament('old')}
        >
          Old Testament (39)
        </button>
        <button
          className={`filter-btn ${selectedTestament === 'new' ? 'active' : ''}`}
          onClick={() => setSelectedTestament('new')}
        >
          New Testament (27)
        </button>
      </div>

      {/* Progress Legend */}
      <div className="progress-legend">
        <span className="legend-label">Progress:</span>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'var(--progress-0)' }}></div>
            <span>Not Started</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'var(--progress-25)' }}></div>
            <span>1-24%</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'var(--progress-50)' }}></div>
            <span>25-49%</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'var(--progress-75)' }}></div>
            <span>50-74%</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'var(--progress-99)' }}></div>
            <span>75-99%</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'var(--progress-100)' }}></div>
            <span>Complete</span>
          </div>
        </div>
      </div>

      {/* Books Grid by Category */}
      <div className="books-by-category">
        {getCategoryOrder().map(category => {
          const booksInCategory = groupedBooks[category];
          if (!booksInCategory || booksInCategory.length === 0) return null;

          return (
            <div key={category} className="category-section">
              <h2 className="category-title">{category}</h2>
              <div className="books-grid">
                {booksInCategory.map(book => {
                  const progress = progressData.bookProgress[book.name];
                  const color = getColorIntensity(progress.percentage);

                  return (
                    <div
                      key={book.name}
                      className="book-card"
                      style={{ backgroundColor: color }}
                      onClick={() => navigate(`/progress/${encodeURIComponent(book.name)}`)}
                    >
                      <div className="book-name">{book.name}</div>
                      <div className="book-progress">
                        <div className="book-percentage">{progress.percentage}%</div>
                        <div className="book-chapters">
                          {progress.chaptersRead}/{progress.totalChapters} chapters
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressPage;
