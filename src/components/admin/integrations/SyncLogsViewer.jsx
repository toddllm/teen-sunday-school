import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Integrations.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function SyncLogsViewer({ integrationId }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    loadLogs();
  }, [integrationId, limit, offset]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/integrations/${integrationId}/sync/logs`,
        {
          params: { limit, offset },
        }
      );

      setLogs(response.data.logs);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Failed to load sync logs:', err);
      setError(err.response?.data?.error || 'Failed to load sync logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return '✓';
      case 'ERROR':
        return '✗';
      case 'PARTIAL':
        return '⚠';
      default:
        return '○';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'status-success';
      case 'ERROR':
        return 'status-error';
      case 'PARTIAL':
        return 'status-partial';
      default:
        return '';
    }
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handlePrevious = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const handleNext = () => {
    if (offset + limit < total) {
      setOffset(offset + limit);
    }
  };

  if (loading && logs.length === 0) {
    return <div className="loading">Loading sync logs...</div>;
  }

  return (
    <div className="sync-logs-viewer">
      <h2>Sync Logs</h2>
      <p>
        History of sync operations. Showing {offset + 1}-
        {Math.min(offset + limit, total)} of {total} logs.
      </p>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="empty-state">
          <h3>No sync logs yet</h3>
          <p>Run a sync to see logs here.</p>
        </div>
      ) : (
        <>
          <div className="logs-table">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Duration</th>
                  <th>People</th>
                  <th>Groups</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className={getStatusClass(log.status)}>
                    <td>
                      <span className={`status-icon ${getStatusClass(log.status)}`}>
                        {getStatusIcon(log.status)}
                      </span>
                      {log.status}
                    </td>
                    <td>{formatDate(log.startedAt)}</td>
                    <td>{formatDuration(log.durationMs)}</td>
                    <td>
                      <div className="stats">
                        {log.peopleAdded > 0 && (
                          <span className="stat-add">+{log.peopleAdded}</span>
                        )}
                        {log.peopleUpdated > 0 && (
                          <span className="stat-update">
                            ↻{log.peopleUpdated}
                          </span>
                        )}
                        {log.peopleRemoved > 0 && (
                          <span className="stat-remove">
                            -{log.peopleRemoved}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="stats">
                        {log.groupsAdded > 0 && (
                          <span className="stat-add">+{log.groupsAdded}</span>
                        )}
                        {log.groupsUpdated > 0 && (
                          <span className="stat-update">
                            ↻{log.groupsUpdated}
                          </span>
                        )}
                        {log.groupsSkipped > 0 && (
                          <span className="stat-skip">○{log.groupsSkipped}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {log.errorMessage && (
                        <details>
                          <summary className="error-summary">
                            Error details
                          </summary>
                          <pre className="error-message">
                            {log.errorMessage}
                          </pre>
                          {log.errorCode && (
                            <p className="error-code">Code: {log.errorCode}</p>
                          )}
                        </details>
                      )}
                      {log.status === 'SUCCESS' && (
                        <span className="success-message">✓ Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={handlePrevious}
              disabled={offset === 0}
              className="btn btn-secondary"
            >
              ← Previous
            </button>

            <span className="pagination-info">
              Page {Math.floor(offset / limit) + 1} of{' '}
              {Math.ceil(total / limit)}
            </span>

            <button
              onClick={handleNext}
              disabled={offset + limit >= total}
              className="btn btn-secondary"
            >
              Next →
            </button>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setOffset(0);
              }}
              className="limit-select"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}

export default SyncLogsViewer;
