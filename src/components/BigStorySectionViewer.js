import React from 'react';
import './BigStorySectionViewer.css';

const BigStorySectionViewer = ({
  section,
  onPassageClick,
  onNextSection,
  onPreviousSection,
  hasNext,
  hasPrevious,
}) => {
  if (!section) {
    return <div className="no-section">No section selected</div>;
  }

  const { visualData = {} } = section;

  return (
    <div className="big-story-section-viewer">
      {/* Header */}
      <div
        className="section-header"
        style={{
          background: `linear-gradient(135deg, ${
            visualData.color || '#666'
          }15, ${visualData.color || '#666'}30)`,
        }}
      >
        <div className="section-number">Part {section.order}</div>
        <div className="section-header-content">
          <div className="section-icon-large">
            {visualData.icon || '📖'}
          </div>
          <div>
            <h1 className="section-title">{section.sectionTitle}</h1>
            <p className="section-timeline-era">{section.timelineEra}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="section-description">
        <p>{section.description}</p>
      </div>

      {/* Key Events */}
      {section.keyEvents && section.keyEvents.length > 0 && (
        <div className="section-card">
          <h2>Key Events</h2>
          <ul className="key-events-list">
            {section.keyEvents.map((event, index) => (
              <li key={index}>{event}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Passages */}
      {section.keyPassages && section.keyPassages.length > 0 && (
        <div className="section-card">
          <h2>Key Passages</h2>
          <div className="passages-grid">
            {section.keyPassages.map((passage, index) => (
              <div
                key={index}
                className={`passage-card ${passage.isOT ? 'ot' : 'nt'}`}
              >
                <div className="passage-label">
                  {passage.isOT ? 'Old Testament' : 'New Testament'}
                </div>
                <button
                  className="passage-ref"
                  onClick={() => onPassageClick(passage.ref)}
                  title="Click to read this passage"
                >
                  {passage.ref}
                </button>
                {passage.notes && (
                  <p className="passage-notes">{passage.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* The Story */}
      {section.narrative && (
        <div className="section-card narrative-card">
          <h2>The Story</h2>
          <p className="narrative-summary">{section.narrative.summary}</p>

          {section.narrative.connections &&
            section.narrative.connections.length > 0 && (
              <div className="narrative-subsection">
                <h3>Connections</h3>
                <ul className="connections-list">
                  {section.narrative.connections.map((connection, index) => (
                    <li key={index}>{connection}</li>
                  ))}
                </ul>
              </div>
            )}

          {section.narrative.howItFits && (
            <div className="narrative-subsection">
              <h3>How It Fits</h3>
              <p className="how-it-fits">{section.narrative.howItFits}</p>
            </div>
          )}

          {section.narrative.nextSection && (
            <div className="next-section-preview">
              <p className="next-preview-text">
                {section.narrative.nextSection}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="section-navigation">
        <button
          className="nav-btn nav-prev"
          onClick={onPreviousSection}
          disabled={!hasPrevious}
        >
          ← Previous
        </button>
        <button
          className="nav-btn nav-next"
          onClick={onNextSection}
          disabled={!hasNext}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default BigStorySectionViewer;
