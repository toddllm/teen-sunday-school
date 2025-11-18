# Interlinear-lite View for Key Verses

## Overview

The Interlinear-lite View feature provides simplified interlinear Bible views for a curated set of core verses. This feature helps teens explore the original languages (Greek and Hebrew) of the Bible in an accessible, user-friendly way.

## Features

### User-Facing Features

- **Simplified Interlinear Views**: Display original language words with transliteration and English glosses
- **Interactive Word Details**: Click on any word to see additional information (Strong's numbers, morphology)
- **Two Layout Options**:
  - **Stacked View**: Words displayed vertically with original text, transliteration, and gloss
  - **Inline View**: Compact horizontal layout for space-constrained displays
- **Key Verse Curation**: Pre-populated with important verses across categories:
  - Salvation (John 3:16, Romans 3:23)
  - Doctrine (John 1:1)
  - Love (1 Corinthians 13:4)
  - Faith (Philippians 4:13)
  - Comfort (Psalm 23:1)
  - Wisdom (Proverbs 3:5)

### Admin Features

- **Metrics Dashboard**: Track usage statistics for interlinear views
- **Verse Management**: Add or update interlinear data for additional verses
- **Analytics**: View which verses are most popular among users

## Architecture

### Database Schema

```prisma
model InterlinearVerse {
  id         String   @id @default(cuid())
  verseRef   String   @unique  // e.g., "JHN.3.16"
  tokensJson Json     // Array of {original, transliteration, gloss, strongsNumber?, morphology?}
  language   String   @default("greek")
  translation String  @default("NA28")
  isKeyVerse Boolean  @default(false)
  category   String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  metrics    InterlinearMetric[]
}

model InterlinearMetric {
  id             String   @id @default(cuid())
  verseId        String
  organizationId String?
  userId         String?
  action         String   // "view", "word_click", "copy"
  wordIndex      Int?
  featureName    String?
  sessionId      String?
  createdAt      DateTime @default(now())
  verse          InterlinearVerse @relation(...)
}
```

### API Endpoints

#### Public Endpoints

- **GET /api/bible/interlinear** - Get all key verses
  - Query params: `category` (optional)
  - Response: Array of interlinear verse data

- **GET /api/bible/interlinear/:verseRef** - Get interlinear data for a specific verse
  - Params: `verseRef` (e.g., "JHN.3.16")
  - Response: Interlinear verse data with tokens
  - Status: 404 if not available

- **POST /api/bible/interlinear/:verseRef/track** - Track user interaction
  - Params: `verseRef`
  - Body: `{ action, wordIndex?, featureName?, sessionId? }`
  - Auth: Optional (tracks if authenticated)

#### Admin Endpoints

- **GET /api/admin/interlinear/metrics** - Get interlinear metrics
  - Auth: Required (Org Admin)
  - Query params: `startDate`, `endDate`, `limit`, `offset`
  - Response: Metrics data with stats

- **POST /api/admin/interlinear/seed** - Seed initial key verses
  - Auth: Required (Super Admin only)
  - Response: Success message

### Frontend Components

#### InterlinearView

Main component for displaying interlinear data.

```jsx
import InterlinearView from './components/InterlinearView';

<InterlinearView
  verseRef="JHN.3.16"
  inline={false}  // true for inline layout
  onClose={() => setShowInterlinear(false)}
/>
```

**Props:**
- `verseRef` (string, required): Verse reference in API format
- `inline` (boolean, optional): Layout mode (default: false)
- `onClose` (function, optional): Callback when close button is clicked

#### InterlinearButton

Button component to trigger interlinear view.

```jsx
import InterlinearButton from './components/InterlinearButton';

<InterlinearButton
  verseRef="JHN.3.16"
  size="medium"  // "small", "medium", "large"
  showLabel={true}
  inline={false}
/>
```

**Props:**
- `verseRef` (string, required): Verse reference
- `size` (string, optional): Button size (default: "medium")
- `showLabel` (boolean, optional): Show label text (default: true)
- `inline` (boolean, optional): Layout mode for InterlinearView

**Features:**
- Automatically checks if interlinear data is available
- Only renders if data exists
- Opens modal overlay with InterlinearView

### Services

#### Backend: interlinear.service.ts

```typescript
import { seedKeyVerses, getInterlinearByVerseRef } from './services/interlinear.service';

// Seed initial data
await seedKeyVerses();

// Fetch verse data
const data = await getInterlinearByVerseRef('JHN.3.16');
```

#### Frontend: interlinearAPI.js

```javascript
import { fetchInterlinearVerse, fetchKeyVerses } from './services/interlinearAPI';

// Fetch verse
const verse = await fetchInterlinearVerse('JHN.3.16');

// Fetch all key verses
const verses = await fetchKeyVerses('salvation');

// Track interaction
await trackInterlinearInteraction('JHN.3.16', 'word_click', { wordIndex: 3 });
```

## Setup & Installation

### 1. Database Migration

Run Prisma migrations to add the new tables:

```bash
cd server
npm run db:migrate
```

### 2. Seed Initial Data

Populate the database with curated key verses:

```bash
npm run db:seed
```

Or via API (Super Admin only):

```bash
curl -X POST http://localhost:3001/api/admin/interlinear/seed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Environment Variables

Ensure your `.env` file contains:

```env
DATABASE_URL="postgresql://..."
REACT_APP_API_URL="http://localhost:3001/api"
```

## Usage Examples

### Adding Interlinear to a Bible Reading Page

```jsx
import InterlinearButton from '../components/InterlinearButton';

function BibleVerse({ verseRef, text }) {
  return (
    <div className="bible-verse">
      <p>{text}</p>
      <div className="verse-actions">
        <InterlinearButton verseRef={verseRef} />
        {/* Other buttons */}
      </div>
    </div>
  );
}
```

### Displaying Key Verses List

```jsx
import { fetchKeyVerses } from '../services/interlinearAPI';
import InterlinearView from '../components/InterlinearView';

function KeyVersesPage() {
  const [verses, setVerses] = useState([]);
  const [selectedVerse, setSelectedVerse] = useState(null);

  useEffect(() => {
    fetchKeyVerses().then(data => setVerses(data.verses));
  }, []);

  return (
    <div>
      <h2>Key Verses</h2>
      <ul>
        {verses.map(verse => (
          <li key={verse.id} onClick={() => setSelectedVerse(verse.verseRef)}>
            {verse.verseRef} - {verse.category}
          </li>
        ))}
      </ul>
      {selectedVerse && (
        <InterlinearView
          verseRef={selectedVerse}
          onClose={() => setSelectedVerse(null)}
        />
      )}
    </div>
  );
}
```

## Metrics & Analytics

The feature tracks the following metrics:

- **Views**: How many times each verse is viewed
- **Word Interactions**: Which words users click on
- **Popular Verses**: Most-viewed verses across all users
- **Category Trends**: Which categories are most popular

Access metrics via the admin dashboard or API:

```bash
GET /api/admin/interlinear/metrics?startDate=2024-01-01&endDate=2024-12-31
```

## Data Model: Token Structure

Each word in the interlinear view follows this structure:

```typescript
{
  original: "ἠγάπησεν",          // Original Greek/Hebrew word
  transliteration: "ēgapēsen",   // Romanized pronunciation
  gloss: "loved",                 // English meaning
  strongsNumber: "G25",           // Optional: Strong's concordance number
  morphology: "V-AAI-3S"          // Optional: Grammatical parsing
}
```

## Future Enhancements

Potential improvements for future iterations:

1. **Strong's Dictionary Integration**: Link Strong's numbers to dictionary definitions
2. **Morphological Parsing Details**: Expand morphology codes with human-readable explanations
3. **Audio Pronunciation**: Add audio files for original language pronunciation
4. **User Notes**: Allow users to add personal notes to words
5. **Comparison View**: Show multiple translations side-by-side with interlinear
6. **Export Feature**: Export interlinear data as PDF or image
7. **Search**: Search by Strong's number or Greek/Hebrew word
8. **Custom Verse Addition**: Allow admins to add custom verses via UI

## Troubleshooting

### Issue: Button not appearing

**Solution**: Check that:
1. Verse reference is in correct format (e.g., "JHN.3.16")
2. Interlinear data exists for that verse
3. API is running and accessible

### Issue: Data not loading

**Solution**:
1. Check API endpoint is accessible
2. Verify database contains seeded data: `npm run db:seed`
3. Check browser console for errors
4. Verify CORS settings allow frontend requests

### Issue: Metrics not tracking

**Solution**:
1. Ensure user is authenticated (optional but recommended)
2. Check network tab for failed POST requests
3. Verify API endpoint permissions

## Technical Notes

- **Performance**: InterlinearButton checks availability asynchronously to avoid blocking render
- **Caching**: Consider implementing client-side caching for frequently accessed verses
- **Accessibility**: Components include ARIA labels and keyboard navigation support
- **Dark Mode**: Full dark mode support via CSS variables
- **Mobile Responsive**: Optimized layouts for small screens

## Support & Resources

- **API Documentation**: See `/docs/API.md`
- **Component Docs**: See inline JSDoc comments
- **Database Schema**: See `/server/prisma/schema.prisma`
- **Seed Data**: See `/server/src/services/interlinear.service.ts`

## License

Part of the Teen Sunday School application. See main project LICENSE file.
