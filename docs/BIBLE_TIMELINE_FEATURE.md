# Bible Timeline + Reading Path Integration

## Overview

The Bible Timeline + Reading Path Integration is a comprehensive feature that combines a visual timeline of Bible events with a chronological reading plan. This feature helps teens understand the Bible's narrative flow and provides a structured path to read through Scripture in the order events occurred.

## Features

### 1. Visual Bible Timeline

- **Chronological Events**: Display major Bible events from Creation to Revelation in chronological order
- **Event Categories**: Events are organized into categories (Creation, Patriarchs, Exodus, Kings, Prophets, Jesus, Early Church, etc.)
- **Rich Event Details**: Each event includes:
  - Title and date range
  - Detailed description
  - Associated Bible passages
  - Reading notes

### 2. Chronological Reading Plan

- **Auto-Generated Plan**: Automatically creates a reading plan based on timeline events
- **Daily Readings**: Each day includes specific Bible passages related to a timeline event
- **Progress Tracking**: Users can mark days as complete and track their progress
- **Reflection Prompts**: Each day includes reflection questions to aid study

### 3. Progress Visualization

- **Timeline Progress**: Shows completion status for each event on the timeline
- **Overall Progress Bar**: Displays percentage of plan completed
- **Day-by-Day Tracking**: Individual progress for each reading day
- **Statistics Dashboard**: Shows current day, days completed, and completion percentage

## User Stories

### As a Teen
- "I want to read the Bible in story order so I can understand how events connect"
- "I want to see my progress visually on a timeline"
- "I want reflection questions to help me think deeper about what I read"

### As a Leader
- "I want to recommend a chronological reading journey to my students"
- "I want to see metrics on how many students are using the chronological plan"
- "I want students to understand the flow of biblical history"

## Architecture

### Database Schema

#### TimelineEvent
```prisma
model TimelineEvent {
  id          String   @id @default(cuid())
  title       String
  dateRange   String   // e.g., "2000 BC", "586-538 BC"
  description String   @db.Text
  order       Int      // For chronological ordering
  category    String?  // Event category
  imageUrl    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  readingSegments TimelineReadingSegment[]
}
```

#### TimelineReadingSegment
```prisma
model TimelineReadingSegment {
  id        String   @id @default(cuid())
  eventId   String
  passages  Json     // Array of Bible passages
  order     Int      // Order within event
  notes     String?  @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  event TimelineEvent @relation(...)
}
```

#### ReadingPlan
```prisma
model ReadingPlan {
  id             String     @id @default(cuid())
  organizationId String?
  title          String
  description    String     @db.Text
  planType       PlanType   @default(CUSTOM)
  duration       Int
  days           Json       // Daily reading structure
  tags           String[]
  status         PlanStatus @default(DRAFT)
  isPublic       Boolean    @default(false)

  enrollments UserReadingPlan[]
}
```

#### UserReadingPlan
```prisma
model UserReadingPlan {
  id            String    @id @default(cuid())
  userId        String
  planId        String
  startedAt     DateTime  @default(now())
  completedAt   DateTime?
  currentDay    Int       @default(1)
  progress      Json      // Day-by-day completion status
  totalDays     Int
  completedDays Int       @default(0)
}
```

#### Activity
```prisma
model Activity {
  id           String       @id @default(cuid())
  userId       String
  activityType ActivityType
  metadata     Json?
  timestamp    DateTime     @default(now())
}

enum ActivityType {
  READING_PLAN_STARTED
  READING_PLAN_COMPLETED
  TIMELINE_PROGRESS
  // ... other activity types
}
```

### API Endpoints

#### Timeline Endpoints (Public)
```
GET /api/bible/timeline/chronological
- Returns all timeline events with reading segments
- Ordered chronologically
- No authentication required

GET /api/bible/timeline/events/:id
- Returns specific timeline event with details
- No authentication required
```

#### Reading Plan Endpoints (Authenticated)
```
POST /api/bible/me/plans/chronological/start
- Enrolls user in chronological reading plan
- Creates UserReadingPlan record
- Logs READING_PLAN_STARTED activity
- Returns enrollment and plan data

GET /api/bible/me/plans/chronological/progress
- Returns user's progress on chronological plan
- Includes timeline with event-level progress
- Shows overall progress statistics

POST /api/bible/me/plans/:planId/progress
- Updates progress for a specific day
- Body: { dayNumber, completed }
- Logs TIMELINE_PROGRESS activity
- Logs READING_PLAN_COMPLETED if plan is finished
```

#### Metrics Endpoints (Admin)
```
GET /api/bible/admin/metrics/chronological-plan
- Returns metrics for chronological plan
- Data: total starts, completions, active users, completion rate
- Requires authentication (admin check should be added)
```

### Frontend Components

#### TimelinePage (`/bible/timeline`)
- Displays visual timeline of Bible events
- Shows event categories and filtering
- Displays user's progress on enrolled plan
- CTA buttons to start chronological plan
- Integration with progress tracking

**Key Features:**
- Category filtering
- Progress visualization
- Responsive timeline layout (left/right alternating)
- Enrollment status checking
- Navigation to reading plan

#### ChronologicalPlanPage (`/bible/chronological-plan`)
- Daily reading plan interface
- Day selector sidebar with completion status
- Current day content viewer
- Progress tracking and marking days complete
- Navigation between days

**Key Features:**
- Day-by-day reading assignments
- Reflection prompts
- Progress bars (overall and per-event)
- Mark as complete functionality
- Responsive layout with sticky sidebar

### Data Flow

1. **Initial Setup**:
   - Run `timeline-seed.ts` to populate timeline events
   - Timeline data includes 33 major Bible events with reading segments

2. **User Enrollment**:
   - User visits `/bible/timeline`
   - Clicks "Start Chronological Reading Plan"
   - Backend creates/finds chronological ReadingPlan
   - Creates UserReadingPlan enrollment for user
   - Logs READING_PLAN_STARTED activity

3. **Progress Tracking**:
   - User navigates to `/bible/chronological-plan`
   - Selects a day to read
   - Marks day as complete
   - Backend updates UserReadingPlan.progress
   - Logs TIMELINE_PROGRESS activity
   - If all days complete, logs READING_PLAN_COMPLETED

4. **Timeline Visualization**:
   - Timeline page fetches user's progress
   - Annotates each event with completion percentage
   - Shows visual progress indicators
   - Updates in real-time as user completes readings

## Setup Instructions

### 1. Database Migration
```bash
cd server
npx prisma migrate dev --name add_bible_timeline
```

### 2. Seed Timeline Data
```bash
cd server
npx ts-node prisma/seeds/timeline-seed.ts
```

This will create 33 timeline events covering the entire Bible narrative from Creation to Revelation.

### 3. Environment Variables
Ensure your `.env` file includes:
```
DATABASE_URL="postgresql://..."
REACT_APP_API_URL="http://localhost:3001"
```

### 4. Start Services
```bash
# Backend
cd server
npm run dev

# Frontend
cd ..
npm start
```

### 5. Access the Feature
- Timeline: `http://localhost:3000/bible/timeline`
- Reading Plan: `http://localhost:3000/bible/chronological-plan`

## Usage Examples

### For Students

1. **Start the Plan**:
   - Navigate to "Bible Timeline" from the navigation menu
   - Review the timeline events
   - Click "Start Chronological Reading Plan"

2. **Daily Reading**:
   - Click "View My Reading Plan" or navigate to the plan page
   - Select Day 1 from the sidebar
   - Read the assigned passages
   - Reflect on the prompts
   - Mark day as complete

3. **Track Progress**:
   - View overall progress in the header
   - See event-specific progress on the timeline
   - Navigate between days using Previous/Next buttons

### For Leaders

1. **Monitor Engagement**:
   - Access metrics endpoint to see plan statistics
   - View total enrollments and completion rates
   - Identify active users

2. **Encourage Participation**:
   - Share the timeline link with students
   - Discuss timeline events in class
   - Use reflection prompts for group discussions

## Metrics & Analytics

The feature tracks the following metrics:

- **Plan Starts**: Total number of users who started the chronological plan
- **Plan Completions**: Total number of users who completed the entire plan
- **Active Users**: Current number of users with incomplete plans
- **Completion Rate**: Percentage of started plans that were completed
- **Daily Progress**: Individual day completion tracking
- **Event Progress**: Completion status for each timeline event

## Future Enhancements

Potential improvements for future iterations:

1. **Social Features**:
   - Group reading plans
   - Discussion forums per event/day
   - Share progress with friends

2. **Enhanced Content**:
   - Audio Bible integration
   - Video explanations for events
   - Interactive maps of locations

3. **Gamification**:
   - Badges for timeline milestones
   - Streaks for daily reading
   - Leaderboards for groups

4. **Customization**:
   - Adjustable pace (fast/normal/slow)
   - Custom timeline event creation
   - Personal notes and highlights

5. **Notifications**:
   - Daily reading reminders
   - Milestone celebrations
   - Encouragement messages

## Technical Notes

### Performance Considerations
- Timeline data is fetched once and cached
- Progress updates use optimistic UI updates
- Lazy loading for day content
- Indexed database queries for fast lookups

### Security
- Authentication required for plan enrollment
- User data isolation (can only access own progress)
- Admin endpoints should add role-based access control
- Input validation on progress updates

### Accessibility
- Keyboard navigation support
- Semantic HTML structure
- ARIA labels for interactive elements
- Color contrast compliance
- Responsive design for mobile devices

## Support & Troubleshooting

### Common Issues

**Timeline not loading**:
- Verify database connection
- Ensure timeline seed script was run
- Check API endpoint configuration

**Can't enroll in plan**:
- Verify user is authenticated
- Check database migrations are current
- Ensure ReadingPlan table exists

**Progress not saving**:
- Check authentication token
- Verify API endpoint URL
- Check browser console for errors

### Debug Tips
- Enable request logging in development mode
- Check Prisma Studio for database state
- Use browser DevTools to inspect API calls
- Review server logs for errors

## License & Credits

This feature is part of the Teen Sunday School application. The Bible timeline data is based on commonly accepted chronological ordering of biblical events.

**Bible Translation**: Scripture references use the NIV translation via scripture.api.bible API.

---

For questions or issues, please refer to the main project documentation or contact the development team.
