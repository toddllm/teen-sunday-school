# Teen Sunday School Codebase Analysis

## 1. PROJECT STRUCTURE & TECH STACK

### Architecture Overview
- **Frontend-Only Application**: Single-page React application (no backend server)
- **Technology Stack**: React 18, React Router v6, Axios, LocalStorage
- **Deployment**: AWS S3 + CloudFront CDN
- **Port**: 3013 (development)

### Directory Structure
```
teen-sunday-school/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navigation.js
│   │   ├── ContextCardModal.js
│   │   ├── CrossReferencePanel.js
│   │   └── games/
│   │       ├── Hangman.js
│   │       ├── WordScramble.js
│   │       ├── WordSearch.js
│   │       └── Wordle.js
│   ├── contexts/            # React Context state management
│   │   ├── LessonContext.js          # Core lesson state
│   │   ├── StreakContext.js          # User activity streaks & badges
│   │   ├── TranslationContext.js     # Bible translation preferences
│   │   ├── ContextCardContext.js     # Bible verse context cards
│   │   └── ThemeContext.js           # Theme management
│   ├── pages/               # Page components
│   │   ├── AdminPage.js              # Admin dashboard
│   │   ├── LessonCreatorPage.js      # Lesson creation/editing
│   │   ├── GamesAdminPage.js         # Game management
│   │   ├── GamesPage.js              # Game playing interface
│   │   ├── LessonsPage.js            # Lesson list/browse
│   │   ├── LessonViewPage.js         # Lesson viewing
│   │   ├── HomePage.js               # Landing page
│   │   ├── BadgesPage.js             # Achievements/badges
│   │   ├── BibleToolPage.js          # Bible lookup tool
│   │   ├── ParallelBiblePage.js      # Multi-translation Bible view
│   │   ├── TranslationSettingsPage.js # Bible translation settings
│   │   ├── TodayPage.js              # Activity & streak tracking
│   │   └── QuoteImageGeneratorPage.js # Quote/image generation
│   ├── services/            # External API services
│   │   ├── bibleAPI.js              # Bible API client
│   │   ├── contextCardService.js    # Context card functionality
│   │   └── imageGeneratorService.js # Image generation
│   ├── data/
│   │   └── crossReferences.js       # Bible cross-reference data
│   └── App.js, index.js             # Entry points
├── public/                  # Static files
├── .github/
│   └── workflows/           # GitHub Actions
│       ├── deploy.yml       # Deploy to AWS
│       ├── auto-pr.yml      # Auto create PRs
│       ├── pr-check.yml     # PR validation
│       └── auto-merge.yml   # Auto merge PRs
└── package.json
```

---

## 2. DATABASE SCHEMA & DATA PERSISTENCE

### Data Storage Strategy
- **No Traditional Database**: Application uses browser LocalStorage only
- **Data Types**: All data stored as JSON strings in localStorage

### Core Data Models

#### Lesson Model
```javascript
{
  id: "lesson-{timestamp}",
  title: string,
  description: string,
  quarter: number,              // Q1-Q4
  unit: number,                 // Unit number
  unitTitle: string,            // Unit name
  lessonNumber: number,         // Lesson within unit
  connection: string,           // Thematic connection
  scripture: [string],          // Array of Bible passages
  rememberVerse: {
    text: string,
    reference: string
  },
  slides: [
    {
      id: number,
      html: string,             // HTML content
      sayText: string,          // Text-to-speech content
      notes: string             // Teaching notes
    }
  ],
  discussionQuestions: [string],
  wordGames: {
    wordle: [string],           // 5-letter words
    scramble: [string],         // Words for scramble game
    hangman: [string],          // Words for hangman
    wordSearch: {
      words: [string],
      grid: number              // Grid size (8-20)
    }
  },
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

#### Context Card Model (Bible Verse Context)
```javascript
{
  id: "context-{timestamp}",
  verseRef: string,            // e.g., "John 3:16"
  verseRange: string,
  historicalContext: string,   // Background information
  literaryContext: string,     // Textual context
  keyTheme: string,           // Main theme
  crossReferences: [
    {
      ref: string,            // e.g., "Romans 5:8"
      note: string            // Explanation
    }
  ],
  version: number,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

#### Streak/Activity Model
```javascript
{
  activities: [
    {
      date: "YYYY-MM-DD",
      activityType: ENUM,     // reading_plan_completed, chapter_read, prayer_logged, etc.
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

### LocalStorage Keys
- `sunday-school-lessons` - Main lesson data
- `streakData` - Activity streaks and badges
- `sunday-school-context-cards` - Bible context cards
- `primary-translation` - Selected Bible translation (ID)
- `secondary-translation` - Secondary Bible translation
- `parallel-mode-enabled` - Boolean for parallel translations

**Note**: No database migrations needed; schema is embedded in the application code.

---

## 3. EXISTING ADMIN FEATURES & API ENDPOINTS

### Admin Dashboard (`/admin`)
**Location**: `src/pages/AdminPage.js`

#### Features:
- **Dashboard Statistics**
  - Total lessons count
  - Total slides count
  - Total quarters count

- **Lesson Management**
  - View all lessons in table format
  - View lesson details (title, Q/U/L notation, slide count, scriptures)
  - Create new lesson → `/admin/create`
  - Edit lesson → `/admin/edit/:id`
  - Delete lesson with confirmation
  - Duplicate lesson functionality
  - Manage games → `/admin/games/:lessonId`

- **Data Display**
  - Quarter/Unit/Lesson number (Q/U/L format)
  - Scripture references
  - Slide counts

### Lesson Creator/Editor (`/admin/create`, `/admin/edit/:id`)
**Location**: `src/pages/LessonCreatorPage.js`

#### Fields:
- Title (required)
- Description
- (Extensible form structure)

#### Actions:
- Create new lesson
- Update existing lesson
- Cancel (return to admin)

### Games Admin (`/admin/games/:lessonId`)
**Location**: `src/pages/GamesAdminPage.js`

#### Functionality:
- **Wordle Management**
  - Add 5-letter words only
  - Validation: exactly 5 characters
  - Remove words
  - Word count display

- **Word Scramble Management**
  - Add words (no length restriction)
  - Remove words

- **Hangman Management**
  - Add words
  - Remove words

- **Word Search Management**
  - Add words
  - Remove words
  - Configurable grid size (8-20)

#### Actions:
- Add word with Enter key support
- Remove word with button
- Save changes (saves to lesson context)
- Navigate back to lesson editor

### API Endpoints (External)
All external calls use **Axios**:

#### Bible API (scripture.api.bible)
- `searchPassage(query, bibleId)` - Search Bible passages
- `getPassage(passageId, bibleId)` - Get specific passage
- `getChapter(bookId, chapterId, bibleId)` - Get chapter
- `getParallelPassages(passageId, bibleIds)` - Multi-translation lookup
- `getAvailableBibles()` - List available translations
- `getBooks(bibleId)` - Get books in Bible
- `getChapters(bookId, bibleId)` - Get chapters
- `fetchCrossReferencesWithText(verseId, bibleId)`
- `fetchCrossReferencesGrouped(verseId, bibleId)`

**Configuration**:
```javascript
const BIBLE_API_KEY = process.env.REACT_APP_BIBLE_API_KEY || 'demo-key';
const BIBLE_API_BASE = 'https://api.scripture.api.bible/v1';
const DEFAULT_BIBLE_ID = 'de4e12af7f28f599-02'; // NIV
```

#### Available Bible Translations (Hardcoded)
10 translations available with IDs and metadata (NIV, KJV, ESV, NKJV, NLT, NASB, MSG, CSB, NRSV, AMP)

---

## 4. AUTHENTICATION & AUTHORIZATION PATTERNS

### Current State: NO AUTHENTICATION
- **No user accounts**
- **No login system**
- **No authorization checks**
- **No role-based access control**

### Access Control
- **Admin pages** are completely open (no route guards)
- **All users** can access `/admin`, `/admin/create`, `/admin/edit/:id`, `/admin/games/:lessonId`
- **No permission checks** anywhere in the application

### Navigation Routes
**Location**: `src/App.js`

```javascript
Routes:
- / → HomePage
- /today → TodayPage (streaks, activities)
- /badges → BadgesPage (earned achievements)
- /lessons → LessonsPage (browse)
- /lesson/:id → LessonViewPage (view)
- /admin → AdminPage (dashboard)
- /admin/create → LessonCreatorPage (new lesson)
- /admin/edit/:id → LessonCreatorPage (edit)
- /admin/games/:lessonId → GamesAdminPage
- /games/:lessonId → GamesPage (play games)
- /bible → BibleToolPage
- /bible/parallel → ParallelBiblePage
- /bible/quote-generator → QuoteImageGeneratorPage
- /settings/translations → TranslationSettingsPage
- * → Navigate to /
```

### Recommended Implementation Areas
- Route guards for admin pages
- User authentication system
- Role-based access (teacher, student, admin)
- Permission middleware
- Session management

---

## 5. GROUPS & ORGANIZATIONS STRUCTURE

### Current State: NO GROUPS/ORGANIZATIONS SUPPORT
- No group management system
- No organization structure
- No user roles beyond implicit "admin" (anyone can admin)
- No multi-tenant support

### Lesson Organization
Currently lessons are organized by:
- **Quarter** (Q1-Q4) - Academic quarter
- **Unit** (1-4+) - Unit within quarter
- **Lesson Number** (1-13+) - Lesson within unit
- **Title** - Custom lesson name
- **Connection** - Thematic connection text
- **Scripture** - Associated Bible passages

### Data Model for Future Multi-Org Support
Suggested additions:
```javascript
{
  // Lesson extensions for organization
  organizationId: string,
  groupId: string,
  createdByUserId: string,
  visibility: 'private' | 'organization' | 'public',
  sharedWith: [string],          // User IDs
  
  // Metadata for organization
  metadata: {
    curriculum: string,          // Curriculum system
    ageGroup: string,            // Teen, Adult, etc.
    tags: [string]
  }
}
```

### Potential Organization Structure Needed
```javascript
// Organization
{
  id: string,
  name: string,
  description: string,
  createdAt: ISO8601
}

// Group within Organization
{
  id: string,
  organizationId: string,
  name: string,
  description: string,
  teachers: [userId],
  students: [userId],
  curriculum: string,
  createdAt: ISO8601
}

// User
{
  id: string,
  email: string,
  name: string,
  role: 'admin' | 'teacher' | 'student',
  organizationIds: [string],
  groupIds: [string]
}
```

---

## 6. BACKGROUND JOBS & SCHEDULING INFRASTRUCTURE

### Current State: NO JOB SCHEDULING
- No background job system
- No task queues
- No cron jobs in frontend
- No job scheduling infrastructure

### Async Operations
Limited async functionality found:
- `setTimeout()` - For UI state cleanup (3-5 second delays)
- API calls via Axios - External Bible API calls only
- No polling or background tasks

### GitHub Actions Automation (CI/CD)
**Location**: `.github/workflows/`

#### 1. **Auto PR Workflow** (`auto-pr.yml`)
- **Triggers**: Push to branches matching patterns (`claude/**`, `feature/**`, `fix/**`, `refactor/**`)
- **Actions**:
  - Checks if PR already exists for branch
  - Extracts commit messages and changed files
  - Auto-creates PR with summary
  - Triggers PR validation workflows

#### 2. **PR Check Workflow** (`pr-check.yml`)
- **Triggers**: Pull request events, manual workflow_dispatch
- **Validations**:
  - Node.js 18 setup with npm cache
  - `npm ci` install dependencies
  - ESLint linting (non-blocking)
  - TypeScript/JSX syntax via build
  - Required files verification
  - npm audit security check (non-blocking)
  - Deploy configuration validation

#### 3. **Auto Merge Workflow** (`auto-merge.yml`)
- **Triggers**: `check_suite` completed, `workflow_run` (PR Check completion)
- **Condition**: Only runs when PR Check succeeds
- **Actions**:
  - Fetches all open PRs
  - Checks "Validate PR" status
  - Squash merges passing PRs
  - Deletes feature branch after merge
  - Uses automatic merge mode (`--auto`)

#### 4. **Deploy Workflow** (`deploy.yml`)
- **Triggers**: Push to main branch, manual workflow_dispatch
- **Steps**:
  1. Checkout code
  2. Setup Node.js 18
  3. `npm install` dependencies
  4. `npm run build` React app (CI=false for warnings)
  5. Configure AWS credentials
  6. Sync build to S3 (teen-sunday-school-prod)
     - Cache static assets (31536000 seconds = 1 year)
     - No cache for HTML/service-worker
  7. Invalidate CloudFront cache (Distribution: E3NZIE249ZRXZX)
  8. Output deployment URL

### Environment Variables
**GitHub Secrets Used**:
- `PAT_TOKEN` - Personal Access Token for PR operations
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials

**Application Variables**:
- `REACT_APP_BIBLE_API_KEY` - Bible API key (defaults to 'demo-key')
- `CI=false` - React build setting (allows warnings)

### Scheduled Operations Needed
Potential future requirements:
- **Daily/Weekly Reports** - Activity summaries
- **Streak Cleanup** - Reset expired streaks
- **Data Backups** - LocalStorage exports
- **User Cleanup** - Inactive user management
- **Batch Imports** - Curriculum updates

---

## 7. DEPLOYMENT & INFRASTRUCTURE

### Current AWS Setup
- **S3 Bucket**: `teen-sunday-school-prod`
- **CloudFront Distribution**: `E3NZIE249ZRXZX`
- **Region**: `us-east-1`
- **IAM User**: `teen-sunday-school-deployer`
- **Live URL**: https://ds3lhez1cid5z.cloudfront.net

### Deployment Flow
```
Feature Branch Push
    ↓
Auto-PR Creates PR
    ↓
PR Check Validates Build
    ↓
Auto-Merge (if passing)
    ↓
Deploy to S3 (main branch push)
    ↓
Invalidate CloudFront
    ↓
Live on CloudFront CDN
```

---

## SUMMARY TABLE

| Aspect | Status | Details |
|--------|--------|---------|
| **Backend** | None | Frontend-only React app |
| **Database** | LocalStorage | No server-side DB |
| **Authentication** | None | No user system |
| **Authorization** | None | No access control |
| **Groups/Org** | None | No multi-tenant support |
| **Jobs/Queue** | None | No background tasks |
| **API Integration** | External only | Bible API via Axios |
| **Admin Features** | Basic | CRUD lessons, manage games |
| **Deployment** | AWS | S3 + CloudFront |
| **CI/CD** | GitHub Actions | Auto PR, merge, deploy |
| **Data Models** | Simple | Lessons, activities, context cards |

---

## KEY FINDINGS

1. **Greenfield for Enterprise Features**: No existing auth, org structures, or multi-tenant support - all needs to be built
2. **LocalStorage Only**: No persistent backend - important for implementing proper multi-user system
3. **Simple Admin UI**: Basic CRUD operations - good foundation for extended admin capabilities
4. **Automated Deployment**: Strong CI/CD pipeline in place - makes deployments frequent and reliable
5. **External API Only**: No backend API layer - will need to create backend service for new features
6. **No Background Jobs**: Will need to implement job scheduling for admin/organizational features

