import React, { useState, useMemo } from 'react';
import { useHighlights, HIGHLIGHT_COLORS } from '../contexts/HighlightContext';
import VerseHighlighter from '../components/VerseHighlighter';
import './HighlightsPage.css';

const HighlightsPage = () => {
  const {
    highlights,
    getAllTags,
    filterHighlights
  } = useHighlights();

  const [filterBook, setFilterBook] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [groupBy, setGroupBy] = useState('date'); // date, book, color, tag
  const [editingHighlight, setEditingHighlight] = useState(null);

  // Get unique books from highlights
  const books = useMemo(() => {
    const bookSet = new Set();
    highlights.forEach(h => {
      const book = h.verseRef.split(' ')[0];
      bookSet.add(book);
    });
    return Array.from(bookSet).sort();
  }, [highlights]);

  // Get all tags
  const allTags = getAllTags();

  // Apply filters
  const filteredHighlights = useMemo(() => {
    return filterHighlights({
      book: filterBook,
      tag: filterTag,
      color: filterColor
    });
  }, [filterBook, filterTag, filterColor, filterHighlights]);

  // Group highlights
  const groupedHighlights = useMemo(() => {
    if (groupBy === 'book') {
      const byBook = {};
      filteredHighlights.forEach(h => {
        const book = h.verseRef.split(' ')[0];
        if (!byBook[book]) byBook[book] = [];
        byBook[book].push(h);
      });
      return Object.entries(byBook).sort(([a], [b]) => a.localeCompare(b));
    } else if (groupBy === 'color') {
      const byColor = {};
      filteredHighlights.forEach(h => {
        const colorName = Object.entries(HIGHLIGHT_COLORS).find(([, val]) => val === h.color)?.[0] || 'Unknown';
        if (!byColor[colorName]) byColor[colorName] = [];
        byColor[colorName].push(h);
      });
      return Object.entries(byColor).sort(([a], [b]) => a.localeCompare(b));
    } else if (groupBy === 'tag') {
      const byTag = {};
      filteredHighlights.forEach(h => {
        if (h.tags.length === 0) {
          if (!byTag['Untagged']) byTag['Untagged'] = [];
          byTag['Untagged'].push(h);
        } else {
          h.tags.forEach(tag => {
            if (!byTag[tag]) byTag[tag] = [];
            byTag[tag].push(h);
          });
        }
      });
      return Object.entries(byTag).sort(([a], [b]) => a.localeCompare(b));
    } else {
      // Group by date (recent first)
      return [['All Highlights', [...filteredHighlights].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      )]];
    }
  }, [filteredHighlights, groupBy]);

  const clearFilters = () => {
    setFilterBook('');
    setFilterTag('');
    setFilterColor('');
  };

  const hasActiveFilters = filterBook || filterTag || filterColor;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="highlights-page">
      <div className="highlights-header">
        <h1>My Highlights</h1>
        <div className="highlights-stats">
          {highlights.length} {highlights.length === 1 ? 'highlight' : 'highlights'}
        </div>
      </div>

      <div className="highlights-controls">
        <div className="filters">
          <select
            value={filterBook}
            onChange={(e) => setFilterBook(e.target.value)}
            className="filter-select"
          >
            <option value="">All Books</option>
            {books.map(book => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>

          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="filter-select"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <select
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
            className="filter-select"
          >
            <option value="">All Colors</option>
            {Object.entries(HIGHLIGHT_COLORS).map(([name, color]) => (
              <option key={name} value={color}>{name}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          )}
        </div>

        <div className="group-by">
          <label>Group by:</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="group-select"
          >
            <option value="date">Date</option>
            <option value="book">Book</option>
            <option value="color">Color</option>
            <option value="tag">Tag</option>
          </select>
        </div>
      </div>

      {filteredHighlights.length === 0 ? (
        <div className="no-highlights">
          {highlights.length === 0 ? (
            <>
              <p>You haven't highlighted any verses yet.</p>
              <p>Visit the Bible Tool to start highlighting verses!</p>
            </>
          ) : (
            <p>No highlights match your filters.</p>
          )}
        </div>
      ) : (
        <div className="highlights-list">
          {groupedHighlights.map(([groupName, groupHighlights]) => (
            <div key={groupName} className="highlight-group">
              <h2 className="group-title">{groupName}</h2>
              <div className="group-items">
                {groupHighlights.map(highlight => (
                  <div
                    key={highlight.id}
                    className="highlight-card"
                    style={{ borderLeftColor: highlight.color }}
                  >
                    <div
                      className="highlight-content"
                      style={{ backgroundColor: highlight.color }}
                    >
                      <div className="highlight-text">{highlight.text}</div>
                      <div className="highlight-reference">{highlight.verseRef}</div>
                    </div>
                    <div className="highlight-meta">
                      <div className="highlight-info">
                        {highlight.tags.length > 0 && (
                          <div className="highlight-tags">
                            {highlight.tags.map(tag => (
                              <span key={tag} className="highlight-tag">{tag}</span>
                            ))}
                          </div>
                        )}
                        {highlight.note && (
                          <div className="highlight-note">{highlight.note}</div>
                        )}
                        <div className="highlight-date">
                          {formatDate(highlight.createdAt)}
                        </div>
                      </div>
                      <div className="highlight-actions">
                        <button
                          className="edit-highlight-btn"
                          onClick={() => setEditingHighlight(highlight)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingHighlight && (
        <VerseHighlighter
          verseRef={editingHighlight.verseRef}
          verseText={editingHighlight.text}
          onClose={() => setEditingHighlight(null)}
        />
      )}
    </div>
  );
};

export default HighlightsPage;
