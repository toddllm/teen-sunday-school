# Quick Reference - File Locations & Key Code

## Admin Features Locations

### Admin Dashboard
- **File**: `/home/user/teen-sunday-school/src/pages/AdminPage.js`
- **Key Functions**: 
  - `deleteLesson(id)` - Delete lesson
  - `duplicateLesson(id)` - Duplicate lesson
  - Display: table of lessons with Q/U/L notation, scriptures, slide count

### Lesson Creator/Editor
- **File**: `/home/user/teen-sunday-school/src/pages/LessonCreatorPage.js`
- **Key Functions**:
  - `handleSubmit()` - Create/update lesson
  - `handleChange()` - Update form field
- **Route**: `/admin/create`, `/admin/edit/:id`

### Games Management
- **File**: `/home/user/teen-sunday-school/src/pages/GamesAdminPage.js`
- **Key Functions**:
  - `handleAddWord(gameType)` - Add word to game
  - `handleRemoveWord(gameType, index)` - Remove word
  - `handleSave()` - Save changes to lesson
- **Route**: `/admin/games/:lessonId`
- **Supports**: Wordle, Word Scramble, Hangman, Word Search

---

## State Management (Contexts)

### Lessons Context
- **File**: `/home/user/teen-sunday-school/src/contexts/LessonContext.js`
- **Key Functions**:
  - `addLesson(lesson)` - Create new lesson
  - `updateLesson(id, updates)` - Update lesson
  - `deleteLesson(id)` - Delete lesson
  - `getLessonById(id)` - Fetch lesson
  - `duplicateLesson(id)` - Duplicate lesson
- **Storage Key**: `sunday-school-lessons` (localStorage)
- **Hook**: `useLessons()`

### Streak & Badges Context
- **File**: `/home/user/teen-sunday-school/src/contexts/StreakContext.js`
- **Key Functions**:
  - `logActivity(activityType)` - Log user activity
  - `getStats()` - Get activity statistics
  - `checkAndAwardBadges()` - Award badges
  - `getAllBadges()` - Get all badge definitions
- **Storage Key**: `streakData` (localStorage)
- **Hook**: `useStreak()`

### Context Cards Context (Bible Verse Context)
- **File**: `/home/user/teen-sunday-school/src/contexts/ContextCardContext.js`
- **Key Functions**:
  - `addContextCard(card)` - Create context card
  - `updateContextCard(id, updates)` - Update card
  - `deleteContextCard(id)` - Delete card
  - `searchContextCards(query)` - Search cards
- **Storage Key**: `sunday-school-context-cards` (localStorage)
- **Hook**: `useContextCards()`

### Translation Context
- **File**: `/home/user/teen-sunday-school/src/contexts/TranslationContext.js`
- **Storage Keys**: `primary-translation`, `secondary-translation`, `parallel-mode-enabled`
- **Hook**: `useTranslation()`
- **Available Translations**: 10 Bible versions (NIV, KJV, ESV, NKJV, NLT, NASB, MSG, CSB, NRSV, AMP)

---

## API & Services

### Bible API Service
- **File**: `/home/user/teen-sunday-school/src/services/bibleAPI.js`
- **Endpoint**: `https://api.scripture.api.bible/v1`
- **Key Functions**:
  - `searchPassage(query, bibleId)` - Search passages
  - `getPassage(passageId, bibleId)` - Get specific passage
  - `getParallelPassages(passageId, bibleIds)` - Multi-version lookup
  - `fetchCrossReferencesWithText(verseId, bibleId)` - Get cross-references
- **Auth**: `REACT_APP_BIBLE_API_KEY` environment variable

### Image Generator Service
- **File**: `/home/user/teen-sunday-school/src/services/imageGeneratorService.js`
- **Functionality**: Generate quote/scripture images

### Context Card Service
- **File**: `/home/user/teen-sunday-school/src/services/contextCardService.js`
- **Functionality**: Handle context card operations

---

## Routes (Authentication Required Routes)

### Public Routes
- `/` - HomePage
- `/lessons` - LessonsPage (browse)
- `/lesson/:id` - LessonViewPage (view)
- `/games/:lessonId` - GamesPage (play)
- `/bible` - BibleToolPage
- `/bible/parallel` - ParallelBiblePage
- `/bible/quote-generator` - QuoteImageGeneratorPage
- `/settings/translations` - TranslationSettingsPage
- `/today` - TodayPage (activity tracking)
- `/badges` - BadgesPage (achievements)

### Admin Routes (NO PROTECTION)
- `/admin` - AdminPage (dashboard)
- `/admin/create` - LessonCreatorPage (new lesson)
- `/admin/edit/:id` - LessonCreatorPage (edit lesson)
- `/admin/games/:lessonId` - GamesAdminPage (manage games)

**IMPORTANT**: Admin routes have NO authentication or authorization checks!

---

## GitHub Workflows (CI/CD)

### Deploy Workflow
- **File**: `/home/user/teen-sunday-school/.github/workflows/deploy.yml`
- **Trigger**: Push to main branch
- **Deploys To**: S3 bucket `teen-sunday-school-prod`
- **CloudFront**: `E3NZIE249ZRXZX`

### Auto PR Workflow
- **File**: `/home/user/teen-sunday-school/.github/workflows/auto-pr.yml`
- **Trigger**: Push to feature/claude/fix/refactor branches
- **Action**: Auto-creates PR with commit summary

### PR Check Workflow
- **File**: `/home/user/teen-sunday-school/.github/workflows/pr-check.yml`
- **Trigger**: Pull request events
- **Action**: Validates build, linting, syntax

### Auto Merge Workflow
- **File**: `/home/user/teen-sunday-school/.github/workflows/auto-merge.yml`
- **Trigger**: Check suite completed (after PR Check)
- **Action**: Auto-merges if all checks pass

---

## Data Model Locations

### Lesson Model Definition
- **File**: `src/contexts/LessonContext.js` (lines 41-86)
- **Key Fields**: id, title, quarter, unit, lessonNumber, slides, wordGames, scripture
- **Games Support**: wordle, scramble, hangman, wordSearch

### Badge Model Definition
- **File**: `src/contexts/StreakContext.js` (lines 15-86)
- **Count**: 10 badges defined
- **Types**: First Steps, Week Warrior, Faithful Fortnight, Month Master, Prayer Warrior, Scripture Scholar, Memory Master, Dedicated Disciple, Consistency Champion, Habit Hero

### Context Card Model
- **File**: `src/contexts/ContextCardContext.js` (lines 41-184)
- **Key Fields**: verseRef, historicalContext, literaryContext, keyTheme, crossReferences

---

## Environment Variables

### Application Variables
- `REACT_APP_BIBLE_API_KEY` - Bible API authentication key (defaults to 'demo-key')
- `CI=false` - React build setting (allow warnings)

### GitHub Secrets
- `PAT_TOKEN` - Personal Access Token for auto-PR workflow
- `AWS_ACCESS_KEY_ID` - AWS deployment credentials
- `AWS_SECRET_ACCESS_KEY` - AWS deployment credentials

---

## Key Structural Information

### No Backend Infrastructure
- No server-side database
- No API layer
- No authentication system
- All data persisted in browser localStorage
- External APIs: Bible Scripture API only

### Frontend Stack
- React 18.2.0
- React Router DOM v6.22.0
- Axios 1.6.0
- LocalStorage for persistence
- Web Speech API for text-to-speech

### Deployment Stack
- AWS S3 (static file hosting)
- CloudFront CDN (distribution)
- GitHub Actions (CI/CD)
- GitHub Secrets (credential management)

---

## To Add Authentication/Organizations:

### Files That Would Need Modification
1. `src/App.js` - Add route guards
2. `src/contexts/` - Add UserContext, OrganizationContext
3. `src/pages/AdminPage.js` - Add organization/group management
4. `.github/workflows/deploy.yml` - Add backend deployment step

### New Files Needed
1. `src/contexts/UserContext.js` - User authentication state
2. `src/contexts/OrganizationContext.js` - Organization management
3. `src/hooks/useAuth.js` - Auth helper hook
4. `src/hooks/useOrganization.js` - Organization helper hook
5. `src/components/ProtectedRoute.js` - Route guard component
6. Backend API service (Node.js/Express recommended)

