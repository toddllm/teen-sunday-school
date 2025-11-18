/**
 * Progress Service
 *
 * Provides API functions for cohort progress tracking, attendance, and analytics.
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Get authorization header with JWT token
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get overall progress for a group
 * @param {string} groupId - Group ID
 * @returns {Promise<Object>} Group progress data
 */
export const getGroupProgress = async (groupId) => {
  try {
    const response = await axios.get(`${API_URL}/groups/${groupId}/progress`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching group progress:', error);
    throw error;
  }
};

/**
 * Get progress for a specific lesson in a group
 * @param {string} groupId - Group ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Lesson progress data
 */
export const getLessonProgress = async (groupId, lessonId) => {
  try {
    const response = await axios.get(
      `${API_URL}/groups/${groupId}/lessons/${lessonId}/progress`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    throw error;
  }
};

/**
 * Get attendance records for a group
 * @param {string} groupId - Group ID
 * @param {Object} options - Query options { startDate, endDate, limit, offset }
 * @returns {Promise<Object>} Attendance data with pagination
 */
export const getGroupAttendance = async (groupId, options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);

    const response = await axios.get(
      `${API_URL}/groups/${groupId}/attendance?${params.toString()}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};

/**
 * Get progress timeline for a group
 * @param {string} groupId - Group ID
 * @param {Object} options - Query options { startDate, endDate }
 * @returns {Promise<Object>} Timeline data
 */
export const getProgressTimeline = async (groupId, options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);

    const response = await axios.get(
      `${API_URL}/groups/${groupId}/progress/timeline?${params.toString()}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching progress timeline:', error);
    throw error;
  }
};

/**
 * Get comprehensive analytics for a group
 * @param {string} groupId - Group ID
 * @param {Object} options - Query options { startDate, endDate }
 * @returns {Promise<Object>} Analytics data
 */
export const getGroupAnalytics = async (groupId, options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);

    const response = await axios.get(
      `${API_URL}/groups/${groupId}/analytics?${params.toString()}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

/**
 * Record lesson progress
 * @param {Object} progressData - Progress data { userId, lessonId, groupId, status, timeSpentMs, ... }
 * @returns {Promise<Object>} Created/updated progress record
 */
export const recordProgress = async (progressData) => {
  try {
    const response = await axios.post(`${API_URL}/progress`, progressData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error recording progress:', error);
    throw error;
  }
};

/**
 * Record attendance
 * @param {Object} attendanceData - Attendance data { userId, groupId, date, status, ... }
 * @returns {Promise<Object>} Created/updated attendance record
 */
export const recordAttendance = async (attendanceData) => {
  try {
    const response = await axios.post(`${API_URL}/attendance`, attendanceData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error recording attendance:', error);
    throw error;
  }
};

/**
 * Record attendance for multiple students (bulk operation)
 * @param {Array} attendanceRecords - Array of attendance data objects
 * @returns {Promise<Array>} Array of created/updated attendance records
 */
export const recordBulkAttendance = async (attendanceRecords) => {
  try {
    const promises = attendanceRecords.map((record) => recordAttendance(record));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error recording bulk attendance:', error);
    throw error;
  }
};

/**
 * Get progress for a specific student
 * @param {string} userId - User ID
 * @param {string} groupId - Optional group ID to filter by
 * @returns {Promise<Object>} Student progress data
 */
export const getStudentProgress = async (userId, groupId = null) => {
  try {
    const params = groupId ? `?groupId=${groupId}` : '';
    const response = await axios.get(`${API_URL}/students/${userId}/progress${params}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching student progress:', error);
    throw error;
  }
};

/**
 * Calculate completion rate percentage
 * @param {number} completed - Number of completed items
 * @param {number} total - Total number of items
 * @returns {number} Percentage (0-100)
 */
export const calculateCompletionRate = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100 * 100) / 100;
};

/**
 * Format milliseconds to human-readable duration
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration (e.g., "2h 30m" or "45m")
 */
export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds === 0) return '0m';

  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Get status display properties
 * @param {string} status - Status value
 * @returns {Object} { color, icon, label }
 */
export const getStatusDisplay = (status) => {
  const statusMap = {
    COMPLETED: { color: 'green', icon: '✓', label: 'Completed' },
    IN_PROGRESS: { color: 'blue', icon: '▪', label: 'In Progress' },
    NOT_STARTED: { color: 'gray', icon: '—', label: 'Not Started' },
    NEEDS_REVIEW: { color: 'orange', icon: '⚠', label: 'Needs Review' },
    PRESENT: { color: 'green', icon: '✓', label: 'Present' },
    ABSENT: { color: 'red', icon: '✗', label: 'Absent' },
    EXCUSED: { color: 'yellow', icon: '◎', label: 'Excused' },
  };

  return statusMap[status] || { color: 'gray', icon: '•', label: status };
};

/**
 * Group progress data by week
 * @param {Array} progressData - Array of progress records with completedAt dates
 * @returns {Object} Progress grouped by week
 */
export const groupByWeek = (progressData) => {
  const weeklyData = {};

  progressData.forEach((progress) => {
    if (!progress.completedAt) return;

    const date = new Date(progress.completedAt);
    const weekKey = getWeekKey(date);

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        week: weekKey,
        completions: 0,
        totalTimeMs: 0,
        lessons: new Set(),
        students: new Set(),
      };
    }

    weeklyData[weekKey].completions++;
    weeklyData[weekKey].totalTimeMs += progress.timeSpentMs || 0;
    weeklyData[weekKey].lessons.add(progress.lessonId);
    weeklyData[weekKey].students.add(progress.userId);
  });

  // Convert sets to counts
  return Object.values(weeklyData).map((week) => ({
    week: week.week,
    completions: week.completions,
    avgTimeMs: week.completions > 0 ? Math.round(week.totalTimeMs / week.completions) : 0,
    uniqueLessons: week.lessons.size,
    uniqueStudents: week.students.size,
  }));
};

/**
 * Get week key for a date (e.g., "2025-W03")
 * @param {Date} date - Date object
 * @returns {string} Week key
 */
const getWeekKey = (date) => {
  const year = date.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const numberOfDays = Math.floor((date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

/**
 * Export progress data to CSV format
 * @param {Array} progressData - Array of progress records
 * @param {string} filename - Filename for download
 */
export const exportToCSV = (progressData, filename = 'progress-export.csv') => {
  if (!progressData || progressData.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'Student Name',
    'Lesson',
    'Status',
    'Started At',
    'Completed At',
    'Time Spent',
    'Slides Viewed',
    'Games Played',
    'Score',
  ];

  // Convert data to CSV rows
  const rows = progressData.map((item) => [
    `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim(),
    item.lesson?.title || '',
    item.status,
    item.startedAt ? new Date(item.startedAt).toLocaleDateString() : '',
    item.completedAt ? new Date(item.completedAt).toLocaleDateString() : '',
    formatDuration(item.timeSpentMs),
    item.slidesViewed || 0,
    item.gamesPlayed || 0,
    item.score || '',
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export attendance data to CSV format
 * @param {Array} attendanceData - Array of attendance records
 * @param {string} filename - Filename for download
 */
export const exportAttendanceToCSV = (attendanceData, filename = 'attendance-export.csv') => {
  if (!attendanceData || attendanceData.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Define CSV headers
  const headers = ['Student Name', 'Date', 'Status', 'Lesson', 'Arrived At', 'Departed At', 'Notes'];

  // Convert data to CSV rows
  const rows = attendanceData.map((item) => [
    `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim(),
    new Date(item.date).toLocaleDateString(),
    item.status,
    item.lesson?.title || '',
    item.arrivedAt ? new Date(item.arrivedAt).toLocaleTimeString() : '',
    item.departedAt ? new Date(item.departedAt).toLocaleTimeString() : '',
    item.notes || '',
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
