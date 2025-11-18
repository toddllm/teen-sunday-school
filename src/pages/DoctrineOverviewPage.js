import React, { useState, useEffect } from 'react';
import DoctrineCardList from '../components/DoctrineCardList';
import DoctrineCardDetail from '../components/DoctrineCardDetail';
import {
  listDoctrineCards,
  getDoctrineCard,
  recordDoctrineCardView,
  DOCTRINE_CATEGORIES,
  DOCTRINE_CATEGORY_LABELS,
} from '../services/doctrineCardService';
import './DoctrineOverviewPage.css';

const DoctrineOverviewPage = () => {
  const [doctrineCards, setDoctrineCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStartTime, setViewStartTime] = useState(null);

  // Load doctrine cards on mount and when filters change
  useEffect(() => {
    loadDoctrineCards();
  }, [selectedCategory, searchQuery]);

  const loadDoctrineCards = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }

      const cardsData = await listDoctrineCards(filters);
      setDoctrineCards(cardsData);
    } catch (err) {
      console.error('Error loading doctrine cards:', err);
      setError('Failed to load doctrine cards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (card) => {
    try {
      // Get full details
      const fullCard = await getDoctrineCard(card.id);
      setSelectedCard(fullCard);

      // Record view start time for metrics
      setViewStartTime(Date.now());
    } catch (err) {
      console.error('Error loading doctrine card:', err);
      setError('Failed to load doctrine card details. Please try again.');
    }
  };

  const handleCloseDetail = () => {
    // Record metrics before closing
    if (selectedCard && viewStartTime) {
      const timeSpentMs = Date.now() - viewStartTime;
      recordDoctrineCardView(selectedCard.id, {
        featureContext: 'doctrine_list',
        timeSpentMs,
      }).catch((err) => console.error('Error recording view:', err));
    }

    setSelectedCard(null);
    setViewStartTime(null);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="doctrine-overview-page">
      <div className="page-header">
        <h1>Doctrine Overview</h1>
        <p className="page-subtitle">
          Simple, non-denominational explanations of core Christian doctrines
        </p>
      </div>

      {/* Filters */}
      <div className="doctrine-filters">
        <div className="filter-group">
          <label htmlFor="search-input">Search:</label>
          <input
            id="search-input"
            type="text"
            placeholder="Search doctrines..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category-select">Category:</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="category-select"
          >
            <option value="all">All Categories</option>
            {Object.entries(DOCTRINE_CATEGORIES).map(([key, value]) => (
              <option key={value} value={value}>
                {DOCTRINE_CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadDoctrineCards}>Try Again</button>
        </div>
      )}

      {/* Doctrine Cards List */}
      <DoctrineCardList
        doctrineCards={doctrineCards}
        onCardClick={handleCardClick}
        isLoading={loading}
      />

      {/* Detail Modal */}
      {selectedCard && (
        <DoctrineCardDetail
          doctrineCard={selectedCard}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default DoctrineOverviewPage;
