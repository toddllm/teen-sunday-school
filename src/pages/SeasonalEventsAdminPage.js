import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSeasonalEvents } from '../contexts/SeasonalEventContext';
import { useAuth } from '../contexts/AuthContext';
import './SeasonalEventsAdminPage.css';

/**
 * SeasonalEventsAdminPage Component
 * Admin dashboard for managing seasonal events
 */
function SeasonalEventsAdminPage() {
  const { user } = useAuth();
  const {
    events,
    activeEvents,
    loading,
    loadEvents,
    deleteEvent,
    updateEvent,
  } = useSeasonalEvents();

  const [filter, setFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Check if user is admin
  const isAdmin = user?.role === 'ORG_ADMIN' || user?.role === 'SUPER_ADMIN';

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <p>⚠️ You don't have permission to access this page.</p>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  const handleDelete = async (eventId) => {
    try {
      await deleteEvent(eventId);
      setDeleteConfirm(null);
    } catch (error) {
      alert('Failed to delete event');
    }
  };

  const handleToggleActive = async (event) => {
    try {
      await updateEvent(event.id, { isActive: !event.isActive });
    } catch (error) {
      alert('Failed to update event');
    }
  };

  const handleTogglePinned = async (event) => {
    try {
      await updateEvent(event.id, { isPinned: !event.isPinned });
    } catch (error) {
      alert('Failed to update event');
    }
  };

  const getFilteredEvents = () => {
    if (filter === 'active') {
      return activeEvents;
    } else if (filter === 'inactive') {
      return events.filter(e => !e.isActive);
    }
    return events;
  };

  const filteredEvents = getFilteredEvents();

  // Calculate stats
  const totalEvents = events.length;
  const activeCount = activeEvents.length;
  const totalParticipants = events.reduce((sum, e) => sum + (e._count?.participations || 0), 0);
  const totalActivities = events.reduce((sum, e) => sum + (e._count?.activities || 0), 0);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading && events.length === 0) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Seasonal Events Management</h1>
          <p>Create and manage seasonal events for your organization</p>
        </div>
        <Link to="/admin/events/create" className="btn btn-primary">
          + Create Event
        </Link>
      </header>

      {/* Stats Dashboard */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-value">{totalEvents}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{activeCount}</div>
          <div className="stat-label">Active Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalParticipants}</div>
          <div className="stat-label">Total Participants</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalActivities}</div>
          <div className="stat-label">Total Activities</div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-controls">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="admin-select"
        >
          <option value="all">All Events</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Events Table */}
      {filteredEvents.length > 0 ? (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Season</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Participants</th>
                <th>Activities</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    <div className="event-cell">
                      {event.isPinned && <span className="event-pinned-badge">📌</span>}
                      <strong>{event.title}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="event-season-badge">{event.season}</span>
                  </td>
                  <td className="date-cell">
                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </td>
                  <td>
                    <span className={`status-badge ${event.isActive ? 'active' : 'inactive'}`}>
                      {event.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="centered">{event._count?.participations || 0}</td>
                  <td className="centered">{event._count?.activities || 0}</td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/events/${event.id}`}
                        className="btn-small btn-view"
                        title="View"
                      >
                        👁️
                      </Link>
                      <Link
                        to={`/admin/events/edit/${event.id}`}
                        className="btn-small btn-edit"
                        title="Edit"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => handleTogglePinned(event)}
                        className="btn-small btn-pin"
                        title={event.isPinned ? 'Unpin' : 'Pin'}
                      >
                        {event.isPinned ? '📍' : '📌'}
                      </button>
                      <button
                        onClick={() => handleToggleActive(event)}
                        className="btn-small btn-toggle"
                        title={event.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {event.isActive ? '⏸️' : '▶️'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(event.id)}
                        className="btn-small btn-delete"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-empty">
          <p>📅 No events found</p>
          <Link to="/admin/events/create" className="btn btn-primary">
            Create Your First Event
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Event?</h3>
            <p>Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeasonalEventsAdminPage;
