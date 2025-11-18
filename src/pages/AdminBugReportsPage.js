import React, { useState } from 'react';
import { useBugReports } from '../contexts/BugReportContext';
import './AdminBugReportsPage.css';

const AdminBugReportsPage = () => {
  const {
    bugReports,
    updateBugReportStatus,
    deleteBugReport,
    getBugReportStats,
    exportBugReports,
    clearAllBugReports
  } = useBugReports();

  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const stats = getBugReportStats();

  // Filter bug reports
  const filteredReports = bugReports.filter(report => {
    const statusMatch = filterStatus === 'all' || report.status === filterStatus;
    const severityMatch = filterSeverity === 'all' || report.severity === filterSeverity;
    return statusMatch && severityMatch;
  });

  const handleStatusChange = (reportId, newStatus) => {
    updateBugReportStatus(reportId, newStatus);
  };

  const handleDelete = (reportId) => {
    if (window.confirm('Are you sure you want to delete this bug report?')) {
      deleteBugReport(reportId);
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#ff5722',
      critical: '#f44336'
    };
    return colors[severity] || '#999';
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { label: 'New', color: '#2196f3' },
      'in-progress': { label: 'In Progress', color: '#ff9800' },
      resolved: { label: 'Resolved', color: '#4caf50' },
      closed: { label: 'Closed', color: '#999' }
    };
    return badges[status] || { label: status, color: '#999' };
  };

  return (
    <div className="admin-bug-reports-page">
      <div className="bug-reports-header">
        <h1>Bug Reports Dashboard</h1>
        <div className="header-actions">
          <button onClick={exportBugReports} className="btn-export">
            Export All Reports
          </button>
          <button onClick={clearAllBugReports} className="btn-danger">
            Clear All Reports
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Reports</div>
        </div>
        <div className="stat-card stat-new">
          <div className="stat-value">{stats.new}</div>
          <div className="stat-label">New</div>
        </div>
        <div className="stat-card stat-progress">
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card stat-resolved">
          <div className="stat-value">{stats.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Severity:</label>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="filter-results">
          Showing {filteredReports.length} of {bugReports.length} reports
        </div>
      </div>

      {/* Bug Reports List and Details */}
      <div className="bug-reports-container">
        <div className="bug-reports-list">
          {filteredReports.length === 0 ? (
            <div className="no-reports">
              <p>No bug reports found</p>
            </div>
          ) : (
            filteredReports.map(report => {
              const statusBadge = getStatusBadge(report.status);
              return (
                <div
                  key={report.id}
                  className={`bug-report-item ${selectedReport?.id === report.id ? 'selected' : ''}`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="report-item-header">
                    <h3>{report.title}</h3>
                    <span
                      className="severity-badge"
                      style={{ backgroundColor: getSeverityColor(report.severity) }}
                    >
                      {report.severity}
                    </span>
                  </div>
                  <div className="report-item-meta">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: statusBadge.color }}
                    >
                      {statusBadge.label}
                    </span>
                    <span className="category">{report.category}</span>
                    <span className="date">
                      {new Date(report.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="report-description">{report.description}</p>
                </div>
              );
            })
          )}
        </div>

        {selectedReport && (
          <div className="bug-report-details">
            <div className="details-header">
              <h2>{selectedReport.title}</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="btn-close"
              >
                ✕
              </button>
            </div>

            <div className="details-section">
              <h3>Status & Priority</h3>
              <div className="status-controls">
                <select
                  value={selectedReport.status}
                  onChange={(e) => handleStatusChange(selectedReport.id, e.target.value)}
                >
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <span
                  className="severity-indicator"
                  style={{ backgroundColor: getSeverityColor(selectedReport.severity) }}
                >
                  {selectedReport.severity} severity
                </span>
              </div>
            </div>

            <div className="details-section">
              <h3>Description</h3>
              <p>{selectedReport.description}</p>
            </div>

            {selectedReport.stepsToReproduce && (
              <div className="details-section">
                <h3>Steps to Reproduce</h3>
                <pre>{selectedReport.stepsToReproduce}</pre>
              </div>
            )}

            {selectedReport.expectedBehavior && (
              <div className="details-section">
                <h3>Expected Behavior</h3>
                <p>{selectedReport.expectedBehavior}</p>
              </div>
            )}

            {selectedReport.actualBehavior && (
              <div className="details-section">
                <h3>Actual Behavior</h3>
                <p>{selectedReport.actualBehavior}</p>
              </div>
            )}

            <div className="details-section">
              <h3>Reporter Information</h3>
              <p><strong>Email:</strong> {selectedReport.userEmail}</p>
              <p><strong>Submitted:</strong> {new Date(selectedReport.timestamp).toLocaleString()}</p>
            </div>

            <div className="details-section">
              <h3>Session Diagnostics</h3>
              <details>
                <summary>Browser Information</summary>
                <pre>{JSON.stringify(selectedReport.diagnostics.browser, null, 2)}</pre>
              </details>
              <details>
                <summary>App Information</summary>
                <pre>{JSON.stringify(selectedReport.diagnostics.app, null, 2)}</pre>
              </details>
              <details>
                <summary>Performance</summary>
                <pre>{JSON.stringify(selectedReport.diagnostics.performance, null, 2)}</pre>
              </details>
              <details>
                <summary>Storage Info</summary>
                <pre>{JSON.stringify(selectedReport.diagnostics.storage, null, 2)}</pre>
              </details>
              {selectedReport.diagnostics.errors.length > 0 && (
                <details>
                  <summary>Errors ({selectedReport.diagnostics.errorCount})</summary>
                  <pre>{JSON.stringify(selectedReport.diagnostics.errors, null, 2)}</pre>
                </details>
              )}
            </div>

            <div className="details-actions">
              <button
                onClick={() => handleDelete(selectedReport.id)}
                className="btn-delete"
              >
                Delete Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBugReportsPage;
