import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCacheConfig } from '../contexts/CacheConfigContext';
import './CacheConfigAdminPage.css';

const CacheConfigAdminPage = () => {
  const navigate = useNavigate();
  const {
    config,
    stats,
    options,
    loading,
    error: contextError,
    loadConfig,
    loadStats,
    updateConfig,
    triggerSync,
    clearCache,
    isServiceWorkerSupported,
  } = useCacheConfig();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedTab, setSelectedTab] = useState('settings'); // 'settings', 'stats', or 'advanced'

  // Local state for form fields
  const [formData, setFormData] = useState({
    cacheLessons: true,
    cacheReadingPlans: true,
    cacheScriptures: true,
    cacheImages: false,
    cacheAudio: false,
    maxCacheSize: 50,
    strategy: 'CACHE_FIRST',
    autoCache: true,
    autoSync: true,
    syncFrequency: 'DAILY',
    lessonCachePolicy: 'ALL_RECENT',
    planCachePolicy: 'ALL_ACTIVE',
    retentionDays: 30,
    isActive: true,
  });

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (config) {
      setFormData({
        cacheLessons: config.cacheLessons,
        cacheReadingPlans: config.cacheReadingPlans,
        cacheScriptures: config.cacheScriptures,
        cacheImages: config.cacheImages,
        cacheAudio: config.cacheAudio,
        maxCacheSize: config.maxCacheSize,
        strategy: config.strategy,
        autoCache: config.autoCache,
        autoSync: config.autoSync,
        syncFrequency: config.syncFrequency,
        lessonCachePolicy: config.lessonCachePolicy,
        planCachePolicy: config.planCachePolicy,
        retentionDays: config.retentionDays,
        isActive: config.isActive,
      });
    }
  }, [config]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const result = await updateConfig(formData);

      if (result.success) {
        setSuccess('Cache configuration saved successfully!');
        await loadStats(); // Reload stats after saving
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerSync = async () => {
    try {
      setError(null);
      setSuccess(null);

      const result = await triggerSync();

      if (result.success) {
        setSuccess('Cache sync initiated successfully!');
        await loadStats();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to trigger sync');
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm('Are you sure you want to clear all cached content? This cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      const result = await clearCache();

      if (result.success) {
        setSuccess('Cache cleared successfully!');
        await loadStats();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to clear cache');
    }
  };

  if (loading) {
    return (
      <div className="cache-config-admin-page">
        <div className="loading">Loading cache configuration...</div>
      </div>
    );
  }

  if (!isServiceWorkerSupported()) {
    return (
      <div className="cache-config-admin-page">
        <div className="header">
          <button className="back-button" onClick={() => navigate('/admin')}>
            ← Back to Admin
          </button>
          <h1>Offline Cache Configuration</h1>
        </div>
        <div className="error-banner">
          Service Workers are not supported in this browser. Offline caching requires a modern browser with Service Worker support.
        </div>
      </div>
    );
  }

  return (
    <div className="cache-config-admin-page">
      <div className="header">
        <button className="back-button" onClick={() => navigate('/admin')}>
          ← Back to Admin
        </button>
        <h1>Offline Cache Configuration</h1>
        <p className="subtitle">Configure what content should be available offline</p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {contextError && <div className="error-banner">{contextError}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="tabs">
        <button
          className={`tab ${selectedTab === 'settings' ? 'active' : ''}`}
          onClick={() => setSelectedTab('settings')}
        >
          Cache Settings
        </button>
        <button
          className={`tab ${selectedTab === 'stats' ? 'active' : ''}`}
          onClick={() => setSelectedTab('stats')}
        >
          Statistics
        </button>
        <button
          className={`tab ${selectedTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setSelectedTab('advanced')}
        >
          Advanced
        </button>
      </div>

      {selectedTab === 'settings' && (
        <div className="tab-content">
          <section className="config-section">
            <h2>General Settings</h2>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
                <span>Enable offline caching</span>
              </label>
            </div>
          </section>

          <section className="config-section">
            <h2>Content Types to Cache</h2>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.cacheLessons}
                  onChange={(e) => handleInputChange('cacheLessons', e.target.checked)}
                />
                <span>Lessons</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.cacheReadingPlans}
                  onChange={(e) => handleInputChange('cacheReadingPlans', e.target.checked)}
                />
                <span>Reading Plans</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.cacheScriptures}
                  onChange={(e) => handleInputChange('cacheScriptures', e.target.checked)}
                />
                <span>Scripture Passages</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.cacheImages}
                  onChange={(e) => handleInputChange('cacheImages', e.target.checked)}
                />
                <span>Images (increases cache size significantly)</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.cacheAudio}
                  onChange={(e) => handleInputChange('cacheAudio', e.target.checked)}
                />
                <span>Audio Files (increases cache size significantly)</span>
              </label>
            </div>
          </section>

          <section className="config-section">
            <h2>Cache Strategy</h2>
            <div className="form-group">
              <label>Caching Strategy</label>
              <select
                value={formData.strategy}
                onChange={(e) => handleInputChange('strategy', e.target.value)}
              >
                {options?.strategies?.map(strategy => (
                  <option key={strategy.value} value={strategy.value}>
                    {strategy.label}
                  </option>
                ))}
              </select>
              {options?.strategies?.find(s => s.value === formData.strategy)?.description && (
                <p className="help-text">
                  {options.strategies.find(s => s.value === formData.strategy).description}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Max Cache Size (MB)</label>
              <input
                type="number"
                min="10"
                max="500"
                value={formData.maxCacheSize}
                onChange={(e) => handleInputChange('maxCacheSize', parseInt(e.target.value))}
              />
              <p className="help-text">Maximum storage space for cached content</p>
            </div>
          </section>

          <section className="config-section">
            <h2>Cache Policies</h2>
            <div className="form-group">
              <label>Lesson Cache Policy</label>
              <select
                value={formData.lessonCachePolicy}
                onChange={(e) => handleInputChange('lessonCachePolicy', e.target.value)}
              >
                {options?.policies?.map(policy => (
                  <option key={policy.value} value={policy.value}>
                    {policy.label}
                  </option>
                ))}
              </select>
              {options?.policies?.find(p => p.value === formData.lessonCachePolicy)?.description && (
                <p className="help-text">
                  {options.policies.find(p => p.value === formData.lessonCachePolicy).description}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Reading Plan Cache Policy</label>
              <select
                value={formData.planCachePolicy}
                onChange={(e) => handleInputChange('planCachePolicy', e.target.value)}
              >
                {options?.policies?.map(policy => (
                  <option key={policy.value} value={policy.value}>
                    {policy.label}
                  </option>
                ))}
              </select>
              {options?.policies?.find(p => p.value === formData.planCachePolicy)?.description && (
                <p className="help-text">
                  {options.policies.find(p => p.value === formData.planCachePolicy).description}
                </p>
              )}
            </div>
          </section>

          <section className="config-section">
            <h2>Sync Settings</h2>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.autoCache}
                  onChange={(e) => handleInputChange('autoCache', e.target.checked)}
                />
                <span>Automatically cache new content</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.autoSync}
                  onChange={(e) => handleInputChange('autoSync', e.target.checked)}
                />
                <span>Automatically sync cached content</span>
              </label>
            </div>
            <div className="form-group">
              <label>Sync Frequency</label>
              <select
                value={formData.syncFrequency}
                onChange={(e) => handleInputChange('syncFrequency', e.target.value)}
                disabled={!formData.autoSync}
              >
                {options?.frequencies?.map(freq => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <div className="actions">
            <button
              className="save-button"
              onClick={handleSaveConfig}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}

      {selectedTab === 'stats' && (
        <div className="tab-content">
          <section className="stats-section">
            <h2>Cache Statistics</h2>
            {stats ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Content</h3>
                  <div className="stat-value">{stats.totalLessons}</div>
                  <div className="stat-label">Lessons</div>
                </div>
                <div className="stat-card">
                  <h3>Cached Lessons</h3>
                  <div className="stat-value">{stats.cachedLessonsCount}</div>
                  <div className="stat-label">Lessons</div>
                </div>
                <div className="stat-card">
                  <h3>Cached Plans</h3>
                  <div className="stat-value">{stats.cachedPlansCount}</div>
                  <div className="stat-label">Reading Plans</div>
                </div>
                <div className="stat-card">
                  <h3>Cache Size</h3>
                  <div className="stat-value">{stats.estimatedCacheSize} MB</div>
                  <div className="stat-label">of {stats.maxCacheSize} MB</div>
                </div>
                <div className="stat-card">
                  <h3>Utilization</h3>
                  <div className="stat-value">{stats.utilizationPercent}%</div>
                  <div className="stat-label">Storage Used</div>
                </div>
              </div>
            ) : (
              <div className="loading">Loading statistics...</div>
            )}
          </section>

          <section className="sync-section">
            <h2>Sync Information</h2>
            {config?.lastSyncAt && (
              <p>Last synced: {new Date(config.lastSyncAt).toLocaleString()}</p>
            )}
            {config?.nextSyncAt && (
              <p>Next sync: {new Date(config.nextSyncAt).toLocaleString()}</p>
            )}
            <button className="sync-button" onClick={handleTriggerSync}>
              Sync Now
            </button>
          </section>
        </div>
      )}

      {selectedTab === 'advanced' && (
        <div className="tab-content">
          <section className="config-section">
            <h2>Advanced Settings</h2>
            <div className="form-group">
              <label>Content Retention (days)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.retentionDays}
                onChange={(e) => handleInputChange('retentionDays', parseInt(e.target.value))}
              />
              <p className="help-text">Days to keep cached content before automatic cleanup</p>
            </div>
          </section>

          <section className="danger-section">
            <h2>Danger Zone</h2>
            <div className="danger-actions">
              <button className="danger-button" onClick={handleClearCache}>
                Clear All Cached Content
              </button>
              <p className="warning-text">
                This will remove all cached content from devices. Users will need to re-download content.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default CacheConfigAdminPage;
