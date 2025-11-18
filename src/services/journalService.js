/**
 * Scripture Journaling Service
 * Handles creation of pretty journaling templates with decorative layouts
 */

// Predefined templates with decorative styles
export const templates = [
  {
    id: 'floral-border',
    name: 'Floral Border',
    description: 'Delicate floral border with writing space',
    layout: 'top-verse-bottom-notes',
    decorations: {
      type: 'floral',
      borders: true,
      corners: true
    },
    background: {
      type: 'gradient',
      colors: ['#fff5f7', '#ffe8ec']
    },
    accent: '#d4869c',
    fontPreset: {
      family: 'Georgia, serif',
      verseSize: 28,
      notesSize: 16,
      color: '#4a4a4a',
      lineHeight: 1.8
    }
  },
  {
    id: 'geometric-modern',
    name: 'Geometric Modern',
    description: 'Clean geometric patterns with modern style',
    layout: 'left-verse-right-notes',
    decorations: {
      type: 'geometric',
      borders: true,
      patterns: ['triangles', 'lines']
    },
    background: {
      type: 'solid',
      color: '#f8f9fa'
    },
    accent: '#667eea',
    fontPreset: {
      family: 'Arial, sans-serif',
      verseSize: 26,
      notesSize: 16,
      color: '#2c3e50',
      lineHeight: 1.7
    }
  },
  {
    id: 'vintage-ornate',
    name: 'Vintage Ornate',
    description: 'Elegant vintage ornamental design',
    layout: 'centered-with-margins',
    decorations: {
      type: 'vintage',
      borders: true,
      ornaments: true
    },
    background: {
      type: 'gradient',
      colors: ['#faf8f3', '#f5f0e8']
    },
    accent: '#8b7355',
    fontPreset: {
      family: 'Georgia, serif',
      verseSize: 30,
      notesSize: 16,
      color: '#3d3d3d',
      lineHeight: 1.9
    }
  },
  {
    id: 'watercolor-soft',
    name: 'Watercolor Soft',
    description: 'Soft watercolor wash background',
    layout: 'top-verse-bottom-notes',
    decorations: {
      type: 'watercolor',
      borders: false,
      splashes: true
    },
    background: {
      type: 'gradient',
      colors: ['#e3f2fd', '#f3e5f5']
    },
    accent: '#9c27b0',
    fontPreset: {
      family: 'Georgia, serif',
      verseSize: 28,
      notesSize: 16,
      color: '#424242',
      lineHeight: 1.8
    }
  },
  {
    id: 'minimalist-elegant',
    name: 'Minimalist Elegant',
    description: 'Simple and elegant with clean lines',
    layout: 'centered-with-margins',
    decorations: {
      type: 'minimalist',
      borders: true,
      lines: true
    },
    background: {
      type: 'solid',
      color: '#ffffff'
    },
    accent: '#000000',
    fontPreset: {
      family: 'Helvetica, sans-serif',
      verseSize: 32,
      notesSize: 16,
      color: '#1a1a1a',
      lineHeight: 1.6
    }
  },
  {
    id: 'botanical-garden',
    name: 'Botanical Garden',
    description: 'Lush botanical elements and leaves',
    layout: 'left-verse-right-notes',
    decorations: {
      type: 'botanical',
      borders: true,
      leaves: true
    },
    background: {
      type: 'gradient',
      colors: ['#f1f8f4', '#e8f5e9']
    },
    accent: '#43a047',
    fontPreset: {
      family: 'Georgia, serif',
      verseSize: 27,
      notesSize: 16,
      color: '#2e5d3a',
      lineHeight: 1.8
    }
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: 'Warm sunset colors with rays',
    layout: 'top-verse-bottom-notes',
    decorations: {
      type: 'sunset',
      borders: false,
      rays: true
    },
    background: {
      type: 'gradient',
      colors: ['#fff9e6', '#ffe0b2']
    },
    accent: '#ff6f00',
    fontPreset: {
      family: 'Georgia, serif',
      verseSize: 29,
      notesSize: 16,
      color: '#5d4037',
      lineHeight: 1.7
    }
  },
  {
    id: 'starry-night',
    name: 'Starry Night',
    description: 'Dark celestial theme with stars',
    layout: 'centered-with-margins',
    decorations: {
      type: 'celestial',
      borders: true,
      stars: true
    },
    background: {
      type: 'gradient',
      colors: ['#1a237e', '#311b92']
    },
    accent: '#ffd700',
    fontPreset: {
      family: 'Georgia, serif',
      verseSize: 28,
      notesSize: 16,
      color: '#ffffff',
      lineHeight: 1.8
    }
  }
];

// Layout types
export const layoutTypes = {
  'top-verse-bottom-notes': {
    name: 'Top Verse, Bottom Notes',
    description: 'Scripture at top, lined space below for journaling'
  },
  'left-verse-right-notes': {
    name: 'Side by Side',
    description: 'Scripture on left, notes space on right'
  },
  'centered-with-margins': {
    name: 'Centered with Margins',
    description: 'Centered scripture with wide decorative margins'
  }
};

/**
 * Wrap text to fit within specified width
 */
const wrapText = (context, text, maxWidth) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + words[i] + ' ';
    const metrics = context.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
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
 * Draw decorative floral elements
 */
const drawFloralDecorations = (ctx, width, height, accent) => {
  ctx.strokeStyle = accent;
  ctx.fillStyle = accent;
  ctx.lineWidth = 2;

  // Corner flowers
  const corners = [
    { x: 40, y: 40 },
    { x: width - 40, y: 40 },
    { x: 40, y: height - 40 },
    { x: width - 40, y: height - 40 }
  ];

  corners.forEach(corner => {
    // Simple flower petals
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const petalX = corner.x + Math.cos(angle) * 15;
      const petalY = corner.y + Math.sin(angle) * 15;

      ctx.beginPath();
      ctx.arc(petalX, petalY, 8, 0, Math.PI * 2);
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Decorative border vines
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  for (let x = 60; x < width - 60; x += 20) {
    const y = 30 + Math.sin(x / 40) * 10;
    if (x === 60) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let x = 60; x < width - 60; x += 20) {
    const y = height - 30 + Math.sin(x / 40) * 10;
    if (x === 60) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
};

/**
 * Draw geometric patterns
 */
const drawGeometricDecorations = (ctx, width, height, accent) => {
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3;

  // Corner triangles
  const size = 40;
  const corners = [
    { x: 30, y: 30, angles: [0, 90] },
    { x: width - 30, y: 30, angles: [90, 180] },
    { x: 30, y: height - 30, angles: [270, 0] },
    { x: width - 30, y: height - 30, angles: [180, 270] }
  ];

  corners.forEach(corner => {
    ctx.beginPath();
    ctx.moveTo(corner.x, corner.y);
    ctx.lineTo(corner.x + size, corner.y);
    ctx.lineTo(corner.x, corner.y + size);
    ctx.closePath();
    ctx.stroke();
  });

  // Side patterns
  for (let y = 100; y < height - 100; y += 50) {
    // Left side
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(40, y + 20);
    ctx.lineTo(20, y + 40);
    ctx.stroke();

    // Right side
    ctx.beginPath();
    ctx.moveTo(width - 20, y);
    ctx.lineTo(width - 40, y + 20);
    ctx.lineTo(width - 20, y + 40);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
};

/**
 * Draw vintage ornaments
 */
const drawVintageDecorations = (ctx, width, height, accent) => {
  ctx.strokeStyle = accent;
  ctx.fillStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.4;

  // Ornate corners
  const cornerSize = 50;

  // Top left ornament
  ctx.beginPath();
  ctx.moveTo(30, 60);
  ctx.quadraticCurveTo(30, 30, 60, 30);
  ctx.stroke();

  // Top right ornament
  ctx.beginPath();
  ctx.moveTo(width - 60, 30);
  ctx.quadraticCurveTo(width - 30, 30, width - 30, 60);
  ctx.stroke();

  // Bottom left ornament
  ctx.beginPath();
  ctx.moveTo(30, height - 60);
  ctx.quadraticCurveTo(30, height - 30, 60, height - 30);
  ctx.stroke();

  // Bottom right ornament
  ctx.beginPath();
  ctx.moveTo(width - 60, height - 30);
  ctx.quadraticCurveTo(width - 30, height - 30, width - 30, height - 60);
  ctx.stroke();

  // Decorative center top and bottom flourishes
  ctx.beginPath();
  ctx.moveTo(width / 2 - 40, 25);
  ctx.quadraticCurveTo(width / 2, 15, width / 2 + 40, 25);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width / 2 - 40, height - 25);
  ctx.quadraticCurveTo(width / 2, height - 15, width / 2 + 40, height - 25);
  ctx.stroke();

  ctx.globalAlpha = 1;
};

/**
 * Draw watercolor splashes
 */
const drawWatercolorDecorations = (ctx, width, height, accent) => {
  ctx.fillStyle = accent;

  // Random watercolor splashes in corners
  const splashes = [
    { x: 50, y: 50, radius: 40 },
    { x: width - 50, y: 60, radius: 45 },
    { x: 60, y: height - 50, radius: 35 },
    { x: width - 70, y: height - 60, radius: 50 }
  ];

  splashes.forEach(splash => {
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.05 + i * 0.02;
      ctx.beginPath();
      ctx.arc(splash.x, splash.y, splash.radius + i * 10, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  ctx.globalAlpha = 1;
};

/**
 * Draw botanical leaves
 */
const drawBotanicalDecorations = (ctx, width, height, accent) => {
  ctx.strokeStyle = accent;
  ctx.fillStyle = accent;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.25;

  // Leaves in corners
  const drawLeaf = (x, y, rotation) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(15, -10, 30, 0);
    ctx.quadraticCurveTo(15, 10, 0, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();

    ctx.restore();
  };

  drawLeaf(40, 40, -Math.PI / 4);
  drawLeaf(width - 40, 40, Math.PI / 4);
  drawLeaf(40, height - 40, -3 * Math.PI / 4);
  drawLeaf(width - 40, height - 40, 3 * Math.PI / 4);

  ctx.globalAlpha = 1;
};

/**
 * Draw celestial stars
 */
const drawCelestialDecorations = (ctx, width, height, accent) => {
  ctx.fillStyle = accent;
  ctx.strokeStyle = accent;

  // Random stars
  const starCount = 30;
  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2 + 1;

    ctx.globalAlpha = Math.random() * 0.5 + 0.3;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Larger decorative stars in corners
  const drawStar = (x, y, size) => {
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const pointX = x + Math.cos(angle) * size;
      const pointY = y + Math.sin(angle) * size;

      if (i === 0) ctx.moveTo(pointX, pointY);
      else ctx.lineTo(pointX, pointY);

      const innerAngle = angle + Math.PI / 5;
      const innerX = x + Math.cos(innerAngle) * (size / 2);
      const innerY = y + Math.sin(innerAngle) * (size / 2);
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
  };

  drawStar(60, 60, 15);
  drawStar(width - 60, 60, 12);
  drawStar(60, height - 60, 13);
  drawStar(width - 60, height - 60, 14);

  ctx.globalAlpha = 1;
};

/**
 * Draw minimalist lines
 */
const drawMinimalistDecorations = (ctx, width, height, accent) => {
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;

  // Simple corner brackets
  const bracketSize = 30;

  // Top left
  ctx.beginPath();
  ctx.moveTo(40, 60);
  ctx.lineTo(40, 40);
  ctx.lineTo(60, 40);
  ctx.stroke();

  // Top right
  ctx.beginPath();
  ctx.moveTo(width - 60, 40);
  ctx.lineTo(width - 40, 40);
  ctx.lineTo(width - 40, 60);
  ctx.stroke();

  // Bottom left
  ctx.beginPath();
  ctx.moveTo(40, height - 60);
  ctx.lineTo(40, height - 40);
  ctx.lineTo(60, height - 40);
  ctx.stroke();

  // Bottom right
  ctx.beginPath();
  ctx.moveTo(width - 60, height - 40);
  ctx.lineTo(width - 40, height - 40);
  ctx.lineTo(width - 40, height - 60);
  ctx.stroke();

  ctx.globalAlpha = 1;
};

/**
 * Draw decorations based on template type
 */
const drawDecorations = (ctx, width, height, template) => {
  const { decorations, accent } = template;

  switch (decorations.type) {
    case 'floral':
      drawFloralDecorations(ctx, width, height, accent);
      break;
    case 'geometric':
      drawGeometricDecorations(ctx, width, height, accent);
      break;
    case 'vintage':
      drawVintageDecorations(ctx, width, height, accent);
      break;
    case 'watercolor':
      drawWatercolorDecorations(ctx, width, height, accent);
      break;
    case 'botanical':
      drawBotanicalDecorations(ctx, width, height, accent);
      break;
    case 'celestial':
      drawCelestialDecorations(ctx, width, height, accent);
      break;
    case 'minimalist':
      drawMinimalistDecorations(ctx, width, height, accent);
      break;
  }
};

/**
 * Draw lined paper for journaling
 */
const drawLines = (ctx, startY, endY, lineHeight, leftMargin, rightMargin, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.2;

  for (let y = startY; y < endY; y += lineHeight) {
    ctx.beginPath();
    ctx.moveTo(leftMargin, y);
    ctx.lineTo(rightMargin, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
};

/**
 * Generate journaling template image
 */
export const generateJournalPage = async (options) => {
  const {
    verseText,
    verseReference,
    template,
    customizations = {},
    notesText = ''
  } = options;

  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size (letter size for printing: 8.5" x 11" at 150 DPI)
  const width = 1275;
  const height = 1650;
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

  // Draw decorations
  drawDecorations(ctx, width, height, template);

  // Layout-specific rendering
  const { layout } = template;
  const { fontPreset } = template;
  const padding = 100;
  const innerPadding = 80;

  if (layout === 'top-verse-bottom-notes') {
    // Top section: Verse
    const verseAreaHeight = height * 0.35;

    ctx.font = `${fontPreset.verseSize}px ${fontPreset.family}`;
    ctx.fillStyle = fontPreset.color;
    ctx.textAlign = 'center';

    const verseLines = wrapText(ctx, verseText, width - padding * 2);
    const lineHeight = fontPreset.verseSize * fontPreset.lineHeight;

    let currentY = padding + fontPreset.verseSize + 50;
    verseLines.forEach(line => {
      ctx.fillText(line, width / 2, currentY);
      currentY += lineHeight;
    });

    // Reference
    ctx.font = `italic ${fontPreset.verseSize * 0.7}px ${fontPreset.family}`;
    ctx.fillText(`— ${verseReference}`, width / 2, currentY + 20);

    // Bottom section: Lined journaling space
    const notesStartY = verseAreaHeight + 100;
    const notesEndY = height - padding;

    // Add "Notes & Reflections" header
    ctx.font = `600 ${fontPreset.notesSize + 2}px ${fontPreset.family}`;
    ctx.fillStyle = template.accent;
    ctx.fillText('Notes & Reflections', width / 2, notesStartY - 30);

    // Draw lines
    ctx.fillStyle = fontPreset.color;
    drawLines(ctx, notesStartY, notesEndY, 30, innerPadding, width - innerPadding, fontPreset.color);

    // If custom notes provided, render them
    if (notesText) {
      ctx.font = `${fontPreset.notesSize}px ${fontPreset.family}`;
      ctx.textAlign = 'left';
      const notesLines = wrapText(ctx, notesText, width - innerPadding * 2);
      let notesY = notesStartY + 5;
      notesLines.forEach(line => {
        if (notesY < notesEndY - 20) {
          ctx.fillText(line, innerPadding + 10, notesY);
          notesY += 30;
        }
      });
    }

  } else if (layout === 'left-verse-right-notes') {
    // Split canvas vertically
    const midX = width / 2;

    // Left section: Verse
    ctx.font = `${fontPreset.verseSize}px ${fontPreset.family}`;
    ctx.fillStyle = fontPreset.color;
    ctx.textAlign = 'center';

    const verseLines = wrapText(ctx, verseText, midX - padding - 40);
    const lineHeight = fontPreset.verseSize * fontPreset.lineHeight;

    let currentY = height / 2 - (verseLines.length * lineHeight) / 2;
    verseLines.forEach(line => {
      ctx.fillText(line, midX / 2, currentY);
      currentY += lineHeight;
    });

    // Reference
    ctx.font = `italic ${fontPreset.verseSize * 0.7}px ${fontPreset.family}`;
    ctx.fillText(`— ${verseReference}`, midX / 2, currentY + 20);

    // Vertical divider
    ctx.strokeStyle = template.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(midX, padding + 50);
    ctx.lineTo(midX, height - padding - 50);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Right section: Notes
    ctx.font = `600 ${fontPreset.notesSize + 2}px ${fontPreset.family}`;
    ctx.fillStyle = template.accent;
    ctx.textAlign = 'center';
    ctx.fillText('My Reflections', midX + midX / 2, padding + 70);

    // Draw lines
    ctx.fillStyle = fontPreset.color;
    const notesStartY = padding + 100;
    const notesEndY = height - padding;
    drawLines(ctx, notesStartY, notesEndY, 30, midX + 40, width - innerPadding, fontPreset.color);

    // If custom notes provided
    if (notesText) {
      ctx.font = `${fontPreset.notesSize}px ${fontPreset.family}`;
      ctx.textAlign = 'left';
      const notesLines = wrapText(ctx, notesText, midX - 80);
      let notesY = notesStartY + 5;
      notesLines.forEach(line => {
        if (notesY < notesEndY - 20) {
          ctx.fillText(line, midX + 50, notesY);
          notesY += 30;
        }
      });
    }

  } else if (layout === 'centered-with-margins') {
    // Center verse with wide decorative margins
    ctx.font = `${fontPreset.verseSize}px ${fontPreset.family}`;
    ctx.fillStyle = fontPreset.color;
    ctx.textAlign = 'center';

    const verseLines = wrapText(ctx, verseText, width * 0.6);
    const lineHeight = fontPreset.verseSize * fontPreset.lineHeight;

    let currentY = height / 3;
    verseLines.forEach(line => {
      ctx.fillText(line, width / 2, currentY);
      currentY += lineHeight;
    });

    // Reference
    ctx.font = `italic ${fontPreset.verseSize * 0.7}px ${fontPreset.family}`;
    ctx.fillText(`— ${verseReference}`, width / 2, currentY + 30);

    // Bottom margin notes section
    ctx.font = `600 ${fontPreset.notesSize + 2}px ${fontPreset.family}`;
    ctx.fillStyle = template.accent;
    ctx.fillText('Reflections', width / 2, height - 350);

    // Draw lines in bottom margin
    ctx.fillStyle = fontPreset.color;
    const notesStartY = height - 320;
    const notesEndY = height - padding;
    drawLines(ctx, notesStartY, notesEndY, 30, padding + 60, width - padding - 60, fontPreset.color);

    // If custom notes provided
    if (notesText) {
      ctx.font = `${fontPreset.notesSize}px ${fontPreset.family}`;
      ctx.textAlign = 'left';
      const notesLines = wrapText(ctx, notesText, width - (padding + 60) * 2);
      let notesY = notesStartY + 5;
      notesLines.forEach(line => {
        if (notesY < notesEndY - 20) {
          ctx.fillText(line, padding + 70, notesY);
          notesY += 30;
        }
      });
    }
  }

  // Convert to data URL
  return canvas.toDataURL('image/png');
};

/**
 * Download journal page as PNG
 */
export const downloadJournalPage = (dataUrl, filename = 'scripture-journal.png') => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Print journal page
 */
export const printJournalPage = (dataUrl) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Scripture Journal</title>
      <style>
        body { margin: 0; padding: 0; }
        img { width: 100%; height: auto; display: block; }
        @media print {
          body { margin: 0; }
          img { page-break-after: avoid; }
        }
      </style>
    </head>
    <body>
      <img src="${dataUrl}" />
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

/**
 * Save journal page to localStorage
 */
export const saveJournalPage = (journalData) => {
  const storageKey = 'scriptureJournalPages';

  const existing = localStorage.getItem(storageKey);
  const saved = existing ? JSON.parse(existing) : { pages: [] };

  saved.pages.unshift({
    ...journalData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  });

  // Limit to 30 most recent
  if (saved.pages.length > 30) {
    saved.pages = saved.pages.slice(0, 30);
  }

  localStorage.setItem(storageKey, JSON.stringify(saved));
};

/**
 * Get saved journal pages
 */
export const getSavedJournalPages = () => {
  const storageKey = 'scriptureJournalPages';
  const data = localStorage.getItem(storageKey);

  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return parsed.pages || [];
  } catch (error) {
    console.error('Failed to parse saved pages:', error);
    return [];
  }
};

/**
 * Delete saved journal page
 */
export const deleteJournalPage = (pageId) => {
  const storageKey = 'scriptureJournalPages';
  const data = localStorage.getItem(storageKey);

  if (!data) return;

  try {
    const parsed = JSON.parse(data);
    parsed.pages = parsed.pages.filter(page => page.id !== pageId);
    localStorage.setItem(storageKey, JSON.stringify(parsed));
  } catch (error) {
    console.error('Failed to delete page:', error);
  }
};
