import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useServiceProjects } from '../contexts/ServiceProjectContext';
import './ProjectCreatorPage.css';

const ProjectCreatorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addProject, updateProject, getProjectById } = useServiceProjects();

  const [currentStep, setCurrentStep] = useState(1);
  const [project, setProject] = useState({
    name: '',
    description: '',
    category: 'Community Service',
    estimatedDuration: '',
    participantCount: '',
    startDate: '',
    endDate: '',
    tasks: [],
    resources: [],
    volunteers: [],
    impactMetrics: [],
    budget: {
      estimated: 0,
      actual: 0,
      expenses: []
    },
    notes: ''
  });

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      const existingProject = getProjectById(id);
      if (existingProject) {
        setProject(existingProject);
      }
    }
  }, [id, isEditMode, getProjectById]);

  const handleInputChange = (field, value) => {
    setProject(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (field, subfield, value) => {
    setProject(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subfield]: value
      }
    }));
  };

  // Task management
  const addTask = () => {
    const newTask = {
      id: `task-${Date.now()}`,
      name: '',
      category: 'Planning',
      daysFromStart: 0,
      completed: false,
      completedAt: null,
      assignedTo: ''
    };
    setProject(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  };

  const updateTask = (index, field, value) => {
    const updatedTasks = [...project.tasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      [field]: value
    };
    setProject(prev => ({
      ...prev,
      tasks: updatedTasks
    }));
  };

  const deleteTask = (index) => {
    setProject(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  // Resource management
  const addResource = () => {
    const newResource = {
      id: `resource-${Date.now()}`,
      item: '',
      quantity: '',
      cost: '',
      acquired: false
    };
    setProject(prev => ({
      ...prev,
      resources: [...prev.resources, newResource]
    }));
  };

  const updateResource = (index, field, value) => {
    const updatedResources = [...project.resources];
    updatedResources[index] = {
      ...updatedResources[index],
      [field]: value
    };
    setProject(prev => ({
      ...prev,
      resources: updatedResources
    }));
  };

  const deleteResource = (index) => {
    setProject(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  // Impact Metrics management
  const addImpactMetric = () => {
    const newMetric = {
      id: `metric-${Date.now()}`,
      name: '',
      value: 0
    };
    setProject(prev => ({
      ...prev,
      impactMetrics: [...prev.impactMetrics, newMetric]
    }));
  };

  const updateImpactMetric = (index, field, value) => {
    const updatedMetrics = [...project.impactMetrics];
    updatedMetrics[index] = {
      ...updatedMetrics[index],
      [field]: value
    };
    setProject(prev => ({
      ...prev,
      impactMetrics: updatedMetrics
    }));
  };

  const deleteImpactMetric = (index) => {
    setProject(prev => ({
      ...prev,
      impactMetrics: prev.impactMetrics.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (isEditMode) {
      updateProject(id, project);
    } else {
      addProject(project);
    }
    navigate('/admin/service-projects');
  };

  const handleCancel = () => {
    navigate('/admin/service-projects');
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return project.name.trim() !== '' && project.description.trim() !== '';
      case 2:
        return project.tasks.length > 0;
      case 3:
        return true; // Resources are optional
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: 'Basic Info' },
      { num: 2, label: 'Tasks' },
      { num: 3, label: 'Resources & Metrics' },
      { num: 4, label: 'Review' }
    ];

    return (
      <div className="step-indicator">
        {steps.map(step => (
          <div
            key={step.num}
            className={`step ${currentStep === step.num ? 'active' : ''} ${
              currentStep > step.num ? 'completed' : ''
            }`}
            onClick={() => setCurrentStep(step.num)}
          >
            <div className="step-number">{step.num}</div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="form-step">
      <h2>Basic Project Information</h2>

      <div className="form-group">
        <label>Project Name *</label>
        <input
          type="text"
          value={project.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="e.g., Community Food Drive"
        />
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          value={project.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe the service project and its goals..."
          rows="4"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Category</label>
          <select
            value={project.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
          >
            <option value="Community Service">Community Service</option>
            <option value="Environmental">Environmental</option>
            <option value="Compassion">Compassion</option>
            <option value="Education">Education</option>
            <option value="Global Missions">Global Missions</option>
            <option value="Local Outreach">Local Outreach</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Estimated Duration</label>
          <input
            type="text"
            value={project.estimatedDuration}
            onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
            placeholder="e.g., 2-3 weeks"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={project.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={project.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Expected Participant Count</label>
        <input
          type="text"
          value={project.participantCount}
          onChange={(e) => handleInputChange('participantCount', e.target.value)}
          placeholder="e.g., 15-30 volunteers"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h2>Project Tasks</h2>
      <p className="step-description">
        Break down your project into manageable tasks. Organize tasks by category and timeline.
      </p>

      <div className="tasks-list">
        {project.tasks.map((task, index) => (
          <div key={task.id} className="task-item">
            <div className="task-number">{index + 1}</div>
            <div className="task-fields">
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => updateTask(index, 'name', e.target.value)}
                    placeholder="Task name..."
                  />
                </div>
                <div className="form-group">
                  <select
                    value={task.category}
                    onChange={(e) => updateTask(index, 'category', e.target.value)}
                  >
                    <option value="Planning">Planning</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Volunteers">Volunteers</option>
                    <option value="Training">Training</option>
                    <option value="Preparation">Preparation</option>
                    <option value="Execution">Execution</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>
                <div className="form-group">
                  <input
                    type="number"
                    value={task.daysFromStart}
                    onChange={(e) => updateTask(index, 'daysFromStart', parseInt(e.target.value))}
                    placeholder="Day #"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <button
              className="btn-delete"
              onClick={() => deleteTask(index)}
              title="Delete task"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      <button className="btn-add" onClick={addTask}>
        + Add Task
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h2>Resources & Impact Metrics</h2>

      <div className="section">
        <h3>Required Resources</h3>
        <p className="step-description">
          List materials, supplies, and resources needed for the project.
        </p>

        <div className="resources-list">
          {project.resources.map((resource, index) => (
            <div key={resource.id} className="resource-item">
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <input
                    type="text"
                    value={resource.item}
                    onChange={(e) => updateResource(index, 'item', e.target.value)}
                    placeholder="Item name..."
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    value={resource.quantity}
                    onChange={(e) => updateResource(index, 'quantity', e.target.value)}
                    placeholder="Quantity"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    value={resource.cost}
                    onChange={(e) => updateResource(index, 'cost', e.target.value)}
                    placeholder="Cost"
                  />
                </div>
              </div>
              <button
                className="btn-delete"
                onClick={() => deleteResource(index)}
                title="Delete resource"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <button className="btn-add" onClick={addResource}>
          + Add Resource
        </button>
      </div>

      <div className="section">
        <h3>Budget</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Estimated Budget</label>
            <input
              type="number"
              value={project.budget.estimated}
              onChange={(e) => handleNestedInputChange('budget', 'estimated', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Impact Metrics</h3>
        <p className="step-description">
          Define how you'll measure the success and impact of this project.
        </p>

        <div className="metrics-list">
          {project.impactMetrics.map((metric, index) => (
            <div key={metric.id} className="metric-item">
              <div className="form-group" style={{ flex: 1 }}>
                <input
                  type="text"
                  value={metric.name}
                  onChange={(e) => updateImpactMetric(index, 'name', e.target.value)}
                  placeholder="e.g., Pounds of food collected"
                />
              </div>
              <button
                className="btn-delete"
                onClick={() => deleteImpactMetric(index)}
                title="Delete metric"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <button className="btn-add" onClick={addImpactMetric}>
          + Add Impact Metric
        </button>
      </div>

      <div className="section">
        <h3>Additional Notes</h3>
        <textarea
          value={project.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Any additional notes, special considerations, or important details..."
          rows="4"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step review-step">
      <h2>Review Project</h2>
      <p className="step-description">
        Review your project details before saving. You can always edit later.
      </p>

      <div className="review-section">
        <h3>Basic Information</h3>
        <div className="review-item">
          <strong>Name:</strong> {project.name}
        </div>
        <div className="review-item">
          <strong>Description:</strong> {project.description}
        </div>
        <div className="review-item">
          <strong>Category:</strong> {project.category}
        </div>
        <div className="review-item">
          <strong>Duration:</strong> {project.estimatedDuration || 'Not specified'}
        </div>
        <div className="review-item">
          <strong>Participants:</strong> {project.participantCount || 'Not specified'}
        </div>
        {project.startDate && (
          <div className="review-item">
            <strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}
          </div>
        )}
        {project.endDate && (
          <div className="review-item">
            <strong>End Date:</strong> {new Date(project.endDate).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="review-section">
        <h3>Tasks ({project.tasks.length})</h3>
        {project.tasks.length > 0 ? (
          <ol className="review-list">
            {project.tasks.map((task, index) => (
              <li key={task.id}>
                {task.name} <span className="review-meta">({task.category} - Day {task.daysFromStart})</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="review-empty">No tasks added</p>
        )}
      </div>

      <div className="review-section">
        <h3>Resources ({project.resources.length})</h3>
        {project.resources.length > 0 ? (
          <ul className="review-list">
            {project.resources.map((resource, index) => (
              <li key={resource.id}>
                {resource.item} - {resource.quantity} ({resource.cost})
              </li>
            ))}
          </ul>
        ) : (
          <p className="review-empty">No resources added</p>
        )}
      </div>

      <div className="review-section">
        <h3>Impact Metrics ({project.impactMetrics.length})</h3>
        {project.impactMetrics.length > 0 ? (
          <ul className="review-list">
            {project.impactMetrics.map((metric, index) => (
              <li key={metric.id}>{metric.name}</li>
            ))}
          </ul>
        ) : (
          <p className="review-empty">No impact metrics added</p>
        )}
      </div>

      {project.notes && (
        <div className="review-section">
          <h3>Notes</h3>
          <p>{project.notes}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="project-creator-page">
      <div className="creator-header">
        <h1>{isEditMode ? 'Edit Service Project' : 'Create Service Project'}</h1>
        {renderStepIndicator()}
      </div>

      <div className="creator-content">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      <div className="creator-actions">
        <button className="btn-secondary" onClick={handleCancel}>
          Cancel
        </button>
        <div className="nav-buttons">
          {currentStep > 1 && (
            <button className="btn-secondary" onClick={prevStep}>
              ← Previous
            </button>
          )}
          {currentStep < 4 ? (
            <button
              className="btn-primary"
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Next →
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSave}>
              {isEditMode ? 'Save Changes' : 'Create Project'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCreatorPage;
