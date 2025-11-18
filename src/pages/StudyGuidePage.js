import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudyGuides } from '../contexts/StudyGuideContext';
import { useStreak, ACTIVITY_TYPES } from '../contexts/StreakContext';
import { getBooks } from '../services/bibleAPI';
import './StudyGuidePage.css';

const StudyGuidePage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { getStudyGuide, searchStudyGuides } = useStudyGuides();
  const { logActivity } = useStreak();

  const [selectedBookId, setSelectedBookId] = useState(bookId || '');
  const [studyGuide, setStudyGuide] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load books for the selector
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const booksData = await getBooks('de4e12af7f28f599-02'); // NIV
        if (booksData && booksData.length > 0) {
          setBooks(booksData);
        } else {
          setBooks(getCommonBooks());
        }
      } catch (err) {
        console.error('Error loading books:', err);
        setBooks(getCommonBooks());
      }
      setLoading(false);
    };
    loadBooks();
  }, []);

  // Load study guide when book is selected
  useEffect(() => {
    if (selectedBookId) {
      const guide = getStudyGuide(selectedBookId);
      setStudyGuide(guide);

      // Track study guide view
      if (guide) {
        logActivity(ACTIVITY_TYPES.LESSON_COMPLETED); // Reusing this activity type for study guide views
      }
    } else {
      setStudyGuide(null);
    }
  }, [selectedBookId, getStudyGuide, logActivity]);

  // Handle book selection
  const handleBookChange = (e) => {
    const newBookId = e.target.value;
    setSelectedBookId(newBookId);
    if (newBookId) {
      navigate(`/study-guides/${newBookId}`);
    }
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const results = searchStudyGuides(query);
      setSearchResults(results);
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  // Handle clicking a search result
  const handleSearchResultClick = (bookId) => {
    setSelectedBookId(bookId);
    navigate(`/study-guides/${bookId}`);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Fallback book list
  const getCommonBooks = () => {
    return [
      { id: 'GEN', name: 'Genesis' },
      { id: 'EXO', name: 'Exodus' },
      { id: 'PSA', name: 'Psalms' },
      { id: 'PRO', name: 'Proverbs' },
      { id: 'ISA', name: 'Isaiah' },
      { id: 'MAT', name: 'Matthew' },
      { id: 'MRK', name: 'Mark' },
      { id: 'LUK', name: 'Luke' },
      { id: 'JHN', name: 'John' },
      { id: 'ACT', name: 'Acts' },
      { id: 'ROM', name: 'Romans' },
      { id: '1CO', name: '1 Corinthians' },
      { id: 'GAL', name: 'Galatians' },
      { id: 'EPH', name: 'Ephesians' },
      { id: 'PHP', name: 'Philippians' },
      { id: 'JAS', name: 'James' },
      { id: '1PE', name: '1 Peter' },
      { id: '1JN', name: '1 John' },
      { id: 'REV', name: 'Revelation' }
    ];
  };

  return (
    <div className="study-guide-page">
      <div className="study-guide-header">
        <h1>Bible Book Study Guides</h1>
        <p className="subtitle">
          Comprehensive introductions and overviews for each book of the Bible
        </p>
      </div>

      <div className="study-guide-controls">
        <div className="control-group">
          <label htmlFor="book-select">Select a Book:</label>
          <select
            id="book-select"
            value={selectedBookId}
            onChange={handleBookChange}
            className="book-selector"
            disabled={loading}
          >
            <option value="">-- Choose a Bible Book --</option>
            {books.map(book => (
              <option key={book.id} value={book.id}>
                {book.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="search-input">Search Study Guides:</label>
          <input
            id="search-input"
            type="text"
            placeholder="Search by book name, author, theme..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {isSearching && searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results ({searchResults.length})</h3>
          <div className="search-results-grid">
            {searchResults.map(guide => (
              <div
                key={guide.bookId}
                className="search-result-card"
                onClick={() => handleSearchResultClick(guide.bookId)}
              >
                <h4>{guide.bookName}</h4>
                <p className="guide-author">by {guide.author}</p>
                <p className="guide-summary">{guide.summary.substring(0, 150)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isSearching && studyGuide ? (
        <div className="study-guide-content">
          <div className="guide-header-section">
            <h2>{studyGuide.bookName}</h2>
            <div className="guide-meta">
              <div className="meta-item">
                <span className="meta-label">Author:</span>
                <span className="meta-value">{studyGuide.author}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Date Written:</span>
                <span className="meta-value">{studyGuide.dateWritten}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Audience:</span>
                <span className="meta-value">{studyGuide.audience}</span>
              </div>
            </div>
          </div>

          <div className="guide-section">
            <h3>Summary</h3>
            <p className="guide-summary-text">{studyGuide.summary}</p>
          </div>

          <div className="guide-section">
            <h3>Key Themes</h3>
            <ul className="themes-list">
              {studyGuide.themes.map((theme, index) => (
                <li key={index}>{theme}</li>
              ))}
            </ul>
          </div>

          <div className="guide-section">
            <h3>Outline</h3>
            <div className="outline-container">
              {studyGuide.outline.map((section, index) => (
                <div key={index} className="outline-section">
                  <h4>{section.section}</h4>
                  <ul>
                    {section.points.map((point, pointIndex) => (
                      <li key={pointIndex}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="guide-section">
            <h3>Historical Context</h3>
            <p className="historical-context">{studyGuide.historicalContext}</p>
          </div>

          {studyGuide.keyVerses && studyGuide.keyVerses.length > 0 && (
            <div className="guide-section">
              <h3>Key Verses</h3>
              <div className="key-verses">
                {studyGuide.keyVerses.map((verse, index) => (
                  <div key={index} className="key-verse">
                    <p className="verse-reference">{verse.reference}</p>
                    <p className="verse-text">"{verse.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="guide-footer">
            <p className="guide-version">
              Version {studyGuide.version} • Last updated: {new Date(studyGuide.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ) : !isSearching && selectedBookId ? (
        <div className="empty-state">
          <p>No study guide available for this book yet.</p>
          <p className="text-muted">Check back later for more content!</p>
        </div>
      ) : !isSearching ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>Welcome to Bible Study Guides</h3>
          <p>
            Select a book from the dropdown above to view its comprehensive study guide,
            or use the search to find specific topics.
          </p>
          <div className="popular-books">
            <h4>Popular Books to Start With:</h4>
            <div className="popular-books-grid">
              <button
                className="popular-book-btn"
                onClick={() => handleSearchResultClick('JHN')}
              >
                John
              </button>
              <button
                className="popular-book-btn"
                onClick={() => handleSearchResultClick('GEN')}
              >
                Genesis
              </button>
              <button
                className="popular-book-btn"
                onClick={() => handleSearchResultClick('ROM')}
              >
                Romans
              </button>
              <button
                className="popular-book-btn"
                onClick={() => handleSearchResultClick('PSA')}
              >
                Psalms
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isSearching && searchResults.length === 0 && searchQuery.trim().length > 0 && (
        <div className="empty-state">
          <p>No study guides found matching "{searchQuery}"</p>
          <p className="text-muted">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

export default StudyGuidePage;
