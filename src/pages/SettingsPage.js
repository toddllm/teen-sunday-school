import React, { useState, useEffect } from 'react';
import { useOffline } from '../contexts/OfflineContext';
import offlineStorage, { AVAILABLE_TRANSLATIONS } from '../services/offlineStorage';
import './SettingsPage.css';

const SettingsPage = () => {
  const { storageInfo, downloadedTranslations, refreshStorageInfo, syncPendingChanges, isSyncing, lastSyncTime, isOnline, trackAnalytics } = useOffline();

  const [activeTab, setActiveTab] = useState('downloads');
  const [downloadingTranslations, setDownloadingTranslations] = useState({});
  const [downloadProgress, setDownloadProgress] = useState({});

  useEffect(() => {
    refreshStorageInfo();
  }, [refreshStorageInfo]);

  const handleDownload = async (translationId) => {
    try {
      setDownloadingTranslations(prev => ({ ...prev, [translationId]: true }));

      trackAnalytics('translation_download_started', { translationId });

      await offlineStorage.downloadTranslation(translationId, (progress) => {
        setDownloadProgress(prev => ({ ...prev, [translationId]: progress }));
      });

      trackAnalytics('translation_download_completed', { translationId });

      // Refresh data
      await refreshStorageInfo();
      setDownloadingTranslations(prev => ({ ...prev, [translationId]: false }));
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[translationId];
        return newProgress;
      });

    } catch (error) {
      console.error('Download failed:', error);
      trackAnalytics('translation_download_failed', { translationId, error: error.message });
      setDownloadingTranslations(prev => ({ ...prev, [translationId]: false }));
      alert(`Download failed: ${error.message}`);
    }
  };

  const handleCancelDownload = (translationId) => {
    offlineStorage.cancelDownload(translationId);
    setDownloadingTranslations(prev => ({ ...prev, [translationId]: false }));
    setDownloadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[translationId];
      return newProgress;
    });
    trackAnalytics('translation_download_canceled', { translationId });
  };

  const handleDelete = async (translationId) => {
    if (!window.confirm('Are you sure you want to delete this translation? This will free up storage space but you\'ll need to re-download it to use offline.')) {
      return;
    }

    try {
      await offlineStorage.deleteTranslation(translationId);
      await refreshStorageInfo();
      trackAnalytics('translation_deleted', { translationId });
    } catch (error) {
      console.error('Delete failed:', error);
      alert(`Failed to delete translation: ${error.message}`);
    }
  };

  const handleSync = async () => {
    try {
      await syncPendingChanges();
    } catch (error) {
      console.error('Sync failed:', error);
      alert(`Sync failed: ${error.message}`);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isTranslationDownloaded = (translationId) => {
    return downloadedTranslations.some(t => t.id === translationId);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <div className="connection-status">
          {isOnline ? (
            <span className="status-online">🟢 Online</span>
          ) : (
            <span className="status-offline">🔴 Offline</span>
          )}
        </div>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'downloads' ? 'active' : ''}`}
          onClick={() => setActiveTab('downloads')}
        >
          📥 Downloads
        </button>
        <button
          className={`tab ${activeTab === 'storage' ? 'active' : ''}`}
          onClick={() => setActiveTab('storage')}
        >
          💾 Storage
        </button>
        <button
          className={`tab ${activeTab === 'sync' ? 'active' : ''}`}
          onClick={() => setActiveTab('sync')}
        >
          🔄 Sync
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'downloads' && (
          <div className="downloads-tab">
            <div className="section">
              <h2>Available Bible Translations</h2>
              <p className="section-description">
                Download Bible translations for offline reading. Once downloaded, you can access them without an internet connection.
              </p>

              <div className="translations-list">
                {AVAILABLE_TRANSLATIONS.map(translation => {
                  const isDownloaded = isTranslationDownloaded(translation.id);
                  const isDownloading = downloadingTranslations[translation.id];
                  const progress = downloadProgress[translation.id];

                  return (
                    <div key={translation.id} className="translation-item">
                      <div className="translation-info">
                        <h3>
                          {translation.name}
                          {isDownloaded && <span className="badge downloaded">✓ Downloaded</span>}
                        </h3>
                        <p className="translation-abbreviation">{translation.abbreviation}</p>
                        <p className="translation-description">{translation.description}</p>
                        <p className="translation-size">
                          Estimated size: {translation.estimatedSize}
                        </p>
                      </div>

                      <div className="translation-actions">
                        {isDownloading ? (
                          <div className="download-progress">
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${progress?.progress || 0}%` }}
                              />
                            </div>
                            <p className="progress-text">
                              {progress?.progress || 0}% - {progress?.currentStep || 'Downloading...'}
                            </p>
                            <button
                              className="btn btn-cancel"
                              onClick={() => handleCancelDownload(translation.id)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : isDownloaded ? (
                          <button
                            className="btn btn-delete"
                            onClick={() => handleDelete(translation.id)}
                          >
                            🗑️ Delete
                          </button>
                        ) : (
                          <button
                            className="btn btn-download"
                            onClick={() => handleDownload(translation.id)}
                            disabled={!isOnline}
                          >
                            📥 Download
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="storage-tab">
            <div className="section">
              <h2>Storage Information</h2>

              {storageInfo && (
                <div className="storage-stats">
                  <div className="storage-bar">
                    <div
                      className="storage-fill"
                      style={{ width: `${storageInfo.percentage}%` }}
                    />
                  </div>

                  <div className="storage-details">
                    <div className="storage-detail">
                      <span className="label">Used:</span>
                      <span className="value">{formatBytes(storageInfo.usage)}</span>
                    </div>
                    <div className="storage-detail">
                      <span className="label">Available:</span>
                      <span className="value">{formatBytes(storageInfo.quota)}</span>
                    </div>
                    <div className="storage-detail">
                      <span className="label">Bible Data:</span>
                      <span className="value">{formatBytes(storageInfo.bibleStorage)}</span>
                    </div>
                    <div className="storage-detail">
                      <span className="label">Translations:</span>
                      <span className="value">{storageInfo.translationsCount}</span>
                    </div>
                  </div>
                </div>
              )}

              <h3>Downloaded Translations</h3>
              {downloadedTranslations.length > 0 ? (
                <div className="downloaded-list">
                  {downloadedTranslations.map(translation => (
                    <div key={translation.id} className="downloaded-item">
                      <div>
                        <strong>{translation.name}</strong> ({translation.abbreviation})
                        <br />
                        <small>
                          Downloaded: {formatDate(translation.downloadedAt)}
                          <br />
                          Size: {formatBytes(translation.downloadedSize)}
                        </small>
                      </div>
                      <button
                        className="btn btn-delete btn-sm"
                        onClick={() => handleDelete(translation.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No translations downloaded yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="sync-tab">
            <div className="section">
              <h2>Sync Settings</h2>
              <p className="section-description">
                Your notes, highlights, and activities are automatically synced when you're online.
              </p>

              <div className="sync-stats">
                <div className="sync-stat">
                  <span className="label">Last Sync:</span>
                  <span className="value">{formatDate(lastSyncTime)}</span>
                </div>
                <div className="sync-stat">
                  <span className="label">Status:</span>
                  <span className="value">
                    {isSyncing ? (
                      <span className="syncing">🔄 Syncing...</span>
                    ) : (
                      <span className="synced">✓ Up to date</span>
                    )}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleSync}
                disabled={!isOnline || isSyncing}
              >
                {isSyncing ? 'Syncing...' : '🔄 Sync Now'}
              </button>

              {!isOnline && (
                <div className="offline-notice">
                  <p>⚠️ You're currently offline. Changes will be synced automatically when you reconnect.</p>
                </div>
              )}

              <div className="sync-info">
                <h3>How Sync Works</h3>
                <ul>
                  <li>✓ Changes are saved locally immediately</li>
                  <li>✓ When online, changes are synced automatically</li>
                  <li>✓ You can manually trigger a sync at any time</li>
                  <li>✓ Conflicts are resolved automatically (last write wins)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
