import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKidsContent } from '../contexts/KidsContentContext';
import KidsStoryCard from '../components/KidsStoryCard';
import './KidsListPage.css';

const KidsFavoritesPage = () => {
  const navigate = useNavigate();
  const { getFavoriteStories } = useKidsContent();

  const favorites = getFavoriteStories();

  return (
    <div className="kids-list-page">
      <div className="list-header">
        <button className="back-button" onClick={() => navigate('/kids')}>
          <span className="back-icon">←</span> Home
        </button>
        <h1 className="list-title">
          <span className="title-emoji">❤️</span>
          My Favorite Stories
        </h1>
        <p className="list-subtitle">Stories you love the most!</p>
      </div>

      <div className="stories-grid">
        {favorites.map(story => (
          <KidsStoryCard key={story.id} story={story} />
        ))}
      </div>

      {favorites.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">💝</div>
          <h3>No favorites yet!</h3>
          <p>Tap the heart ❤️ on stories you love</p>
          <button className="kids-btn kids-btn-primary" onClick={() => navigate('/kids/all-stories')}>
            <span className="btn-icon">📚</span>
            Find Stories
          </button>
        </div>
      )}
    </div>
  );
};

export default KidsFavoritesPage;
