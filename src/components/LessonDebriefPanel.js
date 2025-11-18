import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import lessonDebriefService from '../services/lessonDebriefService';
import './LessonDebriefPanel.css';

function LessonDebriefPanel({ lessonId, lessonTitle }) {
  const { user } = useAuth();
  const [debriefs, setDebriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    authorId: '',
    startDate: '',
    endDate: '',
  });

  // Form state
  const [formData, setFormData] = useState({
    notes: '',
    sessionDate: new Date().toISOString().split('T')[0],
    groupId: '',
  });

  useEffect(() => {
    loadDebriefs();
  }, [lessonId]);

  const loadDebriefs = async () => {
    setLoading(true);
    setError(null);

    const result = await lessonDebriefService.getDebriefs(lessonId, filters);

    if (result.success) {
      setDebriefs(result.debriefs);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.notes.trim()) {
      setError('Please add some notes');
      return;
    }

    setLoading(true);
    setError(null);

    let result;
    if (editingId) {
      result = await lessonDebriefService.updateDebrief(editingId, formData);
    } else {
      result = await lessonDebriefService.createDebrief(lessonId, formData);
    }

    if (result.success) {
      setFormData({ notes: '', sessionDate: new Date().toISOString().split('T')[0], groupId: '' });
      setShowForm(false);
      setEditingId(null);
      loadDebriefs();
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleEdit = (debrief) => {
    setFormData({
      notes: debrief.notes,
      sessionDate: debrief.sessionDate ? debrief.sessionDate.split('T')[0] : '',
      groupId: debrief.groupId || '',
    });
    setEditingId(debrief.id);
    setShowForm(true);
  };

  const handleDelete = async (debriefId) => {
    if (!window.confirm('Are you sure you want to delete this debrief?')) {
      return;
    }

    const result = await lessonDebriefService.deleteDebrief(debriefId);

    if (result.success) {
      loadDebriefs();
    } else {
      setError(result.error);
    }
  };

  const handleCancel = () => {
    setFormData({ notes: '', sessionDate: new Date().toISOString().split('T')[0], groupId: '' });
    setShowForm(false);
    setEditingId(null);
    setError(null);
  };

  const applyFilters = () => {
    loadDebriefs();
  };

  const clearFilters = () => {
    setFilters({ authorId: '', startDate: '', endDate: '' });
  };

  const canEditDebrief = (debrief) => {
    if (!user) return false;
    return debrief.authorId === user.id ||
           user.role === 'TEACHER' ||
           user.role === 'ORG_ADMIN' ||
           user.role === 'SUPER_ADMIN';
  };

  return (
    <div className="lesson-debrief-panel">
      <div className="debrief-header">
        <h3>📋 Lesson Debriefs</h3>
        <p className="debrief-subtitle">
          Capture reflections and notes from teaching this lesson
        </p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary add-debrief-btn"
          disabled={!user}
        >
          + Add Debrief
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="debrief-form">
          <div className="form-group">
            <label htmlFor="sessionDate">Session Date (optional)</label>
            <input
              type="date"
              id="sessionDate"
              value={formData.sessionDate}
              onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes *</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="How did it go? What worked well? What would you change next time?"
              rows="6"
              required
              className="form-control"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingId ? 'Update Debrief' : 'Save Debrief'}
            </button>
          </div>
        </form>
      )}

      {debriefs.length > 0 && (
        <div className="debriefs-section">
          <div className="debriefs-header">
            <h4>Previous Debriefs ({debriefs.length})</h4>
          </div>

          <div className="debriefs-list">
            {debriefs.map((debrief) => (
              <div key={debrief.id} className="debrief-item">
                <div className="debrief-meta">
                  <span className="debrief-author">
                    {debrief.author.firstName} {debrief.author.lastName}
                  </span>
                  <span className="debrief-date">
                    {debrief.sessionDate
                      ? new Date(debrief.sessionDate).toLocaleDateString()
                      : new Date(debrief.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="debrief-notes">{debrief.notes}</div>
                {canEditDebrief(debrief) && (
                  <div className="debrief-actions">
                    <button
                      onClick={() => handleEdit(debrief)}
                      className="btn-link"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(debrief.id)}
                      className="btn-link btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && debriefs.length === 0 && !showForm && (
        <div className="empty-state">
          <p>No debriefs yet. Add one after teaching this lesson!</p>
        </div>
      )}
    </div>
  );
}

export default LessonDebriefPanel;
