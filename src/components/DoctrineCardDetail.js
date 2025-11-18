import React, { useEffect } from 'react';
import './DoctrineCardDetail.css';
import { DOCTRINE_CATEGORY_LABELS } from '../services/doctrineCardService';

/**
 * DoctrineCardDetail Component
 *
 * Modal display for detailed doctrine card information
 */
const DoctrineCardDetail = ({ doctrineCard, onClose }) => {
  // Close modal on Escape key
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

  if (!doctrineCard) {
    return null;
  }

  return (
    <div className="doctrine-detail-backdrop" onClick={handleBackdropClick}>
      <div className="doctrine-detail-modal">
        <div className="doctrine-detail-header">
          <div>
            <h2>{doctrineCard.title}</h2>
            <span className="doctrine-detail-category">
              {DOCTRINE_CATEGORY_LABELS[doctrineCard.category] || doctrineCard.category}
            </span>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="doctrine-detail-body">
          {/* Short Summary */}
          {doctrineCard.shortSummary && (
            <section className="doctrine-section summary-section">
              <h3>Summary</h3>
              <p className="summary-text">{doctrineCard.shortSummary}</p>
            </section>
          )}

          {/* Full Description */}
          {doctrineCard.fullDescription && (
            <section className="doctrine-section">
              <h3>📖 Detailed Explanation</h3>
              <div className="description-text">{doctrineCard.fullDescription}</div>
            </section>
          )}

          {/* Simple Explanation */}
          {doctrineCard.simpleExplanation && (
            <section className="doctrine-section simple-explanation-section">
              <h3>💡 Simple Explanation</h3>
              <p className="simple-explanation-text">{doctrineCard.simpleExplanation}</p>
            </section>
          )}

          {/* Key Bible Verses */}
          {doctrineCard.keyVerses && doctrineCard.keyVerses.length > 0 && (
            <section className="doctrine-section">
              <h3>📜 Key Bible Verses</h3>
              <div className="key-verses-list">
                {doctrineCard.keyVerses.map((verse, index) => (
                  <div key={index} className="key-verse-item">
                    <strong className="verse-ref">{verse.ref}</strong>
                    <p className="verse-text">"{verse.text}"</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Discussion Questions */}
          {doctrineCard.discussionQuestions && doctrineCard.discussionQuestions.length > 0 && (
            <section className="doctrine-section">
              <h3>💬 Discussion Questions</h3>
              <ul className="discussion-questions-list">
                {doctrineCard.discussionQuestions.map((question, index) => (
                  <li key={index} className="discussion-question-item">
                    {question}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Disclaimer */}
          <div className="doctrine-disclaimer">
            <p>
              <strong>Note:</strong> This content represents broadly-agreed Christian doctrine.
              For specific denominational teachings or questions, please consult your church leadership.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctrineCardDetail;
