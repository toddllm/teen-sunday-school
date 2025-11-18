import React, { useState } from 'react';
import './TranslationComparisonList.css';
import { COMPARISON_CATEGORIES, DIFFICULTY_LEVELS } from '../services/translationComparisonService';

/**
 * TranslationComparisonList Component
 *
 * Displays a filterable list of translation comparison notes
 */
const TranslationComparisonList = ({ notes, onSelectNote, selectedNoteId, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Filter notes based on search and filters
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchTerm === '' ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.passageRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || note.category === categoryFilter;

    const matchesDifficulty =
      difficultyFilter === 'all' || note.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return '#27ae60';
      case 'intermediate':
        return '#f39c12';
      case 'advanced':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="comparison-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading comparison notes...</p>
      </div>
    );
  }

  return (
    <div className="translation-comparison-list">
      <div className="list-header">
        <h2>Translation Comparisons</h2>
        <p className="list-subtitle">Understand different Bible translations</p>
      </div>

      {/* Search and Filters */}
      <div className="list-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by passage, title, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {COMPARISON_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="difficulty-filter">Difficulty:</label>
          <select
            id="difficulty-filter"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Levels</option>
            {DIFFICULTY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        {filteredNotes.length} comparison{filteredNotes.length !== 1 ? 's' : ''} found
      </div>

      {/* Notes List */}
      <div className="notes-list">
        {filteredNotes.length === 0 ? (
          <div className="no-results">
            <p>No comparison notes found matching your criteria.</p>
            <p>Try adjusting your filters or search term.</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`note-card ${selectedNoteId === note.id ? 'selected' : ''}`}
              onClick={() => onSelectNote(note)}
            >
              <div className="note-card-header">
                <h3>{note.title}</h3>
                <div className="note-badges">
                  {note.difficulty && (
                    <span
                      className="difficulty-dot"
                      style={{ background: getDifficultyColor(note.difficulty) }}
                      title={note.difficulty}
                    ></span>
                  )}
                </div>
              </div>

              <div className="note-passage-ref">
                <strong>{note.passageRef}</strong>
              </div>

              {note.description && (
                <p className="note-description">
                  {note.description.length > 120
                    ? `${note.description.substring(0, 120)}...`
                    : note.description}
                </p>
              )}

              <div className="note-card-footer">
                {note.category && (
                  <span className="note-category">{note.category}</span>
                )}
                {note._count?.metrics > 0 && (
                  <span className="note-views">
                    👁️ {note._count.metrics} view{note._count.metrics !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TranslationComparisonList;
