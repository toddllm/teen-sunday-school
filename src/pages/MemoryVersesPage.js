import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMemoryVerse } from '../contexts/MemoryVerseContext';
import { getVerseText } from '../services/bibleAPI';
import './MemoryVersesPage.css';

const MemoryVersesPage = () => {
  const {
    getAllVerses,
    getDueVerses,
    addMemoryVerse,
    removeMemoryVerse,
    isVerseInMemory,
    getStats,
  } = useMemoryVerse();

  const [searchReference, setSearchReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'due', 'upcoming'

  const stats = getStats();
  const allVerses = getAllVerses();
  const dueVerses = getDueVerses();

  const handleAddVerse = async (e) => {
    e.preventDefault();
    if (!searchReference.trim()) return;

    if (isVerseInMemory(searchReference)) {
      setError('This verse is already in your memory collection!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await getVerseText(searchReference);
      addMemoryVerse(result.reference, result.text);
      setSuccess(`Added "${result.reference}" to your memory collection!`);
      setSearchReference('');
    } catch (err) {
      setError('Could not find that verse. Please check the reference and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVerse = (id) => {
    if (window.confirm('Are you sure you want to remove this verse from your memory collection?')) {
      removeMemoryVerse(id);
    }
  };

  const getFilteredVerses = () => {
    if (filter === 'due') {
      return dueVerses;
    } else if (filter === 'upcoming') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      return allVerses.filter(verse => {
        const nextReview = new Date(verse.nextReviewDate);
        nextReview.setHours(0, 0, 0, 0);
        return nextReview > today && nextReview <= weekFromNow;
      });
    }
    return allVerses;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextReview = new Date(date);
    nextReview.setHours(0, 0, 0, 0);

    if (nextReview.getTime() === today.getTime()) {
      return 'Due today';
    } else if (nextReview < today) {
      return 'Overdue';
    } else if (nextReview.getTime() === tomorrow.getTime()) {
      return 'Due tomorrow';
    } else {
      return `Due ${date.toLocaleDateString()}`;
    }
  };

  const filteredVerses = getFilteredVerses();

  return (
    <div className="memory-verses-page">
      <div className="memory-header">
        <h1>Memory Verse Trainer</h1>
        <p>Build your Bible memory with spaced repetition</p>
      </div>

      <div className="memory-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.dueToday}</div>
          <div className="stat-label">Due Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Verses</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.reviewedToday}</div>
          <div className="stat-label">Reviewed Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.upcoming}</div>
          <div className="stat-label">Due This Week</div>
        </div>
      </div>

      {stats.dueToday > 0 && (
        <div className="review-prompt">
          <p>You have {stats.dueToday} verse{stats.dueToday !== 1 ? 's' : ''} ready for review!</p>
          <Link to="/memory-verses/review" className="review-btn-primary">
            Start Review Session
          </Link>
        </div>
      )}

      <div className="add-verse-section">
        <h2>Add a New Verse</h2>
        <form onSubmit={handleAddVerse} className="add-verse-form">
          <input
            type="text"
            value={searchReference}
            onChange={(e) => setSearchReference(e.target.value)}
            placeholder="Enter Bible reference (e.g., John 3:16)"
            className="verse-input"
          />
          <button type="submit" disabled={loading} className="add-btn">
            {loading ? 'Adding...' : 'Add to Memory'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>

      <div className="verses-section">
        <div className="section-header">
          <h2>Your Memory Verses</h2>
          <div className="filter-buttons">
            <button
              className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('all')}
            >
              All ({allVerses.length})
            </button>
            <button
              className={filter === 'due' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('due')}
            >
              Due ({dueVerses.length})
            </button>
            <button
              className={filter === 'upcoming' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
          </div>
        </div>

        {filteredVerses.length === 0 ? (
          <div className="empty-state">
            {filter === 'all' ? (
              <p>No verses yet. Add your first verse above to get started!</p>
            ) : filter === 'due' ? (
              <p>No verses due for review. Great job staying on track!</p>
            ) : (
              <p>No verses scheduled for this week.</p>
            )}
          </div>
        ) : (
          <div className="verses-grid">
            {filteredVerses.map((verse) => (
              <div key={verse.id} className="verse-card">
                <div className="verse-card-header">
                  <h3>{verse.reference}</h3>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveVerse(verse.id)}
                    title="Remove verse"
                  >
                    ×
                  </button>
                </div>
                <p className="verse-text">{verse.text}</p>
                <div className="verse-meta">
                  <span className="next-review">{formatDate(verse.nextReviewDate)}</span>
                  <span className="repetitions">
                    {verse.repetitions} {verse.repetitions === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryVersesPage;
