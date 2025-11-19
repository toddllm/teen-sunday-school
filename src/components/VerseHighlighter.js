import React, { useState, useEffect } from 'react';
import { useHighlights, HIGHLIGHT_COLORS } from '../contexts/HighlightContext';
import './VerseHighlighter.css';

const VerseHighlighter = ({ verseRef, verseText, onClose }) => {
  const { addHighlight, updateHighlight, deleteHighlight, getHighlightsByVerse, getAllTags } = useHighlights();
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS.YELLOW);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [note, setNote] = useState('');
  const [existingHighlight, setExistingHighlight] = useState(null);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // Get existing highlights for this verse
  useEffect(() => {
    const highlights = getHighlightsByVerse(verseRef);
    if (highlights.length > 0) {
      // Use the first highlight (we allow multiple highlights per verse)
      const highlight = highlights[0];
      setExistingHighlight(highlight);
      setSelectedColor(highlight.color);
      setTags(highlight.tags || []);
      setNote(highlight.note || '');
    }
  }, [verseRef, getHighlightsByVerse]);

  // Get all existing tags for suggestions
  const allTags = getAllTags();
  const tagSuggestions = allTags.filter(tag =>
    tag.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag)
  );

  const handleAddTag = (tag) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (existingHighlight) {
      // Update existing highlight
      updateHighlight(existingHighlight.id, {
        color: selectedColor,
        tags,
        note
      });
    } else {
      // Add new highlight
      addHighlight(verseRef, verseText, selectedColor, tags, note);
    }
    onClose();
  };

  const handleDelete = () => {
    if (existingHighlight && window.confirm('Delete this highlight?')) {
      deleteHighlight(existingHighlight.id);
      onClose();
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  return (
    <div className="verse-highlighter-overlay" onClick={onClose}>
      <div className="verse-highlighter" onClick={(e) => e.stopPropagation()}>
        <div className="highlighter-header">
          <h3>{existingHighlight ? 'Edit Highlight' : 'Add Highlight'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="verse-preview" style={{ backgroundColor: selectedColor }}>
          <div className="verse-text">{verseText}</div>
          <div className="verse-ref">{verseRef}</div>
        </div>

        <div className="highlighter-section">
          <label>Color</label>
          <div className="color-palette">
            {Object.entries(HIGHLIGHT_COLORS).map(([name, color]) => (
              <button
                key={name}
                className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                title={name}
              >
                {selectedColor === color && <span className="checkmark">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="highlighter-section">
          <label>Tags</label>
          <div className="tags-container">
            {tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button onClick={() => handleRemoveTag(tag)}>&times;</button>
              </span>
            ))}
          </div>
          <div className="tag-input-container">
            <input
              type="text"
              placeholder="Add tag (e.g., Encouragement, Promises)..."
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowTagSuggestions(e.target.value.length > 0);
              }}
              onKeyDown={handleTagInputKeyDown}
              onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
            />
            {tagInput && (
              <button className="add-tag-btn" onClick={() => handleAddTag(tagInput)}>
                Add
              </button>
            )}
          </div>
          {showTagSuggestions && tagSuggestions.length > 0 && (
            <div className="tag-suggestions">
              {tagSuggestions.slice(0, 5).map(tag => (
                <button
                  key={tag}
                  className="tag-suggestion"
                  onClick={() => handleAddTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="highlighter-section">
          <label>Note (optional)</label>
          <textarea
            placeholder="Add a personal note or reflection..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows="3"
          />
        </div>

        <div className="highlighter-actions">
          <div>
            {existingHighlight && (
              <button className="delete-btn" onClick={handleDelete}>
                Delete Highlight
              </button>
            )}
          </div>
          <div className="primary-actions">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave}>
              {existingHighlight ? 'Update' : 'Save'} Highlight
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerseHighlighter;
