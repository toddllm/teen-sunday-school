import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing auth on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      const storedOrg = localStorage.getItem('organization');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setOrganization(storedOrg ? JSON.parse(storedOrg) : null);
          setIsAuthenticated(true);

          // Verify token is still valid
          const response = await apiClient.getProfile();
          if (response.success) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.login(email, password);

      if (response.success) {
        const { user, token, organization } = response.data;

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('organization', JSON.stringify(organization));

        setUser(user);
        setOrganization(organization);
        setIsAuthenticated(true);

        return { success: true };
      }

      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (email, password, firstName, lastName, invitationToken) => {
    try {
      const response = await apiClient.register(
        email,
        password,
        firstName,
        lastName,
        invitationToken
      );

      if (response.success) {
        const { user, token, organization } = response.data;

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('organization', JSON.stringify(organization));

        setUser(user);
        setOrganization(organization);
        setIsAuthenticated(true);

        return { success: true };
      }

      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');

    setUser(null);
    setOrganization(null);
    setIsAuthenticated(false);
  };

  const isOrgAdmin = () => {
    return user && (user.role === 'org_admin' || user.role === 'super_admin');
  };

  const value = {
    user,
    organization,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    isOrgAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
