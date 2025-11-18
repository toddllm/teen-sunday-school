/**
 * Curriculum Coverage Service
 *
 * Provides API functions for curriculum coverage reporting and tracking.
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Get authorization header with JWT token
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Record curriculum coverage (mark a lesson as completed/planned)
 * @param {Object} coverageData - Coverage data { lessonId, groupId, status, completedAt, scheduledDate, attendeeCount, notes }
 * @returns {Promise<Object>} Created coverage record
 */
export const recordCoverage = async (coverageData) => {
  try {
    const response = await axios.post(
      `${API_URL}/curriculum-coverage`,
      coverageData,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error recording coverage:', error);
    throw error;
  }
};

/**
 * Update a coverage record
 * @param {string} coverageId - Coverage record ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated coverage record
 */
export const updateCoverage = async (coverageId, updates) => {
  try {
    const response = await axios.patch(
      `${API_URL}/curriculum-coverage/${coverageId}`,
      updates,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating coverage:', error);
    throw error;
  }
};

/**
 * Delete a coverage record
 * @param {string} coverageId - Coverage record ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteCoverage = async (coverageId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/curriculum-coverage/${coverageId}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error deleting coverage:', error);
    throw error;
  }
};

/**
 * Get curriculum coverage report
 * @param {Object} filters - Optional filters { groupId, quarter, unit, status, startDate, endDate }
 * @returns {Promise<Object>} Coverage report with statistics
 */
export const getCoverageReport = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.groupId) {
      params.append('groupId', filters.groupId);
    }
    if (filters.quarter) {
      params.append('quarter', filters.quarter.toString());
    }
    if (filters.unit) {
      params.append('unit', filters.unit.toString());
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }

    const response = await axios.get(
      `${API_URL}/curriculum-coverage/report?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching coverage report:', error);
    throw error;
  }
};

/**
 * Get aggregated coverage summary
 * @param {Object} options - Query options { startDate, endDate }
 * @returns {Promise<Object>} Coverage summary with aggregated stats
 */
export const getCoverageSummary = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.startDate) {
      params.append('startDate', options.startDate);
    }
    if (options.endDate) {
      params.append('endDate', options.endDate);
    }

    const response = await axios.get(
      `${API_URL}/curriculum-coverage/summary?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching coverage summary:', error);
    throw error;
  }
};

/**
 * Record a report view for metrics
 * @param {Object} viewData - View metadata { reportType, reportParams, timeSpentMs, exportFormat }
 * @returns {Promise<Object>} Result
 */
export const recordReportView = async (viewData = {}) => {
  try {
    const response = await axios.post(
      `${API_URL}/curriculum-coverage/report/view`,
      viewData,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error recording report view:', error);
    throw error;
  }
};

/**
 * Get report metrics (admin only)
 * @param {Object} options - Query options { startDate, endDate, limit, offset }
 * @returns {Promise<Object>} Metrics data
 */
export const getReportMetrics = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.startDate) {
      params.append('startDate', options.startDate);
    }
    if (options.endDate) {
      params.append('endDate', options.endDate);
    }
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options.offset) {
      params.append('offset', options.offset.toString());
    }

    const response = await axios.get(
      `${API_URL}/curriculum-coverage/metrics?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching report metrics:', error);
    throw error;
  }
};

/**
 * Coverage status options
 */
export const COVERAGE_STATUS = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
};

/**
 * Coverage status labels for UI display
 */
export const COVERAGE_STATUS_LABELS = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  SKIPPED: 'Skipped',
};
