# Weekly Word Feature Documentation

## Overview

The "Weekly Word of the Week" feature highlights Greek, Hebrew, and Aramaic words from the Bible in an accessible and engaging way. This feature is designed to give teens a small taste of original biblical languages that feels fun and educational, not intimidating.

## Features

### User-Facing Features

1. **Weekly Word Card**
   - Displays the current week's featured word
   - Shows original script with transliteration
   - Includes meaning/gloss and a brief explanation
   - Features 2-3 relevant Bible verses
   - Language-specific color coding (Greek: Blue, Hebrew: Orange, Aramaic: Green)

2. **Word Archive**
   - Browse past featured words
   - Paginated view with 10 words per page
   - Compact card display for easy scanning
   - Tracks archive views for analytics

3. **Integration Points**
   - **Today Page**: Featured word appears after the encouragement message
   - **Leader Dashboard**: Quick access card for admin management

### Admin Features

1. **Weekly Word Management**
   - Create new weekly words
   - Edit existing words
   - Soft delete (archive) words
   - Feature/unfeature words for current week

2. **Analytics Dashboard**
   - Total views tracking
   - Verse click metrics
   - Top viewed words
   - Event breakdown (views, clicks, shares)

## Technical Implementation

### Database Schema

#### WeeklyWord Model
```prisma
model WeeklyWord {
  id             String   @id @default(cuid())
  organizationId String?  // NULL = shared across organizations

  lemma          String   // Original word in script
  language       Language // GREEK, HEBREW, or ARAMAIC
  transliteration String  // Romanized pronunciation
  gloss          String   // English meaning
  blurb          String   // Short explanation
  verseRefs      Json     // Array of verse references
  verseTexts     Json?    // Optional cached verse texts

  weekStart      DateTime // Week start date
  weekEnd        DateTime // Week end date
  isFeatured     Boolean  // Currently featured
  isActive       Boolean  // Active/archived status

  createdBy      String?
  createdAt      DateTime
  updatedAt      DateTime
}
```

#### WeeklyWordMetric Model
```prisma
model WeeklyWordMetric {
  id         String              @id @default(cuid())
  wordId     String
  userId     String?
  eventType  WeeklyWordEventType // VIEW, VERSE_CLICK, SHARE, ARCHIVE_VIEW
  verseRef   String?
  viewSource String?             // "today_page", "dashboard", "archive"
  sessionId  String?
  createdAt  DateTime
}
```

### API Endpoints

#### User Endpoints
- `GET /api/weekly-word/current` - Get current week's word
- `GET /api/weekly-word/archive` - Get paginated archive
- `GET /api/weekly-word/:id` - Get specific word
- `POST /api/weekly-word/:id/track` - Track interaction (verse click, share)

#### Admin Endpoints (require admin role)
- `POST /api/weekly-word/admin` - Create new word
- `PUT /api/weekly-word/admin/:id` - Update word
- `DELETE /api/weekly-word/admin/:id` - Soft delete word
- `GET /api/weekly-word/admin/metrics` - Get analytics

### Frontend Components

#### Components
- `WeeklyWordCard.js` - Display card for weekly word
- `WeeklyWordCard.css` - Styling for the card component

#### Pages
- `WeeklyWordArchivePage.js` - Archive browsing page
- `WeeklyWordArchivePage.css` - Archive page styles
- `WeeklyWordAdminPage.js` - Admin management interface
- `WeeklyWordAdminPage.css` - Admin page styles

#### Context & Services
- `WeeklyWordContext.js` - React context for state management
- `weeklyWordService.js` - API service layer

### Routes

#### User Routes
- `/weekly-word/archive` - Browse past words

#### Admin Routes
- `/admin/weekly-word` - Manage weekly words

## Usage Guide

### For Admins

#### Creating a New Word

1. Navigate to Admin Dashboard
2. Click on "Weekly Word" quick access card
3. Click "+ Add New Word" button
4. Fill in the form:
   - **Original Word**: Enter the word in original script (e.g., ἀγάπη)
   - **Language**: Select Greek, Hebrew, or Aramaic
   - **Transliteration**: Enter romanized pronunciation (e.g., agape)
   - **Meaning/Gloss**: Enter English meaning (e.g., love)
   - **Explanation**: Write 2-3 sentences about the word's significance
   - **Verse References**: Enter comma-separated refs (e.g., John 3:16, Romans 8:28)
   - **Week Start Date**: Select the Monday of the target week
   - **Featured**: Check to make this the current featured word
5. Click "Create Word"

#### Managing Words

- **Edit**: Click the ✏️ icon to modify any field
- **Delete**: Click the 🗑️ icon to archive a word (soft delete)
- **Feature**: Edit a word and check "Featured" to make it current

#### Viewing Analytics

The admin dashboard shows:
- Total views across all words
- Verse click-through rate
- Total words created
- Event breakdown

### For Users

#### Viewing Current Word

1. Navigate to the "Today" page
2. Scroll to the "Word of the Week" section
3. Click on verse references to expand verse text
4. Click "View Archive" to see past words

#### Browsing Archive

1. Click "View Archive" from any weekly word card
2. Browse past words with pagination
3. Click on any verse reference to track engagement

## Metrics & Analytics

### Tracked Events

1. **VIEW** - Word card displayed to user
2. **VERSE_CLICK** - User clicked to read a verse
3. **SHARE** - User shared the word (future feature)
4. **ARCHIVE_VIEW** - User viewed word in archive

### View Sources

- `today_page` - Viewed on Today page
- `dashboard` - Viewed on admin dashboard
- `archive` - Viewed in archive

## Database Migration

To set up the database schema, run:

```bash
cd server
npx prisma migrate dev --name add_weekly_word_feature
npx prisma generate
```

## Future Enhancements

1. **Verse Text Caching**: Automatically fetch and cache verse texts from Bible API
2. **Social Sharing**: Allow users to share words on social media
3. **Favorites**: Let users save favorite words
4. **Study Notes**: Allow users to add personal notes to words
5. **Email Notifications**: Weekly email with the new word
6. **Mobile App Integration**: Push notifications for new words
7. **Audio Pronunciation**: Add pronunciation guides
8. **Advanced Search**: Filter by language, date, or keyword

## Troubleshooting

### Common Issues

**Issue**: Words not displaying on Today page
- **Solution**: Ensure a word is marked as "featured" and dates are current

**Issue**: Metrics not tracking
- **Solution**: Check that user is authenticated and token is valid

**Issue**: Database migration fails
- **Solution**: Ensure DATABASE_URL is set in .env file

## Contributing

When adding new features to the Weekly Word system:

1. Update the Prisma schema if database changes are needed
2. Create/update API endpoints in the controller
3. Add/modify frontend components as needed
4. Update this documentation
5. Add tests for new functionality

## Support

For questions or issues with the Weekly Word feature:
- Check the main project README
- Review API documentation in `/server/src/controllers/weekly-word.controller.ts`
- Check component documentation in source files

---

**Last Updated**: 2024
**Feature Version**: 1.0
**Status**: ✅ Implemented
