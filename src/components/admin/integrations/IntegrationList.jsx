import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import './Integrations.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function IntegrationList() {
  const { user, isOrgAdmin } = useAuth();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadIntegrations();
    }
  }, [user]);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/orgs/${user.organizationId}/integrations`
      );
      setIntegrations(response.data.integrations);
    } catch (err) {
      console.error('Failed to load integrations:', err);
      setError(err.response?.data?.error || 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPlanningCenter = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/integrations/planning-center/auth`,
        {
          params: { orgId: user.organizationId },
        }
      );

      // Redirect to Planning Center OAuth
      window.location.href = response.data.authUrl;
    } catch (err) {
      console.error('Failed to initiate Planning Center auth:', err);
      setError('Failed to connect to Planning Center');
    }
  };

  const handleDeleteIntegration = async (integrationId) => {
    if (!window.confirm('Are you sure you want to delete this integration?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/integrations/${integrationId}`);
      await loadIntegrations();
    } catch (err) {
      console.error('Failed to delete integration:', err);
      setError('Failed to delete integration');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      ACTIVE: 'status-badge status-active',
      INACTIVE: 'status-badge status-inactive',
      ERROR: 'status-badge status-error',
      PENDING: 'status-badge status-pending',
      EXPIRED: 'status-badge status-expired',
    };

    return <span className={statusClasses[status] || 'status-badge'}>{status}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (!isOrgAdmin()) {
    return (
      <div className="integrations-page">
        <div className="alert alert-warning">
          You must be an organization admin to manage integrations.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="integrations-page">
        <div className="loading">Loading integrations...</div>
      </div>
    );
  }

  return (
    <div className="integrations-page">
      <div className="page-header">
        <h1>Integrations</h1>
        <p>Connect to church management systems to sync people and groups</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="integrations-actions">
        <button
          onClick={handleConnectPlanningCenter}
          className="btn btn-primary"
        >
          + Connect Planning Center
        </button>
      </div>

      {integrations.length === 0 ? (
        <div className="empty-state">
          <h3>No integrations configured</h3>
          <p>Connect to Planning Center to sync your people and groups.</p>
          <button onClick={handleConnectPlanningCenter} className="btn btn-primary">
            Connect Planning Center
          </button>
        </div>
      ) : (
        <div className="integrations-list">
          {integrations.map((integration) => (
            <div key={integration.id} className="integration-card">
              <div className="integration-header">
                <div className="integration-title">
                  <h3>{integration.provider.replace('_', ' ')}</h3>
                  {getStatusBadge(integration.status)}
                </div>
                <div className="integration-actions">
                  <a
                    href={`/admin/integrations/${integration.id}`}
                    className="btn btn-secondary"
                  >
                    Manage
                  </a>
                  <button
                    onClick={() => handleDeleteIntegration(integration.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="integration-details">
                <div className="detail-row">
                  <span className="label">Sync Enabled:</span>
                  <span className="value">
                    {integration.syncEnabled ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Sync Frequency:</span>
                  <span className="value">{integration.syncFrequency}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Last Sync:</span>
                  <span className="value">
                    {formatDate(integration.lastSyncAt)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Last Sync Status:</span>
                  <span className="value">
                    {integration.lastSyncStatus || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Next Sync:</span>
                  <span className="value">
                    {formatDate(integration.nextSyncAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IntegrationList;
