import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLessons } from '../contexts/LessonContext';
import Wordle from '../components/games/Wordle';
import WordScramble from '../components/games/WordScramble';
import Hangman from '../components/games/Hangman';
import WordSearch from '../components/games/WordSearch';
import BibleCharacterGuess from '../components/games/BibleCharacterGuess';
import './GamesPage.css';

const GamesPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { lessons } = useLessons();
  const [selectedGame, setSelectedGame] = useState(null);

  const lesson = lessons.find(l => l.id === lessonId);

  if (!lesson) {
    return (
      <div className="games-page">
        <div className="error-message">
          <h2>Lesson not found</h2>
          <button onClick={() => navigate('/lessons')} className="back-btn">
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  const availableGames = [
    {
      id: 'wordle',
      name: 'Wordle',
      description: 'Guess the 5-letter word',
      icon: '🎯',
      component: Wordle,
      words: lesson.wordGames?.wordle || []
    },
    {
      id: 'word-scramble',
      name: 'Word Scramble',
      description: 'Unscramble words from the lesson',
      icon: '🔤',
      component: WordScramble,
      words: lesson.wordGames?.scramble || []
    },
    {
      id: 'hangman',
      name: 'Hangman',
      description: 'Guess the word letter by letter',
      icon: '🎮',
      component: Hangman,
      words: lesson.wordGames?.hangman || []
    },
    {
      id: 'word-search',
      name: 'Word Search',
      description: 'Find hidden words in the grid',
      icon: '🔍',
      component: WordSearch,
      words: lesson.wordGames?.wordSearch?.words || [],
      gridSize: lesson.wordGames?.wordSearch?.grid || 10
    },
    {
      id: 'character-guess',
      name: 'Guess the Character',
      description: 'Who am I? Biblical character riddles',
      icon: '🕵️',
      component: BibleCharacterGuess,
      characters: lesson.bibleCharacterGames?.characters || [],
      mode: 'solo'
    }
  ];

  if (selectedGame) {
    const game = availableGames.find(g => g.id === selectedGame);
    const GameComponent = game.component;

    return (
      <div className="games-page">
        <div className="games-header">
          <h1>{game.name} - {lesson.title}</h1>
          <button onClick={() => setSelectedGame(null)} className="back-btn">
            Back to Games
          </button>
        </div>

        <div className="game-container">
          <GameComponent
            words={game.words}
            gridSize={game.gridSize}
            characters={game.characters}
            mode={game.mode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>Games for: {lesson.title}</h1>
        <button onClick={() => navigate(`/lesson/${lessonId}`)} className="back-btn">
          Back to Lesson
        </button>
      </div>

      <div className="games-grid">
        {availableGames.map(game => (
          <div key={game.id} className="game-card">
            <div className="game-icon">{game.icon}</div>
            <h3>{game.name}</h3>
            <p>{game.description}</p>
            <p className="word-count">
              {game.characters
                ? `${game.characters.length} character${game.characters.length !== 1 ? 's' : ''} available`
                : `${game.words.length} word${game.words.length !== 1 ? 's' : ''} available`
              }
            </p>
            <button
              className="play-btn"
              onClick={() => setSelectedGame(game.id)}
              disabled={game.characters ? game.characters.length === 0 : game.words.length === 0}
            >
              {(game.characters ? game.characters.length : game.words.length) > 0
                ? 'Play Game'
                : game.characters ? 'No characters available' : 'No words available'
              }
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesPage;
