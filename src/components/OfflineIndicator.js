import React from 'react';
import { useOffline } from '../contexts/OfflineContext';
import './OfflineIndicator.css';

const OfflineIndicator = () => {
  const { isOnline, syncQueue, isSyncing, lastSyncTime } = useOffline();

  if (isOnline && syncQueue.length === 0) {
    return null; // Don't show anything when online and all synced
  }

  return (
    <div className={`offline-indicator ${!isOnline ? 'offline' : 'syncing'}`}>
      {!isOnline ? (
        <>
          <span className="indicator-icon">🔴</span>
          <span className="indicator-text">Offline</span>
          {syncQueue.length > 0 && (
            <span className="pending-badge">{syncQueue.length}</span>
          )}
        </>
      ) : isSyncing ? (
        <>
          <span className="indicator-icon spinning">🔄</span>
          <span className="indicator-text">Syncing...</span>
        </>
      ) : syncQueue.length > 0 ? (
        <>
          <span className="indicator-icon">⏳</span>
          <span className="indicator-text">Pending: {syncQueue.length}</span>
        </>
      ) : null}
    </div>
  );
};

export default OfflineIndicator;
