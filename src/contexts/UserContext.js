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
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
    loadCurrentUser();
  }, []);

  const loadUsers = () => {
    try {
      const storedUsers = localStorage.getItem('sunday-school-users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // Create default users for demonstration
        const defaultUsers = [
          {
            id: 'admin-1',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            createdAt: new Date().toISOString(),
            status: 'active',
            groupId: null
          },
          {
            id: 'leader-1',
            name: 'Group Leader',
            email: 'leader@example.com',
            role: 'leader',
            createdAt: new Date().toISOString(),
            status: 'active',
            groupId: 'group-1'
          },
          {
            id: 'student-1',
            name: 'Student User',
            email: 'student@example.com',
            role: 'student',
            createdAt: new Date().toISOString(),
            status: 'active',
            groupId: 'group-1'
          }
        ];
        setUsers(defaultUsers);
        localStorage.setItem('sunday-school-users', JSON.stringify(defaultUsers));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadCurrentUser = () => {
    try {
      const storedCurrentUser = localStorage.getItem('sunday-school-current-user');
      if (storedCurrentUser) {
        setCurrentUser(JSON.parse(storedCurrentUser));
      } else {
        // Set default admin user for demonstration
        const storedUsers = localStorage.getItem('sunday-school-users');
        if (storedUsers) {
          const parsedUsers = JSON.parse(storedUsers);
          const adminUser = parsedUsers.find(u => u.role === 'admin');
          if (adminUser) {
            setCurrentUser(adminUser);
            localStorage.setItem('sunday-school-current-user', JSON.stringify(adminUser));
          }
        }
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const switchUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('sunday-school-current-user', JSON.stringify(user));
    }
  };

  const createUser = (userData) => {
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('sunday-school-users', JSON.stringify(updatedUsers));
    return newUser;
  };

  const updateUser = (userId, updates) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, ...updates } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('sunday-school-users', JSON.stringify(updatedUsers));

    // Update current user if it was updated
    if (currentUser?.id === userId) {
      const updatedCurrentUser = { ...currentUser, ...updates };
      setCurrentUser(updatedCurrentUser);
      localStorage.setItem('sunday-school-current-user', JSON.stringify(updatedCurrentUser));
    }
  };

  const muteUser = (userId, reason) => {
    updateUser(userId, {
      status: 'muted',
      mutedAt: new Date().toISOString(),
      muteReason: reason
    });
  };

  const unmuteUser = (userId) => {
    updateUser(userId, {
      status: 'active',
      mutedAt: null,
      muteReason: null
    });
  };

  const banUser = (userId, reason) => {
    updateUser(userId, {
      status: 'banned',
      bannedAt: new Date().toISOString(),
      banReason: reason
    });
  };

  const isAdmin = () => currentUser?.role === 'admin';
  const isLeader = () => currentUser?.role === 'leader';
  const isModerator = () => isAdmin() || isLeader();

  const value = {
    currentUser,
    users,
    switchUser,
    createUser,
    updateUser,
    muteUser,
    unmuteUser,
    banUser,
    isAdmin,
    isLeader,
    isModerator
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
