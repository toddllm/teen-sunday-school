import React, { createContext, useContext, useState, useEffect } from 'react';

const CommentContext = createContext();

export const useComments = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useComments must be used within a CommentProvider');
  }
  return context;
};

export const CommentProvider = ({ children }) => {
  const [comments, setComments] = useState([]);
  const [reports, setReports] = useState([]);
  const [moderationActions, setModerationActions] = useState([]);

  useEffect(() => {
    loadComments();
    loadReports();
    loadModerationActions();
  }, []);

  const loadComments = () => {
    try {
      const storedComments = localStorage.getItem('sunday-school-comments');
      if (storedComments) {
        setComments(JSON.parse(storedComments));
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadReports = () => {
    try {
      const storedReports = localStorage.getItem('sunday-school-comment-reports');
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadModerationActions = () => {
    try {
      const storedActions = localStorage.getItem('sunday-school-moderation-actions');
      if (storedActions) {
        setModerationActions(JSON.parse(storedActions));
      } else {
        setModerationActions([]);
      }
    } catch (error) {
      console.error('Error loading moderation actions:', error);
    }
  };

  // Comment operations
  const addComment = (lessonId, userId, userName, content, parentId = null) => {
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lessonId,
      userId,
      userName,
      content,
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      isDeleted: false,
      moderationStatus: 'approved',
      replies: []
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    localStorage.setItem('sunday-school-comments', JSON.stringify(updatedComments));
    return newComment;
  };

  const updateComment = (commentId, content) => {
    const updatedComments = comments.map(comment =>
      comment.id === commentId
        ? { ...comment, content, updatedAt: new Date().toISOString() }
        : comment
    );
    setComments(updatedComments);
    localStorage.setItem('sunday-school-comments', JSON.stringify(updatedComments));
  };

  const deleteComment = (commentId) => {
    const updatedComments = comments.map(comment =>
      comment.id === commentId
        ? { ...comment, isDeleted: true, content: '[Comment deleted]', updatedAt: new Date().toISOString() }
        : comment
    );
    setComments(updatedComments);
    localStorage.setItem('sunday-school-comments', JSON.stringify(updatedComments));
  };

  const likeComment = (commentId) => {
    const updatedComments = comments.map(comment =>
      comment.id === commentId
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    );
    setComments(updatedComments);
    localStorage.setItem('sunday-school-comments', JSON.stringify(updatedComments));
  };

  const getCommentsByLesson = (lessonId) => {
    return comments
      .filter(comment => comment.lessonId === lessonId && !comment.parentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getReplies = (commentId) => {
    return comments
      .filter(comment => comment.parentId === commentId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  // Report operations
  const reportComment = (commentId, reportedByUserId, reportedByUserName, reason, description = '') => {
    const newReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      commentId,
      reportedByUserId,
      reportedByUserName,
      reason, // spam, abuse, off-topic, inappropriate
      description,
      createdAt: new Date().toISOString(),
      status: 'pending', // pending, reviewed, resolved, dismissed
      reviewedAt: null,
      reviewedBy: null,
      resolution: null
    };

    const updatedReports = [...reports, newReport];
    setReports(updatedReports);
    localStorage.setItem('sunday-school-comment-reports', JSON.stringify(updatedReports));
    return newReport;
  };

  const updateReportStatus = (reportId, status, reviewedBy, resolution = null) => {
    const updatedReports = reports.map(report =>
      report.id === reportId
        ? {
            ...report,
            status,
            reviewedAt: new Date().toISOString(),
            reviewedBy,
            resolution
          }
        : report
    );
    setReports(updatedReports);
    localStorage.setItem('sunday-school-comment-reports', JSON.stringify(updatedReports));
  };

  const getReportsByStatus = (status) => {
    return reports
      .filter(report => report.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getReportsByComment = (commentId) => {
    return reports.filter(report => report.commentId === commentId);
  };

  const getAllReports = () => {
    return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getReportsByScopeForLeader = (groupId) => {
    // Filter reports to only show comments from users in the leader's group
    // This would require cross-referencing with user data
    // For now, return all reports
    return getAllReports();
  };

  // Moderation action operations
  const addModerationAction = (reportId, commentId, actionType, moderatorId, moderatorName, reason) => {
    const newAction = {
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      reportId,
      commentId,
      actionType, // delete_comment, warn_user, mute_user, ban_user, dismiss_report, mark_resolved
      moderatorId,
      moderatorName,
      reason,
      createdAt: new Date().toISOString()
    };

    const updatedActions = [...moderationActions, newAction];
    setModerationActions(updatedActions);
    localStorage.setItem('sunday-school-moderation-actions', JSON.stringify(updatedActions));
    return newAction;
  };

  const getActionsByComment = (commentId) => {
    return moderationActions
      .filter(action => action.commentId === commentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getActionsByModerator = (moderatorId) => {
    return moderationActions
      .filter(action => action.moderatorId === moderatorId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getAllActions = () => {
    return moderationActions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // Analytics
  const getReportStatistics = () => {
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'pending').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    const dismissed = reports.filter(r => r.status === 'dismissed').length;

    // Average resolution time (for resolved reports)
    const resolvedReports = reports.filter(r => r.status === 'resolved' && r.reviewedAt);
    let avgResolutionTime = 0;
    if (resolvedReports.length > 0) {
      const totalTime = resolvedReports.reduce((sum, report) => {
        const created = new Date(report.createdAt);
        const reviewed = new Date(report.reviewedAt);
        return sum + (reviewed - created);
      }, 0);
      avgResolutionTime = totalTime / resolvedReports.length;
    }

    // Reason breakdown
    const reasonCounts = reports.reduce((acc, report) => {
      acc[report.reason] = (acc[report.reason] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      pending,
      resolved,
      dismissed,
      avgResolutionTimeMs: avgResolutionTime,
      avgResolutionTimeHours: avgResolutionTime / (1000 * 60 * 60),
      reasonCounts
    };
  };

  const getRepeatOffenders = () => {
    // Count reports per user
    const userReportCounts = {};

    reports.forEach(report => {
      const comment = comments.find(c => c.id === report.commentId);
      if (comment && !comment.isDeleted) {
        const userId = comment.userId;
        userReportCounts[userId] = userReportCounts[userId] || {
          userId,
          userName: comment.userName,
          reportCount: 0,
          comments: []
        };
        userReportCounts[userId].reportCount += 1;
        if (!userReportCounts[userId].comments.includes(comment.id)) {
          userReportCounts[userId].comments.push(comment.id);
        }
      }
    });

    // Return users with more than 2 reports, sorted by count
    return Object.values(userReportCounts)
      .filter(user => user.reportCount >= 2)
      .sort((a, b) => b.reportCount - a.reportCount);
  };

  const value = {
    comments,
    reports,
    moderationActions,
    // Comment operations
    addComment,
    updateComment,
    deleteComment,
    likeComment,
    getCommentsByLesson,
    getReplies,
    // Report operations
    reportComment,
    updateReportStatus,
    getReportsByStatus,
    getReportsByComment,
    getAllReports,
    getReportsByScopeForLeader,
    // Moderation operations
    addModerationAction,
    getActionsByComment,
    getActionsByModerator,
    getAllActions,
    // Analytics
    getReportStatistics,
    getRepeatOffenders
  };

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
};
