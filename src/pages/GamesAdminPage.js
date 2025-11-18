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

  // Bible Character Riddles state
  const [characters, setCharacters] = useState([]);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    hints: ['', '', ''],
    difficulty: 'medium',
    description: '',
    scriptureRef: ''
  });
  const [editingCharacterId, setEditingCharacterId] = useState(null);

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
    if (lesson?.bibleCharacterGames) {
      setCharacters(lesson.bibleCharacterGames.characters || []);
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
      },
      bibleCharacterGames: {
        characters: characters
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

  const handleAddCharacter = () => {
    // Validate character
    if (!newCharacter.name.trim()) {
      setMessage('Please enter a character name!');
      return;
    }

    const validHints = newCharacter.hints.filter(h => h.trim());
    if (validHints.length < 2) {
      setMessage('Please provide at least 2 hints!');
      return;
    }

    const character = {
      id: editingCharacterId || `char-${Date.now()}`,
      name: newCharacter.name.trim(),
      hints: validHints,
      difficulty: newCharacter.difficulty,
      description: newCharacter.description.trim(),
      scriptureRef: newCharacter.scriptureRef.trim()
    };

    if (editingCharacterId) {
      // Update existing character
      setCharacters(characters.map(c => c.id === editingCharacterId ? character : c));
      setMessage(`✅ Updated character: ${character.name}`);
      setEditingCharacterId(null);
    } else {
      // Add new character
      setCharacters([...characters, character]);
      setMessage(`✅ Added character: ${character.name}`);
    }

    // Reset form
    setNewCharacter({
      name: '',
      hints: ['', '', ''],
      difficulty: 'medium',
      description: '',
      scriptureRef: ''
    });

    setTimeout(() => setMessage(''), 3000);
  };

  const handleEditCharacter = (character) => {
    setNewCharacter({
      name: character.name,
      hints: [...character.hints, '', ''].slice(0, 3), // Ensure 3 hint fields
      difficulty: character.difficulty,
      description: character.description || '',
      scriptureRef: character.scriptureRef || ''
    });
    setEditingCharacterId(character.id);
    // Scroll to form
    window.scrollTo({ top: document.querySelector('.character-form')?.offsetTop - 100, behavior: 'smooth' });
  };

  const handleRemoveCharacter = (characterId) => {
    setCharacters(characters.filter(c => c.id !== characterId));
    if (editingCharacterId === characterId) {
      setEditingCharacterId(null);
      setNewCharacter({
        name: '',
        hints: ['', '', ''],
        difficulty: 'medium',
        description: '',
        scriptureRef: ''
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCharacterId(null);
    setNewCharacter({
      name: '',
      hints: ['', '', ''],
      difficulty: 'medium',
      description: '',
      scriptureRef: ''
    });
  };

  const handleHintChange = (index, value) => {
    const newHints = [...newCharacter.hints];
    newHints[index] = value;
    setNewCharacter({ ...newCharacter, hints: newHints });
  };

  const renderCharacterSection = () => {
    return (
      <div className="game-section character-section">
        <h3>🕵️ Bible Character Riddles</h3>
        <p className="game-hint">Create "Who am I?" character guessing games with progressive hints</p>

        <div className="character-form">
          <h4>{editingCharacterId ? 'Edit Character' : 'Add New Character'}</h4>

          <div className="form-group">
            <label htmlFor="charName">Character Name *</label>
            <input
              type="text"
              id="charName"
              value={newCharacter.name}
              onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
              placeholder="e.g., Moses, David, Mary..."
              className="word-input"
            />
          </div>

          <div className="form-group">
            <label>Hints (at least 2 required) *</label>
            {newCharacter.hints.map((hint, index) => (
              <input
                key={index}
                type="text"
                value={hint}
                onChange={(e) => handleHintChange(index, e.target.value)}
                placeholder={`Hint ${index + 1}...`}
                className="word-input hint-input"
              />
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              value={newCharacter.difficulty}
              onChange={(e) => setNewCharacter({ ...newCharacter, difficulty: e.target.value })}
              className="difficulty-select"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={newCharacter.description}
              onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
              placeholder="Brief description shown after guessing..."
              className="description-input"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="scriptureRef">Scripture Reference</label>
            <input
              type="text"
              id="scriptureRef"
              value={newCharacter.scriptureRef}
              onChange={(e) => setNewCharacter({ ...newCharacter, scriptureRef: e.target.value })}
              placeholder="e.g., Exodus 1-40, 1 Samuel 17..."
              className="word-input"
            />
          </div>

          <div className="form-actions">
            <button onClick={handleAddCharacter} className="add-btn">
              {editingCharacterId ? 'Update Character' : 'Add Character'}
            </button>
            {editingCharacterId && (
              <button onClick={handleCancelEdit} className="cancel-btn">
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="characters-list">
          <h4>Added Characters ({characters.length})</h4>
          {characters.length === 0 ? (
            <p className="empty-state">No characters added yet</p>
          ) : (
            <div className="character-cards">
              {characters.map((character) => (
                <div key={character.id} className="character-card">
                  <div className="character-header">
                    <h5>{character.name}</h5>
                    <span className={`difficulty-badge ${character.difficulty}`}>
                      {character.difficulty}
                    </span>
                  </div>
                  <div className="character-hints">
                    <strong>Hints:</strong>
                    <ol>
                      {character.hints.map((hint, idx) => (
                        <li key={idx}>{hint}</li>
                      ))}
                    </ol>
                  </div>
                  {character.description && (
                    <p className="character-description">
                      <strong>Description:</strong> {character.description}
                    </p>
                  )}
                  {character.scriptureRef && (
                    <p className="character-scripture">
                      <strong>Scripture:</strong> {character.scriptureRef}
                    </p>
                  )}
                  <div className="character-actions">
                    <button
                      onClick={() => handleEditCharacter(character)}
                      className="edit-btn"
                      title="Edit character"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveCharacter(character.id)}
                      className="remove-btn"
                      title="Remove character"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
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
        {renderCharacterSection()}
        {renderWordList('wordle')}
        {renderWordList('scramble')}
        {renderWordList('hangman')}
        {renderWordList('wordSearch')}
      </div>
    </div>
  );
};

export default GamesAdminPage;
