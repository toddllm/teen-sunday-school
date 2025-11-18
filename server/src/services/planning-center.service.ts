import axios, { AxiosInstance } from 'axios';
import { ExternalIntegration } from '@prisma/client';
import prisma from '../config/database';
import logger from '../config/logger';
import { encryptJSON, decryptJSON } from '../utils/encryption';

// Planning Center API base URL
const PC_API_BASE = 'https://api.planningcenteronline.com';
const PC_OAUTH_AUTHORIZE = `${PC_API_BASE}/oauth/authorize`;
const PC_OAUTH_TOKEN = `${PC_API_BASE}/oauth/token`;

export interface PlanningCenterCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: string;
  scope: string;
}

export interface PlanningCenterPerson {
  id: string;
  attributes: {
    first_name: string;
    last_name: string;
    email?: string;
    birthdate?: string;
    grade?: number;
    gender?: string;
  };
}

export interface PlanningCenterList {
  id: string;
  attributes: {
    name: string;
    description?: string;
    total_people: number;
    list_type: string;
  };
}

export class PlanningCenterService {
  private client: AxiosInstance;

  constructor(private integration: ExternalIntegration) {
    const credentials = this.getCredentials();

    this.client = axios.create({
      baseURL: PC_API_BASE,
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          await this.refreshAccessToken();
          // Retry original request
          error.config.headers['Authorization'] = `Bearer ${this.getCredentials().accessToken}`;
          return axios.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get OAuth authorization URL
   */
  static getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.PLANNING_CENTER_CLIENT_ID!,
      redirect_uri: process.env.PLANNING_CENTER_REDIRECT_URI!,
      response_type: 'code',
      scope: 'people',
      state,
    });

    return `${PC_OAUTH_AUTHORIZE}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(code: string): Promise<PlanningCenterCredentials> {
    try {
      const response = await axios.post(PC_OAUTH_TOKEN, {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.PLANNING_CENTER_CLIENT_ID!,
        client_secret: process.env.PLANNING_CENTER_CLIENT_SECRET!,
        redirect_uri: process.env.PLANNING_CENTER_REDIRECT_URI!,
      });

      const { access_token, refresh_token, expires_in, token_type, scope } = response.data;

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        tokenType: token_type,
        scope,
      };
    } catch (error) {
      logger.error('Error exchanging code for token:', error);
      throw new Error('Failed to authenticate with Planning Center');
    }
  }

  /**
   * Decrypt and get credentials from integration
   */
  private getCredentials(): PlanningCenterCredentials {
    try {
      return decryptJSON(
        this.integration.credentialsEncrypted,
        this.integration.credentialsIV,
        this.integration.credentialsTag
      );
    } catch (error) {
      logger.error('Error decrypting credentials:', error);
      throw new Error('Failed to decrypt credentials');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      const credentials = this.getCredentials();

      const response = await axios.post(PC_OAUTH_TOKEN, {
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken,
        client_id: process.env.PLANNING_CENTER_CLIENT_ID!,
        client_secret: process.env.PLANNING_CENTER_CLIENT_SECRET!,
      });

      const { access_token, refresh_token, expires_in } = response.data;

      const newCredentials: PlanningCenterCredentials = {
        ...credentials,
        accessToken: access_token,
        refreshToken: refresh_token || credentials.refreshToken,
        expiresAt: new Date(Date.now() + expires_in * 1000),
      };

      // Encrypt and save new credentials
      const encrypted = encryptJSON(newCredentials);

      await prisma.externalIntegration.update({
        where: { id: this.integration.id },
        data: {
          credentialsEncrypted: encrypted.encrypted,
          credentialsIV: encrypted.iv,
          credentialsTag: encrypted.tag,
          accessToken: access_token,
          refreshToken: refresh_token || credentials.refreshToken,
          tokenExpiresAt: newCredentials.expiresAt,
        },
      });

      // Update instance
      this.integration.accessToken = access_token;
      this.integration.tokenExpiresAt = newCredentials.expiresAt;

      logger.info('Access token refreshed successfully');
    } catch (error) {
      logger.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Test connection to Planning Center
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/people/v2/me');
      return true;
    } catch (error) {
      logger.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Fetch all lists (groups) from Planning Center
   */
  async fetchLists(): Promise<PlanningCenterList[]> {
    try {
      const response = await this.client.get('/people/v2/lists', {
        params: {
          per_page: 100,
        },
      });

      return response.data.data as PlanningCenterList[];
    } catch (error) {
      logger.error('Error fetching lists:', error);
      throw new Error('Failed to fetch lists from Planning Center');
    }
  }

  /**
   * Fetch people from a specific list
   */
  async fetchPeopleFromList(listId: string): Promise<PlanningCenterPerson[]> {
    try {
      let allPeople: PlanningCenterPerson[] = [];
      let nextUrl = `/people/v2/lists/${listId}/people?per_page=100`;

      while (nextUrl) {
        const response = await this.client.get(nextUrl);
        allPeople = allPeople.concat(response.data.data);

        // Check for next page
        nextUrl = response.data.links?.next || null;
      }

      return allPeople;
    } catch (error) {
      logger.error(`Error fetching people from list ${listId}:`, error);
      throw new Error('Failed to fetch people from Planning Center');
    }
  }

  /**
   * Fetch a specific person by ID
   */
  async fetchPerson(personId: string): Promise<PlanningCenterPerson> {
    try {
      const response = await this.client.get(`/people/v2/people/${personId}`);
      return response.data.data as PlanningCenterPerson;
    } catch (error) {
      logger.error(`Error fetching person ${personId}:`, error);
      throw new Error('Failed to fetch person from Planning Center');
    }
  }

  /**
   * Fetch all people (with pagination)
   */
  async fetchAllPeople(): Promise<PlanningCenterPerson[]> {
    try {
      let allPeople: PlanningCenterPerson[] = [];
      let nextUrl = '/people/v2/people?per_page=100';

      while (nextUrl) {
        const response = await this.client.get(nextUrl);
        allPeople = allPeople.concat(response.data.data);

        // Check for next page
        nextUrl = response.data.links?.next || null;

        // Safety limit to avoid infinite loops
        if (allPeople.length > 10000) {
          logger.warn('Fetched 10,000+ people, stopping pagination');
          break;
        }
      }

      return allPeople;
    } catch (error) {
      logger.error('Error fetching all people:', error);
      throw new Error('Failed to fetch people from Planning Center');
    }
  }
}
