import React from 'react';
import './ParableViewer.css';

/**
 * ParableViewer Component
 *
 * Displays a parable with its interpretation, context, and application
 */
const ParableViewer = ({ parable, onReferenceClick }) => {
  if (!parable) {
    return (
      <div className="parable-viewer-empty">
        <p>Select a parable to view its details</p>
      </div>
    );
  }

  const {
    title,
    reference,
    category,
    parableText,
    interpretation,
    historicalContext,
    applicationPoints = [],
    keyTheme,
    crossReferences = [],
    relatedParables = [],
  } = parable;

  return (
    <div className="parable-viewer">
      {/* Header Section */}
      <div className="parable-header">
        <div className="parable-title-section">
          <h2>{title}</h2>
          <div className="parable-meta">
            <span
              className="parable-reference"
              onClick={() => onReferenceClick?.(reference)}
              role="button"
              tabIndex={0}
            >
              {reference}
            </span>
            {category && <span className="parable-category">{category}</span>}
          </div>
        </div>
        {keyTheme && (
          <div className="parable-key-theme">
            <strong>Key Theme:</strong> {keyTheme}
          </div>
        )}
      </div>

      {/* Parable Text Section */}
      <div className="parable-section parable-text-section">
        <h3>The Parable</h3>
        <div className="parable-text">{parableText}</div>
      </div>

      {/* Interpretation Section */}
      {interpretation && (
        <div className="parable-section interpretation-section">
          <h3>Interpretation</h3>
          <div className="interpretation-text">{interpretation}</div>
        </div>
      )}

      {/* Historical Context Section */}
      {historicalContext && (
        <div className="parable-section context-section">
          <h3>Historical & Cultural Context</h3>
          <div className="context-text">{historicalContext}</div>
        </div>
      )}

      {/* Application Points Section */}
      {applicationPoints && applicationPoints.length > 0 && (
        <div className="parable-section application-section">
          <h3>Application Points</h3>
          <ul className="application-list">
            {applicationPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cross References Section */}
      {crossReferences && crossReferences.length > 0 && (
        <div className="parable-section cross-references-section">
          <h3>Cross References</h3>
          <div className="cross-references-list">
            {crossReferences.map((crossRef, index) => (
              <div key={index} className="cross-reference-item">
                <span
                  className="cross-ref-link"
                  onClick={() => onReferenceClick?.(crossRef.ref)}
                  role="button"
                  tabIndex={0}
                >
                  {crossRef.ref}
                </span>
                {crossRef.description && (
                  <span className="cross-ref-description">
                    - {crossRef.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Parables Section */}
      {relatedParables && relatedParables.length > 0 && (
        <div className="parable-section related-parables-section">
          <h3>Related Parables</h3>
          <div className="related-parables-list">
            {relatedParables.map((related, index) => (
              <div key={index} className="related-parable-item">
                {related.title || related.ref || related}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParableViewer;
