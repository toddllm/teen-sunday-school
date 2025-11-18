import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ProfileContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function ProfileProvider({ children }) {
  const { user: authUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const [avatarsByCategory, setAvatarsByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load profile when auth user changes
  useEffect(() => {
    if (authUser && !authLoading) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [authUser, authLoading]);

  // Load avatars on mount
  useEffect(() => {
    loadAvatars();
  }, []);

  // Load current user's profile
  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/me/profile`);
      setProfile(response.data.user);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError(error.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Load available avatars
  const loadAvatars = async () => {
    try {
      // Load avatars grouped by category
      const response = await axios.get(`${API_URL}/api/avatars?groupBy=category`);
      const { avatars: avatarsData, grouped } = response.data;

      if (grouped) {
        setAvatarsByCategory(avatarsData);
        // Flatten for avatars array
        const flatAvatars = Object.values(avatarsData).flat();
        setAvatars(flatAvatars);
      } else {
        setAvatars(avatarsData);
        // Group by category manually
        const grouped = avatarsData.reduce((acc, avatar) => {
          if (!acc[avatar.category]) {
            acc[avatar.category] = [];
          }
          acc[avatar.category].push(avatar);
          return acc;
        }, {});
        setAvatarsByCategory(grouped);
      }
    } catch (error) {
      console.error('Failed to load avatars:', error);
    }
  };

  // Update profile (nickname and/or avatar)
  const updateProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(`${API_URL}/api/me/profile`, data);
      setProfile(response.data.user);

      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      const errorDetails = error.response?.data?.details || [];

      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
        details: errorDetails,
      };
    } finally {
      setLoading(false);
    }
  };

  // Update nickname only
  const updateNickname = async (nickname) => {
    return await updateProfile({ nickname });
  };

  // Update avatar only
  const updateAvatar = async (avatarId) => {
    return await updateProfile({ avatarId });
  };

  // Validate nickname without updating
  const validateNickname = async (nickname) => {
    try {
      const response = await axios.post(`${API_URL}/api/me/profile/validate-nickname`, {
        nickname,
      });

      return {
        isValid: response.data.isValid,
        errors: response.data.errors || [],
        sanitized: response.data.sanitized,
      };
    } catch (error) {
      console.error('Failed to validate nickname:', error);
      return {
        isValid: false,
        errors: ['Failed to validate nickname'],
      };
    }
  };

  // Get avatar by ID
  const getAvatarById = useCallback((avatarId) => {
    return avatars.find(avatar => avatar.id === avatarId);
  }, [avatars]);

  // Check if profile is complete (has both nickname and avatar)
  const isProfileComplete = useCallback(() => {
    return profile && profile.nickname && profile.avatarId;
  }, [profile]);

  // Get display name (nickname or firstName)
  const getDisplayName = useCallback(() => {
    if (profile?.nickname) {
      return profile.nickname;
    }
    return profile?.firstName || authUser?.firstName || 'User';
  }, [profile, authUser]);

  // Get avatar URL
  const getAvatarUrl = useCallback(() => {
    if (profile?.avatar?.imageUrl) {
      return profile.avatar.imageUrl;
    }
    return null;
  }, [profile]);

  const value = {
    profile,
    avatars,
    avatarsByCategory,
    loading: loading || authLoading,
    error,
    loadProfile,
    updateProfile,
    updateNickname,
    updateAvatar,
    validateNickname,
    getAvatarById,
    isProfileComplete,
    getDisplayName,
    getAvatarUrl,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

// Custom hook to use profile context
export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

export default ProfileContext;
