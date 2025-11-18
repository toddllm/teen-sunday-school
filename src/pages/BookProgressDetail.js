import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBibleProgress } from '../contexts/BibleProgressContext';
import { getBookByName } from '../data/bibleBooks';
import './BookProgressDetail.css';

const BookProgressDetail = () => {
  const { bookName } = useParams();
  const navigate = useNavigate();
  const {
    getBookProgress,
    markChapterRead,
    markChapterUnread,
    getNextUnreadChapter
  } = useBibleProgress();

  const decodedBookName = decodeURIComponent(bookName);
  const book = getBookByName(decodedBookName);

  if (!book) {
    return (
      <div className="book-detail-page">
        <div className="error-message">
          <h2>Book not found</h2>
          <p>The book "{decodedBookName}" could not be found.</p>
          <button className="btn btn-primary" onClick={() => navigate('/progress')}>
            Back to Progress
          </button>
        </div>
      </div>
    );
  }

  const progress = getBookProgress(book.name);
  const nextUnread = getNextUnreadChapter(book.name);

  const handleChapterClick = (chapterNumber, isRead) => {
    if (isRead) {
      if (window.confirm(`Mark ${book.name} ${chapterNumber} as unread?`)) {
        markChapterUnread(book.name, chapterNumber);
      }
    } else {
      markChapterRead(book.name, chapterNumber);
    }
  };

  const handleReadChapter = (chapterNumber) => {
    navigate(`/bible?ref=${encodeURIComponent(`${book.name} ${chapterNumber}`)}`);
  };

  const handleContinueReading = () => {
    if (nextUnread) {
      navigate(`/bible?ref=${encodeURIComponent(`${book.name} ${nextUnread}`)}`);
    }
  };

  return (
    <div className="book-detail-page">
      {/* Header */}
      <div className="book-detail-header">
        <button className="back-button" onClick={() => navigate('/progress')}>
          ← Back to Progress
        </button>

        <div className="book-title-section">
          <h1>{book.name}</h1>
          <div className="book-meta">
            <span className="book-testament">
              {book.testament === 'old' ? 'Old Testament' : 'New Testament'}
            </span>
            <span className="book-category">{book.category}</span>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="book-progress-stats">
          <div className="progress-circle">
            <svg viewBox="0 0 100 100">
              <circle
                className="progress-circle-bg"
                cx="50"
                cy="50"
                r="45"
              />
              <circle
                className="progress-circle-fill"
                cx="50"
                cy="50"
                r="45"
                style={{
                  strokeDasharray: `${progress.percentage * 2.827} 283`,
                }}
              />
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dy="0.3em"
                className="progress-circle-text"
              >
                {progress.percentage}%
              </text>
            </svg>
          </div>

          <div className="progress-details">
            <div className="progress-stat">
              <span className="stat-label">Chapters Read:</span>
              <span className="stat-value">
                {progress.chaptersRead} / {progress.totalChapters}
              </span>
            </div>
            {progress.lastReadDate && (
              <div className="progress-stat">
                <span className="stat-label">Last Read:</span>
                <span className="stat-value">
                  {new Date(progress.lastReadDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Continue Reading CTA */}
      {nextUnread && (
        <div className="continue-reading-section">
          <div className="continue-reading-info">
            <h3>Continue Reading</h3>
            <p className="next-chapter-ref">{book.name} {nextUnread}</p>
          </div>
          <button className="btn btn-primary btn-large" onClick={handleContinueReading}>
            Start Reading
          </button>
        </div>
      )}

      {progress.percentage === 100 && (
        <div className="completion-message">
          <h2>Book Completed!</h2>
          <p>You've read all {progress.totalChapters} chapters of {book.name}. Great job!</p>
        </div>
      )}

      {/* Chapter Grid */}
      <div className="chapters-section">
        <h2>Chapters</h2>
        <div className="chapter-controls">
          <button
            className="btn btn-sm"
            onClick={() => {
              for (let i = 1; i <= book.chapters; i++) {
                markChapterRead(book.name, i);
              }
            }}
          >
            Mark All Read
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => {
              if (window.confirm(`Mark all chapters in ${book.name} as unread?`)) {
                for (let i = 1; i <= book.chapters; i++) {
                  markChapterUnread(book.name, i);
                }
              }
            }}
          >
            Reset All
          </button>
        </div>

        <div className="chapters-grid">
          {progress.chapters.map((isRead, index) => {
            const chapterNumber = index + 1;

            return (
              <div
                key={chapterNumber}
                className={`chapter-card ${isRead ? 'read' : 'unread'}`}
              >
                <div className="chapter-number">{chapterNumber}</div>
                <div className="chapter-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleReadChapter(chapterNumber)}
                    title="Read this chapter"
                  >
                    📖
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleChapterClick(chapterNumber, isRead)}
                    title={isRead ? 'Mark as unread' : 'Mark as read'}
                  >
                    {isRead ? '✓' : '○'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="quick-navigation">
        <h3>Quick Navigation</h3>
        <div className="nav-buttons">
          {progress.chapters.map((isRead, index) => {
            const chapterNumber = index + 1;
            if (!isRead) {
              return (
                <button
                  key={chapterNumber}
                  className="nav-chapter-btn"
                  onClick={() => handleReadChapter(chapterNumber)}
                >
                  Chapter {chapterNumber}
                </button>
              );
            }
            return null;
          }).filter(Boolean).slice(0, 5)}
        </div>
      </div>
    </div>
  );
};

export default BookProgressDetail;
