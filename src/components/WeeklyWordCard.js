import React, { useState } from 'react';
import { useWeeklyWord } from '../contexts/WeeklyWordContext';
import './WeeklyWordCard.css';

const WeeklyWordCard = ({ word, viewSource = 'today_page', compact = false }) => {
  const { trackVerseClick } = useWeeklyWord();
  const [expandedVerse, setExpandedVerse] = useState(null);

  if (!word) return null;

  const handleVerseClick = async (verseRef) => {
    setExpandedVerse(expandedVerse === verseRef ? null : verseRef);
    await trackVerseClick(word.id, verseRef, viewSource);
  };

  const languageFlag = {
    GREEK: '🇬🇷',
    HEBREW: '🇮🇱',
    ARAMAIC: '🕊️',
  };

  const languageColor = {
    GREEK: '#0066cc',
    HEBREW: '#cc6600',
    ARAMAIC: '#669900',
  };

  return (
    <div className={`weekly-word-card ${compact ? 'compact' : ''}`}>
      {/* Header */}
      <div className="word-header">
        <div className="word-label">
          <span className="language-flag">{languageFlag[word.language] || '📖'}</span>
          <span className="label-text">Word of the Week</span>
        </div>
        <div className="language-badge" style={{ backgroundColor: languageColor[word.language] }}>
          {word.language}
        </div>
      </div>

      {/* Main Word Display */}
      <div className="word-display">
        <div className="original-word" style={{ borderColor: languageColor[word.language] }}>
          {word.lemma}
        </div>
        <div className="transliteration">{word.transliteration}</div>
        <div className="gloss">"{word.gloss}"</div>
      </div>

      {/* Blurb */}
      <div className="word-blurb">
        <p>{word.blurb}</p>
      </div>

      {/* Verses */}
      <div className="word-verses">
        <h4>Featured Verses</h4>
        <div className="verse-list">
          {Array.isArray(word.verseRefs) && word.verseRefs.map((verseRef, index) => (
            <div key={index} className="verse-item">
              <button
                className="verse-button"
                onClick={() => handleVerseClick(verseRef)}
              >
                <span className="verse-icon">📖</span>
                <span className="verse-ref">{verseRef}</span>
                <span className={`expand-icon ${expandedVerse === verseRef ? 'expanded' : ''}`}>
                  {expandedVerse === verseRef ? '▲' : '▼'}
                </span>
              </button>
              {expandedVerse === verseRef && word.verseTexts?.[index] && (
                <div className="verse-text">
                  {word.verseTexts[index]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="word-footer">
        <div className="week-date">
          Week of {new Date(word.weekStart).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyWordCard;
