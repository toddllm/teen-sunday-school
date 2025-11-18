import React, { useState } from 'react';
import axios from 'axios';
import { getPassage, referenceToVerseId, verseIdToReference } from '../services/bibleAPI';
import './AIPassageSummaryPage.css';

const AIPassageSummaryPage = () => {
  const [reference, setReference] = useState('');
  const [passageData, setPassageData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSummaries, setRecentSummaries] = useState([]);

  // Default Bible translation
  const bibleId = 'de4e12af7f28f599-02'; // NIV

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!reference.trim()) return;

    await generateSummary(reference);
  };

  const generateSummary = async (verseReference) => {
    setLoading(true);
    setError('');
    setSummary(null);
    setPassageData(null);

    try {
      // Step 1: Get the passage text from Bible API
      const verseId = referenceToVerseId(verseReference);
      const passage = await getPassage(verseId, bibleId);

      if (!passage || !passage.text) {
        throw new Error('Could not retrieve passage text');
      }

      setPassageData({
        reference: passage.reference || verseReference,
        text: passage.text,
        verseId,
      });

      // Step 2: Generate AI summary
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${API_BASE_URL}/api/ai/passage-summary`, {
        verseId,
        verseReference: passage.reference || verseReference,
        bibleId,
        passageText: passage.text,
      });

      if (response.data.success) {
        setSummary(response.data.summary);

        // Add to recent summaries list
        setRecentSummaries((prev) => {
          const updated = [
            { reference: passage.reference || verseReference, verseId },
            ...prev.filter((item) => item.verseId !== verseId),
          ];
          return updated.slice(0, 5); // Keep only 5 most recent
        });
      } else if (response.data.filtered) {
        setError(
          response.data.message ||
            'This content has been filtered. Please consult with a leader for guidance on this topic.'
        );
      } else {
        throw new Error('Failed to generate summary');
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(
        err.response?.data?.error ||
          err.message ||
          'Could not generate summary. Please check the reference and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReference = (ref) => {
    setReference(ref);
    generateSummary(ref);
  };

  const formatKeyPoints = (keyPoints) => {
    if (Array.isArray(keyPoints)) {
      return keyPoints;
    }
    // If it's a JSON string, try to parse it
    if (typeof keyPoints === 'string') {
      try {
        const parsed = JSON.parse(keyPoints);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  return (
    <div className="ai-passage-summary-page">
      <div className="page-header">
        <h1>AI Passage Summary</h1>
        <p>Get AI-powered insights, context, and application for any Bible passage</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Enter Bible reference (e.g., John 3:16 or John 3:16-21)"
          className="search-input"
        />
        <button type="submit" disabled={loading} className="search-btn">
          {loading ? 'Generating...' : 'Generate Summary'}
        </button>
      </form>

      {error && (
        <div className="error-box">
          <p>{error}</p>
        </div>
      )}

      {passageData && (
        <div className="passage-section">
          <h2>{passageData.reference}</h2>
          <div className="passage-text">{passageData.text}</div>
        </div>
      )}

      {summary && (
        <div className="summary-section">
          <div className="summary-card">
            <h3>Summary</h3>
            <p className="summary-text">{summary.summary}</p>
          </div>

          {summary.keyPoints && formatKeyPoints(summary.keyPoints).length > 0 && (
            <div className="summary-card">
              <h3>Key Points</h3>
              <ul className="key-points-list">
                {formatKeyPoints(summary.keyPoints).map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="context-grid">
            {summary.historicalContext && (
              <div className="summary-card context-card">
                <h3>Historical & Cultural Context</h3>
                <p>{summary.historicalContext}</p>
              </div>
            )}

            {summary.literaryContext && (
              <div className="summary-card context-card">
                <h3>Literary Context</h3>
                <p>{summary.literaryContext}</p>
              </div>
            )}
          </div>

          {summary.practicalApplication && (
            <div className="summary-card application-card">
              <h3>Practical Application for Teens</h3>
              <p>{summary.practicalApplication}</p>
            </div>
          )}

          <div className="summary-metadata">
            <small>
              {summary.aiModel && `Generated by ${summary.aiModel}`}
              {summary.viewCount > 1 && ` • Viewed ${summary.viewCount} times`}
            </small>
          </div>
        </div>
      )}

      {/* Recent Summaries */}
      {recentSummaries.length > 0 && (
        <div className="recent-section">
          <h3>Recent Summaries</h3>
          <div className="recent-buttons">
            {recentSummaries.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickReference(item.reference)}
                className="recent-btn"
              >
                {item.reference}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Passages */}
      <div className="popular-section">
        <h3>Try These Popular Passages</h3>
        <div className="popular-buttons">
          {[
            'John 3:16-17',
            'Psalm 23',
            'Romans 8:28-39',
            'Philippians 4:4-9',
            'Matthew 5:1-12',
            'Ephesians 6:10-18',
          ].map((ref) => (
            <button
              key={ref}
              onClick={() => handleQuickReference(ref)}
              className="popular-btn"
            >
              {ref}
            </button>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h3>About AI Passage Summaries</h3>
        <p>
          This tool uses artificial intelligence to provide summaries, insights, and context for
          Bible passages. The AI analyzes the text to help you understand:
        </p>
        <ul>
          <li>What the passage is about and its main message</li>
          <li>Key points and important insights</li>
          <li>Historical and cultural background</li>
          <li>How the passage fits in its literary context</li>
          <li>Practical applications for your daily life</li>
        </ul>
        <p className="disclaimer">
          <strong>Note:</strong> AI-generated summaries are helpful study aids, but they should not
          replace reading Scripture, prayer, and guidance from trusted leaders. Always verify
          insights with your youth leader or pastor.
        </p>
      </div>
    </div>
  );
};

export default AIPassageSummaryPage;
