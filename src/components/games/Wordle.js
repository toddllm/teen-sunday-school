import React, { useState, useEffect, useCallback } from 'react';
import './Wordle.css';

const Wordle = ({ words = [] }) => {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [message, setMessage] = useState('');
  const MAX_GUESSES = 6;

  // Initialize game with a random word
  useEffect(() => {
    if (words.length > 0) {
      const randomWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
      setTargetWord(randomWord);
    }
  }, [words]);

  const resetGame = () => {
    if (words.length > 0) {
      const randomWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
      setTargetWord(randomWord);
      setGuesses([]);
      setCurrentGuess('');
      setGameStatus('playing');
      setMessage('');
    }
  };

  const checkGuess = (guess) => {
    const result = [];
    const targetLetters = targetWord.split('');
    const guessLetters = guess.split('');
    const letterCount = {};

    // Count letters in target word
    targetLetters.forEach(letter => {
      letterCount[letter] = (letterCount[letter] || 0) + 1;
    });

    // First pass: mark correct positions (green)
    guessLetters.forEach((letter, i) => {
      if (letter === targetLetters[i]) {
        result[i] = 'correct';
        letterCount[letter]--;
      }
    });

    // Second pass: mark present letters (yellow) and absent (gray)
    guessLetters.forEach((letter, i) => {
      if (result[i] === 'correct') return;

      if (targetLetters.includes(letter) && letterCount[letter] > 0) {
        result[i] = 'present';
        letterCount[letter]--;
      } else {
        result[i] = 'absent';
      }
    });

    return result;
  };

  const submitGuess = useCallback(() => {
    if (gameStatus !== 'playing') return;
    if (currentGuess.length !== targetWord.length) {
      setMessage(`Word must be ${targetWord.length} letters!`);
      return;
    }

    const result = checkGuess(currentGuess);
    const newGuesses = [...guesses, { word: currentGuess, result }];
    setGuesses(newGuesses);
    setCurrentGuess('');
    setMessage('');

    // Check win condition
    if (currentGuess === targetWord) {
      setGameStatus('won');
      setMessage('🎉 Congratulations! You found the word!');
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameStatus('lost');
      setMessage(`Game Over! The word was: ${targetWord}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGuess, targetWord, guesses, gameStatus]);

  const handleKeyPress = useCallback((e) => {
    if (gameStatus !== 'playing') return;

    if (e.key === 'Enter') {
      submitGuess();
    } else if (e.key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < targetWord.length) {
      setCurrentGuess(prev => prev + e.key.toUpperCase());
    }
  }, [currentGuess, targetWord.length, gameStatus, submitGuess]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (words.length === 0) {
    return (
      <div className="wordle-container">
        <div className="wordle-message error">
          No words available for Wordle! Add words in the admin panel.
        </div>
      </div>
    );
  }

  if (!targetWord) {
    return (
      <div className="wordle-container">
        <div className="wordle-message">Loading...</div>
      </div>
    );
  }

  const emptyRows = MAX_GUESSES - guesses.length - (gameStatus === 'playing' ? 1 : 0);

  return (
    <div className="wordle-container">
      <div className="wordle-header">
        <h2>Wordle</h2>
        <button onClick={resetGame} className="wordle-reset-btn">New Game</button>
      </div>

      {message && (
        <div className={`wordle-message ${gameStatus === 'won' ? 'success' : gameStatus === 'lost' ? 'error' : ''}`}>
          {message}
        </div>
      )}

      <div className="wordle-board">
        {/* Previous guesses */}
        {guesses.map((guess, guessIndex) => (
          <div key={guessIndex} className="wordle-row">
            {guess.word.split('').map((letter, letterIndex) => (
              <div
                key={letterIndex}
                className={`wordle-tile ${guess.result[letterIndex]}`}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}

        {/* Current guess row */}
        {gameStatus === 'playing' && (
          <div className="wordle-row">
            {Array.from({ length: targetWord.length }).map((_, i) => (
              <div key={i} className={`wordle-tile ${currentGuess[i] ? 'filled' : ''}`}>
                {currentGuess[i] || ''}
              </div>
            ))}
          </div>
        )}

        {/* Empty rows */}
        {Array.from({ length: emptyRows }).map((_, i) => (
          <div key={`empty-${i}`} className="wordle-row">
            {Array.from({ length: targetWord.length }).map((_, j) => (
              <div key={j} className="wordle-tile"></div>
            ))}
          </div>
        ))}
      </div>

      <div className="wordle-info">
        <p>Guess {guesses.length + 1} of {MAX_GUESSES}</p>
        <p className="wordle-hint">Type your guess and press Enter</p>
      </div>
    </div>
  );
};

export default Wordle;
