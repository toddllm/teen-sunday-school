import React, { useState, useEffect } from 'react';
import { useAttendance } from '../contexts/AttendanceContext';
import { useAuth } from '../contexts/AuthContext';
import './AttendanceTrackingPage.css';

function AttendanceTrackingPage() {
  const { recordBulkAttendance, loading } = useAttendance();
  const { user } = useAuth();

  const [selectedGroup, setSelectedGroup] = useState('');
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [message, setMessage] = useState('');

  // Mock groups - in real app, fetch from API
  const groups = [
    { id: 'group1', name: 'Teen Group - Sunday 9am' },
    { id: 'group2', name: 'Teen Group - Sunday 11am' },
    { id: 'group3', name: 'Youth Small Group' },
  ];

  //Mock students - in real app, fetch from group members API
  const mockStudents = [
    { id: 'user1', firstName: 'John', lastName: 'Doe' },
    { id: 'user2', firstName: 'Jane', lastName: 'Smith' },
    { id: 'user3', firstName: 'Mike', lastName: 'Johnson' },
    { id: 'user4', firstName: 'Sarah', lastName: 'Williams' },
    { id: 'user5', firstName: 'Tom', lastName: 'Brown' },
  ];

  useEffect(() => {
    if (selectedGroup) {
      setStudents(mockStudents);
      setAttendanceData(
        mockStudents.map(student => ({
          userId: student.id,
          status: 'PRESENT',
          notes: '',
        }))
      );
    }
  }, [selectedGroup]);

  const handleStatusChange = (userId, status) => {
    setAttendanceData(prev =>
      prev.map(item =>
        item.userId === userId ? { ...item, status } : item
      )
    );
  };

  const handleNotesChange = (userId, notes) => {
    setAttendanceData(prev =>
      prev.map(item =>
        item.userId === userId ? { ...item, notes } : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const result = await recordBulkAttendance(
      selectedGroup,
      classDate,
      attendanceData
    );

    if (result.success) {
      setMessage('✓ Attendance recorded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(`✗ Error: ${result.error}`);
    }
  };

  return (
    <div className="attendance-tracking-page">
      <div className="container">
        <div className="page-header">
          <h1>📋 Record Attendance</h1>
          <p>Mark attendance for your group class</p>
        </div>

        {message && (
          <div className={`message ${message.startsWith('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="attendance-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="group">Select Group</label>
              <select
                id="group"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                required
              >
                <option value="">-- Select a Group --</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="classDate">Class Date</label>
              <input
                type="date"
                id="classDate"
                value={classDate}
                onChange={(e) => setClassDate(e.target.value)}
                required
              />
            </div>
          </div>

          {selectedGroup && students.length > 0 && (
            <>
              <div className="students-table">
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => {
                      const attendance = attendanceData.find(a => a.userId === student.id);
                      return (
                        <tr key={student.id}>
                          <td className="student-name">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="status-cell">
                            <div className="status-buttons">
                              {['PRESENT', 'ABSENT', 'EXCUSED', 'LATE'].map(status => (
                                <button
                                  key={status}
                                  type="button"
                                  className={`status-btn status-${status.toLowerCase()} ${
                                    attendance?.status === status ? 'active' : ''
                                  }`}
                                  onClick={() => handleStatusChange(student.id, status)}
                                >
                                  {status === 'PRESENT' && '✓'}
                                  {status === 'ABSENT' && '✗'}
                                  {status === 'EXCUSED' && '~'}
                                  {status === 'LATE' && '⏰'}
                                  <span>{status}</span>
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="notes-cell">
                            <input
                              type="text"
                              placeholder="Optional notes..."
                              value={attendance?.notes || ''}
                              onChange={(e) => handleNotesChange(student.id, e.target.value)}
                              className="notes-input"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-large"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </>
          )}

          {selectedGroup && students.length === 0 && (
            <div className="empty-state">
              <p>No students found in this group.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default AttendanceTrackingPage;
