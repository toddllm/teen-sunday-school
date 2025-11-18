import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCoverageReport,
  getCoverageSummary,
  COVERAGE_STATUS_LABELS,
} from '../services/curriculumCoverageService';
import './CurriculumCoverageReportPage.css';

const CurriculumCoverageReportPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for reports and summaries
  const [coverageReport, setCoverageReport] = useState(null);
  const [coverageSummary, setCoverageSummary] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview'); // 'overview', 'by-quarter', 'by-group'

  // Filter state
  const [filters, setFilters] = useState({
    groupId: '',
    quarter: '',
    unit: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  // Groups list for filtering
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [reportData, summaryData] = await Promise.all([
        getCoverageReport(filters),
        getCoverageSummary({
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
      ]);

      setCoverageReport(reportData);
      setCoverageSummary(summaryData);

      // Extract unique groups from summary
      if (summaryData?.coverageByGroup) {
        setGroups(summaryData.coverageByGroup);
      }
    } catch (err) {
      console.error('Error loading coverage data:', err);
      setError('Failed to load coverage data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      groupId: '',
      quarter: '',
      unit: '',
      status: '',
      startDate: '',
      endDate: '',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#4caf50';
      case 'IN_PROGRESS': return '#2196f3';
      case 'PLANNED': return '#ff9800';
      case 'SKIPPED': return '#757575';
      default: return '#757575';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && !coverageReport) {
    return (
      <div className="curriculum-coverage-page">
        <div className="loading">Loading curriculum coverage data...</div>
      </div>
    );
  }

  return (
    <div className="curriculum-coverage-page">
      <div className="page-header">
        <button onClick={() => navigate('/admin')} className="back-button">
          ← Back to Admin
        </button>
        <h1>Curriculum Coverage Report</h1>
        <p>Track lesson completion and curriculum progress across all groups</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Filters Section */}
      <div className="filters-card">
        <h2>Filters</h2>
        <div className="filters-grid">
          <div className="filter-item">
            <label>Group</label>
            <select
              value={filters.groupId}
              onChange={(e) => handleFilterChange('groupId', e.target.value)}
            >
              <option value="">All Groups</option>
              {groups.map(group => (
                <option key={group.groupId} value={group.groupId}>
                  {group.groupName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Quarter</label>
            <select
              value={filters.quarter}
              onChange={(e) => handleFilterChange('quarter', e.target.value)}
            >
              <option value="">All Quarters</option>
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Unit</label>
            <select
              value={filters.unit}
              onChange={(e) => handleFilterChange('unit', e.target.value)}
            >
              <option value="">All Units</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(unit => (
                <option key={unit} value={unit}>Unit {unit}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PLANNED">Planned</option>
              <option value="SKIPPED">Skipped</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-item">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={selectedTab === 'overview' ? 'active' : ''}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </button>
        <button
          className={selectedTab === 'by-quarter' ? 'active' : ''}
          onClick={() => setSelectedTab('by-quarter')}
        >
          By Quarter
        </button>
        <button
          className={selectedTab === 'by-group' ? 'active' : ''}
          onClick={() => setSelectedTab('by-group')}
        >
          By Group
        </button>
        <button
          className={selectedTab === 'details' ? 'active' : ''}
          onClick={() => setSelectedTab('details')}
        >
          Detailed Records
        </button>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && coverageReport && coverageSummary && (
        <div className="overview-tab">
          {/* Summary Cards */}
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-value">{coverageReport.statistics.totalLessons}</div>
              <div className="summary-label">Total Lessons</div>
            </div>

            <div className="summary-card completed">
              <div className="summary-value">{coverageReport.statistics.completedLessons}</div>
              <div className="summary-label">Completed</div>
            </div>

            <div className="summary-card planned">
              <div className="summary-value">{coverageReport.statistics.plannedLessons}</div>
              <div className="summary-label">Planned</div>
            </div>

            <div className="summary-card in-progress">
              <div className="summary-value">{coverageReport.statistics.inProgressLessons}</div>
              <div className="summary-label">In Progress</div>
            </div>

            <div className="summary-card coverage">
              <div className="summary-value">{coverageReport.statistics.coveragePercentage}%</div>
              <div className="summary-label">Coverage Rate</div>
            </div>

            <div className="summary-card">
              <div className="summary-value">{coverageSummary.totalGroups}</div>
              <div className="summary-label">Total Groups</div>
            </div>
          </div>

          {/* Attendance Stats */}
          {coverageSummary.avgAttendance > 0 && (
            <div className="attendance-card">
              <h2>Attendance</h2>
              <div className="attendance-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Attendance:</span>
                  <span className="stat-value">{coverageSummary.totalAttendance}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average per Session:</span>
                  <span className="stat-value">{coverageSummary.avgAttendance}</span>
                </div>
              </div>
            </div>
          )}

          {/* Coverage by Status */}
          <div className="chart-card">
            <h2>Coverage by Status</h2>
            <div className="chart-bars">
              {coverageSummary.coverageByStatus?.map(item => (
                <div key={item.status} className="bar-item">
                  <span className="bar-label">{COVERAGE_STATUS_LABELS[item.status]}</span>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(item.count / Math.max(...coverageSummary.coverageByStatus.map(s => s.count))) * 100}%`,
                        backgroundColor: getStatusColor(item.status)
                      }}
                    />
                    <span className="bar-value">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* By Quarter Tab */}
      {selectedTab === 'by-quarter' && coverageSummary && (
        <div className="by-quarter-tab">
          <h2>Coverage by Quarter</h2>
          {coverageSummary.quarterCoverage?.length === 0 ? (
            <p className="empty-state">No coverage data available</p>
          ) : (
            <div className="quarter-grid">
              {coverageSummary.quarterCoverage?.map(qc => (
                <div key={qc.quarter} className="quarter-card">
                  <h3>Quarter {qc.quarter}</h3>
                  <div className="quarter-stats">
                    <div className="progress-circle">
                      <svg viewBox="0 0 36 36" className="circular-chart">
                        <path
                          className="circle-bg"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="circle"
                          strokeDasharray={`${qc.coveragePercentage}, 100`}
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          style={{ stroke: getStatusColor('COMPLETED') }}
                        />
                        <text x="18" y="20.35" className="percentage">{qc.coveragePercentage}%</text>
                      </svg>
                    </div>
                    <div className="quarter-details">
                      <div className="detail-row">
                        <span>Total Lessons:</span>
                        <strong>{qc.totalLessons}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Completed:</span>
                        <strong>{qc.completedLessons}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Planned:</span>
                        <strong>{qc.plannedLessons}</strong>
                      </div>
                      <div className="detail-row">
                        <span>In Progress:</span>
                        <strong>{qc.inProgressLessons}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* By Group Tab */}
      {selectedTab === 'by-group' && coverageSummary && (
        <div className="by-group-tab">
          <h2>Coverage by Group</h2>
          {coverageSummary.coverageByGroup?.length === 0 ? (
            <p className="empty-state">No coverage data available</p>
          ) : (
            <div className="group-list">
              {coverageSummary.coverageByGroup?.map(group => (
                <div key={group.groupId} className="group-card">
                  <div className="group-header">
                    <h3>{group.groupName}</h3>
                    {group.grade && <span className="grade-badge">{group.grade}</span>}
                  </div>
                  <div className="group-stats">
                    <div className="stat-item">
                      <span className="stat-label">Lessons Tracked:</span>
                      <span className="stat-value">{group.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detailed Records Tab */}
      {selectedTab === 'details' && coverageReport && (
        <div className="details-tab">
          <h2>Detailed Coverage Records</h2>
          {coverageReport.coverageRecords?.length === 0 ? (
            <p className="empty-state">No coverage records found with current filters</p>
          ) : (
            <table className="coverage-table">
              <thead>
                <tr>
                  <th>Lesson</th>
                  <th>Group</th>
                  <th>Status</th>
                  <th>Scheduled</th>
                  <th>Completed</th>
                  <th>Attendees</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {coverageReport.coverageRecords?.map(record => {
                  const lesson = record.lessonGroup.lesson;
                  const group = record.lessonGroup.group;

                  return (
                    <tr key={record.id}>
                      <td>
                        <div className="lesson-info">
                          <strong>{lesson.title}</strong>
                          <div className="lesson-meta">
                            Q{lesson.quarter}/U{lesson.unit}/L{lesson.lessonNumber}
                          </div>
                          <div className="scripture">{lesson.scripture}</div>
                        </div>
                      </td>
                      <td>
                        <div className="group-info">
                          {group.name}
                          {group.grade && <span className="grade">{group.grade}</span>}
                        </div>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(record.status) }}
                        >
                          {COVERAGE_STATUS_LABELS[record.status]}
                        </span>
                      </td>
                      <td>{formatDate(record.scheduledDate)}</td>
                      <td>{formatDate(record.completedAt)}</td>
                      <td className="attendees">{record.attendeeCount || '-'}</td>
                      <td className="notes">{record.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default CurriculumCoverageReportPage;
