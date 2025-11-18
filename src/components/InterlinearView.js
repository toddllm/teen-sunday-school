import React, { useState, useEffect } from 'react';
import { fetchInterlinearVerse, trackInterlinearInteraction } from '../services/interlinearAPI';
import './InterlinearView.css';

/**
 * InterlinearView - Displays simplified interlinear view for a Bible verse
 * Shows original language words with transliteration and English gloss
 *
 * @param {string} verseRef - Verse reference in API format (e.g., "JHN.3.16")
 * @param {boolean} inline - Whether to show inline or stacked layout
 * @param {function} onClose - Callback when close button is clicked
 */
const InterlinearView = ({ verseRef, inline = false, onClose }) => {
  const [interlinearData, setInterlinearData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWordIndex, setSelectedWordIndex] = useState(null);

  useEffect(() => {
    const loadInterlinearData = async () => {
      if (!verseRef) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchInterlinearVerse(verseRef);

        if (!data) {
          setError('Interlinear data not available for this verse');
          setInterlinearData(null);
        } else {
          setInterlinearData(data);
          // Track the view
          trackInterlinearInteraction(verseRef, 'view', {
            featureName: 'interlinear_view',
          });
        }
      } catch (err) {
        console.error('Error loading interlinear data:', err);
        setError('Failed to load interlinear data');
      } finally {
        setLoading(false);
      }
    };

    loadInterlinearData();
  }, [verseRef]);

  const handleWordClick = (index) => {
    setSelectedWordIndex(index === selectedWordIndex ? null : index);

    // Track word click
    if (index !== selectedWordIndex) {
      trackInterlinearInteraction(verseRef, 'word_click', {
        wordIndex: index,
        featureName: 'interlinear_view',
      });
    }
  };

  const formatVerseRef = (ref) => {
    // Convert "JHN.3.16" to "John 3:16"
    const bookMap = {
      'GEN': 'Genesis', 'EXO': 'Exodus', 'LEV': 'Leviticus', 'NUM': 'Numbers',
      'DEU': 'Deuteronomy', 'JOS': 'Joshua', 'JDG': 'Judges', 'RUT': 'Ruth',
      '1SA': '1 Samuel', '2SA': '2 Samuel', '1KI': '1 Kings', '2KI': '2 Kings',
      'ISA': 'Isaiah', 'JER': 'Jeremiah', 'EZK': 'Ezekiel', 'DAN': 'Daniel',
      'MAT': 'Matthew', 'MRK': 'Mark', 'LUK': 'Luke', 'JHN': 'John',
      'ACT': 'Acts', 'ROM': 'Romans', '1CO': '1 Corinthians', '2CO': '2 Corinthians',
      'GAL': 'Galatians', 'EPH': 'Ephesians', 'PHP': 'Philippians', 'COL': 'Colossians',
      '1TH': '1 Thessalonians', '2TH': '2 Thessalonians', 'JAS': 'James',
      '1PE': '1 Peter', '2PE': '2 Peter', '1JN': '1 John', 'REV': 'Revelation',
      'PSA': 'Psalm', 'PRO': 'Proverbs',
    };

    const parts = ref.split('.');
    if (parts.length >= 3) {
      const book = bookMap[parts[0]] || parts[0];
      return `${book} ${parts[1]}:${parts[2]}`;
    }
    return ref;
  };

  const renderStackedView = () => {
    return (
      <div className="interlinear-stacked">
        {interlinearData.tokens.map((token, index) => (
          <div
            key={index}
            className={`interlinear-word ${selectedWordIndex === index ? 'selected' : ''}`}
            onClick={() => handleWordClick(index)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleWordClick(index)}
          >
            <div className="word-original" lang={interlinearData.language === 'greek' ? 'el' : 'he'}>
              {token.original}
            </div>
            <div className="word-transliteration">
              {token.transliteration}
            </div>
            <div className="word-gloss">
              {token.gloss}
            </div>
            {selectedWordIndex === index && token.strongsNumber && (
              <div className="word-details">
                <div className="strongs-number">{token.strongsNumber}</div>
                {token.morphology && (
                  <div className="morphology">{token.morphology}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderInlineView = () => {
    return (
      <div className="interlinear-inline">
        {interlinearData.tokens.map((token, index) => (
          <div
            key={index}
            className={`interlinear-word-inline ${selectedWordIndex === index ? 'selected' : ''}`}
            onClick={() => handleWordClick(index)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleWordClick(index)}
          >
            <span className="word-original" lang={interlinearData.language === 'greek' ? 'el' : 'he'}>
              {token.original}
            </span>
            <span className="word-info">
              <span className="word-transliteration">{token.transliteration}</span>
              <span className="separator">·</span>
              <span className="word-gloss">{token.gloss}</span>
            </span>
            {selectedWordIndex === index && token.strongsNumber && (
              <div className="word-details-popup">
                <div className="strongs-number">{token.strongsNumber}</div>
                {token.morphology && (
                  <div className="morphology">{token.morphology}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="interlinear-view loading">
        <div className="spinner"></div>
        <p>Loading interlinear data...</p>
      </div>
    );
  }

  if (error || !interlinearData) {
    return (
      <div className="interlinear-view error">
        <p>{error || 'Interlinear data not available for this verse'}</p>
        {onClose && (
          <button className="close-btn" onClick={onClose}>Close</button>
        )}
      </div>
    );
  }

  return (
    <div className="interlinear-view">
      <div className="interlinear-header">
        <div className="header-left">
          <h3>Interlinear View</h3>
          <span className="verse-ref">{formatVerseRef(verseRef)}</span>
          {interlinearData.category && (
            <span className="category-badge">{interlinearData.category}</span>
          )}
        </div>
        {onClose && (
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        )}
      </div>

      <div className="interlinear-info">
        <span className="info-item">
          <strong>Language:</strong> {interlinearData.language === 'greek' ? 'Greek' : 'Hebrew'}
        </span>
        <span className="info-item">
          <strong>Text:</strong> {interlinearData.translation}
        </span>
      </div>

      <div className="interlinear-content">
        {inline ? renderInlineView() : renderStackedView()}
      </div>

      <div className="interlinear-help">
        <p>💡 Click on any word to see additional details</p>
      </div>
    </div>
  );
};

export default InterlinearView;
