import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutSelector from '../components/comic/LayoutSelector';
import PanelEditor from '../components/comic/PanelEditor';
import ComicPreview from '../components/comic/ComicPreview';
import {
  layouts,
  stylePresets,
  createEmptyPanels,
  validatePanels,
  downloadComic,
  copyComicToClipboard,
  shareComic,
  saveComicToStorage,
  getSavedComics,
  deleteSavedComic,
  generateComic
} from '../services/comicGeneratorService';

/**
 * ComicGeneratorPage Component
 * Main page for creating Bible comic storyboards
 */
const ComicGeneratorPage = () => {
  const navigate = useNavigate();

  // Comic state
  const [title, setTitle] = useState('');
  const [layoutId, setLayoutId] = useState('4-panel-grid');
  const [panels, setPanels] = useState(createEmptyPanels(4));
  const [stylePresetId, setStylePresetId] = useState('comic');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [includeWatermark, setIncludeWatermark] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'saved'
  const [savedComics, setSavedComics] = useState([]);
  const [showSuccess, setShowSuccess] = useState('');
  const [showError, setShowError] = useState('');

  // Load saved comics on mount
  useEffect(() => {
    setSavedComics(getSavedComics());
  }, []);

  // Update panels when layout changes
  const handleLayoutChange = (newLayoutId) => {
    const layout = layouts.find(l => l.id === newLayoutId);
    if (layout) {
      setLayoutId(newLayoutId);
      setPanels(createEmptyPanels(layout.panelCount));
    }
  };

  // Update individual panel
  const handlePanelUpdate = (index, updatedPanel) => {
    const newPanels = [...panels];
    newPanels[index] = updatedPanel;
    setPanels(newPanels);
  };

  // Delete panel (only if more than 1)
  const handlePanelDelete = (index) => {
    if (panels.length > 1) {
      const newPanels = panels.filter((_, i) => i !== index);
      setPanels(newPanels);
    }
  };

  // Save comic
  const handleSave = () => {
    const validation = validatePanels(panels);

    if (!validation.isValid) {
      setShowError(validation.errors.join(', '));
      setTimeout(() => setShowError(''), 5000);
      return;
    }

    const comicData = {
      title: title || 'Untitled Comic',
      layoutId,
      panels,
      stylePresetId,
      backgroundColor,
      includeWatermark
    };

    saveComicToStorage(comicData);
    setSavedComics(getSavedComics());
    setShowSuccess('Comic saved successfully!');
    setTimeout(() => setShowSuccess(''), 3000);
  };

  // Download comic
  const handleDownload = async () => {
    const validation = validatePanels(panels);

    if (!validation.isValid) {
      setShowError(validation.errors.join(', '));
      setTimeout(() => setShowError(''), 5000);
      return;
    }

    try {
      const dataUrl = await generateComic({
        layoutId,
        panels,
        stylePresetId,
        backgroundColor,
        customizations: { includeWatermark }
      });

      const filename = `${title || 'comic'}-${Date.now()}.png`;
      downloadComic(dataUrl, filename);
      setShowSuccess('Comic downloaded!');
      setTimeout(() => setShowSuccess(''), 3000);
    } catch (error) {
      setShowError('Failed to download comic');
      setTimeout(() => setShowError(''), 5000);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    const validation = validatePanels(panels);

    if (!validation.isValid) {
      setShowError(validation.errors.join(', '));
      setTimeout(() => setShowError(''), 5000);
      return;
    }

    try {
      const dataUrl = await generateComic({
        layoutId,
        panels,
        stylePresetId,
        backgroundColor,
        customizations: { includeWatermark }
      });

      await copyComicToClipboard(dataUrl);
      setShowSuccess('Comic copied to clipboard!');
      setTimeout(() => setShowSuccess(''), 3000);
    } catch (error) {
      setShowError('Failed to copy comic');
      setTimeout(() => setShowError(''), 5000);
    }
  };

  // Share comic
  const handleShare = async () => {
    const validation = validatePanels(panels);

    if (!validation.isValid) {
      setShowError(validation.errors.join(', '));
      setTimeout(() => setShowError(''), 5000);
      return;
    }

    try {
      const dataUrl = await generateComic({
        layoutId,
        panels,
        stylePresetId,
        backgroundColor,
        customizations: { includeWatermark }
      });

      await shareComic(dataUrl, title || 'Bible Comic');
      setShowSuccess('Comic shared!');
      setTimeout(() => setShowSuccess(''), 3000);
    } catch (error) {
      setShowError('Sharing not supported on this device');
      setTimeout(() => setShowError(''), 5000);
    }
  };

  // Load saved comic
  const handleLoadComic = (comic) => {
    setTitle(comic.title);
    setLayoutId(comic.layoutId);
    setPanels(comic.panels);
    setStylePresetId(comic.stylePresetId);
    setBackgroundColor(comic.backgroundColor);
    setIncludeWatermark(comic.includeWatermark);
    setActiveTab('create');
    setShowSuccess('Comic loaded!');
    setTimeout(() => setShowSuccess(''), 3000);
  };

  // Delete saved comic
  const handleDeleteSaved = (comicId) => {
    if (window.confirm('Are you sure you want to delete this comic?')) {
      deleteSavedComic(comicId);
      setSavedComics(getSavedComics());
      setShowSuccess('Comic deleted!');
      setTimeout(() => setShowSuccess(''), 3000);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Back to Home
        </button>
        <h1 style={styles.pageTitle}>Comic / Storyboard Generator</h1>
        <p style={styles.subtitle}>Create visual Bible story panels with verses</p>
      </header>

      {/* Notifications */}
      {showSuccess && (
        <div style={styles.successNotification}>{showSuccess}</div>
      )}
      {showError && (
        <div style={styles.errorNotification}>{showError}</div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('create')}
          style={{
            ...styles.tab,
            ...(activeTab === 'create' ? styles.tabActive : {})
          }}
        >
          Create Comic
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          style={{
            ...styles.tab,
            ...(activeTab === 'saved' ? styles.tabActive : {})
          }}
        >
          Saved Comics ({savedComics.length})
        </button>
      </div>

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div style={styles.content}>
          <div style={styles.twoColumn}>
            {/* Left Column - Editor */}
            <div style={styles.leftColumn}>
              {/* Title Input */}
              <div style={styles.section}>
                <label style={styles.label}>
                  Comic Title:
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your comic..."
                    style={styles.titleInput}
                  />
                </label>
              </div>

              {/* Layout Selector */}
              <div style={styles.section}>
                <LayoutSelector
                  selectedLayoutId={layoutId}
                  onSelectLayout={handleLayoutChange}
                />
              </div>

              {/* Style Preset */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Visual Style</h3>
                <div style={styles.styleGrid}>
                  {stylePresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setStylePresetId(preset.id)}
                      style={{
                        ...styles.styleButton,
                        ...(stylePresetId === preset.id ? styles.styleButtonActive : {})
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div style={styles.section}>
                <label style={styles.label}>
                  Background Color:
                  <div style={styles.colorInputGroup}>
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      style={styles.colorInput}
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      style={styles.colorTextInput}
                    />
                  </div>
                </label>
              </div>

              {/* Watermark Toggle */}
              <div style={styles.section}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={includeWatermark}
                    onChange={(e) => setIncludeWatermark(e.target.checked)}
                  />
                  Include watermark
                </label>
              </div>

              {/* Panel Editors */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Edit Panels</h3>
                {panels.map((panel, index) => (
                  <PanelEditor
                    key={index}
                    panel={panel}
                    panelIndex={index}
                    totalPanels={panels.length}
                    onUpdate={handlePanelUpdate}
                    onDelete={handlePanelDelete}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div style={styles.actionButtons}>
                <button onClick={handleSave} style={styles.primaryButton}>
                  💾 Save Comic
                </button>
                <button onClick={handleDownload} style={styles.secondaryButton}>
                  ⬇ Download
                </button>
                <button onClick={handleCopy} style={styles.secondaryButton}>
                  📋 Copy
                </button>
                <button onClick={handleShare} style={styles.secondaryButton}>
                  🔗 Share
                </button>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div style={styles.rightColumn}>
              <div style={styles.stickyPreview}>
                <ComicPreview
                  layoutId={layoutId}
                  panels={panels}
                  stylePresetId={stylePresetId}
                  backgroundColor={backgroundColor}
                  includeWatermark={includeWatermark}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Tab */}
      {activeTab === 'saved' && (
        <div style={styles.content}>
          <h2 style={styles.sectionTitle}>Saved Comics</h2>
          {savedComics.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No saved comics yet</p>
              <button
                onClick={() => setActiveTab('create')}
                style={styles.primaryButton}
              >
                Create Your First Comic
              </button>
            </div>
          ) : (
            <div style={styles.savedGrid}>
              {savedComics.map((comic) => (
                <div key={comic.id} style={styles.savedCard}>
                  <h4 style={styles.savedTitle}>{comic.title}</h4>
                  <p style={styles.savedInfo}>
                    {layouts.find(l => l.id === comic.layoutId)?.name}
                  </p>
                  <p style={styles.savedDate}>
                    {new Date(comic.createdAt).toLocaleDateString()}
                  </p>
                  <div style={styles.savedActions}>
                    <button
                      onClick={() => handleLoadComic(comic)}
                      style={styles.loadButton}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteSaved(comic.id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    paddingBottom: '40px'
  },
  header: {
    backgroundColor: '#fff',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    marginBottom: '20px'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '10px',
    padding: '5px 0'
  },
  pageTitle: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333'
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: '#666'
  },
  successNotification: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px 20px',
    margin: '0 20px 20px 20px',
    borderRadius: '4px',
    border: '1px solid #c3e6cb'
  },
  errorNotification: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px 20px',
    margin: '0 20px 20px 20px',
    borderRadius: '4px',
    border: '1px solid #f5c6cb'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    padding: '0 20px',
    marginBottom: '20px'
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: '#fff',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666'
  },
  tabActive: {
    backgroundColor: '#007bff',
    color: '#fff'
  },
  content: {
    padding: '0 20px'
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  leftColumn: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  rightColumn: {
    position: 'relative'
  },
  stickyPreview: {
    position: 'sticky',
    top: '20px'
  },
  section: {
    marginBottom: '25px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#333'
  },
  label: {
    display: 'block',
    fontWeight: '500',
    fontSize: '14px',
    color: '#555',
    marginBottom: '8px'
  },
  titleInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px',
    marginTop: '5px',
    boxSizing: 'border-box'
  },
  styleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
  },
  styleButton: {
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  styleButtonActive: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff',
    color: '#007bff'
  },
  colorInputGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '5px'
  },
  colorInput: {
    width: '60px',
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
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#555',
    cursor: 'pointer'
  },
  actionButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '20px'
  },
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: '8px'
  },
  emptyText: {
    fontSize: '16px',
    color: '#999',
    marginBottom: '20px'
  },
  savedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px'
  },
  savedCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  savedTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333'
  },
  savedInfo: {
    margin: '0 0 5px 0',
    fontSize: '13px',
    color: '#666'
  },
  savedDate: {
    margin: '0 0 15px 0',
    fontSize: '12px',
    color: '#999'
  },
  savedActions: {
    display: 'flex',
    gap: '10px'
  },
  loadButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  deleteButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px'
  }
};

export default ComicGeneratorPage;
