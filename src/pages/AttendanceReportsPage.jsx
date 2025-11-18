import React, { useState, useEffect } from 'react';
import { useAttendance } from '../contexts/AttendanceContext';
import './AttendanceReportsPage.css';

function AttendanceReportsPage() {
  const { getGroupStats, getDashboardOverview, dashboardData, loading } = useAttendance();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [stats, setStats] = useState(null);
  const [weeks, setWeeks] = useState(12);

  const groups = [
    { id: 'group1', name: 'Teen Group - Sunday 9am' },
    { id: 'group2', name: 'Teen Group - Sunday 11am' },
    { id: 'group3', name: 'Youth Small Group' },
  ];

  useEffect(() => {
    getDashboardOverview();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupStats();
    }
  }, [selectedGroup, weeks]);

  const loadGroupStats = async () => {
    const result = await getGroupStats(selectedGroup, weeks);
    if (result.success) {
      setStats(result.data);
    }
  };

  return (
    <div className="attendance-reports-page">
      <div className="container">
        <div className="page-header">
          <h1>📊 Attendance Reports</h1>
          <p>View attendance analytics and insights</p>
        </div>

        <div className="dashboard-summary">
          {dashboardData && (
            <>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-value">{dashboardData.summary.overallRate}%</div>
                  <div className="stat-label">Overall Attendance Rate</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-value">{dashboardData.summary.groupCount}</div>
                  <div className="stat-label">Active Groups</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚠️</div>
                <div className="stat-content">
                  <div className="stat-value">{dashboardData.summary.pendingFollowUpCount}</div>
                  <div className="stat-label">Pending Follow-Ups</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <div className="stat-value">{dashboardData.summary.patternsNeedingAttentionCount}</div>
                  <div className="stat-label">Need Attention</div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="filters">
          <div className="form-group">
            <label>Select Group</label>
            <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
              <option value="">-- All Groups --</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Time Period</label>
            <select value={weeks} onChange={(e) => setWeeks(parseInt(e.target.value))}>
              <option value={4}>Last 4 Weeks</option>
              <option value={8}>Last 8 Weeks</option>
              <option value={12}>Last 12 Weeks</option>
              <option value={26}>Last 6 Months</option>
            </select>
          </div>
        </div>

        {loading && <div className="loading">Loading statistics...</div>}

        {stats && !loading && (
          <div className="stats-container">
            <div className="stats-section">
              <h2>Overall Statistics</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{stats.overall.totalRecords}</span>
                  <span className="stat-text">Total Records</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.overall.totalPresent}</span>
                  <span className="stat-text">Present</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.overall.totalAbsent}</span>
                  <span className="stat-text">Absent</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.overall.totalExcused}</span>
                  <span className="stat-text">Excused</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.overall.totalLate}</span>
                  <span className="stat-text">Late</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.overall.attendanceRate.toFixed(1)}%</span>
                  <span className="stat-text">Attendance Rate</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.overall.uniqueStudents}</span>
                  <span className="stat-text">Students</span>
                </div>
              </div>
            </div>

            {stats.weekly && stats.weekly.length > 0 && (
              <div className="stats-section">
                <h2>Weekly Breakdown</h2>
                <div className="weekly-chart">
                  {stats.weekly.map(week => {
                    const rate = week.total > 0 ? ((week.present + week.late) / week.total * 100).toFixed(1) : 0;
                    return (
                      <div key={week.week} className="week-bar">
                        <div className="week-label">{week.week}</div>
                        <div className="week-data">
                          <div
                            className="week-progress"
                            style={{ width: `${rate}%` }}
                            title={`${rate}% attendance`}
                          ></div>
                        </div>
                        <div className="week-stats">
                          <span>{rate}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedGroup && !loading && (
          <div className="empty-state">
            <p>Select a group to view detailed statistics</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceReportsPage;
