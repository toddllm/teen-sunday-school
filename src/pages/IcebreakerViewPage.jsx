import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIcebreakers } from '../contexts/IcebreakerContext';
import { useAuth } from '../contexts/AuthContext';
import './IcebreakerViewPage.css';

const IcebreakerViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getIcebreakerById, trackUsage, toggleFavorite, duplicateIcebreaker } =
    useIcebreakers();

  const [icebreaker, setIcebreaker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    loadIcebreaker();
  }, [id]);

  const loadIcebreaker = async () => {
    try {
      const data = await getIcebreakerById(id);
      if (data) {
        setIcebreaker(data);
        // Track usage when viewing
        await trackUsage(id);
      } else {
        console.error('Icebreaker not found');
      }
    } catch (error) {
      console.error('Error loading icebreaker:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    try {
      const favorited = await toggleFavorite(id);
      setIsFavorited(favorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDuplicate = async () => {
    try {
      const newId = await duplicateIcebreaker(id);
      if (newId) {
        navigate(`/admin/icebreaker/edit/${newId}`);
      }
    } catch (error) {
      console.error('Error duplicating icebreaker:', error);
      alert('Failed to duplicate icebreaker');
    }
  };

  const handleEdit = () => {
    navigate(`/admin/icebreaker/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/admin/icebreakers');
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'get-to-know': '👋',
      'faith-based': '✝️',
      'energizer': '⚡',
      'deep-discussion': '💭',
    };
    return icons[category] || '🎯';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'get-to-know': '#3498db',
      'faith-based': '#9b59b6',
      'energizer': '#e74c3c',
      'deep-discussion': '#2ecc71',
    };
    return colors[category] || '#95a5a6';
  };

  const getEnergyLevelColor = (level) => {
    const colors = {
      low: '#27ae60',
      medium: '#f39c12',
      high: '#e74c3c',
    };
    return colors[level] || '#95a5a6';
  };

  if (loading) {
    return (
      <div className="icebreaker-view-page">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  if (!icebreaker) {
    return (
      <div className="icebreaker-view-page">
        <div className="error-state">
          <h2>Icebreaker not found</h2>
          <button className="btn btn-primary" onClick={handleBack}>
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="icebreaker-view-page">
      <div className="view-header">
        <button className="back-btn" onClick={handleBack}>
          ← Back
        </button>
        <div className="header-actions">
          <button className="action-btn favorite-btn-large" onClick={handleFavorite}>
            {isFavorited ? '★' : '☆'} Favorite
          </button>
          <button className="action-btn" onClick={handleDuplicate}>
            📋 Duplicate
          </button>
          {user && (user.role === 'TEACHER' || user.role === 'ORG_ADMIN' || user.role === 'SUPER_ADMIN') && (
            <button className="action-btn edit-btn-large" onClick={handleEdit}>
              ✏️ Edit
            </button>
          )}
        </div>
      </div>

      <div className="view-content">
        <div
          className="icebreaker-header"
          style={{ borderLeftColor: getCategoryColor(icebreaker.category) }}
        >
          <div className="header-top">
            <span className="category-icon">{getCategoryIcon(icebreaker.category)}</span>
            <h1>{icebreaker.title}</h1>
          </div>
          {icebreaker.description && <p className="description">{icebreaker.description}</p>}

          <div className="icebreaker-tags">
            <span className="tag category-tag">{icebreaker.category.replace('-', ' ')}</span>
            <span className="tag">{icebreaker.ageGroup}</span>
            <span className="tag">{icebreaker.groupSize} group</span>
            <span
              className="tag energy-tag"
              style={{ backgroundColor: getEnergyLevelColor(icebreaker.energyLevel) }}
            >
              {icebreaker.energyLevel} energy
            </span>
            <span className="tag">⏱️ {icebreaker.durationMinutes} min</span>
          </div>

          <div className="icebreaker-stats">
            {icebreaker.usageCount > 0 && (
              <div className="stat-item">
                <span className="stat-icon">📊</span>
                <span>Used {icebreaker.usageCount} times</span>
              </div>
            )}
            {icebreaker.favoriteCount > 0 && (
              <div className="stat-item">
                <span className="stat-icon">★</span>
                <span>{icebreaker.favoriteCount} favorites</span>
              </div>
            )}
          </div>
        </div>

        <div className="icebreaker-body">
          <section className="content-section">
            <h2>📝 Instructions</h2>
            <div className="instructions-content">{icebreaker.instructions}</div>
          </section>

          {icebreaker.materialsNeeded && icebreaker.materialsNeeded.length > 0 && (
            <section className="content-section">
              <h2>🛠️ Materials Needed</h2>
              <ul className="materials-list">
                {icebreaker.materialsNeeded.map((material, index) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </section>
          )}

          {icebreaker.questions && icebreaker.questions.length > 0 && (
            <section className="content-section">
              <h2>💬 Questions / Prompts</h2>
              <ol className="questions-list">
                {icebreaker.questions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <div className="quick-actions">
          <button className="quick-action-btn print-btn" onClick={() => window.print()}>
            🖨️ Print
          </button>
          <button
            className="quick-action-btn share-btn"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }}
          >
            🔗 Share Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default IcebreakerViewPage;
