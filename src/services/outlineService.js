import axios from 'axios';
import bibleAPI from './bibleAPI';

/**
 * Generate a teaching outline using AI (Anthropic Claude)
 * Requires REACT_APP_ANTHROPIC_API_KEY environment variable
 */
export const generateOutlineWithAI = async (passageRef, passageText) => {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('AI generation requires REACT_APP_ANTHROPIC_API_KEY to be configured');
  }

  try {
    const prompt = `You are a Sunday school teacher creating a teaching outline for teenagers.

Passage: ${passageRef}
Text: ${passageText}

Create a comprehensive teaching outline with the following structure:
1. A catchy, teen-friendly title
2. Main theme/big idea (1-2 sentences)
3. 3-5 main sections with:
   - Section heading
   - 2-4 key points per section
   - Supporting verses (can reference other Bible passages)
   - Discussion questions for teens
4. Practical application for teenagers
5. Closing prayer points

Format the response as JSON with this structure:
{
  "title": "...",
  "theme": "...",
  "sections": [
    {
      "heading": "...",
      "keyPoints": ["...", "..."],
      "supportingVerses": ["...", "..."],
      "discussionQuestions": ["...", "..."]
    }
  ],
  "application": "...",
  "prayerPoints": ["...", "..."]
}

Make it engaging, relevant, and appropriate for teenagers in a Sunday school setting.`;

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    const content = response.data.content[0].text;
    const outlineData = JSON.parse(content);

    // Convert to markdown format
    const markdown = convertOutlineToMarkdown(outlineData, passageRef);

    return {
      ...outlineData,
      contentMd: markdown,
      isAiGenerated: true,
    };
  } catch (error) {
    console.error('Error generating outline with AI:', error);
    throw error;
  }
};

/**
 * Generate a basic outline template without AI
 */
export const generateBasicOutline = (passageRef, passageText) => {
  const sections = [
    {
      heading: 'Introduction',
      keyPoints: [
        'Context and background of the passage',
        'Why this passage is relevant today',
      ],
      supportingVerses: [],
      discussionQuestions: [
        'What do you already know about this passage?',
        'What questions come to mind when you read this?',
      ],
    },
    {
      heading: 'Main Teaching',
      keyPoints: [
        'Key theological concept',
        'What this teaches us about God',
        'What this teaches us about ourselves',
      ],
      supportingVerses: [],
      discussionQuestions: [
        'How does this passage challenge your thinking?',
        'What stands out to you most?',
      ],
    },
    {
      heading: 'Application',
      keyPoints: [
        'How can we apply this in our daily lives?',
        'What practical steps can we take?',
      ],
      supportingVerses: [],
      discussionQuestions: [
        'What is one thing you can do this week based on this teaching?',
        'How can we support each other in living this out?',
      ],
    },
  ];

  const outlineData = {
    title: `Teaching: ${passageRef}`,
    theme: 'Exploring God\'s Word together',
    sections,
    application: 'Consider how this passage applies to your life this week.',
    prayerPoints: [
      'For understanding and wisdom',
      'For courage to apply what we learn',
      'For growth in faith',
    ],
  };

  const markdown = convertOutlineToMarkdown(outlineData, passageRef);

  return {
    ...outlineData,
    contentMd: markdown,
    isAiGenerated: false,
  };
};

/**
 * Convert outline data to markdown format
 */
export const convertOutlineToMarkdown = (outlineData, passageRef) => {
  let markdown = `# ${outlineData.title}\n\n`;
  markdown += `**Passage:** ${passageRef}\n\n`;
  markdown += `## Theme\n${outlineData.theme}\n\n`;

  outlineData.sections.forEach((section, index) => {
    markdown += `## ${index + 1}. ${section.heading}\n\n`;

    if (section.keyPoints && section.keyPoints.length > 0) {
      markdown += `### Key Points\n`;
      section.keyPoints.forEach((point) => {
        markdown += `- ${point}\n`;
      });
      markdown += `\n`;
    }

    if (section.supportingVerses && section.supportingVerses.length > 0) {
      markdown += `### Supporting Verses\n`;
      section.supportingVerses.forEach((verse) => {
        markdown += `- ${verse}\n`;
      });
      markdown += `\n`;
    }

    if (section.discussionQuestions && section.discussionQuestions.length > 0) {
      markdown += `### Discussion Questions\n`;
      section.discussionQuestions.forEach((question) => {
        markdown += `- ${question}\n`;
      });
      markdown += `\n`;
    }
  });

  if (outlineData.application) {
    markdown += `## Application\n${outlineData.application}\n\n`;
  }

  if (outlineData.prayerPoints && outlineData.prayerPoints.length > 0) {
    markdown += `## Prayer Points\n`;
    outlineData.prayerPoints.forEach((point) => {
      markdown += `- ${point}\n`;
    });
  }

  return markdown;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * Download markdown as a file
 */
export const downloadMarkdown = (markdown, filename = 'sermon-outline.md') => {
  try {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error downloading markdown:', error);
    return false;
  }
};

/**
 * Generate and download PDF
 * Uses browser print functionality for PDF generation
 */
export const downloadPDF = (contentHtml, title = 'Sermon Outline') => {
  try {
    // Create a new window with the content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Pop-up blocked. Please allow pop-ups for PDF export.');
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body {
              font-family: 'Georgia', 'Times New Roman', serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            h1 {
              color: #2c5282;
              border-bottom: 3px solid #4299e1;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            h2 {
              color: #2d3748;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            h3 {
              color: #4a5568;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            ul {
              margin-left: 20px;
            }
            li {
              margin-bottom: 8px;
            }
            strong {
              color: #2d3748;
            }
            .ai-disclaimer {
              background-color: #fff5f5;
              border-left: 4px solid #fc8181;
              padding: 15px;
              margin: 20px 0;
              font-size: 0.9em;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${contentHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 100);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

/**
 * Convert markdown to HTML for display
 */
export const markdownToHtml = (markdown) => {
  if (!markdown) return '';

  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Lists
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br>');

  // Wrap lists in ul tags
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Wrap content in paragraph tags
  html = `<p>${html}</p>`;

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p><br><\/p>/g, '');

  return html;
};

/**
 * Parse passage reference and fetch text
 */
export const fetchPassageText = async (passageRef, bibleId) => {
  try {
    const passages = await bibleAPI.getVerseText(passageRef, bibleId);
    if (passages && passages.length > 0) {
      return passages.map(p => p.text).join(' ');
    }
    return '';
  } catch (error) {
    console.error('Error fetching passage text:', error);
    return '';
  }
};

const outlineService = {
  generateOutlineWithAI,
  generateBasicOutline,
  convertOutlineToMarkdown,
  copyToClipboard,
  downloadMarkdown,
  downloadPDF,
  markdownToHtml,
  fetchPassageText,
};

export default outlineService;
