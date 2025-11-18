import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';

const SmallGroupContext = createContext();

export const useSmallGroups = () => {
  const context = useContext(SmallGroupContext);
  if (!context) {
    throw new Error('useSmallGroups must be used within a SmallGroupProvider');
  }
  return context;
};

export const SmallGroupProvider = ({ children }) => {
  const { currentUser } = useUser();
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]); // All group members across all groups
  const [groupPlans, setGroupPlans] = useState([]); // Group reading plans
  const [messages, setMessages] = useState([]); // All group messages
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedGroups = localStorage.getItem('smallGroups');
      const storedMembers = localStorage.getItem('groupMembers');
      const storedPlans = localStorage.getItem('groupPlans');
      const storedMessages = localStorage.getItem('groupMessages');

      if (storedGroups) setGroups(JSON.parse(storedGroups));
      if (storedMembers) setMembers(JSON.parse(storedMembers));
      if (storedPlans) setGroupPlans(JSON.parse(storedPlans));
      if (storedMessages) setMessages(JSON.parse(storedMessages));
    } catch (error) {
      console.error('Error loading group data:', error);
    }
    setLoading(false);
  }, []);

  // Save groups to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('smallGroups', JSON.stringify(groups));
    }
  }, [groups, loading]);

  // Save members to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('groupMembers', JSON.stringify(members));
    }
  }, [members, loading]);

  // Save plans to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('groupPlans', JSON.stringify(groupPlans));
    }
  }, [groupPlans, loading]);

  // Save messages to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('groupMessages', JSON.stringify(messages));
    }
  }, [messages, loading]);

  // Create a new group
  const createGroup = (name, description = '', orgId = null) => {
    if (!currentUser) {
      throw new Error('Must be logged in to create a group');
    }

    const newGroup = {
      id: `group-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      createdByUserId: currentUser.id,
      createdByUserName: currentUser.name,
      orgId: orgId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGroups((prev) => [...prev, newGroup]);

    // Automatically add creator as a leader
    const leaderMember = {
      id: `member-${Date.now()}`,
      groupId: newGroup.id,
      userId: currentUser.id,
      userName: currentUser.name,
      role: 'leader',
      joinedAt: new Date().toISOString(),
    };

    setMembers((prev) => [...prev, leaderMember]);

    return newGroup;
  };

  // Update a group
  const updateGroup = (groupId, updates) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, ...updates, updatedAt: new Date().toISOString() }
          : group
      )
    );
  };

  // Delete a group
  const deleteGroup = (groupId) => {
    // Remove group
    setGroups((prev) => prev.filter((group) => group.id !== groupId));
    // Remove all members
    setMembers((prev) => prev.filter((member) => member.groupId !== groupId));
    // Remove all plans
    setGroupPlans((prev) => prev.filter((plan) => plan.groupId !== groupId));
    // Remove all messages
    setMessages((prev) => prev.filter((msg) => msg.groupId !== groupId));
  };

  // Add a member to a group
  const addMember = (groupId, userName, role = 'member') => {
    const newMember = {
      id: `member-${Date.now()}`,
      groupId: groupId,
      userId: `user-${userName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      userName: userName.trim(),
      role: role, // 'leader' or 'member'
      joinedAt: new Date().toISOString(),
    };

    setMembers((prev) => [...prev, newMember]);
    return newMember;
  };

  // Remove a member from a group
  const removeMember = (memberId) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  // Update member role
  const updateMemberRole = (memberId, newRole) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  };

  // Get members of a specific group
  const getGroupMembers = (groupId) => {
    return members.filter((member) => member.groupId === groupId);
  };

  // Check if current user is a leader of a group
  const isGroupLeader = (groupId) => {
    if (!currentUser) return false;
    const member = members.find(
      (m) => m.groupId === groupId && m.userId === currentUser.id
    );
    return member?.role === 'leader';
  };

  // Check if current user is a member of a group
  const isGroupMember = (groupId) => {
    if (!currentUser) return false;
    return members.some(
      (m) => m.groupId === groupId && m.userId === currentUser.id
    );
  };

  // Get groups for current user
  const getMyGroups = () => {
    if (!currentUser) return [];
    const myGroupIds = members
      .filter((m) => m.userId === currentUser.id)
      .map((m) => m.groupId);
    return groups.filter((g) => myGroupIds.includes(g.id));
  };

  // Add a reading plan to a group
  const addGroupPlan = (groupId, planId, planName, startDate) => {
    const newPlan = {
      id: `plan-${Date.now()}`,
      groupId: groupId,
      planId: planId,
      planName: planName,
      startDate: startDate,
      createdAt: new Date().toISOString(),
    };

    setGroupPlans((prev) => [...prev, newPlan]);
    return newPlan;
  };

  // Remove a plan from a group
  const removeGroupPlan = (planId) => {
    setGroupPlans((prev) => prev.filter((plan) => plan.id !== planId));
  };

  // Get plans for a specific group
  const getGroupPlans = (groupId) => {
    return groupPlans.filter((plan) => plan.groupId === groupId);
  };

  // Post a message to a group
  const postMessage = (groupId, body, passageRef = null) => {
    if (!currentUser) {
      throw new Error('Must be logged in to post messages');
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      groupId: groupId,
      userId: currentUser.id,
      userName: currentUser.name,
      body: body.trim(),
      passageRef: passageRef,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  // Delete a message
  const deleteMessage = (messageId) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  // Get messages for a specific group
  const getGroupMessages = (groupId, passageRef = null) => {
    let groupMessages = messages.filter((msg) => msg.groupId === groupId);

    if (passageRef) {
      groupMessages = groupMessages.filter((msg) => msg.passageRef === passageRef);
    }

    // Sort by creation date (newest first)
    return groupMessages.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  // Get group by ID
  const getGroupById = (groupId) => {
    return groups.find((g) => g.id === groupId);
  };

  // Generate invite link (in a real app, this would be a shareable URL)
  const generateInviteLink = (groupId) => {
    return `${window.location.origin}/groups/join/${groupId}`;
  };

  // Get group statistics
  const getGroupStats = (groupId) => {
    const groupMembers = getGroupMembers(groupId);
    const groupMessages = getGroupMessages(groupId);
    const plans = getGroupPlans(groupId);

    return {
      memberCount: groupMembers.length,
      leaderCount: groupMembers.filter((m) => m.role === 'leader').length,
      messageCount: groupMessages.length,
      planCount: plans.length,
    };
  };

  const value = {
    groups,
    members,
    groupPlans,
    messages,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    updateMemberRole,
    getGroupMembers,
    isGroupLeader,
    isGroupMember,
    getMyGroups,
    addGroupPlan,
    removeGroupPlan,
    getGroupPlans,
    postMessage,
    deleteMessage,
    getGroupMessages,
    getGroupById,
    generateInviteLink,
    getGroupStats,
  };

  return (
    <SmallGroupContext.Provider value={value}>
      {children}
    </SmallGroupContext.Provider>
  );
};
