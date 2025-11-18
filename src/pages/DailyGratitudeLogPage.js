import React, { useState, useEffect } from 'react';
import * as gratitudeService from '../services/gratitudeService';
import './DailyGratitudeLogPage.css';

function DailyGratitudeLogPage() {
  const [todayEntry, setTodayEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Form state
  const [gratitudeText, setGratitudeText] = useState('');
  const [mood, setMood] = useState('');
  const [category, setCategory] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [todayData, statsData, entriesData] = await Promise.all([
        gratitudeService.getTodayEntry().catch(() => null),
        gratitudeService.getStats(),
        gratitudeService.listEntries({ limit: 10 })
      ]);

      setTodayEntry(todayData);
      setStats(statsData);
      setEntries(entriesData.entries || []);

      if (todayData) {
        setGratitudeText(todayData.gratitudeText);
        setMood(todayData.mood || '');
        setCategory(todayData.category || '');
      }
    } catch (err) {
      console.error('Error loading gratitude data:', err);
      setError('Failed to load gratitude data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!gratitudeText.trim()) {
      setError('Please write what you\'re grateful for.');
      return;
    }

    try {
      setError(null);

      if (todayEntry && isEditing) {
        // Update existing entry
        const updated = await gratitudeService.updateEntry(todayEntry.id, {
          gratitudeText: gratitudeText.trim(),
          mood: mood || null,
          category: category || null,
        });
        setTodayEntry(updated);
        setIsEditing(false);
      } else if (!todayEntry) {
        // Create new entry
        const created = await gratitudeService.createEntry({
          gratitudeText: gratitudeText.trim(),
          mood: mood || null,
          category: category || null,
        });
        setTodayEntry(created);
      }

      // Reload stats and entries
      const [statsData, entriesData] = await Promise.all([
        gratitudeService.getStats(),
        gratitudeService.listEntries({ limit: 10 })
      ]);
      setStats(statsData);
      setEntries(entriesData.entries || []);
    } catch (err) {
      console.error('Error saving gratitude entry:', err);
      setError(err.response?.data?.error || 'Failed to save entry. Please try again.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (todayEntry) {
      setGratitudeText(todayEntry.gratitudeText);
      setMood(todayEntry.mood || '');
      setCategory(todayEntry.category || '');
    }
    setIsEditing(false);
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await gratitudeService.deleteEntry(entryId);

      if (todayEntry && todayEntry.id === entryId) {
        setTodayEntry(null);
        setGratitudeText('');
        setMood('');
        setCategory('');
        setIsEditing(false);
      }

      // Reload data
      loadData();
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Failed to delete entry. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="gratitude-page">
        <div className="gratitude-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gratitude-page">
      <div className="gratitude-container">
        <header className="gratitude-header">
          <h1>Daily Gratitude Log</h1>
          <p className="gratitude-subtitle">
            Count your blessings and give thanks
          </p>
        </header>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <div className="stat-value">{stats.currentStreak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalEntries}</div>
                <div className="stat-label">Total Entries</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-value">{stats.longestStreak}</div>
                <div className="stat-label">Longest Streak</div>
              </div>
            </div>
          </div>
        )}

        {/* Today's Entry Form */}
        <div className="today-entry-card">
          <h2>{formatDate(new Date())}</h2>

          {todayEntry && !isEditing ? (
            <div className="entry-display">
              <p className="entry-text">{todayEntry.gratitudeText}</p>
              {todayEntry.mood && (
                <div className="entry-meta">
                  <span className="entry-mood">Mood: {todayEntry.mood}</span>
                </div>
              )}
              {todayEntry.category && (
                <div className="entry-meta">
                  <span className="entry-category">Category: {todayEntry.category}</span>
                </div>
              )}
              <div className="entry-actions">
                <button className="btn-edit" onClick={handleEdit}>
                  Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(todayEntry.id)}>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="entry-form">
              <div className="form-group">
                <label htmlFor="gratitudeText">
                  What are you grateful for today?
                </label>
                <textarea
                  id="gratitudeText"
                  value={gratitudeText}
                  onChange={(e) => setGratitudeText(e.target.value)}
                  placeholder="I'm grateful for..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="mood">Mood (optional)</label>
                  <select
                    id="mood"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                  >
                    <option value="">Select mood...</option>
                    {gratitudeService.MOOD_OPTIONS.map(m => (
                      <option key={m} value={m}>
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category (optional)</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select category...</option>
                    {gratitudeService.CATEGORY_OPTIONS.map(c => (
                      <option key={c} value={c}>
                        {c.split('-').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {todayEntry && isEditing ? 'Update Entry' : 'Save Entry'}
                </button>
                {isEditing && (
                  <button type="button" className="btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* History Toggle */}
        <div className="history-section">
          <button
            className="btn-toggle-history"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide' : 'View'} Past Entries
          </button>

          {showHistory && (
            <div className="history-list">
              <h3>Recent Entries</h3>
              {entries.length === 0 ? (
                <p className="no-entries">No entries yet. Start writing!</p>
              ) : (
                <div className="entries-grid">
                  {entries.map(entry => {
                    const isToday = todayEntry && entry.id === todayEntry.id;
                    if (isToday) return null; // Skip today's entry in history

                    return (
                      <div key={entry.id} className="entry-card">
                        <div className="entry-date">
                          {formatDate(entry.entryDate)}
                        </div>
                        <p className="entry-text">{entry.gratitudeText}</p>
                        {entry.mood && (
                          <span className="entry-badge">{entry.mood}</span>
                        )}
                        {entry.category && (
                          <span className="entry-badge">{entry.category}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DailyGratitudeLogPage;
