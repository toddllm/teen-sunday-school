import React, { useState } from 'react';
import { useComments } from '../contexts/CommentContext';
import { useUser } from '../contexts/UserContext';
import './CommentsSection.css';

const Comment = ({ comment, onReply, onReport, onDelete }) => {
  const { getReplies, likeComment } = useComments();
  const { currentUser, isAdmin, isLeader } = useUser();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);

  const replies = getReplies(comment.id);
  const canModerate = isAdmin() || isLeader();
  const isOwnComment = currentUser?.id === comment.userId;

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyForm(false);
      setShowReplies(true);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="comment">
      <div className="comment-header">
        <span className="comment-author">{comment.userName}</span>
        <span className="comment-date">{formatDate(comment.createdAt)}</span>
        {comment.updatedAt !== comment.createdAt && (
          <span className="comment-edited">(edited)</span>
        )}
      </div>
      <div className="comment-content">{comment.content}</div>
      <div className="comment-actions">
        <button
          className="comment-action-btn"
          onClick={() => likeComment(comment.id)}
          disabled={comment.isDeleted}
        >
          👍 {comment.likes > 0 && comment.likes}
        </button>
        <button
          className="comment-action-btn"
          onClick={() => setShowReplyForm(!showReplyForm)}
          disabled={comment.isDeleted}
        >
          Reply
        </button>
        {!comment.isDeleted && !isOwnComment && (
          <button
            className="comment-action-btn report-btn"
            onClick={() => onReport(comment.id)}
          >
            Report
          </button>
        )}
        {canModerate && !comment.isDeleted && (
          <button
            className="comment-action-btn delete-btn"
            onClick={() => onDelete(comment.id)}
          >
            Delete
          </button>
        )}
      </div>

      {showReplyForm && (
        <form className="reply-form" onSubmit={handleReplySubmit}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows="2"
            required
          />
          <div className="reply-form-actions">
            <button type="button" onClick={() => setShowReplyForm(false)}>
              Cancel
            </button>
            <button type="submit">Reply</button>
          </div>
        </form>
      )}

      {replies.length > 0 && (
        <div className="comment-replies">
          <button
            className="toggle-replies-btn"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? '▼' : '▶'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </button>
          {showReplies && (
            <div className="replies-list">
              {replies.map(reply => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onReport={onReport}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CommentsSection = ({ lessonId }) => {
  const { addComment, getCommentsByLesson, deleteComment } = useComments();
  const { currentUser } = useUser();
  const [newComment, setNewComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCommentId, setReportCommentId] = useState(null);

  const comments = getCommentsByLesson(lessonId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() && currentUser) {
      addComment(lessonId, currentUser.id, currentUser.name, newComment);
      setNewComment('');
    }
  };

  const handleReply = (parentId, content) => {
    if (currentUser) {
      addComment(lessonId, currentUser.id, currentUser.name, content, parentId);
    }
  };

  const handleReport = (commentId) => {
    setReportCommentId(commentId);
    setShowReportModal(true);
  };

  const handleDelete = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteComment(commentId);
    }
  };

  if (!currentUser) {
    return (
      <div className="comments-section">
        <p>Please select a user to view and post comments.</p>
      </div>
    );
  }

  return (
    <div className="comments-section">
      <h3>Discussion ({comments.filter(c => !c.isDeleted).length})</h3>

      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts on this lesson..."
          rows="3"
          required
        />
        <button type="submit">Post Comment</button>
      </form>

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onReport={handleReport}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {showReportModal && (
        <ReportModal
          commentId={reportCommentId}
          onClose={() => {
            setShowReportModal(false);
            setReportCommentId(null);
          }}
        />
      )}
    </div>
  );
};

const ReportModal = ({ commentId, onClose }) => {
  const { reportComment } = useComments();
  const { currentUser } = useUser();
  const [reason, setReason] = useState('spam');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentUser) {
      reportComment(commentId, currentUser.id, currentUser.name, reason, description);
      alert('Thank you for your report. Our moderators will review it shortly.');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Report Comment</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Reason for reporting:</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} required>
              <option value="spam">Spam</option>
              <option value="abuse">Abusive or harmful</option>
              <option value="off-topic">Off-topic</option>
              <option value="inappropriate">Inappropriate content</option>
            </select>
          </div>
          <div className="form-group">
            <label>Additional details (optional):</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              placeholder="Provide any additional context..."
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary">Submit Report</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentsSection;
