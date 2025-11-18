import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCharacters } from '../contexts/CharacterContext';
import CharacterProfileModal from '../components/CharacterProfileModal';
import { getCharacterRole, getCategoryColor, getCharacterTestament } from '../services/characterService';
import './CharacterIndexPage.css';

const CharacterIndexPage = () => {
  const navigate = useNavigate();
  const { id: characterIdFromUrl } = useParams();
  const {
    searchCharacters,
    getCharactersGroupedByLetter,
    getMostViewedCharacters,
    getRecentlyViewed,
    getFavoriteCharacters,
    recordCharacterView
  } = useCharacters();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped', 'list', 'favorites', 'popular'
  const [selectedCharacterId, setSelectedCharacterId] = useState(characterIdFromUrl || null);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [groupedCharacters, setGroupedCharacters] = useState({});

  // Update filtered results when search query changes
  useEffect(() => {
    const results = searchCharacters(searchQuery);
    setFilteredCharacters(results);

    // Update grouped view
    if (viewMode === 'grouped') {
      const grouped = {};
      results.forEach(char => {
        const firstLetter = char.name[0].toUpperCase();
        if (!grouped[firstLetter]) {
          grouped[firstLetter] = [];
        }
        grouped[firstLetter].push(char);
      });
      setGroupedCharacters(grouped);
    }
  }, [searchQuery, searchCharacters, viewMode]);

  // Initialize grouped view on mount
  useEffect(() => {
    if (viewMode === 'grouped' && searchQuery === '') {
      setGroupedCharacters(getCharactersGroupedByLetter());
    }
  }, [viewMode, getCharactersGroupedByLetter, searchQuery]);

  // Handle character selection from URL
  useEffect(() => {
    if (characterIdFromUrl) {
      setSelectedCharacterId(characterIdFromUrl);
      recordCharacterView(characterIdFromUrl);
    }
  }, [characterIdFromUrl, recordCharacterView]);

  const handleCharacterClick = (characterId) => {
    setSelectedCharacterId(characterId);
    recordCharacterView(characterId);
    navigate(`/bible/characters/${characterId}`);
  };

  const handleCloseModal = () => {
    setSelectedCharacterId(null);
    navigate('/bible/characters');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const renderCharacterCard = (character) => {
    const role = getCharacterRole(character);
    const roleColor = getCategoryColor(role);
    const testament = getCharacterTestament(character);

    return (
      <div
        key={character.id}
        className="character-card"
        onClick={() => handleCharacterClick(character.id)}
      >
        <div className="character-card-header">
          <h3 className="character-card-name">{character.name}</h3>
          <div className="character-card-badge" style={{ backgroundColor: roleColor }}>
            {role}
          </div>
        </div>
        <div className="character-card-testament">{testament}</div>
        <p className="character-card-summary">
          {character.summary.length > 120
            ? `${character.summary.substring(0, 120)}...`
            : character.summary}
        </p>
        {character.altNames && character.altNames.length > 0 && (
          <div className="character-card-alt-names">
            Also: {character.altNames.join(', ')}
          </div>
        )}
      </div>
    );
  };

  const renderGroupedView = () => {
    const letters = Object.keys(groupedCharacters).sort();

    if (letters.length === 0) {
      return (
        <div className="no-results">
          <p>No characters found matching "{searchQuery}"</p>
        </div>
      );
    }

    return (
      <div className="characters-grouped">
        {/* Letter Navigation */}
        <div className="letter-navigation">
          {letters.map(letter => (
            <a key={letter} href={`#letter-${letter}`} className="letter-link">
              {letter}
            </a>
          ))}
        </div>

        {/* Character Groups */}
        {letters.map(letter => (
          <div key={letter} id={`letter-${letter}`} className="character-group">
            <h2 className="group-letter">{letter}</h2>
            <div className="character-grid">
              {groupedCharacters[letter].map(char => renderCharacterCard(char))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => {
    if (filteredCharacters.length === 0) {
      return (
        <div className="no-results">
          <p>No characters found matching "{searchQuery}"</p>
        </div>
      );
    }

    return (
      <div className="character-grid">
        {filteredCharacters.map(char => renderCharacterCard(char))}
      </div>
    );
  };

  const renderPopularView = () => {
    const mostViewed = getMostViewedCharacters(20);

    if (mostViewed.length === 0) {
      return (
        <div className="no-results">
          <p>No characters viewed yet. Start exploring!</p>
        </div>
      );
    }

    return (
      <div className="popular-characters">
        <h2>Most Viewed Characters</h2>
        <div className="character-grid">
          {mostViewed.map(({ character, viewCount }) => (
            <div key={character.id} className="character-card-wrapper">
              {renderCharacterCard(character)}
              <div className="view-count-badge">{viewCount} views</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFavoritesView = () => {
    const favorites = getFavoriteCharacters();

    if (favorites.length === 0) {
      return (
        <div className="no-results">
          <p>No favorite characters yet. Click the star ★ on character profiles to add favorites!</p>
        </div>
      );
    }

    return (
      <div className="favorite-characters">
        <h2>Your Favorite Characters</h2>
        <div className="character-grid">
          {favorites.map(char => renderCharacterCard(char))}
        </div>
      </div>
    );
  };

  return (
    <div className="character-index-page">
      {/* Header */}
      <div className="character-index-header">
        <h1>Biblical Characters</h1>
        <p className="subtitle">Explore profiles of key people from the Bible</p>
      </div>

      {/* Search and Filters */}
      <div className="character-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search characters by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={handleClearSearch}>
              ×
            </button>
          )}
        </div>

        <div className="view-mode-tabs">
          <button
            className={`tab-btn ${viewMode === 'grouped' ? 'active' : ''}`}
            onClick={() => setViewMode('grouped')}
          >
            A-Z
          </button>
          <button
            className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            All
          </button>
          <button
            className={`tab-btn ${viewMode === 'popular' ? 'active' : ''}`}
            onClick={() => setViewMode('popular')}
          >
            Popular
          </button>
          <button
            className={`tab-btn ${viewMode === 'favorites' ? 'active' : ''}`}
            onClick={() => setViewMode('favorites')}
          >
            Favorites
          </button>
        </div>
      </div>

      {/* Recently Viewed */}
      {viewMode === 'grouped' && searchQuery === '' && (
        <RecentlyViewedSection
          getRecentlyViewed={getRecentlyViewed}
          onCharacterClick={handleCharacterClick}
        />
      )}

      {/* Character Content */}
      <div className="character-content">
        {viewMode === 'grouped' && renderGroupedView()}
        {viewMode === 'list' && renderListView()}
        {viewMode === 'popular' && renderPopularView()}
        {viewMode === 'favorites' && renderFavoritesView()}
      </div>

      {/* Character Profile Modal */}
      {selectedCharacterId && (
        <CharacterProfileModal
          characterId={selectedCharacterId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

// Recently Viewed Section Component
const RecentlyViewedSection = ({ getRecentlyViewed, onCharacterClick }) => {
  const recentlyViewed = getRecentlyViewed(5);

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="recently-viewed-section">
      <h2>Recently Viewed</h2>
      <div className="recently-viewed-list">
        {recentlyViewed.map(({ character }) => (
          <div
            key={character.id}
            className="recently-viewed-item"
            onClick={() => onCharacterClick(character.id)}
          >
            <div className="recently-viewed-name">{character.name}</div>
            <div className="recently-viewed-role">
              {getCharacterRole(character)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterIndexPage;
