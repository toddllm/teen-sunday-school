import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTopics } from '../contexts/TopicContext';
import './TopicsAdminPage.css';

function TopicsAdminPage() {
  const {
    topics,
    categories,
    fetchTopics,
    createTopic,
    updateTopic,
    deleteTopic,
    addVerse,
    deleteVerse,
    getTopicMetrics,
  } = useTopics();

  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [metrics, setMetrics] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    popularityRank: 0,
    isGlobal: true,
    verses: [],
  });

  const [newVerse, setNewVerse] = useState({
    verseRef: '',
    note: '',
  });

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleOpenModal = (topic = null) => {
    if (topic) {
      setEditingTopic(topic);
      setFormData({
        name: topic.name,
        description: topic.description || '',
        category: topic.category || '',
        tags: topic.tags?.join(', ') || '',
        popularityRank: topic.popularityRank || 0,
        isGlobal: topic.isGlobal,
        verses: topic.verses || [],
      });
    } else {
      setEditingTopic(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        tags: '',
        popularityRank: 0,
        isGlobal: true,
        verses: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTopic(null);
    setNewVerse({ verseRef: '', note: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const topicData = {
      ...formData,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      verses: formData.verses.map((v, idx) => ({
        verseRef: v.verseRef,
        note: v.note,
        sortOrder: idx,
      })),
    };

    try {
      if (editingTopic) {
        await updateTopic(editingTopic.id, topicData);
        alert('Topic updated successfully!');
      } else {
        await createTopic(topicData);
        alert('Topic created successfully!');
      }
      handleCloseModal();
      fetchTopics();
    } catch (error) {
      alert('Error saving topic: ' + error.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteTopic(id);
        alert('Topic deleted successfully!');
      } catch (error) {
        alert('Error deleting topic: ' + error.message);
      }
    }
  };

  const handleAddVerse = () => {
    if (!newVerse.verseRef.trim()) {
      alert('Please enter a verse reference');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      verses: [...prev.verses, { ...newVerse }],
    }));

    setNewVerse({ verseRef: '', note: '' });
  };

  const handleRemoveVerse = (index) => {
    setFormData((prev) => ({
      ...prev,
      verses: prev.verses.filter((_, i) => i !== index),
    }));
  };

  const handleLoadMetrics = async (topicId) => {
    try {
      const topicMetrics = await getTopicMetrics(topicId);
      setMetrics((prev) => ({ ...prev, [topicId]: topicMetrics }));
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const filteredTopics =
    selectedCategory === 'all'
      ? topics
      : topics.filter((t) => t.category === selectedCategory);

  return (
    <div className="topics-admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Topic Management</h1>
            <Link to="/admin" className="breadcrumb-link">
              ← Back to Admin Dashboard
            </Link>
          </div>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            + Create New Topic
          </button>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{topics.length}</div>
            <div className="stat-label">Total Topics</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {topics.filter((t) => t.isGlobal).length}
            </div>
            <div className="stat-label">Global Topics</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{categories.length}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>

        <div className="admin-content">
          <div className="content-header">
            <h2>Manage Topics</h2>
            <div className="filter-controls">
              <label>Filter by category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-filter"
              >
                <option value="all">All Topics</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="empty-state">
              <p>No topics found. Create your first topic to get started!</p>
              <button onClick={() => handleOpenModal()} className="btn btn-primary">
                Create Topic
              </button>
            </div>
          ) : (
            <div className="topics-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Verses</th>
                    <th>Views</th>
                    <th>Scope</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTopics.map((topic) => (
                    <tr key={topic.id}>
                      <td className="topic-name-cell">
                        <strong>{topic.name}</strong>
                        {topic.description && (
                          <div className="topic-subtitle">
                            {topic.description.substring(0, 80)}
                            {topic.description.length > 80 ? '...' : ''}
                          </div>
                        )}
                        {topic.tags && topic.tags.length > 0 && (
                          <div className="topic-tags">
                            {topic.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>{topic.category || '-'}</td>
                      <td>{topic._count?.verses || 0}</td>
                      <td>
                        <button
                          onClick={() => handleLoadMetrics(topic.id)}
                          className="btn btn-sm btn-link"
                        >
                          {metrics[topic.id]
                            ? metrics[topic.id].viewCount
                            : 'Load'}
                        </button>
                      </td>
                      <td>
                        <span
                          className={`scope-badge ${
                            topic.isGlobal ? 'global' : 'org'
                          }`}
                        >
                          {topic.isGlobal ? 'Global' : 'Organization'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleOpenModal(topic)}
                          className="btn btn-sm btn-secondary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(topic.id, topic.name)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Topic Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingTopic ? 'Edit Topic' : 'Create New Topic'}</h2>
                <button onClick={handleCloseModal} className="close-btn">
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="4"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="e.g., Relationships, Faith"
                    />
                  </div>

                  <div className="form-group">
                    <label>Popularity Rank</label>
                    <input
                      type="number"
                      value={formData.popularityRank}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          popularityRank: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="faith, prayer, guidance"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isGlobal}
                      onChange={(e) =>
                        setFormData({ ...formData, isGlobal: e.target.checked })
                      }
                    />
                    Global Topic (available to all organizations)
                  </label>
                </div>

                <div className="form-group">
                  <label>Verses</label>
                  <div className="verses-editor">
                    <div className="add-verse">
                      <input
                        type="text"
                        value={newVerse.verseRef}
                        onChange={(e) =>
                          setNewVerse({ ...newVerse, verseRef: e.target.value })
                        }
                        placeholder="Verse reference (e.g., John 3:16)"
                      />
                      <input
                        type="text"
                        value={newVerse.note}
                        onChange={(e) =>
                          setNewVerse({ ...newVerse, note: e.target.value })
                        }
                        placeholder="Optional note"
                      />
                      <button
                        type="button"
                        onClick={handleAddVerse}
                        className="btn btn-sm btn-secondary"
                      >
                        Add
                      </button>
                    </div>

                    {formData.verses.length > 0 && (
                      <div className="verses-list">
                        {formData.verses.map((verse, idx) => (
                          <div key={idx} className="verse-item">
                            <div className="verse-info">
                              <strong>{verse.verseRef}</strong>
                              {verse.note && <span>{verse.note}</span>}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveVerse(idx)}
                              className="btn btn-sm btn-danger"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTopic ? 'Update Topic' : 'Create Topic'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopicsAdminPage;
