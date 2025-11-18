/**
 * Comic Generator Service
 * Handles creation of multi-panel comic storyboards with Bible verses
 */

// Layout configurations for different panel arrangements
export const layouts = [
  {
    id: 'single',
    name: 'Single Panel',
    panelCount: 1,
    aspectRatio: '16:9',
    description: 'One large panel for focused storytelling'
  },
  {
    id: '2-panel-horizontal',
    name: '2 Panels (Horizontal)',
    panelCount: 2,
    aspectRatio: '16:9',
    description: 'Two panels side by side'
  },
  {
    id: '2-panel-vertical',
    name: '2 Panels (Vertical)',
    panelCount: 2,
    aspectRatio: '9:16',
    description: 'Two panels stacked vertically'
  },
  {
    id: '3-panel',
    name: '3 Panels',
    panelCount: 3,
    aspectRatio: '16:9',
    description: 'Three panels in a row'
  },
  {
    id: '4-panel-grid',
    name: '4 Panel Grid',
    panelCount: 4,
    aspectRatio: '1:1',
    description: 'Classic 2x2 comic grid'
  },
  {
    id: '6-panel-grid',
    name: '6 Panel Grid',
    panelCount: 6,
    aspectRatio: '16:9',
    description: 'Two rows of three panels'
  }
];

// Style presets for comic appearance
export const stylePresets = [
  {
    id: 'comic',
    name: 'Classic Comic',
    borderWidth: 4,
    borderColor: '#000000',
    panelSpacing: 10,
    fontFamily: 'Comic Sans MS, cursive',
    captionBackground: '#FFFFFF',
    captionBorder: '#000000'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    borderWidth: 0,
    borderColor: '#8B7355',
    panelSpacing: 20,
    fontFamily: 'Georgia, serif',
    captionBackground: 'rgba(255, 255, 255, 0.8)',
    captionBorder: 'transparent'
  },
  {
    id: 'sketch',
    name: 'Sketch',
    borderWidth: 2,
    borderColor: '#555555',
    panelSpacing: 15,
    fontFamily: 'Courier New, monospace',
    captionBackground: '#F5F5DC',
    captionBorder: '#555555'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    panelSpacing: 25,
    fontFamily: 'Arial, sans-serif',
    captionBackground: '#FFFFFF',
    captionBorder: '#CCCCCC'
  }
];

/**
 * Calculate panel dimensions based on layout
 * @param {string} layoutId - Layout identifier
 * @param {number} canvasWidth - Total canvas width
 * @param {number} canvasHeight - Total canvas height
 * @param {number} spacing - Spacing between panels
 * @returns {Array} - Array of panel rectangles {x, y, width, height}
 */
export const calculatePanelPositions = (layoutId, canvasWidth, canvasHeight, spacing = 10) => {
  const padding = 20;
  const availableWidth = canvasWidth - (padding * 2);
  const availableHeight = canvasHeight - (padding * 2);

  switch (layoutId) {
    case 'single':
      return [{
        x: padding,
        y: padding,
        width: availableWidth,
        height: availableHeight
      }];

    case '2-panel-horizontal': {
      const panelWidth = (availableWidth - spacing) / 2;
      return [
        {
          x: padding,
          y: padding,
          width: panelWidth,
          height: availableHeight
        },
        {
          x: padding + panelWidth + spacing,
          y: padding,
          width: panelWidth,
          height: availableHeight
        }
      ];
    }

    case '2-panel-vertical': {
      const panelHeight = (availableHeight - spacing) / 2;
      return [
        {
          x: padding,
          y: padding,
          width: availableWidth,
          height: panelHeight
        },
        {
          x: padding,
          y: padding + panelHeight + spacing,
          width: availableWidth,
          height: panelHeight
        }
      ];
    }

    case '3-panel': {
      const panelWidth = (availableWidth - (spacing * 2)) / 3;
      return [
        {
          x: padding,
          y: padding,
          width: panelWidth,
          height: availableHeight
        },
        {
          x: padding + panelWidth + spacing,
          y: padding,
          width: panelWidth,
          height: availableHeight
        },
        {
          x: padding + (panelWidth + spacing) * 2,
          y: padding,
          width: panelWidth,
          height: availableHeight
        }
      ];
    }

    case '4-panel-grid': {
      const panelWidth = (availableWidth - spacing) / 2;
      const panelHeight = (availableHeight - spacing) / 2;
      return [
        {
          x: padding,
          y: padding,
          width: panelWidth,
          height: panelHeight
        },
        {
          x: padding + panelWidth + spacing,
          y: padding,
          width: panelWidth,
          height: panelHeight
        },
        {
          x: padding,
          y: padding + panelHeight + spacing,
          width: panelWidth,
          height: panelHeight
        },
        {
          x: padding + panelWidth + spacing,
          y: padding + panelHeight + spacing,
          width: panelWidth,
          height: panelHeight
        }
      ];
    }

    case '6-panel-grid': {
      const panelWidth = (availableWidth - (spacing * 2)) / 3;
      const panelHeight = (availableHeight - spacing) / 2;
      return [
        // Top row
        {
          x: padding,
          y: padding,
          width: panelWidth,
          height: panelHeight
        },
        {
          x: padding + panelWidth + spacing,
          y: padding,
          width: panelWidth,
          height: panelHeight
        },
        {
          x: padding + (panelWidth + spacing) * 2,
          y: padding,
          width: panelWidth,
          height: panelHeight
        },
        // Bottom row
        {
          x: padding,
          y: padding + panelHeight + spacing,
          width: panelWidth,
          height: panelHeight
        },
        {
          x: padding + panelWidth + spacing,
          y: padding + panelHeight + spacing,
          width: panelWidth,
          height: panelHeight
        },
        {
          x: padding + (panelWidth + spacing) * 2,
          y: padding + panelHeight + spacing,
          width: panelWidth,
          height: panelHeight
        }
      ];
    }

    default:
      return [];
  }
};

/**
 * Wrap text to fit within width
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width
 * @returns {string[]} - Array of wrapped lines
 */
const wrapText = (context, text, maxWidth) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + words[i] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      lines.push(currentLine.trim());
      currentLine = words[i] + ' ';
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine.trim());

  return lines;
};

/**
 * Draw a single panel with content
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} panelRect - Panel dimensions {x, y, width, height}
 * @param {Object} panelData - Panel content {verseRef, caption, imageData, backgroundColor}
 * @param {Object} stylePreset - Style settings
 */
const drawPanel = (ctx, panelRect, panelData, stylePreset) => {
  const { x, y, width, height } = panelRect;
  const { verseRef, caption, imageData, backgroundColor = '#FFFFFF' } = panelData;

  // Draw panel background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(x, y, width, height);

  // Draw panel border
  if (stylePreset.borderWidth > 0) {
    ctx.strokeStyle = stylePreset.borderColor;
    ctx.lineWidth = stylePreset.borderWidth;
    ctx.strokeRect(x, y, width, height);
  }

  // If imageData exists, draw it (for future AI-generated images)
  if (imageData) {
    const img = new Image();
    img.src = imageData;
    // For now, we'll use a placeholder
    // In production, this would load and draw the actual image
    ctx.fillStyle = '#E0E0E0';
    const imgPadding = 10;
    ctx.fillRect(x + imgPadding, y + imgPadding, width - imgPadding * 2, height * 0.6);
  }

  // Draw verse reference at top of panel
  if (verseRef) {
    ctx.font = `bold 16px ${stylePreset.fontFamily}`;
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.fillText(verseRef, x + width / 2, y + 25);
  }

  // Draw caption at bottom of panel
  if (caption) {
    const captionHeight = 60;
    const captionY = y + height - captionHeight;
    const captionPadding = 10;

    // Draw caption background
    ctx.fillStyle = stylePreset.captionBackground;
    ctx.fillRect(x, captionY, width, captionHeight);

    // Draw caption border
    if (stylePreset.captionBorder !== 'transparent') {
      ctx.strokeStyle = stylePreset.captionBorder;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, captionY, width, captionHeight);
    }

    // Draw caption text
    ctx.font = `14px ${stylePreset.fontFamily}`;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';

    const maxCaptionWidth = width - captionPadding * 2;
    const captionLines = wrapText(ctx, caption, maxCaptionWidth);

    let textY = captionY + 20;
    captionLines.forEach((line, index) => {
      if (index < 2) { // Limit to 2 lines
        ctx.fillText(line, x + captionPadding, textY);
        textY += 18;
      }
    });
  }
};

/**
 * Generate complete comic storyboard
 * @param {Object} options - Comic generation options
 * @returns {Promise<string>} - Data URL of generated comic
 */
export const generateComic = async (options) => {
  const {
    layoutId,
    panels = [],
    stylePresetId = 'comic',
    backgroundColor = '#FFFFFF',
    customizations = {}
  } = options;

  // Get layout and style preset
  const layout = layouts.find(l => l.id === layoutId) || layouts[0];
  const stylePreset = stylePresets.find(s => s.id === stylePresetId) || stylePresets[0];

  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size based on layout
  let width = customizations.width || 1200;
  let height = customizations.height || 800;

  // Adjust height for vertical layouts
  if (layoutId === '2-panel-vertical') {
    height = 1400;
  } else if (layoutId === '6-panel-grid') {
    height = 900;
  }

  canvas.width = width;
  canvas.height = height;

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Calculate panel positions
  const panelPositions = calculatePanelPositions(
    layoutId,
    width,
    height,
    stylePreset.panelSpacing
  );

  // Draw each panel
  panels.forEach((panelData, index) => {
    if (panelPositions[index]) {
      drawPanel(ctx, panelPositions[index], panelData, stylePreset);
    }
  });

  // Add watermark if requested
  if (customizations.includeWatermark) {
    ctx.font = '12px Arial, sans-serif';
    ctx.fillStyle = '#666666';
    ctx.globalAlpha = 0.5;
    ctx.textAlign = 'right';
    ctx.fillText('Created with Teen Sunday School', width - 15, height - 15);
    ctx.globalAlpha = 1.0;
  }

  // Convert canvas to data URL
  return canvas.toDataURL('image/png');
};

/**
 * Download comic image
 * @param {string} dataUrl - Image data URL
 * @param {string} filename - Filename for download
 */
export const downloadComic = (dataUrl, filename = 'comic-storyboard.png') => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copy comic to clipboard
 * @param {string} dataUrl - Image data URL
 * @returns {Promise<void>}
 */
export const copyComicToClipboard = async (dataUrl) => {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);

    return true;
  } catch (error) {
    console.error('Failed to copy comic to clipboard:', error);
    throw error;
  }
};

/**
 * Share comic using Web Share API
 * @param {string} dataUrl - Image data URL
 * @param {string} title - Comic title
 * @returns {Promise<void>}
 */
export const shareComic = async (dataUrl, title = 'Bible Comic') => {
  try {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'comic.png', { type: 'image/png' });

    await navigator.share({
      title: title,
      text: 'Check out this Bible comic!',
      files: [file]
    });

    return true;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Failed to share comic:', error);
      throw error;
    }
    return false;
  }
};

/**
 * Create empty panel data structure
 * @param {number} panelCount - Number of panels needed
 * @returns {Array} - Array of empty panel objects
 */
export const createEmptyPanels = (panelCount) => {
  return Array(panelCount).fill(null).map((_, index) => ({
    position: index,
    verseRef: '',
    caption: '',
    imageData: null,
    backgroundColor: '#FFFFFF'
  }));
};

/**
 * Validate panel data
 * @param {Array} panels - Panel data array
 * @returns {Object} - Validation result {isValid, errors}
 */
export const validatePanels = (panels) => {
  const errors = [];

  if (!panels || panels.length === 0) {
    errors.push('At least one panel is required');
    return { isValid: false, errors };
  }

  panels.forEach((panel, index) => {
    if (!panel.verseRef && !panel.caption) {
      errors.push(`Panel ${index + 1} needs either a verse reference or caption`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Save comic data to localStorage
 * @param {Object} comicData - Comic metadata and panels
 */
export const saveComicToStorage = (comicData) => {
  const storageKey = 'comicGenerator';

  const existing = localStorage.getItem(storageKey);
  const savedComics = existing ? JSON.parse(existing) : { comics: [] };

  savedComics.comics.unshift({
    ...comicData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  });

  // Limit to 10 most recent comics
  if (savedComics.comics.length > 10) {
    savedComics.comics = savedComics.comics.slice(0, 10);
  }

  localStorage.setItem(storageKey, JSON.stringify(savedComics));
};

/**
 * Get saved comics from localStorage
 * @returns {Array} - Array of saved comic objects
 */
export const getSavedComics = () => {
  const storageKey = 'comicGenerator';
  const data = localStorage.getItem(storageKey);

  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return parsed.comics || [];
  } catch (error) {
    console.error('Failed to parse saved comics:', error);
    return [];
  }
};

/**
 * Delete saved comic from localStorage
 * @param {string} comicId - ID of comic to delete
 */
export const deleteSavedComic = (comicId) => {
  const storageKey = 'comicGenerator';
  const data = localStorage.getItem(storageKey);

  if (!data) return;

  try {
    const parsed = JSON.parse(data);
    parsed.comics = parsed.comics.filter(comic => comic.id !== comicId);
    localStorage.setItem(storageKey, JSON.stringify(parsed));
  } catch (error) {
    console.error('Failed to delete saved comic:', error);
  }
};
