import React, { useState } from 'react';
import { useQuestions } from '../contexts/QuestionContext';
import './QuestionSubmitForm.css';

const QuestionSubmitForm = ({ groupId, sessionId = null }) => {
  const { submitQuestion, loading } = useQuestions();
  const [formData, setFormData] = useState({
    category: 'BIBLE',
    body: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.body.trim()) {
      setError('Please enter your question');
      return;
    }

    const result = await submitQuestion(groupId, {
      ...formData,
      sessionId,
    });

    if (result.success) {
      setSubmitted(true);
      setFormData({
        category: 'BIBLE',
        body: '',
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="question-submit-form">
      <div className="form-header">
        <h2>Ask a Question Anonymously</h2>
        <p className="form-description">
          Have a question you're shy to ask out loud? Submit it here anonymously
          and our leaders will address it.
        </p>
      </div>

      {submitted && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          <p>Your question has been submitted anonymously. Thank you!</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠</span>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="BIBLE">Bible Questions</option>
            <option value="LIFE">Life & Relationships</option>
            <option value="DOUBT">Faith & Doubts</option>
          </select>
          <p className="field-hint">
            {formData.category === 'BIBLE' && 'Questions about Bible interpretation, theology, or scripture'}
            {formData.category === 'LIFE' && 'Questions about daily life, relationships, or practical issues'}
            {formData.category === 'DOUBT' && 'Questions about faith, struggles, or doubts'}
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="body">Your Question *</label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            rows="6"
            placeholder="Type your question here... Remember, this is completely anonymous!"
            required
          />
          <p className="field-hint">
            Your question will be submitted anonymously. No personal information
            will be stored.
          </p>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !formData.body.trim()}
          >
            {loading ? 'Submitting...' : 'Submit Question'}
          </button>
        </div>
      </form>

      <div className="privacy-notice">
        <p>
          <strong>Privacy Notice:</strong> Your question is completely anonymous.
          We do not collect or store any personal information when you submit a
          question.
        </p>
      </div>
    </div>
  );
};

export default QuestionSubmitForm;
