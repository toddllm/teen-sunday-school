import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ACTIVITY_TYPES, useStreak } from './StreakContext';

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  // Get streak logging function
  const { logActivity } = useStreak();

  // Audio element ref
  const audioRef = useRef(null);

  // Playback state
  const [currentTrack, setCurrentTrack] = useState(null); // { book, chapter, translation, audioUrl, duration, title }
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);

  // Progress tracking (stored in localStorage)
  const [audioProgress, setAudioProgress] = useState({});
  const [listeningStats, setListeningStats] = useState({
    totalListeningTime: 0, // in seconds
    chaptersListened: [],
    lastListenedAt: null
  });

  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('audioProgress');
      if (savedProgress) {
        setAudioProgress(JSON.parse(savedProgress));
      }

      const savedStats = localStorage.getItem('audioListeningStats');
      if (savedStats) {
        setListeningStats(JSON.parse(savedStats));
      }

      const savedSpeed = localStorage.getItem('audioPlaybackSpeed');
      if (savedSpeed) {
        setPlaybackSpeed(parseFloat(savedSpeed));
      }

      const savedTrack = localStorage.getItem('lastPlayedTrack');
      if (savedTrack) {
        setCurrentTrack(JSON.parse(savedTrack));
      }
    } catch (error) {
      console.error('Error loading audio data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('audioProgress', JSON.stringify(audioProgress));
    }
  }, [audioProgress, loading]);

  // Save stats to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('audioListeningStats', JSON.stringify(listeningStats));
    }
  }, [listeningStats, loading]);

  // Save playback speed to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('audioPlaybackSpeed', playbackSpeed.toString());
    }
  }, [playbackSpeed, loading]);

  // Save current track to localStorage
  useEffect(() => {
    if (!loading && currentTrack) {
      localStorage.setItem('lastPlayedTrack', JSON.stringify(currentTrack));
    }
  }, [currentTrack, loading]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();

      // Event listeners
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('loadstart', () => setIsLoading(true));
      audioRef.current.addEventListener('canplay', () => setIsLoading(false));
      audioRef.current.addEventListener('error', handleError);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply playback speed when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);

      // Save progress every 5 seconds
      if (currentTrack && Math.floor(audioRef.current.currentTime) % 5 === 0) {
        saveProgress(currentTrack, audioRef.current.currentTime);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (currentTrack) {
      markChapterAsListened(currentTrack);
    }
  };

  const handleError = (error) => {
    console.error('Audio playback error:', error);
    setIsLoading(false);
    setIsPlaying(false);
  };

  // Load and play a track
  const loadTrack = async (track) => {
    if (!track || !track.audioUrl) {
      console.error('Invalid track data');
      return;
    }

    try {
      setIsLoading(true);
      setCurrentTrack(track);

      if (audioRef.current) {
        audioRef.current.src = track.audioUrl;

        // Load saved progress for this track
        const trackId = getTrackId(track);
        const savedPosition = audioProgress[trackId];

        if (savedPosition && savedPosition > 0) {
          audioRef.current.currentTime = savedPosition;
        }

        await audioRef.current.load();
      }
    } catch (error) {
      console.error('Error loading track:', error);
      setIsLoading(false);
    }
  };

  // Play/pause
  const togglePlayPause = async () => {
    if (!audioRef.current || !currentTrack) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        updateListeningStats();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      setIsPlaying(false);
    }
  };

  // Seek to position
  const seekTo = (time) => {
    if (audioRef.current && currentTrack) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
      saveProgress(currentTrack, time);
    }
  };

  // Change playback speed
  const changePlaybackSpeed = (speed) => {
    const validSpeed = Math.max(0.5, Math.min(2.0, speed));
    setPlaybackSpeed(validSpeed);
  };

  // Get track identifier
  const getTrackId = (track) => {
    return `${track.translation || 'NIV'}_${track.book}_${track.chapter}`;
  };

  // Save progress for a track
  const saveProgress = (track, position) => {
    const trackId = getTrackId(track);
    setAudioProgress(prev => ({
      ...prev,
      [trackId]: position
    }));
  };

  // Get saved progress for a track
  const getProgress = (track) => {
    const trackId = getTrackId(track);
    return audioProgress[trackId] || 0;
  };

  // Mark chapter as listened (when completed)
  const markChapterAsListened = (track) => {
    const chapterId = `${track.book}_${track.chapter}`;

    if (!listeningStats.chaptersListened.includes(chapterId)) {
      setListeningStats(prev => ({
        ...prev,
        chaptersListened: [...prev.chaptersListened, chapterId],
        lastListenedAt: new Date().toISOString()
      }));

      // Log activity to StreakContext for tracking and badges
      logActivity(ACTIVITY_TYPES.CHAPTER_LISTENED);
    }

    // Clear progress for completed chapter
    const trackId = getTrackId(track);
    setAudioProgress(prev => {
      const updated = { ...prev };
      delete updated[trackId];
      return updated;
    });
  };

  // Update listening statistics
  const updateListeningStats = () => {
    setListeningStats(prev => ({
      ...prev,
      lastListenedAt: new Date().toISOString()
    }));
  };

  // Track listening time (called periodically when playing)
  const trackListeningTime = (seconds) => {
    setListeningStats(prev => ({
      ...prev,
      totalListeningTime: prev.totalListeningTime + seconds
    }));
  };

  // Get listening statistics
  const getListeningStats = () => {
    return {
      totalListeningTime: listeningStats.totalListeningTime,
      totalChaptersListened: listeningStats.chaptersListened.length,
      lastListenedAt: listeningStats.lastListenedAt,
      chaptersListened: listeningStats.chaptersListened
    };
  };

  // Get last played track info
  const getLastPlayedTrack = () => {
    return currentTrack;
  };

  // Reset current track
  const resetTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Clear all progress
  const clearAllProgress = () => {
    setAudioProgress({});
    setListeningStats({
      totalListeningTime: 0,
      chaptersListened: [],
      lastListenedAt: null
    });
    localStorage.removeItem('audioProgress');
    localStorage.removeItem('audioListeningStats');
  };

  const value = {
    // State
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    isLoading,
    loading,

    // Actions
    loadTrack,
    togglePlayPause,
    seekTo,
    changePlaybackSpeed,
    resetTrack,

    // Progress
    getProgress,
    saveProgress,
    markChapterAsListened,

    // Stats
    getListeningStats,
    trackListeningTime,
    getLastPlayedTrack,
    clearAllProgress
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};
