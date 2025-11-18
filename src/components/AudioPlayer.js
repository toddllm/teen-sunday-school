import React, { useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import './AudioPlayer.css';

const AudioPlayer = ({ compact = false }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    isLoading,
    togglePlayPause,
    seekTo,
    changePlaybackSpeed
  } = useAudio();

  // Track listening time
  useEffect(() => {
    let interval;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        // Track every second of listening
        // This could be used for analytics
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTrack]);

  // Format time in MM:SS format
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!duration) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    seekTo(newTime);
  };

  // Speed options
  const speedOptions = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  // Cycle through speed options
  const cycleSpeed = () => {
    const currentIndex = speedOptions.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    changePlaybackSpeed(speedOptions[nextIndex]);
  };

  // Skip forward/backward
  const skip = (seconds) => {
    const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
    seekTo(newTime);
  };

  if (!currentTrack) {
    return null;
  }

  if (compact) {
    return (
      <div className="audio-player-compact">
        <div className="compact-info">
          <div className="compact-title">{currentTrack.title}</div>
          <div className="compact-progress">
            <div
              className="compact-progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <button
          className="compact-play-button"
          onClick={togglePlayPause}
          disabled={isLoading}
        >
          {isLoading ? '⏳' : isPlaying ? '⏸' : '▶'}
        </button>
      </div>
    );
  }

  return (
    <div className="audio-player">
      <div className="audio-player-header">
        <div className="audio-track-info">
          <h3 className="audio-track-title">{currentTrack.title}</h3>
          <p className="audio-track-subtitle">
            {currentTrack.book} {currentTrack.chapter} - {currentTrack.translation || 'NIV'}
          </p>
        </div>
      </div>

      <div className="audio-progress-container">
        <div
          className="audio-progress-bar"
          onClick={handleProgressClick}
        >
          <div
            className="audio-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="audio-progress-thumb"
            style={{ left: `${progressPercent}%` }}
          />
        </div>
        <div className="audio-time-display">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="audio-controls">
        <button
          className="audio-control-button"
          onClick={() => skip(-15)}
          title="Rewind 15 seconds"
          disabled={isLoading}
        >
          <span className="control-icon">⏪</span>
          <span className="control-label">15s</span>
        </button>

        <button
          className="audio-play-button"
          onClick={togglePlayPause}
          disabled={isLoading}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <span className="control-icon loading">⏳</span>
          ) : isPlaying ? (
            <span className="control-icon">⏸</span>
          ) : (
            <span className="control-icon">▶</span>
          )}
        </button>

        <button
          className="audio-control-button"
          onClick={() => skip(15)}
          title="Forward 15 seconds"
          disabled={isLoading}
        >
          <span className="control-icon">⏩</span>
          <span className="control-label">15s</span>
        </button>

        <button
          className="audio-speed-button"
          onClick={cycleSpeed}
          title={`Playback speed: ${playbackSpeed}x`}
        >
          <span className="speed-label">{playbackSpeed}x</span>
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
