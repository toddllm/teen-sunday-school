import React, { useState } from 'react';
import { useReadAloud } from '../contexts/ReadAloudContext';
import './ReadAloudControls.css';

const ReadAloudControls = ({
  text,
  reference = null,
  compact = false,
  showVoiceSelector = true,
  showRateControl = true,
  className = ''
}) => {
  const {
    isPlaying,
    isPaused,
    isSpeechSupported,
    selectedVoice,
    setSelectedVoice,
    availableVoices,
    rate,
    setRate,
    speak,
    pause,
    resume,
    stop,
  } = useReadAloud();

  const [showSettings, setShowSettings] = useState(false);

  if (!isSpeechSupported) {
    return (
      <div className={`read-aloud-controls ${className}`}>
        <span className="read-aloud-unsupported">
          ⚠️ Text-to-speech is not supported in this browser
        </span>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (!isPlaying) {
      // Prepare text for speech
      let speechText = text;
      if (reference) {
        speechText = `${reference}. ${text}`;
      }
      speak(speechText);
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    setRate(newRate);
  };

  const handleVoiceChange = (e) => {
    const voiceName = e.target.value;
    const voice = availableVoices.find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
    }
  };

  const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));

  if (compact) {
    return (
      <div className={`read-aloud-controls read-aloud-compact ${className}`}>
        <button
          onClick={handlePlayPause}
          className="read-aloud-btn read-aloud-play-btn"
          title={!isPlaying ? 'Read aloud' : isPaused ? 'Resume' : 'Pause'}
          disabled={!text}
        >
          {!isPlaying ? '🔊' : isPaused ? '▶️' : '⏸️'}
          <span className="read-aloud-btn-text">
            {!isPlaying ? 'Read Aloud' : isPaused ? 'Resume' : 'Pause'}
          </span>
        </button>
        {isPlaying && (
          <button
            onClick={handleStop}
            className="read-aloud-btn read-aloud-stop-btn"
            title="Stop"
          >
            ⏹️
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`read-aloud-controls ${className}`}>
      <div className="read-aloud-main-controls">
        <button
          onClick={handlePlayPause}
          className="read-aloud-btn read-aloud-play-btn"
          disabled={!text}
          title={!isPlaying ? 'Read aloud' : isPaused ? 'Resume' : 'Pause'}
        >
          {!isPlaying ? '🔊 Read Aloud' : isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>

        {isPlaying && (
          <button
            onClick={handleStop}
            className="read-aloud-btn read-aloud-stop-btn"
            title="Stop"
          >
            ⏹️ Stop
          </button>
        )}

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="read-aloud-btn read-aloud-settings-btn"
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {showSettings && (
        <div className="read-aloud-settings">
          {showRateControl && (
            <div className="read-aloud-setting">
              <label htmlFor="read-aloud-rate">
                Speed: {rate.toFixed(1)}x
              </label>
              <input
                id="read-aloud-rate"
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={rate}
                onChange={handleRateChange}
                className="read-aloud-slider"
              />
              <div className="read-aloud-rate-labels">
                <span>0.5x</span>
                <span>1.0x</span>
                <span>2.0x</span>
              </div>
            </div>
          )}

          {showVoiceSelector && englishVoices.length > 0 && (
            <div className="read-aloud-setting">
              <label htmlFor="read-aloud-voice">Voice:</label>
              <select
                id="read-aloud-voice"
                value={selectedVoice?.name || ''}
                onChange={handleVoiceChange}
                className="read-aloud-select"
              >
                {englishVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} {voice.localService ? '(Local)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {isPlaying && (
        <div className="read-aloud-status">
          <div className="read-aloud-indicator">
            <span className="read-aloud-pulse"></span>
            {isPaused ? 'Paused' : 'Playing...'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadAloudControls;
