import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrganization } from '../contexts/OrganizationContext';
import { useGroups } from '../contexts/GroupContext';
import { useAuth } from '../contexts/AuthContext';
import './GroupManagementPage.css';

const GroupManagementPage = () => {
  const { orgId, groupId } = useParams();
  const navigate = useNavigate();
  const { getOrganizationById, getOrganizationUsers, addUserToOrganization, ROLES } =
    useOrganization();
  const {
    getGroupById,
    createGroup,
    updateGroup,
    assignGroupLeader,
    addMemberToGroup,
    removeMemberFromGroup,
    getGroupMembers,
    getGroupEngagementStats
  } = useGroups();
  const { currentUser, getAllUsers } = useAuth();

  const [organization, setOrganization] = useState(null);
  const [group, setGroup] = useState(null);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leaderId: '',
    meetingSchedule: '',
    isActive: true
  });
  const [groupMembers, setGroupMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [engagementStats, setEngagementStats] = useState(null);

  useEffect(() => {
    const org = getOrganizationById(orgId);
    if (org) {
      setOrganization(org);
    }

    if (groupId === 'create') {
      setIsNewGroup(true);
    } else if (groupId) {
      const grp = getGroupById(groupId);
      if (grp) {
        setGroup(grp);
        setFormData({
          name: grp.name,
          description: grp.description || '',
          leaderId: grp.leaderId || '',
          meetingSchedule: grp.meetingSchedule || '',
          isActive: grp.isActive
        });
        loadGroupMembers();
        loadEngagementStats();
      }
    }

    loadAvailableUsers();
  }, [orgId, groupId]);

  const loadGroupMembers = () => {
    const members = getGroupMembers(groupId);
    setGroupMembers(members);
  };

  const loadAvailableUsers = () => {
    const allUsers = getAllUsers();
    setAvailableUsers(allUsers);
  };

  const loadEngagementStats = () => {
    const stats = getGroupEngagementStats(groupId);
    setEngagementStats(stats);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isNewGroup) {
      const newGroup = createGroup({
        orgId,
        ...formData
      });
      navigate(`/admin/orgs/${orgId}/groups/${newGroup.id}`);
    } else {
      updateGroup(groupId, formData);
      setGroup({ ...group, ...formData });
    }
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      // First ensure user is part of the organization
      const orgUsers = getOrganizationUsers(orgId);
      const userInOrg = orgUsers.find(ou => ou.userId === selectedUserId);

      if (!userInOrg) {
        // Add user to organization as member
        addUserToOrganization(orgId, selectedUserId, ROLES.MEMBER);
      }

      // Then add to group
      addMemberToGroup(groupId, selectedUserId);
      loadGroupMembers();
      setSelectedUserId('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRemoveMember = (userId) => {
    if (window.confirm('Remove this member from the group?')) {
      removeMemberFromGroup(groupId, userId);
      loadGroupMembers();
    }
  };

  const handleAssignLeader = (userId) => {
    if (window.confirm('Assign this member as group leader?')) {
      assignGroupLeader(groupId, userId);
      setFormData({ ...formData, leaderId: userId });

      // Update user role in organization to group_leader
      const orgUsers = getOrganizationUsers(orgId);
      const userInOrg = orgUsers.find(ou => ou.userId === userId);
      if (!userInOrg) {
        addUserToOrganization(orgId, userId, ROLES.GROUP_LEADER);
      }
    }
  };

  const getUserName = (userId) => {
    const user = availableUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  const getUserEmail = (userId) => {
    const user = availableUsers.find(u => u.id === userId);
    return user ? user.email : '';
  };

  if (!organization) {
    return (
      <div className="group-management-page">
        <div className="error-state">
          <h2>Organization not found</h2>
          <Link to="/admin/orgs" className="btn-primary">
            Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="group-management-page">
      <div className="page-header">
        <div className="header-left">
          <Link to={`/admin/orgs/${orgId}`} className="back-link">
            ← Back to {organization.name}
          </Link>
          <h1>{isNewGroup ? 'Create New Group' : group?.name}</h1>
        </div>
      </div>

      {/* Group Form */}
      <div className="group-form-section">
        <h2>Group Details</h2>
        <form onSubmit={handleSubmit} className="group-form">
          <div className="form-group">
            <label htmlFor="name">Group Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Youth Group A"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Brief description of the group"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="leaderId">Group Leader</label>
              <select
                id="leaderId"
                name="leaderId"
                value={formData.leaderId}
                onChange={handleChange}
              >
                <option value="">No leader assigned</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="meetingSchedule">Meeting Schedule</label>
              <input
                type="text"
                id="meetingSchedule"
                name="meetingSchedule"
                value={formData.meetingSchedule}
                onChange={handleChange}
                placeholder="e.g., Sundays at 10 AM"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span>Group is active</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {isNewGroup ? 'Create Group' : 'Update Group'}
            </button>
            <Link
              to={`/admin/orgs/${orgId}`}
              className="btn-secondary"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Members Management (only for existing groups) */}
      {!isNewGroup && group && (
        <>
          {/* Engagement Stats */}
          {engagementStats && engagementStats.totalActivities > 0 && (
            <div className="engagement-section">
              <h2>Engagement Stats</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{engagementStats.totalActivities}</div>
                  <div className="stat-label">Total Activities</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{engagementStats.activeMembers}</div>
                  <div className="stat-label">Active Members</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{groupMembers.length}</div>
                  <div className="stat-label">Total Members</div>
                </div>
              </div>

              {engagementStats.lastActivity && (
                <p className="last-activity">
                  Last activity: {new Date(engagementStats.lastActivity).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Members List */}
          <div className="members-section">
            <div className="section-header">
              <h2>Group Members ({groupMembers.length})</h2>
            </div>

            <form onSubmit={handleAddMember} className="add-member-form">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="user-select"
              >
                <option value="">Select a user to add...</option>
                {availableUsers
                  .filter(user => !groupMembers.some(gm => gm.userId === user.id))
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
              </select>
              <button
                type="submit"
                className="btn-primary"
                disabled={!selectedUserId}
              >
                Add Member
              </button>
            </form>

            {groupMembers.length === 0 ? (
              <div className="empty-state">
                <p>No members in this group yet.</p>
              </div>
            ) : (
              <div className="members-list">
                {groupMembers.map(member => {
                  const isLeader = member.userId === formData.leaderId;
                  return (
                    <div key={member.id} className="member-card">
                      <div className="member-info">
                        <div className="member-name">
                          {getUserName(member.userId)}
                          {isLeader && <span className="leader-badge">Leader</span>}
                        </div>
                        <div className="member-email">
                          {getUserEmail(member.userId)}
                        </div>
                        <div className="member-joined">
                          Joined: {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="member-actions">
                        {!isLeader && (
                          <button
                            className="btn-small"
                            onClick={() => handleAssignLeader(member.userId)}
                            title="Make Leader"
                          >
                            Make Leader
                          </button>
                        )}
                        <button
                          className="btn-small btn-danger"
                          onClick={() => handleRemoveMember(member.userId)}
                          title="Remove"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GroupManagementPage;
