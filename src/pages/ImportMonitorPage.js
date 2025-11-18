import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import './ImportMonitorPage.css';

const ImportMonitorPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { organization, isOrgAdmin } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Check if user is org admin
  if (!isOrgAdmin()) {
    return (
      <div className="import-monitor-page">
        <div className="error-message">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  // Load import jobs list
  const loadJobs = async () => {
    try {
      const response = await apiClient.getOrganizationImports(organization.id, page);

      if (response.success) {
        setJobs(response.data.jobs);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load import jobs');
    } finally {
      setLoading(false);
    }
  };

  // Load specific job details
  const loadJobDetails = async (id) => {
    try {
      const response = await apiClient.getImportStatus(organization.id, id);

      if (response.success) {
        setSelectedJob(response.data.job);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job details');
    }
  };

  useEffect(() => {
    loadJobs();
  }, [page]);

  useEffect(() => {
    if (jobId) {
      loadJobDetails(jobId);
    }
  }, [jobId]);

  // Auto-refresh for jobs in progress
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const hasActiveJobs = jobs.some(job =>
        ['pending', 'validating', 'processing'].includes(job.status)
      );

      if (hasActiveJobs) {
        loadJobs();
      }

      if (selectedJob && ['pending', 'validating', 'processing'].includes(selectedJob.status)) {
        loadJobDetails(selectedJob.id);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [jobs, selectedJob, autoRefresh]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-badge pending',
      validating: 'status-badge processing',
      validated: 'status-badge success',
      processing: 'status-badge processing',
      completed: 'status-badge success',
      failed: 'status-badge error',
      cancelled: 'status-badge cancelled'
    };

    return <span className={statusClasses[status] || 'status-badge'}>{status}</span>;
  };

  const getRowStatusBadge = (status) => {
    const statusClasses = {
      pending: 'row-status pending',
      validated: 'row-status success',
      processing: 'row-status processing',
      success: 'row-status success',
      failed: 'row-status error',
      skipped: 'row-status skipped'
    };

    return <span className={statusClasses[status] || 'row-status'}>{status}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const calculateProgress = (job) => {
    if (job.totalRows === 0) return 0;
    const processed = job.successfulRows + job.failedRows;
    return Math.round((processed / job.totalRows) * 100);
  };

  const handleCancelJob = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this import?')) {
      return;
    }

    try {
      await apiClient.cancelImport(organization.id, id);
      loadJobs();
      if (selectedJob?.id === id) {
        loadJobDetails(id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel import');
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="import-monitor-page">
        <div className="loading">Loading import jobs...</div>
      </div>
    );
  }

  return (
    <div className="import-monitor-page">
      <div className="page-header">
        <h1>Import Jobs</h1>
        <div className="header-actions">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button className="btn-primary" onClick={() => navigate('/admin/bulk-import')}>
            New Import
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="content-layout">
        {/* Jobs list */}
        <div className="jobs-list">
          <h2>Import History</h2>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <p>No import jobs yet.</p>
              <button className="btn-primary" onClick={() => navigate('/admin/bulk-import')}>
                Create First Import
              </button>
            </div>
          ) : (
            <>
              <div className="jobs-table">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className={`job-card ${selectedJob?.id === job.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedJob(job);
                      loadJobDetails(job.id);
                    }}
                  >
                    <div className="job-header">
                      <div className="job-title">{job.fileName}</div>
                      {getStatusBadge(job.status)}
                    </div>

                    <div className="job-stats">
                      <div className="stat-item">
                        <span className="stat-label">Total:</span>
                        <span className="stat-value">{job.totalRows}</span>
                      </div>
                      <div className="stat-item success">
                        <span className="stat-label">Success:</span>
                        <span className="stat-value">{job.successfulRows}</span>
                      </div>
                      <div className="stat-item error">
                        <span className="stat-label">Failed:</span>
                        <span className="stat-value">{job.failedRows}</span>
                      </div>
                    </div>

                    {['processing', 'validating'].includes(job.status) && (
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${calculateProgress(job)}%` }}
                        />
                      </div>
                    )}

                    <div className="job-footer">
                      <span className="job-date">{formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Job details */}
        {selectedJob && (
          <div className="job-details">
            <div className="details-header">
              <h2>Import Details</h2>
              {['pending', 'validating', 'processing'].includes(selectedJob.status) && (
                <button
                  className="btn-secondary"
                  onClick={() => handleCancelJob(selectedJob.id)}
                >
                  Cancel Import
                </button>
              )}
            </div>

            <div className="details-section">
              <h3>Job Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">File Name:</span>
                  <span className="info-value">{selectedJob.fileName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className="info-value">{getStatusBadge(selectedJob.status)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created:</span>
                  <span className="info-value">{formatDate(selectedJob.createdAt)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created By:</span>
                  <span className="info-value">
                    {selectedJob.creator?.firstName} {selectedJob.creator?.lastName}
                  </span>
                </div>
                {selectedJob.startedAt && (
                  <div className="info-item">
                    <span className="info-label">Started:</span>
                    <span className="info-value">{formatDate(selectedJob.startedAt)}</span>
                  </div>
                )}
                {selectedJob.completedAt && (
                  <div className="info-item">
                    <span className="info-label">Completed:</span>
                    <span className="info-value">{formatDate(selectedJob.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="details-section">
              <h3>Progress</h3>
              <div className="progress-stats">
                <div className="progress-stat">
                  <div className="progress-label">Total Rows</div>
                  <div className="progress-value">{selectedJob.totalRows}</div>
                </div>
                <div className="progress-stat success">
                  <div className="progress-label">Successful</div>
                  <div className="progress-value">{selectedJob.successfulRows}</div>
                </div>
                <div className="progress-stat error">
                  <div className="progress-label">Failed</div>
                  <div className="progress-value">{selectedJob.failedRows}</div>
                </div>
              </div>
              {['processing', 'validating'].includes(selectedJob.status) && (
                <div className="progress-bar-large">
                  <div
                    className="progress-fill"
                    style={{ width: `${calculateProgress(selectedJob)}%` }}
                  />
                  <span className="progress-text">{calculateProgress(selectedJob)}%</span>
                </div>
              )}
            </div>

            {selectedJob.errorMessage && (
              <div className="details-section error-section">
                <h3>Error</h3>
                <p>{selectedJob.errorMessage}</p>
              </div>
            )}

            {selectedJob.rows && selectedJob.rows.length > 0 && (
              <div className="details-section">
                <h3>Import Rows ({selectedJob.rows.length})</h3>
                <div className="rows-table-container">
                  <table className="rows-table">
                    <thead>
                      <tr>
                        <th>Row #</th>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Group</th>
                        <th>Status</th>
                        <th>Invitation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedJob.rows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.rowNumber}</td>
                          <td>{row.dataJson.email}</td>
                          <td>
                            {row.dataJson.firstName} {row.dataJson.lastName}
                          </td>
                          <td>{row.dataJson.group || '-'}</td>
                          <td>{getRowStatusBadge(row.status)}</td>
                          <td>
                            {row.invitation ? (
                              <span className={`invitation-status ${row.invitation.status}`}>
                                {row.invitation.status}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportMonitorPage;
