import React, { useState, useEffect } from 'react';
import { useProgress } from '../contexts/ProgressContext';
import {
  getGroupProgress,
  getGroupAttendance,
  getProgressTimeline,
  calculateCompletionRate,
  formatDuration,
  getStatusDisplay,
  exportToCSV,
  exportAttendanceToCSV,
} from '../services/progressService';
import './CohortProgressTrackingPage.css';

function CohortProgressTrackingPage() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupProgress, setGroupProgress] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('overview'); // 'overview', 'progress', 'attendance'
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });

  // Mock groups data - in production, this would come from API/context
  const availableGroups = [
    { id: '1', name: '7th Grade', totalMembers: 20 },
    { id: '2', name: '8th Grade', totalMembers: 18 },
    { id: '3', name: '9th Grade', totalMembers: 22 },
  ];

  useEffect(() => {
    if (selectedGroup) {
      loadGroupData();
    }
  }, [selectedGroup]);

  const loadGroupData = async () => {
    if (!selectedGroup) return;

    setLoading(true);
    setError(null);

    try {
      const [progressData, attendanceData, timelineData] = await Promise.all([
        getGroupProgress(selectedGroup.id),
        getGroupAttendance(selectedGroup.id, dateFilter),
        getProgressTimeline(selectedGroup.id, dateFilter),
      ]);

      setGroupProgress(progressData);
      setAttendance(attendanceData.attendance || []);
      setTimeline(timelineData.timeline || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      console.error('Error loading group data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  const handleExportProgress = () => {
    if (groupProgress && groupProgress.progress) {
      exportToCSV(groupProgress.progress, `${selectedGroup.name}-progress.csv`);
    }
  };

  const handleExportAttendance = () => {
    if (attendance.length > 0) {
      exportAttendanceToCSV(attendance, `${selectedGroup.name}-attendance.csv`);
    }
  };

  const handleDateFilterChange = (field, value) => {
    setDateFilter((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyDateFilter = () => {
    loadGroupData();
  };

  const renderOverview = () => {
    if (!groupProgress) return null;

    const { group, stats, progress } = groupProgress;

    // Calculate additional stats
    const statusCounts = progress.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      },
      {}
    );

    // Group progress by lesson
    const lessonProgress = progress.reduce((acc, p) => {
      const lessonKey = `${p.lesson.quarter}-${p.lesson.unit}-${p.lesson.lessonNumber}`;
      if (!acc[lessonKey]) {
        acc[lessonKey] = {
          lesson: p.lesson,
          completed: 0,
          inProgress: 0,
          total: 0,
        };
      }
      acc[lessonKey].total++;
      if (p.status === 'COMPLETED') acc[lessonKey].completed++;
      if (p.status === 'IN_PROGRESS') acc[lessonKey].inProgress++;
      return acc;
    }, {});

    const lessonsList = Object.values(lessonProgress);

    return (
      <div className="overview-section">
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">{group.totalMembers}</div>
              <div className="stat-label">Total Students</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-number">{group.totalLessons}</div>
              <div className="stat-label">Total Lessons</div>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <div className="stat-number">{stats.completionRate}%</div>
              <div className="stat-label">Avg Completion</div>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon">⏱</div>
            <div className="stat-content">
              <div className="stat-number">{formatDuration(stats.avgTimeSpentMs)}</div>
              <div className="stat-label">Avg Time Spent</div>
            </div>
          </div>
        </div>

        <div className="progress-breakdown">
          <h3>Progress Breakdown</h3>
          <div className="breakdown-cards">
            <div className="breakdown-card completed">
              <div className="breakdown-label">Completed</div>
              <div className="breakdown-number">{statusCounts.COMPLETED || 0}</div>
            </div>
            <div className="breakdown-card in-progress">
              <div className="breakdown-label">In Progress</div>
              <div className="breakdown-number">{statusCounts.IN_PROGRESS || 0}</div>
            </div>
            <div className="breakdown-card not-started">
              <div className="breakdown-label">Not Started</div>
              <div className="breakdown-number">{statusCounts.NOT_STARTED || 0}</div>
            </div>
            <div className="breakdown-card needs-review">
              <div className="breakdown-label">Needs Review</div>
              <div className="breakdown-number">{statusCounts.NEEDS_REVIEW || 0}</div>
            </div>
          </div>
        </div>

        <div className="lessons-timeline">
          <div className="section-header">
            <h3>Lesson Progress Timeline</h3>
            <button className="btn btn-secondary" onClick={handleExportProgress}>
              Export CSV
            </button>
          </div>
          <div className="timeline-list">
            {lessonsList.map((item, idx) => {
              const completionRate = calculateCompletionRate(item.completed, group.totalMembers);
              return (
                <div key={idx} className="timeline-item">
                  <div className="timeline-lesson-info">
                    <div className="lesson-number">
                      Q{item.lesson.quarter}/U{item.lesson.unit}/L{item.lesson.lessonNumber}
                    </div>
                    <div className="lesson-title">{item.lesson.title}</div>
                  </div>
                  <div className="timeline-progress">
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <div className="progress-stats">
                      <span className="completion-rate">{completionRate}%</span>
                      <span className="completion-count">
                        {item.completed}/{group.totalMembers}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {timeline.length > 0 && (
          <div className="weekly-timeline">
            <h3>Weekly Progress Trend</h3>
            <div className="timeline-chart">
              {timeline.map((week, idx) => (
                <div key={idx} className="week-bar">
                  <div
                    className="bar-fill"
                    style={{
                      height: `${Math.min((week.completions / group.totalMembers) * 100, 100)}%`,
                    }}
                    title={`${week.completions} completions`}
                  />
                  <div className="week-label">{week.week}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProgressDetail = () => {
    if (!groupProgress) return null;

    const { progress, group } = groupProgress;

    // Group by student
    const studentProgress = progress.reduce((acc, p) => {
      const studentKey = p.userId;
      if (!acc[studentKey]) {
        acc[studentKey] = {
          user: p.user,
          lessons: [],
        };
      }
      acc[studentKey].lessons.push(p);
      return acc;
    }, {});

    return (
      <div className="progress-detail-section">
        <div className="section-header">
          <h3>Student Progress Details</h3>
          <button className="btn btn-secondary" onClick={handleExportProgress}>
            Export CSV
          </button>
        </div>
        <div className="progress-table-container">
          <table className="progress-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Completed</th>
                <th>In Progress</th>
                <th>Not Started</th>
                <th>Total Time</th>
                <th>Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(studentProgress).map((student, idx) => {
                const completed = student.lessons.filter((l) => l.status === 'COMPLETED').length;
                const inProgress = student.lessons.filter((l) => l.status === 'IN_PROGRESS')
                  .length;
                const notStarted = student.lessons.filter((l) => l.status === 'NOT_STARTED')
                  .length;
                const totalTime = student.lessons.reduce((sum, l) => sum + (l.timeSpentMs || 0), 0);
                const scores = student.lessons.filter((l) => l.score).map((l) => l.score);
                const avgScore =
                  scores.length > 0
                    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
                    : null;

                return (
                  <tr key={idx}>
                    <td className="student-name">
                      {student.user.firstName} {student.user.lastName}
                    </td>
                    <td className="status-completed">{completed}</td>
                    <td className="status-in-progress">{inProgress}</td>
                    <td className="status-not-started">{notStarted}</td>
                    <td>{formatDuration(totalTime)}</td>
                    <td>{avgScore !== null ? `${avgScore}%` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAttendance = () => {
    // Group attendance by date
    const attendanceByDate = attendance.reduce((acc, record) => {
      const dateKey = new Date(record.date).toLocaleDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(record);
      return acc;
    }, {});

    return (
      <div className="attendance-section">
        <div className="section-header">
          <h3>Attendance Records</h3>
          <button className="btn btn-secondary" onClick={handleExportAttendance}>
            Export CSV
          </button>
        </div>

        {Object.keys(attendanceByDate).length === 0 ? (
          <div className="empty-state">
            <p>No attendance records found for the selected date range.</p>
          </div>
        ) : (
          <div className="attendance-list">
            {Object.entries(attendanceByDate).map(([date, records]) => {
              const presentCount = records.filter((r) => r.status === 'PRESENT').length;
              const absentCount = records.filter((r) => r.status === 'ABSENT').length;
              const excusedCount = records.filter((r) => r.status === 'EXCUSED').length;

              return (
                <div key={date} className="attendance-date-group">
                  <div className="date-header">
                    <h4>{date}</h4>
                    <div className="attendance-summary">
                      <span className="present-count">✓ {presentCount}</span>
                      <span className="absent-count">✗ {absentCount}</span>
                      <span className="excused-count">◎ {excusedCount}</span>
                    </div>
                  </div>
                  <div className="attendance-records">
                    {records.map((record) => {
                      const statusDisplay = getStatusDisplay(record.status);
                      return (
                        <div key={record.id} className={`attendance-record ${statusDisplay.color}`}>
                          <div className="record-student">
                            <span className="status-icon">{statusDisplay.icon}</span>
                            {record.user.firstName} {record.user.lastName}
                          </div>
                          {record.lesson && (
                            <div className="record-lesson">{record.lesson.title}</div>
                          )}
                          {record.notes && <div className="record-notes">{record.notes}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="cohort-progress-page">
      <div className="container">
        <div className="page-header">
          <h1>Cohort Progress Tracking</h1>
          <p className="page-description">
            Track class completion, attendance, and engagement over time
          </p>
        </div>

        <div className="group-selector-section">
          <label htmlFor="group-select">Select Class/Cohort:</label>
          <select
            id="group-select"
            className="group-select"
            value={selectedGroup?.id || ''}
            onChange={(e) => {
              const group = availableGroups.find((g) => g.id === e.target.value);
              handleGroupSelect(group);
            }}
          >
            <option value="">-- Select a group --</option>
            {availableGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} ({group.totalMembers} students)
              </option>
            ))}
          </select>
        </div>

        {selectedGroup && (
          <>
            <div className="filter-section">
              <div className="date-filters">
                <div className="filter-group">
                  <label htmlFor="start-date">Start Date:</label>
                  <input
                    id="start-date"
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="end-date">End Date:</label>
                  <input
                    id="end-date"
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" onClick={applyDateFilter}>
                  Apply Filter
                </button>
              </div>
            </div>

            <div className="view-tabs">
              <button
                className={`tab ${view === 'overview' ? 'active' : ''}`}
                onClick={() => setView('overview')}
              >
                Overview
              </button>
              <button
                className={`tab ${view === 'progress' ? 'active' : ''}`}
                onClick={() => setView('progress')}
              >
                Progress Details
              </button>
              <button
                className={`tab ${view === 'attendance' ? 'active' : ''}`}
                onClick={() => setView('attendance')}
              >
                Attendance
              </button>
            </div>

            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading data...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p>{error}</p>
                <button className="btn btn-secondary" onClick={loadGroupData}>
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="content-section">
                {view === 'overview' && renderOverview()}
                {view === 'progress' && renderProgressDetail()}
                {view === 'attendance' && renderAttendance()}
              </div>
            )}
          </>
        )}

        {!selectedGroup && (
          <div className="empty-state">
            <p>Select a class/cohort to view progress tracking data.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CohortProgressTrackingPage;
