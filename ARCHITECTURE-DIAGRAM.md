# Teen Sunday School - Architecture Diagram

## Frontend Architecture (Current - No Backend)

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser/Client                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    React App (App.js)                │  │
│  │  Routes: /, /admin, /lessons, /lesson/:id, etc.     │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │              Context Providers (index.js)            │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ ┌────────────────────────────────────────────────┐  │  │
│  │ │ ThemeProvider                                  │  │  │
│  │ │ ├─ TranslationProvider                        │  │  │
│  │ │ │ ├─ StreakProvider                           │  │  │
│  │ │ │ │ ├─ LessonProvider                         │  │  │
│  │ │ │ │ │ ├─ ContextCardProvider                  │  │  │
│  │ │ │ │ │ │ └─ <App />                            │  │  │
│  │ │ │ │ │ └──────────────────────────────────────│  │  │
│  │ │ │ │ └────────────────────────────────────────│  │  │
│  │ │ │ └──────────────────────────────────────────│  │  │
│  │ │ └────────────────────────────────────────────│  │  │
│  │ └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────┼───────────────────────────────────┐  │
│  │         UI Components & Pages (src/components,     │  │
│  │              src/pages)                            │  │
│  │                                                      │  │
│  │  ├─ Navigation (navbar with links)                 │  │
│  │  ├─ Pages:                                         │  │
│  │  │  ├─ HomePage                                    │  │
│  │  │  ├─ AdminPage (lesson dashboard - NO AUTH)    │  │
│  │  │  ├─ LessonCreatorPage (create/edit)           │  │
│  │  │  ├─ LessonViewPage (view lesson)              │  │
│  │  │  ├─ GamesPage (play games)                     │  │
│  │  │  ├─ GamesAdminPage (configure games)          │  │
│  │  │  ├─ BibleToolPage (search Bible)              │  │
│  │  │  ├─ ParallelBiblePage (multi-translation)     │  │
│  │  │  ├─ TodayPage (activity tracking)             │  │
│  │  │  ├─ BadgesPage (view badges)                  │  │
│  │  │  └─ TranslationSettingsPage (Bible settings)  │  │
│  │  └─ Components:                                    │  │
│  │     ├─ ContextCardModal                          │  │
│  │     ├─ CrossReferencePanel                       │  │
│  │     ├─ Various game components                   │  │
│  │     └─ Navigation                                │  │
│  └────────────────────────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │         Services (src/services)                      │  │
│  │                                                      │  │
│  │  ├─ bibleAPI.js                                    │  │
│  │  │  ├─ searchPassage()                            │  │
│  │  │  ├─ getPassage()                               │  │
│  │  │  ├─ getChapter()                               │  │
│  │  │  ├─ getParallelPassages()                      │  │
│  │  │  ├─ getCrossReferences()                       │  │
│  │  │  └─ [10+ more functions]                       │  │
│  │  └─ contextCardService.js (utilities)             │  │
│  └────────────────────────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │        Browser Local Storage (No Backend)           │  │
│  │                                                      │  │
│  │  Key: 'sunday-school-lessons'                      │  │
│  │       'streakData'                                 │  │
│  │       'sunday-school-context-cards'                │  │
│  │       'theme'                                      │  │
│  │       'primary-translation'                        │  │
│  │       'secondary-translation'                      │  │
│  │       'parallel-mode-enabled'                      │  │
│  │                                                      │  │
│  │  Data Format: JSON strings                         │  │
│  │  Persistence: Automatic on context state changes   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         │
         │ HTTP Requests
         │ (axios)
         ▼
┌─────────────────────────────────────────────────────────────┐
│           External APIs (No Backend)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  scripture.api.bible                                        │
│  ├─ Base URL: https://api.scripture.api.bible/v1           │
│  ├─ Returns: Bible verses, chapters, metadata              │
│  ├─ Supported Translations:                                │
│  │  NIV, KJV, ESV, NKJV, NLT, NASB, MSG, CSB, NRSV, AMP   │
│  └─ Used by: BibleToolPage, ParallelBiblePage             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Models Overview

### Current Data Models (localStorage)

```
┌─────────────────────────────────────────────────────────┐
│ LESSON STRUCTURE                                        │
├─────────────────────────────────────────────────────────┤
│ {                                                       │
│   id: "lesson-1234567890"                             │
│   title: "Lesson Title"                               │
│   description: "...",                                 │
│   connection: "Thematic Connection",                  │
│   quarter: 1, unit: 3, lessonNumber: 12              │
│   scripture: ["John 3:16", "Romans 8:28"]            │
│   rememberVerse: { text: "...", reference: "..." }   │
│   slides: [                                           │
│     { id: 1, html: "...", sayText: "...", notes: "" }│
│   ],                                                  │
│   discussionQuestions: ["Q1?", "Q2?", "Q3?"],        │
│   wordGames: {                                        │
│     wordle: ["FAITH", "GRACE"],                      │
│     scramble: ["TRUST", "PEACE"],                    │
│     hangman: ["LOVE", "HOPE"],                       │
│     wordSearch: {                                     │
│       words: ["GOD", "PRAYER"],                       │
│       grid: 10                                        │
│     }                                                 │
│   },                                                  │
│   createdAt: "2025-11-18T10:30:00Z",                │
│   updatedAt: "2025-11-18T10:30:00Z"                 │
│ }                                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ACTIVITY/STREAK STRUCTURE                              │
├─────────────────────────────────────────────────────────┤
│ {                                                       │
│   activities: [                                        │
│     {                                                  │
│       date: "2025-11-18",                             │
│       activityType: "lesson_completed",               │
│       timestamp: "2025-11-18T10:30:00Z"              │
│     }                                                  │
│   ],                                                  │
│   currentStreak: 7,                                   │
│   longestStreak: 30,                                  │
│   lastActivityDate: "2025-11-18",                     │
│   earnedBadges: [                                      │
│     {                                                  │
│       badgeId: "week_warrior",                        │
│       awardedAt: "2025-11-18T10:30:00Z"              │
│     }                                                  │
│   ]                                                   │
│ }                                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ CONTEXT CARD STRUCTURE                                 │
├─────────────────────────────────────────────────────────┤
│ {                                                       │
│   id: "context-john-3-16",                            │
│   verseRef: "John 3:16",                              │
│   verseRange: "John 3:16-20",                         │
│   historicalContext: "Jesus spoke these words...",    │
│   literaryContext: "This verse is part of...",        │
│   keyTheme: "God's love and salvation",               │
│   crossReferences: [                                   │
│     { ref: "Romans 5:8", note: "God demonstrates..." }│
│   ],                                                  │
│   version: 1,                                         │
│   createdAt: "2025-11-18T10:30:00Z",                │
│   updatedAt: "2025-11-18T10:30:00Z"                 │
│ }                                                     │
└─────────────────────────────────────────────────────────┘
```

---

## What's Missing for Roles & Permissions System

### Current Vulnerabilities

```
┌─────────────────────────────────────────────────────────┐
│ SECURITY ISSUES (Current State)                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ❌ NO AUTHENTICATION                                   │
│    └─ Anyone can access /admin without login          │
│                                                         │
│ ❌ NO USER MODEL                                       │
│    └─ Can't identify who created/modified content     │
│                                                         │
│ ❌ NO AUTHORIZATION                                    │
│    └─ No role-based access control                    │
│       └─ No way to distinguish admin/teacher/student  │
│                                                         │
│ ❌ NO AUDIT TRAIL                                      │
│    └─ Can't track who changed what and when           │
│                                                         │
│ ❌ NO PERSISTENT MULTI-USER SUPPORT                   │
│    └─ Data is local to browser                        │
│       └─ No syncing between devices or users          │
│                                                         │
│ ❌ NO PASSWORD SECURITY                               │
│    └─ No user authentication                          │
│                                                         │
│ ❌ DATA LOSS RISK                                      │
│    └─ Clearing browser cache loses all data           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Required Backend Architecture (For Implementation)

```
┌─────────────────────────────────────────────────────────────────┐
│                     REQUIRED BACKEND                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Node.js/Express Server (Suggested)                        │ │
│ │ - Port: 3000 or 5000                                      │ │
│ │ - Middleware: CORS, Auth, Validation                      │ │
│ ├────────────────────────────────────────────────────────────┤ │
│ │ Routes:                                                    │ │
│ │ POST   /api/auth/register   - User registration          │ │
│ │ POST   /api/auth/login      - User login (JWT)           │ │
│ │ POST   /api/auth/refresh    - Refresh token              │ │
│ │ GET    /api/users           - List users (admin only)    │ │
│ │ POST   /api/users           - Create user (admin)        │ │
│ │ GET    /api/users/:id       - Get user details           │ │
│ │ PUT    /api/users/:id       - Update user                │ │
│ │ DELETE /api/users/:id       - Delete user (admin)        │ │
│ │ GET    /api/roles           - List roles (admin)         │ │
│ │ POST   /api/roles           - Create role (admin)        │ │
│ │ GET    /api/permissions     - List permissions           │ │
│ │ POST   /api/users/:id/roles - Assign role to user        │ │
│ │ DELETE /api/users/:id/roles/:roleId - Remove role        │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ PostgreSQL Database (Recommended)                         │ │
│ │ - ORM: Prisma or TypeORM                                 │ │
│ │ - Tables:                                                 │ │
│ │   * users                                                 │ │
│ │   * roles                                                 │ │
│ │   * permissions                                           │ │
│ │   * user_roles (junction table)                          │ │
│ │   * role_permissions (junction table)                    │ │
│ │   * lessons (moved from localStorage)                    │ │
│ │   * audit_logs (track all changes)                       │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Authentication Flow:                                       │ │
│ │ 1. User submits credentials                              │ │
│ │ 2. Server validates against database                     │ │
│ │ 3. Server returns JWT token                              │ │
│ │ 4. Frontend stores token (localStorage/sessionStorage)   │ │
│ │ 5. Frontend sends token with every API request           │ │
│ │ 6. Server validates token before processing              │ │
│ │ 7. Server checks user permissions for action             │ │
│ │ 8. Action allowed/denied based on permissions            │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Suggested Roles & Permissions

```
┌─────────────────────────────────────────────────────────────┐
│ ROLE HIERARCHY (To Implement)                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ADMIN (Superuser)                                          │
│ ├─ View all lessons                                        │
│ ├─ Create/Edit/Delete any lesson                          │
│ ├─ Configure games for any lesson                         │
│ ├─ Manage users (CRUD)                                    │
│ ├─ Manage roles and permissions                           │
│ ├─ View audit logs                                        │
│ ├─ Access analytics/reports                               │
│ └─ Backup/restore data                                    │
│                                                             │
│ TEACHER                                                     │
│ ├─ View all lessons                                        │
│ ├─ Create own lessons                                      │
│ ├─ Edit own lessons (not others')                         │
│ ├─ Delete own lessons                                      │
│ ├─ Configure games for own lessons                        │
│ ├─ View class progress/streaks                            │
│ ├─ Cannot delete other teachers' lessons                  │
│ └─ Cannot manage users                                     │
│                                                             │
│ STUDENT                                                     │
│ ├─ View lessons (all teachers')                           │
│ ├─ Play games                                             │
│ ├─ Track own streaks and badges                           │
│ ├─ View Bible tools                                       │
│ ├─ Cannot create/edit lessons                             │
│ ├─ Cannot access admin panel                              │
│ └─ Cannot see other students' data                        │
│                                                             │
│ GUEST (Future)                                             │
│ └─ View-only access to lessons                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## File Locations for Key Components

```
Key Files to Understand:

Frontend:
  /src/App.js                          - Route definitions (would need route guards)
  /src/index.js                        - Provider setup (would add AuthProvider)
  /src/contexts/LessonContext.js       - Lesson state (would need user context)
  /src/pages/AdminPage.js              - Admin dashboard (would need auth check)
  /src/components/Navigation.js        - Nav bar (would show/hide admin link)

To Create:
  /src/contexts/AuthContext.js         - NEW: User authentication
  /src/contexts/PermissionContext.js   - NEW: Permission checking
  /src/components/ProtectedRoute.js    - NEW: Route guards
  /src/services/authService.js         - NEW: Auth API calls
  /src/services/userService.js         - NEW: User management
  /src/pages/LoginPage.js              - NEW: Login form
  /src/pages/UserManagementPage.js     - NEW: Admin user management
  /src/pages/UserProfilePage.js        - NEW: User profile/settings

Backend (Entire Stack Needed):
  /server/routes/auth.js               - Authentication endpoints
  /server/routes/users.js              - User management endpoints
  /server/routes/roles.js              - Role management endpoints
  /server/middleware/auth.js           - JWT verification
  /server/middleware/permissions.js    - Permission checking
  /server/models/User.js               - User database model
  /server/models/Role.js               - Role database model
  /server/models/Permission.js         - Permission database model
  /server/models/Lesson.js             - Lesson database model
  /server/models/AuditLog.js           - Audit trail model
```

---

## Implementation Priority

```
Phase 1: Backend Foundation
  ✓ Set up Express.js server
  ✓ Set up PostgreSQL database
  ✓ Create User model
  ✓ Create Role/Permission models
  ✓ Implement JWT authentication
  ✓ Create auth endpoints (/register, /login, /refresh)

Phase 2: Authorization System
  ✓ Create role and permission records in database
  ✓ Create Role-Permission associations
  ✓ Implement permission middleware
  ✓ Protect endpoints with role checks
  ✓ Create user management endpoints

Phase 3: Data Migration
  ✓ Migrate lessons from localStorage to database
  ✓ Create lesson ownership associations
  ✓ Set up audit logging

Phase 4: Frontend Integration
  ✓ Create AuthContext for login state
  ✓ Create ProtectedRoute component
  ✓ Add login page
  ✓ Protect /admin routes
  ✓ Add logout functionality
  ✓ Create user management UI

Phase 5: Security Hardening
  ✓ Add HTTPS/SSL
  ✓ Implement rate limiting
  ✓ Add input validation
  ✓ Implement CSRF protection
  ✓ Set up error logging
```

