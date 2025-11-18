import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePrayer } from '../contexts/PrayerContext';
import { useStreak } from '../contexts/StreakContext';
import './PrayerFormPage.css';

const PrayerFormPage = () => {
  const navigate = useNavigate();
  const { createPrayer } = usePrayer();
  const { logActivity } = useStreak();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal'
  });
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'personal', label: 'Personal', description: 'Personal needs and growth' },
    { value: 'family', label: 'Family', description: 'Family members and relationships' },
    { value: 'church', label: 'Church', description: 'Church community and ministry' },
    { value: 'friends', label: 'Friends', description: 'Friends and their needs' },
    { value: 'world', label: 'World', description: 'Global issues and missions' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Prayer title is required';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create the prayer
    const newPrayer = createPrayer(formData);

    // Log the activity for streak tracking
    logActivity('prayer_logged');

    // Navigate to the prayer detail page
    navigate(`/prayers/${newPrayer.id}`);
  };

  const getCategoryColor = (category) => {
    const colors = {
      personal: '#3b82f6',
      family: '#10b981',
      church: '#8b5cf6',
      friends: '#f59e0b',
      world: '#ef4444'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="prayer-form-page">
      <div className="prayer-form-header">
        <Link to="/prayers" className="back-link">
          ← Back to Prayer List
        </Link>
      </div>

      <div className="prayer-form-container">
        <div className="form-header">
          <h1>Add Prayer Request</h1>
          <p className="form-subtitle">
            Share your prayer request and begin tracking God's faithfulness
          </p>
        </div>

        <form onSubmit={handleSubmit} className="prayer-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Prayer Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Guidance for college decision, Healing for grandma"
              className={`form-input ${errors.title ? 'error' : ''}`}
              maxLength={100}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Prayer Details
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Share more details about this prayer request..."
              className="form-textarea"
              rows={5}
            />
            <span className="form-hint">
              You can add updates and journal entries after creating the prayer
            </span>
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <div className="category-options">
              {categories.map(cat => (
                <label
                  key={cat.value}
                  className={`category-option ${formData.category === cat.value ? 'selected' : ''}`}
                  style={{
                    borderColor: formData.category === cat.value ? getCategoryColor(cat.value) : '#d1d5db'
                  }}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={formData.category === cat.value}
                    onChange={handleChange}
                    className="category-radio"
                  />
                  <div className="category-content">
                    <div
                      className="category-indicator"
                      style={{ backgroundColor: getCategoryColor(cat.value) }}
                    />
                    <div>
                      <div className="category-label">{cat.label}</div>
                      <div className="category-description">{cat.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Add Prayer Request
            </button>
            <button
              type="button"
              onClick={() => navigate('/prayers')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="form-footer">
          <div className="encouragement-box">
            <div className="encouragement-icon">🙏</div>
            <p>
              "Do not be anxious about anything, but in every situation, by prayer and petition,
              with thanksgiving, present your requests to God." - Philippians 4:6
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerFormPage;
