import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  listProverbs,
  createProverb,
  updateProverb,
  deleteProverb,
  PROVERB_CATEGORIES,
  DIFFICULTY_LEVELS,
} from '../services/proverbService';
import './ProverbsAdminPage.css';

function ProverbsAdminPage() {
  const [proverbs, setProverbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProverb, setEditingProverb] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    isActive: undefined,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [formData, setFormData] = useState({
    chapter: '',
    verseStart: '',
    verseEnd: '',
    reference: '',
    proverbText: '',
    translation: 'NIV',
    teenTitle: '',
    teenApplication: '',
    modernExample: '',
    discussionPrompt: '',
    category: '',
    difficulty: 'MEDIUM',
    scheduledDate: '',
    isActive: true,
    isPinned: false,
  });

  useEffect(() => {
    loadProverbs();
  }, [filters, pagination.page]);

  const loadProverbs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listProverbs({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setProverbs(data.proverbs);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (err) {
      console.error('Error loading proverbs:', err);
      setError('Failed to load proverbs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const proverbData = {
        ...formData,
        chapter: parseInt(formData.chapter, 10),
        verseStart: parseInt(formData.verseStart, 10),
        verseEnd: formData.verseEnd ? parseInt(formData.verseEnd, 10) : null,
        scheduledDate: formData.scheduledDate || null,
      };

      if (editingProverb) {
        await updateProverb(editingProverb.id, proverbData);
        alert('Proverb updated successfully!');
      } else {
        await createProverb(proverbData);
        alert('Proverb created successfully!');
      }

      resetForm();
      loadProverbs();
    } catch (err) {
      console.error('Error saving proverb:', err);
      alert('Failed to save proverb. Please check all fields and try again.');
    }
  };

  const handleEdit = (proverb) => {
    setEditingProverb(proverb);
    setFormData({
      chapter: proverb.chapter,
      verseStart: proverb.verseStart,
      verseEnd: proverb.verseEnd || '',
      reference: proverb.reference,
      proverbText: proverb.proverbText,
      translation: proverb.translation,
      teenTitle: proverb.teenTitle,
      teenApplication: proverb.teenApplication,
      modernExample: proverb.modernExample || '',
      discussionPrompt: proverb.discussionPrompt || '',
      category: proverb.category || '',
      difficulty: proverb.difficulty,
      scheduledDate: proverb.scheduledDate
        ? new Date(proverb.scheduledDate).toISOString().split('T')[0]
        : '',
      isActive: proverb.isActive,
      isPinned: proverb.isPinned,
    });
    setShowForm(true);
  };

  const handleDelete = async (id, reference) => {
    if (!window.confirm(`Are you sure you want to delete ${reference}?`)) {
      return;
    }

    try {
      await deleteProverb(id);
      alert('Proverb deleted successfully!');
      loadProverbs();
    } catch (err) {
      console.error('Error deleting proverb:', err);
      alert('Failed to delete proverb.');
    }
  };

  const resetForm = () => {
    setFormData({
      chapter: '',
      verseStart: '',
      verseEnd: '',
      reference: '',
      proverbText: '',
      translation: 'NIV',
      teenTitle: '',
      teenApplication: '',
      modernExample: '',
      discussionPrompt: '',
      category: '',
      difficulty: 'MEDIUM',
      scheduledDate: '',
      isActive: true,
      isPinned: false,
    });
    setEditingProverb(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="proverbs-admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Manage Proverbs</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Add New Proverb'}
          </button>
        </div>

        <div className="quick-access">
          <Link to="/admin" className="quick-access-card">
            <div className="quick-access-icon">📚</div>
            <div className="quick-access-content">
              <h3>Back to Admin</h3>
              <p>Return to admin dashboard</p>
            </div>
          </Link>
          <Link to="/today" className="quick-access-card">
            <div className="quick-access-icon">💡</div>
            <div className="quick-access-content">
              <h3>View Today's Proverb</h3>
              <p>See how it looks to users</p>
            </div>
          </Link>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="proverb-form-section">
            <h2>{editingProverb ? 'Edit Proverb' : 'Create New Proverb'}</h2>
            <form onSubmit={handleSubmit} className="proverb-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Chapter *</label>
                  <input
                    type="number"
                    name="chapter"
                    value={formData.chapter}
                    onChange={handleChange}
                    min="1"
                    max="31"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Verse Start *</label>
                  <input
                    type="number"
                    name="verseStart"
                    value={formData.verseStart}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Verse End (optional)</label>
                  <input
                    type="number"
                    name="verseEnd"
                    value={formData.verseEnd}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reference *</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="e.g., Proverbs 3:5-6"
                  required
                />
              </div>

              <div className="form-group">
                <label>Proverb Text *</label>
                <textarea
                  name="proverbText"
                  value={formData.proverbText}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter the full text of the proverb..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Translation</label>
                  <input
                    type="text"
                    name="translation"
                    value={formData.translation}
                    onChange={handleChange}
                    placeholder="NIV"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Teen Title *</label>
                <input
                  type="text"
                  name="teenTitle"
                  value={formData.teenTitle}
                  onChange={handleChange}
                  placeholder="Catchy title for teens (e.g., 'Trust the GPS, Not Your Directions')"
                  required
                />
              </div>

              <div className="form-group">
                <label>Teen Application *</label>
                <textarea
                  name="teenApplication"
                  value={formData.teenApplication}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Explain how this proverb applies to teens' lives..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Modern Example (optional)</label>
                <textarea
                  name="modernExample"
                  value={formData.modernExample}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Provide a contemporary example that teens can relate to..."
                />
              </div>

              <div className="form-group">
                <label>Discussion Prompt (optional)</label>
                <textarea
                  name="discussionPrompt"
                  value={formData.discussionPrompt}
                  onChange={handleChange}
                  rows="2"
                  placeholder="A question to help teens think deeper..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select category...</option>
                    {PROVERB_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                  >
                    {DIFFICULTY_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Scheduled Date (optional)</label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    Active
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isPinned"
                      checked={formData.isPinned}
                      onChange={handleChange}
                    />
                    Pinned
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingProverb ? 'Update Proverb' : 'Create Proverb'}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {PROVERB_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search proverbs..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                isActive: e.target.value === '' ? undefined : e.target.value === 'true'
              }))}
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Proverbs List */}
        <div className="proverbs-list-section">
          {loading ? (
            <div className="loading">Loading proverbs...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : proverbs.length === 0 ? (
            <div className="empty-state">
              <p>No proverbs found. Create your first proverb to get started!</p>
            </div>
          ) : (
            <>
              <div className="proverbs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Teen Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Scheduled</th>
                      <th>Views</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proverbs.map(proverb => (
                      <tr key={proverb.id}>
                        <td className="reference-cell">
                          <strong>{proverb.reference}</strong>
                          {proverb.isPinned && <span className="pinned-badge">📌</span>}
                        </td>
                        <td className="title-cell">{proverb.teenTitle}</td>
                        <td className="category-cell">
                          {proverb.category && (
                            <span className="category-tag">{proverb.category}</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${proverb.isActive ? 'active' : 'inactive'}`}>
                            {proverb.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="date-cell">
                          {proverb.scheduledDate
                            ? new Date(proverb.scheduledDate).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="views-cell">
                          {proverb._count?.views || 0}
                        </td>
                        <td className="actions-cell">
                          <button
                            onClick={() => handleEdit(proverb)}
                            className="btn btn-small btn-primary"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(proverb.id, proverb.reference)}
                            className="btn btn-small btn-danger"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn btn-secondary"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProverbsAdminPage;
