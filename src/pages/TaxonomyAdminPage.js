import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as taxonomyService from '../services/taxonomyService';
import './TaxonomyAdminPage.css';

const TaxonomyAdminPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Main state
  const [tags, setTags] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedTab, setSelectedTab] = useState('tags'); // 'tags', 'hierarchy', or 'metrics'

  // Tag form state
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagForm, setTagForm] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#4A90E2',
    icon: 'book',
    parentTagId: null,
    isPublic: false,
    order: 0,
  });

  // Search/filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterParentId, setFilterParentId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTags(),
        loadHierarchy(),
        loadMetrics(),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const data = await taxonomyService.listTags();
      setTags(data);
    } catch (err) {
      console.error('Error loading tags:', err);
      throw err;
    }
  };

  const loadHierarchy = async () => {
    try {
      const data = await taxonomyService.getTaxonomyHierarchy();
      setHierarchy(data);
    } catch (err) {
      console.error('Error loading hierarchy:', err);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await taxonomyService.getTagMetricsSummary();
      setMetrics(data);
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  };

  const handleCreateTag = () => {
    setEditingTag(null);
    setTagForm({
      name: '',
      slug: '',
      description: '',
      color: taxonomyService.TAG_COLORS[Math.floor(Math.random() * taxonomyService.TAG_COLORS.length)],
      icon: 'book',
      parentTagId: filterParentId || null,
      isPublic: false,
      order: 0,
    });
    setShowTagForm(true);
  };

  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setTagForm({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      color: tag.color || '#4A90E2',
      icon: tag.icon || 'book',
      parentTagId: tag.parentTagId || null,
      isPublic: tag.isPublic,
      order: tag.order || 0,
    });
    setShowTagForm(true);
  };

  const handleSaveTag = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!tagForm.name.trim()) {
        throw new Error('Tag name is required');
      }

      if (editingTag) {
        // Update existing tag
        await taxonomyService.updateTag(editingTag.id, tagForm);
        setSuccess('Tag updated successfully!');
      } else {
        // Create new tag
        await taxonomyService.createTag(tagForm);
        setSuccess('Tag created successfully!');
      }

      setShowTagForm(false);
      await loadData();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (tagId, tagName) => {
    if (!window.confirm(`Are you sure you want to delete the tag "${tagName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      await taxonomyService.deleteTag(tagId);
      setSuccess('Tag deleted successfully!');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const renderTagIcon = (icon) => {
    // Simple text-based icon representation
    const iconMap = {
      book: '📖',
      heart: '❤️',
      star: '⭐',
      cross: '✝️',
      dove: '🕊️',
      crown: '👑',
      shield: '🛡️',
      light: '💡',
      anchor: '⚓',
      tree: '🌳',
      fire: '🔥',
      water: '💧',
      mountain: '⛰️',
      key: '🔑',
      compass: '🧭',
    };
    return iconMap[icon] || '📌';
  };

  const renderHierarchyTree = (nodes, level = 0) => {
    return nodes.map((node) => (
      <div key={node.id} className="tree-node" style={{ marginLeft: `${level * 20}px` }}>
        <div className="tree-node-content">
          <span className="tree-icon">{renderTagIcon(node.icon)}</span>
          <span className="tree-name" style={{ color: node.color }}>
            {node.name}
          </span>
          <span className="tree-stats">
            ({node._count.taggedLessons} associations, {node._count.childTags} children)
          </span>
          <div className="tree-actions">
            <button onClick={() => handleEditTag(node)} className="edit-btn-small">
              Edit
            </button>
            <button onClick={() => handleDeleteTag(node.id, node.name)} className="delete-btn-small">
              Delete
            </button>
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="tree-children">
            {renderHierarchyTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const filteredTags = tags.filter(tag => {
    const matchesSearch = !searchQuery ||
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterParentId === null || tag.parentTagId === filterParentId;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="taxonomy-admin-page">
        <div className="loading">Loading taxonomy manager...</div>
      </div>
    );
  }

  return (
    <div className="taxonomy-admin-page">
      <div className="page-header">
        <button onClick={() => navigate('/admin')} className="back-button">
          ← Back to Admin
        </button>
        <h1>Tagging Taxonomy Manager</h1>
        <p>Organize content with topics and themes</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className="tabs">
        <button
          className={selectedTab === 'tags' ? 'active' : ''}
          onClick={() => setSelectedTab('tags')}
        >
          All Tags
        </button>
        <button
          className={selectedTab === 'hierarchy' ? 'active' : ''}
          onClick={() => setSelectedTab('hierarchy')}
        >
          Hierarchy View
        </button>
        <button
          className={selectedTab === 'metrics' ? 'active' : ''}
          onClick={() => setSelectedTab('metrics')}
        >
          Usage Metrics
        </button>
      </div>

      {/* Tags Tab */}
      {selectedTab === 'tags' && (
        <div className="tags-tab">
          <div className="tags-header">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button onClick={handleCreateTag} className="create-button">
              + Create Tag
            </button>
          </div>

          <div className="tags-grid">
            {filteredTags.length === 0 ? (
              <div className="empty-state">
                <p>No tags found. Create your first tag to get started!</p>
              </div>
            ) : (
              filteredTags.map((tag) => (
                <div key={tag.id} className="tag-card">
                  <div className="tag-card-header" style={{ borderLeftColor: tag.color }}>
                    <span className="tag-icon">{renderTagIcon(tag.icon)}</span>
                    <h3>{tag.name}</h3>
                  </div>
                  <div className="tag-card-body">
                    {tag.description && <p className="tag-description">{tag.description}</p>}
                    <div className="tag-meta">
                      <span className="tag-slug">/{tag.slug}</span>
                      {tag.isPublic && <span className="tag-badge public">Public</span>}
                      {tag.parentTag && (
                        <span className="tag-badge parent">
                          Parent: {tag.parentTag.name}
                        </span>
                      )}
                    </div>
                    <div className="tag-stats">
                      <span>{tag._count.taggedLessons} associations</span>
                      <span>{tag._count.childTags} children</span>
                    </div>
                  </div>
                  <div className="tag-card-actions">
                    <button onClick={() => handleEditTag(tag)} className="edit-btn">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteTag(tag.id, tag.name)} className="delete-btn">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hierarchy Tab */}
      {selectedTab === 'hierarchy' && (
        <div className="hierarchy-tab">
          <div className="hierarchy-header">
            <h2>Tag Hierarchy</h2>
            <button onClick={handleCreateTag} className="create-button">
              + Create Tag
            </button>
          </div>

          <div className="hierarchy-tree">
            {hierarchy.length === 0 ? (
              <div className="empty-state">
                <p>No tags created yet. Start building your taxonomy!</p>
              </div>
            ) : (
              renderHierarchyTree(hierarchy)
            )}
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {selectedTab === 'metrics' && (
        <div className="metrics-tab">
          {metrics && (
            <>
              <div className="metrics-summary">
                <h2>Summary</h2>
                <div className="summary-grid">
                  <div className="summary-card">
                    <div className="summary-value">{metrics.totalTags}</div>
                    <div className="summary-label">Total Tags</div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-value">{metrics.totalAssociations}</div>
                    <div className="summary-label">Total Associations</div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-value">{metrics.totalUsage}</div>
                    <div className="summary-label">Total Usage Count</div>
                  </div>
                </div>
              </div>

              <div className="metrics-list">
                <h2>Tag Usage Statistics</h2>
                {metrics.summary.length === 0 ? (
                  <p className="empty-state">No usage data yet</p>
                ) : (
                  <table className="metrics-table">
                    <thead>
                      <tr>
                        <th>Tag</th>
                        <th>Slug</th>
                        <th>Usage Count</th>
                        <th>Search Count</th>
                        <th>Associations</th>
                        <th>Child Tags</th>
                        <th>Last Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.summary.map((item) => (
                        <tr key={item.tagId}>
                          <td>
                            <span style={{ color: item.color }}>●</span> {item.tagName}
                          </td>
                          <td className="slug-cell">/{item.slug}</td>
                          <td>{item.usageCount}</td>
                          <td>{item.searchCount}</td>
                          <td>{item.totalAssociations}</td>
                          <td>{item.childTagCount}</td>
                          <td>
                            {item.lastUsedAt
                              ? new Date(item.lastUsedAt).toLocaleDateString()
                              : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tag Form Modal */}
      {showTagForm && (
        <div className="modal-overlay" onClick={() => setShowTagForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTag ? 'Edit Tag' : 'Create New Tag'}</h2>
              <button onClick={() => setShowTagForm(false)} className="close-btn">
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={tagForm.name}
                  onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                  placeholder="e.g., Faith, Prayer, Community"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Slug</label>
                <input
                  type="text"
                  value={tagForm.slug}
                  onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })}
                  placeholder="URL-friendly identifier (auto-generated if empty)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={tagForm.description}
                  onChange={(e) => setTagForm({ ...tagForm, description: e.target.value })}
                  placeholder="Describe what this tag represents..."
                  rows={3}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Color</label>
                  <div className="color-picker">
                    {taxonomyService.TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`color-option ${tagForm.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setTagForm({ ...tagForm, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Icon</label>
                  <select
                    value={tagForm.icon}
                    onChange={(e) => setTagForm({ ...tagForm, icon: e.target.value })}
                    className="form-input"
                  >
                    {taxonomyService.TAG_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {renderTagIcon(icon)} {icon}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Parent Tag (Optional)</label>
                <select
                  value={tagForm.parentTagId || ''}
                  onChange={(e) => setTagForm({ ...tagForm, parentTagId: e.target.value || null })}
                  className="form-input"
                >
                  <option value="">None (Root Tag)</option>
                  {tags
                    .filter((t) => !editingTag || t.id !== editingTag.id)
                    .map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Order</label>
                  <input
                    type="number"
                    value={tagForm.order}
                    onChange={(e) => setTagForm({ ...tagForm, order: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={tagForm.isPublic}
                      onChange={(e) => setTagForm({ ...tagForm, isPublic: e.target.checked })}
                    />
                    <span>Public (visible to all organizations)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowTagForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleSaveTag} disabled={saving} className="save-btn">
                {saving ? 'Saving...' : editingTag ? 'Update Tag' : 'Create Tag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxonomyAdminPage;
