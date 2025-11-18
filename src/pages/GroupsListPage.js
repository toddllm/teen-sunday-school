import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useSmallGroups } from '../contexts/SmallGroupContext';
import './GroupsListPage.css';

function GroupsListPage() {
  const navigate = useNavigate();
  const { currentUser, isUserSetup, setupUser } = useUser();
  const { getMyGroups, getGroupStats, deleteGroup, isGroupLeader } = useSmallGroups();
  const [showUserSetup, setShowUserSetup] = useState(!isUserSetup());
  const [userName, setUserName] = useState('');

  const handleUserSetup = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setupUser(userName.trim());
      setShowUserSetup(false);
    }
  };

  if (showUserSetup) {
    return (
      <div className="groups-list-page">
        <div className="user-setup-container">
          <div className="user-setup-card">
            <h2>Welcome to Small Groups!</h2>
            <p>Please enter your name to get started:</p>
            <form onSubmit={handleUserSetup}>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name"
                className="user-name-input"
                autoFocus
                required
              />
              <button type="submit" className="btn btn-primary">
                Get Started
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const myGroups = getMyGroups();

  const handleDeleteGroup = (groupId, groupName) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${groupName}"? This will remove all members, plans, and messages.`
      )
    ) {
      deleteGroup(groupId);
    }
  };

  return (
    <div className="groups-list-page">
      <div className="container">
        <div className="groups-header">
          <div>
            <h1>My Groups</h1>
            {currentUser && (
              <p className="user-greeting">Welcome, {currentUser.name}!</p>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/groups/create')}
          >
            + Create Group
          </button>
        </div>

        {myGroups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h2>No Groups Yet</h2>
            <p>
              Create a group to start Bible study with friends and family, or ask
              a group leader for an invite link.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/groups/create')}
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="groups-grid">
            {myGroups.map((group) => {
              const stats = getGroupStats(group.id);
              const isLeader = isGroupLeader(group.id);

              return (
                <div key={group.id} className="group-card">
                  <div className="group-card-header">
                    <h3>{group.name}</h3>
                    {isLeader && <span className="leader-badge">Leader</span>}
                  </div>

                  {group.description && (
                    <p className="group-description">{group.description}</p>
                  )}

                  <div className="group-stats">
                    <div className="stat">
                      <span className="stat-icon">👥</span>
                      <span className="stat-value">{stats.memberCount}</span>
                      <span className="stat-label">Members</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">💬</span>
                      <span className="stat-value">{stats.messageCount}</span>
                      <span className="stat-label">Messages</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">📖</span>
                      <span className="stat-value">{stats.planCount}</span>
                      <span className="stat-label">Plans</span>
                    </div>
                  </div>

                  <div className="group-card-actions">
                    <Link to={`/groups/${group.id}`} className="btn btn-primary">
                      View Group
                    </Link>
                    {isLeader && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                        title="Delete Group"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupsListPage;
