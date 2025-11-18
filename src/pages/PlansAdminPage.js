import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlans } from '../contexts/PlanContext';
import './PlansAdminPage.css';

function PlansAdminPage() {
  const { plans, deletePlan, duplicatePlan, publishPlan, archivePlan } = usePlans();
  const [statusFilter, setStatusFilter] = useState('all');

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deletePlan(id);
    }
  };

  const handleDuplicate = (id) => {
    const newId = duplicatePlan(id);
    if (newId) {
      alert('Plan duplicated successfully!');
    }
  };

  const handlePublish = (id, title) => {
    if (window.confirm(`Publish "${title}"? Published plans will be available to all users.`)) {
      publishPlan(id);
    }
  };

  const handleArchive = (id, title) => {
    if (window.confirm(`Archive "${title}"? Archived plans will no longer be visible to users.`)) {
      archivePlan(id);
    }
  };

  const filteredPlans = statusFilter === 'all'
    ? plans
    : plans.filter(plan => plan.status === statusFilter);

  const getStatusBadge = (status) => {
    const badges = {
      draft: { class: 'status-draft', label: 'Draft' },
      published: { class: 'status-published', label: 'Published' },
      archived: { class: 'status-archived', label: 'Archived' }
    };
    return badges[status] || badges.draft;
  };

  return (
    <div className="plans-admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Reading Plan Management</h1>
            <Link to="/admin" className="breadcrumb-link">← Back to Admin Dashboard</Link>
          </div>
          <Link to="/admin/plan/create" className="btn btn-primary">
            + Create New Plan
          </Link>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{plans.length}</div>
            <div className="stat-label">Total Plans</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {plans.filter(p => p.status === 'published').length}
            </div>
            <div className="stat-label">Published</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {plans.filter(p => p.status === 'draft').length}
            </div>
            <div className="stat-label">Drafts</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {plans.reduce((sum, p) => sum + (p.stats?.totalEnrollments || 0), 0)}
            </div>
            <div className="stat-label">Total Enrollments</div>
          </div>
        </div>

        <div className="admin-content">
          <div className="content-header">
            <h2>Manage Plans</h2>
            <div className="filter-controls">
              <label>Filter by status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Plans</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {filteredPlans.length === 0 ? (
            <div className="empty-state">
              <p>
                {statusFilter === 'all'
                  ? 'No reading plans yet. Create your first plan to get started!'
                  : `No ${statusFilter} plans found.`}
              </p>
              <Link to="/admin/plan/create" className="btn btn-primary">
                Create Plan
              </Link>
            </div>
          ) : (
            <div className="plans-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Days</th>
                    <th>Enrollments</th>
                    <th>Completions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map(plan => {
                    const badge = getStatusBadge(plan.status);
                    return (
                      <tr key={plan.id}>
                        <td className="plan-title-cell">
                          <strong>{plan.title}</strong>
                          {plan.description && (
                            <div className="plan-subtitle">{plan.description}</div>
                          )}
                          {plan.tags && plan.tags.length > 0 && (
                            <div className="plan-tags">
                              {plan.tags.map((tag, idx) => (
                                <span key={idx} className="tag">{tag}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${badge.class}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td>{plan.duration} days</td>
                        <td>{plan.days?.length || 0}</td>
                        <td>{plan.stats?.totalEnrollments || 0}</td>
                        <td>{plan.stats?.completions || 0}</td>
                        <td className="actions-cell">
                          <Link
                            to={`/admin/plan/preview/${plan.id}`}
                            className="btn btn-small btn-secondary"
                            title="Preview"
                          >
                            👁️
                          </Link>
                          <Link
                            to={`/admin/plan/edit/${plan.id}`}
                            className="btn btn-small btn-primary"
                            title="Edit"
                          >
                            ✏️
                          </Link>
                          {plan.status === 'draft' && (
                            <button
                              onClick={() => handlePublish(plan.id, plan.title)}
                              className="btn btn-small btn-success"
                              title="Publish"
                            >
                              📤
                            </button>
                          )}
                          {plan.status === 'published' && (
                            <button
                              onClick={() => handleArchive(plan.id, plan.title)}
                              className="btn btn-small btn-warning"
                              title="Archive"
                            >
                              📦
                            </button>
                          )}
                          <button
                            onClick={() => handleDuplicate(plan.id)}
                            className="btn btn-small btn-outline"
                            title="Duplicate"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id, plan.title)}
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
        </div>
      </div>
    </div>
  );
}

export default PlansAdminPage;
