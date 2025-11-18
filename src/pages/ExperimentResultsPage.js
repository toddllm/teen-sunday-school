import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useABTest } from '../contexts/ABTestContext';
import './ExperimentResultsPage.css';

const ExperimentResultsPage = () => {
  const { experimentId } = useParams();
  const navigate = useNavigate();
  const { getExperiment, calculateResults, getExperimentEvents } = useABTest();

  const [experiment, setExperiment] = useState(null);
  const [results, setResults] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    const exp = getExperiment(experimentId);
    if (!exp) {
      navigate('/admin/experiments');
      return;
    }

    setExperiment(exp);
    const calculatedResults = calculateResults(experimentId);
    setResults(calculatedResults);

    const expEvents = getExperimentEvents(experimentId);
    setEvents(expEvents);
  }, [experimentId, getExperiment, calculateResults, getExperimentEvents, navigate]);

  if (!experiment || !results) {
    return <div className="loading">Loading...</div>;
  }

  const getVariantColor = (index) => {
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];
    return colors[index % colors.length];
  };

  const renderOverview = () => (
    <div className="results-overview">
      <div className="experiment-info-card">
        <h2>Experiment Details</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Name:</span>
            <span className="info-value">{experiment.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Description:</span>
            <span className="info-value">{experiment.description || 'No description'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className={`status-badge ${experiment.status}`}>{experiment.status}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Feature Type:</span>
            <span className="info-value">{experiment.featureType}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Target Metric:</span>
            <span className="info-value">{experiment.targetMetric.replace(/_/g, ' ')}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Created:</span>
            <span className="info-value">{new Date(experiment.createdAt).toLocaleString()}</span>
          </div>
          {experiment.startedAt && (
            <div className="info-item">
              <span className="info-label">Started:</span>
              <span className="info-value">{new Date(experiment.startedAt).toLocaleString()}</span>
            </div>
          )}
          {experiment.endedAt && (
            <div className="info-item">
              <span className="info-label">Ended:</span>
              <span className="info-value">{new Date(experiment.endedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="variants-performance">
        <h2>Variant Performance</h2>
        <div className="variants-grid">
          {experiment.variants.map((variant, index) => {
            const variantResults = results[variant.id];
            if (!variantResults) return null;

            return (
              <div key={variant.id} className="variant-card" style={{ borderLeft: `4px solid ${getVariantColor(index)}` }}>
                <div className="variant-header">
                  <h3>{variant.name}</h3>
                  <span className="variant-split">{experiment.audienceSplit[index]}% traffic</span>
                </div>
                {variant.description && (
                  <p className="variant-description">{variant.description}</p>
                )}
                <div className="variant-stats">
                  <div className="stat-item">
                    <div className="stat-value-large">{variantResults.assignments}</div>
                    <div className="stat-label-small">Total Users</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value-large">{variantResults.completions}</div>
                    <div className="stat-label-small">Completions</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value-large">{variantResults.completionRate}%</div>
                    <div className="stat-label-small">Completion Rate</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value-large">{variantResults.totalEvents}</div>
                    <div className="stat-label-small">Total Events</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {results.statistical && (
        <div className="statistical-analysis">
          <h2>Statistical Analysis</h2>
          <div className="analysis-card">
            <div className="analysis-grid">
              <div className="analysis-item">
                <span className="analysis-label">Improvement:</span>
                <span className={`analysis-value ${parseFloat(results.statistical.improvement) > 0 ? 'positive' : 'negative'}`}>
                  {results.statistical.improvement}%
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">Confidence:</span>
                <span className="analysis-value">{results.statistical.confidence}%</span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">P-Value:</span>
                <span className="analysis-value">{results.statistical.pValue}</span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">Z-Score:</span>
                <span className="analysis-value">{results.statistical.zScore}</span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">Statistically Significant:</span>
                <span className={`analysis-value ${results.statistical.isSignificant ? 'significant' : 'not-significant'}`}>
                  {results.statistical.isSignificant ? 'Yes (p < 0.05)' : 'No (p ≥ 0.05)'}
                </span>
              </div>
            </div>
            {results.statistical.isSignificant ? (
              <div className="significance-message success">
                The variant shows statistically significant results! You can confidently implement this change.
              </div>
            ) : (
              <div className="significance-message warning">
                Results are not yet statistically significant. Consider running the experiment longer or increasing sample size.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="comparison-chart">
        <h2>Completion Rate Comparison</h2>
        <div className="bar-chart">
          {experiment.variants.map((variant, index) => {
            const variantResults = results[variant.id];
            if (!variantResults) return null;

            return (
              <div key={variant.id} className="bar-item">
                <div className="bar-label">{variant.name}</div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${variantResults.completionRate}%`,
                      backgroundColor: getVariantColor(index)
                    }}
                  >
                    <span className="bar-value">{variantResults.completionRate}%</span>
                  </div>
                </div>
                <div className="bar-count">{variantResults.completions}/{variantResults.assignments}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderEventLog = () => (
    <div className="event-log">
      <h2>Event Log ({events.length} events)</h2>
      <div className="event-table-container">
        <table className="event-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Event Type</th>
              <th>Variant</th>
              <th>User ID</th>
              <th>Metadata</th>
            </tr>
          </thead>
          <tbody>
            {events.slice().reverse().map((event) => (
              <tr key={event.id}>
                <td>{new Date(event.timestamp).toLocaleString()}</td>
                <td>
                  <span className="event-type-badge">{event.eventType}</span>
                </td>
                <td>{event.variant}</td>
                <td className="user-id">{event.userId.substring(0, 12)}...</td>
                <td className="metadata">
                  {Object.keys(event.metadata).length > 0
                    ? JSON.stringify(event.metadata)
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && (
          <div className="empty-events">
            No events recorded yet. Events will appear here as users interact with the experiment.
          </div>
        )}
      </div>
    </div>
  );

  const renderRawData = () => (
    <div className="raw-data">
      <h2>Raw Data Export</h2>
      <div className="data-section">
        <h3>Experiment Configuration</h3>
        <pre className="code-block">{JSON.stringify(experiment, null, 2)}</pre>
      </div>
      <div className="data-section">
        <h3>Results Summary</h3>
        <pre className="code-block">{JSON.stringify(results, null, 2)}</pre>
      </div>
      <div className="data-section">
        <h3>All Events ({events.length})</h3>
        <pre className="code-block">{JSON.stringify(events, null, 2)}</pre>
      </div>
    </div>
  );

  return (
    <div className="experiment-results-page">
      <div className="results-header">
        <button className="btn-back" onClick={() => navigate('/admin/experiments')}>
          ← Back to Experiments
        </button>
        <h1>{experiment.name} - Results</h1>
      </div>

      <div className="results-tabs">
        <button
          className={`tab ${selectedView === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedView('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${selectedView === 'events' ? 'active' : ''}`}
          onClick={() => setSelectedView('events')}
        >
          Event Log
        </button>
        <button
          className={`tab ${selectedView === 'raw' ? 'active' : ''}`}
          onClick={() => setSelectedView('raw')}
        >
          Raw Data
        </button>
      </div>

      <div className="results-content">
        {selectedView === 'overview' && renderOverview()}
        {selectedView === 'events' && renderEventLog()}
        {selectedView === 'raw' && renderRawData()}
      </div>
    </div>
  );
};

export default ExperimentResultsPage;
