import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKidsContent } from '../contexts/KidsContentContext';
import KidsStoryCard from '../components/KidsStoryCard';
import './KidsListPage.css';

const KidsAllStoriesPage = () => {
  const navigate = useNavigate();
  const { getStories } = useKidsContent();

  const stories = getStories();

  return (
    <div className="kids-list-page">
      <div className="list-header">
        <button className="back-button" onClick={() => navigate('/kids')}>
          <span className="back-icon">←</span> Home
        </button>
        <h1 className="list-title">
          <span className="title-emoji">📚</span>
          All Bible Stories
        </h1>
        <p className="list-subtitle">Discover amazing stories from the Bible!</p>
      </div>

      <div className="stories-grid">
        {stories.map(story => (
          <KidsStoryCard key={story.id} story={story} />
        ))}
      </div>

      {stories.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">😕</div>
          <p>No stories found</p>
        </div>
      )}
    </div>
  );
};

export default KidsAllStoriesPage;
