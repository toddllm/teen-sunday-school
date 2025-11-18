import React, { createContext, useState, useContext } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const PassageCommentContext = createContext();

export const usePassageComments = () => {
  const context = useContext(PassageCommentContext);
  if (!context) {
    throw new Error(
      'usePassageComments must be used within a PassageCommentProvider'
    );
  }
  return context;
};

export const PassageCommentProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(false);

  // Add a new comment
  const addComment = async (groupId, passageRef, commentText, parentCommentId = null) => {
    if (!currentUser) throw new Error('Must be logged in to comment');

    const newComment = {
      groupId,
      passageRef,
      userId: currentUser.uid,
      text: commentText,
      parentCommentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: [],
      edited: false,
    };

    const docRef = await addDoc(collection(db, 'passageComments'), newComment);

    // Create notification for group members (if not replying to own comment)
    if (parentCommentId) {
      const parentDoc = await getDoc(doc(db, 'passageComments', parentCommentId));
      if (parentDoc.exists() && parentDoc.data().userId !== currentUser.uid) {
        await createNotification(
          parentDoc.data().userId,
          groupId,
          passageRef,
          'reply',
          docRef.id
        );
      }
    } else {
      // New top-level comment - notify group members who have interacted with this passage
      await notifyGroupMembers(groupId, passageRef, currentUser.uid, docRef.id);
    }

    return docRef.id;
  };

  // Update a comment
  const updateComment = async (commentId, newText) => {
    const commentRef = doc(db, 'passageComments', commentId);
    await updateDoc(commentRef, {
      text: newText,
      updatedAt: new Date().toISOString(),
      edited: true,
    });
  };

  // Delete a comment
  const deleteComment = async (commentId) => {
    // First, delete all replies to this comment
    const repliesQuery = query(
      collection(db, 'passageComments'),
      where('parentCommentId', '==', commentId)
    );
    const repliesSnapshot = await getDocs(repliesQuery);

    const deletePromises = repliesSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);

    // Then delete the comment itself
    await deleteDoc(doc(db, 'passageComments', commentId));
  };

  // Like/unlike a comment
  const toggleLike = async (commentId) => {
    if (!currentUser) throw new Error('Must be logged in to like comments');

    const commentRef = doc(db, 'passageComments', commentId);
    const commentDoc = await getDoc(commentRef);

    if (commentDoc.exists()) {
      const likes = commentDoc.data().likes || [];
      const hasLiked = likes.includes(currentUser.uid);

      if (hasLiked) {
        // Unlike
        await updateDoc(commentRef, {
          likes: likes.filter((uid) => uid !== currentUser.uid),
        });
      } else {
        // Like
        await updateDoc(commentRef, {
          likes: [...likes, currentUser.uid],
        });
      }
    }
  };

  // Subscribe to comments for a specific passage in a group
  const subscribeToComments = (groupId, passageRef, callback) => {
    const q = query(
      collection(db, 'passageComments'),
      where('groupId', '==', groupId),
      where('passageRef', '==', passageRef),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(comments);
    });
  };

  // Get comments for a passage (one-time fetch)
  const getComments = async (groupId, passageRef) => {
    const q = query(
      collection(db, 'passageComments'),
      where('groupId', '==', groupId),
      where('passageRef', '==', passageRef),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

  // Get comment count for a passage
  const getCommentCount = async (groupId, passageRef) => {
    const q = query(
      collection(db, 'passageComments'),
      where('groupId', '==', groupId),
      where('passageRef', '==', passageRef)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  };

  // Create notification for a user
  const createNotification = async (
    recipientId,
    groupId,
    passageRef,
    type,
    commentId
  ) => {
    await addDoc(collection(db, 'notifications'), {
      recipientId,
      groupId,
      passageRef,
      commentId,
      type, // 'reply', 'new_comment'
      senderId: currentUser.uid,
      read: false,
      createdAt: new Date().toISOString(),
    });
  };

  // Notify group members who have previously commented on this passage
  const notifyGroupMembers = async (groupId, passageRef, senderId, commentId) => {
    // Get all comments for this passage
    const q = query(
      collection(db, 'passageComments'),
      where('groupId', '==', groupId),
      where('passageRef', '==', passageRef),
      limit(100)
    );

    const snapshot = await getDocs(q);
    const uniqueUserIds = new Set();

    snapshot.docs.forEach((doc) => {
      const userId = doc.data().userId;
      if (userId !== senderId) {
        uniqueUserIds.add(userId);
      }
    });

    // Create notifications for each unique user
    const notificationPromises = Array.from(uniqueUserIds).map((userId) =>
      createNotification(userId, groupId, passageRef, 'new_comment', commentId)
    );

    await Promise.all(notificationPromises);
  };

  // Get notifications for current user
  const getUserNotifications = async () => {
    if (!currentUser) return [];

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', currentUser.uid),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

  // Mark notification as read
  const markNotificationRead = async (notificationId) => {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  };

  // Subscribe to user notifications
  const subscribeToNotifications = (callback) => {
    if (!currentUser) return () => {};

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', currentUser.uid),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(notifications);
    });
  };

  const value = {
    comments,
    loading,
    addComment,
    updateComment,
    deleteComment,
    toggleLike,
    subscribeToComments,
    getComments,
    getCommentCount,
    getUserNotifications,
    markNotificationRead,
    subscribeToNotifications,
  };

  return (
    <PassageCommentContext.Provider value={value}>
      {children}
    </PassageCommentContext.Provider>
  );
};
