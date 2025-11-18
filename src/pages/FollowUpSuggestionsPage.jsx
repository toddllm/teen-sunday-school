import React, { useState, useEffect } from 'react';
import { useAttendance } from '../contexts/AttendanceContext';
import './FollowUpSuggestionsPage.css';

function FollowUpSuggestionsPage() {
  const {
    getFollowUpSuggestions,
    updateFollowUpSuggestion,
    dismissFollowUpSuggestion,
    followUpSuggestions,
    loading,
  } = useAttendance();

  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [filterPriority, setFilterPriority] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [contactNotes, setContactNotes] = useState('');
  const [contactMethod, setContactMethod] = useState('');

  useEffect(() => {
    loadSuggestions();
  }, [filterStatus, filterPriority]);

  const loadSuggestions = () => {
    getFollowUpSuggestions(null, filterStatus || null, filterPriority || null);
  };

  const handleStatusChange = async (suggestionId, newStatus) => {
    const result = await updateFollowUpSuggestion(suggestionId, {
      status: newStatus,
    });

    if (result.success) {
      loadSuggestions();
    }
  };

  const handleContact = async (suggestionId) => {
    if (!contactMethod || !contactNotes) {
      alert('Please select a contact method and add notes');
      return;
    }

    const result = await updateFollowUpSuggestion(suggestionId, {
      status: 'CONTACTED',
      contactMethod,
      contactNotes,
      contactedAt: new Date().toISOString(),
    });

    if (result.success) {
      setSelectedSuggestion(null);
      setContactMethod('');
      setContactNotes('');
      loadSuggestions();
    }
  };

  const handleDismiss = async (suggestionId) => {
    if (window.confirm('Are you sure you want to dismiss this suggestion?')) {
      const result = await dismissFollowUpSuggestion(suggestionId);
      if (result.success) {
        loadSuggestions();
      }
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      URGENT: '#f44336',
      HIGH: '#ff9800',
      MEDIUM: '#2196f3',
      LOW: '#4caf50',
    };
    return colors[priority] || '#757575';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      CONSECUTIVE_ABSENCES: '🚨',
      LOW_ATTENDANCE_RATE: '📉',
      DECLINING_TREND: '⬇️',
      FIRST_TIME_ABSENCE: '👋',
      RETURNED_AFTER_ABSENCE: '👍',
      EXCESSIVE_LATE_ARRIVALS: '⏰',
      LONG_TERM_ABSENT: '⚠️',
    };
    return icons[category] || '📋';
  };

  return (
    <div className="follow-up-suggestions-page">
      <div className="container">
        <div className="page-header">
          <h1>💡 Follow-Up Suggestions</h1>
          <p>AI-generated suggestions for student outreach</p>
        </div>

        <div className="filters-bar">
          <div className="filter-group">
            <label>Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CONTACTED">Contacted</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority:</label>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="filter-stats">
            {followUpSuggestions.length} suggestions
          </div>
        </div>

        {loading && <div className="loading">Loading suggestions...</div>}

        {!loading && followUpSuggestions.length === 0 && (
          <div className="empty-state">
            <p>✓ No follow-up suggestions at this time!</p>
            <p className="empty-subtitle">All students are doing great.</p>
          </div>
        )}

        <div className="suggestions-list">
          {followUpSuggestions.map(suggestion => (
            <div key={suggestion.id} className="suggestion-card">
              <div className="suggestion-header">
                <div className="suggestion-info">
                  <span className="suggestion-icon">
                    {getCategoryIcon(suggestion.category)}
                  </span>
                  <div>
                    <h3>{suggestion.title}</h3>
                    <p className="student-name">
                      {suggestion.user?.firstName} {suggestion.user?.lastName}
                      {suggestion.group && <span className="group-badge">{suggestion.group.name}</span>}
                    </p>
                  </div>
                </div>
                <div className="suggestion-badges">
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(suggestion.priority) }}
                  >
                    {suggestion.priority}
                  </span>
                  <span className="status-badge status-{suggestion.status.toLowerCase()}">
                    {suggestion.status}
                  </span>
                </div>
              </div>

              <div className="suggestion-body">
                <p className="suggestion-description">{suggestion.description}</p>
                <div className="suggestion-action">
                  <strong>Suggested Action:</strong> {suggestion.suggestedAction}
                </div>
                <div className="suggestion-reason">
                  <strong>Reason:</strong> {suggestion.triggerReason}
                </div>
              </div>

              <div className="suggestion-actions">
                {suggestion.status === 'PENDING' && (
                  <>
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => setSelectedSuggestion(suggestion.id)}
                    >
                      📞 Record Contact
                    </button>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleStatusChange(suggestion.id, 'IN_PROGRESS')}
                    >
                      ⏳ Mark In Progress
                    </button>
                    <button
                      className="btn btn-outline btn-small"
                      onClick={() => handleDismiss(suggestion.id)}
                    >
                      ✗ Dismiss
                    </button>
                  </>
                )}

                {suggestion.status === 'IN_PROGRESS' && (
                  <>
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => setSelectedSuggestion(suggestion.id)}
                    >
                      📞 Record Contact
                    </button>
                    <button
                      className="btn btn-success btn-small"
                      onClick={() => handleStatusChange(suggestion.id, 'RESOLVED')}
                    >
                      ✓ Mark Resolved
                    </button>
                  </>
                )}
              </div>

              {selectedSuggestion === suggestion.id && (
                <div className="contact-form">
                  <h4>Record Contact</h4>
                  <div className="form-group">
                    <label>Contact Method:</label>
                    <select
                      value={contactMethod}
                      onChange={(e) => setContactMethod(e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      <option value="phone">Phone Call</option>
                      <option value="email">Email</option>
                      <option value="text">Text Message</option>
                      <option value="in-person">In Person</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Notes:</label>
                    <textarea
                      value={contactNotes}
                      onChange={(e) => setContactNotes(e.target.value)}
                      placeholder="What did you discuss? What was the outcome?"
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="form-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleContact(suggestion.id)}
                    >
                      Save Contact
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        setSelectedSuggestion(null);
                        setContactMethod('');
                        setContactNotes('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FollowUpSuggestionsPage;
