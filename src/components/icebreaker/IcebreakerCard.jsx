import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIcebreakers } from '../../contexts/IcebreakerContext';
import './IcebreakerCard.css';

const IcebreakerCard = ({ icebreaker, onEdit, onDelete, onDuplicate, showActions = true }) => {
  const navigate = useNavigate();
  const { toggleFavorite } = useIcebreakers();
  const [isFavorited, setIsFavorited] = React.useState(false);

  const getCategoryIcon = (category) => {
    const icons = {
      'get-to-know': '👋',
      'faith-based': '✝️',
      'energizer': '⚡',
      'deep-discussion': '💭',
    };
    return icons[category] || '🎯';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'get-to-know': '#3498db',
      'faith-based': '#9b59b6',
      'energizer': '#e74c3c',
      'deep-discussion': '#2ecc71',
    };
    return colors[category] || '#95a5a6';
  };

  const getEnergyLevelColor = (level) => {
    const colors = {
      low: '#27ae60',
      medium: '#f39c12',
      high: '#e74c3c',
    };
    return colors[level] || '#95a5a6';
  };

  const handleCardClick = () => {
    navigate(`/icebreaker/${icebreaker.id}`);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      const favorited = await toggleFavorite(icebreaker.id);
      setIsFavorited(favorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(icebreaker.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(icebreaker.id);
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    if (onDuplicate) onDuplicate(icebreaker.id);
  };

  return (
    <div className="icebreaker-card" onClick={handleCardClick}>
      <div
        className="icebreaker-card-header"
        style={{ borderLeftColor: getCategoryColor(icebreaker.category) }}
      >
        <div className="icebreaker-card-title-row">
          <span className="icebreaker-category-icon">
            {getCategoryIcon(icebreaker.category)}
          </span>
          <h3 className="icebreaker-card-title">{icebreaker.title}</h3>
          <button
            className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
            onClick={handleFavoriteClick}
            aria-label="Toggle favorite"
          >
            {isFavorited ? '★' : '☆'}
          </button>
        </div>
        {icebreaker.description && (
          <p className="icebreaker-card-description">{icebreaker.description}</p>
        )}
      </div>

      <div className="icebreaker-card-body">
        <div className="icebreaker-card-tags">
          <span className="icebreaker-tag category">
            {icebreaker.category.replace('-', ' ')}
          </span>
          <span className="icebreaker-tag age-group">{icebreaker.ageGroup}</span>
          <span className="icebreaker-tag group-size">{icebreaker.groupSize}</span>
          <span
            className="icebreaker-tag energy-level"
            style={{ backgroundColor: getEnergyLevelColor(icebreaker.energyLevel) }}
          >
            {icebreaker.energyLevel} energy
          </span>
        </div>

        <div className="icebreaker-card-meta">
          <div className="meta-item">
            <span className="meta-icon">⏱️</span>
            <span>{icebreaker.durationMinutes} min</span>
          </div>
          {icebreaker.usageCount > 0 && (
            <div className="meta-item">
              <span className="meta-icon">📊</span>
              <span>{icebreaker.usageCount} uses</span>
            </div>
          )}
          {icebreaker.favoriteCount > 0 && (
            <div className="meta-item">
              <span className="meta-icon">★</span>
              <span>{icebreaker.favoriteCount}</span>
            </div>
          )}
        </div>
      </div>

      {showActions && (
        <div className="icebreaker-card-actions">
          <button className="action-btn edit-btn" onClick={handleEdit} title="Edit">
            ✏️
          </button>
          <button
            className="action-btn duplicate-btn"
            onClick={handleDuplicate}
            title="Duplicate"
          >
            📋
          </button>
          <button className="action-btn delete-btn" onClick={handleDelete} title="Delete">
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

export default IcebreakerCard;
