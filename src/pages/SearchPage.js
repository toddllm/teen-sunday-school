import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import { getBibleBooks } from '../services/searchService';
import './SearchPage.css';

function SearchPage() {
  const {
    searchQuery,
    searchResults,
    isSearching,
    searchFilters,
    search,
    updateFilters,
    clearSearch,
    resetFilters
  } = useSearch();

  const [localQuery, setLocalQuery] = useState(searchQuery || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [activeResultType, setActiveResultType] = useState('all');

  const bibleBooks = getBibleBooks();

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (localQuery.trim().length >= 2) {
      search(localQuery, searchFilters);
    }
  };

  const handleScopeChange = (scope) => {
    updateFilters({ scope });
    if (localQuery.trim().length >= 2) {
      search(localQuery, { ...searchFilters, scope });
    }
  };

  const handleTestamentChange = (testament) => {
    updateFilters({ testament, books: [] });
    setSelectedBooks([]);
    if (localQuery.trim().length >= 2) {
      search(localQuery, { ...searchFilters, testament, books: [] });
    }
  };

  const handleBookToggle = (bookCode) => {
    const newBooks = selectedBooks.includes(bookCode)
      ? selectedBooks.filter(b => b !== bookCode)
      : [...selectedBooks, bookCode];

    setSelectedBooks(newBooks);
    updateFilters({ books: newBooks });

    if (localQuery.trim().length >= 2) {
      search(localQuery, { ...searchFilters, books: newBooks });
    }
  };

  const handleClearFilters = () => {
    resetFilters();
    setSelectedBooks([]);
    if (localQuery.trim().length >= 2) {
      search(localQuery, {
        scope: 'all',
        testament: 'all',
        books: []
      });
    }
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    clearSearch();
    setSelectedBooks([]);
    resetFilters();
  };

  const getFilteredResults = () => {
    if (activeResultType === 'all') {
      return {
        verses: searchResults.verses || [],
        lessons: searchResults.lessons || [],
        notes: searchResults.notes || []
      };
    }
    return {
      verses: activeResultType === 'verses' ? searchResults.verses || [] : [],
      lessons: activeResultType === 'lessons' ? searchResults.lessons || [] : [],
      notes: activeResultType === 'notes' ? searchResults.notes || [] : []
    };
  };

  const filteredResults = getFilteredResults();
  const hasResults = (filteredResults.verses.length + filteredResults.lessons.length + filteredResults.notes.length) > 0;

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search</h1>
        <p>Search across Bible verses, lessons, and notes</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search for verses, topics, or keywords..."
            className="search-input"
            autoFocus
          />
          <button type="submit" className="btn btn-primary" disabled={isSearching || localQuery.trim().length < 2}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          {(searchQuery || localQuery) && (
            <button type="button" onClick={handleClearSearch} className="btn btn-outline">
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Scope Filter */}
      <div className="scope-filter">
        <button
          className={`scope-btn ${searchFilters.scope === 'all' ? 'active' : ''}`}
          onClick={() => handleScopeChange('all')}
        >
          All
        </button>
        <button
          className={`scope-btn ${searchFilters.scope === 'bible' ? 'active' : ''}`}
          onClick={() => handleScopeChange('bible')}
        >
          Bible
        </button>
        <button
          className={`scope-btn ${searchFilters.scope === 'lessons' ? 'active' : ''}`}
          onClick={() => handleScopeChange('lessons')}
        >
          Lessons
        </button>
        <button
          className={`scope-btn ${searchFilters.scope === 'notes' ? 'active' : ''}`}
          onClick={() => handleScopeChange('notes')}
        >
          Notes
        </button>
      </div>

      {/* Advanced Filters Toggle */}
      {(searchFilters.scope === 'all' || searchFilters.scope === 'bible') && (
        <div className="filters-toggle">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {(searchFilters.testament !== 'all' || selectedBooks.length > 0) && (
            <button onClick={handleClearFilters} className="btn btn-outline">
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (searchFilters.scope === 'all' || searchFilters.scope === 'bible') && (
        <div className="advanced-filters">
          <div className="filter-section">
            <h3>Testament</h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${searchFilters.testament === 'all' ? 'active' : ''}`}
                onClick={() => handleTestamentChange('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${searchFilters.testament === 'old' ? 'active' : ''}`}
                onClick={() => handleTestamentChange('old')}
              >
                Old Testament
              </button>
              <button
                className={`filter-btn ${searchFilters.testament === 'new' ? 'active' : ''}`}
                onClick={() => handleTestamentChange('new')}
              >
                New Testament
              </button>
            </div>
          </div>

          <div className="filter-section">
            <h3>Books</h3>
            <div className="books-filter">
              {bibleBooks.map(book => (
                <label key={book.code} className="book-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedBooks.includes(book.code)}
                    onChange={() => handleBookToggle(book.code)}
                  />
                  <span>{book.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {searchQuery && (
        <div className="search-results">
          {/* Result Type Tabs */}
          <div className="result-tabs">
            <button
              className={`tab-btn ${activeResultType === 'all' ? 'active' : ''}`}
              onClick={() => setActiveResultType('all')}
            >
              All ({searchResults.total || 0})
            </button>
            <button
              className={`tab-btn ${activeResultType === 'verses' ? 'active' : ''}`}
              onClick={() => setActiveResultType('verses')}
            >
              Verses ({searchResults.verses?.length || 0})
            </button>
            <button
              className={`tab-btn ${activeResultType === 'lessons' ? 'active' : ''}`}
              onClick={() => setActiveResultType('lessons')}
            >
              Lessons ({searchResults.lessons?.length || 0})
            </button>
            <button
              className={`tab-btn ${activeResultType === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveResultType('notes')}
            >
              Notes ({searchResults.notes?.length || 0})
            </button>
          </div>

          {/* Results Display */}
          {isSearching ? (
            <div className="loading-state">
              <p>Searching...</p>
            </div>
          ) : hasResults ? (
            <div className="results-container">
              {/* Verse Results */}
              {filteredResults.verses.length > 0 && (
                <div className="result-group">
                  <h2>Bible Verses</h2>
                  {filteredResults.verses.map(result => (
                    <div key={result.id} className="result-item verse-result">
                      <div className="result-header">
                        <span className="result-reference">{result.reference}</span>
                      </div>
                      <div
                        className="result-snippet"
                        dangerouslySetInnerHTML={{
                          __html: result.snippet.replace(/\*\*(.*?)\*\*/g, '<mark>$1</mark>')
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Lesson Results */}
              {filteredResults.lessons.length > 0 && (
                <div className="result-group">
                  <h2>Lessons</h2>
                  {filteredResults.lessons.map(result => (
                    <div key={result.id} className="result-item lesson-result">
                      <div className="result-header">
                        <Link to={`/lesson/${result.lessonId}`} className="result-title">
                          {result.lessonTitle}
                        </Link>
                        <span className="result-badge">{result.matchType}</span>
                      </div>
                      <div
                        className="result-snippet"
                        dangerouslySetInnerHTML={{
                          __html: result.snippet.replace(/\*\*(.*?)\*\*/g, '<mark>$1</mark>')
                        }}
                      />
                      <div className="result-reference">{result.reference}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Note Results */}
              {filteredResults.notes.length > 0 && (
                <div className="result-group">
                  <h2>Teacher Notes</h2>
                  {filteredResults.notes.map(result => (
                    <div key={result.id} className="result-item note-result">
                      <div className="result-header">
                        <Link to={`/lesson/${result.lessonId}`} className="result-title">
                          {result.lessonTitle}
                        </Link>
                        <span className="result-badge">Note</span>
                      </div>
                      <div
                        className="result-snippet"
                        dangerouslySetInnerHTML={{
                          __html: result.snippet.replace(/\*\*(.*?)\*\*/g, '<mark>$1</mark>')
                        }}
                      />
                      <div className="result-reference">{result.reference}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>No results found for "{searchQuery}"</p>
              <p className="empty-hint">Try different keywords or adjust your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!searchQuery && !isSearching && (
        <div className="initial-state">
          <div className="search-tips">
            <h2>Search Tips</h2>
            <ul>
              <li>Search for specific Bible verses (e.g., "John 3:16")</li>
              <li>Find lessons by topic or keyword</li>
              <li>Search through teacher notes</li>
              <li>Use filters to narrow your search to specific books or testaments</li>
              <li>Search requires at least 2 characters</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
