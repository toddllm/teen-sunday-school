import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const STORAGE_KEY = 'sunday-school-user';

/**
 * Mock authentication context for managing user sessions
 *
 * In a production app, this would integrate with a real auth provider
 * (Firebase, Auth0, custom backend, etc.)
 *
 * For now, we use localStorage to persist a simple user object
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  /**
   * Mock login - creates a simple user session
   * @param {string} name - User's display name
   * @returns {Object} The created user object
   */
  const login = (name) => {
    const newUser = {
      id: `user-${Date.now()}`,
      name: name || 'Guest User',
      email: `${(name || 'guest').toLowerCase().replace(/\s+/g, '')}@example.com`,
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    return newUser;
  };

  /**
   * Logout - clears user session
   */
  const logout = () => {
    setUser(null);
  };

  /**
   * Auto-login as guest if no user exists
   * Useful for seamless first-time experience
   */
  const ensureUser = () => {
    if (!user) {
      return login('Teen User');
    }
    return user;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    ensureUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
