# Read-Aloud (On-Page TTS) Mode Feature

## Overview

The Read-Aloud feature provides comprehensive text-to-speech (TTS) functionality throughout the Teen Sunday School application. This accessibility feature allows users to listen to Bible verses, lesson slides, and other content using the browser's native Web Speech API.

## Feature Status

- ✅ **Implemented** - Feature is fully functional
- 🎯 **Target**: Enhance accessibility and provide audio narration for all text content
- 📦 **Dependencies**: Browser Web Speech API support (available in all modern browsers)

## Architecture

### Components

#### 1. ReadAloudContext (`src/contexts/ReadAloudContext.js`)
Global state management for TTS functionality across the application.

**Features:**
- Voice selection and management
- Playback controls (play, pause, resume, stop)
- Speed/rate control (0.5x - 2.0x)
- Volume control (0 - 100%)
- Text preprocessing and cleaning
- Browser speech synthesis integration
- Preference persistence via localStorage

**Usage:**
```javascript
import { useReadAloud } from '../contexts/ReadAloudContext';

function MyComponent() {
  const { speak, pause, resume, stop, isPlaying, isPaused } = useReadAloud();

  const handleRead = () => {
    speak('Hello, this is a test.');
  };

  return <button onClick={handleRead}>Read Aloud</button>;
}
```

#### 2. readAloudService (`src/services/readAloudService.js`)
Utility functions for text processing and formatting for TTS.

**Key Functions:**
- `formatBibleVerseForSpeech(verseContent)` - Cleans Bible verse text for speech
- `formatReferenceForSpeech(reference)` - Converts "John 3:16" to "John chapter 3 verse 16"
- `createBiblePassageSpeech(reference, content, options)` - Creates complete passage speech text
- `formatSlideForSpeech(slide)` - Formats lesson slide content
- `cleanSpecialCharacters(text)` - Removes/replaces special characters
- `estimateSpeakingTime(text, rate)` - Calculates estimated speaking time
- `getPreferredVoice(voices)` - Selects optimal voice from available options

**Usage:**
```javascript
import { createBiblePassageSpeech } from '../services/readAloudService';

const speechText = createBiblePassageSpeech(
  'John 3:16',
  'For God so loved the world...',
  { includeReference: true, includeIntro: false }
);
```

#### 3. ReadAloudControls Component (`src/components/ReadAloudControls.js`)
Reusable UI component for TTS controls.

**Props:**
- `text` (string, required) - The text to be read aloud
- `reference` (string, optional) - Bible reference to prepend to text
- `compact` (boolean, default: false) - Use compact mode for minimal UI
- `showVoiceSelector` (boolean, default: true) - Show voice selection dropdown
- `showRateControl` (boolean, default: true) - Show speed control slider
- `className` (string, optional) - Additional CSS classes

**Features:**
- Play/Pause/Stop buttons
- Speed control slider (0.5x - 2.0x)
- Voice selection dropdown
- Settings panel (collapsible)
- Visual playback indicator
- Responsive design (mobile-friendly)
- Dark mode support

**Usage:**
```javascript
import ReadAloudControls from '../components/ReadAloudControls';

<ReadAloudControls
  text={verseContent}
  reference="John 3:16"
  compact={false}
/>
```

### Integration Points

The Read-Aloud feature is integrated into the following pages:

#### 1. LessonViewPage (`src/pages/LessonViewPage.js`)
- Reads lesson slide content using the `sayText` field
- Controls displayed below slide navigation
- Automatically formats slide content for natural speech

**Location:** Below slide controls, line 80-83

#### 2. BibleToolPage (`src/pages/BibleToolPage.js`)
- Reads individual Bible verses with reference
- Controls displayed after verse content
- Includes verse reference in speech (e.g., "John chapter 3 verse 16. For God so loved...")

**Location:** After verse result, before cross-reference panel, line 122-129

#### 3. ParallelBiblePage (`src/pages/ParallelBiblePage.js`)
- Reads entire Bible chapters
- Uses primary translation for speech
- Includes book name and chapter in speech introduction

**Location:** After controls panel, before parallel container, line 296-308

## User Settings

All user preferences are automatically saved to browser localStorage:

| Setting | Key | Default | Range |
|---------|-----|---------|-------|
| Voice | `readAloud-voice` | First English voice | Available voices |
| Speed | `readAloud-rate` | 0.9x | 0.5x - 2.0x |
| Volume | `readAloud-volume` | 1.0 (100%) | 0 - 1.0 |

## Browser Compatibility

The Read-Aloud feature uses the Web Speech API, which is supported by:

- ✅ Chrome/Edge (all versions)
- ✅ Safari (macOS/iOS 14.5+)
- ✅ Firefox (49+)
- ✅ Opera (all versions)

**Fallback Behavior:**
- If speech synthesis is not supported, a warning message is displayed
- Feature gracefully degrades without breaking the application

## Text Processing

### Bible Verse Formatting
- Removes HTML tags (`<p>`, `<span>`, etc.)
- Removes verse numbers (`[1]`, `[2]`, etc.)
- Removes chapter:verse references (`1:1`, `2:3`, etc.)
- Normalizes whitespace
- Converts special characters (em dashes → commas, ellipsis → periods)

### Reference Formatting
- "John 3:16" → "John chapter 3 verse 16"
- "John 3:16-18" → "John chapter 3 verses 16 through 18"
- "Genesis 1" → "Genesis chapter 1"

### Slide Content Formatting
- Uses `sayText` field if available
- Removes HTML formatting
- Cleans special characters for natural speech

## Accessibility Features

1. **Keyboard Navigation**: All controls are keyboard accessible
2. **Focus Indicators**: Visible focus states for all interactive elements
3. **Screen Reader Support**: Semantic HTML and ARIA labels
4. **Visual Feedback**: Playback indicator shows when audio is playing
5. **Multiple Speeds**: Adjustable playback speed for different learning needs
6. **Voice Options**: Multiple voice choices for user preference

## Performance Considerations

1. **Text Length**: Long chapters are handled without chunking (Web Speech API handles long text well)
2. **Memory**: Speech synthesis cancels previous utterances to prevent memory leaks
3. **State Management**: Efficient context-based state management
4. **Lazy Loading**: Controls only render when content is available

## Future Enhancements

Potential improvements for future releases:

- [ ] **Word Highlighting**: Highlight currently spoken word/verse
- [ ] **Playback Progress**: Visual progress bar showing position in text
- [ ] **Bookmarking**: Save position in long chapters
- [ ] **Offline Voices**: Download high-quality voices for offline use
- [ ] **Translation Reading**: Option to read both translations in parallel view
- [ ] **Auto-Advance**: Automatically advance slides when speech completes
- [ ] **Speech Marks**: Use speech synthesis events for advanced features
- [ ] **Pronunciation Dictionary**: Custom pronunciations for biblical names
- [ ] **Background Playback**: Continue playing while browsing other pages

## Technical Details

### File Structure
```
src/
├── contexts/
│   └── ReadAloudContext.js          # Global TTS state (235 lines)
├── services/
│   └── readAloudService.js          # Text processing utilities (219 lines)
├── components/
│   ├── ReadAloudControls.js         # UI component (158 lines)
│   └── ReadAloudControls.css        # Styling (231 lines)
└── pages/
    ├── LessonViewPage.js            # Lesson slide integration
    ├── BibleToolPage.js             # Bible verse integration
    └── ParallelBiblePage.js         # Chapter reading integration
```

### State Management Flow
```
1. User clicks "Read Aloud" button
2. ReadAloudControls calls speak() from context
3. Context cleans text and creates SpeechSynthesisUtterance
4. Browser speaks text using selected voice and rate
5. Context updates state (isPlaying, isPaused)
6. UI reflects current playback state
7. User preferences saved to localStorage
```

### Event Handling
- `onstart` - Sets isPlaying to true
- `onend` - Resets state to idle
- `onerror` - Handles speech synthesis errors
- `onboundary` - Tracks character position (for future word highlighting)

## Testing

### Manual Testing Checklist
- [ ] Play/Pause/Stop functionality works correctly
- [ ] Speed control adjusts playback rate
- [ ] Voice selection changes voice
- [ ] Settings persist across page reloads
- [ ] Compact mode displays correctly
- [ ] Mobile responsive design works
- [ ] Dark mode styling is correct
- [ ] Bible verses read with proper formatting
- [ ] Lesson slides read correctly
- [ ] Chapter reading works for long text

### Known Issues
- None currently identified

## Support & Documentation

For questions or issues related to the Read-Aloud feature:

1. Check browser console for speech synthesis errors
2. Verify browser supports Web Speech API
3. Check that browser has voices installed
4. Review localStorage for saved preferences

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024 | Initial implementation with full TTS support |

## Credits

- **Technology**: Web Speech API (W3C standard)
- **Implementation**: Teen Sunday School development team
- **Design Pattern**: React Context + Service layer architecture

## License

Part of the Teen Sunday School application.

---

**Related Documentation:**
- [Context Cards Feature](./CONTEXT-CARDS-FEATURE.md)
- [Parallel Bible Feature](./PARALLEL-TRANSLATIONS-FEATURE.md)
- [Project Overview](./PROJECT-OVERVIEW.md)
