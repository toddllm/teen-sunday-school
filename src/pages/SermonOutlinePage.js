import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useOutline } from '../contexts/OutlineContext';
import { useTranslation } from '../contexts/TranslationContext';
import outlineService from '../services/outlineService';
import './SermonOutlinePage.css';

const SermonOutlinePage = () => {
  const location = useLocation();
  const { createOutline, updateOutline, outlines } = useOutline();
  const { primaryTranslation } = useTranslation();

  const [passageRef, setPassageRef] = useState('');
  const [currentOutline, setCurrentOutline] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportMessage, setExportMessage] = useState('');
  const [view, setView] = useState('list'); // 'list', 'create', 'view'

  // Check if we came from Bible page with a passage
  useEffect(() => {
    if (location.state?.passageRef) {
      setPassageRef(location.state.passageRef);
      setView('create');
    }
  }, [location]);

  const handleGenerateOutline = async (useAI = false) => {
    if (!passageRef.trim()) {
      setError('Please enter a passage reference (e.g., John 3:16-21)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch the passage text
      const passageText = await outlineService.fetchPassageText(
        passageRef,
        primaryTranslation
      );

      if (!passageText) {
        setError('Could not fetch passage text. Please check the reference.');
        setLoading(false);
        return;
      }

      let outlineData;

      if (useAI) {
        try {
          outlineData = await outlineService.generateOutlineWithAI(
            passageRef,
            passageText
          );
        } catch (aiError) {
          console.error('AI generation failed:', aiError);
          setError(
            'AI generation failed. Please check that REACT_APP_ANTHROPIC_API_KEY is configured, or use the basic outline option.'
          );
          setLoading(false);
          return;
        }
      } else {
        outlineData = outlineService.generateBasicOutline(passageRef, passageText);
      }

      // Create the outline
      const newOutline = createOutline({
        passageRef,
        title: outlineData.title,
        contentMd: outlineData.contentMd,
        sections: outlineData.sections,
        isAiGenerated: outlineData.isAiGenerated,
      });

      setCurrentOutline(newOutline);
      setEditableContent(newOutline.contentMd);
      setView('view');
    } catch (err) {
      console.error('Error generating outline:', err);
      setError('An error occurred while generating the outline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdits = () => {
    if (currentOutline) {
      updateOutline(currentOutline.id, {
        contentMd: editableContent,
      });
      setCurrentOutline({
        ...currentOutline,
        contentMd: editableContent,
      });
      setIsEditing(false);
      showExportMessage('Changes saved successfully!', 'success');
    }
  };

  const handleCancelEdit = () => {
    setEditableContent(currentOutline.contentMd);
    setIsEditing(false);
  };

  const handleCopyToClipboard = async () => {
    if (currentOutline) {
      const success = await outlineService.copyToClipboard(currentOutline.contentMd);
      if (success) {
        showExportMessage('Copied to clipboard!', 'success');
      } else {
        showExportMessage('Failed to copy to clipboard', 'error');
      }
    }
  };

  const handleDownloadMarkdown = () => {
    if (currentOutline) {
      const filename = `outline-${currentOutline.passageRef.replace(/[^a-zA-Z0-9]/g, '-')}.md`;
      const success = outlineService.downloadMarkdown(currentOutline.contentMd, filename);
      if (success) {
        showExportMessage('Markdown downloaded!', 'success');
      } else {
        showExportMessage('Failed to download markdown', 'error');
      }
    }
  };

  const handleDownloadPDF = () => {
    if (currentOutline) {
      const html = outlineService.markdownToHtml(currentOutline.contentMd);
      const fullHtml = `
        ${currentOutline.isAiGenerated ? `
          <div class="ai-disclaimer">
            <strong>⚠️ AI-Generated Content:</strong> This outline was generated using AI and should be reviewed and customized for your specific teaching context.
          </div>
        ` : ''}
        ${html}
      `;
      const success = outlineService.downloadPDF(fullHtml, currentOutline.title);
      if (success) {
        showExportMessage('Opening PDF print dialog...', 'success');
      } else {
        showExportMessage('Failed to generate PDF. Please allow pop-ups.', 'error');
      }
    }
  };

  const showExportMessage = (message, type = 'success') => {
    setExportMessage({ text: message, type });
    setTimeout(() => setExportMessage(''), 3000);
  };

  const handleViewOutline = (outline) => {
    setCurrentOutline(outline);
    setEditableContent(outline.contentMd);
    setPassageRef(outline.passageRef);
    setView('view');
  };

  const handleNewOutline = () => {
    setCurrentOutline(null);
    setPassageRef('');
    setEditableContent('');
    setIsEditing(false);
    setError('');
    setView('create');
  };

  const renderListView = () => (
    <div className="outline-list-container">
      <div className="outline-list-header">
        <h1>Teaching Outlines</h1>
        <button className="btn btn-primary" onClick={handleNewOutline}>
          + Create New Outline
        </button>
      </div>

      {outlines.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h2>No outlines yet</h2>
          <p>Create your first teaching outline to get started!</p>
          <button className="btn btn-primary" onClick={handleNewOutline}>
            Create Outline
          </button>
        </div>
      ) : (
        <div className="outline-grid">
          {outlines.map((outline) => (
            <div
              key={outline.id}
              className="outline-card"
              onClick={() => handleViewOutline(outline)}
            >
              <div className="outline-card-header">
                <h3>{outline.title || outline.passageRef}</h3>
                {outline.isAiGenerated && (
                  <span className="ai-badge">AI Generated</span>
                )}
              </div>
              <p className="outline-passage">{outline.passageRef}</p>
              <p className="outline-date">
                Created {new Date(outline.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreateView = () => (
    <div className="outline-create-container">
      <button className="btn btn-back" onClick={() => setView('list')}>
        ← Back to Outlines
      </button>

      <h1>Create Teaching Outline</h1>

      <div className="passage-input-section">
        <label htmlFor="passage-ref">Bible Passage Reference</label>
        <input
          id="passage-ref"
          type="text"
          value={passageRef}
          onChange={(e) => setPassageRef(e.target.value)}
          placeholder="e.g., John 3:16-21, Romans 8, Matthew 5-7"
          className="passage-input"
          disabled={loading}
        />
        <p className="input-hint">
          Enter a single verse, verse range, chapter, or chapter range
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="generation-options">
        <div className="option-card">
          <h3>🤖 AI-Generated Outline</h3>
          <p>
            Use AI to automatically create a comprehensive teaching outline with
            themes, key points, discussion questions, and applications.
          </p>
          <div className="ai-disclaimer-small">
            Requires REACT_APP_ANTHROPIC_API_KEY to be configured
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleGenerateOutline(true)}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>

        <div className="option-card">
          <h3>📋 Basic Template</h3>
          <p>
            Start with a basic outline template that you can customize and fill in
            with your own content.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => handleGenerateOutline(false)}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Create Basic Outline'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderViewEditView = () => (
    <div className="outline-view-container">
      <div className="outline-toolbar">
        <button className="btn btn-back" onClick={() => setView('list')}>
          ← Back to Outlines
        </button>

        <div className="toolbar-actions">
          {!isEditing ? (
            <>
              <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                ✏️ Edit
              </button>
              <button className="btn btn-secondary" onClick={handleCopyToClipboard}>
                📋 Copy
              </button>
              <button className="btn btn-secondary" onClick={handleDownloadMarkdown}>
                ⬇️ Markdown
              </button>
              <button className="btn btn-primary" onClick={handleDownloadPDF}>
                📄 PDF
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveEdits}>
                💾 Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {exportMessage && (
        <div className={`export-message ${exportMessage.type}`}>
          {exportMessage.text}
        </div>
      )}

      {currentOutline?.isAiGenerated && (
        <div className="ai-disclaimer">
          <strong>⚠️ AI-Generated Content:</strong> This outline was generated using
          AI and should be reviewed and customized for your specific teaching
          context. Always verify theological accuracy and adapt to your students'
          needs.
        </div>
      )}

      {isEditing ? (
        <div className="outline-editor">
          <label htmlFor="outline-editor">Edit Outline (Markdown)</label>
          <textarea
            id="outline-editor"
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            className="outline-textarea"
            rows={30}
          />
          <div className="editor-hint">
            Tip: Use Markdown formatting (# for headings, - for lists, ** for bold)
          </div>
        </div>
      ) : (
        <div
          className="outline-preview"
          dangerouslySetInnerHTML={{
            __html: outlineService.markdownToHtml(currentOutline?.contentMd || ''),
          }}
        />
      )}
    </div>
  );

  return (
    <div className="sermon-outline-page">
      {view === 'list' && renderListView()}
      {view === 'create' && renderCreateView()}
      {view === 'view' && renderViewEditView()}
    </div>
  );
};

export default SermonOutlinePage;
