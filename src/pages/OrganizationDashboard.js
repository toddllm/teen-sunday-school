import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrganization } from '../contexts/OrganizationContext';
import { useGroups } from '../contexts/GroupContext';
import { useAuth } from '../contexts/AuthContext';
import './OrganizationDashboard.css';

const OrganizationDashboard = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { getOrganizationById, getOrganizationUsers, isOrgAdmin, ROLES } =
    useOrganization();
  const {
    getOrganizationGroups,
    getGroupMemberCount,
    deleteGroup,
    getOrganizationEngagementStats
  } = useGroups();
  const { currentUser, getUserById } = useAuth();

  const [organization, setOrganization] = useState(null);
  const [groups, setGroups] = useState([]);
  const [engagementStats, setEngagementStats] = useState(null);
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    const org = getOrganizationById(orgId);
    if (org) {
      setOrganization(org);
      loadGroupsAndStats();
    }
  }, [orgId]);

  const loadGroupsAndStats = () => {
    const orgGroups = getOrganizationGroups(orgId);
    setGroups(orgGroups);

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    switch (dateRange) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate = null;
    }

    const stats = getOrganizationEngagementStats(
      orgId,
      startDate ? startDate.toISOString() : null,
      endDate.toISOString()
    );
    setEngagementStats(stats);
  };

  useEffect(() => {
    loadGroupsAndStats();
  }, [dateRange]);

  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      deleteGroup(groupId);
      loadGroupsAndStats();
    }
  };

  const getLeaderName = (leaderId) => {
    if (!leaderId) return 'No leader assigned';
    const leader = getUserById(leaderId);
    return leader ? leader.name : 'Unknown';
  };

  if (!organization) {
    return (
      <div className="organization-dashboard">
        <div className="error-state">
          <h2>Organization not found</h2>
          <Link to="/admin/orgs" className="btn-primary">
            Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  // Check if current user is org admin
  const isAdmin = currentUser && isOrgAdmin(orgId, currentUser.id);

  return (
    <div className="organization-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <Link to="/admin/orgs" className="back-link">
            ← Back to Organizations
          </Link>
          <h1>{organization.name}</h1>
          {organization.contactEmail && (
            <p className="org-contact">{organization.contactEmail}</p>
          )}
        </div>
        <div className="header-right">
          {isAdmin && (
            <Link
              to={`/admin/orgs/${orgId}/groups/create`}
              className="btn-primary"
            >
              Create Group
            </Link>
          )}
        </div>
      </div>

      {/* Engagement Stats Summary */}
      {engagementStats && (
        <div className="stats-section">
          <div className="stats-header">
            <h2>Engagement Overview</h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="date-range-select"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{engagementStats.totalGroups}</div>
              <div className="stat-label">Total Groups</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{engagementStats.activeGroups}</div>
              <div className="stat-label">Active Groups</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{engagementStats.totalMembers}</div>
              <div className="stat-label">Total Members</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{engagementStats.totalActivities}</div>
              <div className="stat-label">Activities</div>
            </div>
          </div>

          {engagementStats.totalActivities > 0 && (
            <div className="activity-breakdown">
              <h3>Activity Breakdown</h3>
              <div className="activity-types">
                {Object.entries(engagementStats.activitiesByType).map(
                  ([type, count]) => (
                    <div key={type} className="activity-type">
                      <span className="activity-name">
                        {type.replace(/_/g, ' ')}
                      </span>
                      <span className="activity-count">{count}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Groups List */}
      <div className="groups-section">
        <h2>Groups ({groups.length})</h2>

        {groups.length === 0 ? (
          <div className="empty-state">
            <p>No groups created yet.</p>
            {isAdmin && (
              <Link
                to={`/admin/orgs/${orgId}/groups/create`}
                className="btn-primary"
              >
                Create First Group
              </Link>
            )}
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map((group) => {
              const memberCount = getGroupMemberCount(group.id);
              const groupStats = engagementStats?.groupStats.find(
                (gs) => gs.groupId === group.id
              );

              return (
                <div key={group.id} className="group-card">
                  <div className="group-header">
                    <h3>{group.name}</h3>
                    {isAdmin && (
                      <div className="group-actions">
                        <Link
                          to={`/admin/orgs/${orgId}/groups/${group.id}`}
                          className="btn-icon"
                          title="Manage Group"
                        >
                          ⚙️
                        </Link>
                        <button
                          className="btn-icon"
                          onClick={() => handleDeleteGroup(group.id)}
                          title="Delete Group"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  {group.description && (
                    <p className="group-description">{group.description}</p>
                  )}

                  <div className="group-info">
                    <div className="info-item">
                      <span className="info-label">Leader:</span>
                      <span className="info-value">
                        {getLeaderName(group.leaderId)}
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Members:</span>
                      <span className="info-value">{memberCount}</span>
                    </div>

                    {group.meetingSchedule && (
                      <div className="info-item">
                        <span className="info-label">Schedule:</span>
                        <span className="info-value">{group.meetingSchedule}</span>
                      </div>
                    )}

                    <div className="info-item">
                      <span className="info-label">Status:</span>
                      <span
                        className={`status-badge ${
                          group.isActive ? 'active' : 'inactive'
                        }`}
                      >
                        {group.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {groupStats && groupStats.totalActivities > 0 && (
                    <div className="group-stats">
                      <div className="mini-stat">
                        <span className="mini-stat-value">
                          {groupStats.totalActivities}
                        </span>
                        <span className="mini-stat-label">Activities</span>
                      </div>
                      <div className="mini-stat">
                        <span className="mini-stat-value">
                          {groupStats.activeMembers}
                        </span>
                        <span className="mini-stat-label">Active Members</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationDashboard;
