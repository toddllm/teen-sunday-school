# Parables Explorer Feature

## Overview

The Parables Explorer is a comprehensive feature that allows users to explore biblical parables with detailed interpretation, historical context, and practical application points.

## Features

### User Features
- **Browse Parables**: View a list of parables organized by category
- **Search**: Search parables by title, reference, or text content
- **Category Filtering**: Filter parables by theme (Kingdom of God, Grace, Love, etc.)
- **Detailed View**: View full parable details including:
  - Original parable text
  - Interpretation and meaning
  - Historical and cultural context
  - Practical application points
  - Cross-references to related Scripture
  - Related parables
- **Bible Integration**: Click on references to view them in the Bible Tool
- **Engagement Tracking**: Automatically tracks how long users spend viewing each parable

### Admin Features
- **Create Parables**: Add new parables to the system
- **Edit Parables**: Update existing parable content
- **Delete Parables**: Remove parables from the system
- **Visibility Control**: Mark parables as public (shared across organizations) or private (organization-specific)
- **Metrics Dashboard**: View analytics on:
  - Most viewed parables
  - Average time spent per parable
  - Usage in lessons
  - View counts by context (explorer, lesson, search)

## Technical Implementation

### Backend

#### Database Schema
```typescript
model Parable {
  id                String   @id @default(cuid())
  organizationId    String
  title             String
  reference         String
  category          String?
  parableText       String   @db.Text
  interpretation    String?  @db.Text
  historicalContext String?  @db.Text
  applicationPoints Json?
  keyTheme          String?
  crossReferences   Json?
  relatedParables   Json?
  isPublic          Boolean  @default(false)
  createdBy         String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  organization      Organization @relation(...)
  metrics          ParableMetric[]
}

model ParableMetric {
  id             String   @id @default(cuid())
  parableId      String
  organizationId String
  viewCount      Int      @default(0)
  lastViewedAt   DateTime @default(now())
  userId         String?
  featureContext String?
  timeSpentMs    Int?
  usedInLesson   Boolean  @default(false)
  lessonId       String?
  createdAt      DateTime @default(now())

  parable Parable @relation(...)
}
```

#### API Endpoints

**Public Endpoints (Authenticated)**
- `GET /api/parables` - List all parables (with optional filters)
- `GET /api/parables/:id` - Get specific parable details
- `POST /api/parables/:id/view` - Record a parable view

**Admin Endpoints (Requires ORG_ADMIN role)**
- `POST /api/parables` - Create a new parable
- `PATCH /api/parables/:id` - Update a parable
- `DELETE /api/parables/:id` - Delete a parable
- `GET /api/parables/:id/metrics` - Get metrics for a parable
- `GET /api/parables/metrics/summary` - Get aggregated metrics summary

### Frontend

#### Components
- `ParableViewer` - Displays a single parable with all its details
- `ParablesExplorerPage` - Main page with sidebar navigation and parable viewer

#### Services
- `parableService.js` - API client for all parable-related operations

#### Routes
- `/bible/parables` - Main parables explorer page
- `/bible/parables?parableId=xxx` - Direct link to specific parable

### Parable Categories

The following categories are available for organizing parables:

1. Kingdom of God
2. Grace and Forgiveness
3. Judgment and Accountability
4. Faith and Trust
5. Stewardship
6. Prayer
7. Love and Compassion
8. Discipleship
9. Humility
10. Wisdom
11. Preparation
12. Perseverance

## Data Model

### Parable Object Structure

```javascript
{
  id: "cuid",
  organizationId: "cuid",
  title: "The Parable of the Sower",
  reference: "Matthew 13:3-9, 18-23",
  category: "Kingdom of God",
  parableText: "A farmer went out to sow...",
  interpretation: "The seed represents the word of God...",
  historicalContext: "In first-century Palestine...",
  applicationPoints: [
    "Examine your heart: What kind of soil are you?",
    "Guard against spiritual distractions...",
  ],
  keyTheme: "Receptivity to God's Word",
  crossReferences: [
    { ref: "Mark 4:3-20", description: "Mark's account" },
  ],
  relatedParables: ["The Parable of the Growing Seed"],
  isPublic: true,
  createdBy: "userId",
  createdAt: "2025-01-15T10:00:00Z",
  updatedAt: "2025-01-15T10:00:00Z"
}
```

## Seed Data

The system includes seed data for 7 well-known parables:

1. The Parable of the Sower (Matthew 13:3-9, 18-23)
2. The Parable of the Good Samaritan (Luke 10:25-37)
3. The Parable of the Prodigal Son (Luke 15:11-32)
4. The Parable of the Mustard Seed (Matthew 13:31-32)
5. The Parable of the Lost Sheep (Luke 15:3-7)
6. The Parable of the Talents (Matthew 25:14-30)
7. The Parable of the Pharisee and the Tax Collector (Luke 18:9-14)

To seed the database:
```bash
cd server
npx ts-node prisma/seeds/parables.seed.ts
```

## Usage Examples

### Listing Parables
```javascript
import { listParables } from '../services/parableService';

// Get all parables
const parables = await listParables();

// Filter by category
const kingdomParables = await listParables({ category: 'Kingdom of God' });

// Search parables
const searchResults = await listParables({ search: 'sower' });
```

### Getting a Specific Parable
```javascript
import { getParable } from '../services/parableService';

const parable = await getParable('parable-id');
```

### Recording Engagement
```javascript
import { recordParableView } from '../services/parableService';

await recordParableView('parable-id', {
  featureContext: 'explorer',
  timeSpentMs: 120000, // 2 minutes
  usedInLesson: false,
});
```

## Integration with Other Features

### Bible Tool Integration
When users click on a parable reference or cross-reference, they are automatically navigated to the Bible Tool with that passage loaded.

### Lesson Integration
Parables can be integrated into lessons, with usage tracked in the metrics system.

### Search Integration
Parables are searchable by title, reference, and text content.

## Permissions

- **All Users**: Can view public parables and organization-specific parables
- **Org Admins**: Can create, edit, delete parables for their organization and view metrics
- **Super Admins**: Can manage all parables across all organizations

## Metrics & Analytics

The system tracks:
- View counts per parable
- Time spent viewing each parable
- Context of views (explorer, lesson, search, etc.)
- Usage in lessons
- Unique viewers

Admins can access:
- Individual parable metrics
- Aggregated summary across all parables
- Most popular parables
- Average engagement time

## Future Enhancements

Potential future additions:
1. **Interactive Quizzes**: Add comprehension questions for each parable
2. **Discussion Guides**: Include small group discussion questions
3. **Video Explanations**: Embed video teachings on parables
4. **Artwork Integration**: Include classical art depicting parables
5. **Modern Retellings**: Contemporary versions of parables for teens
6. **Journaling**: Allow users to write personal reflections
7. **Sharing**: Enable sharing favorite parables on social media
8. **Bookmarking**: Let users save favorite parables
9. **Audio Narration**: Add audio readings of parables
10. **Language Support**: Translate parables into multiple languages

## Accessibility

- Keyboard navigation supported throughout
- Semantic HTML structure
- ARIA labels for interactive elements
- Responsive design for mobile, tablet, and desktop
- High contrast color schemes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing

To test the feature:

1. **Backend Testing**:
```bash
cd server
npm test -- parable.controller.test.ts
```

2. **Frontend Testing**:
```bash
npm test -- ParablesExplorerPage.test.js
```

3. **Manual Testing Checklist**:
   - [ ] Can view list of parables
   - [ ] Can search parables
   - [ ] Can filter by category
   - [ ] Can view individual parable details
   - [ ] Can click on references to open Bible Tool
   - [ ] Navigation menu shows Parables Explorer
   - [ ] Metrics are recorded (check admin dashboard)
   - [ ] Responsive design works on mobile
   - [ ] Page loads with URL parameter (direct link)

## Troubleshooting

### Parables Not Showing
- Ensure database has been migrated: `npx prisma migrate dev`
- Verify seed data has been loaded
- Check that user is authenticated
- Verify organization has access to public parables

### Metrics Not Recording
- Ensure user is authenticated
- Check that `recordParableView` is called on unmount
- Verify API endpoint is accessible
- Check browser console for errors

### Styling Issues
- Clear browser cache
- Verify CSS files are imported correctly
- Check for conflicting global styles

## Support

For issues or questions about the Parables Explorer feature, please:
1. Check the documentation above
2. Review the codebase comments
3. Contact the development team
4. Submit an issue on GitHub

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Author**: Claude (AI Assistant)
