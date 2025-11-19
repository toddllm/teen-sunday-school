import React from 'react';
import { format } from 'date-fns';
import './NoteCard.css';

const NoteCard = ({ note, onEdit, onDelete, onClick }) => {
  const formattedDate = format(new Date(note.createdAt), 'MMM d, yyyy');
  const formattedTime = format(new Date(note.createdAt), 'h:mm a');

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(note);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(note);
    }
  };

  // Truncate body text for preview
  const previewText = note.body.length > 200
    ? note.body.substring(0, 200) + '...'
    : note.body;

  return (
    <div className="note-card" onClick={handleClick}>
      <div className="note-card-header">
        <div className="note-card-meta">
          <span className="note-card-date">{formattedDate}</span>
          <span className="note-card-time">{formattedTime}</span>
        </div>
        <div className="note-card-actions">
          <button
            className="note-card-action-btn"
            onClick={handleEdit}
            title="Edit note"
          >
            ✏️
          </button>
          <button
            className="note-card-action-btn"
            onClick={handleDelete}
            title="Delete note"
          >
            🗑️
          </button>
        </div>
      </div>

      {note.verseRef && (
        <div className="note-card-verse-ref">
          <span className="verse-icon">📖</span>
          <span className="verse-ref-text">{note.verseRef}</span>
        </div>
      )}

      {note.title && (
        <h3 className="note-card-title">{note.title}</h3>
      )}

      <div className="note-card-body">
        {previewText}
      </div>

      {note.verseText && (
        <div className="note-card-verse-text">
          "{note.verseText}"
        </div>
      )}

      {note.tags && note.tags.length > 0 && (
        <div className="note-card-tags">
          {note.tags.map((tag, index) => (
            <span key={index} className="note-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {note.updatedAt !== note.createdAt && (
        <div className="note-card-updated">
          Updated {format(new Date(note.updatedAt), 'MMM d, yyyy')}
        </div>
      )}
    </div>
  );
};

export default NoteCard;
