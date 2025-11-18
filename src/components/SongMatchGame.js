import React, { useState, useEffect } from 'react';
import './SongMatchGame.css';

/**
 * SongMatchGame Component
 * Game to match lyric snippets with themes
 */

const SongMatchGame = ({ theme }) => {
  const [songs, setSongs] = useState([]);
  const [gameCards, setGameCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, [theme]);

  const fetchSongs = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (theme) params.append('theme', theme);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/songs?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }

      const data = await response.json();

      // Filter songs that have game snippets
      const gameSongs = data.filter(song => song.gameSnippet && song.gameTheme);

      // Take up to 6 songs for the game
      const selectedSongs = gameSongs.slice(0, 6);
      setSongs(selectedSongs);

      // Create game cards (snippet cards and theme cards)
      const cards = [];
      selectedSongs.forEach((song, index) => {
        cards.push({
          id: `snippet-${index}`,
          type: 'snippet',
          content: song.gameSnippet,
          matchId: song.id,
          songId: song.id,
        });
        cards.push({
          id: `theme-${index}`,
          type: 'theme',
          content: song.gameTheme,
          matchId: song.id,
          songId: song.id,
        });
      });

      // Shuffle cards
      const shuffled = shuffleArray(cards);
      setGameCards(shuffled);
    } catch (err) {
      console.error('Error fetching songs:', err);
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleCardClick = (card) => {
    // Ignore if card is already matched or already selected
    if (
      matchedPairs.includes(card.matchId) ||
      selectedCards.find(c => c.id === card.id)
    ) {
      return;
    }

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    // If two cards are selected, check for match
    if (newSelected.length === 2) {
      setAttempts(attempts + 1);
      checkMatch(newSelected[0], newSelected[1]);
    }
  };

  const checkMatch = async (card1, card2) => {
    // Cards match if they have the same matchId and different types
    if (card1.matchId === card2.matchId && card1.type !== card2.type) {
      // Match!
      setMatchedPairs([...matchedPairs, card1.matchId]);
      setScore(score + 10);
      setSelectedCards([]);

      // Track metric
      await trackGamePlay(card1.songId);

      // Check if game is complete
      if (matchedPairs.length + 1 === songs.length) {
        setGameComplete(true);
      }
    } else {
      // No match - clear selection after a delay
      setTimeout(() => {
        setSelectedCards([]);
      }, 1000);
    }
  };

  const trackGamePlay = async (songId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/songs/${songId}/metrics`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metricType: 'GAME_PLAY',
          }),
        }
      );
    } catch (err) {
      console.error('Error tracking game play:', err);
    }
  };

  const resetGame = () => {
    setMatchedPairs([]);
    setSelectedCards([]);
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
    fetchSongs(); // Re-fetch and shuffle
  };

  if (loading) {
    return (
      <div className="song-match-game">
        <div className="loading">Loading game...</div>
      </div>
    );
  }

  if (songs.length < 3) {
    return (
      <div className="song-match-game">
        <div className="no-songs">Not enough songs available for this game.</div>
      </div>
    );
  }

  return (
    <div className="song-match-game">
      <div className="game-header">
        <h3>Song Match Game</h3>
        <p>Match the lyric snippets with their themes!</p>
      </div>

      <div className="game-stats">
        <div className="stat">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Attempts:</span>
          <span className="stat-value">{attempts}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Matches:</span>
          <span className="stat-value">{matchedPairs.length} / {songs.length}</span>
        </div>
      </div>

      <div className="game-grid">
        {gameCards.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            isSelected={selectedCards.find(c => c.id === card.id)}
            isMatched={matchedPairs.includes(card.matchId)}
            onClick={() => handleCardClick(card)}
          />
        ))}
      </div>

      {gameComplete && (
        <div className="game-complete">
          <h4>Congratulations!</h4>
          <p>You completed the game with a score of {score}!</p>
          <p>Attempts: {attempts}</p>
          <button className="reset-button" onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}

      {!gameComplete && (
        <button className="reset-button" onClick={resetGame}>
          Reset Game
        </button>
      )}
    </div>
  );
};

const GameCard = ({ card, isSelected, isMatched, onClick }) => {
  const cardClass = `game-card ${card.type} ${
    isMatched ? 'matched' : isSelected ? 'selected' : ''
  }`;

  return (
    <div className={cardClass} onClick={onClick}>
      <div className="card-type-label">
        {card.type === 'snippet' ? 'Lyric' : 'Theme'}
      </div>
      <div className="card-content">{card.content}</div>
    </div>
  );
};

export default SongMatchGame;
