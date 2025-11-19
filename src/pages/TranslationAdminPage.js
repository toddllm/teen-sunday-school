import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/TranslationContext';
import './TranslationAdminPage.css';

// Common regions/countries
const REGIONS = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IN', name: 'India' },
  { code: 'SG', name: 'Singapore' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'PH', name: 'Philippines' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'EU', name: 'European Union' },
  { code: 'LATAM', name: 'Latin America' },
  { code: 'ASIA', name: 'Asia Pacific' }
];

const TranslationAdminPage = () => {
  const navigate = useNavigate();
  const {
    translationConfigs,
    updateTranslationConfig,
    toggleTranslationEnabled,
    resetTranslationConfigs,
    translationUsage
  } = useTranslation();

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    allowedRegions: [],
    licenseNotes: ''
  });
  const [message, setMessage] = useState('');
  const [filterEnabled, setFilterEnabled] = useState('all'); // 'all', 'enabled', 'disabled'

  // Filter translations based on enabled status
  const filteredTranslations = translationConfigs.filter(config => {
    if (filterEnabled === 'enabled') return config.isEnabled;
    if (filterEnabled === 'disabled') return !config.isEnabled;
    return true;
  });

  const handleToggleEnabled = (translationId) => {
    toggleTranslationEnabled(translationId);
    showMessage('✅ Translation status updated');
  };

  const handleEditClick = (config) => {
    setEditingId(config.id);
    setEditForm({
      allowedRegions: config.allowedRegions || [],
      licenseNotes: config.licenseNotes || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      allowedRegions: [],
      licenseNotes: ''
    });
  };

  const handleSaveEdit = (translationId) => {
    updateTranslationConfig(translationId, editForm);
    setEditingId(null);
    showMessage('✅ Configuration saved successfully');
  };

  const handleRegionToggle = (regionCode) => {
    setEditForm(prev => {
      const regions = prev.allowedRegions || [];
      if (regions.includes(regionCode)) {
        return {
          ...prev,
          allowedRegions: regions.filter(r => r !== regionCode)
        };
      } else {
        return {
          ...prev,
          allowedRegions: [...regions, regionCode]
        };
      }
    });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all translation configurations to defaults? This will enable all translations globally.')) {
      resetTranslationConfigs();
      showMessage('✅ All configurations reset to defaults');
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const getUsageCount = (translationId) => {
    return translationUsage[translationId] || 0;
  };

  const getTotalUsage = () => {
    return Object.values(translationUsage).reduce((sum, count) => sum + count, 0);
  };

  const getRegionDisplay = (allowedRegions) => {
    if (!allowedRegions || allowedRegions.length === 0) {
      return 'Global (All Regions)';
    }
    return allowedRegions.map(code => {
      const region = REGIONS.find(r => r.code === code);
      return region ? region.name : code;
    }).join(', ');
  };

  const renderEditForm = (config) => {
    return (
      <tr key={config.id} className="edit-row">
        <td colSpan="6">
          <div className="edit-form">
            <h3>Edit Configuration: {config.name} ({config.code})</h3>

            <div className="form-section">
              <label>Region Restrictions</label>
              <p className="form-hint">
                Leave empty for global availability. Select specific regions to restrict access.
              </p>
              <div className="region-grid">
                {REGIONS.map(region => (
                  <label key={region.code} className="region-checkbox">
                    <input
                      type="checkbox"
                      checked={editForm.allowedRegions.includes(region.code)}
                      onChange={() => handleRegionToggle(region.code)}
                    />
                    <span>{region.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label htmlFor="licenseNotes">License Notes</label>
              <textarea
                id="licenseNotes"
                value={editForm.licenseNotes}
                onChange={(e) => setEditForm({ ...editForm, licenseNotes: e.target.value })}
                placeholder="Add any license restrictions or notes..."
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button onClick={() => handleSaveEdit(config.id)} className="save-btn">
                Save Configuration
              </button>
              <button onClick={handleCancelEdit} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="translation-admin-page">
      <div className="admin-header">
        <h1>Translation Management</h1>
        <div className="header-buttons">
          <button onClick={() => navigate('/admin')} className="back-btn">
            Back to Admin
          </button>
          <button onClick={handleReset} className="reset-btn">
            Reset All to Defaults
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="stats-section">
        <div className="stat-card">
          <h3>Total Translations</h3>
          <div className="stat-value">{translationConfigs.length}</div>
        </div>
        <div className="stat-card">
          <h3>Enabled</h3>
          <div className="stat-value">
            {translationConfigs.filter(t => t.isEnabled).length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Disabled</h3>
          <div className="stat-value">
            {translationConfigs.filter(t => !t.isEnabled).length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Total Usage</h3>
          <div className="stat-value">{getTotalUsage()}</div>
        </div>
      </div>

      <div className="filter-section">
        <label>Filter by Status:</label>
        <select value={filterEnabled} onChange={(e) => setFilterEnabled(e.target.value)}>
          <option value="all">All Translations</option>
          <option value="enabled">Enabled Only</option>
          <option value="disabled">Disabled Only</option>
        </select>
      </div>

      <div className="translations-table-container">
        <table className="translations-table">
          <thead>
            <tr>
              <th>Translation</th>
              <th>Code</th>
              <th>Status</th>
              <th>Regions</th>
              <th>Usage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTranslations.map(config => (
              <React.Fragment key={config.id}>
                <tr className={!config.isEnabled ? 'disabled-row' : ''}>
                  <td>
                    <div className="translation-name">
                      {config.name}
                      <span className="language">{config.language}</span>
                    </div>
                  </td>
                  <td>
                    <span className="translation-code">{config.code}</span>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={config.isEnabled}
                        onChange={() => handleToggleEnabled(config.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={`status-badge ${config.isEnabled ? 'enabled' : 'disabled'}`}>
                      {config.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="regions-display">
                      {getRegionDisplay(config.allowedRegions)}
                    </div>
                  </td>
                  <td>
                    <span className="usage-count">{getUsageCount(config.id)}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleEditClick(config)}
                      className="edit-btn"
                      disabled={editingId !== null}
                    >
                      Configure
                    </button>
                  </td>
                </tr>
                {editingId === config.id && renderEditForm(config)}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {filteredTranslations.length === 0 && (
          <div className="empty-state">
            <p>No translations match the current filter.</p>
          </div>
        )}
      </div>

      <div className="usage-analytics">
        <h2>Translation Usage Analytics</h2>
        <div className="analytics-grid">
          {translationConfigs
            .filter(config => getUsageCount(config.id) > 0)
            .sort((a, b) => getUsageCount(b.id) - getUsageCount(a.id))
            .map(config => (
              <div key={config.id} className="usage-card">
                <div className="usage-header">
                  <span className="usage-name">{config.code}</span>
                  <span className="usage-value">{getUsageCount(config.id)}</span>
                </div>
                <div className="usage-bar">
                  <div
                    className="usage-fill"
                    style={{
                      width: `${(getUsageCount(config.id) / getTotalUsage()) * 100}%`
                    }}
                  ></div>
                </div>
                <div className="usage-percentage">
                  {getTotalUsage() > 0
                    ? ((getUsageCount(config.id) / getTotalUsage()) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>
            ))}
        </div>
        {getTotalUsage() === 0 && (
          <p className="empty-state">No usage data available yet.</p>
        )}
      </div>
    </div>
  );
};

export default TranslationAdminPage;
