import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessions } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';
import CheckInInterface from '../components/attendance/CheckInInterface';
import './AttendancePage.css';

export default function AttendancePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    fetchSession,
    currentSession,
    getSessionAttendance,
    markAttendance,
    getAttendanceReport,
    startSession,
    endSession,
  } = useSessions();

  const [attendance, setAttendance] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('check-in'); // 'check-in' or 'manage'

  // Determine if user is a leader
  const isLeader = user?.role === 'TEACHER' || user?.role === 'ORG_ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = await fetchSession(sessionId);
      const attendanceData = await getSessionAttendance(sessionId);
      const reportData = await getAttendanceReport(sessionId);

      setAttendance(attendanceData);
      setReport(reportData);
    } catch (err) {
      setError('Failed to load session data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (userId, status) => {
    try {
      await markAttendance(sessionId, userId, status);
      await loadSessionData(); // Reload data
    } catch (err) {
      console.error('Failed to mark attendance:', err);
      alert('Failed to mark attendance. Please try again.');
    }
  };

  const handleStartSession = async () => {
    try {
      await startSession(sessionId);
      await loadSessionData();
    } catch (err) {
      console.error('Failed to start session:', err);
      alert('Failed to start session. Please try again.');
    }
  };

  const handleEndSession = async () => {
    try {
      await endSession(sessionId);
      await loadSessionData();
    } catch (err) {
      console.error('Failed to end session:', err);
      alert('Failed to end session. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="attendance-page">
        <div className="loading">Loading session...</div>
      </div>
    );
  }

  if (error || !currentSession) {
    return (
      <div className="attendance-page">
        <div className="error-state">
          <h2>Session Not Found</h2>
          <p>{error || 'The session you are looking for does not exist.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/sessions')}>
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <button className="btn btn-text" onClick={() => navigate('/sessions')}>
          ← Back to Sessions
        </button>

        {isLeader && (
          <div className="header-actions">
            <div className="view-toggle">
              <button
                className={`btn ${viewMode === 'check-in' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('check-in')}
              >
                Check-In View
              </button>
              <button
                className={`btn ${viewMode === 'manage' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('manage')}
              >
                Manage Attendance
              </button>
            </div>

            {currentSession.status === 'SCHEDULED' && (
              <button className="btn btn-success" onClick={handleStartSession}>
                Start Session
              </button>
            )}

            {currentSession.status === 'IN_PROGRESS' && (
              <button className="btn btn-warning" onClick={handleEndSession}>
                End Session
              </button>
            )}
          </div>
        )}
      </div>

      {viewMode === 'check-in' ? (
        <CheckInInterface session={currentSession} />
      ) : (
        <div className="attendance-management">
          <div className="session-header">
            <h1>{currentSession.title || 'Session Attendance'}</h1>
            <p className="session-meta">
              {currentSession.group?.name} •{' '}
              {new Date(currentSession.scheduledDate).toLocaleDateString()}
            </p>
          </div>

          {report && (
            <div className="attendance-stats">
              <div className="stat-card">
                <div className="stat-number">{report.totalMembers}</div>
                <div className="stat-label">Total Members</div>
              </div>
              <div className="stat-card success">
                <div className="stat-number">{report.presentCount}</div>
                <div className="stat-label">Present</div>
              </div>
              <div className="stat-card warning">
                <div className="stat-number">{report.lateCount}</div>
                <div className="stat-label">Late</div>
              </div>
              <div className="stat-card danger">
                <div className="stat-number">{report.absentCount}</div>
                <div className="stat-label">Absent</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{report.attendanceRate}%</div>
                <div className="stat-label">Attendance Rate</div>
              </div>
            </div>
          )}

          <div className="attendance-list">
            <h2>Group Members</h2>
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Check-In Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSession.group?.members?.map((member) => {
                  const userAttendance = attendance.find((a) => a.userId === member.userId);

                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="member-info">
                          <div className="member-name">
                            {member.user.firstName} {member.user.lastName}
                          </div>
                          {member.role !== 'member' && (
                            <span className="member-role">{member.role}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <select
                          className={`status-select status-${userAttendance?.status?.toLowerCase() || 'absent'}`}
                          value={userAttendance?.status || 'ABSENT'}
                          onChange={(e) => handleMarkAttendance(member.userId, e.target.value)}
                        >
                          <option value="PRESENT">Present</option>
                          <option value="LATE">Late</option>
                          <option value="ABSENT">Absent</option>
                          <option value="EXCUSED">Excused</option>
                        </select>
                      </td>
                      <td>
                        {userAttendance?.checkedInAt ? (
                          <span className="check-in-time">
                            {new Date(userAttendance.checkedInAt).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        ) : (
                          <span className="no-check-in">—</span>
                        )}
                      </td>
                      <td>
                        {userAttendance?.checkedInMethod === 'self' && (
                          <span className="method-badge">Self Check-In</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
