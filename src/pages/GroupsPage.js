import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGroups } from '../contexts/GroupContext';
import { useNavigate } from 'react-router-dom';
import './GroupsPage.css';

function GroupsPage() {
  const { currentUser } = useAuth();
  const { userGroups, createGroup, deleteGroup } = useGroups();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!currentUser) {
    return (
      <div className="container">
        <div className="auth-required">
          <p>Please sign in to view and manage groups.</p>
          <button onClick={() => navigate('/auth')} className="btn btn-primary">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createGroup({
        name: groupName,
        description: groupDescription,
      });

      setGroupName('');
      setGroupDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${groupName}"? This will also delete all comments and data associated with this group.`
      )
    ) {
      try {
        await deleteGroup(groupId);
      } catch (error) {
        console.error('Error deleting group:', error);
        alert('Failed to delete group.');
      }
    }
  };

  const getUserRole = (group) => {
    const member = group.members?.find((m) => m.userId === currentUser.uid);
    return member?.role || 'member';
  };

  return (
    <div className="groups-page container">
      <div className="page-header">
        <h1>My Groups</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? 'Cancel' : '+ Create Group'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-group-form card">
          <h2>Create New Group</h2>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleCreateGroup}>
            <div className="form-group">
              <label htmlFor="group-name">Group Name *</label>
              <input
                id="group-name"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="form-input"
                required
                disabled={loading}
                placeholder="e.g., Youth Bible Study"
              />
            </div>

            <div className="form-group">
              <label htmlFor="group-description">Description</label>
              <textarea
                id="group-description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="form-input"
                rows={3}
                disabled={loading}
                placeholder="Optional description of your group..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Group'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setError('');
                }}
                className="btn btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="groups-list">
        {userGroups.length === 0 ? (
          <div className="no-groups card">
            <p>You're not a member of any groups yet.</p>
            <p>Create a group to start discussing Bible passages with others!</p>
          </div>
        ) : (
          userGroups.map((group) => {
            const userRole = getUserRole(group);
            const isLeader = userRole === 'leader';

            return (
              <div key={group.id} className="group-card card">
                <div className="group-header">
                  <div>
                    <h3>{group.name}</h3>
                    <span className={`role-badge role-${userRole}`}>
                      {userRole}
                    </span>
                  </div>
                  {isLeader && (
                    <button
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className="btn btn-danger btn-small"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {group.description && (
                  <p className="group-description">{group.description}</p>
                )}

                <div className="group-stats">
                  <span>👥 {group.members?.length || 0} members</span>
                  <span>
                    Created {new Date(group.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="group-actions">
                  <button
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="btn btn-outline btn-small"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default GroupsPage;
