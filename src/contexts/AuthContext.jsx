import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  // Configure axios defaults
  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  // Load user on mount
  useEffect(() => {
    if (accessToken) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Load current user
  const loadUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      // Token might be expired, try to refresh
      if (refreshToken) {
        await refreshAccessToken();
      } else {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { user, accessToken, refreshToken } = response.data;

      setUser(user);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  // Register
  const register = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, data);

      const { user, accessToken, refreshToken } = response.data;

      setUser(user);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  // Refresh access token
  const refreshAccessToken = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/refresh`, {
        refreshToken,
      });

      const { accessToken: newAccessToken } = response.data;

      setAccessToken(newAccessToken);
      localStorage.setItem('accessToken', newAccessToken);

      // Retry loading user
      await loadUser();
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  // Check if user has role
  const hasRole = (role) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true; // Super admin has all roles
    return user.role === role;
  };

  // Check if user is org admin
  const isOrgAdmin = () => {
    return hasRole('ORG_ADMIN') || hasRole('SUPER_ADMIN');
  };

  const value = {
    user,
    loading,
    accessToken,
    login,
    register,
    logout,
    refreshAccessToken,
    hasRole,
    isOrgAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
