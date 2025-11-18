/**
 * Meme Generator Service
 * Handles creation of wholesome, faith-based memes with predefined templates
 */

// Predefined wholesome meme templates
export const memeTemplates = [
  {
    id: 'success-kid',
    name: 'Success Kid',
    description: 'Celebrating spiritual victories',
    background: {
      type: 'gradient',
      colors: ['#f093fb', '#f5576c']
    },
    textAreas: [
      { id: 'top', label: 'Top Text', defaultY: 80, fontSize: 48, strokeWidth: 3 },
      { id: 'bottom', label: 'Bottom Text', defaultY: 550, fontSize: 48, strokeWidth: 3 }
    ]
  },
  {
    id: 'drake-meme',
    name: 'Drake Preference',
    description: 'Choosing what\'s right',
    background: {
      type: 'split',
      leftColor: '#4facfe',
      rightColor: '#00f2fe'
    },
    textAreas: [
      { id: 'reject', label: 'Reject (Top)', defaultY: 180, fontSize: 40, strokeWidth: 2 },
      { id: 'accept', label: 'Accept (Bottom)', defaultY: 470, fontSize: 40, strokeWidth: 2 }
    ]
  },
  {
    id: 'distracted-boyfriend',
    name: 'Distracted Choice',
    description: 'Temptation vs. Faith',
    background: {
      type: 'gradient',
      colors: ['#667eea', '#764ba2']
    },
    textAreas: [
      { id: 'distraction', label: 'Distraction (Left)', defaultY: 520, fontSize: 36, strokeWidth: 2, align: 'left', offsetX: 100 },
      { id: 'boyfriend', label: 'Person (Center)', defaultY: 120, fontSize: 32, strokeWidth: 2, align: 'center' },
      { id: 'girlfriend', label: 'Right Choice (Right)', defaultY: 520, fontSize: 36, strokeWidth: 2, align: 'right', offsetX: -100 }
    ]
  },
  {
    id: 'two-buttons',
    name: 'Two Buttons',
    description: 'Difficult choices',
    background: {
      type: 'gradient',
      colors: ['#fa709a', '#fee140']
    },
    textAreas: [
      { id: 'button1', label: 'Button 1 (Left)', defaultY: 200, fontSize: 32, strokeWidth: 2, align: 'left', offsetX: 150 },
      { id: 'button2', label: 'Button 2 (Right)', defaultY: 200, fontSize: 32, strokeWidth: 2, align: 'right', offsetX: -150 },
      { id: 'bottom', label: 'Bottom Text', defaultY: 550, fontSize: 42, strokeWidth: 3 }
    ]
  },
  {
    id: 'expanding-brain',
    name: 'Expanding Brain',
    description: 'Progressive wisdom',
    background: {
      type: 'gradient',
      colors: ['#134e5e', '#71b280']
    },
    textAreas: [
      { id: 'level1', label: 'Level 1 (Basic)', defaultY: 140, fontSize: 32, strokeWidth: 2 },
      { id: 'level2', label: 'Level 2 (Better)', defaultY: 280, fontSize: 32, strokeWidth: 2 },
      { id: 'level3', label: 'Level 3 (Great)', defaultY: 420, fontSize: 32, strokeWidth: 2 },
      { id: 'level4', label: 'Level 4 (Enlightened)', defaultY: 560, fontSize: 32, strokeWidth: 2 }
    ]
  },
  {
    id: 'change-my-mind',
    name: 'Change My Mind',
    description: 'Bold faith statements',
    background: {
      type: 'solid',
      color: '#f5f7fa'
    },
    textAreas: [
      { id: 'statement', label: 'Statement', defaultY: 350, fontSize: 44, strokeWidth: 3, textColor: '#2C3E50' }
    ]
  },
  {
    id: 'this-is-fine',
    name: 'This Is Fine',
    description: 'God\'s got this',
    background: {
      type: 'gradient',
      colors: ['#ff9a56', '#ff6a00']
    },
    textAreas: [
      { id: 'top', label: 'Top Text', defaultY: 80, fontSize: 48, strokeWidth: 3 },
      { id: 'bottom', label: 'Bottom Text', defaultY: 550, fontSize: 48, strokeWidth: 3 }
    ]
  },
  {
    id: 'is-this',
    name: 'Is This...?',
    description: 'Questioning life',
    background: {
      type: 'gradient',
      colors: ['#360033', '#0b8793']
    },
    textAreas: [
      { id: 'butterfly', label: 'Object (Top)', defaultY: 120, fontSize: 38, strokeWidth: 2 },
      { id: 'person', label: 'Person (Middle)', defaultY: 320, fontSize: 34, strokeWidth: 2, align: 'left', offsetX: 150 },
      { id: 'question', label: 'Question (Bottom)', defaultY: 540, fontSize: 42, strokeWidth: 3 }
    ]
  },
  {
    id: 'woman-yelling-cat',
    name: 'Woman Yelling at Cat',
    description: 'Two perspectives',
    background: {
      type: 'split',
      leftColor: '#f093fb',
      rightColor: '#f5576c'
    },
    textAreas: [
      { id: 'left', label: 'Left Side', defaultY: 280, fontSize: 36, strokeWidth: 2, align: 'left', offsetX: 150 },
      { id: 'right', label: 'Right Side', defaultY: 280, fontSize: 36, strokeWidth: 2, align: 'right', offsetX: -150 }
    ]
  },
  {
    id: 'always-has-been',
    name: 'Always Has Been',
    description: 'Eternal truths',
    background: {
      type: 'gradient',
      colors: ['#1a1a2e', '#16213e']
    },
    textAreas: [
      { id: 'realization', label: 'Realization', defaultY: 150, fontSize: 38, strokeWidth: 2, align: 'left', offsetX: 120 },
      { id: 'response', label: 'Response', defaultY: 450, fontSize: 38, strokeWidth: 2, align: 'right', offsetX: -120 }
    ]
  }
];

// Example memes for inspiration
export const exampleMemes = [
  {
    templateId: 'success-kid',
    texts: {
      top: 'READ MY BIBLE',
      bottom: 'ACTUALLY UNDERSTOOD IT'
    }
  },
  {
    templateId: 'drake-meme',
    texts: {
      reject: 'Worrying about everything',
      accept: 'Trusting God with everything'
    }
  },
  {
    templateId: 'distracted-boyfriend',
    texts: {
      distraction: 'Worldly Distractions',
      boyfriend: 'Me',
      girlfriend: 'God\'s Plan'
    }
  },
  {
    templateId: 'change-my-mind',
    texts: {
      statement: 'Jesus loves you\nCHANGE MY MIND'
    }
  },
  {
    templateId: 'expanding-brain',
    texts: {
      level1: 'Going to church',
      level2: 'Reading the Bible',
      level3: 'Praying daily',
      level4: 'Living like Christ'
    }
  }
];

// Font options for meme text
export const memeFontOptions = [
  { value: 'Impact, sans-serif', label: 'Impact (Classic Meme)' },
  { value: 'Arial Black, sans-serif', label: 'Arial Black (Bold)' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica (Clean)' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans (Fun)' },
  { value: 'Georgia, serif', label: 'Georgia (Elegant)' }
];

/**
 * Wrap text to fit within canvas width
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width in pixels
 * @returns {string[]} - Array of wrapped lines
 */
const wrapText = (context, text, maxWidth) => {
  // Handle explicit line breaks
  const paragraphs = text.split('\n');
  const allLines = [];

  paragraphs.forEach(paragraph => {
    const words = paragraph.split(' ');
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
    allLines.push(...lines);
  });

  return allLines;
};

/**
 * Draw text with outline (stroke) for better readability
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to draw
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} strokeWidth - Width of outline
 */
const drawTextWithOutline = (ctx, text, x, y, strokeWidth = 3) => {
  // Draw stroke (outline)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeText(text, x, y);

  // Draw fill (main text)
  ctx.fillText(text, x, y);
};

/**
 * Generate a meme image from template and text inputs
 * @param {Object} options - Meme generation options
 * @returns {Promise<string>} - Data URL of generated meme
 */
export const generateMeme = async (options) => {
  const {
    template,
    texts = {},
    customizations = {}
  } = options;

  // Create canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size (square format for social media - 800x600)
  const width = customizations.width || 800;
  const height = customizations.height || 600;
  canvas.width = width;
  canvas.height = height;

  // Apply background
  if (template.background.type === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, template.background.colors[0]);
    gradient.addColorStop(1, template.background.colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else if (template.background.type === 'split') {
    // Left half
    ctx.fillStyle = template.background.leftColor;
    ctx.fillRect(0, 0, width / 2, height);
    // Right half
    ctx.fillStyle = template.background.rightColor;
    ctx.fillRect(width / 2, 0, width / 2, height);
  } else {
    ctx.fillStyle = template.background.color;
    ctx.fillRect(0, 0, width, height);
  }

  // Get font family
  const fontFamily = customizations.fontFamily || 'Impact, sans-serif';

  // Draw each text area
  template.textAreas.forEach(textArea => {
    const text = texts[textArea.id];
    if (!text || text.trim() === '') return;

    // Set font
    const fontSize = customizations.fontSize || textArea.fontSize || 48;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textArea.textColor || customizations.textColor || '#ffffff';
    ctx.textAlign = textArea.align || 'center';
    ctx.textBaseline = 'middle';

    // Calculate text position
    const padding = 40;
    const maxWidth = width - (padding * 2);

    let textX;
    if (textArea.align === 'left') {
      textX = (textArea.offsetX || 0) + padding;
    } else if (textArea.align === 'right') {
      textX = width + (textArea.offsetX || 0) - padding;
    } else {
      textX = width / 2 + (textArea.offsetX || 0);
    }

    // Wrap text if needed
    const lines = wrapText(ctx, text.toUpperCase(), maxWidth);

    // Calculate starting Y position
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    let currentY = textArea.defaultY - (totalHeight / 2) + (fontSize / 2);

    // Draw each line with outline
    lines.forEach(line => {
      drawTextWithOutline(ctx, line, textX, currentY, textArea.strokeWidth || 3);
      currentY += lineHeight;
    });
  });

  // Optional: Add watermark
  if (customizations.includeWatermark) {
    ctx.font = '14px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    drawTextWithOutline(ctx, 'Teen Sunday School', width - 15, height - 15, 2);
    ctx.globalAlpha = 1.0;
  }

  // Convert canvas to data URL
  return canvas.toDataURL('image/png');
};

/**
 * Download meme to device
 * @param {string} dataUrl - Meme data URL
 * @param {string} filename - Filename for download
 */
export const downloadMeme = (dataUrl, filename = 'wholesome-meme.png') => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copy meme to clipboard
 * @param {string} dataUrl - Meme data URL
 * @returns {Promise<boolean>}
 */
export const copyMemeToClipboard = async (dataUrl) => {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);

    return true;
  } catch (error) {
    console.error('Failed to copy meme to clipboard:', error);
    throw error;
  }
};

/**
 * Share meme using Web Share API
 * @param {string} dataUrl - Meme data URL
 * @param {string} templateName - Template name for share text
 * @returns {Promise<boolean>}
 */
export const shareMeme = async (dataUrl, templateName) => {
  try {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'wholesome-meme.png', { type: 'image/png' });

    await navigator.share({
      title: 'Wholesome Meme',
      text: `Check out this ${templateName} meme!`,
      files: [file]
    });

    return true;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Failed to share meme:', error);
      throw error;
    }
    return false;
  }
};

/**
 * Save generated meme to localStorage
 * @param {Object} memeData - Meme metadata and data URL
 */
export const saveMemeToStorage = (memeData) => {
  const storageKey = 'memeGenerator';

  // Get existing saved memes
  const existing = localStorage.getItem(storageKey);
  const savedMemes = existing ? JSON.parse(existing) : { memes: [] };

  // Add new meme
  savedMemes.memes.unshift({
    ...memeData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  });

  // Limit to 30 most recent memes
  if (savedMemes.memes.length > 30) {
    savedMemes.memes = savedMemes.memes.slice(0, 30);
  }

  // Save back to localStorage
  localStorage.setItem(storageKey, JSON.stringify(savedMemes));
};

/**
 * Get saved memes from localStorage
 * @returns {Array} - Array of saved meme objects
 */
export const getSavedMemes = () => {
  const storageKey = 'memeGenerator';
  const data = localStorage.getItem(storageKey);

  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return parsed.memes || [];
  } catch (error) {
    console.error('Failed to parse saved memes:', error);
    return [];
  }
};

/**
 * Delete saved meme from localStorage
 * @param {string} memeId - ID of meme to delete
 */
export const deleteSavedMeme = (memeId) => {
  const storageKey = 'memeGenerator';
  const data = localStorage.getItem(storageKey);

  if (!data) return;

  try {
    const parsed = JSON.parse(data);
    parsed.memes = parsed.memes.filter(meme => meme.id !== memeId);
    localStorage.setItem(storageKey, JSON.stringify(parsed));
  } catch (error) {
    console.error('Failed to delete saved meme:', error);
  }
};
