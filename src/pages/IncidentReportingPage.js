import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './IncidentReportingPage.css';

const IncidentReportingPage = () => {
  const navigate = useNavigate();
  const { user, isOrgAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Tab state
  const [selectedTab, setSelectedTab] = useState('submit'); // 'submit' or 'view'

  // Enums
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [severityLevels, setSeverityLevels] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // Form state for new incident
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    groupId: '',
    incidentType: '',
    severity: '',
    incidentDate: '',
    location: '',
    description: '',
    witnessNames: '',
    othersInvolved: '',
    isConfidential: true,
  });

  // Incidents list state (admin only)
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [updateData, setUpdateData] = useState({});

  // Groups for dropdown
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    loadEnums();
    loadGroups();
    loadStudents();
    if (isOrgAdmin()) {
      loadIncidents();
      loadStats();
    }
  }, []);

  const loadEnums = async () => {
    try {
      const response = await fetch('/api/incidents/enums', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load enums');

      const data = await response.json();
      setIncidentTypes(data.incidentTypes || []);
      setSeverityLevels(data.severityLevels || []);
      setStatuses(data.statuses || []);

      // Set default values
      if (data.incidentTypes.length > 0) {
        setFormData(prev => ({ ...prev, incidentType: data.incidentTypes[0].value }));
      }
      if (data.severityLevels.length > 0) {
        setFormData(prev => ({ ...prev, severity: data.severityLevels[0].value }));
      }
    } catch (err) {
      console.error('Error loading enums:', err);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await fetch('/api/groups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || data || []);
      }
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/users?role=MEMBER', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.users || data || []);
      }
    } catch (err) {
      console.error('Error loading students:', err);
    }
  };

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/incidents?limit=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load incidents');

      const data = await response.json();
      setIncidents(data.incidents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/incidents/stats?days=30', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.incidentType || !formData.severity || !formData.incidentDate || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit incident report');
      }

      setSuccess('Incident report submitted successfully!');

      // Reset form
      setFormData({
        studentName: '',
        studentId: '',
        groupId: '',
        incidentType: incidentTypes[0]?.value || '',
        severity: severityLevels[0]?.value || '',
        incidentDate: '',
        location: '',
        description: '',
        witnessNames: '',
        othersInvolved: '',
        isConfidential: true,
      });

      // Reload incidents if admin
      if (isOrgAdmin()) {
        loadIncidents();
        loadStats();
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateIncident = async (incidentId) => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update incident');
      }

      setSuccess('Incident updated successfully!');
      setSelectedIncident(null);
      setUpdateData({});
      loadIncidents();
      loadStats();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const getSeverityBadgeClass = (severity) => {
    const classes = {
      CRITICAL: 'severity-critical',
      HIGH: 'severity-high',
      MEDIUM: 'severity-medium',
      LOW: 'severity-low',
    };
    return classes[severity] || '';
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      PENDING: 'status-pending',
      ACKNOWLEDGED: 'status-acknowledged',
      IN_PROGRESS: 'status-in-progress',
      RESOLVED: 'status-resolved',
      ESCALATED: 'status-escalated',
    };
    return classes[status] || '';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="incident-reporting-page">
      <div className="page-header">
        <h1>Incident Reporting</h1>
        <p>Report and track behavior and wellbeing concerns</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess(null)} className="alert-close">×</button>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${selectedTab === 'submit' ? 'active' : ''}`}
          onClick={() => setSelectedTab('submit')}
        >
          Submit Report
        </button>
        {isOrgAdmin() && (
          <button
            className={`tab ${selectedTab === 'view' ? 'active' : ''}`}
            onClick={() => setSelectedTab('view')}
          >
            View Reports
          </button>
        )}
      </div>

      {selectedTab === 'submit' && (
        <div className="tab-content">
          <div className="incident-form-container">
            <h2>Submit Incident Report</h2>
            <form onSubmit={handleSubmit} className="incident-form">
              <div className="form-section">
                <h3>Student Information</h3>

                <div className="form-group">
                  <label htmlFor="studentId">Student (Optional)</label>
                  <select
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a student (or enter name below)</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="studentName">Student Name (if not in system)</label>
                  <input
                    type="text"
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    placeholder="Enter student name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="groupId">Group/Class</label>
                  <select
                    id="groupId"
                    name="groupId"
                    value={formData.groupId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a group</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h3>Incident Details</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="incidentType">Incident Type *</label>
                    <select
                      id="incidentType"
                      name="incidentType"
                      value={formData.incidentType}
                      onChange={handleInputChange}
                      required
                    >
                      {incidentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="severity">Severity *</label>
                    <select
                      id="severity"
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                      required
                    >
                      {severityLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="incidentDate">Incident Date/Time *</label>
                    <input
                      type="datetime-local"
                      id="incidentDate"
                      name="incidentDate"
                      value={formData.incidentDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Youth Room, Hallway"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="5"
                    required
                    placeholder="Describe what happened, including context and any relevant details..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="witnessNames">Witnesses</label>
                  <input
                    type="text"
                    id="witnessNames"
                    name="witnessNames"
                    value={formData.witnessNames}
                    onChange={handleInputChange}
                    placeholder="Names of any witnesses"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="othersInvolved">Others Involved</label>
                  <input
                    type="text"
                    id="othersInvolved"
                    name="othersInvolved"
                    value={formData.othersInvolved}
                    onChange={handleInputChange}
                    placeholder="Other students or individuals involved"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isConfidential"
                      checked={formData.isConfidential}
                      onChange={handleInputChange}
                    />
                    <span>Mark as confidential (recommended)</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTab === 'view' && isOrgAdmin() && (
        <div className="tab-content">
          <div className="incidents-view">
            <div className="view-header">
              <h2>Incident Reports</h2>
              {stats && (
                <div className="stats-summary">
                  <div className="stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total (30 days)</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.pending}</div>
                    <div className="stat-label">Pending</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.inProgress}</div>
                    <div className="stat-label">In Progress</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.critical + stats.high}</div>
                    <div className="stat-label">High Priority</div>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="loading">Loading incidents...</div>
            ) : incidents.length === 0 ? (
              <div className="empty-state">
                <p>No incident reports found.</p>
              </div>
            ) : (
              <div className="incidents-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Severity</th>
                      <th>Student</th>
                      <th>Group</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map(incident => (
                      <tr key={incident.id}>
                        <td>{new Date(incident.incidentDate).toLocaleDateString()}</td>
                        <td>{incident.incidentType}</td>
                        <td>
                          <span className={`badge ${getSeverityBadgeClass(incident.severity)}`}>
                            {incident.severity}
                          </span>
                        </td>
                        <td>
                          {incident.student
                            ? `${incident.student.firstName} ${incident.student.lastName}`
                            : incident.studentName || 'N/A'}
                        </td>
                        <td>{incident.group?.name || 'N/A'}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(incident.status)}`}>
                            {incident.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedIncident(incident)}
                            className="btn btn-small"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedIncident && (
            <div className="modal-overlay" onClick={() => setSelectedIncident(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Incident Report Details</h3>
                  <button onClick={() => setSelectedIncident(null)} className="modal-close">×</button>
                </div>
                <div className="modal-body">
                  <div className="incident-details">
                    <div className="detail-group">
                      <label>Incident Date:</label>
                      <span>{formatDate(selectedIncident.incidentDate)}</span>
                    </div>
                    <div className="detail-group">
                      <label>Reported:</label>
                      <span>{formatDate(selectedIncident.reportedAt)}</span>
                    </div>
                    <div className="detail-group">
                      <label>Type:</label>
                      <span>{selectedIncident.incidentType}</span>
                    </div>
                    <div className="detail-group">
                      <label>Severity:</label>
                      <span className={`badge ${getSeverityBadgeClass(selectedIncident.severity)}`}>
                        {selectedIncident.severity}
                      </span>
                    </div>
                    <div className="detail-group">
                      <label>Status:</label>
                      <span className={`badge ${getStatusBadgeClass(selectedIncident.status)}`}>
                        {selectedIncident.status}
                      </span>
                    </div>
                    <div className="detail-group">
                      <label>Location:</label>
                      <span>{selectedIncident.location || 'Not specified'}</span>
                    </div>
                    <div className="detail-group">
                      <label>Student:</label>
                      <span>
                        {selectedIncident.student
                          ? `${selectedIncident.student.firstName} ${selectedIncident.student.lastName}`
                          : selectedIncident.studentName || 'N/A'}
                      </span>
                    </div>
                    <div className="detail-group">
                      <label>Group:</label>
                      <span>{selectedIncident.group?.name || 'N/A'}</span>
                    </div>
                    <div className="detail-group full-width">
                      <label>Description:</label>
                      <p>{selectedIncident.description}</p>
                    </div>
                    {selectedIncident.witnessNames && (
                      <div className="detail-group full-width">
                        <label>Witnesses:</label>
                        <p>{selectedIncident.witnessNames}</p>
                      </div>
                    )}
                    {selectedIncident.leaderNotes && (
                      <div className="detail-group full-width">
                        <label>Leader Notes:</label>
                        <p>{selectedIncident.leaderNotes}</p>
                      </div>
                    )}
                    {selectedIncident.actionTaken && (
                      <div className="detail-group full-width">
                        <label>Action Taken:</label>
                        <p>{selectedIncident.actionTaken}</p>
                      </div>
                    )}
                  </div>

                  <div className="update-section">
                    <h4>Update Incident</h4>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={updateData.status || selectedIncident.status}
                        onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                      >
                        {statuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Leader Notes</label>
                      <textarea
                        rows="3"
                        value={updateData.leaderNotes || selectedIncident.leaderNotes || ''}
                        onChange={(e) => setUpdateData({ ...updateData, leaderNotes: e.target.value })}
                        placeholder="Add notes about follow-up actions..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Action Taken</label>
                      <textarea
                        rows="3"
                        value={updateData.actionTaken || selectedIncident.actionTaken || ''}
                        onChange={(e) => setUpdateData({ ...updateData, actionTaken: e.target.value })}
                        placeholder="Describe actions taken..."
                      />
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={updateData.parentNotified ?? selectedIncident.parentNotified}
                          onChange={(e) => setUpdateData({
                            ...updateData,
                            parentNotified: e.target.checked,
                            parentNotifiedAt: e.target.checked ? new Date().toISOString() : null
                          })}
                        />
                        <span>Parent/Guardian Notified</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleUpdateIncident(selectedIncident.id)}
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IncidentReportingPage;
