import React, { createContext, useContext, useState, useEffect } from 'react';
import { biblicalCharacters } from '../data/biblicalCharacters';

const CharacterContext = createContext();

export const useCharacters = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacters must be used within a CharacterProvider');
  }
  return context;
};

export const CharacterProvider = ({ children }) => {
  const [characters, setCharacters] = useState([]);
  const [viewHistory, setViewHistory] = useState([]);
  const [favoriteCharacters, setFavoriteCharacters] = useState([]);

  // Initialize characters from static data
  useEffect(() => {
    setCharacters(biblicalCharacters);
  }, []);

  // Load view history from localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem('character-view-history');
    if (storedHistory) {
      try {
        setViewHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error('Error loading view history:', error);
      }
    }
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorite-characters');
    if (storedFavorites) {
      try {
        setFavoriteCharacters(JSON.parse(storedFavorites));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Persist view history to localStorage
  useEffect(() => {
    if (viewHistory.length > 0) {
      localStorage.setItem('character-view-history', JSON.stringify(viewHistory));
    }
  }, [viewHistory]);

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favorite-characters', JSON.stringify(favoriteCharacters));
  }, [favoriteCharacters]);

  /**
   * Get character by ID
   */
  const getCharacter = (id) => {
    return characters.find(char => char.id === id);
  };

  /**
   * Search characters by name or alternate names
   */
  const searchCharacters = (query) => {
    if (!query || query.trim() === '') {
      return characters;
    }

    const lowerQuery = query.toLowerCase().trim();
    return characters.filter(char =>
      char.name.toLowerCase().includes(lowerQuery) ||
      char.altNames.some(alt => alt.toLowerCase().includes(lowerQuery)) ||
      char.summary.toLowerCase().includes(lowerQuery)
    );
  };

  /**
   * Get characters sorted alphabetically
   */
  const getCharactersSorted = () => {
    return [...characters].sort((a, b) => a.name.localeCompare(b.name));
  };

  /**
   * Get characters grouped by first letter for A-Z index
   */
  const getCharactersGroupedByLetter = () => {
    const sorted = getCharactersSorted();
    const grouped = {};

    sorted.forEach(char => {
      const firstLetter = char.name[0].toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(char);
    });

    return grouped;
  };

  /**
   * Record a character view for analytics
   */
  const recordCharacterView = (characterId) => {
    const character = getCharacter(characterId);
    if (!character) return;

    const viewRecord = {
      characterId,
      characterName: character.name,
      timestamp: new Date().toISOString()
    };

    setViewHistory(prev => {
      // Keep only last 100 views
      const updated = [viewRecord, ...prev].slice(0, 100);
      return updated;
    });
  };

  /**
   * Get most viewed characters
   */
  const getMostViewedCharacters = (limit = 10) => {
    const viewCounts = {};

    viewHistory.forEach(view => {
      viewCounts[view.characterId] = (viewCounts[view.characterId] || 0) + 1;
    });

    const sorted = Object.entries(viewCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([characterId, count]) => ({
        character: getCharacter(characterId),
        viewCount: count
      }))
      .filter(item => item.character); // Filter out any null characters

    return sorted;
  };

  /**
   * Get recently viewed characters
   */
  const getRecentlyViewed = (limit = 5) => {
    const seen = new Set();
    const recent = [];

    for (const view of viewHistory) {
      if (!seen.has(view.characterId)) {
        const character = getCharacter(view.characterId);
        if (character) {
          recent.push({
            character,
            lastViewed: view.timestamp
          });
          seen.add(view.characterId);
        }
      }
      if (recent.length >= limit) break;
    }

    return recent;
  };

  /**
   * Toggle favorite status for a character
   */
  const toggleFavorite = (characterId) => {
    setFavoriteCharacters(prev => {
      if (prev.includes(characterId)) {
        return prev.filter(id => id !== characterId);
      } else {
        return [...prev, characterId];
      }
    });
  };

  /**
   * Check if character is favorited
   */
  const isFavorite = (characterId) => {
    return favoriteCharacters.includes(characterId);
  };

  /**
   * Get favorite characters
   */
  const getFavoriteCharacters = () => {
    return favoriteCharacters
      .map(id => getCharacter(id))
      .filter(char => char !== undefined);
  };

  /**
   * Get related characters based on relationships
   */
  const getRelatedCharacters = (characterId) => {
    const character = getCharacter(characterId);
    if (!character || !character.relationships) return [];

    return character.relationships
      .map(rel => ({
        ...rel,
        character: getCharacter(rel.characterId)
      }))
      .filter(rel => rel.character); // Filter out any null characters
  };

  /**
   * Clear view history
   */
  const clearViewHistory = () => {
    setViewHistory([]);
    localStorage.removeItem('character-view-history');
  };

  const value = {
    characters,
    getCharacter,
    searchCharacters,
    getCharactersSorted,
    getCharactersGroupedByLetter,
    recordCharacterView,
    getMostViewedCharacters,
    getRecentlyViewed,
    toggleFavorite,
    isFavorite,
    getFavoriteCharacters,
    getRelatedCharacters,
    clearViewHistory,
    viewHistory
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

export default CharacterContext;
