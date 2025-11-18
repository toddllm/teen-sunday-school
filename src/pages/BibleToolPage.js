import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVerseText } from '../services/bibleAPI';
import CrossReferencePanel from '../components/CrossReferencePanel';
import CommentaryPanel from '../components/CommentaryPanel';
import PassageMetrics from '../components/PassageMetrics';
import ReadAloudControls from '../components/ReadAloudControls';
import { createBiblePassageSpeech } from '../services/readAloudService';
import { useEngagementAnalytics } from '../contexts/EngagementAnalyticsContext';
import { useTranslation } from '../contexts/TranslationContext';
import { referenceToId } from '../services/commentaryService';
import './BibleToolPage.css';

const BibleToolPage = () => {
  const navigate = useNavigate();
  const { trackPassageRead, trackCrossReference } = useEngagementAnalytics();
  const { primaryTranslation, trackTranslationUsage } = useTranslation();
  const [reference, setReference] = useState('');
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setError('');
    setVerse(null);

    try {
      const result = await getVerseText(reference);
      setVerse(result);
      // Track translation usage for analytics
      trackTranslationUsage(primaryTranslation);
      // Add to history if it's a successful search
      if (result && result.reference) {
        setHistory(prev => [...prev, result.reference]);
        trackPassageRead(result.reference, 'ESV');
      }
    } catch (err) {
      setError('Could not find that verse. Please check the reference and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCrossReferenceClick = async (crossRefText) => {
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Set the reference and trigger search
    setReference(crossRefText);
    setLoading(true);
    setError('');

    // Track cross-reference click (from current verse to new verse)
    const fromReference = verse?.reference || null;
    setVerse(null);

    try {
      const result = await getVerseText(crossRefText);
      setVerse(result);
      // Track translation usage for analytics
      trackTranslationUsage(primaryTranslation);
      // Add to history
      if (result && result.reference) {
        setHistory(prev => [...prev, result.reference]);
        // Track engagement
        trackPassageRead(result.reference, 'ESV');
        // Track cross-reference if coming from another verse
        if (fromReference) {
          trackCrossReference(fromReference, result.reference);
        }
      }
    } catch (err) {
      setError('Could not find that verse. Please check the reference and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOutline = () => {
    if (verse && verse.reference) {
      navigate('/bible/sermon-outline', {
        state: { passageRef: verse.reference },
      });
    }
  };

  const handleGoBack = () => {
    if (history.length > 1) {
      // Remove current verse from history
      const newHistory = [...history];
      newHistory.pop();
      // Get previous verse
      const previousRef = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setReference(previousRef);
      // Load previous verse
      handleCrossReferenceClick(previousRef);
    }
  };

  return (
    <div className="bible-tool-page">
      <div className="bible-header">
        <h1>Bible Verse Lookup</h1>
        <p>Search for any Bible verse by reference (e.g., "John 3:16")</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Enter Bible reference (e.g., John 3:16)"
          className="search-input"
        />
        <button type="submit" disabled={loading} className="search-btn">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Navigation History */}
      {history.length > 1 && verse && (
        <div className="verse-navigation">
          <button onClick={handleGoBack} className="btn-back">
            ← Back to {history[history.length - 2]}
          </button>
          <span className="nav-breadcrumb">
            {history.slice(-3).join(' → ')}
          </span>
        </div>
      )}

      {error && (
        <div className="error-box">
          <p>{error}</p>
        </div>
      )}

      {verse && (
        <>
          <div className="verse-result">
            <h2>{verse.reference}</h2>

            {/* Reading Metrics */}
            <PassageMetrics
              content={verse.text}
              compact={true}
            />

            <div className="verse-text">
              {verse.text}
            </div>
            <div className="verse-actions">
              <button
                onClick={handleGenerateOutline}
                className="outline-btn"
                title="Create a teaching outline from this passage"
              >
                📝 Generate Teaching Outline
              </button>
            </div>
          </div>

          {/* Read Aloud Controls */}
          <ReadAloudControls
            text={createBiblePassageSpeech(verse.reference, verse.text, {
              includeReference: true,
              includeIntro: false
            })}
            compact={false}
          />

          {/* Cross-Reference Panel */}
          {verse.reference && (
            <CrossReferencePanel
              verseReference={verse.reference}
              onReferenceClick={handleCrossReferenceClick}
            />
          )}

          {/* Commentary Panel */}
          {verse.reference && (
            <CommentaryPanel
              passageRef={referenceToId(verse.reference)}
              passageReference={verse.reference}
            />
          )}
        </>
      )}

      <div className="popular-verses">
        <h3>Popular Verses</h3>
        <div className="verse-buttons">
          {['John 3:16', 'Psalm 23:1', 'Proverbs 3:5-6', 'Romans 8:28', 'Philippians 4:13'].map(ref => (
            <button
              key={ref}
              onClick={() => setReference(ref)}
              className="verse-btn"
            >
              {ref}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BibleToolPage;
