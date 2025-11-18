import React from 'react';
import './ThemeComparisonViewer.css';

/**
 * ThemeComparisonViewer Component
 *
 * Displays Old Testament and New Testament passages side-by-side for a theme
 */
const ThemeComparisonViewer = ({ theme, onPassageClick }) => {
  if (!theme) {
    return (
      <div className="theme-comparison-empty">
        <p>Select a theme to view OT vs NT comparison</p>
      </div>
    );
  }

  const { themeName, description, otPassages = [], ntPassages = [], themeNotes } = theme;

  return (
    <div className="theme-comparison-viewer">
      <div className="theme-header">
        <h2>{themeName}</h2>
        {description && <p className="theme-description">{description}</p>}
      </div>

      {themeNotes?.summary && (
        <div className="theme-summary">
          <h3>Summary</h3>
          <p>{themeNotes.summary}</p>
        </div>
      )}

      <div className="theme-comparison-columns">
        {/* Old Testament Column */}
        <div className="theme-column ot-column">
          <div className="column-header">
            <h3>Old Testament</h3>
            <span className="passage-count">{otPassages.length} passages</span>
          </div>
          <div className="passages-list">
            {otPassages.length === 0 ? (
              <p className="no-passages">No OT passages added yet</p>
            ) : (
              otPassages.map((passage, index) => (
                <div key={index} className="passage-card">
                  <div className="passage-header">
                    <h4
                      className="passage-ref"
                      onClick={() => onPassageClick?.(passage.ref)}
                      role="button"
                      tabIndex={0}
                    >
                      {passage.ref}
                    </h4>
                  </div>
                  {passage.text && (
                    <p className="passage-text">"{passage.text}"</p>
                  )}
                  {passage.notes && (
                    <div className="passage-notes">
                      <strong>Note:</strong> {passage.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* New Testament Column */}
        <div className="theme-column nt-column">
          <div className="column-header">
            <h3>New Testament</h3>
            <span className="passage-count">{ntPassages.length} passages</span>
          </div>
          <div className="passages-list">
            {ntPassages.length === 0 ? (
              <p className="no-passages">No NT passages added yet</p>
            ) : (
              ntPassages.map((passage, index) => (
                <div key={index} className="passage-card">
                  <div className="passage-header">
                    <h4
                      className="passage-ref"
                      onClick={() => onPassageClick?.(passage.ref)}
                      role="button"
                      tabIndex={0}
                    >
                      {passage.ref}
                    </h4>
                  </div>
                  {passage.text && (
                    <p className="passage-text">"{passage.text}"</p>
                  )}
                  {passage.notes && (
                    <div className="passage-notes">
                      <strong>Note:</strong> {passage.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {themeNotes?.connections && themeNotes.connections.length > 0 && (
        <div className="theme-connections">
          <h3>Key Connections</h3>
          <ul>
            {themeNotes.connections.map((connection, index) => (
              <li key={index}>{connection}</li>
            ))}
          </ul>
        </div>
      )}

      {themeNotes?.keyInsights && themeNotes.keyInsights.length > 0 && (
        <div className="theme-insights">
          <h3>Key Insights</h3>
          <ul>
            {themeNotes.keyInsights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThemeComparisonViewer;
