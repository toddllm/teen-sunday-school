import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePrayer } from '../contexts/PrayerContext';
import { format } from 'date-fns';
import './PrayerDetailPage.css';

const PrayerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getPrayerById,
    addLogEntry,
    markAsAnswered,
    archivePrayer,
    reactivatePrayer,
    deletePrayer,
    updatePrayer
  } = usePrayer();

  const prayer = getPrayerById(id);
  const [newEntry, setNewEntry] = useState('');
  const [showAnsweredForm, setShowAnsweredForm] = useState(false);
  const [answeredNote, setAnsweredNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedCategory, setEditedCategory] = useState('');

  if (!prayer) {
    return (
      <div className="prayer-detail-page">
        <div className="empty-state">
          <h2>Prayer not found</h2>
          <p>This prayer request may have been deleted.</p>
          <Link to="/prayers" className="btn-primary">
            Back to Prayer List
          </Link>
        </div>
      </div>
    );
  }

  const handleAddEntry = (e) => {
    e.preventDefault();
    if (newEntry.trim()) {
      addLogEntry(prayer.id, newEntry.trim());
      setNewEntry('');
    }
  };

  const handleMarkAnswered = (e) => {
    e.preventDefault();
    markAsAnswered(prayer.id, answeredNote.trim());
    setShowAnsweredForm(false);
    setAnsweredNote('');
  };

  const handleArchive = () => {
    if (window.confirm('Archive this prayer? You can reactivate it later.')) {
      archivePrayer(prayer.id);
      navigate('/prayers');
    }
  };

  const handleReactivate = () => {
    reactivatePrayer(prayer.id);
  };

  const handleDelete = () => {
    if (window.confirm('Permanently delete this prayer? This cannot be undone.')) {
      deletePrayer(prayer.id);
      navigate('/prayers');
    }
  };

  const handleStartEdit = () => {
    setEditedTitle(prayer.title);
    setEditedDescription(prayer.description);
    setEditedCategory(prayer.category);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updatePrayer(prayer.id, {
      title: editedTitle.trim(),
      description: editedDescription.trim(),
      category: editedCategory
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle('');
    setEditedDescription('');
    setEditedCategory('');
  };

  const getCategoryColor = (category) => {
    const colors = {
      personal: '#3b82f6',
      family: '#10b981',
      church: '#8b5cf6',
      friends: '#f59e0b',
      world: '#ef4444'
    };
    return colors[category] || '#6b7280';
  };

  const categories = ['personal', 'family', 'church', 'friends', 'world'];

  return (
    <div className="prayer-detail-page">
      <div className="prayer-detail-header">
        <Link to="/prayers" className="back-link">
          ← Back to Prayer List
        </Link>
      </div>

      <div className="prayer-detail-content">
        {/* Prayer Info Card */}
        <div className="prayer-info-card">
          {isEditing ? (
            <div className="prayer-edit-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="form-input"
                  placeholder="Prayer title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="form-textarea"
                  rows={4}
                  placeholder="Prayer details"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value)}
                  className="form-select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="edit-actions">
                <button onClick={handleSaveEdit} className="btn-primary">
                  Save Changes
                </button>
                <button onClick={handleCancelEdit} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="prayer-info-header">
                <span
                  className="prayer-category-badge"
                  style={{ backgroundColor: getCategoryColor(prayer.category) }}
                >
                  {prayer.category}
                </span>
                {prayer.status === 'answered' && (
                  <span className="prayer-answered-badge large">✓ Answered</span>
                )}
                {prayer.status === 'archived' && (
                  <span className="prayer-archived-badge">📦 Archived</span>
                )}
              </div>
              <h1 className="prayer-title-large">{prayer.title}</h1>
              {prayer.description && (
                <p className="prayer-description-large">{prayer.description}</p>
              )}
              <div className="prayer-meta-info">
                <div className="meta-item">
                  <span className="meta-label">Created:</span>
                  <span className="meta-value">
                    {format(new Date(prayer.createdAt), 'MMMM d, yyyy')}
                  </span>
                </div>
                {prayer.answeredAt && (
                  <div className="meta-item">
                    <span className="meta-label">Answered:</span>
                    <span className="meta-value">
                      {format(new Date(prayer.answeredAt), 'MMMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {!isEditing && (
          <div className="prayer-actions">
            {prayer.status === 'active' && (
              <>
                <button onClick={handleStartEdit} className="btn-secondary">
                  Edit Prayer
                </button>
                <button
                  onClick={() => setShowAnsweredForm(!showAnsweredForm)}
                  className="btn-success"
                >
                  Mark as Answered
                </button>
                <button onClick={handleArchive} className="btn-secondary">
                  Archive
                </button>
              </>
            )}
            {prayer.status === 'answered' && (
              <>
                <button onClick={handleReactivate} className="btn-secondary">
                  Reactivate
                </button>
                <button onClick={handleArchive} className="btn-secondary">
                  Archive
                </button>
              </>
            )}
            {prayer.status === 'archived' && (
              <button onClick={handleReactivate} className="btn-primary">
                Reactivate Prayer
              </button>
            )}
            <button onClick={handleDelete} className="btn-danger">
              Delete Prayer
            </button>
          </div>
        )}

        {/* Mark as Answered Form */}
        {showAnsweredForm && prayer.status === 'active' && (
          <form onSubmit={handleMarkAnswered} className="answered-form">
            <h3>Praise God! How was this prayer answered?</h3>
            <textarea
              value={answeredNote}
              onChange={(e) => setAnsweredNote(e.target.value)}
              placeholder="Share how God answered this prayer..."
              rows={4}
              className="form-textarea"
              required
            />
            <div className="form-actions">
              <button type="submit" className="btn-success">
                Mark as Answered
              </button>
              <button
                type="button"
                onClick={() => setShowAnsweredForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Journal Entries */}
        <div className="prayer-journal">
          <h2>Prayer Journal</h2>

          {/* Add Entry Form */}
          {prayer.status === 'active' && (
            <form onSubmit={handleAddEntry} className="add-entry-form">
              <textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder="Add an update, share how God is working, or record thoughts about this prayer..."
                rows={3}
                className="form-textarea"
              />
              <button
                type="submit"
                disabled={!newEntry.trim()}
                className="btn-primary"
              >
                Add Entry
              </button>
            </form>
          )}

          {/* Entries List */}
          {prayer.logEntries && prayer.logEntries.length > 0 ? (
            <div className="entries-list">
              {[...prayer.logEntries].reverse().map((entry) => (
                <div
                  key={entry.id}
                  className={`journal-entry ${entry.type === 'answered' ? 'answered-entry' : ''}`}
                >
                  <div className="entry-header">
                    {entry.type === 'answered' && (
                      <span className="entry-badge">✓ Prayer Answered</span>
                    )}
                    <span className="entry-date">
                      {format(new Date(entry.createdAt), 'MMMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <p className="entry-body">{entry.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-journal">
              <p>No journal entries yet. Add your first entry above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrayerDetailPage;
