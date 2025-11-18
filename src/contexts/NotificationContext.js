import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's notification preferences
  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/notifications/preferences`);
      setPreferences(response.data);
    } catch (err) {
      console.error('Failed to fetch notification preferences:', err);
      setError(err.response?.data?.error || 'Failed to fetch preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update notification preferences
  const updatePreferences = useCallback(async (updates) => {
    try {
      const response = await axios.put(`${API_URL}/api/notifications/preferences`, updates);
      setPreferences(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to update notification preferences:', err);
      throw new Error(err.response?.data?.error || 'Failed to update preferences');
    }
  }, []);

  // Reset preferences to defaults
  const resetPreferences = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/api/notifications/preferences/reset`);
      setPreferences(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to reset notification preferences:', err);
      throw new Error(err.response?.data?.error || 'Failed to reset preferences');
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async (options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.offset) params.append('offset', options.offset);
      if (options.unreadOnly) params.append('unreadOnly', 'true');

      const response = await axios.get(`${API_URL}/api/notifications?${params.toString()}`);
      setNotifications(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      throw new Error(err.response?.data?.error || 'Failed to fetch notifications');
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/notifications/unread-count`);
      setUnreadCount(response.data.count);
      return response.data.count;
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
      return 0;
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await axios.put(`${API_URL}/api/notifications/${notificationId}/read`);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? response.data : n))
      );

      // Decrement unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      return response.data;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      throw new Error(err.response?.data?.error || 'Failed to mark as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/api/notifications/mark-all-read`);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date(), status: 'READ' }))
      );
      setUnreadCount(0);

      return response.data;
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      throw new Error(err.response?.data?.error || 'Failed to mark all as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await axios.delete(`${API_URL}/api/notifications/${notificationId}`);

      // Update local state
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      return true;
    } catch (err) {
      console.error('Failed to delete notification:', err);
      throw new Error(err.response?.data?.error || 'Failed to delete notification');
    }
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/api/notifications/test`);

      // Refresh notifications and unread count
      await fetchNotifications();
      await fetchUnreadCount();

      return response.data;
    } catch (err) {
      console.error('Failed to send test notification:', err);
      throw new Error(err.response?.data?.error || 'Failed to send test notification');
    }
  }, [fetchNotifications, fetchUnreadCount]);

  // Get notification stats
  const getNotificationStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/notifications/preferences/stats`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch notification stats:', err);
      throw new Error(err.response?.data?.error || 'Failed to fetch stats');
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchPreferences();
      fetchUnreadCount();
    } else {
      setLoading(false);
    }
  }, [fetchPreferences, fetchUnreadCount]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const value = {
    // State
    preferences,
    notifications,
    unreadCount,
    loading,
    error,

    // Preference actions
    fetchPreferences,
    updatePreferences,
    resetPreferences,
    getNotificationStats,

    // Notification actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendTestNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
