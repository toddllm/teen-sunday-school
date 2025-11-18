import React from 'react';
import { layouts } from '../../services/comicGeneratorService';

/**
 * LayoutSelector Component
 * Allows users to choose comic panel layout
 */
const LayoutSelector = ({ selectedLayoutId, onSelectLayout }) => {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Choose Layout</h3>
      <div style={styles.layoutGrid}>
        {layouts.map((layout) => (
          <div
            key={layout.id}
            onClick={() => onSelectLayout(layout.id)}
            style={{
              ...styles.layoutCard,
              ...(selectedLayoutId === layout.id ? styles.layoutCardSelected : {})
            }}
          >
            <div style={styles.layoutPreview}>
              {renderLayoutPreview(layout.id)}
            </div>
            <div style={styles.layoutInfo}>
              <h4 style={styles.layoutName}>{layout.name}</h4>
              <p style={styles.layoutDescription}>{layout.description}</p>
              <span style={styles.panelCount}>{layout.panelCount} panel{layout.panelCount > 1 ? 's' : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Render visual preview of layout
 */
const renderLayoutPreview = (layoutId) => {
  const previewStyle = {
    width: '100%',
    height: '100px',
    display: 'flex',
    gap: '4px',
    padding: '8px'
  };

  const panelStyle = {
    border: '2px solid #666',
    backgroundColor: '#e0e0e0',
    borderRadius: '2px'
  };

  switch (layoutId) {
    case 'single':
      return (
        <div style={previewStyle}>
          <div style={{ ...panelStyle, flex: 1 }}></div>
        </div>
      );

    case '2-panel-horizontal':
      return (
        <div style={{ ...previewStyle, flexDirection: 'row' }}>
          <div style={{ ...panelStyle, flex: 1 }}></div>
          <div style={{ ...panelStyle, flex: 1 }}></div>
        </div>
      );

    case '2-panel-vertical':
      return (
        <div style={{ ...previewStyle, flexDirection: 'column' }}>
          <div style={{ ...panelStyle, flex: 1 }}></div>
          <div style={{ ...panelStyle, flex: 1 }}></div>
        </div>
      );

    case '3-panel':
      return (
        <div style={{ ...previewStyle, flexDirection: 'row' }}>
          <div style={{ ...panelStyle, flex: 1 }}></div>
          <div style={{ ...panelStyle, flex: 1 }}></div>
          <div style={{ ...panelStyle, flex: 1 }}></div>
        </div>
      );

    case '4-panel-grid':
      return (
        <div style={{ ...previewStyle, flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
            <div style={{ ...panelStyle, flex: 1 }}></div>
            <div style={{ ...panelStyle, flex: 1 }}></div>
          </div>
          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
            <div style={{ ...panelStyle, flex: 1 }}></div>
            <div style={{ ...panelStyle, flex: 1 }}></div>
          </div>
        </div>
      );

    case '6-panel-grid':
      return (
        <div style={{ ...previewStyle, flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
            <div style={{ ...panelStyle, flex: 1 }}></div>
            <div style={{ ...panelStyle, flex: 1 }}></div>
            <div style={{ ...panelStyle, flex: 1 }}></div>
          </div>
          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
            <div style={{ ...panelStyle, flex: 1 }}></div>
            <div style={{ ...panelStyle, flex: 1 }}></div>
            <div style={{ ...panelStyle, flex: 1 }}></div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

const styles = {
  container: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333'
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px'
  },
  layoutCard: {
    border: '2px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#fff'
  },
  layoutCardSelected: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff',
    boxShadow: '0 2px 8px rgba(0, 123, 255, 0.2)'
  },
  layoutPreview: {
    marginBottom: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  layoutInfo: {
    textAlign: 'left'
  },
  layoutName: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    color: '#333'
  },
  layoutDescription: {
    fontSize: '13px',
    color: '#666',
    margin: '0 0 8px 0'
  },
  panelCount: {
    fontSize: '12px',
    color: '#999',
    fontWeight: '500'
  }
};

export default LayoutSelector;
