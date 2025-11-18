import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useABTest } from '../contexts/ABTestContext';
import './ExperimentAdminPage.css';

const ExperimentAdminPage = () => {
  const navigate = useNavigate();
  const {
    experiments,
    createExperiment,
    updateExperiment,
    deleteExperiment,
    startExperiment,
    pauseExperiment,
    completeExperiment
  } = useABTest();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    featureType: 'plan',
    targetMetric: 'completion_rate',
    variants: [
      { id: 'control', name: 'Control', description: '' },
      { id: 'variant-a', name: 'Variant A', description: '' }
    ],
    audienceSplit: [50, 50]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleSplitChange = (index, value) => {
    const newSplit = [...formData.audienceSplit];
    newSplit[index] = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, audienceSplit: newSplit }));
  };

  const addVariant = () => {
    const variantId = `variant-${String.fromCharCode(65 + formData.variants.length - 1)}`;
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { id: variantId, name: `Variant ${String.fromCharCode(65 + prev.variants.length - 1)}`, description: '' }],
      audienceSplit: [...prev.audienceSplit, 0]
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length <= 2) {
      alert('You must have at least 2 variants');
      return;
    }
    const newVariants = formData.variants.filter((_, i) => i !== index);
    const newSplit = formData.audienceSplit.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, variants: newVariants, audienceSplit: newSplit }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate audience split adds up to 100
    const totalSplit = formData.audienceSplit.reduce((sum, val) => sum + val, 0);
    if (totalSplit !== 100) {
      alert('Audience split must add up to 100%');
      return;
    }

    if (editingExperiment) {
      updateExperiment(editingExperiment.id, formData);
      setEditingExperiment(null);
    } else {
      createExperiment(formData);
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      featureType: 'plan',
      targetMetric: 'completion_rate',
      variants: [
        { id: 'control', name: 'Control', description: '' },
        { id: 'variant-a', name: 'Variant A', description: '' }
      ],
      audienceSplit: [50, 50]
    });
    setShowCreateForm(false);
  };

  const handleEdit = (experiment) => {
    setEditingExperiment(experiment);
    setFormData({
      name: experiment.name,
      description: experiment.description,
      featureType: experiment.featureType,
      targetMetric: experiment.targetMetric,
      variants: experiment.variants,
      audienceSplit: experiment.audienceSplit
    });
    setShowCreateForm(true);
  };

  const handleDelete = (experimentId) => {
    if (window.confirm('Are you sure you want to delete this experiment? This action cannot be undone.')) {
      deleteExperiment(experimentId);
    }
  };

  const handleStatusChange = (experiment) => {
    switch (experiment.status) {
      case 'draft':
        startExperiment(experiment.id);
        break;
      case 'active':
        pauseExperiment(experiment.id);
        break;
      case 'paused':
        startExperiment(experiment.id);
        break;
      default:
        break;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'status-badge active';
      case 'paused': return 'status-badge paused';
      case 'completed': return 'status-badge completed';
      default: return 'status-badge draft';
    }
  };

  const getStatusAction = (status) => {
    switch (status) {
      case 'draft': return 'Start';
      case 'active': return 'Pause';
      case 'paused': return 'Resume';
      default: return null;
    }
  };

  return (
    <div className="experiment-admin-page">
      <div className="experiment-admin-header">
        <h1>A/B Testing Experiments</h1>
        <button
          className="btn-create"
          onClick={() => {
            setShowCreateForm(true);
            setEditingExperiment(null);
            setFormData({
              name: '',
              description: '',
              featureType: 'plan',
              targetMetric: 'completion_rate',
              variants: [
                { id: 'control', name: 'Control', description: '' },
                { id: 'variant-a', name: 'Variant A', description: '' }
              ],
              audienceSplit: [50, 50]
            });
          }}
        >
          + Create Experiment
        </button>
      </div>

      {showCreateForm && (
        <div className="experiment-form-container">
          <div className="experiment-form-header">
            <h2>{editingExperiment ? 'Edit Experiment' : 'Create New Experiment'}</h2>
            <button className="btn-close" onClick={() => {
              setShowCreateForm(false);
              setEditingExperiment(null);
            }}>×</button>
          </div>

          <form onSubmit={handleSubmit} className="experiment-form">
            <div className="form-group">
              <label>Experiment Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., New Onboarding Flow"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="What are you testing and why?"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Feature Type *</label>
                <select
                  name="featureType"
                  value={formData.featureType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="plan">Reading Plan</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="lesson">Lesson Flow</option>
                  <option value="game">Game Feature</option>
                  <option value="ui">UI Component</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Metric *</label>
                <select
                  name="targetMetric"
                  value={formData.targetMetric}
                  onChange={handleInputChange}
                  required
                >
                  <option value="completion_rate">Completion Rate</option>
                  <option value="retention">Retention</option>
                  <option value="engagement">Engagement</option>
                  <option value="conversion">Conversion</option>
                  <option value="time_on_task">Time on Task</option>
                </select>
              </div>
            </div>

            <div className="variants-section">
              <div className="variants-header">
                <h3>Variants</h3>
                <button type="button" className="btn-add-variant" onClick={addVariant}>
                  + Add Variant
                </button>
              </div>

              {formData.variants.map((variant, index) => (
                <div key={index} className="variant-item">
                  <div className="variant-header">
                    <span className="variant-label">Variant {index + 1}</span>
                    {formData.variants.length > 2 && (
                      <button
                        type="button"
                        className="btn-remove-variant"
                        onClick={() => removeVariant(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Variant ID</label>
                      <input
                        type="text"
                        value={variant.id}
                        onChange={(e) => handleVariantChange(index, 'id', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Variant Name</label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Traffic Split (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.audienceSplit[index]}
                        onChange={(e) => handleSplitChange(index, e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={variant.description}
                      onChange={(e) => handleVariantChange(index, 'description', e.target.value)}
                      placeholder="Describe what's different in this variant"
                    />
                  </div>
                </div>
              ))}

              <div className="split-summary">
                Total Split: {formData.audienceSplit.reduce((sum, val) => sum + val, 0)}%
                {formData.audienceSplit.reduce((sum, val) => sum + val, 0) !== 100 && (
                  <span className="split-warning"> (Must equal 100%)</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingExperiment ? 'Update Experiment' : 'Create Experiment'}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingExperiment(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="experiments-stats">
        <div className="stat-card">
          <div className="stat-value">{experiments.length}</div>
          <div className="stat-label">Total Experiments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{experiments.filter(e => e.status === 'active').length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{experiments.filter(e => e.status === 'completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{experiments.filter(e => e.status === 'draft').length}</div>
          <div className="stat-label">Drafts</div>
        </div>
      </div>

      <div className="experiments-list">
        {experiments.length === 0 ? (
          <div className="empty-state">
            <h3>No experiments yet</h3>
            <p>Create your first A/B test to start optimizing your features</p>
          </div>
        ) : (
          <div className="experiments-table">
            <table>
              <thead>
                <tr>
                  <th>Experiment Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Variants</th>
                  <th>Target Metric</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {experiments.map(experiment => (
                  <tr key={experiment.id}>
                    <td>
                      <div className="experiment-name">{experiment.name}</div>
                      {experiment.description && (
                        <div className="experiment-description">{experiment.description}</div>
                      )}
                    </td>
                    <td>
                      <span className="feature-type-badge">{experiment.featureType}</span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(experiment.status)}>
                        {experiment.status}
                      </span>
                    </td>
                    <td>{experiment.variants.length} variants</td>
                    <td>{experiment.targetMetric.replace(/_/g, ' ')}</td>
                    <td>{new Date(experiment.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => navigate(`/admin/experiments/${experiment.id}/results`)}
                          title="View Results"
                        >
                          Results
                        </button>
                        {getStatusAction(experiment.status) && (
                          <button
                            className="btn-action btn-status"
                            onClick={() => handleStatusChange(experiment)}
                          >
                            {getStatusAction(experiment.status)}
                          </button>
                        )}
                        {experiment.status === 'active' && (
                          <button
                            className="btn-action btn-complete"
                            onClick={() => completeExperiment(experiment.id)}
                          >
                            Complete
                          </button>
                        )}
                        {experiment.status === 'draft' && (
                          <>
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleEdit(experiment)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDelete(experiment.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentAdminPage;
