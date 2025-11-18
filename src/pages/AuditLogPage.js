import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuditLog, AuditActionType, EntityType } from '../contexts/AuditLogContext';
import { format } from 'date-fns';
import './AuditLogPage.css';

function AuditLogPage() {
  const { getAuditLogs, getUniqueActors, pruneOldLogs } = useAuditLog();

  // Filter states
  const [actionTypeFilter, setActionTypeFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Get filtered and paginated logs
  const { logs, pagination } = useMemo(() => {
    return getAuditLogs({
      actionType: actionTypeFilter || undefined,
      entityType: entityTypeFilter || undefined,
      actorUserId: actorFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: currentPage,
      pageSize
    });
  }, [getAuditLogs, actionTypeFilter, entityTypeFilter, actorFilter, startDate, endDate, currentPage, pageSize]);

  const uniqueActors = useMemo(() => getUniqueActors(), [getUniqueActors]);

  const handleClearFilters = () => {
    setActionTypeFilter('');
    setEntityTypeFilter('');
    setActorFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handlePrune = () => {
    if (window.confirm('This will delete logs older than 90 days or keep only the most recent 1000 entries. Continue?')) {
      const prunedCount = pruneOldLogs();
      alert(`Pruned ${prunedCount} old log entries.`);
    }
  };

  const toggleExpand = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  const formatActionType = (actionType) => {
    return actionType.replace(/_/g, ' ');
  };

  const getActionIcon = (actionType) => {
    if (actionType.includes('CREATED')) return '➕';
    if (actionType.includes('UPDATED')) return '✏️';
    if (actionType.includes('DELETED')) return '🗑️';
    if (actionType.includes('DUPLICATED')) return '📋';
    return '📝';
  };

  const renderMetadata = (log) => {
    const { metadata } = log;

    // Show before/after for updates
    if (log.actionType === AuditActionType.LESSON_UPDATED && metadata.before && metadata.after) {
      return (
        <div className="metadata-details">
          <div className="metadata-section">
            <strong>Changes:</strong> {metadata.changes?.join(', ')}
          </div>
          <div className="before-after">
            <div className="before">
              <strong>Before:</strong>
              <pre>{JSON.stringify(metadata.before, null, 2)}</pre>
            </div>
            <div className="after">
              <strong>After:</strong>
              <pre>{JSON.stringify(metadata.after, null, 2)}</pre>
            </div>
          </div>
        </div>
      );
    }

    // Show metadata for other actions
    return (
      <div className="metadata-details">
        <pre>{JSON.stringify(metadata, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="audit-log-page">
      <div className="container">
        <div className="audit-header">
          <div>
            <h1>Audit Log</h1>
            <p className="subtitle">Track and review all system activities and changes</p>
          </div>
          <div className="header-actions">
            <button onClick={handlePrune} className="btn btn-secondary">
              🗑️ Prune Old Logs
            </button>
            <Link to="/admin" className="btn btn-secondary">
              ← Back to Admin
            </Link>
          </div>
        </div>

        <div className="filters-section">
          <h3>Filters</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Action Type</label>
              <select value={actionTypeFilter} onChange={(e) => setActionTypeFilter(e.target.value)}>
                <option value="">All Actions</option>
                {Object.values(AuditActionType).map(type => (
                  <option key={type} value={type}>{formatActionType(type)}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Entity Type</label>
              <select value={entityTypeFilter} onChange={(e) => setEntityTypeFilter(e.target.value)}>
                <option value="">All Entities</option>
                {Object.values(EntityType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Actor</label>
              <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)}>
                <option value="">All Actors</option>
                {uniqueActors.map(actor => (
                  <option key={actor} value={actor}>{actor}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="filter-actions">
              <button onClick={handleClearFilters} className="btn btn-small">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="logs-section">
          <div className="logs-header">
            <h3>Activity Logs</h3>
            <div className="logs-stats">
              Showing {logs.length} of {pagination.totalLogs} logs
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="empty-state">
              <p>No audit logs found matching your filters.</p>
            </div>
          ) : (
            <>
              <div className="logs-list">
                {logs.map(log => (
                  <div key={log.id} className="log-entry">
                    <div className="log-main" onClick={() => toggleExpand(log.id)}>
                      <div className="log-icon">
                        {getActionIcon(log.actionType)}
                      </div>
                      <div className="log-content">
                        <div className="log-header-row">
                          <span className="log-action">{formatActionType(log.actionType)}</span>
                          <span className="log-entity-type">{log.entityType}</span>
                        </div>
                        <div className="log-details-row">
                          <span className="log-actor">by {log.actorUserId}</span>
                          <span className="log-separator">•</span>
                          <span className="log-time">
                            {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                          </span>
                          {log.metadata?.title && (
                            <>
                              <span className="log-separator">•</span>
                              <span className="log-title">{log.metadata.title}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="log-expand">
                        {expandedLogId === log.id ? '▼' : '▶'}
                      </div>
                    </div>

                    {expandedLogId === log.id && (
                      <div className="log-expanded">
                        <div className="log-metadata">
                          <div><strong>Log ID:</strong> {log.id}</div>
                          <div><strong>Entity ID:</strong> {log.entityId}</div>
                          {renderMetadata(log)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={!pagination.hasPreviousPage}
                    className="btn btn-small"
                  >
                    ← Previous
                  </button>
                  <span className="pagination-info">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={!pagination.hasNextPage}
                    className="btn btn-small"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditLogPage;
