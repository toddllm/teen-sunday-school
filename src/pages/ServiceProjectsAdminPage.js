import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServiceProjects } from '../contexts/ServiceProjectContext';
import './ServiceProjectsAdminPage.css';

const ServiceProjectsAdminPage = () => {
  const navigate = useNavigate();
  const {
    projects,
    templates,
    deleteProject,
    duplicateProject,
    updateProject,
    createFromTemplate
  } = useServiceProjects();

  const [filter, setFilter] = useState('all'); // all, planning, active, completed, cancelled
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleCreateFromTemplate = (templateId) => {
    const newProject = createFromTemplate(templateId);
    if (newProject) {
      navigate(`/admin/service-project/edit/${newProject.id}`);
    }
  };

  const handleCreateNew = () => {
    navigate('/admin/service-project/create');
  };

  const handleEdit = (projectId) => {
    navigate(`/admin/service-project/edit/${projectId}`);
  };

  const handlePreview = (projectId) => {
    navigate(`/admin/service-project/preview/${projectId}`);
  };

  const handleDuplicate = (projectId) => {
    const duplicate = duplicateProject(projectId);
    if (duplicate) {
      navigate(`/admin/service-project/edit/${duplicate.id}`);
    }
  };

  const handleDelete = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (window.confirm(`Are you sure you want to delete "${project?.name}"?`)) {
      deleteProject(projectId);
    }
  };

  const handleStatusChange = (projectId, newStatus) => {
    updateProject(projectId, { status: newStatus });
  };

  // Filter projects
  const filteredProjects = projects.filter(project => {
    if (filter !== 'all' && project.status !== filter) return false;
    if (selectedCategory !== 'all' && project.category !== selectedCategory) return false;
    if (searchTerm && !project.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Get unique categories
  const categories = ['all', ...new Set(projects.map(p => p.category).filter(Boolean))];

  // Calculate statistics
  const stats = {
    total: projects.length,
    planning: projects.filter(p => p.status === 'planning').length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalVolunteers: projects.reduce((sum, p) => sum + (p.volunteers?.length || 0), 0),
    totalImpact: projects.filter(p => p.status === 'completed').length
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

  const getProgressPercentage = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(t => t.completed).length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  return (
    <div className="service-projects-admin-page">
      <div className="service-projects-header">
        <h1>Service Project Planner</h1>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            {showTemplates ? 'Hide Templates' : 'Browse Templates'}
          </button>
          <button className="btn-primary" onClick={handleCreateNew}>
            + Create New Project
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.planning}</div>
          <div className="stat-label">In Planning</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalVolunteers}</div>
          <div className="stat-label">Total Volunteers</div>
        </div>
      </div>

      {/* Templates Section */}
      {showTemplates && (
        <div className="templates-section">
          <h2>Project Templates</h2>
          <p className="templates-description">
            Start with a pre-built template to save time. Each template includes tasks, resources, and best practices.
          </p>
          <div className="templates-grid">
            {templates.map(template => (
              <div key={template.id} className="template-card">
                <div className="template-header">
                  <h3>{template.name}</h3>
                  <span className="template-category">{template.category}</span>
                </div>
                <p className="template-description">{template.description}</p>
                <div className="template-meta">
                  <div className="meta-item">
                    <strong>Duration:</strong> {template.estimatedDuration}
                  </div>
                  <div className="meta-item">
                    <strong>Participants:</strong> {template.participantCount}
                  </div>
                  <div className="meta-item">
                    <strong>Tasks:</strong> {template.defaultTasks.length}
                  </div>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => handleCreateFromTemplate(template.id)}
                >
                  Use This Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Category:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="projects-list">
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <h2>No Projects Found</h2>
            <p>
              {projects.length === 0
                ? 'Get started by creating your first service project or using a template.'
                : 'No projects match your current filters.'}
            </p>
            {projects.length === 0 && (
              <button className="btn-primary" onClick={handleCreateNew}>
                Create First Project
              </button>
            )}
          </div>
        ) : (
          filteredProjects.map(project => {
            const progress = getProgressPercentage(project);
            const completedTasks = project.tasks?.filter(t => t.completed).length || 0;
            const totalTasks = project.tasks?.length || 0;

            return (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <div className="project-title-section">
                    <h3>{project.name}</h3>
                    <span
                      className="project-status-badge"
                      style={{ backgroundColor: getStatusColor(project.status) }}
                    >
                      {project.status}
                    </span>
                    {project.category && (
                      <span className="project-category-badge">{project.category}</span>
                    )}
                  </div>
                  <div className="project-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handlePreview(project.id)}
                      title="Preview"
                    >
                      👁️
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(project.id)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDuplicate(project.id)}
                      title="Duplicate"
                    >
                      📋
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleDelete(project.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <p className="project-description">{project.description}</p>

                <div className="project-meta">
                  <div className="meta-item">
                    <strong>Progress:</strong>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {completedTasks}/{totalTasks} tasks ({progress}%)
                    </span>
                  </div>
                  <div className="meta-item">
                    <strong>Volunteers:</strong> {project.volunteers?.length || 0}
                  </div>
                  {project.startDate && (
                    <div className="meta-item">
                      <strong>Start:</strong> {new Date(project.startDate).toLocaleDateString()}
                    </div>
                  )}
                  {project.endDate && (
                    <div className="meta-item">
                      <strong>End:</strong> {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="project-quick-status">
                  <label>Change Status:</label>
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(project.id, e.target.value)}
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ServiceProjectsAdminPage;
