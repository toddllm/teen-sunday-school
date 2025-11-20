import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedback } from '../contexts/FeedbackContext';
import './FeedbackFormPage.css';

function FeedbackFormPage() {
  const navigate = useNavigate();
  const { addFeedback } = useFeedback();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: '',
    priority: 'medium'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate required fields
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError('Please fill in both subject and message fields.');
      setLoading(false);
      return;
    }

    try {
      // Add feedback
      await addFeedback(formData);

      // Show success message
      setSubmitted(true);

      // Reset form after delay and redirect
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          category: 'general',
          subject: '',
          message: '',
          priority: 'medium'
        });
        setSubmitted(false);
        navigate('/');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback. Please try again.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="feedback-form-page">
      <div className="container">
        <div className="feedback-header">
          <h1>Send Feedback</h1>
          <p className="feedback-subtitle">
            We'd love to hear from you! Share your thoughts, report bugs, or suggest new features.
          </p>
        </div>

        {submitted ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Thank You!</h2>
            <p>Your feedback has been submitted successfully.</p>
            <p>We appreciate you taking the time to help us improve!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            {error && <div className="error-message" style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c00' }}>{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="category">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  className="form-input"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="general">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="content">Content Suggestion</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="priority">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="form-input"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="subject">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="form-input"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Brief summary of your feedback"
                maxLength={200}
              />
              <small className="form-hint">
                {formData.subject.length}/200 characters
              </small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="message">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                className="form-textarea"
                value={formData.message}
                onChange={handleChange}
                required
                rows="8"
                placeholder="Please provide as much detail as possible..."
              />
            </div>

            <div className="category-info">
              {formData.category === 'bug' && (
                <div className="info-box info-bug">
                  <strong>Bug Report Tips:</strong> Include steps to reproduce, expected vs actual behavior, and any error messages.
                </div>
              )}
              {formData.category === 'feature' && (
                <div className="info-box info-feature">
                  <strong>Feature Request Tips:</strong> Describe the problem you're trying to solve and how this feature would help.
                </div>
              )}
              {formData.category === 'content' && (
                <div className="info-box info-content">
                  <strong>Content Suggestion Tips:</strong> Let us know what Bible passages, lessons, or topics you'd like to see.
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default FeedbackFormPage;
