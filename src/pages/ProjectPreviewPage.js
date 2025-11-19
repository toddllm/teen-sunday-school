import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useServiceProjects } from '../contexts/ServiceProjectContext';
import './ProjectPreviewPage.css';

const ProjectPreviewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    getProjectById,
    updateTaskStatus,
    addVolunteer,
    removeVolunteer,
    updateProject
  } = useServiceProjects();

  const project = getProjectById(id);
  const [showAddVolunteer, setShowAddVolunteer] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Volunteer'
  });

  if (!project) {
    return (
      <div className="project-preview-page">
        <div className="error-state">
          <h2>Project Not Found</h2>
          <p>The requested service project could not be found.</p>
          <button onClick={() => navigate('/admin/service-projects')}>
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const handleTaskToggle = (taskIndex) => {
    const task = project.tasks[taskIndex];
    updateTaskStatus(project.id, taskIndex, !task.completed);
  };

  const handleAddVolunteer = () => {
    if (newVolunteer.name.trim()) {
      addVolunteer(project.id, {
        id: `volunteer-${Date.now()}`,
        ...newVolunteer,
        joinedAt: new Date().toISOString()
      });
      setNewVolunteer({ name: '', email: '', phone: '', role: 'Volunteer' });
      setShowAddVolunteer(false);
    }
  };

  const handleRemoveVolunteer = (volunteerId) => {
    if (window.confirm('Remove this volunteer from the project?')) {
      removeVolunteer(project.id, volunteerId);
    }
  };

  const handleUpdateMetric = (index, value) => {
    const updatedMetrics = [...project.impactMetrics];
    updatedMetrics[index] = {
      ...updatedMetrics[index],
      value: parseFloat(value) || 0
    };
    updateProject(project.id, { impactMetrics: updatedMetrics });
  };

  const getProgressPercentage = () => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(t => t.completed).length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const getTasksByCategory = () => {
    const categories = {};
    project.tasks.forEach(task => {
      if (!categories[task.category]) {
        categories[task.category] = [];
      }
      categories[task.category].push(task);
    });
    return categories;
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: '#3498db',
      active: '#2ecc71',
      completed: '#95a5a6',
      cancelled: '#e74c3c'
    };
    return colors[status] || '#999';
  };

  const progress = getProgressPercentage();
  const completedTasks = project.tasks?.filter(t => t.completed).length || 0;
  const totalTasks = project.tasks?.length || 0;
  const tasksByCategory = getTasksByCategory();

  return (
    <div className="project-preview-page">
      {/* Header */}
      <div className="preview-header">
        <div className="header-content">
          <button
            className="btn-back"
            onClick={() => navigate('/admin/service-projects')}
          >
            ← Back to Projects
          </button>
          <h1>{project.name}</h1>
          <div className="header-meta">
            <span
              className="status-badge"
              style={{ backgroundColor: getStatusColor(project.status) }}
            >
              {project.status}
            </span>
            {project.category && (
              <span className="category-badge">{project.category}</span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate(`/admin/service-project/edit/${project.id}`)}
          >
            ✏️ Edit Project
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="progress-overview">
        <div className="progress-card">
          <h3>Overall Progress</h3>
          <div className="progress-circle">
            <svg width="120" height="120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--primary-color)"
                strokeWidth="10"
                strokeDasharray={`${progress * 3.14} 314`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="progress-value">{progress}%</div>
          </div>
          <p className="progress-description">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>

        <div className="info-cards">
          <div className="info-card">
            <div className="info-label">Duration</div>
            <div className="info-value">{project.estimatedDuration || 'Not set'}</div>
          </div>
          <div className="info-card">
            <div className="info-label">Participants</div>
            <div className="info-value">{project.participantCount || 'Not set'}</div>
          </div>
          <div className="info-card">
            <div className="info-label">Volunteers</div>
            <div className="info-value">{project.volunteers?.length || 0}</div>
          </div>
          {project.startDate && (
            <div className="info-card">
              <div className="info-label">Start Date</div>
              <div className="info-value">
                {new Date(project.startDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Description */}
      <div className="content-section">
        <h2>Project Description</h2>
        <p className="project-description">{project.description}</p>
      </div>

      {/* Tasks */}
      <div className="content-section">
        <h2>Project Tasks</h2>
        <div className="tasks-container">
          {Object.keys(tasksByCategory).length > 0 ? (
            Object.entries(tasksByCategory).map(([category, tasks]) => (
              <div key={category} className="task-category">
                <h3 className="category-title">{category}</h3>
                <div className="tasks-list">
                  {tasks.map((task, index) => {
                    const taskIndex = project.tasks.indexOf(task);
                    return (
                      <div
                        key={task.id}
                        className={`task-item ${task.completed ? 'completed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleTaskToggle(taskIndex)}
                          className="task-checkbox"
                        />
                        <div className="task-content">
                          <div className="task-name">{task.name}</div>
                          <div className="task-meta">
                            Day {task.daysFromStart}
                            {task.assignedTo && ` • Assigned to: ${task.assignedTo}`}
                          </div>
                        </div>
                        {task.completed && task.completedAt && (
                          <div className="task-completed-date">
                            ✓ {new Date(task.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="empty-message">No tasks defined yet</p>
          )}
        </div>
      </div>

      {/* Resources */}
      {project.resources && project.resources.length > 0 && (
        <div className="content-section">
          <h2>Required Resources</h2>
          <div className="resources-grid">
            {project.resources.map((resource) => (
              <div key={resource.id} className="resource-card">
                <div className="resource-item-name">{resource.item}</div>
                <div className="resource-details">
                  <span className="resource-quantity">{resource.quantity}</span>
                  <span className="resource-cost">{resource.cost}</span>
                </div>
                <div className="resource-status">
                  {resource.acquired ? '✓ Acquired' : 'Needed'}
                </div>
              </div>
            ))}
          </div>
          {project.budget && project.budget.estimated > 0 && (
            <div className="budget-summary">
              <strong>Estimated Budget:</strong> ${project.budget.estimated.toFixed(2)}
            </div>
          )}
        </div>
      )}

      {/* Volunteers */}
      <div className="content-section">
        <div className="section-header">
          <h2>Volunteers</h2>
          <button
            className="btn-primary"
            onClick={() => setShowAddVolunteer(!showAddVolunteer)}
          >
            {showAddVolunteer ? 'Cancel' : '+ Add Volunteer'}
          </button>
        </div>

        {showAddVolunteer && (
          <div className="add-volunteer-form">
            <div className="form-row">
              <input
                type="text"
                placeholder="Name *"
                value={newVolunteer.name}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={newVolunteer.email}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, email: e.target.value })}
              />
            </div>
            <div className="form-row">
              <input
                type="tel"
                placeholder="Phone"
                value={newVolunteer.phone}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, phone: e.target.value })}
              />
              <select
                value={newVolunteer.role}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, role: e.target.value })}
              >
                <option value="Volunteer">Volunteer</option>
                <option value="Team Leader">Team Leader</option>
                <option value="Coordinator">Coordinator</option>
              </select>
            </div>
            <button className="btn-primary" onClick={handleAddVolunteer}>
              Add Volunteer
            </button>
          </div>
        )}

        <div className="volunteers-list">
          {project.volunteers && project.volunteers.length > 0 ? (
            project.volunteers.map((volunteer) => (
              <div key={volunteer.id} className="volunteer-card">
                <div className="volunteer-info">
                  <div className="volunteer-name">{volunteer.name}</div>
                  <div className="volunteer-role">{volunteer.role}</div>
                  {volunteer.email && (
                    <div className="volunteer-contact">{volunteer.email}</div>
                  )}
                  {volunteer.phone && (
                    <div className="volunteer-contact">{volunteer.phone}</div>
                  )}
                </div>
                <button
                  className="btn-remove"
                  onClick={() => handleRemoveVolunteer(volunteer.id)}
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p className="empty-message">No volunteers assigned yet</p>
          )}
        </div>
      </div>

      {/* Impact Metrics */}
      {project.impactMetrics && project.impactMetrics.length > 0 && (
        <div className="content-section">
          <h2>Impact Metrics</h2>
          <div className="metrics-grid">
            {project.impactMetrics.map((metric, index) => (
              <div key={metric.id} className="metric-card">
                <div className="metric-name">{metric.name}</div>
                <input
                  type="number"
                  className="metric-value-input"
                  value={metric.value}
                  onChange={(e) => handleUpdateMetric(index, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {project.notes && (
        <div className="content-section">
          <h2>Notes</h2>
          <div className="notes-content">{project.notes}</div>
        </div>
      )}
    </div>
  );
};

export default ProjectPreviewPage;
