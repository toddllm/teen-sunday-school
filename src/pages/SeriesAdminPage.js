import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSeries } from '../contexts/SeriesContext';
import { useAuth } from '../contexts/AuthContext';
import './SeriesAdminPage.css';

function SeriesAdminPage() {
  const { series, loading, deleteSeries, getSeriesMetrics } = useSeries();
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [filter, setFilter] = useState({ isActive: true });

  // Check permissions
  const canManage = hasRole('TEACHER') || hasRole('ORG_ADMIN') || hasRole('SUPER_ADMIN');

  useEffect(() => {
    if (canManage) {
      getSeriesMetrics().then(setMetrics);
    }
  }, [canManage, getSeriesMetrics]);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteSeries(id);
        alert('Series deleted successfully!');
      } catch (error) {
        alert(`Failed to delete series: ${error.message}`);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/series/edit/${id}`);
  };

  if (!canManage) {
    return (
      <div className="series-admin-page">
        <div className="container">
          <div className="error-message">
            <h2>Access Denied</h2>
            <p>You don't have permission to manage series.</p>
            <Link to="/" className="btn btn-primary">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="series-admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Manage Series</h1>
          <Link to="/admin/series/create" className="btn btn-primary">
            + Create New Series
          </Link>
        </div>

        {metrics && (
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-number">{metrics.totalSeries}</div>
              <div className="stat-label">Total Series</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{metrics.activeSeries}</div>
              <div className="stat-label">Active Series</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{metrics.totalCompletions}</div>
              <div className="stat-label">Total Completions</div>
            </div>
          </div>
        )}

        <div className="filter-section">
          <label>
            <input
              type="checkbox"
              checked={filter.isActive}
              onChange={(e) => setFilter({ ...filter, isActive: e.target.checked })}
            />
            Show Active Only
          </label>
        </div>

        <div className="admin-content">
          <h2>All Series</h2>
          {loading ? (
            <div className="loading">Loading series...</div>
          ) : series.length === 0 ? (
            <div className="empty-state">
              <p>No series yet. Create your first series to get started!</p>
              <Link to="/admin/series/create" className="btn btn-primary">
                Create Series
              </Link>
            </div>
          ) : (
            <div className="series-grid">
              {series
                .filter((s) => !filter.isActive || s.isActive)
                .map((s) => (
                  <div key={s.id} className="series-card">
                    {s.thumbnailUrl && (
                      <div className="series-thumbnail">
                        <img src={s.thumbnailUrl} alt={s.title} />
                      </div>
                    )}
                    <div className="series-card-content">
                      <h3>{s.title}</h3>
                      {s.subtitle && <p className="series-subtitle">{s.subtitle}</p>}
                      {s.description && (
                        <p className="series-description">
                          {s.description.substring(0, 150)}
                          {s.description.length > 150 && '...'}
                        </p>
                      )}
                      <div className="series-meta">
                        <span className="series-lesson-count">
                          {s._count?.lessons || 0} lessons
                        </span>
                        {s.tags && s.tags.length > 0 && (
                          <div className="series-tags">
                            {s.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {s.ageMin && s.ageMax && (
                        <div className="series-age">
                          Ages {s.ageMin}-{s.ageMax}
                        </div>
                      )}
                      <div className="series-status">
                        <span className={`status-badge ${s.isActive ? 'active' : 'inactive'}`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {s.isPublic && <span className="status-badge public">Public</span>}
                      </div>
                      <div className="series-card-actions">
                        <button
                          onClick={() => navigate(`/series/${s.id}`)}
                          className="btn btn-secondary btn-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(s.id)}
                          className="btn btn-primary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.title)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {metrics && metrics.seriesStats && metrics.seriesStats.length > 0 && (
          <div className="series-metrics">
            <h2>Series Performance</h2>
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Series</th>
                  <th>Lessons</th>
                  <th>Completions</th>
                  <th>Unique Users</th>
                  <th>Avg Completion</th>
                </tr>
              </thead>
              <tbody>
                {metrics.seriesStats.map((stat) => (
                  <tr key={stat.seriesId}>
                    <td>{stat.title}</td>
                    <td>{stat.totalLessons}</td>
                    <td>{stat.totalCompletions}</td>
                    <td>{stat.uniqueUsers}</td>
                    <td>{stat.avgCompletionRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeriesAdminPage;
