import React, { useState, useEffect } from 'react';
import './NoteForm.css';

const NoteForm = ({ note, verseRef, verseText, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setBody(note.body || '');
      setTags(note.tags ? note.tags.join(', ') : '');
    }
  }, [note]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!body.trim()) {
      alert('Please enter some content for your note.');
      return;
    }

    const noteData = {
      title: title.trim(),
      body: body.trim(),
      verseRef: note?.verseRef || verseRef || null,
      verseText: note?.verseText || verseText || null,
      tags: tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0),
    };

    onSave(noteData);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Formatting helpers
  const insertFormatting = (type) => {
    const textarea = document.getElementById('note-body');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end);
    let newText = body;

    switch (type) {
      case 'bold':
        newText = body.substring(0, start) + `**${selectedText}**` + body.substring(end);
        break;
      case 'italic':
        newText = body.substring(0, start) + `*${selectedText}*` + body.substring(end);
        break;
      case 'bullet':
        newText = body.substring(0, start) + `\n• ${selectedText}` + body.substring(end);
        break;
      default:
        break;
    }

    setBody(newText);
    // Refocus textarea
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = type === 'bold' || type === 'italic'
        ? start + selectedText.length + (type === 'bold' ? 4 : 2)
        : start + selectedText.length + 3;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <div className="note-form-header">
        <h2>{note ? 'Edit Note' : 'New Note'}</h2>
        {(verseRef || note?.verseRef) && (
          <div className="note-form-verse-badge">
            <span className="verse-icon">📖</span>
            <span>{note?.verseRef || verseRef}</span>
          </div>
        )}
      </div>

      {(verseText || note?.verseText) && (
        <div className="note-form-verse-text">
          "{note?.verseText || verseText}"
        </div>
      )}

      <div className="form-group">
        <label htmlFor="note-title">Title (optional)</label>
        <input
          type="text"
          id="note-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your note a title..."
          maxLength={200}
        />
      </div>

      <div className="form-group">
        <label htmlFor="note-body">Your Reflection *</label>
        <div className="formatting-toolbar">
          <button
            type="button"
            className="format-btn"
            onClick={() => insertFormatting('bold')}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => insertFormatting('italic')}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => insertFormatting('bullet')}
            title="Bullet point"
          >
            •
          </button>
        </div>
        <textarea
          id="note-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your thoughts, reflections, prayers, or questions here..."
          rows={10}
          required
        />
        <div className="character-count">
          {body.length} characters
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="note-tags">Tags (optional)</label>
        <input
          type="text"
          id="note-tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="prayer, question, insight (separate with commas)"
        />
        <small className="form-help">
          Add tags to help organize your notes. Separate multiple tags with commas.
        </small>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={handleCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {note ? 'Update Note' : 'Save Note'}
        </button>
      </div>
    </form>
  );
};

export default NoteForm;
