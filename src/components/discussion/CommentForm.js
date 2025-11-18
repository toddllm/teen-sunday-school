import React, { useState } from 'react';
import './CommentForm.css';

function CommentForm({ onSubmit, placeholder = 'Write a comment...', onCancel }) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(text);
      setText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="comment-input"
        rows={3}
        disabled={isSubmitting}
      />
      <div className="comment-form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!text.trim() || isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default CommentForm;
