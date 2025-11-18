import React, { useEffect } from 'react';
import { useCharacters } from '../contexts/CharacterContext';
import { formatPassageReference, getCharacterRole, getCategoryColor } from '../services/characterService';
import './CharacterProfileModal.css';

const CharacterProfileModal = ({ characterId, onClose }) => {
  const { getCharacter, getRelatedCharacters, isFavorite, toggleFavorite } = useCharacters();

  const character = getCharacter(characterId);
  const relatedCharacters = getRelatedCharacters(characterId);
  const favorite = isFavorite(characterId);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Handle ESC key to close
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!character) {
    return null;
  }

  const role = getCharacterRole(character);
  const roleColor = getCategoryColor(role);

  const handleBackdropClick = (e) => {
    if (e.target.className === 'character-modal-backdrop') {
      onClose();
    }
  };

  const handleFavoriteClick = () => {
    toggleFavorite(characterId);
  };

  return (
    <div className="character-modal-backdrop" onClick={handleBackdropClick}>
      <div className="character-modal-content">
        {/* Header */}
        <div className="character-modal-header">
          <div className="character-header-left">
            <h2>{character.name}</h2>
            {character.altNames && character.altNames.length > 0 && (
              <p className="character-alt-names">
                Also known as: {character.altNames.join(', ')}
              </p>
            )}
          </div>
          <div className="character-header-right">
            <button
              className={`favorite-btn ${favorite ? 'favorited' : ''}`}
              onClick={handleFavoriteClick}
              title={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {favorite ? '★' : '☆'}
            </button>
            <button className="close-btn" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        </div>

        {/* Role Badge */}
        <div className="character-role-badge" style={{ backgroundColor: roleColor }}>
          {role}
        </div>

        {/* Body */}
        <div className="character-modal-body">
          {/* Summary */}
          <section className="character-section">
            <h3>Summary</h3>
            <p className="character-summary">{character.summary}</p>
          </section>

          {/* Key Life Events */}
          {character.keyLifeEvents && character.keyLifeEvents.length > 0 && (
            <section className="character-section">
              <h3>Key Life Events</h3>
              <ul className="character-events-list">
                {character.keyLifeEvents.map((event, index) => (
                  <li key={index}>{event}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Primary Passages */}
          {character.primaryPassages && character.primaryPassages.length > 0 && (
            <section className="character-section">
              <h3>Where to Read About {character.name}</h3>
              <div className="character-passages">
                {character.primaryPassages.map((passage, index) => (
                  <div key={index} className="passage-item">
                    <div className="passage-reference">
                      📖 {formatPassageReference(passage)}
                    </div>
                    {passage.note && (
                      <div className="passage-note">{passage.note}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Relationships */}
          {relatedCharacters && relatedCharacters.length > 0 && (
            <section className="character-section">
              <h3>Relationships</h3>
              <div className="character-relationships">
                {relatedCharacters.map((rel, index) => (
                  <div key={index} className="relationship-item">
                    <div className="relationship-name">
                      {rel.character ? (
                        <strong>{rel.character.name}</strong>
                      ) : (
                        <strong>{rel.characterId}</strong>
                      )}
                    </div>
                    <div className="relationship-type">
                      {rel.type.charAt(0).toUpperCase() + rel.type.slice(1)}
                    </div>
                    {rel.description && (
                      <div className="relationship-description">
                        {rel.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="character-modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterProfileModal;
