import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIcebreakers } from '../contexts/IcebreakerContext';
import './IcebreakerCreatorPage.css';

const IcebreakerCreatorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getIcebreakerById, createIcebreaker, updateIcebreaker } = useIcebreakers();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    category: 'get-to-know',
    ageGroup: 'high',
    groupSize: 'medium',
    energyLevel: 'medium',
    durationMinutes: 15,
    materialsNeeded: [],
    questions: [],
    tags: [],
    isPublic: false,
    isTemplate: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load existing icebreaker if editing
  useEffect(() => {
    if (id) {
      loadIcebreaker();
    }
  }, [id]);

  const loadIcebreaker = async () => {
    try {
      const icebreaker = await getIcebreakerById(id);
      if (icebreaker) {
        setFormData({
          title: icebreaker.title || '',
          description: icebreaker.description || '',
          instructions: icebreaker.instructions || '',
          category: icebreaker.category || 'get-to-know',
          ageGroup: icebreaker.ageGroup || 'high',
          groupSize: icebreaker.groupSize || 'medium',
          energyLevel: icebreaker.energyLevel || 'medium',
          durationMinutes: icebreaker.durationMinutes || 15,
          materialsNeeded: icebreaker.materialsNeeded || [],
          questions: icebreaker.questions || [],
          tags: icebreaker.tags || [],
          isPublic: icebreaker.isPublic || false,
          isTemplate: icebreaker.isTemplate || false,
        });
      }
    } catch (error) {
      console.error('Error loading icebreaker:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!formData.category) {
        newErrors.category = 'Category is required';
      }
    }

    if (step === 2) {
      if (!formData.instructions?.trim()) {
        newErrors.instructions = 'Instructions are required';
      }
      if (!formData.durationMinutes || formData.durationMinutes < 1) {
        newErrors.durationMinutes = 'Duration must be at least 1 minute';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await updateIcebreaker(id, formData);
        alert('Icebreaker updated successfully!');
      } else {
        await createIcebreaker(formData);
        alert('Icebreaker created successfully!');
      }
      navigate('/admin/icebreakers');
    } catch (error) {
      console.error('Error saving icebreaker:', error);
      alert('Failed to save icebreaker. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/admin/icebreakers');
    }
  };

  // Material handlers
  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materialsNeeded: [...prev.materialsNeeded, ''],
    }));
  };

  const updateMaterial = (index, value) => {
    const updated = [...formData.materialsNeeded];
    updated[index] = value;
    setFormData(prev => ({ ...prev, materialsNeeded: updated }));
  };

  const removeMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materialsNeeded: prev.materialsNeeded.filter((_, i) => i !== index),
    }));
  };

  // Question handlers
  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, ''],
    }));
  };

  const updateQuestion = (index, value) => {
    const updated = [...formData.questions];
    updated[index] = value;
    setFormData(prev => ({ ...prev, questions: updated }));
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map(step => (
        <div
          key={step}
          className={`step ${currentStep === step ? 'active' : ''} ${
            currentStep > step ? 'completed' : ''
          }`}
          onClick={() => currentStep > step && setCurrentStep(step)}
        >
          <div className="step-number">{step}</div>
          <div className="step-label">
            {step === 1 && 'Basic Info'}
            {step === 2 && 'Details'}
            {step === 3 && 'Review'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="form-step">
      <h2>Basic Information</h2>

      <div className="form-group">
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter icebreaker title"
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Brief description of the icebreaker"
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">
            Category <span className="required">*</span>
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className={errors.category ? 'error' : ''}
          >
            <option value="get-to-know">Get to Know</option>
            <option value="faith-based">Faith Based</option>
            <option value="energizer">Energizer</option>
            <option value="deep-discussion">Deep Discussion</option>
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="ageGroup">Age Group</label>
          <select
            id="ageGroup"
            value={formData.ageGroup}
            onChange={(e) => handleInputChange('ageGroup', e.target.value)}
          >
            <option value="middle">Middle School</option>
            <option value="high">High School</option>
            <option value="college">College</option>
            <option value="all">All Ages</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="groupSize">Group Size</label>
          <select
            id="groupSize"
            value={formData.groupSize}
            onChange={(e) => handleInputChange('groupSize', e.target.value)}
          >
            <option value="small">Small (2-8)</option>
            <option value="medium">Medium (9-20)</option>
            <option value="large">Large (20+)</option>
            <option value="any">Any Size</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="energyLevel">Energy Level</label>
          <select
            id="energyLevel"
            value={formData.energyLevel}
            onChange={(e) => handleInputChange('energyLevel', e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="duration">Duration (minutes)</label>
          <input
            id="duration"
            type="number"
            min="1"
            max="120"
            value={formData.durationMinutes}
            onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value))}
            className={errors.durationMinutes ? 'error' : ''}
          />
          {errors.durationMinutes && (
            <span className="error-message">{errors.durationMinutes}</span>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h2>Details</h2>

      <div className="form-group">
        <label htmlFor="instructions">
          Instructions <span className="required">*</span>
        </label>
        <textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) => handleInputChange('instructions', e.target.value)}
          placeholder="Detailed instructions for facilitating this icebreaker"
          rows="6"
          className={errors.instructions ? 'error' : ''}
        />
        {errors.instructions && <span className="error-message">{errors.instructions}</span>}
      </div>

      <div className="form-group">
        <label>Materials Needed</label>
        <div className="list-items">
          {formData.materialsNeeded.map((material, index) => (
            <div key={index} className="list-item">
              <input
                type="text"
                value={material}
                onChange={(e) => updateMaterial(index, e.target.value)}
                placeholder="Enter material"
              />
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeMaterial(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="add-btn" onClick={addMaterial}>
          + Add Material
        </button>
      </div>

      <div className="form-group">
        <label>Questions / Prompts</label>
        <div className="list-items">
          {formData.questions.map((question, index) => (
            <div key={index} className="list-item">
              <textarea
                value={question}
                onChange={(e) => updateQuestion(index, e.target.value)}
                placeholder="Enter question or prompt"
                rows="2"
              />
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeQuestion(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="add-btn" onClick={addQuestion}>
          + Add Question
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step review-step">
      <h2>Review & Publish</h2>

      <div className="review-section">
        <h3>{formData.title}</h3>
        {formData.description && <p className="review-description">{formData.description}</p>}

        <div className="review-tags">
          <span className="tag">{formData.category.replace('-', ' ')}</span>
          <span className="tag">{formData.ageGroup}</span>
          <span className="tag">{formData.groupSize} group</span>
          <span className="tag">{formData.energyLevel} energy</span>
          <span className="tag">⏱️ {formData.durationMinutes} min</span>
        </div>

        <div className="review-content">
          <h4>Instructions</h4>
          <p className="instructions-text">{formData.instructions}</p>

          {formData.materialsNeeded.length > 0 && (
            <>
              <h4>Materials Needed</h4>
              <ul>
                {formData.materialsNeeded.map((material, index) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </>
          )}

          {formData.questions.length > 0 && (
            <>
              <h4>Questions / Prompts</h4>
              <ol>
                {formData.questions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => handleInputChange('isPublic', e.target.checked)}
          />
          <span>Make this icebreaker public (visible to all organizations)</span>
        </label>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.isTemplate}
            onChange={(e) => handleInputChange('isTemplate', e.target.checked)}
          />
          <span>Save as template (can be duplicated by others)</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="icebreaker-creator-page">
      <div className="creator-header">
        <h1>{id ? 'Edit Icebreaker' : 'Create New Icebreaker'}</h1>
        <button className="cancel-btn" onClick={handleCancel}>
          Cancel
        </button>
      </div>

      {renderStepIndicator()}

      <div className="creator-content">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      <div className="creator-footer">
        {currentStep > 1 && (
          <button className="btn btn-secondary" onClick={handleBack}>
            ← Back
          </button>
        )}
        <div className="spacer"></div>
        {currentStep < 3 ? (
          <button className="btn btn-primary" onClick={handleNext}>
            Next →
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : id ? 'Update Icebreaker' : 'Create Icebreaker'}
          </button>
        )}
      </div>
    </div>
  );
};

export default IcebreakerCreatorPage;
