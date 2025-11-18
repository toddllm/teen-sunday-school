# Context Cards for Difficult Verses

## Overview
The Context Cards feature provides concise historical, literary, and thematic context for Bible verses that are commonly misunderstood or difficult. This helps users better understand Scripture in its proper context.

## Features Implemented

### 1. Data Model (`ContextCardContext.js`)
- **ContextCard Schema**:
  - `id`: Unique identifier
  - `verseRef`: Bible reference (e.g., "John 3:16")
  - `verseRange`: Full range if applicable (e.g., "John 3:16-17")
  - `historicalContext`: Historical/cultural background
  - `literaryContext`: Literary context within the book
  - `keyTheme`: Main theme or takeaway
  - `crossReferences`: Array of related verses with notes
  - `version`: Version number for updates
  - `createdAt`, `updatedAt`: Timestamps

### 2. Service Layer (`contextCardService.js`)
Utility functions for:
- Parsing verse references
- Checking if a verse is in a range
- Normalizing verse references
- Validating context cards
- Import/export functionality

### 3. UI Component (`ContextCardModal.js`)
- **Modal popup** displaying context information
- Sections for:
  - 📜 Historical Context
  - 📖 Literary Context
  - 💡 Key Theme
  - 🔗 Cross References
- Includes disclaimer: "This explanation is a summary, not exhaustive"
- Responsive design with light/dark mode support
- Keyboard navigation (ESC to close)
- Click outside modal to close

### 4. Integration (`ParallelBiblePage.js`)
- **Click handlers** on verse numbers
- Hover effects on clickable verses
- Automatic context card lookup
- Displays modal when verse is clicked
- Shows "No context available" message if no card exists

## User Experience Flow

1. **User reads Bible passage** in Parallel Bible view
2. **User clicks on a verse number** (e.g., verse 16 in John 3)
3. **Modal opens** showing:
   - Historical context of the passage
   - Literary context within the book
   - Key theme or takeaway
   - Related cross-references with explanatory notes
4. **User reads context** to better understand the verse
5. **User closes modal** (via X button, footer button, ESC key, or clicking outside)

## Sample Context Cards Included

The system comes pre-loaded with context cards for:
1. **John 3:16** - God's love and salvation
2. **James 2:14-26** - Faith and works
3. **Matthew 5:38-42** - Turn the other cheek
4. **Genesis 1:1-3** - Creation
5. **Ephesians 2:8-9** - Salvation by grace

## Technical Architecture

### Storage
- Context cards stored in **localStorage** under key: `sunday-school-context-cards`
- Automatic persistence on any changes
- Versioned for future updates

### State Management
- React Context API via `ContextCardProvider`
- CRUD operations available throughout the app
- Integrated with existing context providers

### Styling
- Uses CSS variables for theme consistency
- Supports light/dark modes automatically
- Responsive design for mobile/tablet/desktop
- Smooth animations and transitions

## API-like Interface

Although the data is stored locally, the service provides an API-like interface:

```javascript
// Get context card by verse reference
const card = getContextCardByVerseRef("John 3:16");

// Add new context card
addContextCard({
  verseRef: "Romans 8:28",
  historicalContext: "...",
  literaryContext: "...",
  keyTheme: "...",
  crossReferences: [...]
});

// Update existing card
updateContextCard(cardId, updates);

// Search context cards
searchContextCards("faith");
```

## Future Enhancements

Potential future improvements:
1. **Admin interface** for adding/editing context cards
2. **Import/export** context card collections
3. **Share** context cards between users
4. **AI-assisted** context generation
5. **Community contributions** and ratings
6. **Verse range support** (e.g., "John 3:16-21")
7. **Integration** with other Bible study tools
8. **Analytics** on most-viewed context cards

## File Structure

```
src/
├── contexts/
│   └── ContextCardContext.js       # Context provider and state management
├── services/
│   └── contextCardService.js       # Utility functions
├── components/
│   ├── ContextCardModal.js         # Modal UI component
│   └── ContextCardModal.css        # Modal styles
└── pages/
    └── ParallelBiblePage.js        # Integration point (updated)
```

## Analytics & Success Metrics

Track these metrics to measure success:
- Context card views per passage
- User engagement time with context cards
- Most frequently viewed context cards
- User feedback on helpfulness
- Reduction in confusion reports for difficult verses

## Permissions & Constraints

- Content should be curated or AI-assisted with editorial review
- Context cards are versioned to allow updates/edits
- All content should be biblically sound and accurate
- Cross-references should be relevant and helpful

## Notes for Developers

1. To add more context cards, use the `addContextCard` function or directly edit localStorage
2. The verse click handler uses DOM manipulation since Bible content is rendered as HTML
3. Context cards are case-insensitive when matching verse references
4. The modal prevents body scroll when open for better UX
5. All styling uses CSS variables for easy theming

---

**Status**: ✅ Fully implemented and ready for testing
**Author**: Claude AI Assistant
**Date**: 2025-11-18
