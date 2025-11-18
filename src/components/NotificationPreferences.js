import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import './NotificationPreferences.css';

function NotificationPreferences() {
  const {
    preferences,
    loading,
    error,
    updatePreferences,
    resetPreferences,
    sendTestNotification,
  } = useNotification();

  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState('email');

  // Initialize form data when preferences load
  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');

    try {
      await updatePreferences(formData);
      setSaveMessage('Preferences saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all notification preferences to defaults?')) {
      setSaving(true);
      try {
        await resetPreferences();
        setSaveMessage('Preferences reset to defaults successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (error) {
        setSaveMessage('Failed to reset preferences. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      setSaveMessage('Test notification sent! Check your email and notifications.');
      setTimeout(() => setSaveMessage(''), 5000);
    } catch (error) {
      setSaveMessage('Failed to send test notification.');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  if (loading || !formData) {
    return (
      <div className="notification-preferences">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading notification preferences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notification-preferences">
        <div className="error-container">
          <p className="error-message">Error loading preferences: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-preferences">
      <div className="preferences-header">
        <h1>Notification Preferences</h1>
        <p>Manage how and when you receive notifications</p>
      </div>

      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('Failed') ? 'error' : 'success'}`}>
          {saveMessage}
        </div>
      )}

      <div className="preferences-tabs">
        <button
          className={`tab ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          📧 Email
        </button>
        <button
          className={`tab ${activeTab === 'in-app' ? 'active' : ''}`}
          onClick={() => setActiveTab('in-app')}
        >
          🔔 In-App
        </button>
        <button
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          ⏰ Schedule
        </button>
        <button
          className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          ⚙️ Advanced
        </button>
      </div>

      <div className="preferences-content">
        {/* EMAIL TAB */}
        {activeTab === 'email' && (
          <div className="tab-content">
            <h2>Email Notifications</h2>

            <div className="preference-group">
              <div className="preference-item">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.emailEnabled}
                    onChange={(e) => handleChange('emailEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="label-text">Enable email notifications</span>
                </label>
              </div>

              {formData.emailEnabled && (
                <>
                  <div className="preference-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={formData.emailLessonReminders}
                        onChange={(e) => handleChange('emailLessonReminders', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="label-text">Lesson reminders</span>
                    </label>
                    <p className="helper-text">Get reminded about upcoming lessons</p>
                  </div>

                  <div className="preference-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={formData.emailEventReminders}
                        onChange={(e) => handleChange('emailEventReminders', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="label-text">Event reminders</span>
                    </label>
                    <p className="helper-text">Get reminded about upcoming events</p>
                  </div>

                  <div className="preference-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={formData.emailAnnouncements}
                        onChange={(e) => handleChange('emailAnnouncements', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="label-text">Announcements</span>
                    </label>
                    <p className="helper-text">Receive important announcements</p>
                  </div>

                  <div className="preference-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={formData.emailGroupUpdates}
                        onChange={(e) => handleChange('emailGroupUpdates', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="label-text">Group updates</span>
                    </label>
                    <p className="helper-text">Updates about your groups and activities</p>
                  </div>

                  <div className="divider"></div>

                  <div className="preference-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={formData.emailDigest}
                        onChange={(e) => handleChange('emailDigest', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="label-text">Email digest</span>
                    </label>
                    <p className="helper-text">Receive notifications as a single digest email</p>
                  </div>

                  {formData.emailDigest && (
                    <div className="preference-item">
                      <label className="select-label">
                        Digest frequency:
                        <select
                          value={formData.emailDigestFrequency}
                          onChange={(e) => handleChange('emailDigestFrequency', e.target.value)}
                        >
                          <option value="DAILY">Daily</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="BIWEEKLY">Bi-weekly</option>
                          <option value="MONTHLY">Monthly</option>
                        </select>
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* IN-APP TAB */}
        {activeTab === 'in-app' && (
          <div className="tab-content">
            <h2>In-App Notifications</h2>

            <div className="preference-group">
              <div className="preference-item">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.inAppEnabled}
                    onChange={(e) => handleChange('inAppEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="label-text">Enable in-app notifications</span>
                </label>
              </div>

              {formData.inAppEnabled && (
                <>
                  <div className="preference-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={formData.inAppLessonReminders}
                        onChange={(e) => handleChange('inAppLessonReminders', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="label-text">Lesson reminders</span>
                    </label>
                  </div>

                  <div className="preference-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={formData.inAppEventReminders}
                        onChange={(e) => handleChange('inAppEventReminders', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="label-text">Event reminders</span>
                    </label>
                  </div>

                  <div className="preference-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={formData.inAppAnnouncements}
                        onChange={(e) => handleChange('inAppAnnouncements', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="label-text">Announcements</span>
                    </label>
                  </div>

                  <div className="preference-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={formData.inAppGroupUpdates}
                        onChange={(e) => handleChange('inAppGroupUpdates', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="label-text">Group updates</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div className="tab-content">
            <h2>Notification Schedule</h2>

            <div className="preference-group">
              <h3>Quiet Hours</h3>
              <p className="section-description">
                Prevent notifications during specific hours (except urgent ones)
              </p>

              <div className="preference-item">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.quietHoursEnabled}
                    onChange={(e) => handleChange('quietHoursEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="label-text">Enable quiet hours</span>
                </label>
              </div>

              {formData.quietHoursEnabled && (
                <>
                  <div className="preference-item time-inputs">
                    <label className="input-label">
                      Start time:
                      <input
                        type="time"
                        value={formData.quietHoursStart || '22:00'}
                        onChange={(e) => handleChange('quietHoursStart', e.target.value)}
                      />
                    </label>
                    <label className="input-label">
                      End time:
                      <input
                        type="time"
                        value={formData.quietHoursEnd || '08:00'}
                        onChange={(e) => handleChange('quietHoursEnd', e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="preference-item">
                    <label className="select-label">
                      Timezone:
                      <select
                        value={formData.quietHoursTimezone}
                        onChange={(e) => handleChange('quietHoursTimezone', e.target.value)}
                      >
                        <option value="America/New_York">Eastern (ET)</option>
                        <option value="America/Chicago">Central (CT)</option>
                        <option value="America/Denver">Mountain (MT)</option>
                        <option value="America/Los_Angeles">Pacific (PT)</option>
                        <option value="America/Phoenix">Arizona (MST)</option>
                        <option value="America/Anchorage">Alaska (AKT)</option>
                        <option value="Pacific/Honolulu">Hawaii (HST)</option>
                      </select>
                    </label>
                  </div>
                </>
              )}

              <div className="divider"></div>

              <h3>Notification Timing</h3>

              <div className="preference-item">
                <label className="input-label">
                  Lesson reminder (days before):
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={formData.lessonReminderDays}
                    onChange={(e) => handleChange('lessonReminderDays', parseInt(e.target.value))}
                  />
                </label>
                <p className="helper-text">How many days before a lesson to send a reminder</p>
              </div>

              <div className="preference-item">
                <label className="input-label">
                  Lesson reminder time:
                  <input
                    type="time"
                    value={formData.lessonReminderTime}
                    onChange={(e) => handleChange('lessonReminderTime', e.target.value)}
                  />
                </label>
                <p className="helper-text">What time of day to send lesson reminders</p>
              </div>

              <div className="preference-item">
                <label className="input-label">
                  Event reminder (hours before):
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={formData.eventReminderHours}
                    onChange={(e) => handleChange('eventReminderHours', parseInt(e.target.value))}
                  />
                </label>
                <p className="helper-text">How many hours before an event to send a reminder</p>
              </div>
            </div>
          </div>
        )}

        {/* ADVANCED TAB */}
        {activeTab === 'advanced' && (
          <div className="tab-content">
            <h2>Advanced Settings</h2>

            <div className="preference-group">
              <h3>Notification Limits</h3>

              <div className="preference-item">
                <label className="input-label">
                  Maximum notifications per day:
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.maxNotificationsPerDay}
                    onChange={(e) => handleChange('maxNotificationsPerDay', parseInt(e.target.value))}
                  />
                </label>
                <p className="helper-text">Set to 0 for unlimited (urgent notifications always go through)</p>
              </div>

              <div className="preference-item">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.batchNotifications}
                    onChange={(e) => handleChange('batchNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="label-text">Batch notifications</span>
                </label>
                <p className="helper-text">Group multiple notifications together when possible</p>
              </div>

              <div className="divider"></div>

              <h3>Testing & Management</h3>

              <div className="preference-item">
                <button className="test-button" onClick={handleTestNotification}>
                  Send Test Notification
                </button>
                <p className="helper-text">Send a test notification to verify your settings</p>
              </div>

              <div className="preference-item">
                <button className="reset-button" onClick={handleReset}>
                  Reset to Defaults
                </button>
                <p className="helper-text">Reset all notification preferences to default values</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="preferences-footer">
        <button
          className="save-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

export default NotificationPreferences;
