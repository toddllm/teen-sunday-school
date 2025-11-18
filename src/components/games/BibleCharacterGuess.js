import React, { useState, useEffect, useCallback } from 'react';
import './BibleCharacterGuess.css';

const BibleCharacterGuess = ({ characters = [], mode = 'solo' }) => {
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [usedCharacters, setUsedCharacters] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const MAX_HINTS = 3;
  const MAX_ATTEMPTS = 3;

  const getNewCharacter = useCallback(() => {
    if (characters.length === 0) return;

    // Filter out characters that have been used
    const availableCharacters = characters.filter(
      char => !usedCharacters.includes(char.id)
    );

    // If all characters have been used, reset
    if (availableCharacters.length === 0) {
      setUsedCharacters([]);
      setRound(1);
      setScore(0);
      return getNewCharacter();
    }

    const randomChar = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
    setCurrentCharacter(randomChar);
    setCurrentHintIndex(0);
    setGuess('');
    setGameStatus('playing');
    setMessage('');
    setAttempts(0);
  }, [characters, usedCharacters]);

  useEffect(() => {
    getNewCharacter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters]);

  const revealNextHint = () => {
    if (currentHintIndex < MAX_HINTS - 1 && currentHintIndex < (currentCharacter?.hints?.length || 0) - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const handleSubmitGuess = (e) => {
    e.preventDefault();

    if (gameStatus !== 'playing' || !guess.trim()) return;

    const userGuess = guess.trim().toLowerCase();
    const correctAnswer = currentCharacter.name.toLowerCase();

    if (userGuess === correctAnswer) {
      // Correct guess!
      const pointsEarned = MAX_HINTS - currentHintIndex;
      setScore(score + pointsEarned);
      setGameStatus('won');
      setMessage(`🎉 Correct! It's ${currentCharacter.name}! You earned ${pointsEarned} point${pointsEarned !== 1 ? 's' : ''}!`);
      setUsedCharacters([...usedCharacters, currentCharacter.id]);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setGameStatus('lost');
        setMessage(`❌ Game Over! The answer was: ${currentCharacter.name}`);
        setUsedCharacters([...usedCharacters, currentCharacter.id]);
      } else {
        setMessage(`❌ Not quite! ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts !== 1 ? 's' : ''} remaining.`);
        setTimeout(() => setMessage(''), 2000);
      }
    }

    setGuess('');
  };

  const handleNextRound = () => {
    setRound(round + 1);
    getNewCharacter();
  };

  const handleRestart = () => {
    setScore(0);
    setRound(1);
    setUsedCharacters([]);
    getNewCharacter();
  };

  if (characters.length === 0) {
    return (
      <div className="character-guess-container">
        <div className="character-guess-message error">
          No character riddles available! Add characters in the admin panel.
        </div>
      </div>
    );
  }

  if (!currentCharacter) {
    return (
      <div className="character-guess-container">
        <div className="character-guess-message">Loading...</div>
      </div>
    );
  }

  const visibleHints = currentCharacter.hints?.slice(0, currentHintIndex + 1) || [];
  const canRevealMore = currentHintIndex < MAX_HINTS - 1 &&
                         currentHintIndex < (currentCharacter.hints?.length || 0) - 1 &&
                         gameStatus === 'playing';

  return (
    <div className="character-guess-container">
      <div className="character-guess-header">
        <div className="game-info">
          <h2>Guess the Character</h2>
          <span className="game-mode-badge">{mode === 'solo' ? '🎮 Solo' : '👥 Group'}</span>
        </div>
        <button onClick={handleRestart} className="character-guess-reset-btn">
          Restart Game
        </button>
      </div>

      <div className="character-guess-stats">
        <div className="stat">
          <span className="stat-label">Round:</span>
          <span className="stat-value">{round}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Attempts:</span>
          <span className="stat-value">{attempts} / {MAX_ATTEMPTS}</span>
        </div>
        {currentCharacter.difficulty && (
          <div className={`stat difficulty-${currentCharacter.difficulty}`}>
            <span className="stat-label">Difficulty:</span>
            <span className="stat-value">{currentCharacter.difficulty}</span>
          </div>
        )}
      </div>

      {message && (
        <div className={`character-guess-message ${gameStatus === 'won' ? 'success' : gameStatus === 'lost' ? 'error' : 'info'}`}>
          {message}
        </div>
      )}

      <div className="hints-section">
        <div className="hints-header">
          <h3>🕵️ Clues:</h3>
          <span className="hint-counter">
            {currentHintIndex + 1} of {currentCharacter.hints?.length || 0} revealed
          </span>
        </div>

        <div className="hints-list">
          {visibleHints.map((hint, index) => (
            <div key={index} className="hint-item">
              <span className="hint-number">#{index + 1}</span>
              <span className="hint-text">{hint}</span>
            </div>
          ))}
        </div>

        {canRevealMore && (
          <button
            className="reveal-hint-btn"
            onClick={revealNextHint}
          >
            💡 Reveal Next Clue
          </button>
        )}
      </div>

      {gameStatus === 'playing' && (
        <form onSubmit={handleSubmitGuess} className="guess-form">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Who am I?"
            className="guess-input"
            autoFocus
          />
          <button type="submit" className="submit-guess-btn" disabled={!guess.trim()}>
            Submit Guess
          </button>
        </form>
      )}

      {(gameStatus === 'won' || gameStatus === 'lost') && (
        <div className="round-complete">
          {currentCharacter.description && (
            <div className="character-info">
              <h4>About {currentCharacter.name}:</h4>
              <p>{currentCharacter.description}</p>
              {currentCharacter.scriptureRef && (
                <p className="scripture-ref">📖 {currentCharacter.scriptureRef}</p>
              )}
            </div>
          )}

          <button onClick={handleNextRound} className="next-round-btn">
            Next Character →
          </button>
        </div>
      )}

      <div className="scoring-guide">
        <h4>Scoring:</h4>
        <ul>
          <li>🥇 Guess with 1 hint: 3 points</li>
          <li>🥈 Guess with 2 hints: 2 points</li>
          <li>🥉 Guess with 3 hints: 1 point</li>
        </ul>
      </div>

      {mode === 'group' && (
        <div className="group-mode-hint">
          <p>👥 <strong>Group Mode:</strong> Leader can reveal hints. Teens can answer aloud or submit guesses.</p>
        </div>
      )}
    </div>
  );
};

export default BibleCharacterGuess;
