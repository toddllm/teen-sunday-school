import React, { useState, useEffect } from 'react';
import { getVerseText } from '../services/bibleAPI';
import {
  templates,
  fontOptions,
  alignmentOptions,
  generateImage,
  downloadImage,
  copyImageToClipboard,
  shareImage,
  saveImageToStorage,
  getSavedImages,
  deleteSavedImage
} from '../services/imageGeneratorService';
import './QuoteImageGeneratorPage.css';

const QuoteImageGeneratorPage = () => {

  // State for verse input
  const [verseReference, setVerseReference] = useState('');
  const [verseText, setVerseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for template and customization
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [customizations, setCustomizations] = useState({
    fontSize: 32,
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
    includeWatermark: false
  });

  // State for generated image
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for saved images gallery
  const [savedImages, setSavedImages] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  // State for export feedback
  const [exportMessage, setExportMessage] = useState('');

  // Load saved images on mount
  useEffect(() => {
    setSavedImages(getSavedImages());
  }, []);

  // Auto-clear export messages
  useEffect(() => {
    if (exportMessage) {
      const timer = setTimeout(() => setExportMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [exportMessage]);

  // Fetch verse text
  const handleFetchVerse = async () => {
    if (!verseReference.trim()) {
      setError('Please enter a verse reference');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const text = await getVerseText(verseReference.trim());
      if (text) {
        setVerseText(text);
        setError('');
      } else {
        setError('Verse not found. Please check the reference.');
      }
    } catch (err) {
      setError('Failed to fetch verse. Please try again.');
      console.error('Error fetching verse:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key in verse input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFetchVerse();
    }
  };

  // Generate image
  const handleGenerateImage = async () => {
    if (!verseText) {
      setError('Please fetch a verse first');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const dataUrl = await generateImage({
        verseText,
        verseReference,
        template: selectedTemplate,
        customizations
      });

      setGeneratedImageUrl(dataUrl);
    } catch (err) {
      setError('Failed to generate image. Please try again.');
      console.error('Error generating image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on changes
  useEffect(() => {
    if (verseText) {
      const debounce = setTimeout(() => {
        handleGenerateImage();
      }, 500);
      return () => clearTimeout(debounce);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verseText, selectedTemplate, customizations]);

  // Download image
  const handleDownload = () => {
    if (!generatedImageUrl) return;

    const filename = `${verseReference.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    downloadImage(generatedImageUrl, filename);
    setExportMessage('✓ Image downloaded!');
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!generatedImageUrl) return;

    try {
      await copyImageToClipboard(generatedImageUrl);
      setExportMessage('✓ Image copied to clipboard!');
    } catch (err) {
      setExportMessage('✗ Failed to copy. Try downloading instead.');
    }
  };

  // Share via native share
  const handleShare = async () => {
    if (!generatedImageUrl) return;

    try {
      await shareImage(generatedImageUrl, verseReference);
      setExportMessage('✓ Image shared!');
    } catch (err) {
      if (err.message === 'Web Share API not supported') {
        setExportMessage('✗ Sharing not supported on this device');
      } else {
        setExportMessage('✗ Failed to share');
      }
    }
  };

  // Save image to gallery
  const handleSave = () => {
    if (!generatedImageUrl) return;

    saveImageToStorage({
      verseText,
      verseReference,
      templateId: selectedTemplate.id,
      dataUrl: generatedImageUrl,
      customizations
    });

    setSavedImages(getSavedImages());
    setExportMessage('✓ Image saved to gallery!');
  };

  // Delete saved image
  const handleDeleteSaved = (imageId) => {
    deleteSavedImage(imageId);
    setSavedImages(getSavedImages());
  };

  // Load saved image
  const handleLoadSaved = (savedImage) => {
    setVerseText(savedImage.verseText);
    setVerseReference(savedImage.verseReference);
    const template = templates.find(t => t.id === savedImage.templateId) || templates[0];
    setSelectedTemplate(template);
    setCustomizations(savedImage.customizations || customizations);
    setGeneratedImageUrl(savedImage.dataUrl);
    setShowGallery(false);
  };

  // Use example verse
  const handleUseExample = () => {
    setVerseReference('John 3:16');
    setVerseText('For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.');
  };

  return (
    <div className="quote-image-generator">
      <div className="generator-header">
        <h1>📷 Quote Image Generator</h1>
        <p>Create beautiful shareable images from Bible verses</p>
      </div>

      {/* Gallery Toggle */}
      <div className="gallery-toggle">
        <button
          className="btn-secondary"
          onClick={() => setShowGallery(!showGallery)}
        >
          {showGallery ? '← Back to Editor' : `📁 My Gallery (${savedImages.length})`}
        </button>
      </div>

      {showGallery ? (
        /* Gallery View */
        <div className="gallery-view">
          <h2>Saved Images</h2>
          {savedImages.length === 0 ? (
            <div className="empty-gallery">
              <p>No saved images yet. Create your first verse image!</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {savedImages.map((img) => (
                <div key={img.id} className="gallery-item card">
                  <img src={img.dataUrl} alt={img.verseReference} />
                  <div className="gallery-item-info">
                    <p className="gallery-reference">{img.verseReference}</p>
                    <div className="gallery-actions">
                      <button
                        className="btn-small btn-primary"
                        onClick={() => handleLoadSaved(img)}
                      >
                        Load
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => handleDeleteSaved(img.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Editor View */
        <div className="editor-view">
          {/* Step 1: Verse Input */}
          <div className="editor-section card">
            <h2>1. Enter Verse Reference</h2>
            <div className="verse-input-group">
              <input
                type="text"
                placeholder="e.g., John 3:16, Psalm 23:1, Isaiah 40:31"
                value={verseReference}
                onChange={(e) => setVerseReference(e.target.value)}
                onKeyPress={handleKeyPress}
                className="verse-input"
              />
              <button
                onClick={handleFetchVerse}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Loading...' : 'Fetch Verse'}
              </button>
            </div>
            <button
              onClick={handleUseExample}
              className="btn-outline btn-small"
              style={{ marginTop: '10px' }}
            >
              Use Example Verse
            </button>

            {error && <div className="error-message">{error}</div>}

            {verseText && (
              <div className="verse-preview">
                <p className="verse-text">{verseText}</p>
                <p className="verse-ref">— {verseReference}</p>
              </div>
            )}
          </div>

          {/* Step 2: Template Selection */}
          {verseText && (
            <div className="editor-section card">
              <h2>2. Choose Template</h2>
              <div className="template-grid">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`template-card ${
                      selectedTemplate.id === template.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div
                      className="template-preview"
                      style={{
                        background:
                          template.background.type === 'gradient'
                            ? `linear-gradient(to bottom, ${template.background.colors[0]}, ${template.background.colors[1]})`
                            : template.background.color
                      }}
                    >
                      <span style={{ color: template.fontPreset.color }}>Aa</span>
                    </div>
                    <p className="template-name">{template.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Customization */}
          {verseText && (
            <div className="editor-section card">
              <h2>3. Customize</h2>
              <div className="customization-controls">
                <div className="control-group">
                  <label>Font Family</label>
                  <select
                    value={customizations.fontFamily}
                    onChange={(e) =>
                      setCustomizations({
                        ...customizations,
                        fontFamily: e.target.value
                      })
                    }
                  >
                    {fontOptions.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <label>Font Size: {customizations.fontSize}px</label>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    value={customizations.fontSize}
                    onChange={(e) =>
                      setCustomizations({
                        ...customizations,
                        fontSize: parseInt(e.target.value)
                      })
                    }
                  />
                </div>

                <div className="control-group">
                  <label>Text Alignment</label>
                  <select
                    value={customizations.textAlign}
                    onChange={(e) =>
                      setCustomizations({
                        ...customizations,
                        textAlign: e.target.value
                      })
                    }
                  >
                    {alignmentOptions.map((align) => (
                      <option key={align.value} value={align.value}>
                        {align.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={customizations.includeWatermark}
                      onChange={(e) =>
                        setCustomizations({
                          ...customizations,
                          includeWatermark: e.target.checked
                        })
                      }
                    />
                    Include watermark
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {generatedImageUrl && (
            <div className="editor-section card">
              <h2>4. Preview & Export</h2>

              {isGenerating && (
                <div className="generating-message">Generating image...</div>
              )}

              <div className="image-preview">
                <img src={generatedImageUrl} alt="Generated verse" />
              </div>

              {/* Export Buttons */}
              <div className="export-actions">
                <button onClick={handleDownload} className="btn-primary">
                  ⬇ Download
                </button>
                <button onClick={handleCopy} className="btn-secondary">
                  📋 Copy
                </button>
                <button onClick={handleShare} className="btn-secondary">
                  📤 Share
                </button>
                <button onClick={handleSave} className="btn-outline">
                  💾 Save to Gallery
                </button>
              </div>

              {exportMessage && (
                <div className={`export-message ${exportMessage.includes('✓') ? 'success' : 'error'}`}>
                  {exportMessage}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuoteImageGeneratorPage;
