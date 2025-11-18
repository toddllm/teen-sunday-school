import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

const ReadAloudContext = createContext();

export const useReadAloud = () => {
  const context = useContext(ReadAloudContext);
  if (!context) {
    throw new Error('useReadAloud must be used within a ReadAloudProvider');
  }
  return context;
};

export const ReadAloudProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [rate, setRate] = useState(0.9);
  const [volume, setVolume] = useState(1.0);
  const [currentText, setCurrentText] = useState('');
  const [currentPosition, setCurrentPosition] = useState(0);
  const utteranceRef = useRef(null);

  // Check if speech synthesis is supported
  const isSpeechSupported = 'speechSynthesis' in window;

  // Load voices
  useEffect(() => {
    if (!isSpeechSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // Load saved voice preference or select default English voice
      const savedVoiceName = localStorage.getItem('readAloud-voice');
      if (savedVoiceName) {
        const savedVoice = voices.find(v => v.name === savedVoiceName);
        if (savedVoice) {
          setSelectedVoice(savedVoice);
        }
      } else {
        // Default to first English voice
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
          setSelectedVoice(englishVoice);
        }
      }
    };

    // Load voices immediately
    loadVoices();

    // Voices may load asynchronously in some browsers
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSpeechSupported]);

  // Load saved preferences
  useEffect(() => {
    const savedRate = localStorage.getItem('readAloud-rate');
    const savedVolume = localStorage.getItem('readAloud-volume');

    if (savedRate) {
      setRate(parseFloat(savedRate));
    }
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem('readAloud-voice', selectedVoice.name);
    }
  }, [selectedVoice]);

  useEffect(() => {
    localStorage.setItem('readAloud-rate', rate.toString());
  }, [rate]);

  useEffect(() => {
    localStorage.setItem('readAloud-volume', volume.toString());
  }, [volume]);

  // Clean up text for speech (remove HTML tags, verse numbers, etc.)
  const cleanTextForSpeech = useCallback((text) => {
    if (!text) return '';

    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>/g, '');

    // Remove verse numbers in format [1], [2], etc.
    cleaned = cleaned.replace(/\[\d+\]/g, '');

    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }, []);

  // Speak text
  const speak = useCallback((text, options = {}) => {
    if (!isSpeechSupported) {
      console.warn('Speech synthesis is not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const textToSpeak = cleanTextForSpeech(text);
    if (!textToSpeak) return;

    setCurrentText(textToSpeak);
    setCurrentPosition(0);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Apply settings
    utterance.rate = options.rate !== undefined ? options.rate : rate;
    utterance.volume = options.volume !== undefined ? options.volume : volume;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentText('');
      setCurrentPosition(0);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentText('');
      setCurrentPosition(0);
      utteranceRef.current = null;
    };

    utterance.onboundary = (event) => {
      setCurrentPosition(event.charIndex);
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  }, [isSpeechSupported, cleanTextForSpeech, rate, volume, selectedVoice]);

  // Pause speech
  const pause = useCallback(() => {
    if (!isSpeechSupported) return;

    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeechSupported]);

  // Resume speech
  const resume = useCallback(() => {
    if (!isSpeechSupported) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSpeechSupported]);

  // Stop speech
  const stop = useCallback(() => {
    if (!isSpeechSupported) return;

    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentText('');
    setCurrentPosition(0);
    utteranceRef.current = null;
  }, [isSpeechSupported]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPaused) {
      resume();
    } else if (isPlaying) {
      pause();
    }
  }, [isPaused, isPlaying, pause, resume]);

  const value = {
    // State
    isPlaying,
    isPaused,
    currentText,
    currentPosition,
    isSpeechSupported,

    // Voice settings
    selectedVoice,
    setSelectedVoice,
    availableVoices,

    // Audio settings
    rate,
    setRate,
    volume,
    setVolume,

    // Controls
    speak,
    pause,
    resume,
    stop,
    togglePlayPause,

    // Utilities
    cleanTextForSpeech,
  };

  return (
    <ReadAloudContext.Provider value={value}>
      {children}
    </ReadAloudContext.Provider>
  );
};
