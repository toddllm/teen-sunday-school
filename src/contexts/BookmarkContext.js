import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BookmarkContext = createContext();

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('bookmarks');
      if (savedData) {
        const data = JSON.parse(savedData);
        setBookmarks(data || []);
      }

      // Check notification permission
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    } catch (error) {
      console.error('Error loading bookmark data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks, loading]);

  // Mark reminder as sent
  const markReminderAsSent = useCallback((bookmarkId) => {
    setBookmarks(prev =>
      prev.map(b =>
        b.id === bookmarkId
          ? { ...b, reminderSent: true }
          : b
      )
    );
  }, []);

  // Send reminder notification
  const sendReminderNotification = useCallback((bookmark) => {
    if (notificationPermission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const title = '📖 Verse Reminder';
    const body = `Time to revisit: ${bookmark.verseRef}\n${bookmark.verseText?.substring(0, 100)}${bookmark.verseText?.length > 100 ? '...' : ''}`;

    try {
      const notification = new Notification(title, {
        body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: `bookmark-${bookmark.id}`,
        requireInteraction: false,
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        // Could navigate to bookmarks page or verse details
      };
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [notificationPermission]);

  // Check for due reminders on mount and periodically
  useEffect(() => {
    if (loading) return;

    const checkReminders = () => {
      const now = new Date().getTime();

      bookmarks.forEach(bookmark => {
        if (bookmark.reminderAt && !bookmark.reminderSent) {
          const reminderTime = new Date(bookmark.reminderAt).getTime();

          if (reminderTime <= now) {
            sendReminderNotification(bookmark);
            markReminderAsSent(bookmark.id);
          }
        }
      });
    };

    // Check immediately
    checkReminders();

    // Check every minute for due reminders
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [bookmarks, loading, sendReminderNotification, markReminderAsSent]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }

    return false;
  };

  // Add a new bookmark
  const addBookmark = (verseRef, verseText, reminderAt = null) => {
    const newBookmark = {
      id: Date.now().toString(),
      verseRef,
      verseText,
      createdAt: new Date().toISOString(),
      reminderAt,
      reminderSent: false,
      notes: ''
    };

    setBookmarks(prev => [...prev, newBookmark]);
    return newBookmark;
  };

  // Update a bookmark
  const updateBookmark = (bookmarkId, updates) => {
    setBookmarks(prev =>
      prev.map(b =>
        b.id === bookmarkId
          ? {
              ...b,
              ...updates,
              // Reset reminderSent if reminder date is changed
              reminderSent: updates.reminderAt !== b.reminderAt ? false : b.reminderSent
            }
          : b
      )
    );
  };

  // Delete a bookmark
  const deleteBookmark = (bookmarkId) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };

  // Check if a verse is bookmarked
  const isBookmarked = (verseRef) => {
    return bookmarks.some(b => b.verseRef === verseRef);
  };

  // Get bookmark by verse reference
  const getBookmarkByRef = (verseRef) => {
    return bookmarks.find(b => b.verseRef === verseRef);
  };

  // Get bookmarks with upcoming reminders
  const getUpcomingReminders = () => {
    const now = new Date().getTime();
    return bookmarks
      .filter(b => b.reminderAt && !b.reminderSent)
      .filter(b => new Date(b.reminderAt).getTime() > now)
      .sort((a, b) => new Date(a.reminderAt) - new Date(b.reminderAt));
  };

  // Get overdue reminders
  const getOverdueReminders = () => {
    const now = new Date().getTime();
    return bookmarks
      .filter(b => b.reminderAt && !b.reminderSent)
      .filter(b => new Date(b.reminderAt).getTime() <= now);
  };

  // Sort bookmarks by different criteria
  const sortBookmarks = (sortBy = 'createdAt') => {
    const sorted = [...bookmarks];

    switch (sortBy) {
      case 'createdAt':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'createdAt-asc':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'reminderAt':
        return sorted.sort((a, b) => {
          if (!a.reminderAt) return 1;
          if (!b.reminderAt) return -1;
          return new Date(a.reminderAt) - new Date(b.reminderAt);
        });
      case 'verseRef':
        return sorted.sort((a, b) => a.verseRef.localeCompare(b.verseRef));
      default:
        return sorted;
    }
  };

  // Get statistics
  const getStats = () => {
    return {
      totalBookmarks: bookmarks.length,
      withReminders: bookmarks.filter(b => b.reminderAt).length,
      upcomingReminders: getUpcomingReminders().length,
      overdueReminders: getOverdueReminders().length,
      withNotes: bookmarks.filter(b => b.notes && b.notes.trim()).length
    };
  };

  const value = {
    bookmarks,
    loading,
    notificationPermission,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    isBookmarked,
    getBookmarkByRef,
    getUpcomingReminders,
    getOverdueReminders,
    sortBookmarks,
    getStats,
    requestNotificationPermission
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};
