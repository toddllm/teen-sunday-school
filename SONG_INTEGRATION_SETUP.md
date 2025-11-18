# Song/Lyrics Integration - Setup Guide

This document provides setup instructions for the Song/Lyrics Integration feature.

## Overview

The Song/Lyrics Integration feature allows:
- **Teens**: View worship songs that connect with Bible passages
- **Leaders**: Create song playlists for lessons
- **All Users**: Play a match game connecting lyric snippets with themes

## Database Setup

### 1. Run Migration

```bash
cd server
npx prisma migrate dev --name add_song_integration
```

This will create the following tables:
- `SongRef` - Song references with metadata
- `SongPlaylist` - Playlists created by leaders
- `SongPlaylistItem` - Songs in playlists
- `SongMetric` - Metrics tracking (views, clicks, game plays)

### 2. Seed Initial Songs

The seed script contains 15 public domain hymns to get started:

```bash
cd server
npx ts-node prisma/seed-songs.ts
```

Songs included:
- Amazing Grace
- How Great Thou Art
- Come Thou Fount
- It Is Well With My Soul
- Be Thou My Vision
- Great Is Thy Faithfulness
- Holy, Holy, Holy
- The Old Rugged Cross
- Jesus Loves Me
- A Mighty Fortress
- Blessed Assurance
- Rock of Ages
- Crown Him With Many Crowns
- I Need Thee Every Hour
- What A Friend We Have In Jesus

## API Endpoints

### Song Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/songs` | Get songs (with filters) | Yes |
| GET | `/api/songs/:id` | Get single song | Yes |
| POST | `/api/songs` | Create song (admin) | Yes (Admin) |
| PUT | `/api/songs/:id` | Update song (admin) | Yes (Admin) |
| DELETE | `/api/songs/:id` | Delete song (admin) | Yes (Admin) |
| POST | `/api/songs/:id/metrics` | Track metric | Optional |
| GET | `/api/songs/admin/metrics` | Get metrics (admin) | Yes (Admin) |
| GET | `/api/songs/admin/stats` | Get stats (admin) | Yes (Admin) |

### Playlist Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/playlists` | Get playlists | Yes |
| GET | `/api/playlists/:id` | Get single playlist | Yes |
| POST | `/api/playlists` | Create playlist | Yes |
| PUT | `/api/playlists/:id` | Update playlist | Yes (Owner) |
| DELETE | `/api/playlists/:id` | Delete playlist | Yes (Owner) |
| POST | `/api/playlists/:id/songs` | Add song to playlist | Yes (Owner) |
| DELETE | `/api/playlists/:id/songs/:songId` | Remove song | Yes (Owner) |
| PUT | `/api/playlists/:id/reorder` | Reorder songs | Yes (Owner) |

### Query Parameters

#### GET /api/songs

- `passage_ref` - Filter by Bible passage (e.g., "JHN.3.16")
- `theme` - Filter by theme tag (e.g., "grace", "worship")

#### GET /api/playlists

- `lessonId` - Filter by lesson
- `userId` - Filter by user
- `isPublic` - Filter by public playlists

## Frontend Components

### 1. RelatedSongs Component

Display songs related to a Bible passage or theme.

```jsx
import RelatedSongs from './components/RelatedSongs';

// In your component
<RelatedSongs passageRef="JHN.3.16" />
// or
<RelatedSongs theme="grace" />
```

**Props:**
- `passageRef` (string, optional) - Bible verse ID (e.g., "JHN.3.16")
- `theme` (string, optional) - Theme tag to filter by

### 2. SongMatchGame Component

Interactive game to match lyric snippets with themes.

```jsx
import SongMatchGame from './components/SongMatchGame';

// In your component
<SongMatchGame theme="grace" />
```

**Props:**
- `theme` (string, optional) - Filter songs by theme

### 3. PlaylistManager Component

Playlist management interface for leaders.

```jsx
import PlaylistManager from './components/PlaylistManager';

// In your component
<PlaylistManager lessonId={lesson.id} />
```

**Props:**
- `lessonId` (string, optional) - Associate playlist with a lesson

## Data Model

### SongRef

```typescript
{
  id: string;
  organizationId?: string;  // null = global song
  title: string;
  artist: string;
  linkUrl?: string;         // YouTube, Spotify, etc.
  themeTags: string[];      // ["grace", "worship", ...]
  relatedVerses: string[];  // ["JHN.3.16", "ROM.8.28", ...]
  gameSnippet?: string;     // Short lyric snippet (max 10 words)
  gameTheme?: string;       // Primary theme
  isApproved: boolean;
  curatedBy?: string;       // Admin user ID
}
```

### SongPlaylist

```typescript
{
  id: string;
  organizationId: string;
  userId: string;           // Owner
  name: string;
  description?: string;
  lessonId?: string;        // Optional lesson link
  isPublic: boolean;
  items: SongPlaylistItem[];
}
```

### SongMetric Types

- `VIEW` - Song was viewed in related songs section
- `LINK_CLICK` - External link was clicked
- `GAME_PLAY` - Song was used in match game
- `PLAYLIST_ADD` - Song was added to a playlist

## Usage Examples

### Example 1: Display Related Songs in Lesson Page

```jsx
import RelatedSongs from './components/RelatedSongs';

function LessonPage({ lesson }) {
  return (
    <div>
      {/* Lesson content */}
      <div className="lesson-content">
        <h1>{lesson.title}</h1>
        <p>{lesson.scripture}</p>
        {/* ... */}
      </div>

      {/* Related songs based on lesson scripture */}
      <RelatedSongs passageRef={lesson.scriptureRef} />
    </div>
  );
}
```

### Example 2: Song Match Game in Activities Page

```jsx
import SongMatchGame from './components/SongMatchGame';

function ActivitiesPage() {
  return (
    <div>
      <h1>Activities</h1>

      {/* Other games */}

      <SongMatchGame theme="grace" />
    </div>
  );
}
```

### Example 3: Playlist Manager for Leaders

```jsx
import PlaylistManager from './components/PlaylistManager';

function LessonPlannerPage({ lesson }) {
  return (
    <div>
      <h1>Lesson Planner</h1>

      {/* Lesson planning tools */}

      {/* Song playlist management */}
      <PlaylistManager lessonId={lesson.id} />
    </div>
  );
}
```

## Admin Features

### Adding New Songs

Admin users can add songs through the API:

```javascript
const response = await fetch('/api/songs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Amazing Grace',
    artist: 'John Newton',
    linkUrl: 'https://www.youtube.com/watch?v=...',
    themeTags: ['grace', 'redemption', 'salvation'],
    relatedVerses: ['EPH.2.8', 'ROM.3.24'],
    gameSnippet: 'Amazing grace, how sweet the sound',
    gameTheme: 'grace',
  }),
});
```

### Viewing Metrics

Admin users can view song engagement metrics:

```javascript
// Get statistics
const stats = await fetch('/api/songs/admin/stats?days=30', {
  headers: { 'Authorization': `Bearer ${token}` },
});

// Get detailed metrics
const metrics = await fetch('/api/songs/admin/metrics', {
  headers: { 'Authorization': `Bearer ${token}` },
});
```

## Copyright Considerations

This feature is designed with copyright compliance in mind:

1. **No Full Lyrics**: Only short snippets (max 10 words) or paraphrases
2. **Links Only**: Direct links to authorized platforms (YouTube, Spotify)
3. **Metadata Only**: Displays title, artist, and themes
4. **Public Domain Focus**: Seed data includes only public domain hymns

### Guidelines for Adding Songs

- Use public domain songs when possible
- For copyrighted songs, only include:
  - Title
  - Artist
  - Link to authorized platform
  - Very short snippet (≤10 words) or paraphrase
  - Theme tags
- Do not reproduce full lyrics or substantial portions

## CSS Variables

The components use the following CSS variables. Ensure they are defined in your theme:

```css
:root {
  --bg-color: #ffffff;
  --text-color: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --card-bg: #f9fafb;
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --primary-light: #dbeafe;
  --accent-color: #f59e0b;
  --accent-hover: #d97706;
  --success-color: #10b981;
  --success-light: #d1fae5;
  --error-color: #ef4444;
}
```

## Next Steps

1. Run database migration
2. Seed initial songs
3. Import components where needed
4. Test the functionality
5. Add admin UI for song management (optional)

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
