import React, { useState, useEffect } from 'react';
import { fetchCrossReferencesGrouped, referenceToVerseId } from '../services/bibleAPI';
import { useTranslation } from '../contexts/TranslationContext';
import './CrossReferencePanel.css';

/**
 * CrossReferencePanel - Displays cross-references for a Bible verse
 *
 * @param {string} verseReference - The verse reference (e.g., "John 3:16")
 * @param {function} onReferenceClick - Callback when a reference is clicked
 * @param {boolean} showGrouped - Whether to group references by type
 */
const CrossReferencePanel = ({ verseReference, onReferenceClick, showGrouped = true }) => {
  const [crossRefs, setCrossRefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'list'
  const { primaryTranslation } = useTranslation();

  useEffect(() => {
    const loadCrossReferences = async () => {
      if (!verseReference) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Convert reference to verse ID format
        const verseId = referenceToVerseId(verseReference);

        if (!verseId) {
          setError('Unable to parse verse reference');
          setLoading(false);
          return;
        }

        // Fetch cross-references with text
        const refs = await fetchCrossReferencesGrouped(verseId, primaryTranslation.id);

        // Check if any references were found
        const hasRefs = Object.values(refs).some(arr => arr.length > 0);

        if (!hasRefs) {
          setCrossRefs(null);
          setError('No cross-references available for this verse');
        } else {
          setCrossRefs(refs);
        }
      } catch (err) {
        console.error('Error loading cross-references:', err);
        setError('Failed to load cross-references');
      } finally {
        setLoading(false);
      }
    };

    loadCrossReferences();
  }, [verseReference, primaryTranslation]);

  const handleReferenceClick = (reference, verseId) => {
    if (onReferenceClick) {
      onReferenceClick(reference, verseId);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      quotation: 'Direct Quotations',
      parallel: 'Parallel Accounts',
      theme: 'Related Themes',
      allusion: 'Allusions',
      prophecy: 'Prophecy & Fulfillment'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      quotation: '📖',
      parallel: '↔️',
      theme: '🔗',
      allusion: '💭',
      prophecy: '🌟'
    };
    return icons[type] || '•';
  };

  const stripHtmlTags = (html) => {
    if (!html) return '';
    // Remove HTML tags and clean up formatting
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 150) + (html.length > 150 ? '...' : '');
  };

  const renderGroupedView = () => {
    return (
      <div className="cross-refs-grouped">
        {Object.entries(crossRefs).map(([type, refs]) => {
          if (refs.length === 0) return null;

          return (
            <div key={type} className="cross-ref-group">
              <h4 className="cross-ref-group-title">
                <span className="type-icon">{getTypeIcon(type)}</span>
                {getTypeLabel(type)}
                <span className="ref-count">{refs.length}</span>
              </h4>
              <div className="cross-ref-list">
                {refs.map((ref, index) => (
                  <div key={index} className="cross-ref-item">
                    <button
                      className="cross-ref-link"
                      onClick={() => handleReferenceClick(ref.reference, ref.verseId)}
                      title={`Go to ${ref.reference}`}
                    >
                      <span className="ref-reference">{ref.reference}</span>
                    </button>
                    {ref.description && (
                      <p className="ref-description">{ref.description}</p>
                    )}
                    {ref.text && (
                      <p className="ref-preview">{stripHtmlTags(ref.text)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    // Flatten all references into a single list
    const allRefs = Object.entries(crossRefs)
      .flatMap(([type, refs]) => refs.map(ref => ({ ...ref, type })))
      .filter(ref => ref);

    return (
      <div className="cross-refs-list">
        {allRefs.map((ref, index) => (
          <div key={index} className="cross-ref-item">
            <button
              className="cross-ref-link"
              onClick={() => handleReferenceClick(ref.reference, ref.verseId)}
              title={`Go to ${ref.reference}`}
            >
              <span className="type-badge" title={getTypeLabel(ref.type)}>
                {getTypeIcon(ref.type)}
              </span>
              <span className="ref-reference">{ref.reference}</span>
            </button>
            {ref.description && (
              <p className="ref-description">{ref.description}</p>
            )}
            {ref.text && (
              <p className="ref-preview">{stripHtmlTags(ref.text)}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="cross-reference-panel">
        <div className="cross-refs-header">
          <h3>Cross-References</h3>
        </div>
        <div className="cross-refs-loading">
          <div className="spinner"></div>
          <p>Loading cross-references...</p>
        </div>
      </div>
    );
  }

  if (error || !crossRefs) {
    return (
      <div className="cross-reference-panel">
        <div className="cross-refs-header">
          <h3>Cross-References</h3>
        </div>
        <div className="cross-refs-empty">
          <p>{error || 'No cross-references available for this verse'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cross-reference-panel">
      <div className="cross-refs-header">
        <h3>
          <button
            className="expand-toggle"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▼' : '▶'}
          </button>
          Cross-References
        </h3>
        {expanded && (
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'grouped' ? 'active' : ''}`}
              onClick={() => setViewMode('grouped')}
              title="Grouped by type"
            >
              <span>📑</span>
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <span>📄</span>
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="cross-refs-content">
          {viewMode === 'grouped' ? renderGroupedView() : renderListView()}
        </div>
      )}
    </div>
  );
};

export default CrossReferencePanel;
