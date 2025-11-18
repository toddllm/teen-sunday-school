import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const GroupContext = createContext();

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
};

export const GroupProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create a new group
  const createGroup = async (groupData) => {
    if (!currentUser) throw new Error('Must be logged in to create a group');

    const newGroup = {
      name: groupData.name,
      description: groupData.description || '',
      createdBy: currentUser.uid,
      createdAt: new Date().toISOString(),
      members: [
        {
          userId: currentUser.uid,
          role: 'leader',
          joinedAt: new Date().toISOString(),
        },
      ],
      memberIds: [currentUser.uid], // For easy querying
    };

    const docRef = await addDoc(collection(db, 'groups'), newGroup);
    return docRef.id;
  };

  // Update group details
  const updateGroup = async (groupId, updates) => {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete a group
  const deleteGroup = async (groupId) => {
    await deleteDoc(doc(db, 'groups', groupId));
  };

  // Add member to group
  const addMember = async (groupId, userIdToAdd, role = 'member') => {
    const groupRef = doc(db, 'groups', groupId);
    const newMember = {
      userId: userIdToAdd,
      role: role,
      joinedAt: new Date().toISOString(),
    };

    await updateDoc(groupRef, {
      members: arrayUnion(newMember),
      memberIds: arrayUnion(userIdToAdd),
    });
  };

  // Remove member from group
  const removeMember = async (groupId, userIdToRemove) => {
    const groupRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (groupDoc.exists()) {
      const members = groupDoc.data().members;
      const memberToRemove = members.find((m) => m.userId === userIdToRemove);

      await updateDoc(groupRef, {
        members: arrayRemove(memberToRemove),
        memberIds: arrayRemove(userIdToRemove),
      });
    }
  };

  // Update member role
  const updateMemberRole = async (groupId, userId, newRole) => {
    const groupRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (groupDoc.exists()) {
      const members = groupDoc.data().members;
      const updatedMembers = members.map((m) =>
        m.userId === userId ? { ...m, role: newRole } : m
      );

      await updateDoc(groupRef, { members: updatedMembers });
    }
  };

  // Get group by ID
  const getGroup = async (groupId) => {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (groupDoc.exists()) {
      return { id: groupDoc.id, ...groupDoc.data() };
    }
    return null;
  };

  // Check if user has role in group
  const hasRole = (group, userId, requiredRole) => {
    if (!group || !userId) return false;

    const member = group.members.find((m) => m.userId === userId);
    if (!member) return false;

    const roleHierarchy = { leader: 3, moderator: 2, member: 1 };
    return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
  };

  // Check if user is group leader
  const isGroupLeader = (group, userId) => {
    return hasRole(group, userId, 'leader');
  };

  // Check if user is moderator or leader
  const canModerate = (group, userId) => {
    return hasRole(group, userId, 'moderator');
  };

  // Load user's groups
  useEffect(() => {
    if (!currentUser) {
      setUserGroups([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'groups'),
      where('memberIds', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserGroups(groups);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const value = {
    userGroups,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    updateMemberRole,
    getGroup,
    hasRole,
    isGroupLeader,
    canModerate,
  };

  return (
    <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
  );
};
