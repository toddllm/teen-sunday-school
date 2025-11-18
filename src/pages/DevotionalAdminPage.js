import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDevotionals } from '../contexts/DevotionalContext';
import { formatDate, getStatusColor, getDevotionalSummary } from '../services/devotionalService';
import './AdminPage.css';

function DevotionalAdminPage() {
  const {
    devotionals,
    deleteDevotional,
    duplicateDevotional,
    getStatistics
  } = useDevotionals();

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = getStatistics();

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteDevotional(id);
    }
  };

  const handleDuplicate = (id) => {
    const newId = duplicateDevotional(id);
    if (newId) {
      alert('Devotional duplicated successfully!');
    }
  };

  // Filter devotionals
  const filteredDevotionals = devotionals.filter(devotional => {
    // Filter by status
    if (filterStatus !== 'all' && devotional.status !== filterStatus) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        devotional.title?.toLowerCase().includes(lowerSearch) ||
        devotional.subtitle?.toLowerCase().includes(lowerSearch) ||
        devotional.category?.toLowerCase().includes(lowerSearch) ||
        devotional.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
    }

    return true;
  });

  // Sort by publish date (most recent first)
  const sortedDevotionals = [...filteredDevotionals].sort((a, b) => {
    if (!a.publishAt) return 1;
    if (!b.publishAt) return -1;
    return b.publishAt.localeCompare(a.publishAt);
  });

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Devotional Management</h1>
          <Link to="/admin/devotionals/create" className="btn btn-primary">
            + Create New Devotional
          </Link>
        </div>

        <div className="admin-quick-links">
          <Link to="/admin" className="quick-link">
            📚 Lessons
          </Link>
          <Link to="/admin/devotionals" className="quick-link">
            📖 Devotionals
          </Link>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Devotionals</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.published}</div>
            <div className="stat-label">Published</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.draft}</div>
            <div className="stat-label">Drafts</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.scheduled}</div>
            <div className="stat-label">Scheduled</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalReads}</div>
            <div className="stat-label">Total Reads</div>
          </div>
        </div>

        <div className="admin-content">
          <div className="admin-filters">
            <div className="form-group">
              <input
                type="text"
                placeholder="Search devotionals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="form-group">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <h2>
            Manage Devotionals
            {filterStatus !== 'all' && (
              <span className="filter-badge"> ({filterStatus})</span>
            )}
          </h2>

          {sortedDevotionals.length === 0 ? (
            <div className="empty-state">
              <p>
                {searchTerm || filterStatus !== 'all'
                  ? 'No devotionals found matching your filters.'
                  : 'No devotionals yet. Create your first devotional to get started!'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Link to="/admin/devotionals/create" className="btn btn-primary">
                  Create Devotional
                </Link>
              )}
            </div>
          ) : (
            <div className="lessons-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Publish Date</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Reads</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDevotionals.map(devotional => (
                    <tr key={devotional.id}>
                      <td className="lesson-title-cell">
                        <strong>{devotional.title}</strong>
                        {devotional.subtitle && (
                          <div className="lesson-subtitle">{devotional.subtitle}</div>
                        )}
                        {devotional.featured && (
                          <span className="badge badge-warning" style={{ marginLeft: '8px' }}>
                            ⭐ Featured
                          </span>
                        )}
                        <div className="devotional-preview">
                          {getDevotionalSummary(devotional, 100)}
                        </div>
                      </td>
                      <td>
                        <div>{formatDate(devotional.publishAt, 'short')}</div>
                        <div className="text-muted small">
                          {formatDate(devotional.publishAt, 'relative')}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusColor(devotional.status)}`}>
                          {devotional.status}
                        </span>
                      </td>
                      <td className="category-cell">
                        {devotional.category ? (
                          <span className="category-badge">{devotional.category}</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                        {devotional.tags && devotional.tags.length > 0 && (
                          <div className="tags-preview">
                            {devotional.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="tag-mini">
                                {tag}
                              </span>
                            ))}
                            {devotional.tags.length > 2 && (
                              <span className="tag-mini">+{devotional.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="text-center">{devotional.readCount || 0}</td>
                      <td className="actions-cell">
                        <Link
                          to={`/devotional/${devotional.id}`}
                          className="btn btn-small btn-secondary"
                          title="View"
                        >
                          👁️
                        </Link>
                        <Link
                          to={`/admin/devotionals/edit/${devotional.id}`}
                          className="btn btn-small btn-primary"
                          title="Edit"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleDuplicate(devotional.id)}
                          className="btn btn-small btn-outline"
                          title="Duplicate"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => handleDelete(devotional.id, devotional.title)}
                          className="btn btn-small btn-danger"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DevotionalAdminPage;
