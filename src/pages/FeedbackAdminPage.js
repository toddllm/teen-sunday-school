import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFeedback } from '../contexts/FeedbackContext';
import './FeedbackAdminPage.css';

function FeedbackAdminPage() {
  const { updateFeedback, deleteFeedback, getStats, getFilteredFeedback } = useFeedback();
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    searchTerm: ''
  });

  const stats = getStats();
  const filteredFeedback = getFilteredFeedback(filters);

  const handleStatusChange = (id, newStatus) => {
    updateFeedback(id, { status: newStatus });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      deleteFeedback(id);
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null);
      }
    }
  };

  const handleUpdateNotes = (id, adminNotes) => {
    updateFeedback(id, { adminNotes });
  };

  const handleUpdateTags = (id, tagsString) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    updateFeedback(id, { tags });
  };

  const handleUpdateAssignment = (id, assignedTo) => {
    updateFeedback(id, { assignedTo });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      priority: '',
      searchTerm: ''
    });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryBadgeClass = (category) => {
    const classes = {
      bug: 'badge-bug',
      feature: 'badge-feature',
      general: 'badge-general',
      content: 'badge-content'
    };
    return classes[category] || 'badge-general';
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      new: 'badge-new',
      reviewing: 'badge-reviewing',
      resolved: 'badge-resolved'
    };
    return classes[status] || 'badge-new';
  };

  const getPriorityBadgeClass = (priority) => {
    const classes = {
      low: 'badge-priority-low',
      medium: 'badge-priority-medium',
      high: 'badge-priority-high'
    };
    return classes[priority] || 'badge-priority-medium';
  };

  return (
    <div className="feedback-admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Feedback & Support Inbox</h1>
            <p className="admin-subtitle">Manage user feedback, bug reports, and feature requests</p>
          </div>
          <Link to="/admin" className="btn btn-secondary">
            ← Back to Admin
          </Link>
        </div>

        {/* Statistics */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Feedback</div>
          </div>
          <div className="stat-card stat-new">
            <div className="stat-number">{stats.newCount}</div>
            <div className="stat-label">New</div>
          </div>
          <div className="stat-card stat-reviewing">
            <div className="stat-number">{stats.reviewingCount}</div>
            <div className="stat-label">Reviewing</div>
          </div>
          <div className="stat-card stat-resolved">
            <div className="stat-number">{stats.resolvedCount}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="category-stats">
          <div className="category-stat">
            <span className="category-icon">🐛</span>
            <span className="category-name">Bugs</span>
            <span className="category-count">{stats.byCategory.bug}</span>
          </div>
          <div className="category-stat">
            <span className="category-icon">✨</span>
            <span className="category-name">Features</span>
            <span className="category-count">{stats.byCategory.feature}</span>
          </div>
          <div className="category-stat">
            <span className="category-icon">📖</span>
            <span className="category-name">Content</span>
            <span className="category-count">{stats.byCategory.content}</span>
          </div>
          <div className="category-stat">
            <span className="category-icon">💬</span>
            <span className="category-name">General</span>
            <span className="category-count">{stats.byCategory.general}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-row">
            <input
              type="text"
              name="searchTerm"
              className="filter-input filter-search"
              placeholder="Search feedback..."
              value={filters.searchTerm}
              onChange={handleFilterChange}
            />

            <select
              name="status"
              className="filter-input"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              name="category"
              className="filter-input"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="content">Content Suggestion</option>
              <option value="general">General Feedback</option>
            </select>

            <select
              name="priority"
              className="filter-input"
              value={filters.priority}
              onChange={handleFilterChange}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {(filters.status || filters.category || filters.priority || filters.searchTerm) && (
              <button className="btn btn-small btn-outline" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Feedback List */}
        <div className="feedback-content">
          {filteredFeedback.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No feedback found</h3>
              <p>
                {filters.status || filters.category || filters.priority || filters.searchTerm
                  ? 'Try adjusting your filters'
                  : 'No feedback has been submitted yet'}
              </p>
            </div>
          ) : (
            <div className="feedback-grid">
              <div className="feedback-list">
                {filteredFeedback.map(item => (
                  <div
                    key={item.id}
                    className={`feedback-item ${selectedFeedback?.id === item.id ? 'selected' : ''}`}
                    onClick={() => setSelectedFeedback(item)}
                  >
                    <div className="feedback-item-header">
                      <div className="feedback-badges">
                        <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                        <span className={`badge ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>
                        <span className={`badge ${getPriorityBadgeClass(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="feedback-date">{formatDate(item.createdAt)}</div>
                    </div>

                    <h3 className="feedback-subject">{item.subject}</h3>

                    <div className="feedback-meta">
                      <span className="feedback-author">
                        {item.name} {item.email && `(${item.email})`}
                      </span>
                    </div>

                    {item.tags.length > 0 && (
                      <div className="feedback-tags">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}

                    {item.assignedTo && (
                      <div className="feedback-assignment">
                        Assigned to: <strong>{item.assignedTo}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Detail Panel */}
              {selectedFeedback && (
                <div className="feedback-detail">
                  <div className="detail-header">
                    <h2>{selectedFeedback.subject}</h2>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(selectedFeedback.id)}
                    >
                      Delete
                    </button>
                  </div>

                  <div className="detail-meta">
                    <div className="detail-badges">
                      <span className={`badge ${getStatusBadgeClass(selectedFeedback.status)}`}>
                        {selectedFeedback.status}
                      </span>
                      <span className={`badge ${getCategoryBadgeClass(selectedFeedback.category)}`}>
                        {selectedFeedback.category}
                      </span>
                      <span className={`badge ${getPriorityBadgeClass(selectedFeedback.priority)}`}>
                        {selectedFeedback.priority}
                      </span>
                    </div>
                    <div className="detail-info">
                      <strong>From:</strong> {selectedFeedback.name} {selectedFeedback.email && `<${selectedFeedback.email}>`}
                    </div>
                    <div className="detail-info">
                      <strong>Submitted:</strong> {formatDate(selectedFeedback.createdAt)}
                    </div>
                    {selectedFeedback.updatedAt !== selectedFeedback.createdAt && (
                      <div className="detail-info">
                        <strong>Updated:</strong> {formatDate(selectedFeedback.updatedAt)}
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <h3>Message</h3>
                    <div className="message-content">{selectedFeedback.message}</div>
                  </div>

                  <div className="detail-section">
                    <h3>Status</h3>
                    <div className="status-buttons">
                      <button
                        className={`status-btn ${selectedFeedback.status === 'new' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(selectedFeedback.id, 'new')}
                      >
                        New
                      </button>
                      <button
                        className={`status-btn ${selectedFeedback.status === 'reviewing' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(selectedFeedback.id, 'reviewing')}
                      >
                        Reviewing
                      </button>
                      <button
                        className={`status-btn ${selectedFeedback.status === 'resolved' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(selectedFeedback.id, 'resolved')}
                      >
                        Resolved
                      </button>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Assignment</h3>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Assign to team member..."
                      value={selectedFeedback.assignedTo}
                      onChange={(e) => handleUpdateAssignment(selectedFeedback.id, e.target.value)}
                    />
                  </div>

                  <div className="detail-section">
                    <h3>Tags</h3>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Add tags (comma-separated)..."
                      value={selectedFeedback.tags.join(', ')}
                      onChange={(e) => handleUpdateTags(selectedFeedback.id, e.target.value)}
                    />
                    <small className="form-hint">Separate tags with commas</small>
                  </div>

                  <div className="detail-section">
                    <h3>Admin Notes</h3>
                    <textarea
                      className="form-textarea"
                      rows="6"
                      placeholder="Add internal notes..."
                      value={selectedFeedback.adminNotes}
                      onChange={(e) => handleUpdateNotes(selectedFeedback.id, e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FeedbackAdminPage;
