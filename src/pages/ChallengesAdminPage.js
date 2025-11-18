import React, { useState, useEffect } from 'react';
import { useChallenges } from '../contexts/ChallengeContext';
import challengeAPI from '../services/challengeAPI';
import './ChallengesAdminPage.css';

const ChallengesAdminPage = () => {
  const { CHALLENGE_TYPES, CHALLENGE_TYPE_LABELS, formatDateRange } = useChallenges();

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groupChallenges, setGroupChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: CHALLENGE_TYPES.CHAPTERS_READ,
    targetValue: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    celebrationMessage: '',
    showIndividualProgress: true,
    allowLateJoins: true,
  });

  // Load groups on mount
  useEffect(() => {
    loadGroups();
  }, []);

  // Load challenges when group is selected
  useEffect(() => {
    if (selectedGroup) {
      loadGroupChallenges(selectedGroup);
    }
  }, [selectedGroup]);

  const loadGroups = async () => {
    try {
      const data = await challengeAPI.getMyGroups();
      setGroups(data || []);
      if (data && data.length > 0) {
        setSelectedGroup(data[0].id);
      }
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  };

  const loadGroupChallenges = async (groupId) => {
    try {
      setLoading(true);
      const data = await challengeAPI.getGroupChallenges(groupId);
      setGroupChallenges(data || []);
    } catch (err) {
      console.error('Error loading challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGroup) {
      alert('Please select a group');
      return;
    }

    try {
      setLoading(true);
      await challengeAPI.createChallenge(selectedGroup, formData);
      alert('Challenge created successfully!');
      setShowCreateForm(false);
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: CHALLENGE_TYPES.CHAPTERS_READ,
        targetValue: 100,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        celebrationMessage: '',
        showIndividualProgress: true,
        allowLateJoins: true,
      });
      // Reload challenges
      await loadGroupChallenges(selectedGroup);
    } catch (err) {
      alert(`Failed to create challenge: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm('Are you sure you want to delete this challenge? This cannot be undone.')) {
      return;
    }

    try {
      await challengeAPI.deleteChallenge(challengeId);
      alert('Challenge deleted successfully');
      await loadGroupChallenges(selectedGroup);
    } catch (err) {
      alert(`Failed to delete challenge: ${err.message}`);
    }
  };

  return (
    <div className="challenges-admin-page">
      <div className="admin-header">
        <h1>Manage Team Challenges</h1>
        <p>Create and manage challenges for your groups</p>
      </div>

      <div className="admin-controls">
        <div className="group-selector">
          <label htmlFor="group-select">Select Group:</label>
          <select
            id="group-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="group-select"
          >
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-button"
        >
          {showCreateForm ? 'Cancel' : '+ Create New Challenge'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-challenge-form">
          <h2>Create New Challenge</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Challenge Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Read 100 Chapters Together"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description of the challenge"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Challenge Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  {Object.entries(CHALLENGE_TYPES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {CHALLENGE_TYPE_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="targetValue">Target Goal *</label>
                <input
                  type="number"
                  id="targetValue"
                  name="targetValue"
                  value={formData.targetValue}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  min={formData.startDate}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="celebrationMessage">Celebration Message (when completed)</label>
              <textarea
                id="celebrationMessage"
                name="celebrationMessage"
                value={formData.celebrationMessage}
                onChange={handleInputChange}
                placeholder="e.g., Amazing job team! You completed the challenge!"
                rows="2"
              />
            </div>

            <div className="form-group-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="showIndividualProgress"
                  checked={formData.showIndividualProgress}
                  onChange={handleInputChange}
                />
                <span>Show individual contributions</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="allowLateJoins"
                  checked={formData.allowLateJoins}
                  onChange={handleInputChange}
                />
                <span>Allow participants to join after start date</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Creating...' : 'Create Challenge'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="challenges-list">
        <h2>Existing Challenges</h2>
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : groupChallenges.length === 0 ? (
          <div className="empty-message">
            No challenges yet. Create one to get started!
          </div>
        ) : (
          <div className="challenges-table">
            {groupChallenges.map(challenge => (
              <div key={challenge.id} className="challenge-row">
                <div className="challenge-info">
                  <h3>{challenge.name}</h3>
                  <div className="challenge-meta">
                    <span className="challenge-type-badge">
                      {CHALLENGE_TYPE_LABELS[challenge.type]}
                    </span>
                    <span className="challenge-dates">
                      {formatDateRange(challenge.startDate, challenge.endDate)}
                    </span>
                    <span className={`challenge-status-badge ${challenge.status.toLowerCase()}`}>
                      {challenge.status}
                    </span>
                  </div>
                  <div className="challenge-progress-info">
                    Progress: {challenge.metrics?.totalProgress || 0} / {challenge.targetValue}
                    ({Math.round(challenge.metrics?.progressPercentage || 0)}%)
                  </div>
                </div>
                <div className="challenge-actions">
                  <button
                    onClick={() => handleDeleteChallenge(challenge.id)}
                    className="delete-button"
                    disabled={challenge._count?.contributions > 0}
                    title={
                      challenge._count?.contributions > 0
                        ? 'Cannot delete challenge with contributions'
                        : 'Delete challenge'
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesAdminPage;
