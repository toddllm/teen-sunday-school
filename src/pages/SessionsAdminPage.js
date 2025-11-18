import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSessions } from '../contexts/SessionContext';
import './SessionsAdminPage.css';

export default function SessionsAdminPage() {
  const navigate = useNavigate();
  const { sessions, fetchSessions, createSession, deleteSession, loading } = useSessions();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    groupId: '',
    lessonId: '',
    title: '',
    scheduledDate: '',
    checkInEnabled: true,
  });

  useEffect(() => {
    loadSessions();
  }, [filter]);

  const loadSessions = () => {
    const filters = {};
    if (filter !== 'all') {
      filters.status = filter.toUpperCase();
    }
    fetchSessions(filters);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();

    try {
      const newSession = await createSession({
        ...formData,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
      });

      setShowCreateModal(false);
      setFormData({
        groupId: '',
        lessonId: '',
        title: '',
        scheduledDate: '',
        checkInEnabled: true,
      });

      alert('Session created successfully!');
      loadSessions();
    } catch (err) {
      alert('Failed to create session. Please try again.');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      await deleteSession(sessionId);
      alert('Session deleted successfully!');
      loadSessions();
    } catch (err) {
      alert('Failed to delete session. Please try again.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'badge-scheduled';
      case 'IN_PROGRESS':
        return 'badge-in-progress';
      case 'COMPLETED':
        return 'badge-completed';
      case 'CANCELLED':
        return 'badge-cancelled';
      default:
        return '';
    }
  };

  return (
    <div className="sessions-admin-page">
      <div className="page-header">
        <h1>Session Management</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create New Session
        </button>
      </div>

      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'scheduled' ? 'active' : ''}`}
          onClick={() => setFilter('scheduled')}
        >
          Scheduled
        </button>
        <button
          className={`filter-btn ${filter === 'in_progress' ? 'active' : ''}`}
          onClick={() => setFilter('in_progress')}
        >
          In Progress
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <p>No sessions found.</p>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            Create Your First Session
          </button>
        </div>
      ) : (
        <div className="sessions-list">
          {sessions.map((session) => (
            <div key={session.id} className="session-card">
              <div className="session-header">
                <div className="session-title">
                  <h3>{session.title || 'Untitled Session'}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(session.status)}`}>
                    {session.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="session-actions">
                  <Link to={`/attendance/${session.id}`} className="btn btn-sm btn-secondary">
                    View Attendance
                  </Link>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="session-details">
                <div className="detail-item">
                  <span className="detail-label">Group:</span>
                  <span className="detail-value">{session.group?.name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(session.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {session.startTime && (
                  <div className="detail-item">
                    <span className="detail-label">Started:</span>
                    <span className="detail-value">
                      {new Date(session.startTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {session.attendance?.length > 0 && (
                <div className="session-stats">
                  <span className="stat">
                    {session.attendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length}{' '}
                    / {session.group?.members?.length || 0} attended
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Session</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSession}>
              <div className="form-group">
                <label htmlFor="title">Session Title</label>
                <input
                  type="text"
                  id="title"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Sunday Morning Class"
                />
              </div>

              <div className="form-group">
                <label htmlFor="groupId">Group ID *</label>
                <input
                  type="text"
                  id="groupId"
                  className="form-control"
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  required
                  placeholder="Enter group ID"
                />
                <small className="form-text">
                  Note: In a full implementation, this would be a dropdown of available groups
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="scheduledDate">Scheduled Date *</label>
                <input
                  type="datetime-local"
                  id="scheduledDate"
                  className="form-control"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lessonId">Lesson ID (Optional)</label>
                <input
                  type="text"
                  id="lessonId"
                  className="form-control"
                  value={formData.lessonId}
                  onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                  placeholder="Enter lesson ID"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.checkInEnabled}
                    onChange={(e) => setFormData({ ...formData, checkInEnabled: e.target.checked })}
                  />
                  <span>Enable Check-In</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
