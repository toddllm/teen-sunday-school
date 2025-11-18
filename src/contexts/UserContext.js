import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  }, [currentUser, loading]);

  // Create or update user profile
  const setupUser = (name, role = 'member') => {
    const user = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      role: role, // 'leader' or 'member'
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(user);
    return user;
  };

  // Update user profile
  const updateUser = (updates) => {
    if (!currentUser) return null;
    const updatedUser = {
      ...currentUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(updatedUser);
    return updatedUser;
  };

  // Clear user (logout)
  const clearUser = () => {
    setCurrentUser(null);
  };

  // Check if user is set up
  const isUserSetup = () => {
    return currentUser !== null;
  };

  const value = {
    currentUser,
    loading,
    setupUser,
    updateUser,
    clearUser,
    isUserSetup,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
