import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKidsContent } from '../contexts/KidsContentContext';
import './KidsStoryCard.css';

const KidsStoryCard = ({ story }) => {
  const navigate = useNavigate();
  const { isFavorite, isCompleted } = useKidsContent();

  const handleClick = () => {
    navigate(`/kids/story/${story.id}`);
  };

  return (
    <div className="kids-story-card" onClick={handleClick}>
      {isCompleted(story.id) && (
        <div className="completed-badge">
          <span className="badge-icon">✅</span>
          Done!
        </div>
      )}
      {isFavorite(story.id) && !isCompleted(story.id) && (
        <div className="favorite-badge">
          <span className="badge-icon">❤️</span>
        </div>
      )}

      <div className="story-card-emoji">{story.emoji}</div>
      <h3 className="story-card-title">{story.title}</h3>
      <p className="story-card-summary">{story.summary}</p>

      <div className="story-card-footer">
        <span className="story-card-duration">
          <span className="footer-icon">⏱️</span>
          {story.duration}
        </span>
        <span className={`story-card-type type-${story.type}`}>
          <span className="footer-icon">{story.type === 'story' ? '📖' : '🎵'}</span>
          {story.type === 'story' ? 'Story' : 'Song'}
        </span>
      </div>
    </div>
  );
};

export default KidsStoryCard;
