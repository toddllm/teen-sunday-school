import React, { useState, useEffect } from 'react';
import { useSessions } from '../../contexts/SessionContext';
import { useAuth } from '../../contexts/AuthContext';
import './CheckInInterface.css';

export default function CheckInInterface({ session }) {
  const { checkIn, getSessionAttendance } = useSessions();
  const { user } = useAuth();
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Check if user is already checked in
  useEffect(() => {
    const checkIfCheckedIn = async () => {
      try {
        const attendance = await getSessionAttendance(session.id);
        const userAttendance = attendance.find(a => a.userId === user.id);
        if (userAttendance) {
          setCheckedIn(true);
        }
      } catch (err) {
        console.error('Failed to check attendance status:', err);
      }
    };

    if (session && user) {
      checkIfCheckedIn();
    }
  }, [session, user, getSessionAttendance]);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      await checkIn(session.id);
      setCheckedIn(true);
      setSuccessMessage('Successfully checked in!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if check-in is open
  const isCheckInOpen = () => {
    if (!session.checkInEnabled) return false;
    if (session.status !== 'IN_PROGRESS' && session.status !== 'SCHEDULED') return false;

    const now = new Date();

    if (session.checkInOpensAt && new Date(session.checkInOpensAt) > now) {
      return false;
    }

    if (session.checkInClosesAt && new Date(session.checkInClosesAt) < now) {
      return false;
    }

    return true;
  };

  const checkInOpen = isCheckInOpen();

  return (
    <div className="check-in-interface">
      <div className="check-in-header">
        <h2>Check-In</h2>
        <div className={`status-badge ${session.status.toLowerCase()}`}>
          {session.status.replace('_', ' ')}
        </div>
      </div>

      {session.title && (
        <div className="session-info">
          <h3>{session.title}</h3>
          <p className="session-date">
            {new Date(session.scheduledDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      )}

      <div className="check-in-content">
        {checkedIn ? (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h3>You're Checked In!</h3>
            <p>Thanks for being here today</p>
          </div>
        ) : checkInOpen ? (
          <div className="check-in-available">
            <div className="check-in-prompt">
              <h3>Check-in is Open</h3>
              <p>Tap the button below to mark your attendance</p>
            </div>

            <button
              className="btn btn-primary btn-large check-in-button"
              onClick={handleCheckIn}
              disabled={loading}
            >
              {loading ? 'Checking In...' : "I'm Here!"}
            </button>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success">
                {successMessage}
              </div>
            )}
          </div>
        ) : (
          <div className="check-in-closed">
            <div className="closed-icon">🔒</div>
            <h3>Check-In Not Available</h3>
            <p>
              {session.status === 'COMPLETED'
                ? 'This session has ended'
                : session.status === 'CANCELLED'
                ? 'This session was cancelled'
                : 'Check-in is not currently open'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
