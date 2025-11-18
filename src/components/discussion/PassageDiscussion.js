import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGroups } from '../../contexts/GroupContext';
import { usePassageComments } from '../../contexts/PassageCommentContext';
import CommentThread from './CommentThread';
import CommentForm from './CommentForm';
import './PassageDiscussion.css';

function PassageDiscussion({ passageRef }) {
  const { currentUser } = useAuth();
  const { userGroups } = useGroups();
  const { subscribeToComments, addComment } = usePassageComments();
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPersonalNotes] = useState(false); // For future personal notes feature

  // Set default group when groups load
  useEffect(() => {
    if (userGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(userGroups[0].id);
    }
  }, [userGroups, selectedGroupId]);

  // Subscribe to comments when group or passage changes
  useEffect(() => {
    if (!selectedGroupId || !passageRef) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToComments(
      selectedGroupId,
      passageRef,
      (newComments) => {
        setComments(newComments);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [selectedGroupId, passageRef, subscribeToComments]);

  const handleAddComment = async (commentText, parentCommentId = null) => {
    if (!selectedGroupId) return;

    try {
      await addComment(selectedGroupId, passageRef, commentText, parentCommentId);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  // Organize comments into threads (top-level and replies)
  const topLevelComments = comments.filter((c) => !c.parentCommentId);
  const getReplies = (commentId) =>
    comments.filter((c) => c.parentCommentId === commentId);

  if (!currentUser) {
    return (
      <div className="passage-discussion">
        <div className="discussion-login-prompt">
          <p>Please sign in to view and participate in discussions.</p>
        </div>
      </div>
    );
  }

  if (userGroups.length === 0) {
    return (
      <div className="passage-discussion">
        <div className="no-groups-message">
          <p>
            You're not a member of any groups yet. Join or create a group to
            participate in discussions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="passage-discussion">
      <div className="discussion-header">
        <h3>Discussion</h3>

        {userGroups.length > 1 && (
          <div className="group-selector">
            <label htmlFor="group-select">Group:</label>
            <select
              id="group-select"
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="group-dropdown"
            >
              {userGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="discussion-content">
        {loading ? (
          <div className="loading-message">Loading comments...</div>
        ) : (
          <>
            <CommentForm onSubmit={handleAddComment} placeholder="Add a comment..." />

            <div className="comments-list">
              {topLevelComments.length === 0 ? (
                <p className="no-comments">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                topLevelComments.map((comment) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    replies={getReplies(comment.id)}
                    onReply={handleAddComment}
                    groupId={selectedGroupId}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PassageDiscussion;
