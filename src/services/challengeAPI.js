/**
 * Challenge API Service
 * Handles all API calls related to team challenges
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token (placeholder - implement when auth is added)
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// ============================================================================
// CHALLENGE CRUD
// ============================================================================

export async function createChallenge(groupId, challengeData) {
  return apiCall(`/groups/${groupId}/challenges`, {
    method: 'POST',
    body: JSON.stringify(challengeData),
  });
}

export async function getGroupChallenges(groupId, status = null) {
  const params = status ? `?status=${status}` : '';
  return apiCall(`/groups/${groupId}/challenges${params}`);
}

export async function getChallengeById(challengeId) {
  return apiCall(`/challenges/${challengeId}`);
}

export async function getMyActiveChallenges() {
  return apiCall('/challenges/my-challenges');
}

export async function updateChallengeStatus(challengeId, status) {
  return apiCall(`/challenges/${challengeId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteChallenge(challengeId) {
  return apiCall(`/challenges/${challengeId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// PARTICIPATION
// ============================================================================

export async function joinChallenge(challengeId) {
  return apiCall(`/challenges/${challengeId}/join`, {
    method: 'POST',
  });
}

export async function recordContribution(challengeId, contributionData) {
  return apiCall(`/challenges/${challengeId}/contributions`, {
    method: 'POST',
    body: JSON.stringify(contributionData),
  });
}

// ============================================================================
// STATISTICS
// ============================================================================

export async function getChallengeLeaderboard(challengeId, limit = 10) {
  return apiCall(`/challenges/${challengeId}/leaderboard?limit=${limit}`);
}

// ============================================================================
// GROUPS
// ============================================================================

export async function getGroups() {
  return apiCall('/groups');
}

export async function getMyGroups() {
  return apiCall('/groups/my-groups');
}

export async function getGroupById(groupId) {
  return apiCall(`/groups/${groupId}`);
}

export default {
  createChallenge,
  getGroupChallenges,
  getChallengeById,
  getMyActiveChallenges,
  updateChallengeStatus,
  deleteChallenge,
  joinChallenge,
  recordContribution,
  getChallengeLeaderboard,
  getGroups,
  getMyGroups,
  getGroupById,
};
