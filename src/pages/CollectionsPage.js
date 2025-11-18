import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollections } from '../contexts/CollectionsContext';
import './CollectionsPage.css';

function CollectionsPage() {
  const { collections, addCollection, deleteCollection } = useCollections();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    color: '#4A90E2'
  });

  const filteredCollections = collections.filter(collection => {
    return collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           collection.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateCollection = (e) => {
    e.preventDefault();
    if (newCollection.name.trim()) {
      addCollection(newCollection);
      setNewCollection({ name: '', description: '', color: '#4A90E2' });
      setShowCreateModal(false);
    }
  };

  const handleDeleteCollection = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteCollection(id);
    }
  };

  const colorOptions = [
    { value: '#4A90E2', label: 'Blue' },
    { value: '#50C878', label: 'Green' },
    { value: '#E74C3C', label: 'Red' },
    { value: '#9B59B6', label: 'Purple' },
    { value: '#F39C12', label: 'Orange' },
    { value: '#1ABC9C', label: 'Teal' },
    { value: '#E91E63', label: 'Pink' },
    { value: '#34495E', label: 'Gray' }
  ];

  return (
    <div className="collections-page">
      <div className="container">
        <div className="page-header">
          <h1>My Collections</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + New Collection
          </button>
        </div>

        <div className="filters">
          <input
            type="text"
            className="search-input"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredCollections.length === 0 ? (
          <div className="empty-state">
            {collections.length === 0 ? (
              <>
                <div className="empty-icon">📚</div>
                <h2>No Collections Yet</h2>
                <p>Create your first collection to organize your favorite Bible verses!</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Your First Collection
                </button>
              </>
            ) : (
              <>
                <p>No collections found matching your search.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn btn-outline"
                >
                  Clear Search
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="collections-grid">
            {filteredCollections.map(collection => (
              <div
                key={collection.id}
                className="collection-card"
                style={{ borderLeftColor: collection.color }}
              >
                <div className="collection-card-header">
                  <div
                    className="collection-color-indicator"
                    style={{ backgroundColor: collection.color }}
                  ></div>
                  <span className="collection-count">
                    {collection.verses?.length || 0} verses
                  </span>
                </div>
                <h3>{collection.name}</h3>
                {collection.description && (
                  <p className="collection-description">{collection.description}</p>
                )}
                {collection.verses && collection.verses.length > 0 && (
                  <div className="collection-preview">
                    {collection.verses.slice(0, 2).map((verse, idx) => (
                      <div key={idx} className="verse-preview">
                        <span className="verse-reference">{verse.reference}</span>
                      </div>
                    ))}
                    {collection.verses.length > 2 && (
                      <span className="more-verses">+{collection.verses.length - 2} more</span>
                    )}
                  </div>
                )}
                <div className="collection-card-actions">
                  <Link
                    to={`/collections/${collection.id}`}
                    className="btn btn-primary btn-small"
                  >
                    View Collection
                  </Link>
                  <button
                    onClick={() => handleDeleteCollection(collection.id, collection.name)}
                    className="btn btn-outline btn-small"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Collection</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleCreateCollection}>
                <div className="form-group">
                  <label htmlFor="collection-name">Collection Name *</label>
                  <input
                    id="collection-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Encouragement, Prayer, Teaching Series"
                    value={newCollection.name}
                    onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="collection-description">Description (optional)</label>
                  <textarea
                    id="collection-description"
                    className="form-input"
                    placeholder="What's this collection about?"
                    rows="3"
                    value={newCollection.description}
                    onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="collection-color">Color</label>
                  <div className="color-picker">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        className={`color-option ${newCollection.color === color.value ? 'selected' : ''}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setNewCollection({ ...newCollection, color: color.value })}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Collection
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

export default CollectionsPage;
