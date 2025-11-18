/**
 * Offline Context
 *
 * Manages offline state, network connectivity, and sync queue
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import offlineDB from '../services/offlineDB';
import offlineStorage from '../services/offlineStorage';

const OfflineContext = createContext();

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
};

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);
  const [downloadedTranslations, setDownloadedTranslations] = useState([]);

  // Analytics tracking
  const trackAnalytics = useCallback((event, data = {}) => {
    const analyticsEvent = {
      event,
      timestamp: new Date().toISOString(),
      isOnline,
      ...data
    };

    // Store in localStorage for analytics
    try {
      const analytics = JSON.parse(localStorage.getItem('offline-analytics') || '[]');
      analytics.push(analyticsEvent);
      // Keep only last 1000 events
      if (analytics.length > 1000) {
        analytics.shift();
      }
      localStorage.setItem('offline-analytics', JSON.stringify(analytics));
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }

    console.log('📊 Analytics:', analyticsEvent);
  }, [isOnline]);

  // Load sync queue from IndexedDB
  const loadSyncQueue = useCallback(async () => {
    try {
      const queue = await offlineDB.getPendingSyncItems();
      setSyncQueue(queue || []);
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }, []);

  // Load storage info
  const loadStorageInfo = useCallback(async () => {
    try {
      const info = await offlineStorage.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  }, []);

  // Load downloaded translations
  const loadDownloadedTranslations = useCallback(async () => {
    try {
      const translations = await offlineStorage.getDownloadedTranslations();
      setDownloadedTranslations(translations);
    } catch (error) {
      console.error('Error loading downloaded translations:', error);
    }
  }, []);

  // Initialize
  useEffect(() => {
    loadSyncQueue();
    loadStorageInfo();
    loadDownloadedTranslations();

    // Load last sync time from localStorage
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }

    // Track app initialization
    trackAnalytics('offline_mode_initialized');
  }, [loadSyncQueue, loadStorageInfo, loadDownloadedTranslations, trackAnalytics]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      trackAnalytics('connection_restored');

      // Auto-sync when connection is restored
      setTimeout(() => {
        syncPendingChanges();
      }, 1000); // Wait 1 second before syncing
    };

    const handleOffline = () => {
      setIsOnline(false);
      trackAnalytics('connection_lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [trackAnalytics]);

  // Add item to sync queue
  const addToSyncQueue = useCallback(async (action) => {
    try {
      await offlineDB.addToSyncQueue(action);
      await loadSyncQueue();
      trackAnalytics('item_added_to_sync_queue', {
        actionType: action.actionType
      });
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }, [loadSyncQueue, trackAnalytics]);

  // Sync pending changes
  const syncPendingChanges = useCallback(async () => {
    if (!isOnline || isSyncing) {
      return;
    }

    try {
      setIsSyncing(true);
      trackAnalytics('sync_started');

      const pendingItems = await offlineDB.getPendingSyncItems();

      if (pendingItems.length === 0) {
        setIsSyncing(false);
        return;
      }

      // Group items by type
      const noteActions = pendingItems.filter(item =>
        item.actionType === 'create_note' ||
        item.actionType === 'update_note' ||
        item.actionType === 'delete_note'
      );

      const highlightActions = pendingItems.filter(item =>
        item.actionType === 'create_highlight' ||
        item.actionType === 'delete_highlight'
      );

      const activityActions = pendingItems.filter(item =>
        item.actionType === 'log_activity'
      );

      // Note: Since we don't have a backend API, we'll mark items as synced
      // In a real implementation, this would make API calls

      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mark all items as synced
      for (const item of pendingItems) {
        await offlineDB.updateSyncItem(item.id, {
          status: 'completed',
          syncedAt: new Date().toISOString()
        });

        // Mark notes/highlights as synced
        if (item.actionType.includes('note')) {
          const note = await offlineDB.getNote(item.data.noteId);
          if (note) {
            await offlineDB.saveNote({ ...note, synced: true });
          }
        }

        if (item.actionType.includes('highlight')) {
          const highlight = await offlineDB.getHighlight(item.data.highlightId);
          if (highlight) {
            await offlineDB.saveHighlight({ ...highlight, synced: true });
          }
        }
      }

      // Update state
      await loadSyncQueue();
      const syncTime = new Date();
      setLastSyncTime(syncTime);
      localStorage.setItem('lastSyncTime', syncTime.toISOString());

      trackAnalytics('sync_completed', {
        itemsSynced: pendingItems.length,
        noteActions: noteActions.length,
        highlightActions: highlightActions.length,
        activityActions: activityActions.length
      });

      setIsSyncing(false);

    } catch (error) {
      console.error('Error syncing changes:', error);
      trackAnalytics('sync_failed', { error: error.message });
      setIsSyncing(false);
      throw error;
    }
  }, [isOnline, isSyncing, loadSyncQueue, trackAnalytics]);

  // Refresh storage info
  const refreshStorageInfo = useCallback(async () => {
    await loadStorageInfo();
    await loadDownloadedTranslations();
  }, [loadStorageInfo, loadDownloadedTranslations]);

  // Get analytics data
  const getAnalytics = useCallback(() => {
    try {
      const analytics = JSON.parse(localStorage.getItem('offline-analytics') || '[]');

      // Calculate metrics
      const totalEvents = analytics.length;
      const connectionLosses = analytics.filter(e => e.event === 'connection_lost').length;
      const syncAttempts = analytics.filter(e => e.event === 'sync_started').length;
      const syncSuccesses = analytics.filter(e => e.event === 'sync_completed').length;
      const syncFailures = analytics.filter(e => e.event === 'sync_failed').length;
      const downloadsStarted = analytics.filter(e => e.event === 'translation_download_started').length;
      const downloadsCompleted = analytics.filter(e => e.event === 'translation_download_completed').length;

      return {
        totalEvents,
        connectionLosses,
        syncAttempts,
        syncSuccesses,
        syncFailures,
        syncSuccessRate: syncAttempts > 0 ? (syncSuccesses / syncAttempts) * 100 : 0,
        downloadsStarted,
        downloadsCompleted,
        downloadSuccessRate: downloadsStarted > 0 ? (downloadsCompleted / downloadsStarted) * 100 : 0,
        rawEvents: analytics
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  }, []);

  const value = {
    // State
    isOnline,
    syncQueue,
    isSyncing,
    lastSyncTime,
    storageInfo,
    downloadedTranslations,

    // Methods
    addToSyncQueue,
    syncPendingChanges,
    refreshStorageInfo,
    trackAnalytics,
    getAnalytics
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export default OfflineContext;
