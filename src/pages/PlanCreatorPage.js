import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlans } from '../contexts/PlanContext';
import './PlanCreatorPage.css';

function PlanCreatorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addPlan, updatePlan, getPlanById } = usePlans();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    duration: 7,
    days: [],
    status: 'draft'
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  const isEditing = !!id;

  // Load existing plan for editing
  useEffect(() => {
    if (isEditing) {
      const plan = getPlanById(id);
      if (plan) {
        setFormData(plan);
        // Initialize days array if it doesn't exist
        if (!plan.days || plan.days.length === 0) {
          setFormData(prev => ({
            ...prev,
            days: Array.from({ length: plan.duration }, (_, i) => ({
              dayNumber: i + 1,
              passages: [],
              notes: '',
              reflectionPrompts: []
            }))
          }));
        }
      }
    }
  }, [id, isEditing, getPlanById]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value);
    setFormData(prev => {
      const currentDays = prev.days || [];
      let newDays = [...currentDays];

      if (newDuration > currentDays.length) {
        // Add new days
        for (let i = currentDays.length; i < newDuration; i++) {
          newDays.push({
            dayNumber: i + 1,
            passages: [],
            notes: '',
            reflectionPrompts: []
          });
        }
      } else if (newDuration < currentDays.length) {
        // Remove excess days
        newDays = newDays.slice(0, newDuration);
      }

      return { ...prev, duration: newDuration, days: newDays };
    });
  };

  const handleAddTag = () => {
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

  const handlePassageChange = (dayIndex, value) => {
    const passages = value.split(',').map(p => p.trim()).filter(p => p);
    setFormData(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex] = { ...newDays[dayIndex], passages };
      return { ...prev, days: newDays };
    });
  };

  const handleNotesChange = (dayIndex, value) => {
    setFormData(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex] = { ...newDays[dayIndex], notes: value };
      return { ...prev, days: newDays };
    });
  };

  const handleReflectionPromptsChange = (dayIndex, value) => {
    const prompts = value.split('\n').filter(p => p.trim());
    setFormData(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex] = { ...newDays[dayIndex], reflectionPrompts: prompts };
      return { ...prev, days: newDays };
    });
  };

  const autoGeneratePassages = () => {
    const startRef = prompt('Enter starting reference (e.g., "Genesis 1:1"):');
    if (!startRef) return;

    const passagesPerDay = prompt('How many chapters per day?', '1');
    if (!passagesPerDay) return;

    // Simple auto-generation logic - in a real app, this would be more sophisticated
    const newDays = formData.days.map((day, index) => ({
      ...day,
      passages: [`${startRef} (Day ${index + 1})`] // Placeholder - would need Bible API
    }));

    setFormData(prev => ({ ...prev, days: newDays }));
    alert('Auto-generation is a placeholder. In production, this would use a Bible API to generate sequential passages.');
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (formData.duration < 1 || formData.duration > 365) {
        newErrors.duration = 'Duration must be between 1 and 365 days';
      }
    } else if (step === 2) {
      const emptyDays = formData.days.filter(day => !day.passages || day.passages.length === 0);
      if (emptyDays.length > 0) {
        newErrors.passages = `${emptyDays.length} day(s) still need passage assignments`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = () => {
    if (isEditing) {
      updatePlan(id, { ...formData, status: 'draft' });
      alert('Plan saved as draft!');
      navigate('/admin/plans');
    } else {
      addPlan({ ...formData, status: 'draft' });
      alert('Plan saved as draft!');
      navigate('/admin/plans');
    }
  };

  const handlePublish = () => {
    if (!validateStep(1) || !validateStep(2)) {
      alert('Please complete all required fields before publishing.');
      return;
    }

    if (isEditing) {
      updatePlan(id, { ...formData, status: 'published', publishedAt: new Date().toISOString() });
      alert('Plan published successfully!');
      navigate('/admin/plans');
    } else {
      addPlan({ ...formData, status: 'published', publishedAt: new Date().toISOString() });
      alert('Plan published successfully!');
      navigate('/admin/plans');
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4].map(step => (
        <div
          key={step}
          className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
          onClick={() => currentStep > step && setCurrentStep(step)}
        >
          <div className="step-number">{step}</div>
          <div className="step-label">
            {step === 1 && 'Basic Info'}
            {step === 2 && 'Daily Passages'}
            {step === 3 && 'Notes & Prompts'}
            {step === 4 && 'Preview & Publish'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="form-step">
      <h2>Step 1: Basic Information</h2>

      <div className="form-group">
        <label htmlFor="title">Plan Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., 30-Day Gospel Journey"
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Briefly describe this reading plan..."
          rows="4"
        />
      </div>

      <div className="form-group">
        <label htmlFor="duration">Duration (days) *</label>
        <input
          type="number"
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleDurationChange}
          min="1"
          max="365"
          className={errors.duration ? 'error' : ''}
        />
        {errors.duration && <span className="error-message">{errors.duration}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <div className="tag-input-container">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Add a tag (press Enter)"
          />
          <button type="button" onClick={handleAddTag} className="btn btn-small btn-secondary">
            Add
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="tags-display">
            {formData.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="tag-remove">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <div className="step-header">
        <h2>Step 2: Daily Passage Assignments</h2>
        <button type="button" onClick={autoGeneratePassages} className="btn btn-secondary">
          Auto-Generate from Range
        </button>
      </div>

      {errors.passages && <div className="error-message-banner">{errors.passages}</div>}

      <div className="days-list">
        {formData.days.map((day, index) => (
          <div key={index} className="day-card">
            <h3>Day {day.dayNumber}</h3>
            <div className="form-group">
              <label>Passages (comma-separated)</label>
              <input
                type="text"
                value={day.passages.join(', ')}
                onChange={(e) => handlePassageChange(index, e.target.value)}
                placeholder="e.g., Genesis 1:1-31, Psalm 1"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h2>Step 3: Daily Notes & Reflection Prompts (Optional)</h2>

      <div className="days-list">
        {formData.days.map((day, index) => (
          <div key={index} className="day-card">
            <h3>Day {day.dayNumber}</h3>
            <div className="day-passages-preview">
              <strong>Passages:</strong> {day.passages.join(', ') || 'None assigned'}
            </div>

            <div className="form-group">
              <label>Study Notes</label>
              <textarea
                value={day.notes}
                onChange={(e) => handleNotesChange(index, e.target.value)}
                placeholder="Add context, historical background, or study notes..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Reflection Prompts (one per line)</label>
              <textarea
                value={day.reflectionPrompts.join('\n')}
                onChange={(e) => handleReflectionPromptsChange(index, e.target.value)}
                placeholder="What does this passage teach about God?&#10;How can you apply this to your life?"
                rows="3"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <h2>Step 4: Preview & Publish</h2>

      <div className="preview-container">
        <div className="preview-header">
          <h3>{formData.title}</h3>
          {formData.description && <p className="preview-description">{formData.description}</p>}
          <div className="preview-meta">
            <span className="preview-duration">{formData.duration} days</span>
            {formData.tags.length > 0 && (
              <div className="preview-tags">
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="preview-days">
          <h4>Daily Reading Schedule</h4>
          {formData.days.slice(0, 3).map((day, index) => (
            <div key={index} className="preview-day">
              <div className="preview-day-header">
                <strong>Day {day.dayNumber}</strong>
              </div>
              <div className="preview-passages">
                {day.passages.join(', ') || 'No passages assigned'}
              </div>
              {day.notes && (
                <div className="preview-notes">
                  <em>Notes:</em> {day.notes}
                </div>
              )}
              {day.reflectionPrompts.length > 0 && (
                <div className="preview-prompts">
                  <em>Reflection:</em>
                  <ul>
                    {day.reflectionPrompts.map((prompt, idx) => (
                      <li key={idx}>{prompt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {formData.days.length > 3 && (
            <div className="preview-more">
              ... and {formData.days.length - 3} more days
            </div>
          )}
        </div>

        <div className="publish-actions">
          <button type="button" onClick={handleSaveDraft} className="btn btn-secondary">
            Save as Draft
          </button>
          <button type="button" onClick={handlePublish} className="btn btn-primary btn-large">
            Publish Plan
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="plan-creator-page">
      <div className="container">
        <div className="page-header">
          <h1>{isEditing ? 'Edit Reading Plan' : 'Create New Reading Plan'}</h1>
          <button onClick={() => navigate('/admin/plans')} className="btn btn-outline">
            Cancel
          </button>
        </div>

        {renderStepIndicator()}

        <div className="form-container">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {currentStep < 4 && (
            <div className="step-navigation">
              {currentStep > 1 && (
                <button type="button" onClick={handlePrevious} className="btn btn-secondary">
                  Previous
                </button>
              )}
              <button type="button" onClick={handleNext} className="btn btn-primary">
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanCreatorPage;
