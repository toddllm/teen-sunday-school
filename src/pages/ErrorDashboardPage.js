import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ErrorDashboardPage.css';

function ErrorDashboardPage() {
  const [stats, setStats] = useState(null);
  const [errors, setErrors] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [trends, setTrends] = useState([]);
  const [activeTab, setActiveTab] = useState('errors');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    errorType: '',
    service: '',
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch stats
      const statsRes = await fetch('/api/admin/errors/stats?hours=24', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch errors
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const errorsRes = await fetch(`/api/admin/errors?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const errorsData = await errorsRes.json();
      setErrors(errorsData.data || []);

      // Fetch incidents
      const incidentsRes = await fetch('/api/admin/incidents?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const incidentsData = await incidentsRes.json();
      setIncidents(incidentsData.data || []);

      // Fetch trends
      const trendsRes = await fetch('/api/admin/errors/trends?days=7', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const trendsData = await trendsRes.json();
      setTrends(trendsData || []);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const handleResolveError = async (errorId) => {
    if (!window.confirm('Mark this error as resolved?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/errors/${errorId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolution: 'Manually resolved by admin' }),
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Failed to resolve error:', error);
      alert('Failed to resolve error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getSeverityClass = (severity) => {
    return `severity-badge severity-${severity?.toLowerCase()}`;
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status?.toLowerCase()}`;
  };

  if (loading && !stats) {
    return (
      <div className="error-dashboard-page">
        <div className="container">
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="error-dashboard-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Error & Incident Dashboard</h1>
            <p className="subtitle">Monitor and manage application health</p>
          </div>
          <Link to="/admin" className="btn btn-secondary">
            ← Back to Admin
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <div className="stat-number">{stats?.totalErrors || 0}</div>
              <div className="stat-label">Total Errors (24h)</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔴</div>
            <div className="stat-content">
              <div className="stat-number">{stats?.criticalErrors || 0}</div>
              <div className="stat-label">Critical Errors</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🚨</div>
            <div className="stat-content">
              <div className="stat-number">{stats?.openIncidents || 0}</div>
              <div className="stat-label">Open Incidents</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-number">
                {stats?.avgResolutionTimeMs
                  ? `${Math.round(stats.avgResolutionTimeMs / 60000)}m`
                  : 'N/A'}
              </div>
              <div className="stat-label">Avg Resolution Time</div>
            </div>
          </div>
        </div>

        {/* Error Type Distribution */}
        {stats?.errorsByType && stats.errorsByType.length > 0 && (
          <div className="error-distribution">
            <h3>Error Distribution</h3>
            <div className="error-type-bars">
              {stats.errorsByType.map(({ type, count }) => (
                <div key={type} className="error-type-bar">
                  <div className="error-type-label">{type}</div>
                  <div className="error-type-progress">
                    <div
                      className="error-type-fill"
                      style={{
                        width: `${(count / stats.totalErrors) * 100}%`
                      }}
                    />
                  </div>
                  <div className="error-type-count">{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'errors' ? 'active' : ''}`}
            onClick={() => setActiveTab('errors')}
          >
            Recent Errors
          </button>
          <button
            className={`tab-button ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setActiveTab('incidents')}
          >
            Incidents
          </button>
          <button
            className={`tab-button ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            Trends
          </button>
        </div>

        {/* Filters */}
        {activeTab === 'errors' && (
          <div className="filters">
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value, page: 1 })}
              className="filter-select"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFO">Info</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={filters.service}
              onChange={(e) => setFilters({ ...filters, service: e.target.value, page: 1 })}
              className="filter-select"
            >
              <option value="">All Services</option>
              <option value="api">API</option>
              <option value="frontend">Frontend</option>
              <option value="job-queue">Job Queue</option>
            </select>

            <button
              className="btn btn-secondary"
              onClick={() => setFilters({
                severity: '',
                status: '',
                errorType: '',
                service: '',
                page: 1,
                limit: 20,
              })}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Errors Table */}
        {activeTab === 'errors' && (
          <div className="errors-table-container">
            <table className="errors-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Severity</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {errors.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      No errors found
                    </td>
                  </tr>
                ) : (
                  errors.map((error) => (
                    <tr key={error.id}>
                      <td className="time-cell">{formatDate(error.createdAt)}</td>
                      <td className="type-cell">{error.errorType}</td>
                      <td className="message-cell">
                        <div className="error-message" title={error.errorMessage}>
                          {error.errorMessage.substring(0, 80)}
                          {error.errorMessage.length > 80 && '...'}
                        </div>
                        {error.httpPath && (
                          <div className="error-path">{error.httpPath}</div>
                        )}
                      </td>
                      <td>
                        <span className={getSeverityClass(error.severity)}>
                          {error.severity}
                        </span>
                      </td>
                      <td>{error.service}</td>
                      <td>
                        <span className={getStatusClass(error.status)}>
                          {error.status}
                        </span>
                      </td>
                      <td className="count-cell">{error.occurrenceCount}</td>
                      <td className="actions-cell">
                        {error.status !== 'RESOLVED' && (
                          <button
                            className="btn-small btn-success"
                            onClick={() => handleResolveError(error.id)}
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Incidents Table */}
        {activeTab === 'incidents' && (
          <div className="incidents-table-container">
            <table className="incidents-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Title</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Affected Users</th>
                  <th>Related Errors</th>
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      No incidents found
                    </td>
                  </tr>
                ) : (
                  incidents.map((incident) => (
                    <tr key={incident.id}>
                      <td className="time-cell">{formatDate(incident.createdAt)}</td>
                      <td className="title-cell">{incident.title}</td>
                      <td>
                        <span className={getSeverityClass(incident.severity)}>
                          {incident.severity}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusClass(incident.status)}>
                          {incident.status}
                        </span>
                      </td>
                      <td>{incident.affectedUsers}</td>
                      <td>{incident._count?.errorLogs || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Trends Chart */}
        {activeTab === 'trends' && (
          <div className="trends-container">
            <h3>Error Trends (Last 7 Days)</h3>
            {trends.length === 0 ? (
              <div className="empty-state">No trend data available</div>
            ) : (
              <div className="trends-chart">
                {trends.map((day) => (
                  <div key={day.date} className="trend-bar-container">
                    <div className="trend-date">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    <div className="trend-bar">
                      <div
                        className="trend-bar-critical"
                        style={{ height: `${(day.critical / Math.max(...trends.map(t => t.total)) * 100)}%` }}
                        title={`Critical: ${day.critical}`}
                      />
                      <div
                        className="trend-bar-high"
                        style={{ height: `${(day.high / Math.max(...trends.map(t => t.total)) * 100)}%` }}
                        title={`High: ${day.high}`}
                      />
                      <div
                        className="trend-bar-medium"
                        style={{ height: `${(day.medium / Math.max(...trends.map(t => t.total)) * 100)}%` }}
                        title={`Medium: ${day.medium}`}
                      />
                      <div
                        className="trend-bar-low"
                        style={{ height: `${(day.low / Math.max(...trends.map(t => t.total)) * 100)}%` }}
                        title={`Low: ${day.low}`}
                      />
                    </div>
                    <div className="trend-total">{day.total}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="trend-legend">
              <div className="legend-item">
                <div className="legend-color legend-critical"></div>
                <span>Critical</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-high"></div>
                <span>High</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-medium"></div>
                <span>Medium</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-low"></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ErrorDashboardPage;
