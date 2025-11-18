import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCollections } from '../contexts/CollectionsContext';
import './CollectionViewPage.css';

function CollectionViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getCollectionById,
    updateCollection,
    removeVerseFromCollection,
    updateVerseNote,
    reorderVerses
  } = useCollections();

  const [collection, setCollection] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', color: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    const coll = getCollectionById(id);
    if (coll) {
      setCollection(coll);
      setEditForm({
        name: coll.name,
        description: coll.description || '',
        color: coll.color || '#4A90E2'
      });
    } else {
      navigate('/collections');
    }
  }, [id, getCollectionById, navigate]);

  const handleSaveEdit = () => {
    updateCollection(id, editForm);
    setCollection({ ...collection, ...editForm });
    setIsEditing(false);
  };

  const handleRemoveVerse = (verseId, reference) => {
    if (window.confirm(`Remove "${reference}" from this collection?`)) {
      removeVerseFromCollection(id, verseId);
      setCollection({
        ...collection,
        verses: collection.verses.filter(v => v.id !== verseId)
      });
    }
  };

  const handleSaveNote = (verseId) => {
    updateVerseNote(id, verseId, noteText);
    setCollection({
      ...collection,
      verses: collection.verses.map(v =>
        v.id === verseId ? { ...v, note: noteText } : v
      )
    });
    setEditingNote(null);
    setNoteText('');
  };

  const handleMoveVerse = (verseId, direction) => {
    const currentIndex = collection.verses.findIndex(v => v.id === verseId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === collection.verses.length - 1)
    ) {
      return;
    }

    const newVerses = [...collection.verses];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newVerses[currentIndex], newVerses[targetIndex]] = [newVerses[targetIndex], newVerses[currentIndex]];

    reorderVerses(id, newVerses);
    setCollection({ ...collection, verses: newVerses });
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

  if (!collection) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="collection-view-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/collections">My Collections</Link>
          <span className="separator">/</span>
          <span>{collection.name}</span>
        </div>

        <div className="collection-header" style={{ borderLeftColor: collection.color }}>
          <div className="collection-header-content">
            <div
              className="collection-color-large"
              style={{ backgroundColor: collection.color }}
            ></div>
            <div className="collection-info">
              {isEditing ? (
                <div className="edit-form">
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Collection name"
                  />
                  <textarea
                    className="form-input"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description (optional)"
                    rows="2"
                  />
                  <div className="color-picker-inline">
                    <label>Color:</label>
                    <div className="color-options">
                      {colorOptions.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          className={`color-option ${editForm.color === color.value ? 'selected' : ''}`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setEditForm({ ...editForm, color: color.value })}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="edit-actions">
                    <button className="btn btn-primary btn-small" onClick={handleSaveEdit}>
                      Save
                    </button>
                    <button className="btn btn-outline btn-small" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1>{collection.name}</h1>
                  {collection.description && <p className="description">{collection.description}</p>}
                  <div className="collection-meta">
                    <span className="verse-count">{collection.verses?.length || 0} verses</span>
                    <span className="date">Created {new Date(collection.createdAt).toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {!isEditing && (
            <div className="collection-header-actions">
              <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                Edit Details
              </button>
              <Link to="/bible" className="btn btn-primary">
                + Add Verses
              </Link>
            </div>
          )}
        </div>

        {collection.verses && collection.verses.length > 0 ? (
          <div className="verses-list">
            {collection.verses.map((verse, index) => (
              <div key={verse.id} className="verse-item">
                <div className="verse-order">
                  <div className="reorder-buttons">
                    <button
                      className="btn-icon"
                      onClick={() => handleMoveVerse(verse.id, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleMoveVerse(verse.id, 'down')}
                      disabled={index === collection.verses.length - 1}
                      title="Move down"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="order-number">{index + 1}</span>
                </div>
                <div className="verse-content">
                  <div className="verse-header">
                    <h3 className="verse-reference">{verse.reference}</h3>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveVerse(verse.id, verse.reference)}
                      title="Remove from collection"
                    >
                      ×
                    </button>
                  </div>
                  {verse.text && (
                    <blockquote className="verse-text">"{verse.text}"</blockquote>
                  )}
                  <div className="verse-footer">
                    <span className="added-date">
                      Added {new Date(verse.addedAt).toLocaleDateString()}
                    </span>
                    {editingNote === verse.id ? (
                      <div className="note-edit">
                        <textarea
                          className="note-input"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add a personal note about this verse..."
                          rows="3"
                          autoFocus
                        />
                        <div className="note-actions">
                          <button
                            className="btn btn-primary btn-small"
                            onClick={() => handleSaveNote(verse.id)}
                          >
                            Save Note
                          </button>
                          <button
                            className="btn btn-outline btn-small"
                            onClick={() => {
                              setEditingNote(null);
                              setNoteText('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {verse.note ? (
                          <div className="verse-note">
                            <p>{verse.note}</p>
                            <button
                              className="btn-link"
                              onClick={() => {
                                setEditingNote(verse.id);
                                setNoteText(verse.note);
                              }}
                            >
                              Edit note
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn-link"
                            onClick={() => {
                              setEditingNote(verse.id);
                              setNoteText('');
                            }}
                          >
                            + Add note
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <h2>No Verses Yet</h2>
            <p>Add verses to this collection from the Bible Tool.</p>
            <Link to="/bible" className="btn btn-primary">
              Browse Bible Verses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectionViewPage;
