import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLessons } from '../contexts/LessonContext';
import './GamesAdminPage.css';

const GamesAdminPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { lessons, updateLesson } = useLessons();
  const lesson = lessons.find(l => l.id === lessonId);

  const [wordGames, setWordGames] = useState({
    wordle: [],
    scramble: [],
    hangman: [],
    wordSearch: {
      words: [],
      grid: 10
    }
  });

  const [newWords, setNewWords] = useState({
    wordle: '',
    scramble: '',
    hangman: '',
    wordSearch: ''
  });

  const [gridSize, setGridSize] = useState(10);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (lesson?.wordGames) {
      setWordGames({
        wordle: lesson.wordGames.wordle || [],
        scramble: lesson.wordGames.scramble || [],
        hangman: lesson.wordGames.hangman || [],
        wordSearch: lesson.wordGames.wordSearch || { words: [], grid: 10 }
      });
      setGridSize(lesson.wordGames.wordSearch?.grid || 10);
    }
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="games-admin-page">
        <div className="error-message">
          <h2>Lesson not found</h2>
          <button onClick={() => navigate('/admin')} className="back-btn">
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  const handleAddWord = (gameType) => {
    const word = newWords[gameType].trim().toUpperCase();

    if (!word) {
      setMessage('Please enter a word!');
      return;
    }

    // Validate Wordle words (must be 5 letters)
    if (gameType === 'wordle' && word.length !== 5) {
      setMessage('Wordle words must be exactly 5 letters!');
      return;
    }

    // Check for duplicates
    if (gameType === 'wordSearch') {
      if (wordGames.wordSearch.words.includes(word)) {
        setMessage('Word already exists!');
        return;
      }
      setWordGames({
        ...wordGames,
        wordSearch: {
          ...wordGames.wordSearch,
          words: [...wordGames.wordSearch.words, word]
        }
      });
    } else {
      if (wordGames[gameType].includes(word)) {
        setMessage('Word already exists!');
        return;
      }
      setWordGames({
        ...wordGames,
        [gameType]: [...wordGames[gameType], word]
      });
    }

    setNewWords({ ...newWords, [gameType]: '' });
    setMessage(`✅ Added "${word}" to ${getGameName(gameType)}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRemoveWord = (gameType, index) => {
    if (gameType === 'wordSearch') {
      const newWordSearchWords = wordGames.wordSearch.words.filter((_, i) => i !== index);
      setWordGames({
        ...wordGames,
        wordSearch: {
          ...wordGames.wordSearch,
          words: newWordSearchWords
        }
      });
    } else {
      const newWords = wordGames[gameType].filter((_, i) => i !== index);
      setWordGames({
        ...wordGames,
        [gameType]: newWords
      });
    }
  };

  const handleSave = () => {
    updateLesson(lessonId, {
      wordGames: {
        wordle: wordGames.wordle,
        scramble: wordGames.scramble,
        hangman: wordGames.hangman,
        wordSearch: {
          words: wordGames.wordSearch.words,
          grid: gridSize
        }
      }
    });
    setMessage('✅ Games saved successfully!');
    setTimeout(() => {
      navigate(`/admin/edit/${lessonId}`);
    }, 1500);
  };

  const getGameName = (gameType) => {
    const names = {
      wordle: 'Wordle',
      scramble: 'Word Scramble',
      hangman: 'Hangman',
      wordSearch: 'Word Search'
    };
    return names[gameType];
  };

  const renderWordList = (gameType) => {
    const words = gameType === 'wordSearch' ? wordGames.wordSearch.words : wordGames[gameType];

    return (
      <div className="game-section">
        <h3>{getGameName(gameType)}</h3>

        <div className="add-word-section">
          <input
            type="text"
            value={newWords[gameType]}
            onChange={(e) => setNewWords({ ...newWords, [gameType]: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleAddWord(gameType)}
            placeholder={gameType === 'wordle' ? 'Enter 5-letter word...' : 'Enter word...'}
            className="word-input"
          />
          <button onClick={() => handleAddWord(gameType)} className="add-btn">
            Add Word
          </button>
        </div>

        {gameType === 'wordle' && (
          <p className="game-hint">💡 Wordle words must be exactly 5 letters</p>
        )}

        {gameType === 'wordSearch' && (
          <div className="grid-size-section">
            <label htmlFor="gridSize">Grid Size:</label>
            <input
              type="number"
              id="gridSize"
              value={gridSize}
              onChange={(e) => setGridSize(parseInt(e.target.value))}
              min="8"
              max="20"
              className="grid-size-input"
            />
          </div>
        )}

        <div className="words-list">
          {words.length === 0 ? (
            <p className="empty-state">No words added yet</p>
          ) : (
            <ul>
              {words.map((word, index) => (
                <li key={index} className="word-item">
                  <span>{word}</span>
                  <button
                    onClick={() => handleRemoveWord(gameType, index)}
                    className="remove-btn"
                    title="Remove word"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="word-count">
            {words.length} word{words.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="games-admin-page">
      <div className="admin-header">
        <h1>Manage Games for: {lesson.title}</h1>
        <div className="header-buttons">
          <button onClick={() => navigate(`/admin/edit/${lessonId}`)} className="back-btn">
            Back to Lesson
          </button>
          <button onClick={handleSave} className="save-btn">
            Save Changes
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="games-grid">
        {renderWordList('wordle')}
        {renderWordList('scramble')}
        {renderWordList('hangman')}
        {renderWordList('wordSearch')}
      </div>
    </div>
  );
};

export default GamesAdminPage;
