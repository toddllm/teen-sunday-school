import React, { useState } from 'react';
import { getVerseText } from '../../services/bibleAPI';

/**
 * PanelEditor Component
 * Allows editing individual comic panel content
 */
const PanelEditor = ({ panel, panelIndex, onUpdate, onDelete, totalPanels }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerseRefChange = async (e) => {
    const verseRef = e.target.value;
    onUpdate(panelIndex, { ...panel, verseRef });

    // Auto-fetch verse text if reference looks valid
    if (verseRef && verseRef.includes(':')) {
      setLoading(true);
      setError('');
      try {
        const verseData = await getVerseText(verseRef);
        if (verseData && verseData.text) {
          // Auto-populate caption with verse text if caption is empty
          if (!panel.caption) {
            onUpdate(panelIndex, {
              ...panel,
              verseRef,
              caption: verseData.text.substring(0, 150) // Limit to 150 chars
            });
          }
        }
      } catch (err) {
        setError('Could not fetch verse text');
        console.error('Error fetching verse:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCaptionChange = (e) => {
    onUpdate(panelIndex, { ...panel, caption: e.target.value });
  };

  const handleBackgroundColorChange = (e) => {
    onUpdate(panelIndex, { ...panel, backgroundColor: e.target.value });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Panel {panelIndex + 1}</h4>
        {totalPanels > 1 && (
          <button
            onClick={() => onDelete(panelIndex)}
            style={styles.deleteButton}
            title="Delete panel"
          >
            ✕
          </button>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Verse Reference:
          <input
            type="text"
            value={panel.verseRef}
            onChange={handleVerseRefChange}
            placeholder="e.g., John 3:16"
            style={styles.input}
            disabled={loading}
          />
        </label>
        {loading && <span style={styles.loadingText}>Loading verse...</span>}
        {error && <span style={styles.errorText}>{error}</span>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Caption/Text:
          <textarea
            value={panel.caption}
            onChange={handleCaptionChange}
            placeholder="Enter caption or verse text..."
            style={styles.textarea}
            rows={3}
            maxLength={200}
          />
        </label>
        <span style={styles.charCount}>
          {panel.caption.length}/200 characters
        </span>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Background Color:
          <div style={styles.colorInputGroup}>
            <input
              type="color"
              value={panel.backgroundColor}
              onChange={handleBackgroundColorChange}
              style={styles.colorInput}
            />
            <input
              type="text"
              value={panel.backgroundColor}
              onChange={handleBackgroundColorChange}
              style={styles.colorTextInput}
              placeholder="#FFFFFF"
            />
          </div>
        </label>
      </div>

      {/* Future: Image upload/AI generation placeholder */}
      <div style={styles.imageSection}>
        <label style={styles.label}>Image (Coming Soon):</label>
        <div style={styles.imagePlaceholder}>
          <span style={styles.placeholderText}>
            AI-generated images coming soon
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: '#f9f9f9'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333'
  },
  deleteButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  formGroup: {
    marginBottom: '12px'
  },
  label: {
    display: 'block',
    fontWeight: '500',
    fontSize: '14px',
    color: '#555',
    marginBottom: '5px'
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    marginTop: '4px',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    marginTop: '4px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  charCount: {
    fontSize: '12px',
    color: '#666',
    display: 'block',
    marginTop: '4px',
    textAlign: 'right'
  },
  colorInputGroup: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginTop: '4px'
  },
  colorInput: {
    width: '50px',
    height: '40px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  colorTextInput: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px'
  },
  imageSection: {
    marginTop: '12px'
  },
  imagePlaceholder: {
    marginTop: '4px',
    border: '2px dashed #ccc',
    borderRadius: '4px',
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#f5f5f5'
  },
  placeholderText: {
    color: '#999',
    fontSize: '14px',
    fontStyle: 'italic'
  },
  loadingText: {
    fontSize: '12px',
    color: '#007bff',
    marginLeft: '10px'
  },
  errorText: {
    fontSize: '12px',
    color: '#dc3545',
    display: 'block',
    marginTop: '4px'
  }
};

export default PanelEditor;
