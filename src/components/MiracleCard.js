import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVerseText } from '../services/bibleAPI';
import './MiracleCard.css';

function MiracleCard({ miracle, isExpanded, onToggleExpand, categoryIcon }) {
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [verseText, setVerseText] = useState(null);
  const [selectedReference, setSelectedReference] = useState(null);
  const navigate = useNavigate();

  const handleLoadVerse = async (reference) => {
    if (selectedReference === reference && verseText) {
      // If clicking the same reference, close it
      setVerseText(null);
      setSelectedReference(null);
      return;
    }

    setLoadingVerse(true);
    setSelectedReference(reference);

    try {
      const verseReference = `${reference.book} ${reference.chapter}:${reference.verses}`;
      const result = await getVerseText(verseReference);

      if (result && result.text) {
        setVerseText(result.text);
      } else {
        setVerseText('Verse text not available.');
      }
    } catch (error) {
      console.error('Error loading verse:', error);
      setVerseText('Error loading verse. Please try again.');
    } finally {
      setLoadingVerse(false);
    }
  };

  const navigateToBibleTool = (reference) => {
    const verseReference = `${reference.book} ${reference.chapter}:${reference.verses}`;
    navigate(`/bible?verse=${encodeURIComponent(verseReference)}`);
  };

  const formatReference = (ref) => {
    return `${ref.book} ${ref.chapter}:${ref.verses}`;
  };

  return (
    <div className={`miracle-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="miracle-card-header" onClick={() => onToggleExpand(miracle.id)}>
        <div className="miracle-title-section">
          <span className="miracle-icon">{categoryIcon}</span>
          <h3 className="miracle-title">{miracle.title}</h3>
        </div>
        <div className="miracle-expand-icon">
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>

      {isExpanded && (
        <div className="miracle-card-content">
          <div className="miracle-category-badge">
            {miracle.category}
          </div>

          <div className="miracle-description">
            <p>{miracle.description}</p>
          </div>

          <div className="miracle-details">
            <div className="miracle-detail-item">
              <strong>📍 Location:</strong> {miracle.location}
            </div>
            <div className="miracle-detail-item">
              <strong>📖 Key Verse:</strong> {miracle.keyVerse}
            </div>
          </div>

          <div className="miracle-section">
            <h4>Biblical References</h4>
            <div className="miracle-references">
              {miracle.references.map((ref, index) => (
                <div key={index} className="reference-item">
                  <button
                    className="reference-btn"
                    onClick={() => handleLoadVerse(ref)}
                  >
                    {formatReference(ref)}
                  </button>
                  <button
                    className="bible-tool-btn"
                    onClick={() => navigateToBibleTool(ref)}
                    title="Open in Bible Tool"
                  >
                    🔍
                  </button>
                </div>
              ))}
            </div>

            {loadingVerse && selectedReference && (
              <div className="verse-loading">
                Loading verse...
              </div>
            )}

            {verseText && selectedReference && !loadingVerse && (
              <div className="verse-display">
                <div className="verse-reference">
                  {formatReference(selectedReference)}
                </div>
                <div className="verse-text">
                  {verseText}
                </div>
              </div>
            )}
          </div>

          <div className="miracle-section">
            <h4>Significance</h4>
            <p className="miracle-significance">{miracle.significance}</p>
          </div>

          <div className="miracle-section lesson-for-teens">
            <h4>💡 Lesson for Teens</h4>
            <p className="miracle-lesson">{miracle.lessonForTeens}</p>
          </div>

          <div className="miracle-actions">
            <button
              className="action-btn primary"
              onClick={() => navigate(`/bible?verse=${encodeURIComponent(miracle.keyVerse)}`)}
            >
              Read Key Verse in Bible Tool
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MiracleCard;
