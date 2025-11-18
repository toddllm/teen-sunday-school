import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmallGroups } from '../contexts/SmallGroupContext';
import './GroupCreatePage.css';

function GroupCreatePage() {
  const navigate = useNavigate();
  const { createGroup } = useSmallGroups();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      const newGroup = createGroup(formData.name, formData.description);
      navigate(`/groups/${newGroup.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create group');
    }
  };

  return (
    <div className="group-create-page">
      <div className="container">
        <div className="create-header">
          <h1>Create a New Group</h1>
          <p>Start a Bible study group with friends and family</p>
        </div>

        <form onSubmit={handleSubmit} className="group-create-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Group Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Youth Bible Study, Family Devotions"
              className="form-input"
              autoFocus
              required
            />
            <small className="form-help">
              Choose a descriptive name for your group
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this group about? When do you meet?"
              className="form-textarea"
              rows="4"
            />
            <small className="form-help">
              Help members understand the purpose and meeting schedule
            </small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/groups')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Group
            </button>
          </div>
        </form>

        <div className="create-info">
          <h3>What happens next?</h3>
          <ul>
            <li>You'll be added as the group leader</li>
            <li>You can invite members using a shareable link</li>
            <li>You can assign reading plans to the group</li>
            <li>Members can discuss passages together</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default GroupCreatePage;
