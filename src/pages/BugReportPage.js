import React, { useState } from 'react';
import { useBugReports } from '../contexts/BugReportContext';
import sessionDiagnostics from '../services/sessionDiagnosticsService';
import './BugReportPage.css';

const BugReportPage = () => {
  const { submitBugReport } = useBugReports();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'bug',
    severity: 'medium',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    userEmail: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in at least the title and description.');
      return;
    }

    // Submit the bug report
    submitBugReport(formData);

    // Show success message
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        title: '',
        description: '',
        category: 'bug',
        severity: 'medium',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        userEmail: ''
      });
      setSubmitted(false);
    }, 3000);
  };

  const handleExportDiagnostics = () => {
    sessionDiagnostics.exportDiagnostics();
  };

  const diagnosticsPreview = sessionDiagnostics.collectDiagnostics();

  return (
    <div className="bug-report-page">
      <div className="bug-report-header">
        <h1>Report a Bug</h1>
        <p>Help us improve the Teen Sunday School App by reporting issues you encounter.</p>
      </div>

      {submitted ? (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Thank you for your report!</h2>
          <p>Your bug report has been submitted successfully. We'll look into it soon.</p>
        </div>
      ) : (
        <>
          <form className="bug-report-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Bug Information</h2>

              <div className="form-group">
                <label htmlFor="title">
                  Bug Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Brief summary of the issue"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="bug">Bug</option>
                    <option value="feature-request">Feature Request</option>
                    <option value="ui-ux">UI/UX Issue</option>
                    <option value="performance">Performance</option>
                    <option value="content">Content Error</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="severity">Severity</label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue in detail..."
                  rows="4"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Additional Details (Optional)</h2>

              <div className="form-group">
                <label htmlFor="stepsToReproduce">Steps to Reproduce</label>
                <textarea
                  id="stepsToReproduce"
                  name="stepsToReproduce"
                  value={formData.stepsToReproduce}
                  onChange={handleChange}
                  placeholder="1. Go to... &#10;2. Click on... &#10;3. See error..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="expectedBehavior">Expected Behavior</label>
                <textarea
                  id="expectedBehavior"
                  name="expectedBehavior"
                  value={formData.expectedBehavior}
                  onChange={handleChange}
                  placeholder="What did you expect to happen?"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="actualBehavior">Actual Behavior</label>
                <textarea
                  id="actualBehavior"
                  name="actualBehavior"
                  value={formData.actualBehavior}
                  onChange={handleChange}
                  placeholder="What actually happened?"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="userEmail">Your Email (Optional)</label>
                <input
                  type="email"
                  id="userEmail"
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleChange}
                  placeholder="email@example.com"
                />
                <small>We'll only use this to follow up on your report if needed.</small>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Submit Bug Report
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="diagnostics-section">
            <h2>Session Diagnostics</h2>
            <p className="diagnostics-info">
              When you submit this report, diagnostic information about your session will be
              automatically included to help us diagnose the issue.
            </p>

            <div className="diagnostics-preview">
              <div className="diagnostic-item">
                <strong>Browser:</strong> {diagnosticsPreview.browser.userAgent}
              </div>
              <div className="diagnostic-item">
                <strong>Screen:</strong> {diagnosticsPreview.browser.screenResolution}
              </div>
              <div className="diagnostic-item">
                <strong>Platform:</strong> {diagnosticsPreview.browser.platform}
              </div>
              <div className="diagnostic-item">
                <strong>Online Status:</strong> {diagnosticsPreview.browser.onLine ? 'Online' : 'Offline'}
              </div>
              <div className="diagnostic-item">
                <strong>Recent Errors:</strong> {diagnosticsPreview.errorCount} logged
              </div>
              <div className="diagnostic-item">
                <strong>Current Page:</strong> {diagnosticsPreview.app.pathname}
              </div>
            </div>

            <button
              className="btn-export"
              onClick={handleExportDiagnostics}
            >
              Download Full Diagnostics
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BugReportPage;
