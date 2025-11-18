import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLessons } from '../contexts/LessonContext';
import './GamesPage.css';

const GamesPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { lessons } = useLessons();

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
      id: 'word-scramble',
      name: 'Word Scramble',
      description: 'Unscramble words from the lesson',
      icon: '🔤'
    },
    {
      id: 'hangman',
      name: 'Hangman',
      description: 'Guess the word letter by letter',
      icon: '🎯'
    },
    {
      id: 'word-search',
      name: 'Word Search',
      description: 'Find hidden words in the grid',
      icon: '🔍'
    }
  ];

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
            <button className="play-btn" onClick={() => alert(`${game.name} coming soon!`)}>
              Play Game
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesPage;
