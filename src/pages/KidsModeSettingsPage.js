import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKidsMode } from '../contexts/KidsModeContext';
import './KidsModeSettingsPage.css';

const KidsModeSettingsPage = () => {
  const navigate = useNavigate();
  const {
    kidsMode,
    hasPinSetup,
    enableKidsMode,
    disableKidsMode,
    setupPin,
    verifyPin,
    resetPin,
    analytics
  } = useKidsMode();

  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPinVerify, setShowPinVerify] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const handleSetupPin = () => {
    setShowPinSetup(true);
    setNewPin('');
    setConfirmPin('');
    setPinError('');
  };

  const handleSavePin = () => {
    if (!newPin || newPin.length < 4) {
      setPinError('PIN must be at least 4 characters');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }

    const success = setupPin(newPin);
    if (success) {
      setShowPinSetup(false);
      setNewPin('');
      setConfirmPin('');
      setPinError('');
      alert('PIN setup successful! 🎉');
    } else {
      setPinError('Failed to setup PIN');
    }
  };

  const handleCancelPinSetup = () => {
    setShowPinSetup(false);
    setNewPin('');
    setConfirmPin('');
    setPinError('');
  };

  const handleEnableKidsMode = () => {
    if (!hasPinSetup) {
      alert('Please setup a PIN first to enable Kids Mode');
      setShowPinSetup(true);
      return;
    }
    enableKidsMode();
    navigate('/kids');
  };

  const handleDisableKidsMode = () => {
    setShowPinVerify(true);
    setPinInput('');
    setVerifyError('');
  };

  const handleVerifyAndDisable = () => {
    if (verifyPin(pinInput)) {
      disableKidsMode();
      setShowPinVerify(false);
      setPinInput('');
      setVerifyError('');
      alert('Kids Mode disabled');
    } else {
      setVerifyError('Incorrect PIN');
      setPinInput('');
    }
  };

  const handleResetPin = () => {
    if (window.confirm('Are you sure you want to reset your PIN? You will need to set it up again.')) {
      resetPin();
      alert('PIN has been reset');
    }
  };

  return (
    <div className="kids-mode-settings-page">
      <div className="settings-header">
        <button className="back-button" onClick={() => navigate('/settings')}>
          <span className="back-icon">←</span> Settings
        </button>
        <h1 className="settings-title">
          <span className="title-icon">🧒</span>
          Kids Mode Settings
        </h1>
        <p className="settings-subtitle">Configure safe browsing for children</p>
      </div>

      {/* Current Status */}
      <div className="status-card">
        <div className="status-icon">
          {kidsMode ? '✅' : '⭕'}
        </div>
        <div className="status-content">
          <h3 className="status-title">Kids Mode Status</h3>
          <p className="status-text">
            {kidsMode ? 'Currently Active' : 'Currently Inactive'}
          </p>
        </div>
        <div className="status-action">
          {kidsMode ? (
            <button className="btn btn-danger" onClick={handleDisableKidsMode}>
              Disable
            </button>
          ) : (
            <button className="btn btn-success" onClick={handleEnableKidsMode}>
              Enable
            </button>
          )}
        </div>
      </div>

      {/* PIN Setup Status */}
      <div className="settings-section">
        <h2 className="section-title">
          <span className="section-icon">🔐</span>
          Parental PIN
        </h2>
        <div className="pin-status-card">
          <div className="pin-status-content">
            <p className="pin-status-text">
              {hasPinSetup ? (
                <>
                  <span className="status-badge badge-success">✓ PIN is set</span>
                  <span className="pin-status-description">
                    Your PIN is required to exit Kids Mode
                  </span>
                </>
              ) : (
                <>
                  <span className="status-badge badge-warning">⚠ No PIN set</span>
                  <span className="pin-status-description">
                    Setup a PIN to protect Kids Mode settings
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="pin-status-actions">
            {!showPinSetup && (
              <button className="btn btn-primary" onClick={handleSetupPin}>
                {hasPinSetup ? 'Change PIN' : 'Setup PIN'}
              </button>
            )}
            {hasPinSetup && !showPinSetup && (
              <button className="btn btn-secondary" onClick={handleResetPin}>
                Reset PIN
              </button>
            )}
          </div>
        </div>

        {/* PIN Setup Form */}
        {showPinSetup && (
          <div className="pin-setup-form">
            <h3 className="form-title">Setup New PIN</h3>
            <div className="form-group">
              <label className="form-label">New PIN (4+ characters)</label>
              <input
                type="password"
                className="form-input"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter PIN"
                maxLength={8}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm PIN</label>
              <input
                type="password"
                className="form-input"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Re-enter PIN"
                maxLength={8}
              />
            </div>
            {pinError && <div className="error-message">{pinError}</div>}
            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleSavePin}>
                Save PIN
              </button>
              <button className="btn btn-secondary" onClick={handleCancelPinSetup}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PIN Verification Modal */}
      {showPinVerify && (
        <div className="modal-overlay" onClick={() => setShowPinVerify(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Enter PIN to Disable Kids Mode</h3>
            <div className="form-group">
              <input
                type="password"
                className="form-input"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN"
                maxLength={8}
                autoFocus
              />
            </div>
            {verifyError && <div className="error-message">{verifyError}</div>}
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleVerifyAndDisable}>
                Confirm
              </button>
              <button className="btn btn-secondary" onClick={() => setShowPinVerify(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      <div className="settings-section">
        <h2 className="section-title">
          <span className="section-icon">📊</span>
          Usage Analytics
        </h2>
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-icon">⏱️</div>
            <div className="analytics-value">{analytics.formattedUsageTime}</div>
            <div className="analytics-label">Total Time</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-icon">📚</div>
            <div className="analytics-value">{analytics.uniqueStoriesCompleted}</div>
            <div className="analytics-label">Stories Completed</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-icon">🎯</div>
            <div className="analytics-value">{analytics.sessionsCount}</div>
            <div className="analytics-label">Sessions</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-icon">📅</div>
            <div className="analytics-value">
              {analytics.lastSessionDate
                ? new Date(analytics.lastSessionDate).toLocaleDateString()
                : 'Never'}
            </div>
            <div className="analytics-label">Last Session</div>
          </div>
        </div>
      </div>

      {/* Safety Features Info */}
      <div className="settings-section">
        <h2 className="section-title">
          <span className="section-icon">🛡️</span>
          Safety Features
        </h2>
        <div className="features-list">
          <div className="feature-item">
            <span className="feature-icon">✓</span>
            <div className="feature-content">
              <h4 className="feature-title">Age-Appropriate Content</h4>
              <p className="feature-description">
                Only curated Bible stories suitable for children
              </p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✓</span>
            <div className="feature-content">
              <h4 className="feature-title">Simplified Interface</h4>
              <p className="feature-description">
                Large buttons and easy navigation designed for kids
              </p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✓</span>
            <div className="feature-content">
              <h4 className="feature-title">No External Links</h4>
              <p className="feature-description">
                All content is self-contained with no external navigation
              </p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✓</span>
            <div className="feature-content">
              <h4 className="feature-title">PIN Protection</h4>
              <p className="feature-description">
                Parental PIN required to exit Kids Mode
              </p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✓</span>
            <div className="feature-content">
              <h4 className="feature-title">Audio Narration</h4>
              <p className="feature-description">
                Stories can be read aloud for early readers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <div className="info-icon">ℹ️</div>
        <div className="info-content">
          <h4 className="info-title">About Kids Mode</h4>
          <p className="info-text">
            Kids Mode provides a safe, simplified experience for children to explore Bible
            stories. When enabled, children can only access age-appropriate content with a
            fun, engaging interface. Parents need to enter their PIN to exit Kids Mode.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KidsModeSettingsPage;
