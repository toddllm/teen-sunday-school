/**
 * OriginalLanguagePage Component
 *
 * Provides access to Greek/Hebrew word information without overwhelming users.
 * Users can tap words in Bible verses to see original language meanings.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPassage, searchPassage, referenceToVerseId } from '../services/bibleAPI';
import { getLexemeByWord, hasLexemeData, getAvailableWords } from '../services/lexiconAPI';
import { useLexicon } from '../contexts/LexiconContext';
import { useTranslation } from '../contexts/TranslationContext';
import LexiconModal from '../components/LexiconModal';
import './OriginalLanguagePage.css';

const OriginalLanguagePage = () => {
  const navigate = useNavigate();
  const { recordLookup, getRecentLookups, bookmarkedLexemes, analytics } = useLexicon();
  const { primaryTranslation } = useTranslation();

  // State
  const [searchQuery, setSearchQuery] = useState('John 3:16');
  const [verseContent, setVerseContent] = useState(null);
  const [verseId, setVerseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLexeme, setSelectedLexeme] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showStats, setShowStats] = useState(false);

  /**
   * Search for and load a Bible passage
   */
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a verse reference (e.g., John 3:16)');
      return;
    }

    setLoading(true);
    setError(null);
    setVerseContent(null);

    try {
      // First, search for the passage to get the passage ID
      const searchResults = await searchPassage(searchQuery, primaryTranslation.id);

      if (!searchResults || searchResults.passages.length === 0) {
        setError('Verse not found. Please try a different reference.');
        setLoading(false);
        return;
      }

      const firstPassage = searchResults.passages[0];

      // Get the full passage content
      const passageData = await getPassage(firstPassage.id, primaryTranslation.id);

      if (!passageData) {
        setError('Could not load verse content.');
        setLoading(false);
        return;
      }

      // Convert reference to verse ID format for lexicon lookup
      const vId = referenceToVerseId(firstPassage.reference);

      setVerseContent(passageData);
      setVerseId(vId);
      setLoading(false);
    } catch (err) {
      console.error('Error searching passage:', err);
      setError('An error occurred while searching. Please try again.');
      setLoading(false);
    }
  }, [searchQuery, primaryTranslation.id]);

  // Load initial verse on mount
  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  /**
   * Handle word click - lookup lexeme and show modal
   */
  const handleWordClick = useCallback((word) => {
    if (!verseId) return;

    const lexeme = getLexemeByWord(verseId, word);
    if (lexeme) {
      setSelectedLexeme(lexeme);
      setSelectedWord(word);
      recordLookup(lexeme.strongsNumber, verseId, word);
    }
  }, [verseId, recordLookup]);

  /**
   * Add click handlers to words in the verse
   */
  useEffect(() => {
    if (!verseContent || !verseId) return;

    const addWordClickHandlers = () => {
      const verseContainer = document.querySelector('.original-language-verse-content');
      if (!verseContainer) return;

      // Check if this verse has lexeme data available
      const hasData = hasLexemeData(verseId);
      const availableWords = hasData ? getAvailableWords(verseId) : [];

      if (!hasData || availableWords.length === 0) {
        return;
      }

      // Parse the HTML content and wrap words in clickable spans
      const content = verseContainer.innerHTML;

      // Remove verse numbers from content for word processing
      let processedContent = content.replace(/<span class="verse-num">.*?<\/span>/g, '');

      // Split by word boundaries while preserving HTML tags
      const wordRegex = /(<[^>]+>|[A-Za-z]+(?:'[A-Za-z]+)?)/g;
      processedContent = processedContent.replace(wordRegex, (match) => {
        // If it's an HTML tag, leave it alone
        if (match.startsWith('<')) {
          return match;
        }

        // If it's a word, check if we have lexeme data for it
        const normalizedWord = match.toLowerCase();
        const hasLexeme = availableWords.some(
          w => w.toLowerCase() === normalizedWord
        );

        if (hasLexeme) {
          return `<span class="lexeme-word" data-word="${match}">${match}</span>`;
        }

        return match;
      });

      verseContainer.innerHTML = processedContent;

      // Add click handlers to lexeme words
      const lexemeWords = verseContainer.querySelectorAll('.lexeme-word');
      lexemeWords.forEach((wordElement) => {
        const word = wordElement.getAttribute('data-word');

        // Style
        wordElement.style.cursor = 'pointer';
        wordElement.style.transition = 'all 0.2s ease';

        // Hover effects
        const handleMouseEnter = () => {
          wordElement.style.backgroundColor = 'var(--primary-color)';
          wordElement.style.color = 'white';
          wordElement.style.borderRadius = '3px';
          wordElement.style.padding = '2px 4px';
          wordElement.style.margin = '0 -4px';
        };

        const handleMouseLeave = () => {
          wordElement.style.backgroundColor = 'transparent';
          wordElement.style.color = 'inherit';
          wordElement.style.padding = '0';
          wordElement.style.margin = '0';
        };

        // Click handler
        const handleClick = (e) => {
          e.preventDefault();
          handleWordClick(word);
        };

        wordElement.addEventListener('mouseenter', handleMouseEnter);
        wordElement.addEventListener('mouseleave', handleMouseLeave);
        wordElement.addEventListener('click', handleClick);

        // Store handlers for cleanup
        wordElement._handlers = {
          mouseenter: handleMouseEnter,
          mouseleave: handleMouseLeave,
          click: handleClick
        };
      });
    };

    // Delay to ensure DOM is ready
    const timer = setTimeout(addWordClickHandlers, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      const lexemeWords = document.querySelectorAll('.lexeme-word');
      lexemeWords.forEach((el) => {
        if (el._handlers) {
          el.removeEventListener('mouseenter', el._handlers.mouseenter);
          el.removeEventListener('mouseleave', el._handlers.mouseleave);
          el.removeEventListener('click', el._handlers.click);
        }
      });
    };
  }, [verseContent, verseId, handleWordClick]);

  /**
   * Close the lexeme modal
   */
  const handleCloseLexeme = () => {
    setSelectedLexeme(null);
    setSelectedWord(null);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // Recent lookups for sidebar
  const recentLookups = getRecentLookups(5);

  return (
    <div className="original-language-page">
      {/* Header */}
      <header className="original-language-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Original Language Tools</h1>
        <p className="subtitle">Explore Greek and Hebrew word meanings</p>
      </header>

      <div className="original-language-content">
        {/* Main Content */}
        <div className="original-language-main">
          {/* Search Box */}
          <div className="search-section">
            <form onSubmit={handleSubmit} className="search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter verse reference (e.g., John 3:16)"
                className="search-input"
              />
              <button type="submit" className="search-button" disabled={loading}>
                {loading ? 'Loading...' : 'Search'}
              </button>
            </form>

            {verseId && hasLexemeData(verseId) && (
              <div className="lexeme-availability-notice">
                ✓ Original language data available - click on highlighted words
              </div>
            )}

            {verseId && !hasLexemeData(verseId) && (
              <div className="lexeme-unavailable-notice">
                ⚠ Original language data not available for this verse yet
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading verse...</p>
            </div>
          )}

          {/* Verse Display */}
          {verseContent && !loading && (
            <div className="verse-display">
              <div className="verse-reference">
                {verseContent.reference}
              </div>
              <div className="verse-translation">
                {primaryTranslation.name}
              </div>
              <div
                className="original-language-verse-content"
                dangerouslySetInnerHTML={{ __html: verseContent.content }}
              />
              {hasLexemeData(verseId) && (
                <div className="verse-hint">
                  💡 Tip: Click on any highlighted word to see its original language meaning
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {!verseContent && !loading && !error && (
            <div className="instructions">
              <h2>How to use Original Language Tools</h2>
              <ol>
                <li>Enter a Bible verse reference in the search box above</li>
                <li>Look for highlighted words in the verse text</li>
                <li>Click on any highlighted word to see its Greek or Hebrew meaning</li>
                <li>Explore word definitions, occurrences, and key references</li>
              </ol>

              <div className="sample-verses">
                <h3>Try these sample verses:</h3>
                <div className="sample-verse-buttons">
                  <button onClick={() => { setSearchQuery('John 3:16'); handleSearch(); }}>
                    John 3:16
                  </button>
                  <button onClick={() => { setSearchQuery('1 Corinthians 13:13'); handleSearch(); }}>
                    1 Corinthians 13:13
                  </button>
                  <button onClick={() => { setSearchQuery('Ephesians 2:8'); handleSearch(); }}>
                    Ephesians 2:8
                  </button>
                  <button onClick={() => { setSearchQuery('Genesis 1:1'); handleSearch(); }}>
                    Genesis 1:1
                  </button>
                  <button onClick={() => { setSearchQuery('Psalm 23:1'); handleSearch(); }}>
                    Psalm 23:1
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="original-language-sidebar">
          {/* Stats Card */}
          <div className="sidebar-card">
            <div
              className="sidebar-card-header clickable"
              onClick={() => setShowStats(!showStats)}
            >
              <h3>📊 Your Stats</h3>
              <span className="toggle-icon">{showStats ? '▼' : '▶'}</span>
            </div>
            {showStats && (
              <div className="sidebar-card-content">
                <div className="stat-item">
                  <span className="stat-label">Total Lookups:</span>
                  <span className="stat-value">{analytics.totalLookups}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unique Words:</span>
                  <span className="stat-value">{analytics.uniqueLexemes.size}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Bookmarked:</span>
                  <span className="stat-value">{bookmarkedLexemes.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* Recent Lookups */}
          {recentLookups.length > 0 && (
            <div className="sidebar-card">
              <div
                className="sidebar-card-header clickable"
                onClick={() => setShowHistory(!showHistory)}
              >
                <h3>🕐 Recent Lookups</h3>
                <span className="toggle-icon">{showHistory ? '▼' : '▶'}</span>
              </div>
              {showHistory && (
                <div className="sidebar-card-content">
                  {recentLookups.map((lookup) => (
                    <div key={lookup.id} className="lookup-item">
                      <div className="lookup-word">{lookup.transliteration}</div>
                      <div className="lookup-gloss">{lookup.primaryGloss}</div>
                      <div className="lookup-context">{lookup.verseRef}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bookmarked Words */}
          {bookmarkedLexemes.length > 0 && (
            <div className="sidebar-card">
              <div
                className="sidebar-card-header clickable"
                onClick={() => setShowBookmarks(!showBookmarks)}
              >
                <h3>⭐ Bookmarked Words</h3>
                <span className="toggle-icon">{showBookmarks ? '▼' : '▶'}</span>
              </div>
              {showBookmarks && (
                <div className="sidebar-card-content">
                  {bookmarkedLexemes.map((bookmark) => (
                    <div key={bookmark.id} className="lookup-item">
                      <div className="lookup-word">{bookmark.transliteration}</div>
                      <div className="lookup-gloss">{bookmark.primaryGloss}</div>
                      <div className="lookup-meta">{bookmark.language}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lexeme Modal */}
      {selectedLexeme && (
        <LexiconModal
          lexeme={selectedLexeme}
          verseRef={verseContent?.reference}
          word={selectedWord}
          onClose={handleCloseLexeme}
        />
      )}
    </div>
  );
};

export default OriginalLanguagePage;
