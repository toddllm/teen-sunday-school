import React, { useState, useEffect } from 'react';
import {
  memeTemplates,
  exampleMemes,
  memeFontOptions,
  generateMeme,
  downloadMeme,
  copyMemeToClipboard,
  shareMeme,
  saveMemeToStorage,
  getSavedMemes,
  deleteSavedMeme
} from '../services/memeGeneratorService';
import './MemeGeneratorPage.css';

const MemeGeneratorPage = () => {
  // State for template selection
  const [selectedTemplate, setSelectedTemplate] = useState(memeTemplates[0]);

  // State for text inputs
  const [texts, setTexts] = useState({});

  // State for customization
  const [customizations, setCustomizations] = useState({
    fontFamily: 'Impact, sans-serif',
    fontSize: null, // Will use template default
    includeWatermark: false
  });

  // State for generated meme
  const [generatedMemeUrl, setGeneratedMemeUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for saved memes gallery
  const [savedMemes, setSavedMemes] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  // State for export feedback
  const [exportMessage, setExportMessage] = useState('');

  // Load saved memes on mount
  useEffect(() => {
    setSavedMemes(getSavedMemes());
  }, []);

  // Auto-clear export messages
  useEffect(() => {
    if (exportMessage) {
      const timer = setTimeout(() => setExportMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [exportMessage]);

  // Initialize text inputs when template changes
  useEffect(() => {
    const initialTexts = {};
    selectedTemplate.textAreas.forEach(area => {
      initialTexts[area.id] = texts[area.id] || '';
    });
    setTexts(initialTexts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate]);

  // Handle text input change
  const handleTextChange = (areaId, value) => {
    setTexts({
      ...texts,
      [areaId]: value
    });
  };

  // Load example meme
  const handleLoadExample = (example) => {
    const template = memeTemplates.find(t => t.id === example.templateId);
    if (template) {
      setSelectedTemplate(template);
      setTexts(example.texts);
    }
  };

  // Generate meme
  const handleGenerateMeme = async () => {
    setIsGenerating(true);

    try {
      const dataUrl = await generateMeme({
        template: selectedTemplate,
        texts,
        customizations
      });

      setGeneratedMemeUrl(dataUrl);
    } catch (err) {
      console.error('Error generating meme:', err);
      setExportMessage('✗ Failed to generate meme');
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on changes
  useEffect(() => {
    const hasAnyText = Object.values(texts).some(text => text && text.trim() !== '');
    if (hasAnyText) {
      const debounce = setTimeout(() => {
        handleGenerateMeme();
      }, 500);
      return () => clearTimeout(debounce);
    } else {
      setGeneratedMemeUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texts, selectedTemplate, customizations]);

  // Download meme
  const handleDownload = () => {
    if (!generatedMemeUrl) return;

    const filename = `${selectedTemplate.id}-meme.png`;
    downloadMeme(generatedMemeUrl, filename);
    setExportMessage('✓ Meme downloaded!');
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!generatedMemeUrl) return;

    try {
      await copyMemeToClipboard(generatedMemeUrl);
      setExportMessage('✓ Meme copied to clipboard!');
    } catch (err) {
      setExportMessage('✗ Failed to copy. Try downloading instead.');
    }
  };

  // Share via native share
  const handleShare = async () => {
    if (!generatedMemeUrl) return;

    try {
      await shareMeme(generatedMemeUrl, selectedTemplate.name);
      setExportMessage('✓ Meme shared!');
    } catch (err) {
      if (err.message === 'Web Share API not supported') {
        setExportMessage('✗ Sharing not supported on this device');
      } else {
        setExportMessage('✗ Failed to share');
      }
    }
  };

  // Save meme to gallery
  const handleSave = () => {
    if (!generatedMemeUrl) return;

    saveMemeToStorage({
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      texts,
      dataUrl: generatedMemeUrl,
      customizations
    });

    setSavedMemes(getSavedMemes());
    setExportMessage('✓ Meme saved to gallery!');
  };

  // Delete saved meme
  const handleDeleteSaved = (memeId) => {
    deleteSavedMeme(memeId);
    setSavedMemes(getSavedMemes());
  };

  // Load saved meme
  const handleLoadSaved = (savedMeme) => {
    const template = memeTemplates.find(t => t.id === savedMeme.templateId) || memeTemplates[0];
    setSelectedTemplate(template);
    setTexts(savedMeme.texts);
    setCustomizations(savedMeme.customizations || customizations);
    setGeneratedMemeUrl(savedMeme.dataUrl);
    setShowGallery(false);
  };

  // Clear all text
  const handleClearAll = () => {
    const clearedTexts = {};
    selectedTemplate.textAreas.forEach(area => {
      clearedTexts[area.id] = '';
    });
    setTexts(clearedTexts);
  };

  return (
    <div className="meme-generator">
      <div className="generator-header">
        <h1>😄 Wholesome Meme Generator</h1>
        <p>Create faith-based memes to share with friends</p>
      </div>

      {/* Gallery Toggle */}
      <div className="gallery-toggle">
        <button
          className="btn-secondary"
          onClick={() => setShowGallery(!showGallery)}
        >
          {showGallery ? '← Back to Editor' : `📁 My Gallery (${savedMemes.length})`}
        </button>
      </div>

      {showGallery ? (
        /* Gallery View */
        <div className="gallery-view">
          <h2>Saved Memes</h2>
          {savedMemes.length === 0 ? (
            <div className="empty-gallery">
              <p>No saved memes yet. Create your first wholesome meme!</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {savedMemes.map((meme) => (
                <div key={meme.id} className="gallery-item card">
                  <img src={meme.dataUrl} alt={meme.templateName} />
                  <div className="gallery-item-info">
                    <p className="gallery-template">{meme.templateName}</p>
                    <div className="gallery-actions">
                      <button
                        className="btn-small btn-primary"
                        onClick={() => handleLoadSaved(meme)}
                      >
                        Load
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => handleDeleteSaved(meme.id)}
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
          {/* Step 1: Template Selection */}
          <div className="editor-section card">
            <h2>1. Choose Meme Template</h2>
            <div className="template-grid">
              {memeTemplates.map((template) => (
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
                          : template.background.type === 'split'
                          ? `linear-gradient(to right, ${template.background.leftColor} 50%, ${template.background.rightColor} 50%)`
                          : template.background.color
                    }}
                  >
                    <span className="template-icon">😄</span>
                  </div>
                  <p className="template-name">{template.name}</p>
                  <p className="template-description">{template.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Text Input */}
          <div className="editor-section card">
            <div className="section-header">
              <h2>2. Add Your Text</h2>
              <button onClick={handleClearAll} className="btn-outline btn-small">
                Clear All
              </button>
            </div>

            {/* Example Memes */}
            <div className="example-memes">
              <p className="example-label">Need inspiration? Try an example:</p>
              <div className="example-buttons">
                {exampleMemes
                  .filter(ex => ex.templateId === selectedTemplate.id)
                  .slice(0, 1)
                  .map((example, index) => (
                    <button
                      key={index}
                      className="btn-outline btn-small"
                      onClick={() => handleLoadExample(example)}
                    >
                      Load Example
                    </button>
                  ))}
                {exampleMemes.filter(ex => ex.templateId === selectedTemplate.id).length === 0 && (
                  <button
                    className="btn-outline btn-small"
                    onClick={() => handleLoadExample(exampleMemes[0])}
                  >
                    Load Any Example
                  </button>
                )}
              </div>
            </div>

            {/* Text Areas */}
            <div className="text-inputs">
              {selectedTemplate.textAreas.map((area) => (
                <div key={area.id} className="text-input-group">
                  <label>{area.label}</label>
                  <textarea
                    value={texts[area.id] || ''}
                    onChange={(e) => handleTextChange(area.id, e.target.value)}
                    placeholder={`Enter ${area.label.toLowerCase()}...`}
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Customization */}
          <div className="editor-section card">
            <h2>3. Customize Style</h2>
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
                  {memeFontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
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

          {/* Preview */}
          {generatedMemeUrl && (
            <div className="editor-section card">
              <h2>4. Preview & Export</h2>

              {isGenerating && (
                <div className="generating-message">Generating meme...</div>
              )}

              <div className="meme-preview">
                <img src={generatedMemeUrl} alt="Generated meme" />
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

          {/* Instructions */}
          {!generatedMemeUrl && (
            <div className="editor-section card instructions">
              <h3>How to Use:</h3>
              <ol>
                <li>Choose a meme template above</li>
                <li>Enter your text for each section</li>
                <li>Customize the font style if desired</li>
                <li>Preview your meme and download or share!</li>
              </ol>
              <p className="tip">💡 Tip: Keep text short and impactful for the best memes!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemeGeneratorPage;
