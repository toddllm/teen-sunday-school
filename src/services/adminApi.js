import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Admin API service for managing users and roles
 */
class AdminAPI {
  /**
   * Search and list users
   */
  static async getUsers(params = {}) {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, { params });
    return response.data;
  }

  /**
   * Get specific user details
   */
  static async getUser(userId) {
    const response = await axios.get(`${API_BASE_URL}/admin/users/${userId}`);
    return response.data;
  }

  /**
   * Assign role to user
   */
  static async assignRole(userId, roleId, scope = 'global') {
    const response = await axios.post(
      `${API_BASE_URL}/admin/users/${userId}/roles`,
      { roleId, scope }
    );
    return response.data;
  }

  /**
   * Remove role from user
   */
  static async removeRole(userId, roleId, scope = 'global') {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/users/${userId}/roles/${roleId}`,
      { params: { scope } }
    );
    return response.data;
  }

  /**
   * Get all roles
   */
  static async getRoles() {
    const response = await axios.get(`${API_BASE_URL}/admin/roles`);
    return response.data;
  }

  /**
   * Get all permissions
   */
  static async getPermissions() {
    const response = await axios.get(`${API_BASE_URL}/admin/permissions`);
    return response.data;
  }

  /**
   * Get audit logs
   */
  static async getAuditLogs(params = {}) {
    const response = await axios.get(`${API_BASE_URL}/admin/audit-logs`, { params });
    return response.data;
  }

  /**
   * Get role usage analytics
   */
  static async getRoleUsage() {
    const response = await axios.get(`${API_BASE_URL}/admin/analytics/role-usage`);
    return response.data;
  }

  /**
   * Get permission errors analytics
   */
  static async getPermissionErrors(params = {}) {
    const response = await axios.get(
      `${API_BASE_URL}/admin/analytics/permission-errors`,
      { params }
    );
    return response.data;
  }
}

export default AdminAPI;
