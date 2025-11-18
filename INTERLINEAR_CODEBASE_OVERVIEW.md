# Teen Sunday School Codebase Overview - Interlinear-lite View Implementation Guide

## 📋 Table of Contents
1. [Overall Project Structure](#overall-project-structure)
2. [Bible Verse Handling](#bible-verse-handling)
3. [Existing Bible Feature Patterns](#existing-bible-feature-patterns)
4. [Database Models & Entities](#database-models--entities)
5. [API Endpoints](#api-endpoints)
6. [Bible-Related UI Components](#bible-related-ui-components)
7. [Metrics & Analytics Patterns](#metrics--analytics-patterns)
8. [Recommended Implementation Pattern](#recommended-implementation-pattern)

---

## 1. Overall Project Structure

### Technology Stack

**Frontend:**
- **React 18.2.0** - Component-based UI
- **React Router v6** - Client-side routing
- **React Context API** - Global state management
- **LocalStorage** - Client-side persistence (for now)
- **Axios** - HTTP client for API calls

**Backend:**
- **Node.js** with **TypeScript**
- **Express.js** - REST API framework
- **Prisma ORM** - Database ORM with PostgreSQL
- **Winston** - Logging
- **Bull** - Job queues for background tasks

**External APIs:**
- **scripture.api.bible** - Primary Bible API for text/translations

### Project Directory Structure

```
teen-sunday-school/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   ├── pages/                    # Page-level components
│   ├── contexts/                 # React Context providers
│   ├── services/                 # API integration services
│   └── data/                     # Static data (cross-references, etc.)
│
├── server/                       # Backend TypeScript/Express server
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── routes/               # API route definitions
│   │   ├── services/             # Business logic
│   │   ├── middleware/           # Auth, validation, etc.
│   │   ├── config/               # Configuration (logger, database)
│   │   └── jobs/                 # Background job processors
│   └── prisma/
│       └── schema.prisma         # Database schema
│
└── public/                       # Static assets
```

---

## 2. Bible Verse Handling

### Current Bible API Integration

**File:** `/home/user/teen-sunday-school/src/services/bibleAPI.js`

This is the central service for all Bible-related API calls. Key functions:

```javascript
// Core Bible API Functions
- searchPassage(query, bibleId)         // Search for passages
- getPassage(passageId, bibleId)        // Get specific passage
- getChapter(book, chapter, bibleId)    // Get full chapter
- getVerseText(reference)               // Get verse by reference string

// Translation Functions
- getParallelPassages(passageId, bibleIds)   // Get multiple translations
- getParallelChapters(book, chapter, bibleIds)
- getAvailableBibles()                       // List available translations

// Utility Functions
- referenceToVerseId(reference)         // "John 3:16" → "JHN.3.16"
- verseIdToReference(verseId)           // "JHN.3.16" → "John 3:16"
- parseReference(reference)             // Parse reference string

// Cross-Reference Functions
- getCrossReferences(verseId, grouped)
- fetchCrossReferencesWithText(verseId, bibleId)
- fetchCrossReferencesGrouped(verseId, bibleId)
```

**Bible ID Format:**
- Book codes: `GEN`, `EXO`, `JHN`, `ROM`, etc.
- Verse ID format: `{BOOK}.{CHAPTER}.{VERSE}` (e.g., `JHN.3.16`)
- Chapter ID format: `{BOOK}.{CHAPTER}` (e.g., `JHN.3`)

**Available Bible Translations:**
Managed in `/home/user/teen-sunday-school/src/contexts/TranslationContext.js`

```javascript
const AVAILABLE_TRANSLATIONS = [
  { id: 'de4e12af7f28f599-02', code: 'NIV', name: 'New International Version' },
  { id: '06125adad2d5898a-01', code: 'KJV', name: 'King James Version' },
  { id: '01b29f36342e1091-01', code: 'ESV', name: 'English Standard Version' },
  { id: 'de4e12af7f28f599-01', code: 'NKJV', name: 'New King James Version' },
  { id: '7142879509583d59-04', code: 'NLT', name: 'New Living Translation' },
  // ... more translations
];
```

### Bible Verse Data Model

**Verse Structure from API:**
```javascript
{
  id: "JHN.3.16",                    // Verse identifier
  content: "<span class='verse'>For God so loved...</span>",  // HTML content
  reference: "John 3:16",            // Human-readable reference
  verseId: "JHN.3.16",               // Verse ID
  bibleId: "de4e12af7f28f599-02"    // Translation ID
}
```

**Chapter Structure from API:**
```javascript
{
  id: "JHN.3",
  content: "<div class='chapter-text'>...</div>",  // Full chapter HTML
  reference: "John 3",
  number: "3",
  bibleId: "de4e12af7f28f599-02"
}
```

---

## 3. Existing Bible Feature Patterns

### Pattern 1: Parallel Bible View (Multiple Translations Side-by-Side)

**File:** `/home/user/teen-sunday-school/src/pages/ParallelBiblePage.js`

**Key Features:**
- Displays 2+ Bible translations in parallel columns
- Synchronized scrolling between translations
- Translation selector dropdowns
- Book/chapter navigation
- Clickable verse numbers to show context cards
- Uses TranslationContext for translation preferences

**State Management:**
```javascript
const { primaryTranslation, secondaryTranslation } = useTranslation();
const [primaryContent, setPrimaryContent] = useState(null);
const [secondaryContent, setSecondaryContent] = useState(null);
const [selectedBook, setSelectedBook] = useState('JHN');
const [selectedChapter, setSelectedChapter] = useState(3);
```

**Data Loading Pattern:**
```javascript
const loadChapterContent = async () => {
  setLoading(true);
  const [primaryData, secondaryData] = await Promise.all([
    getChapter(selectedBook, selectedChapter, primaryTranslation),
    getChapter(selectedBook, selectedChapter, secondaryTranslation)
  ]);
  setPrimaryContent(primaryData);
  setSecondaryContent(secondaryData);
  setLoading(false);
};
```

**UI Pattern:**
```jsx
<div className="parallel-container">
  <div className="translation-column">
    <div className="translation-header">
      <select onChange={(e) => setPrimaryTranslation(e.target.value)}>
        {availableTranslations.map(trans => (
          <option key={trans.id} value={trans.id}>{trans.code}</option>
        ))}
      </select>
    </div>
    <div className="translation-content" 
         dangerouslySetInnerHTML={{ __html: primaryContent.content }} />
  </div>
</div>
```

### Pattern 2: Cross-Reference Panel (Related Verses)

**File:** `/home/user/teen-sunday-school/src/components/CrossReferencePanel.js`

**Key Features:**
- Displays related verses grouped by type (quotation, parallel, theme, allusion, prophecy)
- Lazy loads verse text for each cross-reference
- Clickable references to navigate between verses
- Grouped/list view toggle
- Expandable/collapsible

**Data Structure:**
```javascript
const crossRefs = {
  quotation: [{ target: 'ROM.5.8', type: 'theme', description: '...', text: '...' }],
  parallel: [...],
  theme: [...],
  allusion: [...],
  prophecy: [...]
};
```

**Loading Pattern:**
```javascript
useEffect(() => {
  const loadCrossReferences = async () => {
    const verseId = referenceToVerseId(verseReference);
    const refs = await fetchCrossReferencesGrouped(verseId, primaryTranslation);
    setCrossRefs(refs);
  };
  loadCrossReferences();
}, [verseReference, primaryTranslation]);
```

### Pattern 3: Context Cards (Verse Context Modal)

**File:** `/home/user/teen-sunday-school/src/components/ContextCardModal.js`
**Context:** `/home/user/teen-sunday-school/src/contexts/ContextCardContext.js`

**Key Features:**
- Modal popup with historical/cultural context for difficult verses
- Managed via React Context (localStorage backed)
- Historical context, literary context, key themes, cross-references

**Data Structure:**
```javascript
{
  id: 'context-john-3-16',
  verseRef: 'John 3:16',
  verseRange: 'John 3:16',
  historicalContext: '...',
  literaryContext: '...',
  keyTheme: '...',
  crossReferences: [{ ref: 'Romans 5:8', note: '...' }],
  createdAt: '...',
  updatedAt: '...'
}
```

**Context API Pattern:**
```javascript
const { getContextCardByVerseRef } = useContextCards();
const card = getContextCardByVerseRef('John 3:16');
```

### Pattern 4: Bible Verse Lookup Tool

**File:** `/home/user/teen-sunday-school/src/pages/BibleToolPage.js`

**Key Features:**
- Search input for verse reference
- Displays verse text
- Shows cross-references below
- Navigation history (breadcrumbs)
- Popular verses quick access

**Search Pattern:**
```javascript
const handleSearch = async (e) => {
  e.preventDefault();
  setLoading(true);
  const result = await getVerseText(reference);
  setVerse(result);
  setHistory(prev => [...prev, result.reference]);
  setLoading(false);
};
```

---

## 4. Database Models & Entities

**File:** `/home/user/teen-sunday-school/server/prisma/schema.prisma`

### Current Database Schema

**Organizations & Users:**
```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  timezone  String   @default("America/New_York")
  
  users        User[]
  groups       Group[]
  integrations ExternalIntegration[]
  lessons      Lesson[]
  aiFilterConfigs AIFilterConfig[]
}

model User {
  id             String   @id @default(cuid())
  email          String   @unique
  passwordHash   String
  firstName      String
  lastName       String
  role           Role     @default(MEMBER)
  organizationId String
  
  organization     Organization
  groupMemberships GroupMember[]
  refreshTokens    RefreshToken[]
}

enum Role {
  SUPER_ADMIN
  ORG_ADMIN
  TEACHER
  MEMBER
}
```

**Groups:**
```prisma
model Group {
  id             String   @id @default(cuid())
  name           String
  description    String?
  organizationId String
  ageMin         Int?
  ageMax         Int?
  grade          String?
  
  organization Organization
  members      GroupMember[]
  lessons      LessonGroup[]
}
```

**Lessons:**
```prisma
model Lesson {
  id             String   @id @default(cuid())
  organizationId String
  title          String
  quarter        Int
  unit           Int
  lessonNumber   Int
  scripture      String
  content        Json     // Full lesson content as JSON
  slides         Json?
  games          Json?
  isPublic       Boolean  @default(false)
  isTemplate     Boolean  @default(false)
  
  organization Organization
  groups       LessonGroup[]
}
```

**AI Filter Metrics (Example of Analytics Pattern):**
```prisma
model AIFilterMetric {
  id             String   @id @default(cuid())
  filterId       String
  organizationId String?
  query          String   @db.Text
  detectedCategory FilterCategory
  actionTaken    FilterAction
  userId         String?
  groupId        String?
  featureName    String?
  leaderNotified Boolean  @default(false)
  leaderResponse String?  @db.Text
  resolvedAt     DateTime?
  createdAt      DateTime @default(now())
  
  filter AIFilterConfig
  
  @@index([filterId])
  @@index([organizationId])
  @@index([createdAt])
  @@index([detectedCategory])
}
```

### Recommended Schema Addition for Interlinear Feature

```prisma
// Add to schema.prisma

model InterlinearView {
  id             String   @id @default(cuid())
  userId         String?  // NULL if anonymous/guest
  organizationId String?  // NULL if not org-specific
  
  // Verse reference
  verseId        String   // e.g., "JHN.3.16"
  verseRef       String   // e.g., "John 3:16"
  book           String   // Book code
  chapter        Int
  verseStart     Int
  verseEnd       Int?     // For ranges
  
  // Translation preference
  translationId  String   // Bible API translation ID
  
  // Interlinear data (could be fetched from external API or cached)
  interlinearData Json?   // Cached word-by-word breakdown
  
  // Metadata
  viewedAt       DateTime @default(now())
  viewCount      Int      @default(1)
  
  @@index([userId])
  @@index([organizationId])
  @@index([verseId])
  @@index([viewedAt])
}

model InterlinearMetric {
  id             String   @id @default(cuid())
  userId         String?
  organizationId String?
  
  // What was viewed
  verseId        String
  verseRef       String
  translationId  String
  
  // Interaction details
  wordClicked    String?  // Which word was clicked
  wordIndex      Int?     // Position of word in verse
  strongsNumber  String?  // Strong's number if clicked
  morphology     String?  // Morphology if viewed
  
  // Context
  featureName    String   @default("interlinear-view")
  sessionId      String?  // For tracking user session
  
  // Timing
  timeSpent      Int?     // Seconds spent on this verse
  createdAt      DateTime @default(now())
  
  @@index([userId])
  @@index([organizationId])
  @@index([verseId])
  @@index([createdAt])
}
```

---

## 5. API Endpoints

### Current Backend Structure

**File:** `/home/user/teen-sunday-school/server/src/index.ts`

**Existing Routes:**
- `/api/auth/*` - Authentication routes
- `/api/integrations/*` - Church system integrations
- `/api/admin/ai-filters/*` - AI content filtering

### Route Definition Pattern

**Example Route File:** `/home/user/teen-sunday-school/server/src/routes/ai-filter.routes.ts`

```typescript
import express from 'express';
import { 
  getFilterConfig, 
  updateFilterConfig,
  getFilterMetrics 
} from '../controllers/ai-filter.controller';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

// Get filter configuration
router.get('/', authenticate, requireOrgAdmin, getFilterConfig);

// Update filter configuration
router.patch('/', authenticate, requireOrgAdmin, updateFilterConfig);

// Get filter metrics
router.get('/metrics', authenticate, requireOrgAdmin, getFilterMetrics);

export default router;
```

### Controller Pattern

**Example Controller:** `/home/user/teen-sunday-school/server/src/controllers/ai-filter.controller.ts`

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * GET /api/admin/ai-filters
 * Get AI filter configuration for an organization
 */
export const getFilterConfig = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    
    const config = await prisma.aIFilterConfig.findUnique({
      where: { organizationId },
      include: {
        metrics: {
          take: 100,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    res.json(config);
  } catch (error) {
    logger.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
};

/**
 * PATCH /api/admin/ai-filters
 * Update AI filter configuration
 */
export const updateFilterConfig = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { filterRules, customKeywords } = req.body;
    
    const config = await prisma.aIFilterConfig.update({
      where: { organizationId },
      data: { filterRules, customKeywords },
    });
    
    logger.info(`Filter config updated for org ${organizationId}`);
    res.json(config);
  } catch (error) {
    logger.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
};
```

### Recommended API Endpoints for Interlinear Feature

```typescript
// server/src/routes/interlinear.routes.ts

// GET /api/interlinear/:verseId
// Get interlinear data for a verse
router.get('/:verseId', authenticate, getInterlinearData);

// POST /api/interlinear/track
// Track interlinear view/interaction
router.post('/track', authenticate, trackInterlinearView);

// GET /api/interlinear/metrics
// Get interlinear usage metrics (admin only)
router.get('/metrics', authenticate, requireOrgAdmin, getInterlinearMetrics);
```

---

## 6. Bible-Related UI Components

### Component File Locations

**Main Bible Components:**
```
/home/user/teen-sunday-school/src/components/
├── CrossReferencePanel.js      # Cross-reference display
├── CrossReferencePanel.css
├── ContextCardModal.js         # Verse context modal
└── ContextCardModal.css

/home/user/teen-sunday-school/src/pages/
├── BibleToolPage.js            # Verse lookup
├── BibleToolPage.css
├── ParallelBiblePage.js        # Parallel translations
└── ParallelBiblePage.css
```

### Component Styling Patterns

**CSS Variables (Dark Mode Support):**
All components use CSS variables defined in the root theme:

```css
:root {
  --text-color: #333;
  --text-secondary: #666;
  --bg-color: #ffffff;
  --card-bg: #f8f9fa;
  --border-color: #dee2e6;
  --input-bg: #ffffff;
  --input-border: #ced4da;
  --hover-bg: #e9ecef;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --primary-color: #3498db;
}

[data-theme="dark"] {
  --text-color: #e0e0e0;
  --text-secondary: #b0b0b0;
  --bg-color: #1a1a1a;
  --card-bg: #2a2a2a;
  --border-color: #404040;
  --input-bg: #2a2a2a;
  --input-border: #404040;
  --hover-bg: #3a3a3a;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  --primary-color: #5dade2;
}
```

**Component Structure Example:**
```jsx
// Typical Bible component structure
const BibleComponent = () => {
  // State
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Contexts
  const { primaryTranslation } = useTranslation();
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await bibleAPI.getChapter(book, chapter, primaryTranslation);
        setContent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [book, chapter, primaryTranslation]);
  
  // Render
  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  
  return (
    <div className="bible-component">
      <div className="bible-header">
        <h1>{/* Title */}</h1>
      </div>
      <div className="bible-content" 
           dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};
```

### Recommended Component Structure for Interlinear View

```
src/
├── components/
│   ├── InterlinearWord.js       # Single word with hover/click
│   ├── InterlinearWord.css
│   ├── InterlinearPanel.js      # Main interlinear display panel
│   ├── InterlinearPanel.css
│   └── InterlinearModal.js      # Modal for detailed word info
│       └── InterlinearModal.css
│
└── pages/
    ├── InterlinearPage.js       # Full page interlinear view
    └── InterlinearPage.css
```

---

## 7. Metrics & Analytics Patterns

### Analytics Pattern from AI Filter Feature

**Tracking User Interactions:**

```typescript
// When user performs an action, log it to the database
const trackInteraction = async (data) => {
  await prisma.aIFilterMetric.create({
    data: {
      filterId: config.id,
      organizationId: user.organizationId,
      query: userInput,
      detectedCategory: 'SOME_CATEGORY',
      actionTaken: 'SOME_ACTION',
      userId: user.id,
      featureName: 'feature-name',
      createdAt: new Date(),
    },
  });
};
```

**Querying Metrics:**

```typescript
// Get metrics with filters
export const getFilterMetrics = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { category, startDate, endDate, limit = 100, offset = 0 } = req.query;
  
  const where: any = { organizationId };
  
  if (category) where.detectedCategory = category;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate as string);
    if (endDate) where.createdAt.lte = new Date(endDate as string);
  }
  
  const [metrics, total] = await Promise.all([
    prisma.aIFilterMetric.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    }),
    prisma.aIFilterMetric.count({ where }),
  ]);
  
  res.json({ metrics, total, pagination: { limit, offset, hasMore: offset + metrics.length < total } });
};
```

**Getting Summary Statistics:**

```typescript
// Get aggregate statistics
export const getFilterMetricsSummary = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { days = 30 } = req.query;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));
  
  // Group by category
  const byCategory = await prisma.aIFilterMetric.groupBy({
    by: ['detectedCategory'],
    where: { organizationId, createdAt: { gte: startDate } },
    _count: true,
  });
  
  // Daily trend with raw query
  const dailyTrend = await prisma.$queryRaw`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM "AIFilterMetric"
    WHERE organization_id = ${organizationId} AND created_at >= ${startDate}
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC
  `;
  
  res.json({ byCategory, dailyTrend });
};
```

### Recommended Metrics for Interlinear Feature

**Track:**
1. **View Counts** - How many times each verse is viewed in interlinear mode
2. **Word Interactions** - Which words users click on most frequently
3. **Time Spent** - How long users spend on interlinear view
4. **Popular Verses** - Which verses are most frequently studied
5. **Translation Preferences** - Which translations are used most
6. **Strong's Numbers** - Which Strong's numbers are most referenced

---

## 8. Recommended Implementation Pattern

### Step-by-Step Implementation Guide

#### Phase 1: Frontend Component (No Backend Initially)

1. **Create Interlinear Component**
   ```
   src/components/InterlinearPanel.js
   src/components/InterlinearPanel.css
   ```

2. **Create Interlinear Page**
   ```
   src/pages/InterlinearPage.js
   src/pages/InterlinearPage.css
   ```

3. **Add Route to App.js**
   ```javascript
   <Route path="/bible/interlinear" element={<InterlinearPage />} />
   ```

4. **Use Existing BibleAPI Service**
   - Use `getPassage()` to fetch verse text
   - Parse HTML/text to extract individual words
   - Create word-by-word display

5. **Add to Navigation**
   ```javascript
   // In Navigation.js
   <Link to="/bible/interlinear">Interlinear View</Link>
   ```

#### Phase 2: External Interlinear Data Integration

6. **Research Interlinear APIs**
   - Strong's Concordance API
   - Blue Letter Bible API
   - Bible Hub API
   - Consider which provides: Hebrew/Greek text, transliteration, parsing codes

7. **Create Interlinear Service**
   ```javascript
   // src/services/interlinearAPI.js
   export const getInterlinearData = async (verseId) => {
     // Fetch from external API
     // Return word-by-word breakdown with Strong's numbers
   };
   ```

8. **Merge Bible Text with Interlinear Data**
   ```javascript
   const mergeInterlinearData = (bibleVerse, interlinearData) => {
     // Align English words with Hebrew/Greek
     // Return enhanced word objects
   };
   ```

#### Phase 3: Backend API & Database

9. **Add Prisma Schema**
   - Add `InterlinearView` model
   - Add `InterlinearMetric` model
   - Run migration: `npm run db:migrate`

10. **Create Backend Routes**
    ```typescript
    // server/src/routes/interlinear.routes.ts
    router.get('/:verseId', getInterlinearData);
    router.post('/track', trackInterlinearView);
    router.get('/metrics', getInterlinearMetrics);
    ```

11. **Create Backend Controller**
    ```typescript
    // server/src/controllers/interlinear.controller.ts
    export const getInterlinearData = async (req, res) => { ... };
    export const trackInterlinearView = async (req, res) => { ... };
    export const getInterlinearMetrics = async (req, res) => { ... };
    ```

12. **Register Routes in index.ts**
    ```typescript
    import interlinearRoutes from './routes/interlinear.routes';
    app.use('/api/interlinear', interlinearRoutes);
    ```

#### Phase 4: Analytics & Caching

13. **Implement View Tracking**
    - Track when user opens interlinear view
    - Track which words they click
    - Track time spent

14. **Add Caching**
    - Cache interlinear data in database (Json field)
    - Only fetch from external API if not cached
    - Reduces API calls and improves performance

15. **Create Metrics Dashboard (Admin)**
    - Display popular verses
    - Show most-clicked words
    - Display usage trends

#### Phase 5: UI Enhancements

16. **Add Hover Tooltips**
    - Show Strong's number on hover
    - Show basic parsing info

17. **Add Click Modal**
    - Full word details in modal
    - Morphology, definition, related verses

18. **Add Preferences**
    - Toggle Hebrew/Greek display
    - Toggle transliteration
    - Toggle Strong's numbers

### Key Files to Create

```
Frontend:
- src/pages/InterlinearPage.js
- src/pages/InterlinearPage.css
- src/components/InterlinearPanel.js
- src/components/InterlinearPanel.css
- src/components/InterlinearWord.js
- src/components/InterlinearWord.css
- src/components/InterlinearModal.js
- src/components/InterlinearModal.css
- src/services/interlinearAPI.js
- src/contexts/InterlinearContext.js (optional)

Backend:
- server/src/routes/interlinear.routes.ts
- server/src/controllers/interlinear.controller.ts
- server/src/services/interlinear.service.ts (optional)
- server/prisma/migrations/XXX_add_interlinear_models.sql

Data:
- src/data/strongsMapping.js (if needed for offline fallback)
```

### Sample Code Snippets

**InterlinearWord Component:**
```jsx
const InterlinearWord = ({ word, strongs, transliteration, morphology, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <span 
      className="interlinear-word"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => onClick({ word, strongs, transliteration, morphology })}
    >
      <span className="word-english">{word}</span>
      <span className="word-original">{transliteration}</span>
      {showTooltip && (
        <div className="word-tooltip">
          <div>Strong's: {strongs}</div>
          <div>{morphology}</div>
        </div>
      )}
    </span>
  );
};
```

**InterlinearPanel Component:**
```jsx
const InterlinearPanel = ({ verseId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { primaryTranslation } = useTranslation();
  
  useEffect(() => {
    const loadInterlinear = async () => {
      setLoading(true);
      const [verse, interlinear] = await Promise.all([
        getPassage(verseId, primaryTranslation),
        getInterlinearData(verseId)
      ]);
      setData(mergeData(verse, interlinear));
      setLoading(false);
    };
    loadInterlinear();
  }, [verseId, primaryTranslation]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="interlinear-panel">
      <div className="verse-reference">{data.reference}</div>
      <div className="interlinear-words">
        {data.words.map((word, i) => (
          <InterlinearWord key={i} {...word} onClick={handleWordClick} />
        ))}
      </div>
    </div>
  );
};
```

---

## Summary

You now have:
1. ✅ Complete understanding of the React frontend structure
2. ✅ Knowledge of how Bible verses are fetched and displayed
3. ✅ Patterns from similar features (Parallel Bible, Cross-References, Context Cards)
4. ✅ Database schema patterns and how to extend them
5. ✅ API endpoint patterns and controller structure
6. ✅ UI component patterns with dark mode support
7. ✅ Metrics/analytics implementation examples
8. ✅ Step-by-step implementation guide

**Next Steps:**
1. Research and select an interlinear Bible API
2. Start with frontend-only prototype (Phase 1)
3. Integrate external API (Phase 2)
4. Add backend tracking (Phase 3)
5. Implement analytics (Phase 4)
6. Polish UI (Phase 5)

**Key Patterns to Follow:**
- Use React Context for global state (like TranslationContext)
- Use CSS variables for theming
- Follow existing component structure (loading/error states)
- Track metrics in database for admin insights
- Cache external API data to reduce costs
- Use TypeScript for backend code
- Follow Prisma patterns for database interactions

Good luck with your implementation!
