import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTemplates } from '../contexts/TemplateContext';
import './AdminPage.css';

function TemplatesAdminPage() {
  const { templates, loading, error, deleteTemplate, getTemplateStats } = useTemplates();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const templateStats = await getTemplateStats();
    setStats(templateStats);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteTemplate(id);
        alert('Template deleted successfully!');
        loadStats(); // Refresh stats
      } catch (err) {
        alert('Failed to delete template. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="container">
          <p>Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Lesson Templates</h1>
          <Link to="/admin/templates/create" className="btn btn-primary">
            + Create New Template
          </Link>
        </div>

        <div className="quick-access">
          <Link to="/admin" className="quick-access-card">
            <div className="quick-access-icon">📚</div>
            <div className="quick-access-content">
              <h3>Lessons</h3>
              <p>Manage Sunday School lessons</p>
            </div>
          </Link>
          <Link to="/admin/templates" className="quick-access-card">
            <div className="quick-access-icon">📝</div>
            <div className="quick-access-content">
              <h3>Templates</h3>
              <p>Manage lesson templates (current page)</p>
            </div>
          </Link>
          <Link to="/admin/plans" className="quick-access-card">
            <div className="quick-access-icon">📅</div>
            <div className="quick-access-content">
              <h3>Reading Plans</h3>
              <p>Create and manage Bible reading plans</p>
            </div>
          </Link>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{templates.length}</div>
            <div className="stat-label">Total Templates</div>
          </div>
          {stats && (
            <>
              <div className="stat-card">
                <div className="stat-number">{stats.totalLessonsFromTemplates}</div>
                <div className="stat-label">Lessons Created</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.percentageFromTemplates}%</div>
                <div className="stat-label">From Templates</div>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="error-message" style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33'
          }}>
            {error}
          </div>
        )}

        <div className="admin-content">
          <h2>Manage Templates</h2>
          {templates.length === 0 ? (
            <div className="empty-state">
              <p>No templates yet. Create your first template to speed up lesson creation!</p>
              <Link to="/admin/templates/create" className="btn btn-primary">
                Create Template
              </Link>
            </div>
          ) : (
            <div className="lessons-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Sections</th>
                    <th>Total Time</th>
                    <th>Usage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map(template => {
                    const sections = template.sectionsJson || [];
                    const totalTime = sections.reduce((sum, s) => sum + (s.timeEstimate || 0), 0);
                    const usageCount = template._count?.usageMetrics || 0;

                    return (
                      <tr key={template.id}>
                        <td className="lesson-title-cell">
                          <strong>{template.name}</strong>
                        </td>
                        <td className="scripture-cell">
                          {template.description || 'No description'}
                        </td>
                        <td>{sections.length} sections</td>
                        <td>{totalTime} min</td>
                        <td>
                          <span className="usage-badge" title="Times used">
                            {usageCount} {usageCount === 1 ? 'use' : 'uses'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <Link
                            to={`/admin/templates/edit/${template.id}`}
                            className="btn btn-small btn-primary"
                            title="Edit"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => handleDelete(template.id, template.name)}
                            className="btn btn-small btn-danger"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {stats && stats.mostUsedTemplates && stats.mostUsedTemplates.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3>Most Used Templates</h3>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
                {stats.mostUsedTemplates.map(t => (
                  <div
                    key={t.id}
                    style={{
                      padding: '15px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      minWidth: '200px',
                    }}
                  >
                    <strong>{t.name}</strong>
                    <div style={{ color: '#666', marginTop: '5px' }}>
                      {t.usageCount} {t.usageCount === 1 ? 'use' : 'uses'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplatesAdminPage;
