import React, { useState } from 'react';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useStreak, ACTIVITY_TYPES } from '../contexts/StreakContext';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';
import './BookmarksPage.css';

function BookmarksPage() {
  const {
    loading,
    notificationPermission,
    deleteBookmark,
    sortBookmarks,
    getStats,
    requestNotificationPermission
  } = useBookmarks();

  const { logActivity } = useStreak();

  const [sortBy, setSortBy] = useState('createdAt');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const stats = getStats();
  const sortedBookmarks = sortBookmarks(sortBy);

  // Filter bookmarks
  const filteredBookmarks = sortedBookmarks.filter(bookmark => {
    switch (filterBy) {
      case 'with-reminders':
        return bookmark.reminderAt && !bookmark.reminderSent;
      case 'no-reminders':
        return !bookmark.reminderAt;
      case 'overdue':
        return bookmark.reminderAt && !bookmark.reminderSent && isPast(new Date(bookmark.reminderAt));
      case 'upcoming':
        return bookmark.reminderAt && !bookmark.reminderSent && isFuture(new Date(bookmark.reminderAt));
      default:
        return true;
    }
  });

  const handleDelete = (bookmarkId) => {
    deleteBookmark(bookmarkId);
    setShowDeleteConfirm(null);
    setSelectedBookmark(null);
  };

  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
  };

  const handleMarkAsReviewed = (bookmark) => {
    // Log activity for reviewing a bookmarked verse
    logActivity(ACTIVITY_TYPES.VERSE_MEMORIZED);

    // Could also mark the reminder as sent
    if (bookmark.reminderAt && !bookmark.reminderSent) {
      // This would be handled by updateBookmark if we wanted to mark it as reviewed
    }
  };

  const formatReminderDate = (reminderAt) => {
    const reminderDate = new Date(reminderAt);

    if (isPast(reminderDate)) {
      return {
        text: `Overdue (${formatDistanceToNow(reminderDate, { addSuffix: true })})`,
        className: 'overdue'
      };
    }

    return {
      text: formatDistanceToNow(reminderDate, { addSuffix: true }),
      className: 'upcoming'
    };
  };

  if (loading) {
    return (
      <div className="bookmarks-page">
        <div className="loading">Loading bookmarks...</div>
      </div>
    );
  }

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-container">
        <header className="bookmarks-header">
          <h1>My Bookmarks</h1>
          <p className="bookmarks-subtitle">Your saved verses and reminders</p>
        </header>

        {/* Notification Permission Banner */}
        {notificationPermission !== 'granted' && stats.withReminders > 0 && (
          <div className="notification-banner">
            <div className="notification-banner-content">
              <span className="notification-icon">🔔</span>
              <div className="notification-text">
                <strong>Enable notifications</strong>
                <p>Get reminded when it's time to review your bookmarked verses</p>
              </div>
              <button
                className="enable-notifications-btn"
                onClick={handleEnableNotifications}
              >
                Enable
              </button>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="bookmarks-stats">
          <div className="stat-item">
            <div className="stat-icon">📑</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalBookmarks}</div>
              <div className="stat-label">Total Bookmarks</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-value">{stats.upcomingReminders}</div>
              <div className="stat-label">Upcoming</div>
            </div>
          </div>
          {stats.overdueReminders > 0 && (
            <div className="stat-item warning">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <div className="stat-value">{stats.overdueReminders}</div>
                <div className="stat-label">Overdue</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bookmarks-controls">
          <div className="filter-controls">
            <label>Filter:</label>
            <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
              <option value="all">All Bookmarks</option>
              <option value="with-reminders">With Reminders</option>
              <option value="no-reminders">No Reminders</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="sort-controls">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="reminderAt">Reminder Date</option>
              <option value="verseRef">Verse Reference</option>
            </select>
          </div>
        </div>

        {/* Bookmarks List */}
        {filteredBookmarks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <h2>No bookmarks yet</h2>
            <p>
              {filterBy !== 'all'
                ? 'No bookmarks match your current filter.'
                : 'Start bookmarking verses from the Bible Tool to build your collection!'}
            </p>
          </div>
        ) : (
          <div className="bookmarks-list">
            {filteredBookmarks.map(bookmark => {
              const reminderInfo = bookmark.reminderAt ? formatReminderDate(bookmark.reminderAt) : null;

              return (
                <div key={bookmark.id} className="bookmark-card">
                  <div className="bookmark-header">
                    <h3 className="verse-reference">{bookmark.verseRef}</h3>
                    <div className="bookmark-actions">
                      <button
                        className="icon-btn"
                        onClick={() => setSelectedBookmark(
                          selectedBookmark?.id === bookmark.id ? null : bookmark
                        )}
                        title="View details"
                      >
                        {selectedBookmark?.id === bookmark.id ? '▲' : '▼'}
                      </button>
                      <button
                        className="icon-btn delete-btn"
                        onClick={() => setShowDeleteConfirm(bookmark.id)}
                        title="Delete bookmark"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <p className="verse-text">{bookmark.verseText}</p>

                  {bookmark.reminderAt && !bookmark.reminderSent && (
                    <div className={`reminder-info ${reminderInfo.className}`}>
                      <span className="reminder-icon">⏰</span>
                      <span className="reminder-text">{reminderInfo.text}</span>
                    </div>
                  )}

                  <div className="bookmark-meta">
                    <span className="created-date">
                      Added {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Expanded Details */}
                  {selectedBookmark?.id === bookmark.id && (
                    <div className="bookmark-details">
                      <div className="detail-section">
                        <strong>Created:</strong> {format(new Date(bookmark.createdAt), 'PPpp')}
                      </div>

                      {bookmark.reminderAt && (
                        <div className="detail-section">
                          <strong>Reminder:</strong> {format(new Date(bookmark.reminderAt), 'PPpp')}
                          {bookmark.reminderSent && <span className="sent-badge">✓ Sent</span>}
                        </div>
                      )}

                      <div className="detail-actions">
                        <button
                          className="action-btn primary"
                          onClick={() => handleMarkAsReviewed(bookmark)}
                        >
                          Mark as Reviewed
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(`${bookmark.verseRef}\n\n${bookmark.verseText}`);
                          }}
                        >
                          Copy Verse
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delete Confirmation */}
                  {showDeleteConfirm === bookmark.id && (
                    <div className="delete-confirm">
                      <p>Delete this bookmark?</p>
                      <div className="delete-confirm-actions">
                        <button
                          className="confirm-btn delete"
                          onClick={() => handleDelete(bookmark.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="confirm-btn cancel"
                          onClick={() => setShowDeleteConfirm(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookmarksPage;
