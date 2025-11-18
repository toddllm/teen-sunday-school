import React, { useState } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import './AvatarSelector.css';

/**
 * AvatarSelector Component
 *
 * Grid of selectable avatars organized by category.
 *
 * @param {Object} props
 * @param {string} props.selectedId - Currently selected avatar ID
 * @param {Function} props.onSelect - Callback when avatar is selected
 * @param {string} props.categoryFilter - Filter by category (optional)
 */
function AvatarSelector({ selectedId, onSelect, categoryFilter = null }) {
  const { avatars, avatarsByCategory } = useProfile();
  const [activeCategory, setActiveCategory] = useState(categoryFilter || 'all');

  // Get unique categories
  const categories = ['all', ...Object.keys(avatarsByCategory).sort()];

  // Filter avatars based on category
  const filteredAvatars =
    activeCategory === 'all'
      ? avatars
      : avatarsByCategory[activeCategory] || [];

  const handleAvatarClick = (avatar) => {
    onSelect(avatar.id);
  };

  return (
    <div className="avatar-selector">
      {/* Category tabs */}
      {!categoryFilter && (
        <div className="avatar-selector__categories">
          {categories.map((category) => (
            <button
              key={category}
              className={`avatar-selector__category ${
                activeCategory === category ? 'avatar-selector__category--active' : ''
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Avatar grid */}
      <div className="avatar-selector__grid">
        {filteredAvatars.map((avatar) => (
          <button
            key={avatar.id}
            className={`avatar-selector__item ${
              selectedId === avatar.id ? 'avatar-selector__item--selected' : ''
            }`}
            onClick={() => handleAvatarClick(avatar)}
            title={avatar.displayName}
          >
            <img
              src={avatar.imageUrl}
              alt={avatar.displayName}
              className="avatar-selector__image"
            />
            {selectedId === avatar.id && (
              <div className="avatar-selector__check">✓</div>
            )}
          </button>
        ))}
      </div>

      {filteredAvatars.length === 0 && (
        <div className="avatar-selector__empty">
          No avatars available in this category.
        </div>
      )}
    </div>
  );
}

export default AvatarSelector;
