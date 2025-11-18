import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuestionBank } from '../contexts/QuestionBankContext';
import './QuestionCreatorPage.css';

const QuestionCreatorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getQuestionById, addQuestion, updateQuestion } = useQuestionBank();

  const [formData, setFormData] = useState({
    text: '',
    category: 'discussion',
    difficulty: 'medium',
    verseReference: '',
    suggestedTime: 5,
    notes: '',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (id) {
      const question = getQuestionById(id);
      if (question) {
        setFormData(question);
      }
    }
  }, [id, getQuestionById]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (id) {
      updateQuestion(id, formData);
    } else {
      addQuestion(formData);
    }

    navigate('/question-bank');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="question-creator-page">
      <div className="container">
        <div className="creator-header">
          <h1>{id ? 'Edit Question' : 'Create New Question'}</h1>
          <button onClick={() => navigate('/question-bank')} className="btn btn-outline">
            Back to Question Bank
          </button>
        </div>

        <form onSubmit={handleSubmit} className="question-form">
          <div className="form-group">
            <label htmlFor="text">Question Text *</label>
            <textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Enter your discussion question..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="icebreaker">Icebreaker</option>
                <option value="discussion">Discussion</option>
                <option value="reflection">Reflection</option>
                <option value="application">Application</option>
                <option value="closing">Closing</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty *</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="suggestedTime">Suggested Time (min)</label>
              <input
                type="number"
                id="suggestedTime"
                name="suggestedTime"
                value={formData.suggestedTime}
                onChange={handleChange}
                min="1"
                max="60"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="verseReference">Bible Verse Reference</label>
            <input
              type="text"
              id="verseReference"
              name="verseReference"
              value={formData.verseReference}
              onChange={handleChange}
              placeholder="e.g., John 3:16, Matthew 5:1-12"
            />
            <small className="form-hint">Optional - link this question to a specific Bible passage</small>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Teacher Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Add guidance for using this question effectively..."
            />
            <small className="form-hint">Tips, context, or follow-up ideas for group leaders</small>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <div className="tag-input-container">
              <input
                type="text"
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-secondary btn-small"
              >
                Add Tag
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="tags-display">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="tag-remove"
                      aria-label="Remove tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <small className="form-hint">Tags help organize and search questions (e.g., faith, prayer, community)</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/question-bank')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {id ? 'Update Question' : 'Create Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionCreatorPage;
