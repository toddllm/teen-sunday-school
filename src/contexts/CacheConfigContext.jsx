import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import {
  updateCacheConfig as updateServiceWorkerConfig,
  clearCache as clearServiceWorkerCache,
  preCacheContent,
} from '../serviceWorkerRegistration';

const CacheConfigContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function CacheConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load cache config on mount
  useEffect(() => {
    loadConfig();
    loadOptions();
  }, []);

  // Update service worker when config changes
  useEffect(() => {
    if (config) {
      updateServiceWorkerConfig({
        strategy: config.strategy,
        cacheLessons: config.cacheLessons,
        cacheReadingPlans: config.cacheReadingPlans,
        cacheScriptures: config.cacheScriptures,
        cacheImages: config.cacheImages,
        cacheAudio: config.cacheAudio,
        maxCacheSize: config.maxCacheSize * 1024 * 1024, // Convert MB to bytes
      });
    }
  }, [config]);

  /**
   * Load cache configuration from API
   */
  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/admin/cache-config`);
      setConfig(response.data);
    } catch (err) {
      console.error('Failed to load cache config:', err);
      setError(err.response?.data?.error || 'Failed to load cache configuration');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load cache statistics
   */
  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/cache-config/stats`);
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to load cache stats:', err);
    }
  };

  /**
   * Load available cache options (strategies, frequencies, policies)
   */
  const loadOptions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/cache-config/options`);
      setOptions(response.data);
    } catch (err) {
      console.error('Failed to load cache options:', err);
    }
  };

  /**
   * Update cache configuration
   */
  const updateConfig = async (updates) => {
    try {
      setError(null);

      const response = await axios.patch(`${API_URL}/api/admin/cache-config`, updates);
      setConfig(response.data);

      return { success: true };
    } catch (err) {
      console.error('Failed to update cache config:', err);
      const errorMsg = err.response?.data?.error || 'Failed to update cache configuration';
      setError(errorMsg);

      return { success: false, error: errorMsg };
    }
  };

  /**
   * Trigger manual cache sync
   */
  const triggerSync = async () => {
    try {
      setError(null);

      const response = await axios.post(`${API_URL}/api/admin/cache-config/sync`);

      // Reload config to get updated sync times
      await loadConfig();

      return { success: true, data: response.data };
    } catch (err) {
      console.error('Failed to trigger sync:', err);
      const errorMsg = err.response?.data?.error || 'Failed to trigger cache sync';
      setError(errorMsg);

      return { success: false, error: errorMsg };
    }
  };

  /**
   * Clear all cached content
   */
  const clearCache = async () => {
    try {
      setError(null);

      // Clear service worker cache
      clearServiceWorkerCache();

      // Clear localStorage caches
      localStorage.removeItem('sunday-school-lessons');
      localStorage.removeItem('sunday-school-reading-plans');

      // Clear IndexedDB if used
      if (window.indexedDB) {
        const dbs = ['sunday-school-cache'];
        for (const dbName of dbs) {
          window.indexedDB.deleteDatabase(dbName);
        }
      }

      return { success: true };
    } catch (err) {
      console.error('Failed to clear cache:', err);
      const errorMsg = 'Failed to clear cache';
      setError(errorMsg);

      return { success: false, error: errorMsg };
    }
  };

  /**
   * Pre-cache specific lessons
   */
  const preCacheLessons = async (lessonIds) => {
    try {
      setError(null);

      // Build URLs for lessons to pre-cache
      const urls = lessonIds.map(id => `/api/lessons/${id}`);

      // Send to service worker for pre-caching
      preCacheContent(urls);

      // Update config with cached lesson IDs
      await updateConfig({ cachedLessonIds: lessonIds });

      return { success: true };
    } catch (err) {
      console.error('Failed to pre-cache lessons:', err);
      const errorMsg = 'Failed to pre-cache lessons';
      setError(errorMsg);

      return { success: false, error: errorMsg };
    }
  };

  /**
   * Pre-cache specific reading plans
   */
  const preCachePlans = async (planIds) => {
    try {
      setError(null);

      // Build URLs for plans to pre-cache
      const urls = planIds.map(id => `/api/plans/${id}`);

      // Send to service worker for pre-caching
      preCacheContent(urls);

      // Update config with cached plan IDs
      await updateConfig({ cachedPlanIds: planIds });

      return { success: true };
    } catch (err) {
      console.error('Failed to pre-cache plans:', err);
      const errorMsg = 'Failed to pre-cache plans';
      setError(errorMsg);

      return { success: false, error: errorMsg };
    }
  };

  /**
   * Check if service worker is supported
   */
  const isServiceWorkerSupported = () => {
    return 'serviceWorker' in navigator;
  };

  /**
   * Check if offline mode is available
   */
  const isOfflineAvailable = () => {
    return isServiceWorkerSupported() && config?.isActive;
  };

  const value = {
    config,
    stats,
    options,
    loading,
    error,
    loadConfig,
    loadStats,
    updateConfig,
    triggerSync,
    clearCache,
    preCacheLessons,
    preCachePlans,
    isServiceWorkerSupported,
    isOfflineAvailable,
  };

  return (
    <CacheConfigContext.Provider value={value}>
      {children}
    </CacheConfigContext.Provider>
  );
}

export function useCacheConfig() {
  const context = useContext(CacheConfigContext);
  if (!context) {
    throw new Error('useCacheConfig must be used within a CacheConfigProvider');
  }
  return context;
}

export default CacheConfigContext;
