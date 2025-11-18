import React, { createContext, useContext, useState, useCallback } from 'react';
import { performSearch } from '../services/searchService';
import { useLessons } from './LessonContext';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const { lessons } = useLessons();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    verses: [],
    lessons: [],
    notes: [],
    total: 0
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    scope: 'all', // 'all', 'bible', 'lessons', 'notes'
    testament: 'all', // 'all', 'old', 'new'
    books: [], // Array of book codes
  });

  /**
   * Performs a search with the current query and filters
   */
  const search = useCallback(async (query, filters = searchFilters) => {
    if (!query || query.trim().length < 2) {
      setSearchResults({
        verses: [],
        lessons: [],
        notes: [],
        total: 0
      });
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    try {
      const results = await performSearch(query, {
        scope: filters.scope,
        lessons: lessons,
        filters: {
          testament: filters.testament,
          books: filters.books
        }
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchResults({
        verses: [],
        lessons: [],
        notes: [],
        total: 0
      });
    } finally {
      setIsSearching(false);
    }
  }, [lessons, searchFilters]);

  /**
   * Updates search filters
   */
  const updateFilters = useCallback((newFilters) => {
    setSearchFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  /**
   * Clears search results and query
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults({
      verses: [],
      lessons: [],
      notes: [],
      total: 0
    });
  }, []);

  /**
   * Resets filters to default
   */
  const resetFilters = useCallback(() => {
    setSearchFilters({
      scope: 'all',
      testament: 'all',
      books: []
    });
  }, []);

  const value = {
    searchQuery,
    searchResults,
    isSearching,
    searchFilters,
    search,
    updateFilters,
    clearSearch,
    resetFilters,
    setSearchQuery
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
