# Implementation Plan: Profile Avatars & Nicknames

## Overview
Allow teens to personalize their identity with safe nicknames and predefined avatars. This feature enhances engagement while maintaining safety and leader visibility.

## Feature Requirements

### User Stories
1. **Teen User**: I want a fun avatar and nickname instead of my real name on leader screens
2. **Leader**: I want to see consistent identities across games and lessons
3. **Admin**: I want to track profile completion and popular avatars

### Key Functionality
- Choose from predefined avatars (no uploads for safety)
- Set nickname with safety validation
- Display avatar + nickname throughout the app
- Leaders can see real identity when needed (configurable)
- Track profile completion and avatar usage metrics

## Technical Architecture

### Database Schema Changes

#### 1. Extend User Model
```prisma
model User {
  // ... existing fields ...
  nickname         String?
  avatarId         String?
  profileCompletedAt DateTime?
  nicknameUpdatedAt  DateTime?

  avatar           Avatar?  @relation(fields: [avatarId], references: [id])
}
```

#### 2. Create Avatar Model
```prisma
model Avatar {
  id          String   @id @default(cuid())
  name        String   @unique  // e.g., "cool-cat", "happy-dog"
  displayName String            // e.g., "Cool Cat", "Happy Dog"
  imageUrl    String            // URL or path to avatar image
  category    String            // e.g., "animals", "nature", "abstract"
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())

  users       User[]

  @@index([isActive, sortOrder])
}
```

#### 3. Create Profile Metrics Model (Optional)
```prisma
model ProfileMetric {
  id             String   @id @default(cuid())
  organizationId String
  date           DateTime @db.Date
  profilesCompleted Int   @default(0)
  nicknameChanges   Int   @default(0)
  avatarUsage       Json   // { "avatarId": count }
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization @relation(...)

  @@unique([organizationId, date])
}
```

### Backend Implementation

#### 1. Profile Routes
**File**: `/server/src/routes/profile.routes.ts`
```typescript
// GET /api/me/profile - Get current user's profile
// PATCH /api/me/profile - Update nickname and/or avatar
```

#### 2. Profile Controller
**File**: `/server/src/controllers/profile.controller.ts`
```typescript
export const getMyProfile = async (req: AuthRequest, res: Response)
export const updateMyProfile = async (req: AuthRequest, res: Response)
```

#### 3. Nickname Validation Service
**File**: `/server/src/services/nicknameValidator.ts`
```typescript
export const validateNickname = (nickname: string): ValidationResult
// Rules:
// - Length: 3-20 characters
// - Allowed: letters, numbers, spaces, hyphens, underscores
// - No profanity (basic filter)
// - No URLs or email patterns
// - No consecutive special characters
```

#### 4. Avatar Service
**File**: `/server/src/services/avatar.service.ts`
```typescript
export const getActiveAvatars = async ()
export const getAvatarById = async (id: string)
export const seedAvatars = async ()
```

#### 5. Metrics Service
**File**: `/server/src/services/profileMetrics.service.ts`
```typescript
export const trackProfileCompletion = async (userId: string)
export const trackAvatarChange = async (avatarId: string, orgId: string)
export const getProfileMetrics = async (orgId: string, dateRange)
```

### Frontend Implementation

#### 1. Profile Context Extension
**File**: `/src/contexts/ProfileContext.jsx`
```javascript
// Provides:
// - userProfile: { nickname, avatar, profileCompletedAt }
// - avatars: List of available avatars
// - updateProfile(data): Update nickname/avatar
// - isProfileComplete: Boolean flag
```

#### 2. Profile Settings Page
**File**: `/src/pages/ProfileSettingsPage.js`
```javascript
// Components:
// - Avatar selector grid
// - Nickname input with live validation
// - Save button
// - Preview of how profile appears
```

#### 3. Avatar Selector Component
**File**: `/src/components/profile/AvatarSelector.js`
```javascript
// Features:
// - Grid of avatar options
// - Category filtering (animals, nature, abstract)
// - Selected state highlighting
// - Responsive grid layout
```

#### 4. Nickname Input Component
**File**: `/src/components/profile/NicknameInput.js`
```javascript
// Features:
// - Real-time validation feedback
// - Character counter (3-20 chars)
// - Error/success indicators
// - Debounced API validation
```

#### 5. User Display Component
**File**: `/src/components/profile/UserDisplay.js`
```javascript
// Features:
// - Shows avatar + nickname
// - Fallback to firstName if no profile
// - Optional real name tooltip for leaders
// - Size variants (small, medium, large)
```

#### 6. Update Existing Components

**Navigation.js**
- Show avatar + nickname instead of firstName

**Admin Components**
- Leader dashboard: Display avatars in user lists
- Games: Use avatar + nickname in leaderboards
- Polls: Show avatar + nickname in results

**Games Components**
- Update WordScramble.js, Hangman.js, etc. to use UserDisplay

### API Endpoints

#### Profile Endpoints
```
GET    /api/me/profile
Response: {
  user: {
    id, email, firstName, lastName, role,
    nickname, avatar: { id, name, displayName, imageUrl },
    profileCompletedAt
  }
}

PATCH  /api/me/profile
Body: { nickname?, avatarId? }
Response: {
  user: { ...updated profile }
}
```

#### Avatar Endpoints
```
GET    /api/avatars
Response: {
  avatars: [
    { id, name, displayName, imageUrl, category }
  ]
}
```

#### Metrics Endpoints (Admin Only)
```
GET    /api/admin/profile-metrics?startDate=&endDate=
Response: {
  profileCompletionRate: 0.85,
  totalProfiles: 120,
  mostUsedAvatars: [
    { avatarId, name, count },
    ...
  ],
  nicknameChanges: 45
}
```

### Nickname Validation Rules

#### Backend Validation
```typescript
const NICKNAME_RULES = {
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-zA-Z0-9\s_-]+$/,
  noConsecutiveSpecial: /[_-]{2,}/,
  noProfanity: true, // Basic filter
  noUrls: true,
  noEmails: true
};
```

#### Profanity Filter
**File**: `/server/src/utils/profanityFilter.ts`
```typescript
// Basic implementation using word list
// Can be enhanced with external service if needed
const BLOCKED_WORDS = ['...'];
export const containsProfanity = (text: string): boolean
```

### Avatar Asset Strategy

#### Option 1: Use Emoji/Unicode
- Pros: No asset hosting needed, consistent across platforms
- Cons: Limited customization, OS-dependent rendering

#### Option 2: Use SVG Icons
- Pros: Scalable, customizable colors, small file size
- Cons: Need to source/create assets
- Recommended Libraries: Avataaars, DiceBear, or custom SVGs

#### Option 3: Use PNG/WebP Images
- Pros: Rich graphics, professional look
- Cons: Larger file sizes, need CDN for performance

**Recommendation**: Use SVG avatars from DiceBear or create custom set
- Store in `/public/avatars/` directory
- Reference via URL: `/avatars/{avatar-name}.svg`
- Seed database with predefined options

### Predefined Avatar Set (Example)

```json
[
  {
    "name": "cool-cat",
    "displayName": "Cool Cat",
    "imageUrl": "/avatars/cool-cat.svg",
    "category": "animals"
  },
  {
    "name": "happy-dog",
    "displayName": "Happy Dog",
    "imageUrl": "/avatars/happy-dog.svg",
    "category": "animals"
  },
  {
    "name": "wise-owl",
    "displayName": "Wise Owl",
    "imageUrl": "/avatars/wise-owl.svg",
    "category": "animals"
  },
  {
    "name": "friendly-fox",
    "displayName": "Friendly Fox",
    "imageUrl": "/avatars/friendly-fox.svg",
    "category": "animals"
  },
  {
    "name": "brave-lion",
    "displayName": "Brave Lion",
    "imageUrl": "/avatars/brave-lion.svg",
    "category": "animals"
  },
  {
    "name": "sunny-flower",
    "displayName": "Sunny Flower",
    "imageUrl": "/avatars/sunny-flower.svg",
    "category": "nature"
  },
  {
    "name": "mountain-peak",
    "displayName": "Mountain Peak",
    "imageUrl": "/avatars/mountain-peak.svg",
    "category": "nature"
  },
  {
    "name": "ocean-wave",
    "displayName": "Ocean Wave",
    "imageUrl": "/avatars/ocean-wave.svg",
    "category": "nature"
  },
  {
    "name": "star-burst",
    "displayName": "Star Burst",
    "imageUrl": "/avatars/star-burst.svg",
    "category": "abstract"
  },
  {
    "name": "rainbow-arc",
    "displayName": "Rainbow Arc",
    "imageUrl": "/avatars/rainbow-arc.svg",
    "category": "abstract"
  }
]
```

### Privacy & Permissions

#### Display Rules
1. **Teen View**: Always see nickname + avatar (own and others)
2. **Leader View**: See nickname + avatar by default
   - Hover tooltip shows real name (configurable)
   - Admin pages show real name alongside nickname
3. **Admin View**: Full control, see all information

#### Configuration Options
**File**: `/server/prisma/schema.prisma`
```prisma
model Organization {
  // ... existing fields ...
  showRealNamesToLeaders Boolean @default(true)
  requireNicknames       Boolean @default(false)
  allowNicknameChanges   Boolean @default(true)
}
```

### Metrics Tracking

#### Events to Track
1. **Profile Completion**: When user sets both nickname and avatar
2. **Nickname Changes**: Count of nickname updates
3. **Avatar Selection**: Which avatars are most popular
4. **Completion Rate**: % of users with complete profiles

#### Metrics Dashboard (Admin)
- Total profiles completed
- Profile completion rate
- Most popular avatars (top 5)
- Recent nickname changes
- Adoption trends over time

### Migration Strategy

#### Phase 1: Database Setup
1. Create migration for User model changes
2. Create Avatar model and seed with default avatars
3. Run migration on development database

#### Phase 2: Backend Implementation
1. Profile routes and controllers
2. Nickname validation service
3. Avatar service
4. Metrics tracking (optional, can be Phase 3)

#### Phase 3: Frontend Implementation
1. Profile settings page
2. Avatar selector component
3. Nickname input component
4. Update AuthContext to fetch profile data

#### Phase 4: Integration
1. Update Navigation to show avatar + nickname
2. Update game components
3. Update admin dashboards
4. Add tooltips for leaders

#### Phase 5: Testing & Refinement
1. Test nickname validation edge cases
2. Test avatar display across all pages
3. Performance testing
4. User acceptance testing

### File Structure

```
server/
├── prisma/
│   ├── schema.prisma (updated)
│   └── migrations/
│       └── YYYYMMDDHHMMSS_add_profile_avatars/
│           └── migration.sql
├── src/
│   ├── routes/
│   │   ├── profile.routes.ts (new)
│   │   └── avatar.routes.ts (new)
│   ├── controllers/
│   │   ├── profile.controller.ts (new)
│   │   └── avatar.controller.ts (new)
│   ├── services/
│   │   ├── nicknameValidator.ts (new)
│   │   ├── avatar.service.ts (new)
│   │   └── profileMetrics.service.ts (new)
│   ├── utils/
│   │   └── profanityFilter.ts (new)
│   └── seeds/
│       └── avatars.seed.ts (new)

src/ (frontend)
├── pages/
│   └── ProfileSettingsPage.js (new)
├── components/
│   └── profile/
│       ├── AvatarSelector.js (new)
│       ├── NicknameInput.js (new)
│       └── UserDisplay.js (new)
├── contexts/
│   └── ProfileContext.jsx (new)
└── services/
    └── profileAPI.js (new)

public/
└── avatars/
    ├── cool-cat.svg
    ├── happy-dog.svg
    └── ... (10+ predefined avatars)
```

### Testing Checklist

#### Backend Tests
- [ ] Nickname validation rules (length, characters, profanity)
- [ ] Profile update endpoint
- [ ] Avatar listing endpoint
- [ ] Metrics tracking
- [ ] Permission checks (users can only update own profile)

#### Frontend Tests
- [ ] Avatar selection updates preview
- [ ] Nickname input validates in real-time
- [ ] Profile save updates across app
- [ ] Fallback to firstName when no nickname
- [ ] Leader tooltip shows real name

#### Integration Tests
- [ ] Full profile setup flow
- [ ] Avatar displays in games
- [ ] Nickname shows in leaderboards
- [ ] Admin metrics dashboard

### Performance Considerations

1. **Avatar Loading**: Preload avatar images on app startup
2. **Caching**: Cache avatar list in frontend context
3. **Validation**: Debounce nickname validation (500ms)
4. **Metrics**: Run metrics aggregation as async job (Bull queue)

### Security Considerations

1. **Input Validation**: Server-side validation for all inputs
2. **Rate Limiting**: Limit nickname changes (e.g., once per day)
3. **XSS Prevention**: Sanitize nickname output
4. **SQL Injection**: Prisma parameterized queries (built-in protection)

### Future Enhancements (Out of Scope)

- Custom avatar uploads (requires moderation)
- Nickname uniqueness enforcement
- Profile badges/achievements integration
- Profile themes/colors
- Profile privacy settings
- Nickname history/change log
- Advanced profanity filtering (AI-based)

## Implementation Estimates

- **Database Schema**: 1-2 hours
- **Backend Implementation**: 4-6 hours
- **Avatar Asset Sourcing**: 2-3 hours
- **Frontend Components**: 6-8 hours
- **Integration & Updates**: 4-6 hours
- **Testing & Refinement**: 3-4 hours
- **Documentation**: 1-2 hours

**Total Estimate**: 21-31 hours

## Success Metrics

- 80%+ profile completion rate within first month
- <2% nickname validation failures
- Zero profanity incidents
- Positive user feedback on personalization
- Leader satisfaction with identity consistency

## Dependencies

- Prisma ORM (existing)
- Express.js (existing)
- React Context API (existing)
- SVG avatar library or custom assets
- Optional: External profanity filter API

## Rollout Plan

1. **Development**: Complete implementation on feature branch
2. **Staging**: Deploy to staging environment for testing
3. **Beta**: Enable for one organization (pilot testing)
4. **Production**: Gradual rollout to all organizations
5. **Monitoring**: Track metrics and user feedback
6. **Iteration**: Refine based on real-world usage

---

## Next Steps

1. ✅ Review and approve this implementation plan
2. Create feature branch: `feature/profile-avatars-nicknames`
3. Implement database schema changes
4. Implement backend endpoints
5. Source/create avatar assets
6. Implement frontend components
7. Integration testing
8. Documentation updates
9. PR review and merge
10. Deploy to production

---

**Questions for Product Owner:**
1. Should nicknames be unique within an organization?
2. How often should users be allowed to change nicknames?
3. Do we need admin approval for nicknames?
4. Should we support custom avatar uploads in v1 or future version?
5. What's the priority level for metrics tracking?
