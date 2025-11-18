# Interactive Polls & Live Questions - Integration Guide

## Overview

The Interactive Polls feature enables leaders to launch polls during lessons with live teen responses. This guide explains how to integrate the polls feature into your existing pages.

## Architecture

### Backend
- **Database Models**: `Poll`, `PollResponse` (Prisma schema)
- **API Endpoints**:
  - `POST /api/lessons/:lessonId/polls` - Create poll
  - `GET /api/lessons/:lessonId/polls` - Get lesson polls
  - `GET /api/polls/:pollId` - Get specific poll
  - `PATCH /api/polls/:pollId/activate` - Activate poll
  - `PATCH /api/polls/:pollId/close` - Close poll
  - `DELETE /api/polls/:pollId` - Delete poll
  - `POST /api/polls/:pollId/responses` - Submit response
  - `GET /api/polls/:pollId/results` - Get results
- **Controllers**: `/server/src/controllers/poll.controller.ts`
- **Routes**: `/server/src/routes/poll.routes.ts`

### Frontend
- **Context**: `PollContext` provides state management and API calls
- **Admin Components** (for leaders):
  - `PollCreator` - Create new polls
  - `PollManager` - Manage polls (activate, close, delete)
  - `PollResults` - View live results with charts and word clouds
- **Student Components** (for teens):
  - `PollResponse` - Respond to active polls

## Integration Steps

### 1. Database Setup

If the database isn't already set up, run the migration:

```bash
cd server
npx prisma migrate dev
```

This will create the `Poll` and `PollResponse` tables.

### 2. Admin/Leader Integration

To add polls to a lesson management page (e.g., in a lesson creator or lesson admin view):

```jsx
import React from 'react';
import { PollCreator, PollManager } from '../components/admin/polls';

function LessonAdminPage({ lessonId }) {
  return (
    <div className="lesson-admin">
      <h2>Manage Lesson</h2>

      {/* Other lesson management UI */}

      <section className="polls-section">
        <h3>Interactive Polls</h3>
        <PollCreator lessonId={lessonId} />
        <PollManager lessonId={lessonId} />
      </section>
    </div>
  );
}
```

### 3. Student/Teen Integration

To add poll responses to a lesson view page (e.g., in the main lesson view for students):

```jsx
import React from 'react';
import { PollResponse } from '../components/polls';

function LessonViewPage({ lessonId }) {
  return (
    <div className="lesson-view">
      {/* Lesson content */}

      <PollResponse
        lessonId={lessonId}
        onResponseSubmitted={(response) => {
          console.log('Response submitted:', response);
        }}
      />
    </div>
  );
}
```

### 4. Authentication Requirements

Polls require authentication. Make sure the `AuthProvider` is wrapping your app in `index.js`:

```jsx
<AuthProvider>
  <PollProvider>
    <App />
  </PollProvider>
</AuthProvider>
```

## Features

### Poll Types

1. **Multiple Choice**: Select from predefined options
   - Displays as clickable options
   - Results shown as bar chart

2. **Open Ended**: Free text responses
   - Displays as text area
   - Results shown as word cloud and list of responses

3. **Rating**: 1-5 star rating
   - Displays as clickable stars
   - Results shown as average rating and breakdown

### Leader Features

- **Create Polls**: Create multiple choice, open-ended, or rating polls
- **Launch Polls**: Activate polls to make them live (one at a time)
- **View Results**: See live aggregated results with visualizations
- **Close Polls**: Stop accepting responses
- **Delete Polls**: Remove polls (only when not active)

### Student Features

- **Respond to Active Polls**: See and respond to the currently active poll
- **Anonymous Responses**: Can respond without logging in (anonymous ID tracked)
- **Real-time Updates**: Poll appears automatically when activated

### Real-time Updates

- Admin view auto-refreshes polls every 5 seconds when a poll is active
- Results view auto-refreshes every 3 seconds for active polls
- Student view checks for active polls every 3 seconds

## Permissions

- **Create/Activate/Close/Delete Polls**: Requires `TEACHER`, `ORG_ADMIN`, or `SUPER_ADMIN` role
- **Submit Responses**: Any authenticated user or anonymous user
- **View Results**: Any user in the organization

## API Usage Examples

### Create a Poll

```javascript
import { usePoll } from '../contexts/PollContext';

const { createPoll } = usePoll();

await createPoll('lesson-id', {
  question: 'What is your favorite Bible story?',
  type: 'MULTIPLE_CHOICE',
  options: ['David & Goliath', 'Noah\'s Ark', 'Jonah & the Whale'],
  showResultsLive: true
});
```

### Submit a Response

```javascript
import { usePoll } from '../contexts/PollContext';

const { submitPollResponse } = usePoll();

await submitPollResponse('poll-id', 'David & Goliath');
```

### Get Results

```javascript
import { usePoll } from '../contexts/PollContext';

const { getPollResults } = usePoll();

const result = await getPollResults('poll-id');
console.log(result.results); // Aggregated results
```

## Styling

The polls use CSS custom properties for theming. You can customize colors by setting these variables:

```css
:root {
  --primary-color: #4A90E2;
  --primary-hover: #357ABD;
  --surface-color: #ffffff;
  --text-primary: #333;
  --text-secondary: #666;
  --border-color: #e0e0e0;
}
```

Dark mode is supported via `prefers-color-scheme: dark`.

## Metrics & Analytics

Track these metrics from the poll data:

- Response rate per poll: `poll.responses.length`
- Most engaged sessions: Count polls used per lesson
- Popular poll types: Track which types get the most responses
- Completion time: Compare `activatedAt` vs response `createdAt`

## Troubleshooting

### Polls not appearing
- Ensure `PollProvider` is wrapping your app
- Check that the user is authenticated
- Verify the lesson ID is correct

### Cannot create polls
- Check user has `TEACHER` role or higher
- Ensure `AuthProvider` is set up
- Check backend server is running

### Results not updating
- Verify poll is in `ACTIVE` status
- Check browser console for errors
- Ensure real-time refresh is not blocked

## Next Steps

1. **Add to Lesson Creator**: Integrate `PollCreator` into the lesson creation workflow
2. **Add to Lesson View**: Integrate `PollResponse` into student lesson view
3. **Add to Admin Dashboard**: Show poll metrics and analytics
4. **Mobile Optimization**: Test and optimize for mobile devices
5. **Push Notifications**: Notify students when a poll goes live (future enhancement)

## Example Pages

See these example integrations:

- **Admin Poll Management**: `/admin/lessons/:id/polls` (to be created)
- **Student Poll Response**: Already integrated via `PollResponse` component
- **Poll Results Dashboard**: Already integrated via `PollResults` component

## Support

For questions or issues, please refer to the main project documentation or create an issue in the repository.
