import React, { useState } from 'react';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useStreak, ACTIVITY_TYPES } from '../contexts/StreakContext';
import ReminderModal from './ReminderModal';
import './BookmarkButton.css';

function BookmarkButton({ verseRef, verseText }) {
  const {
    isBookmarked,
    getBookmarkByRef,
    addBookmark,
    deleteBookmark,
    updateBookmark
  } = useBookmarks();

  const { logActivity } = useStreak();

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const bookmarked = isBookmarked(verseRef);
  const existingBookmark = getBookmarkByRef(verseRef);

  const handleBookmarkToggle = () => {
    if (bookmarked) {
      // Remove bookmark
      if (existingBookmark) {
        deleteBookmark(existingBookmark.id);
      }
    } else {
      // Show options: bookmark now or with reminder
      setShowOptions(true);
    }
  };

  const handleQuickBookmark = () => {
    addBookmark(verseRef, verseText);
    setShowOptions(false);

    // Log activity for bookmarking a verse
    logActivity(ACTIVITY_TYPES.VERSE_MEMORIZED);
  };

  const handleBookmarkWithReminder = () => {
    setShowOptions(false);
    setShowReminderModal(true);
  };

  const handleSetReminder = (reminderDate) => {
    if (existingBookmark) {
      // Update existing bookmark with reminder
      updateBookmark(existingBookmark.id, { reminderAt: reminderDate });
    } else {
      // Create new bookmark with reminder
      addBookmark(verseRef, verseText, reminderDate);
      logActivity(ACTIVITY_TYPES.VERSE_MEMORIZED);
    }

    setShowReminderModal(false);
  };

  return (
    <div className="bookmark-button-container">
      <button
        className={`bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
        onClick={handleBookmarkToggle}
        title={bookmarked ? 'Remove bookmark' : 'Bookmark this verse'}
      >
        <span className="bookmark-icon">{bookmarked ? '🔖' : '📑'}</span>
        <span className="bookmark-text">
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      </button>

      {bookmarked && existingBookmark && !existingBookmark.reminderAt && (
        <button
          className="reminder-btn"
          onClick={() => setShowReminderModal(true)}
          title="Set a reminder"
        >
          <span>⏰</span>
        </button>
      )}

      {/* Options Menu */}
      {showOptions && (
        <div className="bookmark-options">
          <div className="options-overlay" onClick={() => setShowOptions(false)} />
          <div className="options-menu">
            <button
              className="option-item"
              onClick={handleQuickBookmark}
            >
              <span className="option-icon">📑</span>
              <span>Bookmark Now</span>
            </button>
            <button
              className="option-item"
              onClick={handleBookmarkWithReminder}
            >
              <span className="option-icon">⏰</span>
              <span>Bookmark with Reminder</span>
            </button>
            <button
              className="option-item cancel"
              onClick={() => setShowOptions(false)}
            >
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <ReminderModal
          verseRef={verseRef}
          existingReminder={existingBookmark?.reminderAt}
          onSetReminder={handleSetReminder}
          onClose={() => setShowReminderModal(false)}
        />
      )}
    </div>
  );
}

export default BookmarkButton;
