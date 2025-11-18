import React, { useState, useMemo } from 'react';
import { useComments } from '../contexts/CommentContext';
import { useUser } from '../contexts/UserContext';
import { useLessons } from '../contexts/LessonContext';
import { useNavigate } from 'react-router-dom';
import './ModerationPage.css';

const ModerationPage = () => {
  const navigate = useNavigate();
  const {
    getAllReports,
    updateReportStatus,
    addModerationAction,
    deleteComment,
    comments,
    getReportStatistics,
    getRepeatOffenders,
    getAllActions
  } = useComments();
  const { currentUser, isAdmin, isLeader, muteUser, banUser } = useUser();
  const { lessons } = useLessons();
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterReason, setFilterReason] = useState('all');

  // Get all data before conditional return
  const allReports = getAllReports();
  const statistics = getReportStatistics();
  const repeatOffenders = getRepeatOffenders();
  const recentActions = getAllActions().slice(0, 10);

  // Filter reports
  const filteredReports = useMemo(() => {
    return allReports.filter(report => {
      const statusMatch = filterStatus === 'all' || report.status === filterStatus;
      const reasonMatch = filterReason === 'all' || report.reason === filterReason;
      return statusMatch && reasonMatch;
    });
  }, [allReports, filterStatus, filterReason]);

  // Check permissions (after all hooks)
  if (!currentUser || (!isAdmin() && !isLeader())) {
    return (
      <div className="moderation-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need moderator or admin privileges to access this page.</p>
          <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  const handleTakeAction = (reportId, commentId, actionType, userId = null) => {
    const report = allReports.find(r => r.id === reportId);
    if (!report) return;

    let reason = prompt('Please provide a reason for this action:');
    if (!reason) return;

    // Perform the action
    switch (actionType) {
      case 'delete_comment':
        deleteComment(commentId);
        updateReportStatus(reportId, 'resolved', currentUser.id, 'Comment deleted');
        addModerationAction(reportId, commentId, actionType, currentUser.id, currentUser.name, reason);
        alert('Comment deleted successfully.');
        break;

      case 'mute_user':
        if (userId) {
          muteUser(userId, reason);
          updateReportStatus(reportId, 'resolved', currentUser.id, 'User muted');
          addModerationAction(reportId, commentId, actionType, currentUser.id, currentUser.name, reason);
          alert('User muted successfully.');
        }
        break;

      case 'ban_user':
        if (userId) {
          if (window.confirm('Are you sure you want to ban this user? This is a serious action.')) {
            banUser(userId, reason);
            updateReportStatus(reportId, 'resolved', currentUser.id, 'User banned');
            addModerationAction(reportId, commentId, actionType, currentUser.id, currentUser.name, reason);
            alert('User banned successfully.');
          }
        }
        break;

      case 'dismiss_report':
        updateReportStatus(reportId, 'dismissed', currentUser.id, 'Report dismissed - no violation found');
        addModerationAction(reportId, commentId, actionType, currentUser.id, currentUser.name, reason);
        alert('Report dismissed.');
        break;

      case 'warn_user':
        if (userId) {
          updateReportStatus(reportId, 'resolved', currentUser.id, 'User warned');
          addModerationAction(reportId, commentId, actionType, currentUser.id, currentUser.name, reason);
          alert('Warning issued to user.');
        }
        break;

      default:
        break;
    }

    setSelectedReport(null);
  };

  const getComment = (commentId) => {
    return comments.find(c => c.id === commentId);
  };

  const getLesson = (lessonId) => {
    return lessons.find(l => l.id === lessonId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getReasonColor = (reason) => {
    const colors = {
      spam: '#ff9800',
      abuse: '#f44336',
      'off-topic': '#2196F3',
      inappropriate: '#9c27b0'
    };
    return colors[reason] || '#666';
  };

  return (
    <div className="moderation-page">
      <div className="moderation-header">
        <h1>Comment Moderation</h1>
        <p className="moderation-subtitle">
          Manage reported comments and maintain healthy discussions
        </p>
      </div>

      {/* Statistics Dashboard */}
      <div className="moderation-stats">
        <div className="stat-card">
          <div className="stat-value">{statistics.pending}</div>
          <div className="stat-label">Pending Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{statistics.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{statistics.dismissed}</div>
          <div className="stat-label">Dismissed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {statistics.avgResolutionTimeHours > 0
              ? `${statistics.avgResolutionTimeHours.toFixed(1)}h`
              : 'N/A'}
          </div>
          <div className="stat-label">Avg Resolution Time</div>
        </div>
      </div>

      {/* Filters */}
      <div className="moderation-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Reason:</label>
          <select value={filterReason} onChange={(e) => setFilterReason(e.target.value)}>
            <option value="all">All</option>
            <option value="spam">Spam</option>
            <option value="abuse">Abuse</option>
            <option value="off-topic">Off-topic</option>
            <option value="inappropriate">Inappropriate</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="moderation-content">
        <div className="reports-section">
          <h2>Reported Comments ({filteredReports.length})</h2>
          {filteredReports.length === 0 ? (
            <div className="no-reports">
              <p>No reports match the current filters.</p>
            </div>
          ) : (
            <div className="reports-list">
              {filteredReports.map(report => {
                const comment = getComment(report.commentId);
                const lesson = comment ? getLesson(comment.lessonId) : null;

                return (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <span
                        className="report-reason-badge"
                        style={{ backgroundColor: getReasonColor(report.reason) }}
                      >
                        {report.reason}
                      </span>
                      <span className="report-status">{report.status}</span>
                      <span className="report-date">{formatDate(report.createdAt)}</span>
                    </div>

                    <div className="report-content">
                      <div className="report-info">
                        <strong>Reported by:</strong> {report.reportedByUserName}
                      </div>
                      {report.description && (
                        <div className="report-info">
                          <strong>Description:</strong> {report.description}
                        </div>
                      )}
                      {lesson && (
                        <div className="report-info">
                          <strong>Lesson:</strong> {lesson.title}
                        </div>
                      )}
                    </div>

                    {comment && (
                      <div className="reported-comment">
                        <div className="comment-meta">
                          <strong>{comment.userName}</strong> commented:
                        </div>
                        <div className="comment-text">{comment.content}</div>
                      </div>
                    )}

                    {report.status === 'pending' && (
                      <div className="report-actions">
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleTakeAction(report.id, report.commentId, 'delete_comment')}
                        >
                          Delete Comment
                        </button>
                        <button
                          className="action-btn warn-btn"
                          onClick={() => handleTakeAction(report.id, report.commentId, 'warn_user', comment?.userId)}
                        >
                          Warn User
                        </button>
                        <button
                          className="action-btn mute-btn"
                          onClick={() => handleTakeAction(report.id, report.commentId, 'mute_user', comment?.userId)}
                        >
                          Mute User
                        </button>
                        {isAdmin() && (
                          <button
                            className="action-btn ban-btn"
                            onClick={() => handleTakeAction(report.id, report.commentId, 'ban_user', comment?.userId)}
                          >
                            Ban User
                          </button>
                        )}
                        <button
                          className="action-btn dismiss-btn"
                          onClick={() => handleTakeAction(report.id, report.commentId, 'dismiss_report')}
                        >
                          Dismiss Report
                        </button>
                      </div>
                    )}

                    {report.status !== 'pending' && report.resolution && (
                      <div className="report-resolution">
                        <strong>Resolution:</strong> {report.resolution}
                        <br />
                        <small>Reviewed by: {report.reviewedBy} on {formatDate(report.reviewedAt)}</small>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="moderation-sidebar">
          {/* Repeat Offenders */}
          {repeatOffenders.length > 0 && (
            <div className="sidebar-section">
              <h3>Repeat Offenders</h3>
              <div className="offenders-list">
                {repeatOffenders.map(offender => (
                  <div key={offender.userId} className="offender-item">
                    <div className="offender-name">{offender.userName}</div>
                    <div className="offender-count">{offender.reportCount} reports</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Actions */}
          <div className="sidebar-section">
            <h3>Recent Actions</h3>
            <div className="actions-list">
              {recentActions.length === 0 ? (
                <p className="no-actions">No moderation actions yet.</p>
              ) : (
                recentActions.map(action => (
                  <div key={action.id} className="action-item">
                    <div className="action-type">{action.actionType.replace(/_/g, ' ')}</div>
                    <div className="action-by">by {action.moderatorName}</div>
                    <div className="action-date">{formatDate(action.createdAt)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reason Breakdown */}
          <div className="sidebar-section">
            <h3>Reports by Reason</h3>
            <div className="reason-breakdown">
              {Object.entries(statistics.reasonCounts).map(([reason, count]) => (
                <div key={reason} className="reason-item">
                  <span className="reason-name">{reason}</span>
                  <span className="reason-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationPage;
