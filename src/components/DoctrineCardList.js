import React from 'react';
import './DoctrineCardList.css';
import { DOCTRINE_CATEGORY_LABELS } from '../services/doctrineCardService';

/**
 * DoctrineCardList Component
 *
 * Displays doctrine cards in a grid layout
 */
const DoctrineCardList = ({ doctrineCards, onCardClick, isLoading }) => {
  if (isLoading) {
    return (
      <div className="doctrine-card-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading doctrine cards...</p>
      </div>
    );
  }

  if (!doctrineCards || doctrineCards.length === 0) {
    return (
      <div className="doctrine-card-list-empty">
        <h3>No Doctrine Cards Available</h3>
        <p>Check back later for foundational doctrine teachings.</p>
      </div>
    );
  }

  // Group cards by category
  const groupedCards = doctrineCards.reduce((acc, card) => {
    const category = card.category || 'OTHER';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(card);
    return acc;
  }, {});

  return (
    <div className="doctrine-card-list">
      {Object.entries(groupedCards).map(([category, cards]) => (
        <div key={category} className="doctrine-category-section">
          <h3 className="category-header">
            {DOCTRINE_CATEGORY_LABELS[category] || category}
          </h3>
          <div className="doctrine-cards-grid">
            {cards.map((card) => (
              <div
                key={card.id}
                className="doctrine-card"
                data-category={card.category}
                onClick={() => onCardClick?.(card)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onCardClick?.(card);
                  }
                }}
              >
                <div className="doctrine-card-header">
                  <h4 className="doctrine-card-title">{card.title}</h4>
                  <span className="doctrine-card-category">
                    {DOCTRINE_CATEGORY_LABELS[card.category] || card.category}
                  </span>
                </div>
                <p className="doctrine-card-summary">{card.shortSummary}</p>
                <div className="doctrine-card-footer">
                  <span className="learn-more">Learn more →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DoctrineCardList;
