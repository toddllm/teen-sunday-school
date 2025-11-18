# Teen Sunday School App - Architecture Overview

## Project Summary
A **React-based frontend application** for managing interactive Bible lessons for teen Sunday school. Currently a **client-side only application** using localStorage for data persistence. No backend server or database is currently implemented.

---

## 1. Project Structure

### Overall Organization
```
teen-sunday-school/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Full-page components
│   ├── contexts/          # React Context for state management
│   ├── services/          # External API integrations
│   ├── data/              # Static data (cross-references)
│   ├── App.js             # Main app component with routing
│   ├── index.js           # Entry point with providers
│   ├── index.css          # Global styles
│   └── App.css            # App component styles
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
```

### Key Pages
| Page | Purpose | Route |
|------|---------|-------|
| HomePage | Landing page with features overview | `/` |
| AdminPage | Lesson management dashboard | `/admin` |
| LessonCreatorPage | Create/edit lessons | `/admin/create`, `/admin/edit/:id` |
| LessonsPage | View all lessons | `/lessons` |
| LessonViewPage | View single lesson content | `/lesson/:id` |
| GamesPage | Play lesson games | `/games/:lessonId` |
| GamesAdminPage | Configure lesson games | `/admin/games/:lessonId` |
| BibleToolPage | Search and display Bible verses | `/bible` |
| ParallelBiblePage | View multiple translations side-by-side | `/bible/parallel` |
| TodayPage | Daily activity tracking | `/today` |
| BadgesPage | View earned badges | `/badges` |
| TranslationSettingsPage | Manage Bible translation preferences | `/settings/translations` |

---

## 2. Database Setup

### Current Status: NO DATABASE
- **Storage**: Browser localStorage
- **Data Persistence**: JSON serialization in localStorage
- **ORM**: None (direct JavaScript object manipulation)

### Storage Keys
```javascript
'sunday-school-lessons'        // All lessons
'streakData'                   // Activity streaks and badges
'sunday-school-context-cards'  // Bible verse context information
'theme'                        // User theme preference
'primary-translation'          // Primary Bible translation ID
'secondary-translation'        // Secondary Bible translation ID
'parallel-mode-enabled'        // Parallel view toggle state
```

### Data Models

#### Lesson
```javascript
{
  id: string,                          // Generated as 'lesson-{timestamp}'
  title: string,
  description?: string,
  connection?: string,                 // Thematic connection
  quarter?: number,                    // Q/U/L curriculum number
  unit?: number,
  unitTitle?: string,
  lessonNumber?: number,
  scripture: string[],                 // Bible references
  rememberVerse: {
    text: string,
    reference: string
  },
  slides: [{
    id: number,
    html: string,                      // HTML content
    sayText: string,                   // For text-to-speech
    notes: string                      // Teaching notes
  }],
  discussionQuestions: string[],
  wordGames: {
    wordle: string[],                  // 5-letter words only
    scramble: string[],
    hangman: string[],
    wordSearch: {
      words: string[],
      grid: number                     // Grid size (8-20)
    }
  },
  createdAt: string,                   // ISO timestamp
  updatedAt: string                    // ISO timestamp
}
```

#### Activity/Streak Record
```javascript
{
  activities: [{
    date: string,                      // YYYY-MM-DD format
    activityType: string,              // READING_PLAN_COMPLETED, etc.
    timestamp: string                  // ISO timestamp
  }],
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: string,
  earnedBadges: [{
    badgeId: string,
    awardedAt: string                  // ISO timestamp
  }]
}
```

#### Context Card (Bible verse explanation)
```javascript
{
  id: string,
  verseRef: string,                    // e.g., "John 3:16"
  verseRange: string,                  // e.g., "John 3:16-20"
  historicalContext: string,
  literaryContext: string,
  keyTheme: string,
  crossReferences: [{
    ref: string,                       // Bible reference
    note: string                       // Explanation
  }],
  version: number,
  createdAt: string,
  updatedAt: string
}
```

---

## 3. Existing Authentication & Authorization Patterns

### Current Status: NO AUTHENTICATION
- **No login system** implemented
- **No user roles/permissions** system
- **No access control** on any features
- **Everyone has full access** to all pages and admin features

### Current Vulnerabilities
1. Anyone can access `/admin` and modify/delete all lessons
2. No user identification or audit trail
3. All data stored locally - no multi-device sync
4. No way to distinguish between teachers and students
5. Data loss if browser cache is cleared

### For Future Implementation
When implementing roles & permissions:
- Will need **backend authentication service**
- Should implement **user model** with roles (admin, teacher, student)
- Require **JWT tokens** or similar for API calls
- Add **route guards** to check user permissions
- Implement **role-based access control (RBAC)** in UI and backend

---

## 4. Current User Model & Schema

### No User Model Currently Exists
- Application is **single-user** (or rather, multi-user on same device)
- No concept of user accounts
- No way to track who created/modified content
- No user preferences beyond theme and Bible translation settings

### What Would Be Needed for Multi-User System
```javascript
// User Schema (future implementation)
{
  id: string,
  email: string,
  password: string,                    // Hashed
  firstName: string,
  lastName: string,
  role: 'admin' | 'teacher' | 'student',
  permissions: string[],               // e.g., ['create_lesson', 'edit_lesson']
  createdAt: string,
  updatedAt: string
}

// User Preferences Schema (future)
{
  userId: string,
  theme: 'light' | 'dark',
  primaryTranslation: string,
  secondaryTranslation: string,
  parallelModeEnabled: boolean,
  notificationsEnabled: boolean
}
```

---

## 5. API Structure & Routing Patterns

### External APIs Used

#### Bible API (`scripture.api.bible`)
- **Base URL**: `https://api.scripture.api.bible/v1`
- **Authentication**: API key in headers
- **Key Endpoints**:
  - `GET /bibles` - List available Bible translations
  - `GET /bibles/{bibleId}/books` - List books
  - `GET /bibles/{bibleId}/books/{bookId}/chapters` - List chapters
  - `GET /bibles/{bibleId}/chapters/{chapterId}` - Get chapter text
  - `GET /bibles/{bibleId}/passages/{passageId}` - Get specific passage
  - `GET /bibles/{bibleId}/search` - Search passages

#### Service Layer (`src/services/`)
```javascript
// bibleAPI.js - Main Bible API wrapper
export const searchPassage(query, bibleId)
export const getPassage(passageId, bibleId)
export const parseReference(reference)
export const getVerseText(reference)
export const getChapter(book, chapter, bibleId)
export const getParallelPassages(passageId, bibleIds)
export const getParallelChapters(book, chapter, bibleIds)
export const getAvailableBibles()
export const getBooks(bibleId)
export const getChapters(bibleId, bookId)
export const referenceToVerseId(reference)
export const verseIdToReference(verseId)
export const getCrossReferences(verseId, grouped)
export const fetchCrossReferencesWithText(verseId, bibleId)
export const fetchCrossReferencesGrouped(verseId, bibleId)

// contextCardService.js - Context card utilities
export const getContextCardByVerseRef(verseRef)
export const addContextCard(cardData)
export const updateContextCard(cardId, updates)
export const deleteContextCard(cardId)
export const searchContextCards(query)
```

### Internal Routing
- **Framework**: React Router v6
- **Pattern**: Component-based routes in `App.js`
- **Navigation**: `<Link>` and `useNavigate()` hook

### No REST API Currently
- Would need to create if implementing backend
- Suggested endpoints for roles/permissions:
  ```
  GET    /api/users                    # List users
  POST   /api/users                    # Create user
  GET    /api/users/:id                # Get user details
  PUT    /api/users/:id                # Update user
  DELETE /api/users/:id                # Delete user
  
  GET    /api/roles                    # List roles
  GET    /api/permissions              # List all permissions
  POST   /api/users/:id/roles          # Assign role to user
  DELETE /api/users/:id/roles/:roleId  # Remove role from user
  ```

---

## 6. Existing Admin Interfaces

### Current Admin Features

#### 1. Admin Dashboard (`/admin`)
- View all lessons with statistics
  - Total lessons count
  - Total slides count
  - Number of quarters
- Lesson management table with columns:
  - Title (with connection subtitle)
  - Q/U/L (Quarter/Unit/Lesson number)
  - Slide count
  - Scripture references
  - Action buttons:
    - 👁️ View lesson
    - ✏️ Edit lesson
    - 🎮 Manage games
    - 📋 Duplicate lesson
    - 🗑️ Delete lesson

#### 2. Lesson Creator (`/admin/create`, `/admin/edit/:id`)
- Form-based lesson creation with fields:
  - Title (required)
  - Description
  - Can be extended for more fields

#### 3. Games Admin (`/admin/games/:lessonId`)
- Add/remove words for different game types:
  - **Wordle**: 5-letter words only
  - **Word Scramble**: Any length words
  - **Hangman**: Any length words
  - **Word Search**: Any length words with configurable grid size (8-20)
- Visual word list with delete buttons
- Real-time validation and feedback

### Admin Components
```
src/components/
├── Navigation.js              # App navigation bar (includes admin link)

src/pages/
├── AdminPage.js              # Main admin dashboard
├── LessonCreatorPage.js      # Lesson creation/editing
├── GamesAdminPage.js         # Game configuration
└── TranslationSettingsPage.js # Bible translation preferences
```

### Admin Access Pattern
- Currently: **No access control** - anyone can visit `/admin`
- Future: Would need role-based middleware/guards

---

## 7. State Management

### React Context API (5 Contexts)

#### 1. LessonContext
- Manages all lessons
- Methods:
  - `addLesson(lesson)` - Add new lesson
  - `updateLesson(id, updates)` - Update existing
  - `deleteLesson(id)` - Delete lesson
  - `getLessonById(id)` - Get single lesson
  - `duplicateLesson(id)` - Clone lesson
- Data: `lessons[]`, `loading`

#### 2. StreakContext
- Tracks user activities and badges
- Methods:
  - `logActivity(activityType)` - Log activity
  - `getStats()` - Get activity statistics
  - `getAllBadges()` - Get all badges with earned status
  - `getEarnedBadges()` - Get only earned badges
  - `isStreakAtRisk()` - Check if streak might break
  - `getEncouragementMessage()` - Get motivational message
- Activity Types: READING_PLAN_COMPLETED, CHAPTER_READ, PRAYER_LOGGED, VERSE_MEMORIZED, LESSON_COMPLETED

#### 3. ThemeContext
- Manages light/dark theme
- Methods:
  - `toggleTheme()` - Switch theme
- Data: `theme`, `isDark`

#### 4. TranslationContext
- Manages Bible translation preferences
- Available Translations: NIV, KJV, ESV, NKJV, NLT, NASB, MSG, CSB, NRSV, AMP
- Methods:
  - `setPrimaryTranslation(id)`
  - `setSecondaryTranslation(id)`
  - `toggleParallelMode()`
  - `getTranslationById(id)`
  - `getPrimaryTranslationInfo()`
  - `getSecondaryTranslationInfo()`

#### 5. ContextCardContext
- Manages Bible verse context explanations
- Methods:
  - `getContextCardByVerseRef(ref)` - Get context for verse
  - `addContextCard(data)` - Add new context card
  - `updateContextCard(id, updates)` - Update card
  - `deleteContextCard(id)` - Delete card
  - `searchContextCards(query)` - Search cards

### Provider Hierarchy (in `index.js`)
```
<ThemeProvider>
  <TranslationProvider>
    <StreakProvider>
      <LessonProvider>
        <ContextCardProvider>
          <App />
        </ContextCardProvider>
      </LessonProvider>
    </StreakProvider>
  </TranslationProvider>
</ThemeProvider>
```

---

## 8. Technology Stack

### Frontend
- **React**: 18.2.0
- **React Router**: 6.22.0 (client-side routing)
- **Axios**: 1.6.0 (HTTP client for external APIs)
- **date-fns**: 2.30.0 (date utilities)

### Styling
- CSS3 with CSS Variables for theming
- Light/Dark mode support
- Responsive design

### Build & Runtime
- **Node.js** runtime environment
- **npm** package manager
- **React Scripts**: 5.0.1 (CRA tooling)
- **Port**: 3013

### External Services
- **scripture.api.bible** - Bible verse API (free tier)
- **Browser localStorage** - Data persistence

---

## 9. Gamification Features

### Badges System (StreakContext)
10 badges available:
1. **First Steps** 🌱 - Complete first activity
2. **Week Warrior** 🔥 - 7-day streak
3. **Faithful Fortnight** ⭐ - 14-day streak
4. **Month Master** 🏆 - 30-day streak
5. **Prayer Warrior** 🙏 - Log 10 prayers
6. **Scripture Scholar** 📖 - Read 25 chapters
7. **Memory Master** 🧠 - Memorize 10 verses
8. **Dedicated Disciple** ✨ - Complete 50 activities
9. **Consistency Champion** 🎯 - 10-day streak (lifetime best)
10. **Habit Hero** 👑 - 30-day streak (lifetime best)

### Games
- **Wordle** - 5-letter word guessing
- **Word Scramble** - Unscramble letters
- **Hangman** - Classic word guessing
- **Word Search** - Find words in grid

---

## 10. Key Files to Understand for Roles/Permissions Implementation

### Critical Files for Understanding
1. `/src/contexts/LessonContext.js` - How state is managed
2. `/src/pages/AdminPage.js` - Current access patterns
3. `/src/components/Navigation.js` - UI entry points
4. `/src/App.js` - Route structure
5. `/src/index.js` - Provider setup

### Files That Would Need Modification
1. Create: `/src/contexts/AuthContext.js` - User authentication
2. Create: `/src/contexts/PermissionContext.js` - Permission checking
3. Create: `/src/components/ProtectedRoute.js` - Route protection
4. Modify: `/src/App.js` - Add route guards
5. Modify: `/src/pages/AdminPage.js` - Restrict to admin users
6. Modify: `/src/services/` - Add auth services
7. Create: Backend authentication service

---

## 11. Deployment

### Current Deployment
- **Platform**: AWS (S3 + CloudFront)
- **CI/CD**: GitHub Actions
- **Build**: React Scripts build to `/build` directory
- **Scripts**:
  - `npm start` - Dev server on port 3013
  - `npm run build` - Production build
  - `npm test` - Run tests

### Environment Variables
```
REACT_APP_BIBLE_API_KEY=<your_key>
```

---

## 12. Architecture Recommendations for Roles/Permissions System

### Frontend Changes Needed
1. **Authentication Context** - Manage logged-in user
2. **Permission Context** - Check user capabilities
3. **Protected Routes** - Restrict page access by role
4. **UI Conditionals** - Show/hide features based on permissions
5. **User Profile Page** - Display user info and role

### Backend Needed
1. **User Management Service**
   - Register/login endpoints
   - User CRUD operations
   - Password hashing with bcrypt
   - JWT token generation/validation

2. **Role & Permission Service**
   - Manage roles and permissions
   - Assign roles to users
   - Check permissions in middleware

3. **Data Models**
   - User model with role_id foreign key
   - Role model with permissions relationship
   - Permission model for granular control
   - User audit log for tracking changes

4. **Database**
   - PostgreSQL recommended
   - ORM: Prisma or TypeORM
   - Schema for users, roles, permissions, audit logs

5. **API Endpoints**
   - Authentication: /api/auth/register, /api/auth/login, /api/auth/refresh
   - Users: /api/users (CRUD)
   - Roles: /api/roles (CRUD)
   - Permissions: /api/permissions (CRUD)
   - User-Role mapping: /api/users/:id/roles

### Security Considerations
1. JWT tokens with expiration
2. Refresh token rotation
3. CORS configuration
4. Role-based API endpoint protection
5. Input validation and sanitization
6. SQL injection prevention (use ORM)
7. XSS prevention
8. CSRF token for state-changing operations

---

## Summary

**Current State**: Client-side React application with localStorage persistence and no authentication.

**Key Strengths**:
- Clean component architecture using React Context API
- Well-organized file structure
- Multiple features already implemented (games, Bible integration, gamification)
- Good separation of concerns

**What's Missing for Roles/Permissions**:
- No backend server
- No database
- No user authentication
- No authorization logic
- No audit trail

**Next Steps**:
1. Set up backend framework (Node.js/Express recommended)
2. Set up database (PostgreSQL)
3. Implement user authentication
4. Create roles and permissions system
5. Add middleware for permission checking
6. Create frontend auth context and route guards
7. Implement user management UI

