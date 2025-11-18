import React, { useState } from 'react';
import { useVerseOfDay } from '../contexts/VerseOfDayContext';
import './SettingsPage.css';

function SettingsPage() {
  const { settings, updateSettings, getAnalytics, history } = useVerseOfDay();
  const [copied, setCopied] = useState(false);
  const [widgetOptions, setWidgetOptions] = useState({
    compact: false,
    showLink: true
  });

  const analytics = getAnalytics();

  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  const generateWidgetCode = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();

    if (widgetOptions.compact) params.append('compact', 'true');
    if (!widgetOptions.showLink) params.append('showLink', 'false');

    const queryString = params.toString();
    const widgetUrl = `${baseUrl}/widget.html${queryString ? '?' + queryString : ''}`;

    const iframeCode = `<!-- Teen Sunday School - Verse of the Day Widget -->
<iframe
  src="${widgetUrl}"
  width="100%"
  height="${widgetOptions.compact ? '200' : '280'}"
  frameborder="0"
  style="border: none; max-width: 600px;"
  title="Verse of the Day">
</iframe>`;

    const scriptCode = `<!-- Teen Sunday School - Verse of the Day Widget -->
<div id="votd-widget"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${widgetUrl}';
    iframe.width = '100%';
    iframe.height = '${widgetOptions.compact ? '200' : '280'}';
    iframe.frameBorder = '0';
    iframe.style.border = 'none';
    iframe.style.maxWidth = '600px';
    iframe.title = 'Verse of the Day';
    document.getElementById('votd-widget').appendChild(iframe);
  })();
</script>`;

    return { iframeCode, scriptCode, widgetUrl };
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { iframeCode, scriptCode, widgetUrl } = generateWidgetCode();

  return (
    <div className="settings-page">
      <div className="settings-container">
        <header className="settings-header">
          <h1>Settings</h1>
          <p>Configure your Verse of the Day preferences and generate embeddable widgets</p>
        </header>

        {/* Verse of the Day Settings */}
        <section className="settings-section">
          <h2>Verse of the Day Preferences</h2>

          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="auto-display">Auto-display on Home Page</label>
              <p className="setting-description">
                Automatically show the verse of the day when you visit the home page
              </p>
            </div>
            <div className="setting-control">
              <label className="toggle">
                <input
                  type="checkbox"
                  id="auto-display"
                  checked={settings.autoDisplay}
                  onChange={(e) => handleSettingChange('autoDisplay', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="notifications">Notifications</label>
              <p className="setting-description">
                Receive daily notifications for the verse of the day (browser must support notifications)
              </p>
            </div>
            <div className="setting-control">
              <label className="toggle">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="translation">Bible Translation</label>
              <p className="setting-description">
                Choose your preferred Bible translation for daily verses
              </p>
            </div>
            <div className="setting-control">
              <select
                id="translation"
                value={settings.translation}
                onChange={(e) => handleSettingChange('translation', e.target.value)}
                className="setting-select"
              >
                <option value="NIV">NIV (New International Version)</option>
                <option value="KJV">KJV (King James Version)</option>
                <option value="ESV">ESV (English Standard Version)</option>
                <option value="NKJV">NKJV (New King James Version)</option>
                <option value="NLT">NLT (New Living Translation)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Analytics */}
        <section className="settings-section">
          <h2>Your Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{analytics.currentStreak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📖</div>
              <div className="stat-value">{analytics.todayViewCount}</div>
              <div className="stat-label">Views Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value">{analytics.totalHistoryDays}</div>
              <div className="stat-label">Total Days</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">{analytics.isViewedToday ? '✓' : '○'}</div>
              <div className="stat-value">{analytics.isViewedToday ? 'Yes' : 'Not Yet'}</div>
              <div className="stat-label">Viewed Today</div>
            </div>
          </div>
        </section>

        {/* Widget Generator */}
        <section className="settings-section">
          <h2>Embeddable Widget Generator</h2>
          <p className="section-description">
            Generate code to embed the Verse of the Day widget on your website or blog
          </p>

          <div className="widget-options">
            <h3>Widget Options</h3>

            <div className="widget-option">
              <label>
                <input
                  type="checkbox"
                  checked={widgetOptions.compact}
                  onChange={(e) => setWidgetOptions({ ...widgetOptions, compact: e.target.checked })}
                />
                <span>Compact mode (smaller size)</span>
              </label>
            </div>

            <div className="widget-option">
              <label>
                <input
                  type="checkbox"
                  checked={widgetOptions.showLink}
                  onChange={(e) => setWidgetOptions({ ...widgetOptions, showLink: e.target.checked })}
                />
                <span>Show link to Teen Sunday School</span>
              </label>
            </div>
          </div>

          {/* Widget Preview */}
          <div className="widget-preview">
            <h3>Preview</h3>
            <div className="preview-container">
              <iframe
                src={widgetUrl}
                width="100%"
                height={widgetOptions.compact ? '200' : '280'}
                frameBorder="0"
                style={{ border: 'none', maxWidth: '600px' }}
                title="Verse of the Day Preview"
              />
            </div>
          </div>

          {/* Generated Code */}
          <div className="widget-code">
            <h3>Embed Code (iframe)</h3>
            <p className="code-description">
              Copy and paste this code into your website's HTML
            </p>
            <div className="code-block">
              <pre><code>{iframeCode}</code></pre>
              <button
                className="copy-btn"
                onClick={() => copyCode(iframeCode)}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="widget-code">
            <h3>Embed Code (JavaScript)</h3>
            <p className="code-description">
              Alternative method using JavaScript to dynamically insert the widget
            </p>
            <div className="code-block">
              <pre><code>{scriptCode}</code></pre>
              <button
                className="copy-btn"
                onClick={() => copyCode(scriptCode)}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="widget-code">
            <h3>Direct Link</h3>
            <p className="code-description">
              Use this URL to link directly to the widget or open it in a new window
            </p>
            <div className="code-block">
              <pre><code>{widgetUrl}</code></pre>
              <button
                className="copy-btn"
                onClick={() => copyCode(widgetUrl)}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
        </section>

        {/* Verse History */}
        {history.length > 0 && (
          <section className="settings-section">
            <h2>Recent Verses</h2>
            <div className="verse-history">
              {history.slice(0, 7).map((verse, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {new Date(verse.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="history-content">
                    <div className="history-reference">{verse.reference}</div>
                    <div className="history-text">"{verse.text.substring(0, 100)}..."</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
