import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGroups } from '../../contexts/GroupContext';
import { usePassageComments } from '../../contexts/PassageCommentContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import CommentForm from './CommentForm';
import './CommentThread.css';

function CommentThread({ comment, replies, onReply, groupId }) {
  const { currentUser } = useAuth();
  const { canModerate } = useGroups();
  const { deleteComment, toggleLike, updateComment } = usePassageComments();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [authorName, setAuthorName] = useState('Loading...');
  const [group, setGroup] = useState(null);

  // Load author name
  useEffect(() => {
    const loadAuthor = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', comment.userId));
        if (userDoc.exists()) {
          setAuthorName(userDoc.data().displayName || 'Anonymous');
        }
      } catch (error) {
        console.error('Error loading author:', error);
        setAuthorName('Anonymous');
      }
    };

    loadAuthor();
  }, [comment.userId]);

  // Load group info for moderation checks
  useEffect(() => {
    const loadGroup = async () => {
      try {
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          setGroup({ id: groupDoc.id, ...groupDoc.data() });
        }
      } catch (error) {
        console.error('Error loading group:', error);
      }
    };

    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

  const handleReply = async (replyText) => {
    await onReply(replyText, comment.id);
    setShowReplyForm(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(comment.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment.');
      }
    }
  };

  const handleLike = async () => {
    try {
      await toggleLike(comment.id);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleEdit = async () => {
    if (isEditing) {
      // Save edit
      try {
        await updateComment(comment.id, editText);
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating comment:', error);
        alert('Failed to update comment.');
      }
    } else {
      // Start editing
      setIsEditing(true);
    }
  };

  const canEdit = currentUser && currentUser.uid === comment.userId;
  const canDelete =
    canEdit || (group && canModerate(group, currentUser?.uid));

  const hasLiked = comment.likes?.includes(currentUser?.uid);
  const likeCount = comment.likes?.length || 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="comment-thread">
      <div className="comment">
        <div className="comment-header">
          <span className="comment-author">{authorName}</span>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
          {comment.edited && <span className="edited-indicator">(edited)</span>}
        </div>

        <div className="comment-body">
          {isEditing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="comment-edit-textarea"
              rows={3}
            />
          ) : (
            <p>{comment.text}</p>
          )}
        </div>

        <div className="comment-actions">
          <button onClick={handleLike} className="action-btn like-btn">
            {hasLiked ? '❤️' : '🤍'} {likeCount > 0 && likeCount}
          </button>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="action-btn"
          >
            💬 Reply
          </button>
          {canEdit && (
            <button onClick={handleEdit} className="action-btn">
              {isEditing ? '💾 Save' : '✏️ Edit'}
            </button>
          )}
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setEditText(comment.text);
              }}
              className="action-btn"
            >
              ❌ Cancel
            </button>
          )}
          {canDelete && (
            <button onClick={handleDelete} className="action-btn delete-btn">
              🗑️ Delete
            </button>
          )}
        </div>

        {showReplyForm && (
          <div className="reply-form">
            <CommentForm
              onSubmit={handleReply}
              placeholder={`Reply to ${authorName}...`}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>

      {replies.length > 0 && (
        <div className="replies">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              replies={[]} // Only one level of nesting
              onReply={onReply}
              groupId={groupId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentThread;
