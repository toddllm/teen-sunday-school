import React, { useState } from 'react';
import { useGoals } from '../contexts/GoalContext';
import './GoalForm.css';

const GoalForm = ({ goal, onClose, categoryOptions }) => {
  const { addGoal, updateGoal } = useGoals();
  const isEditing = !!goal;

  // Form state
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    category: goal?.category || 'PRAYER',
    targetDate: goal?.targetDate
      ? new Date(goal.targetDate).toISOString().split('T')[0]
      : '',
    priority: goal?.priority || 'MEDIUM',
    status: goal?.status || 'NOT_STARTED',
    isPrivate: goal?.isPrivate ?? true,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const categories = categoryOptions || [
    { value: 'PRAYER', label: 'Prayer' },
    { value: 'BIBLE_READING', label: 'Bible Reading' },
    { value: 'SCRIPTURE_MEMORIZATION', label: 'Scripture Memorization' },
    { value: 'SERVICE', label: 'Service' },
    { value: 'DISCIPLESHIP', label: 'Discipleship' },
    { value: 'WORSHIP', label: 'Worship' },
    { value: 'WITNESSING', label: 'Witnessing' },
    { value: 'FELLOWSHIP', label: 'Fellowship' },
    { value: 'SPIRITUAL_DISCIPLINE', label: 'Spiritual Discipline' },
    { value: 'CHARACTER_DEVELOPMENT', label: 'Character Development' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.targetDate) {
      const target = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (target < today) {
        newErrors.targetDate = 'Target date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const goalData = {
        ...formData,
        targetDate: formData.targetDate || null,
      };

      if (isEditing) {
        await updateGoal(goal.id, goalData);
      } else {
        await addGoal(goalData);
      }

      onClose();
    } catch (error) {
      setErrors({
        submit: error.response?.data?.error || 'Failed to save goal',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content goal-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Goal' : 'Create New Goal'}</h2>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Read the Bible daily for 30 days"
              className={errors.title ? 'error' : ''}
              maxLength={200}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your goal and what success looks like..."
              rows={4}
              className={errors.description ? 'error' : ''}
              maxLength={1000}
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
            <span className="char-count">
              {formData.description.length}/1000
            </span>
          </div>

          {/* Category and Priority Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'error' : ''}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="error-message">{errors.category}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Target Date and Status Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetDate">Target Date</label>
              <input
                type="date"
                id="targetDate"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={errors.targetDate ? 'error' : ''}
              />
              {errors.targetDate && (
                <span className="error-message">{errors.targetDate}</span>
              )}
            </div>

            {isEditing && (
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PAUSED">Paused</option>
                  <option value="ABANDONED">Abandoned</option>
                </select>
              </div>
            )}
          </div>

          {/* Privacy Toggle */}
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
              />
              <span>Keep this goal private (only visible to you)</span>
            </label>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting
                ? 'Saving...'
                : isEditing
                ? 'Update Goal'
                : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;
