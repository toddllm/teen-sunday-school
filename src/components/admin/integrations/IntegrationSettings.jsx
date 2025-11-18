import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import GroupMappingInterface from './GroupMappingInterface';
import SyncLogsViewer from './SyncLogsViewer';
import './Integrations.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function IntegrationSettings() {
  const { integrationId } = useParams();
  const { isOrgAdmin } = useAuth();
  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    loadIntegration();
  }, [integrationId]);

  const loadIntegration = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/integrations/${integrationId}`
      );
      setIntegration(response.data.integration);
    } catch (err) {
      console.error('Failed to load integration:', err);
      setError(err.response?.data?.error || 'Failed to load integration');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${API_URL}/api/integrations/${integrationId}`,
        {
          syncEnabled: integration.syncEnabled,
          syncFrequency: integration.syncFrequency,
        }
      );

      setIntegration(response.data.integration);
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError(err.response?.data?.error || 'Failed to update settings');
    }
  };

  const handleManualSync = async () => {
    if (!window.confirm('Start a manual sync now?')) {
      return;
    }

    try {
      setSyncing(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/api/integrations/${integrationId}/sync`
      );

      setSuccess(
        `Sync completed: ${response.data.result.peopleAdded} people added, ${response.data.result.peopleUpdated} updated`
      );

      await loadIntegration();
    } catch (err) {
      console.error('Sync failed:', err);
      setError(err.response?.data?.error || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  if (!isOrgAdmin()) {
    return (
      <div className="integration-settings">
        <div className="alert alert-warning">
          You must be an organization admin to manage integrations.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="integration-settings">
        <div className="loading">Loading integration...</div>
      </div>
    );
  }

  if (!integration) {
    return (
      <div className="integration-settings">
        <div className="alert alert-error">Integration not found</div>
      </div>
    );
  }

  return (
    <div className="integration-settings">
      <div className="page-header">
        <h1>{integration.provider.replace('_', ' ')} Integration</h1>
        <div className="header-actions">
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="btn btn-primary"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
          <a href="/admin/integrations" className="btn btn-secondary">
            Back to Integrations
          </a>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={`tab ${activeTab === 'mappings' ? 'active' : ''}`}
          onClick={() => setActiveTab('mappings')}
        >
          Group Mappings
        </button>
        <button
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Sync Logs
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h2>Sync Settings</h2>

            <form onSubmit={handleUpdateSettings} className="settings-form">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={integration.syncEnabled}
                    onChange={(e) =>
                      setIntegration({
                        ...integration,
                        syncEnabled: e.target.checked,
                      })
                    }
                  />
                  Enable Automatic Sync
                </label>
                <p className="form-help">
                  When enabled, syncs will run automatically based on the
                  frequency below.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="syncFrequency">Sync Frequency</label>
                <select
                  id="syncFrequency"
                  value={integration.syncFrequency}
                  onChange={(e) =>
                    setIntegration({
                      ...integration,
                      syncFrequency: e.target.value,
                    })
                  }
                  disabled={!integration.syncEnabled}
                >
                  <option value="HOURLY">Every Hour</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MANUAL">Manual Only</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <div className="status-display">
                  <span className={`status-badge status-${integration.status.toLowerCase()}`}>
                    {integration.status}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Last Sync</label>
                <p>
                  {integration.lastSyncAt
                    ? new Date(integration.lastSyncAt).toLocaleString()
                    : 'Never'}
                </p>
                {integration.lastSyncStatus && (
                  <p className="sync-status">
                    Status: {integration.lastSyncStatus}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Next Scheduled Sync</label>
                <p>
                  {integration.nextSyncAt
                    ? new Date(integration.nextSyncAt).toLocaleString()
                    : 'Not scheduled'}
                </p>
              </div>

              <button type="submit" className="btn btn-primary">
                Save Settings
              </button>
            </form>
          </div>
        )}

        {activeTab === 'mappings' && (
          <GroupMappingInterface integrationId={integrationId} />
        )}

        {activeTab === 'logs' && (
          <SyncLogsViewer integrationId={integrationId} />
        )}
      </div>
    </div>
  );
}

export default IntegrationSettings;
