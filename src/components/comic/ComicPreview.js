import React, { useEffect, useState } from 'react';
import { generateComic } from '../../services/comicGeneratorService';

/**
 * ComicPreview Component
 * Displays live preview of the comic storyboard
 */
const ComicPreview = ({
  layoutId,
  panels,
  stylePresetId,
  backgroundColor,
  includeWatermark
}) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const generatePreview = async () => {
      setLoading(true);
      setError('');

      try {
        const dataUrl = await generateComic({
          layoutId,
          panels,
          stylePresetId,
          backgroundColor,
          customizations: {
            includeWatermark
          }
        });

        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error('Error generating preview:', err);
        setError('Failed to generate preview');
      } finally {
        setLoading(false);
      }
    };

    // Only generate if we have panels
    if (panels && panels.length > 0) {
      generatePreview();
    }
  }, [layoutId, panels, stylePresetId, backgroundColor, includeWatermark]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Generating preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div style={styles.container}>
        <div style={styles.placeholderContainer}>
          <p style={styles.placeholderText}>
            Start creating your comic to see a preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Preview</h3>
      <div style={styles.previewWrapper}>
        <img
          src={previewUrl}
          alt="Comic preview"
          style={styles.previewImage}
        />
      </div>
      <p style={styles.hint}>
        Your comic will look like this when exported
      </p>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333'
  },
  previewWrapper: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px'
  },
  previewImage: {
    maxWidth: '100%',
    height: 'auto',
    display: 'block'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '15px'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#666',
    fontSize: '14px'
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    padding: '20px'
  },
  errorText: {
    color: '#dc3545',
    fontSize: '14px',
    textAlign: 'center'
  },
  placeholderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    border: '2px dashed #ddd',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9'
  },
  placeholderText: {
    color: '#999',
    fontSize: '16px',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  hint: {
    marginTop: '10px',
    fontSize: '13px',
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic'
  }
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ComicPreview;
