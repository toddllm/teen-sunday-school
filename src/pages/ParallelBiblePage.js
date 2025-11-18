import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { useContextCards } from '../contexts/ContextCardContext';
import { useEngagementAnalytics } from '../contexts/EngagementAnalyticsContext';
import { getChapter, getBooks, getChapters } from '../services/bibleAPI';
import ContextCardModal from '../components/ContextCardModal';
import PassageMetrics from '../components/PassageMetrics';
import ReadAloudControls from '../components/ReadAloudControls';
import { formatBibleVerseForSpeech, formatReferenceForSpeech } from '../services/readAloudService';
import './ParallelBiblePage.css';

const ParallelBiblePage = () => {
  const {
    primaryTranslation,
    secondaryTranslation,
    setPrimaryTranslation,
    setSecondaryTranslation,
    getTranslationById,
    availableTranslations
  } = useTranslation();

  const { getContextCardByVerseRef } = useContextCards();
  const { trackParallelView, trackContextCardView } = useEngagementAnalytics();

  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState('JHN'); // Default to John
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(3); // Default to chapter 3
  const [primaryContent, setPrimaryContent] = useState(null);
  const [secondaryContent, setSecondaryContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncScroll, setSyncScroll] = useState(true);
  const [showContextCard, setShowContextCard] = useState(false);
  const [selectedVerseRef, setSelectedVerseRef] = useState(null);
  const [contextCard, setContextCard] = useState(null);

  const primaryScrollRef = useRef(null);
  const secondaryScrollRef = useRef(null);
  const scrollTimeout = useRef(null);
  const lastScrollSource = useRef(null);

  // Load books on mount
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const booksData = await getBooks(primaryTranslation);
        if (booksData && booksData.length > 0) {
          setBooks(booksData);
        } else {
          // Fallback to common books if API fails
          setBooks(getCommonBooks());
        }
      } catch (err) {
        console.error('Error loading books:', err);
        setBooks(getCommonBooks());
      }
    };
    loadBooks();
  }, [primaryTranslation]);

  // Load chapters when book changes
  useEffect(() => {
    const loadChapters = async () => {
      if (!selectedBook) return;

      try {
        const chaptersData = await getChapters(primaryTranslation, selectedBook);
        if (chaptersData && chaptersData.length > 0) {
          setChapters(chaptersData);
        } else {
          // Fallback to generating chapter list
          setChapters(generateChapters(selectedBook));
        }
      } catch (err) {
        console.error('Error loading chapters:', err);
        setChapters(generateChapters(selectedBook));
      }
    };
    loadChapters();
  }, [selectedBook, primaryTranslation]);

  // Load chapter content when book or chapter changes
  useEffect(() => {
    loadChapterContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook, selectedChapter, primaryTranslation, secondaryTranslation]);

  const loadChapterContent = async () => {
    if (!selectedBook || !selectedChapter) return;

    setLoading(true);
    setError(null);

    try {
      const [primaryData, secondaryData] = await Promise.all([
        getChapter(selectedBook, selectedChapter, primaryTranslation),
        getChapter(selectedBook, selectedChapter, secondaryTranslation)
      ]);

      if (primaryData) {
        setPrimaryContent(primaryData);
      } else {
        setError('Failed to load primary translation');
      }

      if (secondaryData) {
        setSecondaryContent(secondaryData);
      } else {
        setError('Failed to load secondary translation');
      }

      // Track parallel view engagement if both loaded successfully
      if (primaryData && secondaryData) {
        const book = books.find(b => b.id === selectedBook);
        const bookName = book ? book.name : selectedBook;
        const reference = `${bookName} ${selectedChapter}`;
        const primaryTransId = getTranslationById(primaryTranslation)?.abbreviation || primaryTranslation;
        const secondaryTransId = getTranslationById(secondaryTranslation)?.abbreviation || secondaryTranslation;
        trackParallelView(reference, [primaryTransId, secondaryTransId]);
      }
    } catch (err) {
      console.error('Error loading chapter:', err);
      setError('Failed to load chapter content. Please check your internet connection and API key.');
    } finally {
      setLoading(false);
    }
  };

  // Synchronized scrolling
  const handleScroll = (source) => {
    if (!syncScroll) return;

    const sourceRef = source === 'primary' ? primaryScrollRef : secondaryScrollRef;
    const targetRef = source === 'primary' ? secondaryScrollRef : primaryScrollRef;

    if (!sourceRef.current || !targetRef.current) return;

    // Prevent scroll loop
    if (lastScrollSource.current === (source === 'primary' ? 'secondary' : 'primary')) {
      return;
    }

    lastScrollSource.current = source;

    const sourceScroll = sourceRef.current;
    const targetScroll = targetRef.current;

    const scrollPercentage = sourceScroll.scrollTop / (sourceScroll.scrollHeight - sourceScroll.clientHeight);
    const targetScrollTop = scrollPercentage * (targetScroll.scrollHeight - targetScroll.clientHeight);

    targetScroll.scrollTop = targetScrollTop;

    // Reset the scroll source after a delay
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    scrollTimeout.current = setTimeout(() => {
      lastScrollSource.current = null;
    }, 100);
  };

  // Handle verse click to show context card
  const handleVerseClick = (verseNumber) => {
    // Get the book name from the books array
    const book = books.find(b => b.id === selectedBook);
    const bookName = book ? book.name : selectedBook;

    // Construct the verse reference (e.g., "John 3:16")
    const verseRef = `${bookName} ${selectedChapter}:${verseNumber}`;

    // Look up the context card
    const card = getContextCardByVerseRef(verseRef);

    setSelectedVerseRef(verseRef);
    setContextCard(card);
    setShowContextCard(true);

    // Track context card view if a card exists
    if (card) {
      trackContextCardView(verseRef, card.type || 'general');
    }
  };

  // Add click handlers to verse numbers after content renders
  useEffect(() => {
    const addVerseClickHandlers = () => {
      // Find all verse number spans in both translations
      const verseNums = document.querySelectorAll('.chapter-text .verse-num');

      verseNums.forEach((verseNum) => {
        // Make verse numbers clickable
        verseNum.style.cursor = 'pointer';
        verseNum.style.transition = 'all 0.2s ease';

        // Add hover effect
        const handleMouseEnter = () => {
          verseNum.style.textDecoration = 'underline';
          verseNum.style.transform = 'scale(1.1)';
        };

        const handleMouseLeave = () => {
          verseNum.style.textDecoration = 'none';
          verseNum.style.transform = 'scale(1)';
        };

        // Add click handler
        const handleClick = (e) => {
          e.preventDefault();
          const verseNumber = verseNum.textContent.trim();
          handleVerseClick(verseNumber);
        };

        verseNum.addEventListener('mouseenter', handleMouseEnter);
        verseNum.addEventListener('mouseleave', handleMouseLeave);
        verseNum.addEventListener('click', handleClick);

        // Store the handlers for cleanup
        verseNum._handlers = {
          mouseenter: handleMouseEnter,
          mouseleave: handleMouseLeave,
          click: handleClick
        };
      });
    };

    // Add handlers after content loads
    if (primaryContent || secondaryContent) {
      // Small delay to ensure DOM is updated
      setTimeout(addVerseClickHandlers, 100);
    }

    // Cleanup function
    return () => {
      const verseNums = document.querySelectorAll('.chapter-text .verse-num');
      verseNums.forEach((verseNum) => {
        if (verseNum._handlers) {
          verseNum.removeEventListener('mouseenter', verseNum._handlers.mouseenter);
          verseNum.removeEventListener('mouseleave', verseNum._handlers.mouseleave);
          verseNum.removeEventListener('click', verseNum._handlers.click);
          delete verseNum._handlers;
        }
      });
    };
  }, [primaryContent, secondaryContent, selectedBook, selectedChapter, books, getContextCardByVerseRef]);

  const primaryTranslationInfo = getTranslationById(primaryTranslation);
  const secondaryTranslationInfo = getTranslationById(secondaryTranslation);

  return (
    <div className="parallel-bible-page">
      <header className="parallel-bible-header">
        <h1>Parallel Bible Study</h1>
        <p>Compare translations side by side to deepen your understanding</p>
      </header>

      <div className="controls-panel">
        <div className="navigation-controls">
          <div className="control-group">
            <label htmlFor="book-select">Book:</label>
            <select
              id="book-select"
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="control-select"
            >
              {books.map(book => (
                <option key={book.id} value={book.id}>
                  {book.name}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="chapter-select">Chapter:</label>
            <select
              id="chapter-select"
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(Number(e.target.value))}
              className="control-select"
            >
              {chapters.map((chapter, index) => (
                <option key={chapter.id || index} value={chapter.number || index + 1}>
                  {chapter.number || index + 1}
                </option>
              ))}
            </select>
          </div>

          <button onClick={loadChapterContent} className="refresh-button" disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="sync-control">
          <label className="sync-checkbox">
            <input
              type="checkbox"
              checked={syncScroll}
              onChange={(e) => setSyncScroll(e.target.checked)}
            />
            <span>Synchronized Scrolling</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Read Aloud Controls */}
      {primaryContent && (
        <ReadAloudControls
          text={(() => {
            const book = books.find(b => b.id === selectedBook);
            const bookName = book ? book.name : selectedBook;
            const reference = `${bookName} chapter ${selectedChapter}`;
            const chapterText = formatBibleVerseForSpeech(primaryContent.content);
            return `${formatReferenceForSpeech(reference)}. ${chapterText}`;
          })()}
          compact={false}
        />
      )}

      {/* Reading Metrics */}
      {primaryContent && (
        <PassageMetrics
          content={primaryContent.content}
          bookId={selectedBook}
          chapter={selectedChapter}
          compact={true}
        />
      )}

      <div className="parallel-container">
        <div className="translation-column">
          <div className="translation-header">
            <h2>{primaryTranslationInfo.name}</h2>
            <select
              value={primaryTranslation}
              onChange={(e) => setPrimaryTranslation(e.target.value)}
              className="translation-select"
            >
              {availableTranslations.map(trans => (
                <option key={trans.id} value={trans.id}>
                  {trans.code} - {trans.name}
                </option>
              ))}
            </select>
          </div>
          <div
            className="translation-content"
            ref={primaryScrollRef}
            onScroll={() => handleScroll('primary')}
          >
            {loading ? (
              <div className="loading-spinner">Loading primary translation...</div>
            ) : primaryContent ? (
              <div
                className="chapter-text"
                dangerouslySetInnerHTML={{ __html: primaryContent.content }}
              />
            ) : (
              <div className="placeholder">Select a chapter to view</div>
            )}
          </div>
        </div>

        <div className="translation-column">
          <div className="translation-header">
            <h2>{secondaryTranslationInfo.name}</h2>
            <select
              value={secondaryTranslation}
              onChange={(e) => setSecondaryTranslation(e.target.value)}
              className="translation-select"
            >
              {availableTranslations.map(trans => (
                <option key={trans.id} value={trans.id}>
                  {trans.code} - {trans.name}
                </option>
              ))}
            </select>
          </div>
          <div
            className="translation-content"
            ref={secondaryScrollRef}
            onScroll={() => handleScroll('secondary')}
          >
            {loading ? (
              <div className="loading-spinner">Loading secondary translation...</div>
            ) : secondaryContent ? (
              <div
                className="chapter-text"
                dangerouslySetInnerHTML={{ __html: secondaryContent.content }}
              />
            ) : (
              <div className="placeholder">Select a chapter to view</div>
            )}
          </div>
        </div>
      </div>

      {showContextCard && (
        <ContextCardModal
          contextCard={contextCard}
          verseRef={selectedVerseRef}
          onClose={() => setShowContextCard(false)}
        />
      )}
    </div>
  );
};

// Fallback common books list
const getCommonBooks = () => [
  { id: 'GEN', name: 'Genesis' },
  { id: 'EXO', name: 'Exodus' },
  { id: 'PSA', name: 'Psalms' },
  { id: 'PRO', name: 'Proverbs' },
  { id: 'ISA', name: 'Isaiah' },
  { id: 'JER', name: 'Jeremiah' },
  { id: 'MAT', name: 'Matthew' },
  { id: 'MRK', name: 'Mark' },
  { id: 'LUK', name: 'Luke' },
  { id: 'JHN', name: 'John' },
  { id: 'ACT', name: 'Acts' },
  { id: 'ROM', name: 'Romans' },
  { id: '1CO', name: '1 Corinthians' },
  { id: '2CO', name: '2 Corinthians' },
  { id: 'GAL', name: 'Galatians' },
  { id: 'EPH', name: 'Ephesians' },
  { id: 'PHP', name: 'Philippians' },
  { id: 'COL', name: 'Colossians' },
  { id: 'JAS', name: 'James' },
  { id: 'REV', name: 'Revelation' }
];

// Generate chapters for a book (fallback)
const generateChapters = (bookId) => {
  const chapterCounts = {
    'GEN': 50, 'EXO': 40, 'PSA': 150, 'PRO': 31, 'ISA': 66, 'JER': 52,
    'MAT': 28, 'MRK': 16, 'LUK': 24, 'JHN': 21, 'ACT': 28, 'ROM': 16,
    '1CO': 16, '2CO': 13, 'GAL': 6, 'EPH': 6, 'PHP': 4, 'COL': 4,
    'JAS': 5, 'REV': 22
  };

  const count = chapterCounts[bookId] || 50;
  return Array.from({ length: count }, (_, i) => ({
    id: `${bookId}.${i + 1}`,
    number: i + 1
  }));
};

export default ParallelBiblePage;
