import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScavengerHunts } from '../contexts/ScavengerHuntContext';
import './ScavengerHuntAdminPage.css';

const ScavengerHuntAdminPage = () => {
  const navigate = useNavigate();
  const {
    hunts,
    addHunt,
    updateHunt,
    deleteHunt,
    duplicateHunt,
    getSubmissionsByHunt
  } = useScavengerHunts();

  const [editingHunt, setEditingHunt] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prompts: []
  });

  const [newPrompt, setNewPrompt] = useState({
    verse: '',
    verseReference: '',
    prompt: ''
  });

  const handleCreateNew = () => {
    setFormData({
      title: '',
      description: '',
      prompts: []
    });
    setEditingHunt(null);
    setShowCreateForm(true);
  };

  const handleEdit = (hunt) => {
    setFormData({
      title: hunt.title,
      description: hunt.description,
      prompts: [...hunt.prompts]
    });
    setEditingHunt(hunt);
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingHunt(null);
    setFormData({
      title: '',
      description: '',
      prompts: []
    });
    setNewPrompt({
      verse: '',
      verseReference: '',
      prompt: ''
    });
  };

  const handleAddPrompt = () => {
    if (!newPrompt.verse || !newPrompt.verseReference || !newPrompt.prompt) {
      setMessage('Please fill in all prompt fields!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const prompt = {
      id: `prompt-${Date.now()}`,
      verse: newPrompt.verse.trim(),
      verseReference: newPrompt.verseReference.trim(),
      prompt: newPrompt.prompt.trim()
    };

    setFormData({
      ...formData,
      prompts: [...formData.prompts, prompt]
    });

    setNewPrompt({
      verse: '',
      verseReference: '',
      prompt: ''
    });

    setMessage('✅ Prompt added!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRemovePrompt = (index) => {
    setFormData({
      ...formData,
      prompts: formData.prompts.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    if (!formData.title || !formData.description) {
      setMessage('Please enter a title and description!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (formData.prompts.length === 0) {
      setMessage('Please add at least one prompt!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (editingHunt) {
      updateHunt(editingHunt.id, formData);
      setMessage('✅ Hunt updated successfully!');
    } else {
      addHunt(formData);
      setMessage('✅ Hunt created successfully!');
    }

    setTimeout(() => {
      setMessage('');
      handleCancel();
    }, 1500);
  };

  const handleDelete = (huntId) => {
    if (window.confirm('Are you sure you want to delete this hunt? All submissions will be lost.')) {
      deleteHunt(huntId);
      setMessage('✅ Hunt deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDuplicate = (huntId) => {
    duplicateHunt(huntId);
    setMessage('✅ Hunt duplicated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleToggleActive = (hunt) => {
    updateHunt(hunt.id, { active: !hunt.active });
    setMessage(`✅ Hunt ${!hunt.active ? 'activated' : 'deactivated'}!`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleViewSubmissions = (huntId) => {
    navigate(`/admin/scavenger-hunt/${huntId}/submissions`);
  };

  if (showCreateForm) {
    return (
      <div className="scavenger-hunt-admin-page">
        <div className="admin-header">
          <h1>{editingHunt ? 'Edit' : 'Create'} Scavenger Hunt</h1>
          <div className="header-buttons">
            <button onClick={handleCancel} className="back-btn">
              Cancel
            </button>
            <button onClick={handleSave} className="save-btn">
              {editingHunt ? 'Update Hunt' : 'Create Hunt'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="form-container">
          <div className="form-section">
            <h2>Hunt Details</h2>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Faith in Action"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the scavenger hunt theme..."
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Prompts ({formData.prompts.length})</h2>

            <div className="add-prompt-form">
              <div className="form-group">
                <label htmlFor="verseReference">Verse Reference</label>
                <input
                  type="text"
                  id="verseReference"
                  value={newPrompt.verseReference}
                  onChange={(e) => setNewPrompt({ ...newPrompt, verseReference: e.target.value })}
                  placeholder="e.g., John 3:16"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="verse">Verse Text</label>
                <textarea
                  id="verse"
                  value={newPrompt.verse}
                  onChange={(e) => setNewPrompt({ ...newPrompt, verse: e.target.value })}
                  placeholder="Enter the verse text..."
                  className="form-textarea"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label htmlFor="prompt">Photo Prompt</label>
                <input
                  type="text"
                  id="prompt"
                  value={newPrompt.prompt}
                  onChange={(e) => setNewPrompt({ ...newPrompt, prompt: e.target.value })}
                  placeholder="e.g., Take a photo that represents this verse..."
                  className="form-input"
                />
              </div>

              <button onClick={handleAddPrompt} className="add-prompt-btn">
                Add Prompt
              </button>
            </div>

            <div className="prompts-list">
              {formData.prompts.length === 0 ? (
                <p className="empty-state">No prompts added yet. Add at least one to continue.</p>
              ) : (
                formData.prompts.map((prompt, index) => (
                  <div key={prompt.id} className="prompt-card">
                    <div className="prompt-header">
                      <h3>Prompt {index + 1}</h3>
                      <button
                        onClick={() => handleRemovePrompt(index)}
                        className="remove-btn"
                        title="Remove prompt"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="prompt-reference"><strong>{prompt.verseReference}</strong></p>
                    <p className="prompt-verse">"{prompt.verse}"</p>
                    <p className="prompt-instruction">{prompt.prompt}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scavenger-hunt-admin-page">
      <div className="admin-header">
        <h1>Scavenger Hunt Management</h1>
        <div className="header-buttons">
          <button onClick={() => navigate('/admin')} className="back-btn">
            Back to Admin
          </button>
          <button onClick={handleCreateNew} className="create-btn">
            Create New Hunt
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="hunts-list">
        {hunts.length === 0 ? (
          <div className="empty-state-large">
            <h2>No Scavenger Hunts Yet</h2>
            <p>Create your first verse-based photo scavenger hunt!</p>
            <button onClick={handleCreateNew} className="create-btn-large">
              Create Your First Hunt
            </button>
          </div>
        ) : (
          hunts.map(hunt => {
            const submissions = getSubmissionsByHunt(hunt.id);
            const approvedCount = submissions.filter(s => s.approved).length;

            return (
              <div key={hunt.id} className="hunt-card">
                <div className="hunt-header">
                  <div>
                    <h2>{hunt.title}</h2>
                    <span className={`status-badge ${hunt.active ? 'active' : 'inactive'}`}>
                      {hunt.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="hunt-actions">
                    <button
                      onClick={() => handleToggleActive(hunt)}
                      className={`toggle-btn ${hunt.active ? 'deactivate' : 'activate'}`}
                      title={hunt.active ? 'Deactivate' : 'Activate'}
                    >
                      {hunt.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(hunt)}
                      className="edit-btn"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(hunt.id)}
                      className="duplicate-btn"
                      title="Duplicate"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(hunt.id)}
                      className="delete-btn"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="hunt-description">{hunt.description}</p>

                <div className="hunt-stats">
                  <div className="stat">
                    <span className="stat-label">Prompts:</span>
                    <span className="stat-value">{hunt.prompts.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Submissions:</span>
                    <span className="stat-value">{submissions.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Approved:</span>
                    <span className="stat-value">{approvedCount}</span>
                  </div>
                </div>

                {submissions.length > 0 && (
                  <button
                    onClick={() => handleViewSubmissions(hunt.id)}
                    className="view-submissions-btn"
                  >
                    View Submissions & Gallery
                  </button>
                )}

                <div className="prompts-preview">
                  <h3>Prompts:</h3>
                  {hunt.prompts.map((prompt, index) => (
                    <div key={prompt.id} className="prompt-preview">
                      <strong>{index + 1}. {prompt.verseReference}:</strong> {prompt.prompt}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ScavengerHuntAdminPage;
