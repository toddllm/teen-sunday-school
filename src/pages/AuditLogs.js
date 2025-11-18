import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminAPI from '../services/adminApi';
import './AuditLogs.css';

function AuditLogs() {
  const { hasPermission } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    loadLogs();
  }, [pagination.page, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await AdminAPI.getAuditLogs({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  const getActionBadgeClass = (action) => {
    if (action.includes('assigned') || action.includes('created')) return 'success';
    if (action.includes('removed') || action.includes('deleted')) return 'danger';
    if (action.includes('modified') || action.includes('updated')) return 'warning';
    return 'info';
  };

  if (!hasPermission('audit:view')) {
    return (
      <div className="page-container">
        <div className="error-card">
          <h2>Access Denied</h2>
          <p>You don't have permission to view audit logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>Track all role and permission changes in the system</p>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Action</label>
          <select
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="role_assigned">Role Assigned</option>
            <option value="role_removed">Role Removed</option>
            <option value="role_modified">Role Modified</option>
            <option value="user_created">User Created</option>
            <option value="user_updated">User Updated</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Entity Type</label>
          <select
            value={filters.entityType}
            onChange={(e) => handleFilterChange('entityType', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="user_role">User Role</option>
            <option value="role">Role</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </div>

        <button onClick={() => setFilters({ action: '', entityType: '', startDate: '', endDate: '' })} className="btn-clear">
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading audit logs...</div>
      ) : (
        <>
          <div className="logs-table">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Performed By</th>
                  <th>Target User</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="timestamp">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className={`action-badge ${getActionBadgeClass(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {log.performer
                        ? `${log.performer.firstName} ${log.performer.lastName}`
                        : 'System'}
                    </td>
                    <td>
                      {log.target
                        ? `${log.target.firstName} ${log.target.lastName}`
                        : '-'}
                    </td>
                    <td>
                      <details>
                        <summary>View Details</summary>
                        <div className="log-details">
                          {log.oldValue && (
                            <div>
                              <strong>Old:</strong>
                              <pre>{JSON.stringify(log.oldValue, null, 2)}</pre>
                            </div>
                          )}
                          {log.newValue && (
                            <div>
                              <strong>New:</strong>
                              <pre>{JSON.stringify(log.newValue, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </details>
                    </td>
                    <td className="ip-address">{log.ipAddress || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AuditLogs;
