import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class APIClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to requests
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Handle response errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth data on unauthorized
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(email, password, firstName, lastName, invitationToken) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      invitationToken
    });
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  async validateInvitation(token) {
    const response = await this.client.get(`/auth/invitations/${token}`);
    return response.data;
  }

  // Import endpoints
  async uploadCSV(orgId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(
      `/admin/orgs/${orgId}/user-imports`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }

  async setColumnMapping(orgId, jobId, columnMapping, settings) {
    const response = await this.client.post(
      `/admin/orgs/${orgId}/user-imports/${jobId}/mapping`,
      { columnMapping, settings }
    );
    return response.data;
  }

  async processImport(orgId, jobId) {
    const response = await this.client.post(
      `/admin/orgs/${orgId}/user-imports/${jobId}/process`
    );
    return response.data;
  }

  async getImportStatus(orgId, jobId) {
    const response = await this.client.get(
      `/admin/orgs/${orgId}/user-imports/${jobId}`
    );
    return response.data;
  }

  async getOrganizationImports(orgId, page = 1, limit = 10) {
    const response = await this.client.get(
      `/admin/orgs/${orgId}/user-imports?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async cancelImport(orgId, jobId) {
    const response = await this.client.delete(
      `/admin/orgs/${orgId}/user-imports/${jobId}`
    );
    return response.data;
  }
}

export default new APIClient();
