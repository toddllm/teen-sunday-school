import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKidsContent } from '../contexts/KidsContentContext';
import './KidsHomePage.css';

const KidsHomePage = () => {
  const navigate = useNavigate();
  const { getTodaysStory, getFavoriteStories, getSongs, stats } = useKidsContent();

  const todaysStory = getTodaysStory();
  const favoriteStories = getFavoriteStories();
  const songs = getSongs();

  const handleTileClick = (path) => {
    navigate(path);
  };

  return (
    <div className="kids-home">
      <div className="kids-home-header">
        <h1 className="kids-home-title">
          <span className="wave">👋</span> Hi Friend!
        </h1>
        <p className="kids-home-subtitle">What do you want to do today?</p>
      </div>

      <div className="kids-tiles-container">
        {/* Today's Story Tile */}
        <div
          className="kids-tile kids-tile-primary"
          onClick={() => handleTileClick(`/kids/story/${todaysStory.id}`)}
        >
          <div className="kids-tile-emoji">{todaysStory.emoji}</div>
          <h2 className="kids-tile-title">Today's Story</h2>
          <p className="kids-tile-description">{todaysStory.title}</p>
          <div className="kids-tile-badge">
            <span className="badge-icon">⭐</span>
            <span>New!</span>
          </div>
        </div>

        {/* Songs & Memory Verses Tile */}
        <div
          className="kids-tile kids-tile-secondary"
          onClick={() => handleTileClick('/kids/songs')}
        >
          <div className="kids-tile-emoji">🎵</div>
          <h2 className="kids-tile-title">Songs & Verses</h2>
          <p className="kids-tile-description">Sing and learn together!</p>
          <div className="kids-tile-count">{songs.length} songs</div>
        </div>

        {/* Favorite Stories Tile */}
        <div
          className="kids-tile kids-tile-accent"
          onClick={() => handleTileClick('/kids/favorites')}
        >
          <div className="kids-tile-emoji">❤️</div>
          <h2 className="kids-tile-title">My Favorites</h2>
          <p className="kids-tile-description">Stories you love!</p>
          <div className="kids-tile-count">
            {favoriteStories.length > 0 ? `${favoriteStories.length} favorites` : 'Add some!'}
          </div>
        </div>

        {/* All Stories Tile */}
        <div
          className="kids-tile kids-tile-info"
          onClick={() => handleTileClick('/kids/all-stories')}
        >
          <div className="kids-tile-emoji">📚</div>
          <h2 className="kids-tile-title">All Stories</h2>
          <p className="kids-tile-description">Explore Bible stories!</p>
          <div className="kids-tile-count">{stats.totalStories} stories</div>
        </div>

        {/* My Progress Tile */}
        <div
          className="kids-tile kids-tile-success"
          onClick={() => handleTileClick('/kids/progress')}
        >
          <div className="kids-tile-emoji">🏆</div>
          <h2 className="kids-tile-title">My Progress</h2>
          <p className="kids-tile-description">See what you've learned!</p>
          <div className="kids-tile-count">
            {stats.completedCount} completed
          </div>
        </div>

        {/* Games Tile */}
        <div
          className="kids-tile kids-tile-warning"
          onClick={() => handleTileClick('/games')}
        >
          <div className="kids-tile-emoji">🎮</div>
          <h2 className="kids-tile-title">Fun Games</h2>
          <p className="kids-tile-description">Play and learn!</p>
          <div className="kids-tile-badge">
            <span className="badge-icon">🎯</span>
            <span>Play!</span>
          </div>
        </div>
      </div>

      {/* Encouragement Message */}
      <div className="kids-encouragement">
        <p className="encouragement-text">
          <span className="encouragement-icon">✨</span>
          You're doing great! Keep learning about God!
          <span className="encouragement-icon">✨</span>
        </p>
      </div>
    </div>
  );
};

export default KidsHomePage;
