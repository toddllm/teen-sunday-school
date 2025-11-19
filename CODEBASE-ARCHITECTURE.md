# Teen Sunday School Application - Architecture Overview

## Project Summary
- **Type**: Single-Page Application (SPA) with React 18
- **Port**: 3013
- **Storage**: LocalStorage-based (no backend database)
- **Code Size**: ~5,300 lines of JavaScript
- **Framework**: React with React Router v6
- **Current Branch**: `claude/org-custom-branding-01JGsv2Yc7Y5SvkN7itVp2eK`

## 1. PROJECT STRUCTURE

```
teen-sunday-school/
├── src/
│   ├── App.js                          # Main router and layout
│   ├── App.css                         # Global app styles
│   ├── index.js                        # React entry point
│   ├── index.css                       # CSS variables (theme system)
│   │
│   ├── components/                     # Reusable UI components
│   │   ├── Navigation.js               # Main navigation bar
│   │   ├── Navigation.css
│   │   ├── ContextCardModal.js         # Modal for difficult verses
│   │   ├── ContextCardModal.css
│   │   ├── CrossReferencePanel.js      # Bible cross-references
│   │   ├── CrossReferencePanel.css
│   │   └── games/
│   │       ├── Wordle.js
│   │       ├── Wordle.css
│   │       ├── WordScramble.js
│   │       ├── WordScramble.css
│   │       ├── Hangman.js
│   │       ├── Hangman.css
│   │       ├── WordSearch.js
│   │       └── WordSearch.css
│   │
│   ├── pages/                          # Page components (routes)
│   │   ├── HomePage.js                 # Landing/dashboard page
│   │   ├── HomePage.css
│   │   ├── LessonsPage.js              # View all lessons
│   │   ├── LessonsPage.css
│   │   ├── LessonViewPage.js           # View single lesson with slides
│   │   ├── LessonViewPage.css
│   │   ├── AdminPage.js                # Lesson management dashboard
│   │   ├── AdminPage.css
│   │   ├── LessonCreatorPage.js        # Create/edit lessons
│   │   ├── LessonCreatorPage.css
│   │   ├── GamesAdminPage.js           # Configure games per lesson
│   │   ├── GamesAdminPage.css
│   │   ├── GamesPage.js                # Play games for a lesson
│   │   ├── GamesPage.css
│   │   ├── TodayPage.js                # Daily activity/streaks
│   │   ├── TodayPage.css
│   │   ├── BadgesPage.js               # User achievements
│   │   ├── BadgesPage.css
│   │   ├── BibleToolPage.js            # Bible search/lookup
│   │   ├── BibleToolPage.css
│   │   ├── ParallelBiblePage.js        # Multi-translation view
│   │   ├── ParallelBiblePage.css
│   │   ├── TranslationSettingsPage.js  # Bible translation settings
│   │   ├── TranslationSettingsPage.css
│   │   ├── QuoteImageGeneratorPage.js  # Share-worthy verse images
│   │   └── QuoteImageGeneratorPage.css
│   │
│   ├── contexts/                       # React Context for state management
│   │   ├── LessonContext.js            # Lessons CRUD operations
│   │   ├── ThemeContext.js             # Light/dark mode toggle
│   │   ├── StreakContext.js            # Activity tracking & badges
│   │   ├── TranslationContext.js       # Bible translation preferences
│   │   └── ContextCardContext.js       # Difficult verse annotations
│   │
│   ├── services/                       # External API services
│   │   ├── bibleAPI.js                 # Bible API wrapper (scripture.api.bible)
│   │   ├── imageGeneratorService.js    # Canvas-based image generation
│   │   └── contextCardService.js       # Context card operations
│   │
│   └── data/
│       └── crossReferences.js          # Static cross-reference data
│
├── public/                             # Static assets
├── package.json
└── README.md
```

## 2. FRONTEND FRAMEWORK & TECHNOLOGY STACK

### Core Dependencies
- **React 18.2.0** - UI framework
- **React Router v6.22.0** - Client-side routing
- **React Scripts 5.0.1** - Build tooling (Create React App)
- **Axios 1.6.0** - HTTP client for API calls
- **Date-fns 2.30.0** - Date manipulation utility

### Architecture Pattern
- **State Management**: React Context API (not Redux)
- **Data Persistence**: LocalStorage only (JSON serialization)
- **Routing**: React Router with nested routes
- **Component Structure**: Functional components with hooks
- **Styling**: CSS with CSS custom properties (variables) for theming

## 3. ORGANIZATIONS - CURRENT IMPLEMENTATION STATUS

**Current Status**: Organizations are NOT currently implemented in the codebase.

The application is a single-organization system where:
- All lessons are stored globally in LocalStorage under key `sunday-school-lessons`
- All users share the same lesson/badge/streak data
- No multi-tenancy support exists
- No organization selection/switching mechanism
- Hard-coded application title "Teen Sunday School"

**Data isolation**: Currently minimal - just localStorage keys:
- `sunday-school-lessons`
- `streakData`
- `sunday-school-context-cards`
- `primary-translation`, `secondary-translation`, `parallel-mode-enabled`
- `quoteImageGenerator`
- `theme`

## 4. ADMIN FEATURES STRUCTURE

### Current Admin Pages
1. **AdminPage** (`/admin`)
   - Dashboard with statistics (total lessons, slides, quarters)
   - Lesson management table with actions
   - Create/Edit/Delete/Duplicate operations
   - No access control - any user can access

2. **LessonCreatorPage** (`/admin/create`, `/admin/edit/:id`)
   - Form-based lesson editor
   - Fields: title, description, bibleVerses, slides, games
   - No field validation beyond HTML5

3. **GamesAdminPage** (`/admin/games/:lessonId`)
   - Configure game words per lesson
   - Supports: Wordle, Word Scramble, Hangman, Word Search
   - Word validation (Wordle requires 5 letters)
   - Grid size configuration

### Admin Capabilities
- ✅ Create lessons
- ✅ Edit lessons
- ✅ Delete lessons with confirmation
- ✅ Duplicate lessons
- ✅ Configure games per lesson
- ❌ No user/organization management
- ❌ No access control/authentication
- ❌ No audit logging
- ❌ No bulk operations

## 5. FILE UPLOAD & ASSET HANDLING

### Current Implementation
**No file uploads are currently implemented**

Image generation exists only for:
- **Quote/Image Generator** (Canvas-based, client-side)
  - Generates shareable Bible verse images
  - Uses HTML5 Canvas API
  - Outputs as PNG
  - Features:
    - 8 predefined templates (gradients, solid colors)
    - Custom text color, font family, size, alignment
    - Optional watermark
    - Download, share (Web Share API), or clipboard copy
    - LocalStorage persistence of generated images

Potential future upload mechanisms would need:
- Form file input elements
- Blob/File handling
- Base64 encoding for LocalStorage OR server upload
- Image validation (size, type, dimensions)

## 6. DATABASE SCHEMA & DATA MODELS

### Lesson Schema
```javascript
{
  id: string,                          // "lesson-" + timestamp
  title: string,
  connection: string,                  // Main teaching point
  description: string,
  quarter: number,                     // Curriculum quarter
  unit: number,                        // Unit within quarter
  unitTitle: string,
  lessonNumber: number,
  scripture: [string],                 // ["John 3:16", ...]
  rememberVerse: {
    text: string,
    reference: string
  },
  slides: [
    {
      id: number,
      html: string,                    // Content as HTML
      sayText: string,                 // Text-to-speech content
      notes: string,                   // Teacher notes
      discussionTime: number           // Minutes for discussion
    }
  ],
  discussionQuestions: [string],
  wordGames: {
    scramble: [string],                // 5-letter words
    hangman: [string],                 // 5-letter words
    wordSearch: {
      words: [string],
      grid: number                     // Grid size (10, 12, etc)
    },
    wordle: [string]                   // 5-letter words
  },
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### Streak/Activity Schema
```javascript
{
  activities: [
    {
      date: "YYYY-MM-DD",
      activityType: enum,              // From ACTIVITY_TYPES
      timestamp: ISO8601
    }
  ],
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: string,
  earnedBadges: [
    {
      badgeId: string,
      awardedAt: ISO8601
    }
  ]
}
```

### Context Card Schema
```javascript
{
  id: string,                          // "context-" + timestamp
  verseRef: string,                    // "John 3:16"
  verseRange: string,
  historicalContext: string,           // Background information
  literaryContext: string,             // Literary structure info
  keyTheme: string,                    // Main theme
  crossReferences: [
    {
      ref: string,                     // "Romans 5:8"
      note: string
    }
  ],
  version: number,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### Translation Preferences Schema
```javascript
{
  primaryTranslation: string,          // Bible version ID
  secondaryTranslation: string,
  parallelModeEnabled: boolean
}
```

## 7. CSS THEMING & STYLING SYSTEM

### CSS Custom Properties (Variables)
Defined in `src/index.css` with light and dark mode variants:

```css
:root {
  /* Brand colors */
  --primary-color: #4A90E2;            /* Blue */
  --secondary-color: #50C878;          /* Green */
  --accent-color: #FF6B6B;             /* Red */
  --dark-color: #2C3E50;
  --light-gray: #ECF0F1;
  
  /* Layout */
  --border-radius: 8px;
  --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
  
  /* Light mode (default) */
  --bg-color: #f5f7fa;
  --text-color: #2C3E50;
  --text-secondary: #5a6c7d;
  --card-bg: #ffffff;
  --border-color: #e1e8ed;
  --hover-bg: #f0f3f7;
  --input-bg: #ffffff;
  --input-border: #d1d9e0;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --scrollbar-track: #f1f1f1;
  --scrollbar-thumb: #888;
}

[data-theme="dark"] {
  /* Dark mode overrides */
  --primary-color: #5BA3F5;
  --secondary-color: #5FD48A;
  --accent-color: #FF8A8A;
  --bg-color: #1a1d23;
  --text-color: #E8EAED;
  /* ... etc */
}
```

### Theme Implementation (ThemeContext)
- Stores theme preference in localStorage
- Sets `data-theme` attribute on document root
- Supports system preference detection
- Theme toggle button in Navigation

### Component Classes
- `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-danger`
- `.card` / `.badge`
- `.form-group` / `.form-input` / `.form-textarea`
- `.grid` / `.grid-2` / `.grid-3` / `.grid-4`
- Responsive design with @media queries

## 8. STATE MANAGEMENT CONTEXTS

### 1. LessonContext
**File**: `src/contexts/LessonContext.js`
- Manages all lessons in localStorage
- Key functions:
  - `addLesson(lesson)` - Create new lesson
  - `updateLesson(id, updates)` - Update existing
  - `deleteLesson(id)` - Remove lesson
  - `getLessonById(id)` - Fetch single lesson
  - `duplicateLesson(id)` - Clone lesson
- State: `lessons` array, `loading` flag
- Auto-saves to localStorage on change

### 2. ThemeContext
**File**: `src/contexts/ThemeContext.js`
- Manages light/dark mode
- Key functions:
  - `toggleTheme()` - Switch between light/dark
- State: `theme` ("light" or "dark"), `isDark` boolean
- Auto-saves to localStorage
- Detects system preference on first load

### 3. StreakContext
**File**: `src/contexts/StreakContext.js`
- Tracks user activities and badges
- Key functions:
  - `logActivity(activityType)` - Record user action
  - `getStats()` - Return activity statistics
  - `getAllBadges()` / `getEarnedBadges()`
  - `isStreakAtRisk()` / `getEncouragementMessage()`
- State: `activities`, `currentStreak`, `longestStreak`, `earnedBadges`
- Auto-saves to localStorage
- Calculates streaks based on unique dates

### 4. TranslationContext
**File**: `src/contexts/TranslationContext.js`
- Manages Bible translation preferences
- Key functions:
  - `setPrimaryTranslation(id)`
  - `setSecondaryTranslation(id)`
  - `toggleParallelMode()`
- State: `primaryTranslation`, `secondaryTranslation`, `parallelModeEnabled`
- Supports 10 English Bible versions (NIV, KJV, ESV, NLT, etc.)
- Auto-saves to localStorage

### 5. ContextCardContext
**File**: `src/contexts/ContextCardContext.js`
- Manages annotations for difficult Bible verses
- Key functions:
  - `addContextCard(card)` - Create annotation
  - `updateContextCard(id, updates)` - Edit annotation
  - `deleteContextCard(id)` - Remove annotation
  - `getContextCardByVerseRef(ref)` - Lookup by verse
  - `searchContextCards(query)` - Search annotations
- State: `contextCards` array, `loading` flag
- Auto-saves to localStorage

## 9. ROUTING STRUCTURE

### Routes Defined in `src/App.js`
```
GET  /                          → HomePage
GET  /today                     → TodayPage (activities/streaks)
GET  /badges                    → BadgesPage
GET  /lessons                   → LessonsPage (list all)
GET  /lesson/:id                → LessonViewPage (view single)
GET  /admin                     → AdminPage (dashboard)
GET  /admin/create              → LessonCreatorPage (new)
GET  /admin/edit/:id            → LessonCreatorPage (edit)
GET  /admin/games/:lessonId     → GamesAdminPage
GET  /games/:lessonId           → GamesPage (play games)
GET  /bible                     → BibleToolPage (lookup)
GET  /bible/parallel            → ParallelBiblePage (multi-translation)
GET  /bible/quote-generator     → QuoteImageGeneratorPage
GET  /settings/translations     → TranslationSettingsPage
*                               → Navigate to /
```

## 10. KEY SERVICES & UTILITIES

### Bible API Service (`src/services/bibleAPI.js`)
- Uses external API: `https://api.scripture.api.bible/v1`
- Free tier requires API key (REACT_APP_BIBLE_API_KEY env var)
- Functions:
  - `searchPassage(query)` - Search Bible
  - `getPassage(passageId)` - Fetch verse text
  - `getChapter(book, chapter)` - Get full chapter
  - `getParallelPassages(passageId, bibleIds)` - Multi-translation
  - `referenceToVerseId(reference)` - Parse "John 3:16" → "JHN.3.16"
  - `verseIdToReference(verseId)` - Reverse conversion
  - `getCrossReferences(verseId)` - Related verses
  - `getAvailableBibles()` - List supported versions

### Image Generator Service (`src/services/imageGeneratorService.js`)
- Canvas-based image generation
- Features:
  - 8 predefined templates (gradient backgrounds, solid colors)
  - Custom fonts, colors, alignment
  - Font families: Georgia, Arial, Times New Roman, Helvetica, Courier, Palatino
  - Social media dimensions (1200x630 px for Facebook/Twitter)
  - Export: PNG download, clipboard copy, Web Share API
  - LocalStorage persistence (max 20 images)
- Functions:
  - `generateImage(options)` - Create verse image
  - `downloadImage(dataUrl, filename)`
  - `copyImageToClipboard(dataUrl)`
  - `shareImage(dataUrl, reference)` - Via Web Share API
  - `saveImageToStorage(imageData)`
  - `getSavedImages()` / `deleteSavedImage(id)`

### Context Card Service (`src/services/contextCardService.js`)
- Provides CRUD operations for verse annotations
- Used by ContextCardContext

### Cross References Data (`src/data/crossReferences.js`)
- Static mappings of verse IDs to related verses
- Format: `{ verseId: [{ target, type }] }`
- Types: quotation, parallel, theme, allusion, prophecy

## 11. ARCHITECTURE INSIGHTS FOR ORGANIZATION BRANDING

### Current Branding Elements
1. **Hard-coded in Navigation.js**:
   - Logo icon: 📖 (book emoji)
   - Logo text: "Teen Sunday School"

2. **Hard-coded in HomePage.js**:
   - Page title: "Teen Sunday School"
   - Hero subtitle: "Interactive lesson builder and delivery platform for engaging teen Bible study"

3. **CSS Color Scheme** (easy to customize):
   - Primary: #4A90E2 (blue)
   - Secondary: #50C878 (green)
   - Accent: #FF6B6B (red)

### Data Model Gaps for Organization Support
To implement organization branding, would need to add:
1. Organization Context - manage current org, org settings
2. Organization data model with branding properties:
   - `organization.name` - Display name
   - `organization.logo` - Logo URL or base64
   - `organization.colors` - Primary, secondary, accent colors
   - `organization.domain` - Custom subdomain or identifier
   - `organization.features` - Which features are enabled
3. Organization-scoped lessons
4. Organization-scoped users (if multi-user support added)
5. Admin page for organization settings

### Lesson Data Model Gaps
Lessons have no organization reference:
```javascript
// Current - single organization
lesson: { id, title, slides, ... }

// Needed for multi-org support
lesson: { 
  id, 
  title, 
  slides, 
  organizationId,  // NEW
  createdBy,       // NEW (if multi-user)
  ...
}
```

### localStorage Isolation Approach
Could use namespacing:
```javascript
// Current
localStorage.getItem('sunday-school-lessons')

// With organizations
localStorage.getItem(`org-${orgId}-lessons`)
localStorage.getItem(`org-${orgId}-theme`)
localStorage.getItem(`org-${orgId}-streaks`)
```

## 12. DEVELOPMENT WORKFLOW

### Build & Run
```bash
npm install      # Install dependencies
npm start        # Start dev server on port 3013
npm build        # Production build to /build directory
npm test         # Run tests
```

### Local Development
- Hot reload enabled via Create React App
- Browser DevTools for React component inspection
- LocalStorage persists across page refreshes during dev

### Code Organization Best Practices Currently Used
- Separate contexts for each major feature domain
- CSS co-located with components
- Services for external API calls
- Pages organized by route

## 13. RELEVANT FILES FOR IMPLEMENTING CUSTOM BRANDING

### Files to Modify
1. **Navigation.js** - Brand logo/text
2. **HomePage.js** - Hero section text
3. **index.css** - CSS variables (colors, fonts)
4. **index.js** - Add OrganizationContext to provider stack
5. **App.js** - May need context-aware route configuration
6. **LessonContext.js** - Add organization filtering
7. **AdminPage.js** - Add org branding admin section

### Files to Create
1. **src/contexts/OrganizationContext.js** - Organization state management
2. **src/pages/OrganizationSettingsPage.js** - Branding configuration UI
3. **src/components/OrgBrandingPreview.js** - Preview component
4. **src/services/organizationService.js** - Organization CRUD operations

### Storage Keys to Add
- `current-organization` - Selected org ID
- `org-{id}-settings` - Branding and config
- `org-{id}-lessons` - Org-scoped lessons
- etc.

