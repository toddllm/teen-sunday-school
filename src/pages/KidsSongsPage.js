import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKidsContent } from '../contexts/KidsContentContext';
import KidsStoryCard from '../components/KidsStoryCard';
import './KidsListPage.css';

const KidsSongsPage = () => {
  const navigate = useNavigate();
  const { getSongs } = useKidsContent();

  const songs = getSongs();

  return (
    <div className="kids-list-page">
      <div className="list-header">
        <button className="back-button" onClick={() => navigate('/kids')}>
          <span className="back-icon">←</span> Home
        </button>
        <h1 className="list-title">
          <span className="title-emoji">🎵</span>
          Songs & Memory Verses
        </h1>
        <p className="list-subtitle">Sing and memorize God's Word!</p>
      </div>

      <div className="stories-grid">
        {songs.map(song => (
          <KidsStoryCard key={song.id} story={song} />
        ))}
      </div>

      {songs.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">🎶</div>
          <p>No songs available</p>
        </div>
      )}
    </div>
  );
};

export default KidsSongsPage;
