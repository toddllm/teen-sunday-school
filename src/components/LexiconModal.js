/**
 * LexiconModal Component
 *
 * Displays detailed information about a Greek or Hebrew word including:
 * - Original language text (lemma)
 * - Transliteration
 * - Gloss (definition)
 * - Part of speech
 * - Strong's number
 * - Occurrence count
 * - Key references
 */

import React, { useEffect } from 'react';
import { useLexicon } from '../contexts/LexiconContext';
import './LexiconModal.css';

const LexiconModal = ({ lexeme, onClose, verseRef, word }) => {
  const { toggleBookmark, isBookmarked } = useLexicon();
  const bookmarked = isBookmarked(lexeme.strongsNumber);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBookmarkClick = () => {
    toggleBookmark(lexeme.strongsNumber);
  };

  return (
    <div className="lexicon-backdrop" onClick={handleBackdropClick}>
      <div className="lexicon-modal">
        {/* Header */}
        <div className="lexicon-modal-header">
          <div className="lexicon-header-content">
            <div className="lexicon-title-section">
              <h2 className="lexicon-lemma">{lexeme.lemma}</h2>
              <span className="lexicon-transliteration">{lexeme.transliteration}</span>
            </div>
            <div className="lexicon-language-badge">
              {lexeme.language}
            </div>
          </div>
          <div className="lexicon-header-actions">
            <button
              className={`lexicon-bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmarkClick}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark this word'}
            >
              {bookmarked ? '★' : '☆'}
            </button>
            <button className="lexicon-close-btn" onClick={onClose} title="Close (Esc)">
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="lexicon-modal-body">
          {/* Context info */}
          {word && verseRef && (
            <div className="lexicon-context">
              <strong>"{word}"</strong> in {verseRef}
            </div>
          )}

          {/* Primary gloss */}
          <div className="lexicon-section">
            <h3 className="lexicon-section-title">Primary Meaning</h3>
            <p className="lexicon-primary-gloss">{lexeme.primaryGloss}</p>
          </div>

          {/* All glosses */}
          <div className="lexicon-section">
            <h3 className="lexicon-section-title">Glosses</h3>
            <div className="lexicon-glosses">
              {lexeme.glosses.map((gloss, index) => (
                <span key={index} className="lexicon-gloss-tag">
                  {gloss}
                </span>
              ))}
            </div>
          </div>

          {/* Definition */}
          <div className="lexicon-section">
            <h3 className="lexicon-section-title">Definition</h3>
            <p className="lexicon-definition">{lexeme.definition}</p>
          </div>

          {/* Metadata */}
          <div className="lexicon-section lexicon-metadata">
            <div className="lexicon-meta-item">
              <span className="lexicon-meta-label">Part of Speech:</span>
              <span className="lexicon-meta-value">{lexeme.partOfSpeech}</span>
            </div>
            <div className="lexicon-meta-item">
              <span className="lexicon-meta-label">Strong's Number:</span>
              <span className="lexicon-meta-value">{lexeme.strongsNumber}</span>
            </div>
            <div className="lexicon-meta-item">
              <span className="lexicon-meta-label">Occurrences:</span>
              <span className="lexicon-meta-value">
                {lexeme.occurrenceCount} {lexeme.occurrenceCount === 1 ? 'time' : 'times'}
              </span>
            </div>
          </div>

          {/* Key References */}
          {lexeme.keyReferences && lexeme.keyReferences.length > 0 && (
            <div className="lexicon-section">
              <h3 className="lexicon-section-title">Key References</h3>
              <div className="lexicon-references">
                {lexeme.keyReferences.map((reference, index) => (
                  <div key={index} className="lexicon-reference-item">
                    <div className="lexicon-reference-header">
                      <span className="lexicon-reference-ref">{reference.ref}</span>
                    </div>
                    <p className="lexicon-reference-text">{reference.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="lexicon-modal-footer">
          <button className="lexicon-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LexiconModal;
