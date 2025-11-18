import React, { createContext, useState, useContext, useEffect } from 'react';
import sessionDiagnostics from '../services/sessionDiagnosticsService';

const BugReportContext = createContext();

export const useBugReports = () => {
  const context = useContext(BugReportContext);
  if (!context) {
    throw new Error('useBugReports must be used within BugReportProvider');
  }
  return context;
};

export const BugReportProvider = ({ children }) => {
  const [bugReports, setBugReports] = useState([]);

  // Load bug reports from localStorage on mount
  useEffect(() => {
    try {
      const savedReports = localStorage.getItem('bugReports');
      if (savedReports) {
        setBugReports(JSON.parse(savedReports));
      }
    } catch (error) {
      console.error('Error loading bug reports:', error);
    }
  }, []);

  // Save bug reports to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('bugReports', JSON.stringify(bugReports));
    } catch (error) {
      console.error('Error saving bug reports:', error);
    }
  }, [bugReports]);

  /**
   * Submit a new bug report
   */
  const submitBugReport = (reportData) => {
    const newReport = {
      id: `bug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      title: reportData.title,
      description: reportData.description,
      category: reportData.category,
      severity: reportData.severity,
      stepsToReproduce: reportData.stepsToReproduce,
      expectedBehavior: reportData.expectedBehavior,
      actualBehavior: reportData.actualBehavior,
      userEmail: reportData.userEmail || 'anonymous',
      diagnostics: sessionDiagnostics.collectDiagnostics(),
      status: 'new',
      screenshot: reportData.screenshot || null
    };

    setBugReports(prev => [newReport, ...prev]);
    return newReport;
  };

  /**
   * Update bug report status
   */
  const updateBugReportStatus = (id, status) => {
    setBugReports(prev =>
      prev.map(report =>
        report.id === id ? { ...report, status, updatedAt: new Date().toISOString() } : report
      )
    );
  };

  /**
   * Delete a bug report
   */
  const deleteBugReport = (id) => {
    setBugReports(prev => prev.filter(report => report.id !== id));
  };

  /**
   * Get bug reports by status
   */
  const getBugReportsByStatus = (status) => {
    return bugReports.filter(report => report.status === status);
  };

  /**
   * Get bug report statistics
   */
  const getBugReportStats = () => {
    return {
      total: bugReports.length,
      new: bugReports.filter(r => r.status === 'new').length,
      inProgress: bugReports.filter(r => r.status === 'in-progress').length,
      resolved: bugReports.filter(r => r.status === 'resolved').length,
      closed: bugReports.filter(r => r.status === 'closed').length,
      byCategory: bugReports.reduce((acc, report) => {
        acc[report.category] = (acc[report.category] || 0) + 1;
        return acc;
      }, {}),
      bySeverity: bugReports.reduce((acc, report) => {
        acc[report.severity] = (acc[report.severity] || 0) + 1;
        return acc;
      }, {})
    };
  };

  /**
   * Export all bug reports as JSON
   */
  const exportBugReports = () => {
    const blob = new Blob([JSON.stringify(bugReports, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bug-reports-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Clear all bug reports
   */
  const clearAllBugReports = () => {
    if (window.confirm('Are you sure you want to delete all bug reports? This cannot be undone.')) {
      setBugReports([]);
    }
  };

  const value = {
    bugReports,
    submitBugReport,
    updateBugReportStatus,
    deleteBugReport,
    getBugReportsByStatus,
    getBugReportStats,
    exportBugReports,
    clearAllBugReports
  };

  return (
    <BugReportContext.Provider value={value}>
      {children}
    </BugReportContext.Provider>
  );
};
