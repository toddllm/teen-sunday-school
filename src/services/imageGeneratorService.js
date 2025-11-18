/**
 * Image Generator Service
 * Handles creation of shareable verse images with templates
 */

// Predefined templates with different visual styles
export const templates = [
  {
    id: 'gradient-ocean',
    name: 'Ocean Waves',
    background: {
      type: 'gradient',
      colors: ['#667eea', '#764ba2']
    },
    fontPreset: {
      family: 'Georgia, serif',
      size: 32,
      color: '#ffffff',
      lineHeight: 1.6,
      textAlign: 'center'
    }
  },
  {
    id: 'gradient-sunset',
    name: 'Sunset Glow',
    background: {
      type: 'gradient',
      colors: ['#f093fb', '#f5576c']
    },
    fontPreset: {
      family: 'Georgia, serif',
      size: 32,
      color: '#ffffff',
      lineHeight: 1.6,
      textAlign: 'center'
    }
  },
  {
    id: 'gradient-forest',
    name: 'Forest Calm',
    background: {
      type: 'gradient',
      colors: ['#134e5e', '#71b280']
    },
    fontPreset: {
      family: 'Georgia, serif',
      size: 32,
      color: '#ffffff',
      lineHeight: 1.6,
      textAlign: 'center'
    }
  },
  {
    id: 'gradient-royal',
    name: 'Royal Purple',
    background: {
      type: 'gradient',
      colors: ['#360033', '#0b8793']
    },
    fontPreset: {
      family: 'Georgia, serif',
      size: 32,
      color: '#ffffff',
      lineHeight: 1.6,
      textAlign: 'center'
    }
  },
  {
    id: 'solid-light',
    name: 'Clean Light',
    background: {
      type: 'solid',
      color: '#f5f7fa'
    },
    fontPreset: {
      family: 'Arial, sans-serif',
      size: 30,
      color: '#2C3E50',
      lineHeight: 1.6,
      textAlign: 'center'
    }
  },
  {
    id: 'solid-dark',
    name: 'Elegant Dark',
    background: {
      type: 'solid',
      color: '#1a1a2e'
    },
    fontPreset: {
      family: 'Arial, sans-serif',
      size: 30,
      color: '#eaeaea',
      lineHeight: 1.6,
      textAlign: 'center'
    }
  },
  {
    id: 'gradient-morning',
    name: 'Morning Light',
    background: {
      type: 'gradient',
      colors: ['#fa709a', '#fee140']
    },
    fontPreset: {
      family: 'Georgia, serif',
      size: 32,
      color: '#ffffff',
      lineHeight: 1.6,
      textAlign: 'center'
    }
  },
  {
    id: 'gradient-sky',
    name: 'Clear Sky',
    background: {
      type: 'gradient',
      colors: ['#4facfe', '#00f2fe']
    },
    fontPreset: {
      family: 'Georgia, serif',
      size: 32,
      color: '#ffffff',
      lineHeight: 1.6,
      textAlign: 'center'
    }
  }
];

// Font options for customization
export const fontOptions = [
  { value: 'Georgia, serif', label: 'Georgia (Serif)' },
  { value: 'Arial, sans-serif', label: 'Arial (Sans-serif)' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Palatino, serif', label: 'Palatino' }
];

// Text alignment options
export const alignmentOptions = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' }
];

/**
 * Calculate optimal contrast for text readability
 * @param {string} backgroundColor - Hex color code
 * @returns {string} - Either white or black for best contrast
 */
export const getOptimalTextColor = (backgroundColor) => {
  // Remove # if present
  const color = backgroundColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Wrap text to fit within canvas width
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width in pixels
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
 * Generate a shareable image from verse data
 * @param {Object} options - Image generation options
 * @returns {Promise<string>} - Data URL of generated image
 */
export const generateImage = async (options) => {
  const {
    verseText,
    verseReference,
    template,
    customizations = {}
  } = options;

  // Create canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size (optimized for social media - 1200x630 for Facebook/Twitter)
  const width = customizations.width || 1200;
  const height = customizations.height || 630;
  canvas.width = width;
  canvas.height = height;

  // Apply background
  if (template.background.type === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, template.background.colors[0]);
    gradient.addColorStop(1, template.background.colors[1]);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = template.background.color;
  }
  ctx.fillRect(0, 0, width, height);

  // Apply font settings (with customizations)
  const fontSize = customizations.fontSize || template.fontPreset.size;
  const fontFamily = customizations.fontFamily || template.fontPreset.family;
  const textColor = customizations.textColor || template.fontPreset.color;
  const textAlign = customizations.textAlign || template.fontPreset.textAlign;
  const lineHeight = template.fontPreset.lineHeight;

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = textColor;
  ctx.textAlign = textAlign;

  // Calculate text positioning
  const padding = 60;
  const maxWidth = width - (padding * 2);

  // Wrap verse text
  const verseLines = wrapText(ctx, verseText, maxWidth);

  // Set smaller font for reference
  const refFontSize = fontSize * 0.6;
  ctx.font = `italic ${refFontSize}px ${fontFamily}`;
  const referenceLines = wrapText(ctx, `— ${verseReference}`, maxWidth);

  // Calculate total height needed
  const totalLines = verseLines.length + referenceLines.length + 1; // +1 for spacing
  const lineSpacing = fontSize * lineHeight;
  const totalTextHeight = totalLines * lineSpacing;

  // Start Y position (centered vertically)
  let currentY = (height - totalTextHeight) / 2 + fontSize;

  // Set alignment X position
  let alignX;
  if (textAlign === 'center') {
    alignX = width / 2;
  } else if (textAlign === 'right') {
    alignX = width - padding;
  } else {
    alignX = padding;
  }

  // Draw verse text
  ctx.font = `${fontSize}px ${fontFamily}`;
  verseLines.forEach((line) => {
    ctx.fillText(line, alignX, currentY);
    currentY += lineSpacing;
  });

  // Add spacing before reference
  currentY += lineSpacing * 0.5;

  // Draw reference
  ctx.font = `italic ${refFontSize}px ${fontFamily}`;
  referenceLines.forEach((line) => {
    ctx.fillText(line, alignX, currentY);
    currentY += refFontSize * lineHeight;
  });

  // Optional: Add watermark/logo
  if (customizations.includeWatermark) {
    ctx.font = '14px Arial, sans-serif';
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.5;
    ctx.textAlign = 'right';
    ctx.fillText('Teen Sunday School', width - 20, height - 20);
    ctx.globalAlpha = 1.0;
  }

  // Convert canvas to data URL
  return canvas.toDataURL('image/png');
};

/**
 * Download image to device
 * @param {string} dataUrl - Image data URL
 * @param {string} filename - Filename for download
 */
export const downloadImage = (dataUrl, filename = 'verse-image.png') => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copy image to clipboard
 * @param {string} dataUrl - Image data URL
 * @returns {Promise<void>}
 */
export const copyImageToClipboard = async (dataUrl) => {
  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);

    return true;
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
    throw error;
  }
};

/**
 * Share image using Web Share API
 * @param {string} dataUrl - Image data URL
 * @param {string} verseReference - Verse reference for share text
 * @returns {Promise<void>}
 */
export const shareImage = async (dataUrl, verseReference) => {
  try {
    // Check if Web Share API is supported
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Create file from blob
    const file = new File([blob], 'verse-image.png', { type: 'image/png' });

    // Share
    await navigator.share({
      title: 'Bible Verse',
      text: verseReference,
      files: [file]
    });

    return true;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Failed to share image:', error);
      throw error;
    }
    return false;
  }
};

/**
 * Save generated image to localStorage
 * @param {Object} imageData - Image metadata and data URL
 */
export const saveImageToStorage = (imageData) => {
  const storageKey = 'quoteImageGenerator';

  // Get existing saved images
  const existing = localStorage.getItem(storageKey);
  const savedImages = existing ? JSON.parse(existing) : { images: [] };

  // Add new image
  savedImages.images.unshift({
    ...imageData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  });

  // Limit to 20 most recent images
  if (savedImages.images.length > 20) {
    savedImages.images = savedImages.images.slice(0, 20);
  }

  // Save back to localStorage
  localStorage.setItem(storageKey, JSON.stringify(savedImages));
};

/**
 * Get saved images from localStorage
 * @returns {Array} - Array of saved image objects
 */
export const getSavedImages = () => {
  const storageKey = 'quoteImageGenerator';
  const data = localStorage.getItem(storageKey);

  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return parsed.images || [];
  } catch (error) {
    console.error('Failed to parse saved images:', error);
    return [];
  }
};

/**
 * Delete saved image from localStorage
 * @param {string} imageId - ID of image to delete
 */
export const deleteSavedImage = (imageId) => {
  const storageKey = 'quoteImageGenerator';
  const data = localStorage.getItem(storageKey);

  if (!data) return;

  try {
    const parsed = JSON.parse(data);
    parsed.images = parsed.images.filter(img => img.id !== imageId);
    localStorage.setItem(storageKey, JSON.stringify(parsed));
  } catch (error) {
    console.error('Failed to delete saved image:', error);
  }
};
