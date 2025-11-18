import React, { useState, useEffect, useCallback } from 'react';
import './Hangman.css';

const Hangman = ({ words = [] }) => {
  const [targetWord, setTargetWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [message, setMessage] = useState('');
  const MAX_WRONG_GUESSES = 6;

  const getNewWord = () => {
    if (words.length === 0) return;
    const randomWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
    setTargetWord(randomWord);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameStatus('playing');
    setMessage('');
  };

  useEffect(() => {
    getNewWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);

  const handleGuess = useCallback((letter) => {
    if (gameStatus !== 'playing' || guessedLetters.has(letter)) return;

    const newGuessedLetters = new Set(guessedLetters);
    newGuessedLetters.add(letter);
    setGuessedLetters(newGuessedLetters);

    if (!targetWord.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= MAX_WRONG_GUESSES) {
        setGameStatus('lost');
        setMessage(`Game Over! The word was: ${targetWord}`);
      }
    } else {
      // Check if word is complete
      const isComplete = targetWord.split('').every(l => newGuessedLetters.has(l));
      if (isComplete) {
        setGameStatus('won');
        setMessage('🎉 Congratulations! You found the word!');
      }
    }
  }, [targetWord, guessedLetters, wrongGuesses, gameStatus]);

  const handleKeyPress = useCallback((e) => {
    if (/^[a-zA-Z]$/.test(e.key)) {
      handleGuess(e.key.toUpperCase());
    }
  }, [handleGuess]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (words.length === 0) {
    return (
      <div className="hangman-container">
        <div className="hangman-message error">
          No words available for Hangman! Add words in the admin panel.
        </div>
      </div>
    );
  }

  if (!targetWord) {
    return (
      <div className="hangman-container">
        <div className="hangman-message">Loading...</div>
      </div>
    );
  }

  const displayWord = targetWord
    .split('')
    .map(letter => (guessedLetters.has(letter) ? letter : '_'))
    .join(' ');

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="hangman-container">
      <div className="hangman-header">
        <h2>Hangman</h2>
        <button onClick={getNewWord} className="hangman-reset-btn">New Game</button>
      </div>

      {message && (
        <div className={`hangman-message ${gameStatus === 'won' ? 'success' : gameStatus === 'lost' ? 'error' : ''}`}>
          {message}
        </div>
      )}

      <div className="hangman-drawing">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Gallows */}
          <line x1="10" y1="190" x2="100" y2="190" stroke="var(--text-color)" strokeWidth="4" />
          <line x1="30" y1="190" x2="30" y2="20" stroke="var(--text-color)" strokeWidth="4" />
          <line x1="30" y1="20" x2="120" y2="20" stroke="var(--text-color)" strokeWidth="4" />
          <line x1="120" y1="20" x2="120" y2="40" stroke="var(--text-color)" strokeWidth="4" />

          {/* Head */}
          {wrongGuesses >= 1 && (
            <circle cx="120" cy="60" r="20" stroke="var(--text-color)" strokeWidth="4" fill="none" />
          )}

          {/* Body */}
          {wrongGuesses >= 2 && (
            <line x1="120" y1="80" x2="120" y2="130" stroke="var(--text-color)" strokeWidth="4" />
          )}

          {/* Left arm */}
          {wrongGuesses >= 3 && (
            <line x1="120" y1="90" x2="90" y2="110" stroke="var(--text-color)" strokeWidth="4" />
          )}

          {/* Right arm */}
          {wrongGuesses >= 4 && (
            <line x1="120" y1="90" x2="150" y2="110" stroke="var(--text-color)" strokeWidth="4" />
          )}

          {/* Left leg */}
          {wrongGuesses >= 5 && (
            <line x1="120" y1="130" x2="100" y2="160" stroke="var(--text-color)" strokeWidth="4" />
          )}

          {/* Right leg */}
          {wrongGuesses >= 6 && (
            <line x1="120" y1="130" x2="140" y2="160" stroke="var(--text-color)" strokeWidth="4" />
          )}
        </svg>
      </div>

      <div className="hangman-stats">
        <div className="stat">Wrong guesses: {wrongGuesses} / {MAX_WRONG_GUESSES}</div>
      </div>

      <div className="hangman-word">
        {displayWord}
      </div>

      <div className="hangman-keyboard">
        {alphabet.map(letter => (
          <button
            key={letter}
            onClick={() => handleGuess(letter)}
            disabled={guessedLetters.has(letter) || gameStatus !== 'playing'}
            className={`hangman-key ${
              guessedLetters.has(letter)
                ? targetWord.includes(letter)
                  ? 'correct'
                  : 'wrong'
                : ''
            }`}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Hangman;
