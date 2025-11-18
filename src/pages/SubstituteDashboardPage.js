import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import QuickStartPackage from '../components/substitute/QuickStartPackage';
import './SubstituteDashboardPage.css';

function SubstituteDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [todayAssignments, setTodayAssignments] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch today's assignments
      const todayResponse = await fetch('/api/substitute/assignments/today', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!todayResponse.ok) {
        throw new Error('Failed to fetch today assignments');
      }

      const todayData = await todayResponse.json();
      setTodayAssignments(todayData.assignments || []);

      // Fetch all upcoming assignments
      const upcomingResponse = await fetch('/api/substitute/assignments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!upcomingResponse.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const upcomingData = await upcomingResponse.json();
      const upcoming = (upcomingData.assignments || []).filter(a => {
        const assignmentDate = new Date(a.scheduledDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return assignmentDate > today;
      });
      setUpcomingAssignments(upcoming);

    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAssignment = async (assignmentId) => {
    try {
      const response = await fetch(`/api/substitute/assignments/${assignmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: 'ACCEPTED' })
      });

      if (!response.ok) {
        throw new Error('Failed to accept assignment');
      }

      alert('Assignment accepted!');
      fetchAssignments();
    } catch (err) {
      console.error('Error accepting assignment:', err);
      alert('Failed to accept assignment. Please try again.');
    }
  };

  const handleStartClass = async (assignmentId) => {
    try {
      const response = await fetch(`/api/substitute/assignments/${assignmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: 'IN_PROGRESS' })
      });

      if (!response.ok) {
        throw new Error('Failed to start class');
      }

      setSelectedAssignment(assignmentId);
    } catch (err) {
      console.error('Error starting class:', err);
      alert('Failed to start class. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="substitute-dashboard">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your assignments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedAssignment) {
    return (
      <QuickStartPackage
        assignmentId={selectedAssignment}
        onBack={() => setSelectedAssignment(null)}
        onComplete={() => {
          setSelectedAssignment(null);
          fetchAssignments();
        }}
      />
    );
  }

  return (
    <div className="substitute-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Substitute Teacher Quick-Start</h1>
            <p className="welcome-text">
              Welcome, {user?.firstName}! Here's everything you need for a smooth class.
            </p>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={fetchAssignments} className="btn btn-sm">
              Retry
            </button>
          </div>
        )}

        {todayAssignments.length === 0 && upcomingAssignments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h2>No Assignments Yet</h2>
            <p>You don't have any substitute teaching assignments at the moment.</p>
            <p className="text-muted">
              When you're scheduled to substitute, your assignments will appear here.
            </p>
          </div>
        ) : (
          <>
            {todayAssignments.length > 0 && (
              <section className="today-section">
                <div className="section-header">
                  <h2>Today's Classes</h2>
                  <span className="badge badge-primary">{todayAssignments.length}</span>
                </div>

                <div className="assignments-grid">
                  {todayAssignments.map(assignment => (
                    <div key={assignment.id} className="assignment-card today">
                      <div className="assignment-header">
                        <div className="assignment-time">
                          <span className="time-label">Today</span>
                          {assignment.scheduledDate && (
                            <span className="time-value">{formatTime(assignment.scheduledDate)}</span>
                          )}
                        </div>
                        <span className={`status-badge status-${assignment.status.toLowerCase()}`}>
                          {assignment.status}
                        </span>
                      </div>

                      <div className="assignment-body">
                        <h3 className="group-name">Group Assignment</h3>
                        {assignment.notes && (
                          <div className="assignment-notes">
                            <strong>Notes:</strong> {assignment.notes}
                          </div>
                        )}
                      </div>

                      <div className="assignment-actions">
                        {assignment.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleAcceptAssignment(assignment.id)}
                            className="btn btn-secondary btn-block"
                          >
                            Accept Assignment
                          </button>
                        )}
                        {(assignment.status === 'ACCEPTED' || assignment.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => handleStartClass(assignment.id)}
                            className="btn btn-primary btn-block"
                          >
                            {assignment.status === 'IN_PROGRESS' ? 'Continue Class' : 'Start Class'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {upcomingAssignments.length > 0 && (
              <section className="upcoming-section">
                <div className="section-header">
                  <h2>Upcoming Assignments</h2>
                  <span className="badge badge-secondary">{upcomingAssignments.length}</span>
                </div>

                <div className="assignments-list">
                  {upcomingAssignments.map(assignment => (
                    <div key={assignment.id} className="assignment-row">
                      <div className="assignment-date">
                        <div className="date-day">
                          {new Date(assignment.scheduledDate).getDate()}
                        </div>
                        <div className="date-month">
                          {new Date(assignment.scheduledDate).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>

                      <div className="assignment-info">
                        <h4>{formatDate(assignment.scheduledDate)}</h4>
                        {assignment.scheduledDate && (
                          <p className="text-muted">{formatTime(assignment.scheduledDate)}</p>
                        )}
                      </div>

                      <div className="assignment-status">
                        <span className={`status-badge status-${assignment.status.toLowerCase()}`}>
                          {assignment.status}
                        </span>
                      </div>

                      <div className="assignment-action">
                        {assignment.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleAcceptAssignment(assignment.id)}
                            className="btn btn-sm btn-secondary"
                          >
                            Accept
                          </button>
                        )}
                        {assignment.status === 'ACCEPTED' && (
                          <button
                            onClick={() => setSelectedAssignment(assignment.id)}
                            className="btn btn-sm btn-outline"
                          >
                            Preview
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <div className="help-section">
          <div className="help-card">
            <h3>Need Help?</h3>
            <p>Contact your church administrator or the regular teacher for assistance.</p>
          </div>
          <div className="help-card">
            <h3>Quick Tips</h3>
            <ul>
              <li>Review materials 15 minutes before class</li>
              <li>Check emergency contacts in the quick-start package</li>
              <li>Use backup activities if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubstituteDashboardPage;
