import React, { useState, useEffect } from 'react';
import './WordScramble.css';

const WordScramble = ({ words = [] }) => {
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [usedWords, setUsedWords] = useState([]);

  const scrambleWord = (word) => {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  };

  const getNewWord = () => {
    if (words.length === 0) return;

    const availableWords = words.filter(w => !usedWords.includes(w));

    if (availableWords.length === 0) {
      setMessage('🎉 You\'ve unscrambled all the words! Great job!');
      return;
    }

    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentWord(randomWord.toUpperCase());
    setScrambledWord(scrambleWord(randomWord.toUpperCase()));
    setUserGuess('');
    setMessage('');
  };

  useEffect(() => {
    getNewWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (userGuess.toUpperCase() === currentWord) {
      setScore(score + 1);
      setUsedWords([...usedWords, currentWord]);
      setMessage('✅ Correct! Great job!');
      setTimeout(() => {
        getNewWord();
      }, 1500);
    } else {
      setMessage('❌ Not quite! Try again.');
    }
  };

  const handleSkip = () => {
    setUsedWords([...usedWords, currentWord]);
    getNewWord();
  };

  const resetGame = () => {
    setScore(0);
    setUsedWords([]);
    setMessage('');
    getNewWord();
  };

  if (words.length === 0) {
    return (
      <div className="word-scramble-container">
        <div className="scramble-message error">
          No words available for Word Scramble! Add words in the admin panel.
        </div>
      </div>
    );
  }

  return (
    <div className="word-scramble-container">
      <div className="scramble-header">
        <h2>Word Scramble</h2>
        <div className="scramble-score">
          Score: {score} / {words.length}
        </div>
      </div>

      {message && (
        <div className={`scramble-message ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info'}`}>
          {message}
        </div>
      )}

      {currentWord ? (
        <>
          <div className="scrambled-word-display">
            {scrambledWord.split('').map((letter, index) => (
              <span key={index} className="scramble-letter">
                {letter}
              </span>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="scramble-form">
            <input
              type="text"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              placeholder="Type your answer..."
              className="scramble-input"
              autoFocus
            />
            <div className="scramble-buttons">
              <button type="submit" className="scramble-btn submit-btn">
                Submit
              </button>
              <button type="button" onClick={handleSkip} className="scramble-btn skip-btn">
                Skip
              </button>
              <button type="button" onClick={resetGame} className="scramble-btn reset-btn">
                Reset
              </button>
            </div>
          </form>

          <div className="scramble-progress">
            <p>{words.length - usedWords.length} words remaining</p>
          </div>
        </>
      ) : (
        <div className="scramble-complete">
          <p>All words completed!</p>
          <button onClick={resetGame} className="scramble-btn reset-btn">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default WordScramble;
