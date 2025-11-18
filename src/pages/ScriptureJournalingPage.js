import React, { useState, useEffect } from 'react';
import { getVerseText } from '../services/bibleAPI';
import {
  templates,
  layoutTypes,
  generateJournalPage,
  downloadJournalPage,
  printJournalPage,
  saveJournalPage,
  getSavedJournalPages,
  deleteJournalPage
} from '../services/journalService';
import './ScriptureJournalingPage.css';

const ScriptureJournalingPage = () => {
  // State for verse input
  const [verseReference, setVerseReference] = useState('');
  const [verseText, setVerseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for template selection
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);

  // State for notes/reflections
  const [notesText, setNotesText] = useState('');

  // State for generated page
  const [generatedPageUrl, setGeneratedPageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for saved pages gallery
  const [savedPages, setSavedPages] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  // State for feedback messages
  const [message, setMessage] = useState('');

  // Load saved pages on mount
  useEffect(() => {
    setSavedPages(getSavedJournalPages());
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFetchVerse();
    }
  };

  // Generate journal page
  const handleGeneratePage = async () => {
    if (!verseText) {
      setError('Please fetch a verse first');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const dataUrl = await generateJournalPage({
        verseText,
        verseReference,
        template: selectedTemplate,
        notesText
      });

      setGeneratedPageUrl(dataUrl);
    } catch (err) {
      setError('Failed to generate page. Please try again.');
      console.error('Error generating page:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on changes
  useEffect(() => {
    if (verseText) {
      const debounce = setTimeout(() => {
        handleGeneratePage();
      }, 500);
      return () => clearTimeout(debounce);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verseText, selectedTemplate, notesText]);

  // Download page
  const handleDownload = () => {
    if (!generatedPageUrl) return;
    const filename = `journal_${verseReference.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    downloadJournalPage(generatedPageUrl, filename);
    setMessage('Journal page downloaded!');
  };

  // Print page
  const handlePrint = () => {
    if (!generatedPageUrl) return;
    printJournalPage(generatedPageUrl);
    setMessage('Opening print dialog...');
  };

  // Save page to gallery
  const handleSave = () => {
    if (!generatedPageUrl) return;

    saveJournalPage({
      verseText,
      verseReference,
      templateId: selectedTemplate.id,
      notesText,
      dataUrl: generatedPageUrl
    });

    setSavedPages(getSavedJournalPages());
    setMessage('Page saved to gallery!');
  };

  // Delete saved page
  const handleDeleteSaved = (pageId) => {
    deleteJournalPage(pageId);
    setSavedPages(getSavedJournalPages());
    setMessage('Page deleted');
  };

  // Load saved page
  const handleLoadSaved = (savedPage) => {
    setVerseText(savedPage.verseText);
    setVerseReference(savedPage.verseReference);
    setNotesText(savedPage.notesText || '');
    const template = templates.find(t => t.id === savedPage.templateId) || templates[0];
    setSelectedTemplate(template);
    setGeneratedPageUrl(savedPage.dataUrl);
    setShowGallery(false);
  };

  // Use example
  const handleUseExample = () => {
    setVerseReference('Philippians 4:13');
    setVerseText('I can do all things through Christ who strengthens me.');
    setNotesText('This verse reminds me that with God, nothing is impossible. When I feel weak or uncertain, I can draw strength from Christ.');
  };

  return (
    <div className="scripture-journaling">
      <div className="journaling-header">
        <h1>Scripture Journaling Templates</h1>
        <p>Create beautiful, printable journal pages with decorative layouts</p>
      </div>

      {/* Gallery Toggle */}
      <div className="gallery-toggle">
        <button
          className="btn-secondary"
          onClick={() => setShowGallery(!showGallery)}
        >
          {showGallery ? '← Back to Editor' : `📚 My Journal (${savedPages.length})`}
        </button>
      </div>

      {showGallery ? (
        /* Gallery View */
        <div className="gallery-view">
          <h2>Saved Journal Pages</h2>
          {savedPages.length === 0 ? (
            <div className="empty-gallery">
              <p>No saved pages yet. Create your first journal page!</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {savedPages.map((page) => (
                <div key={page.id} className="gallery-item card">
                  <img src={page.dataUrl} alt={page.verseReference} />
                  <div className="gallery-item-info">
                    <p className="gallery-reference">{page.verseReference}</p>
                    <p className="gallery-date">
                      {new Date(page.createdAt).toLocaleDateString()}
                    </p>
                    <div className="gallery-actions">
                      <button
                        className="btn-small btn-primary"
                        onClick={() => handleLoadSaved(page)}
                      >
                        Load
                      </button>
                      <button
                        className="btn-small btn-outline"
                        onClick={() => downloadJournalPage(page.dataUrl, `journal_${page.verseReference.replace(/[^a-zA-Z0-9]/g, '_')}.png`)}
                      >
                        Download
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => handleDeleteSaved(page.id)}
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
            <h2>1. Choose Your Scripture</h2>
            <div className="verse-input-group">
              <input
                type="text"
                placeholder="e.g., Psalm 23:1, John 3:16, Proverbs 3:5-6"
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
              Use Example
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
              <h2>2. Choose a Template Style</h2>
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
                            ? `linear-gradient(135deg, ${template.background.colors[0]}, ${template.background.colors[1]})`
                            : template.background.color,
                        border: `3px solid ${template.accent}`
                      }}
                    >
                      <div className="template-preview-content">
                        <span style={{ color: template.fontPreset.color }}>Aa</span>
                        <div
                          className="template-accent-line"
                          style={{ background: template.accent }}
                        ></div>
                      </div>
                    </div>
                    <div className="template-info">
                      <p className="template-name">{template.name}</p>
                      <p className="template-description">{template.description}</p>
                      <p className="template-layout">
                        {layoutTypes[template.layout].name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Add Notes */}
          {verseText && (
            <div className="editor-section card">
              <h2>3. Add Your Reflections (Optional)</h2>
              <p className="section-description">
                Your notes will appear on the lined section of your journal page
              </p>
              <textarea
                className="notes-input"
                placeholder="Write your thoughts, prayers, or reflections here..."
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                rows={6}
              />
            </div>
          )}

          {/* Preview & Export */}
          {generatedPageUrl && (
            <div className="editor-section card">
              <h2>4. Preview & Export</h2>

              {isGenerating && (
                <div className="generating-message">Generating your journal page...</div>
              )}

              <div className="page-preview">
                <img src={generatedPageUrl} alt="Generated journal page" />
              </div>

              {/* Export Actions */}
              <div className="export-actions">
                <button onClick={handleDownload} className="btn-primary">
                  ⬇ Download PNG
                </button>
                <button onClick={handlePrint} className="btn-secondary">
                  🖨 Print
                </button>
                <button onClick={handleSave} className="btn-outline">
                  💾 Save to Gallery
                </button>
              </div>

              {message && (
                <div className="success-message">
                  {message}
                </div>
              )}

              <div className="print-tip">
                <strong>Printing Tip:</strong> For best results, print on quality paper
                or cardstock. This template is designed for standard 8.5" x 11" paper.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScriptureJournalingPage;
