import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AIFiltersAdminPage.css';

const AIFiltersAdminPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filter configuration state
  const [config, setConfig] = useState(null);
  const [filterRules, setFilterRules] = useState({});
  const [customRedirectMessage, setCustomRedirectMessage] = useState('');
  const [customKeywords, setCustomKeywords] = useState({ block: [], monitor: [] });
  const [isActive, setIsActive] = useState(true);

  // Metrics state
  const [metrics, setMetrics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedTab, setSelectedTab] = useState('settings'); // 'settings' or 'metrics'

  // Available categories and actions
  const [categories, setCategories] = useState([]);
  const [actions, setActions] = useState([]);

  useEffect(() => {
    loadFilterConfig();
    loadCategories();
    loadMetrics();
  }, []);

  const loadFilterConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ai-filters', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load filter configuration');

      const data = await response.json();
      setConfig(data);
      setFilterRules(data.filterRules || {});
      setCustomRedirectMessage(data.redirectMessage || '');
      setCustomKeywords(data.customKeywords || { block: [], monitor: [] });
      setIsActive(data.isActive);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/ai-filters/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load categories');

      const data = await response.json();
      setCategories(data.categories);
      setActions(data.actions);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadMetrics = async () => {
    try {
      const [metricsResponse, summaryResponse] = await Promise.all([
        fetch('/api/admin/ai-filters/metrics?limit=50', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('/api/admin/ai-filters/metrics/summary?days=30', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.metrics || []);
      }

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
      }
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/ai-filters', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          filterRules,
          customKeywords,
          redirectMessage: customRedirectMessage,
          isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      const data = await response.json();
      setConfig(data);
      setSuccess('Filter configuration saved successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFilterRuleChange = (category, action) => {
    setFilterRules(prev => ({
      ...prev,
      [category]: action,
    }));
  };

  const addCustomKeyword = (type) => {
    const keyword = prompt(`Enter a keyword to ${type}:`);
    if (keyword && keyword.trim()) {
      setCustomKeywords(prev => ({
        ...prev,
        [type]: [...(prev[type] || []), keyword.trim().toLowerCase()],
      }));
    }
  };

  const removeCustomKeyword = (type, index) => {
    setCustomKeywords(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const getCategoryLabel = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'REDIRECT': return '#ff9800';
      case 'GUIDANCE': return '#2196f3';
      case 'BLOCK': return '#f44336';
      case 'MONITOR': return '#4caf50';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <div className="ai-filters-admin-page">
        <div className="loading">Loading filter configuration...</div>
      </div>
    );
  }

  return (
    <div className="ai-filters-admin-page">
      <div className="page-header">
        <button onClick={() => navigate('/admin')} className="back-button">
          ← Back to Admin
        </button>
        <h1>AI Content Filters</h1>
        <p>Configure safe-mode filters for AI-powered features</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className="tabs">
        <button
          className={selectedTab === 'settings' ? 'active' : ''}
          onClick={() => setSelectedTab('settings')}
        >
          Filter Settings
        </button>
        <button
          className={selectedTab === 'metrics' ? 'active' : ''}
          onClick={() => setSelectedTab('metrics')}
        >
          Metrics & Reports
        </button>
      </div>

      {selectedTab === 'settings' && (
        <div className="settings-tab">
          <div className="filter-status-card">
            <h2>Filter Status</h2>
            <div className="status-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span>Content filters are {isActive ? 'enabled' : 'disabled'}</span>
              </label>
              <p className="help-text">
                When enabled, AI features will filter sensitive topics according to the rules below.
              </p>
            </div>
          </div>

          <div className="filter-rules-card">
            <h2>Filter Rules</h2>
            <p className="help-text">
              Choose how AI should handle each category of sensitive content:
            </p>

            <div className="filter-rules-grid">
              {categories.map(category => (
                <div key={category.value} className="filter-rule-item">
                  <div className="category-name">{category.label}</div>
                  <select
                    value={filterRules[category.value] || 'REDIRECT'}
                    onChange={(e) => handleFilterRuleChange(category.value, e.target.value)}
                    className="action-select"
                    style={{
                      borderColor: getActionColor(filterRules[category.value] || 'REDIRECT')
                    }}
                  >
                    {actions.map(action => (
                      <option key={action.value} value={action.value}>
                        {action.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="action-legend">
              <h3>What each action does:</h3>
              {actions.map(action => (
                <div key={action.value} className="legend-item">
                  <span
                    className="legend-color"
                    style={{ backgroundColor: getActionColor(action.value) }}
                  />
                  <strong>{action.label}:</strong> {action.description}
                </div>
              ))}
            </div>
          </div>

          <div className="redirect-message-card">
            <h2>Custom Redirect Message</h2>
            <p className="help-text">
              This message is shown when the "Redirect to leader" action is triggered:
            </p>
            <textarea
              value={customRedirectMessage}
              onChange={(e) => setCustomRedirectMessage(e.target.value)}
              placeholder="Enter a custom message encouraging teens to speak with a leader..."
              rows={4}
              className="redirect-message-input"
            />
          </div>

          <div className="custom-keywords-card">
            <h2>Custom Keywords</h2>
            <p className="help-text">
              Add custom keywords to block or monitor in addition to built-in filters:
            </p>

            <div className="keywords-section">
              <div className="keyword-list">
                <h3>
                  Block Keywords
                  <button onClick={() => addCustomKeyword('block')} className="add-keyword-btn">
                    + Add
                  </button>
                </h3>
                <div className="keyword-tags">
                  {(customKeywords.block || []).map((keyword, index) => (
                    <span key={index} className="keyword-tag block">
                      {keyword}
                      <button onClick={() => removeCustomKeyword('block', index)}>×</button>
                    </span>
                  ))}
                  {customKeywords.block?.length === 0 && (
                    <p className="empty-state">No custom block keywords added</p>
                  )}
                </div>
              </div>

              <div className="keyword-list">
                <h3>
                  Monitor Keywords
                  <button onClick={() => addCustomKeyword('monitor')} className="add-keyword-btn">
                    + Add
                  </button>
                </h3>
                <div className="keyword-tags">
                  {(customKeywords.monitor || []).map((keyword, index) => (
                    <span key={index} className="keyword-tag monitor">
                      {keyword}
                      <button onClick={() => removeCustomKeyword('monitor', index)}>×</button>
                    </span>
                  ))}
                  {customKeywords.monitor?.length === 0 && (
                    <p className="empty-state">No custom monitor keywords added</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="save-section">
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="save-button"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}

      {selectedTab === 'metrics' && (
        <div className="metrics-tab">
          {summary && (
            <div className="metrics-summary">
              <h2>Summary (Last 30 Days)</h2>
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-value">
                    {summary.byAction?.reduce((sum, item) => sum + item.count, 0) || 0}
                  </div>
                  <div className="summary-label">Total Filtered Queries</div>
                </div>

                <div className="summary-card">
                  <div className="summary-value">
                    {summary.leaderFollowUp?.pendingResponse || 0}
                  </div>
                  <div className="summary-label">Pending Leader Follow-up</div>
                </div>

                <div className="summary-card">
                  <div className="summary-value">
                    {summary.leaderFollowUp?.withResponse || 0}
                  </div>
                  <div className="summary-label">Resolved by Leaders</div>
                </div>
              </div>

              <div className="charts-grid">
                <div className="chart-card">
                  <h3>By Category</h3>
                  <div className="chart-bars">
                    {summary.byCategory?.map(item => (
                      <div key={item.category} className="bar-item">
                        <span className="bar-label">{getCategoryLabel(item.category)}</span>
                        <div className="bar-container">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${(item.count / summary.byCategory[0]?.count) * 100}%`
                            }}
                          />
                          <span className="bar-value">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-card">
                  <h3>By Action</h3>
                  <div className="chart-bars">
                    {summary.byAction?.map(item => (
                      <div key={item.action} className="bar-item">
                        <span className="bar-label">{getCategoryLabel(item.action)}</span>
                        <div className="bar-container">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${(item.count / summary.byAction[0]?.count) * 100}%`,
                              backgroundColor: getActionColor(item.action)
                            }}
                          />
                          <span className="bar-value">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="metrics-list">
            <h2>Recent Filtered Queries</h2>
            {metrics.length === 0 ? (
              <p className="empty-state">No filtered queries yet</p>
            ) : (
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Action</th>
                    <th>Query Preview</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map(metric => (
                    <tr key={metric.id}>
                      <td>{new Date(metric.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className="category-badge">
                          {getCategoryLabel(metric.detectedCategory)}
                        </span>
                      </td>
                      <td>
                        <span
                          className="action-badge"
                          style={{ backgroundColor: getActionColor(metric.actionTaken) }}
                        >
                          {metric.actionTaken}
                        </span>
                      </td>
                      <td className="query-preview">
                        {metric.query.substring(0, 100)}
                        {metric.query.length > 100 ? '...' : ''}
                      </td>
                      <td>
                        {metric.resolvedAt ? (
                          <span className="status-resolved">✓ Resolved</span>
                        ) : metric.leaderNotified ? (
                          <span className="status-notified">Leader Notified</span>
                        ) : (
                          <span className="status-pending">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIFiltersAdminPage;
