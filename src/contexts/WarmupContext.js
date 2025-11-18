import React, { createContext, useContext, useState, useEffect } from 'react';

const WarmupContext = createContext();

// Activity types for warmup sessions
export const WARMUP_ACTIVITY_TYPES = {
  BIBLE_TRIVIA: 'bible_trivia',
  VERSE_REVIEW: 'verse_review',
  WORD_OF_DAY: 'word_of_day',
  DISCUSSION_STARTER: 'discussion_starter',
  MEMORY_VERSE: 'memory_verse',
  QUICK_GAME: 'quick_game',
  REFLECTION: 'reflection'
};

// Warmup session durations (in minutes)
export const WARMUP_DURATIONS = {
  SHORT: 5,
  MEDIUM: 10,
  LONG: 15
};

export const useWarmup = () => {
  const context = useContext(WarmupContext);
  if (!context) {
    throw new Error('useWarmup must be used within a WarmupProvider');
  }
  return context;
};

export const WarmupProvider = ({ children }) => {
  const [warmupPlaylists, setWarmupPlaylists] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [warmupSettings, setWarmupSettings] = useState({
    defaultDuration: WARMUP_DURATIONS.MEDIUM,
    enabledActivityTypes: Object.values(WARMUP_ACTIVITY_TYPES),
    autoAdvance: true,
    activityDuration: 120 // seconds per activity
  });
  const [completedWarmups, setCompletedWarmups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedPlaylists = localStorage.getItem('warmupPlaylists');
      const savedSettings = localStorage.getItem('warmupSettings');
      const savedCompleted = localStorage.getItem('completedWarmups');

      if (savedPlaylists) {
        setWarmupPlaylists(JSON.parse(savedPlaylists));
      }
      if (savedSettings) {
        setWarmupSettings(JSON.parse(savedSettings));
      }
      if (savedCompleted) {
        setCompletedWarmups(JSON.parse(savedCompleted));
      }
    } catch (error) {
      console.error('Error loading warmup data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save playlists to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('warmupPlaylists', JSON.stringify(warmupPlaylists));
    }
  }, [warmupPlaylists, loading]);

  // Save settings to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('warmupSettings', JSON.stringify(warmupSettings));
    }
  }, [warmupSettings, loading]);

  // Save completed warmups to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('completedWarmups', JSON.stringify(completedWarmups));
    }
  }, [completedWarmups, loading]);

  // Create a new warmup playlist
  const createPlaylist = (name, activities, lessonId = null) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      activities,
      lessonId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setWarmupPlaylists([...warmupPlaylists, newPlaylist]);
    return newPlaylist;
  };

  // Update an existing playlist
  const updatePlaylist = (playlistId, updates) => {
    setWarmupPlaylists(warmupPlaylists.map(playlist =>
      playlist.id === playlistId
        ? { ...playlist, ...updates, updatedAt: new Date().toISOString() }
        : playlist
    ));
  };

  // Delete a playlist
  const deletePlaylist = (playlistId) => {
    setWarmupPlaylists(warmupPlaylists.filter(p => p.id !== playlistId));
    if (activePlaylist?.id === playlistId) {
      setActivePlaylist(null);
      setCurrentActivityIndex(0);
    }
  };

  // Start a warmup session
  const startWarmupSession = (playlistId) => {
    const playlist = warmupPlaylists.find(p => p.id === playlistId);
    if (playlist) {
      setActivePlaylist(playlist);
      setCurrentActivityIndex(0);
      return true;
    }
    return false;
  };

  // Navigate to next activity
  const nextActivity = () => {
    if (activePlaylist && currentActivityIndex < activePlaylist.activities.length - 1) {
      setCurrentActivityIndex(currentActivityIndex + 1);
      return true;
    }
    return false;
  };

  // Navigate to previous activity
  const previousActivity = () => {
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex(currentActivityIndex - 1);
      return true;
    }
    return false;
  };

  // Jump to specific activity
  const goToActivity = (index) => {
    if (activePlaylist && index >= 0 && index < activePlaylist.activities.length) {
      setCurrentActivityIndex(index);
      return true;
    }
    return false;
  };

  // End warmup session
  const endWarmupSession = () => {
    if (activePlaylist) {
      const completedSession = {
        playlistId: activePlaylist.id,
        playlistName: activePlaylist.name,
        completedAt: new Date().toISOString(),
        activitiesCompleted: currentActivityIndex + 1,
        totalActivities: activePlaylist.activities.length
      };

      setCompletedWarmups([completedSession, ...completedWarmups].slice(0, 50)); // Keep last 50
    }

    setActivePlaylist(null);
    setCurrentActivityIndex(0);
  };

  // Get current activity
  const getCurrentActivity = () => {
    if (activePlaylist && activePlaylist.activities[currentActivityIndex]) {
      return activePlaylist.activities[currentActivityIndex];
    }
    return null;
  };

  // Update warmup settings
  const updateSettings = (newSettings) => {
    setWarmupSettings({ ...warmupSettings, ...newSettings });
  };

  // Get playlists by lesson
  const getPlaylistsByLesson = (lessonId) => {
    return warmupPlaylists.filter(p => p.lessonId === lessonId);
  };

  // Get recent completed warmups
  const getRecentWarmups = (limit = 10) => {
    return completedWarmups.slice(0, limit);
  };

  // Get warmup statistics
  const getWarmupStats = () => {
    return {
      totalPlaylists: warmupPlaylists.length,
      totalCompleted: completedWarmups.length,
      totalActivities: warmupPlaylists.reduce((sum, p) => sum + p.activities.length, 0),
      averageActivitiesPerPlaylist: warmupPlaylists.length > 0
        ? Math.round(warmupPlaylists.reduce((sum, p) => sum + p.activities.length, 0) / warmupPlaylists.length)
        : 0
    };
  };

  const value = {
    warmupPlaylists,
    activePlaylist,
    currentActivityIndex,
    warmupSettings,
    completedWarmups,
    loading,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    startWarmupSession,
    nextActivity,
    previousActivity,
    goToActivity,
    endWarmupSession,
    getCurrentActivity,
    updateSettings,
    getPlaylistsByLesson,
    getRecentWarmups,
    getWarmupStats
  };

  return (
    <WarmupContext.Provider value={value}>
      {children}
    </WarmupContext.Provider>
  );
};
