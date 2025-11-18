import React, { useEffect } from 'react';
import './ContextCardModal.css';

const ContextCardModal = ({ contextCard, verseRef, onClose }) => {
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

  if (!contextCard) {
    return (
      <div className="context-card-backdrop" onClick={handleBackdropClick}>
        <div className="context-card-modal">
          <div className="context-card-header">
            <h2>{verseRef}</h2>
            <button className="close-button" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
          <div className="context-card-body">
            <div className="no-context-message">
              <p>No context card available for this verse yet.</p>
              <p className="context-disclaimer">
                Context cards provide historical, literary, and thematic background for difficult or commonly misunderstood verses.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="context-card-backdrop" onClick={handleBackdropClick}>
      <div className="context-card-modal">
        <div className="context-card-header">
          <h2>{contextCard.verseRef}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="context-card-body">
          {contextCard.historicalContext && (
            <section className="context-section">
              <h3>📜 Historical Context</h3>
              <p>{contextCard.historicalContext}</p>
            </section>
          )}

          {contextCard.literaryContext && (
            <section className="context-section">
              <h3>📖 Literary Context</h3>
              <p>{contextCard.literaryContext}</p>
            </section>
          )}

          {contextCard.keyTheme && (
            <section className="context-section">
              <h3>💡 Key Theme</h3>
              <p className="key-theme">{contextCard.keyTheme}</p>
            </section>
          )}

          {contextCard.crossReferences && contextCard.crossReferences.length > 0 && (
            <section className="context-section">
              <h3>🔗 Cross References</h3>
              <ul className="cross-references-list">
                {contextCard.crossReferences.map((ref, index) => (
                  <li key={index} className="cross-reference-item">
                    <strong className="cross-ref-verse">{ref.ref}</strong>
                    <p className="cross-ref-note">{ref.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="context-disclaimer">
            <p>
              ℹ️ <em>This explanation is a summary, not exhaustive. Always study Scripture in context and consult multiple resources.</em>
            </p>
          </div>
        </div>

        <div className="context-card-footer">
          <button className="close-footer-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContextCardModal;
