import React, { createContext, useContext, useState, useEffect } from 'react';

const GroupContext = createContext();

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups must be used within GroupProvider');
  }
  return context;
};

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupEngagement, setGroupEngagement] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedGroups = localStorage.getItem('sunday-school-groups');
    const storedGroupMembers = localStorage.getItem('sunday-school-group-members');
    const storedGroupEngagement = localStorage.getItem('sunday-school-group-engagement');

    if (storedGroups) {
      setGroups(JSON.parse(storedGroups));
    }

    if (storedGroupMembers) {
      setGroupMembers(JSON.parse(storedGroupMembers));
    }

    if (storedGroupEngagement) {
      setGroupEngagement(JSON.parse(storedGroupEngagement));
    }
  }, []);

  // Save groups to localStorage
  const saveGroups = (grps) => {
    localStorage.setItem('sunday-school-groups', JSON.stringify(grps));
    setGroups(grps);
  };

  // Save group members to localStorage
  const saveGroupMembers = (members) => {
    localStorage.setItem('sunday-school-group-members', JSON.stringify(members));
    setGroupMembers(members);
  };

  // Save group engagement to localStorage
  const saveGroupEngagement = (engagement) => {
    localStorage.setItem('sunday-school-group-engagement', JSON.stringify(engagement));
    setGroupEngagement(engagement);
  };

  // Create new group
  const createGroup = (groupData) => {
    const newGroup = {
      id: `group-${Date.now()}`,
      orgId: groupData.orgId,
      name: groupData.name,
      description: groupData.description || '',
      leaderId: groupData.leaderId || null,
      meetingSchedule: groupData.meetingSchedule || '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedGroups = [...groups, newGroup];
    saveGroups(updatedGroups);

    return newGroup;
  };

  // Update group
  const updateGroup = (groupId, updates) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return group;
    });

    saveGroups(updatedGroups);
    return updatedGroups.find(group => group.id === groupId);
  };

  // Delete group
  const deleteGroup = (groupId) => {
    const updatedGroups = groups.filter(group => group.id !== groupId);
    saveGroups(updatedGroups);

    // Also remove all group members for this group
    const updatedGroupMembers = groupMembers.filter(gm => gm.groupId !== groupId);
    saveGroupMembers(updatedGroupMembers);

    // Remove engagement data
    const updatedEngagement = groupEngagement.filter(ge => ge.groupId !== groupId);
    saveGroupEngagement(updatedEngagement);
  };

  // Get group by ID
  const getGroupById = (groupId) => {
    return groups.find(group => group.id === groupId);
  };

  // Get all groups for an organization
  const getOrganizationGroups = (orgId) => {
    return groups.filter(group => group.orgId === orgId);
  };

  // Get active groups for an organization
  const getActiveOrganizationGroups = (orgId) => {
    return groups.filter(group => group.orgId === orgId && group.isActive);
  };

  // Assign leader to group
  const assignGroupLeader = (groupId, leaderId) => {
    return updateGroup(groupId, { leaderId });
  };

  // Add member to group
  const addMemberToGroup = (groupId, userId) => {
    // Check if member already exists
    const existingMember = groupMembers.find(
      gm => gm.groupId === groupId && gm.userId === userId
    );

    if (existingMember) {
      throw new Error('User already exists in this group');
    }

    const newMember = {
      id: `group-member-${Date.now()}`,
      groupId,
      userId,
      joinedAt: new Date().toISOString()
    };

    const updatedMembers = [...groupMembers, newMember];
    saveGroupMembers(updatedMembers);

    return newMember;
  };

  // Remove member from group
  const removeMemberFromGroup = (groupId, userId) => {
    const updatedMembers = groupMembers.filter(
      gm => !(gm.groupId === groupId && gm.userId === userId)
    );
    saveGroupMembers(updatedMembers);
  };

  // Get all members for a group
  const getGroupMembers = (groupId) => {
    return groupMembers.filter(gm => gm.groupId === groupId);
  };

  // Get member count for a group
  const getGroupMemberCount = (groupId) => {
    return groupMembers.filter(gm => gm.groupId === groupId).length;
  };

  // Check if user is member of group
  const isGroupMember = (groupId, userId) => {
    return groupMembers.some(
      gm => gm.groupId === groupId && gm.userId === userId
    );
  };

  // Track group engagement
  const trackGroupActivity = (groupId, activityType, metadata = {}) => {
    const newActivity = {
      id: `engagement-${Date.now()}`,
      groupId,
      activityType, // 'lesson_viewed', 'game_played', 'discussion_completed', etc.
      metadata,
      timestamp: new Date().toISOString()
    };

    const updatedEngagement = [...groupEngagement, newActivity];
    saveGroupEngagement(updatedEngagement);

    return newActivity;
  };

  // Get group engagement stats
  const getGroupEngagementStats = (groupId, startDate = null, endDate = null) => {
    let activities = groupEngagement.filter(ge => ge.groupId === groupId);

    // Filter by date range if provided
    if (startDate) {
      activities = activities.filter(a => new Date(a.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      activities = activities.filter(a => new Date(a.timestamp) <= new Date(endDate));
    }

    // Calculate stats
    const stats = {
      totalActivities: activities.length,
      activitiesByType: {},
      lastActivity: activities.length > 0
        ? activities.reduce((latest, current) =>
            new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
          ).timestamp
        : null,
      activeMembers: new Set(activities.map(a => a.metadata?.userId).filter(Boolean)).size
    };

    // Count by activity type
    activities.forEach(activity => {
      stats.activitiesByType[activity.activityType] =
        (stats.activitiesByType[activity.activityType] || 0) + 1;
    });

    return stats;
  };

  // Get organization-wide engagement stats (aggregated from all groups)
  const getOrganizationEngagementStats = (orgId, startDate = null, endDate = null) => {
    const orgGroups = getOrganizationGroups(orgId);
    const orgGroupIds = orgGroups.map(g => g.id);

    let activities = groupEngagement.filter(ge => orgGroupIds.includes(ge.groupId));

    // Filter by date range if provided
    if (startDate) {
      activities = activities.filter(a => new Date(a.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      activities = activities.filter(a => new Date(a.timestamp) <= new Date(endDate));
    }

    // Calculate organization-wide stats
    const stats = {
      totalGroups: orgGroups.length,
      activeGroups: orgGroups.filter(g => g.isActive).length,
      totalMembers: groupMembers.filter(gm => orgGroupIds.includes(gm.groupId)).length,
      totalActivities: activities.length,
      activitiesByType: {},
      groupStats: []
    };

    // Count by activity type
    activities.forEach(activity => {
      stats.activitiesByType[activity.activityType] =
        (stats.activitiesByType[activity.activityType] || 0) + 1;
    });

    // Get stats for each group
    orgGroups.forEach(group => {
      const groupStats = getGroupEngagementStats(group.id, startDate, endDate);
      stats.groupStats.push({
        groupId: group.id,
        groupName: group.name,
        memberCount: getGroupMemberCount(group.id),
        ...groupStats
      });
    });

    return stats;
  };

  // Get groups led by a specific user
  const getGroupsByLeader = (leaderId) => {
    return groups.filter(group => group.leaderId === leaderId);
  };

  // Get groups a user is a member of
  const getUserGroups = (userId) => {
    const userGroupIds = groupMembers
      .filter(gm => gm.userId === userId)
      .map(gm => gm.groupId);

    return groups.filter(group => userGroupIds.includes(group.id));
  };

  const value = {
    groups,
    groupMembers,
    groupEngagement,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupById,
    getOrganizationGroups,
    getActiveOrganizationGroups,
    assignGroupLeader,
    addMemberToGroup,
    removeMemberFromGroup,
    getGroupMembers,
    getGroupMemberCount,
    isGroupMember,
    trackGroupActivity,
    getGroupEngagementStats,
    getOrganizationEngagementStats,
    getGroupsByLeader,
    getUserGroups
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};
