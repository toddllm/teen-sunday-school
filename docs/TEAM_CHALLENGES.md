# Team-Based Challenges Feature

## Overview

The Team-Based Challenges feature allows group leaders to create group-wide challenges with shared progress tracking. Students can participate in challenges to reach collective goals together.

## Features

- **Challenge Creation**: Leaders can create challenges for their groups with customizable goals and timeframes
- **Multiple Challenge Types**: Support for various activity types (chapters read, verses memorized, prayers logged, etc.)
- **Real-time Progress Tracking**: Live updates showing team progress toward goals
- **Leaderboards**: See top contributors within each challenge
- **Auto-enrollment**: Automatically enroll group members when a challenge starts
- **Flexible Settings**: Control individual progress visibility and late joins
- **Challenge Status Management**: Automatic status updates (draft, active, completed, expired)
- **Background Jobs**: Automated challenge lifecycle management

## User Roles

### Leaders (TEACHER, ORG_ADMIN, SUPER_ADMIN)
- Create challenges for their groups
- Set challenge parameters (type, goal, duration)
- Manage challenge status
- View all participants and progress
- Delete challenges (only if no contributions exist)

### Students (MEMBER)
- View active challenges
- Join challenges
- Contribute to challenges through activities
- View leaderboards
- See team progress in real-time

## Architecture

### Backend (Node.js + TypeScript)

#### Data Models (`/server/prisma/schema.prisma`)

**GroupChallenge**
- Core challenge entity
- Stores challenge details, type, target, dates, status
- Relations: group, participants, contributions, metrics

**ChallengeParticipant**
- Tracks user participation in challenges
- Stores individual contribution counts
- Many-to-many relationship between users and challenges

**ChallengeContribution**
- Records individual contributions
- Links contributions to source activities
- Enables progress tracking and leaderboards

**ChallengeMetric**
- Aggregated challenge statistics
- Stores total progress, percentages, top contributors
- Updated automatically when contributions are recorded

#### API Endpoints (`/server/src/routes/challenge.routes.ts`)

**Challenge Management**
- `POST /api/groups/:groupId/challenges` - Create challenge
- `GET /api/groups/:groupId/challenges` - Get group challenges
- `GET /api/challenges/my-challenges` - Get user's active challenges
- `GET /api/challenges/:challengeId` - Get challenge details
- `PATCH /api/challenges/:challengeId/status` - Update status
- `DELETE /api/challenges/:challengeId` - Delete challenge

**Participation**
- `POST /api/challenges/:challengeId/join` - Join challenge
- `POST /api/challenges/:challengeId/contributions` - Record contribution

**Statistics**
- `GET /api/challenges/:challengeId/leaderboard` - Get leaderboard

#### Services (`/server/src/services/challenge.service.ts`)

**ChallengeService** - Core business logic:
- `createChallenge()` - Create and initialize challenges
- `joinChallenge()` - Handle user participation
- `recordContribution()` - Record and aggregate contributions
- `updateMetrics()` - Calculate progress and statistics
- `checkChallengeCompletion()` - Detect goal achievement
- `expireOldChallenges()` - Mark expired challenges
- `activateDraftChallenges()` - Activate scheduled challenges

#### Background Jobs (`/server/src/jobs/challenge.job.ts`)

**Daily Automation Job** (runs at 1 AM daily):
- Expires challenges past their end date
- Activates draft challenges whose start date has arrived
- Ensures challenge statuses are always current

### Frontend (React)

#### Context (`/src/contexts/ChallengeContext.js`)

**ChallengeProvider** - Global state management:
- Manages active challenges list
- Provides challenge CRUD operations
- Handles contribution recording
- Auto-contribution integration point
- Helper functions for UI (progress, dates, etc.)

#### Pages

**ChallengesPage** (`/src/pages/ChallengesPage.js`)
- Student-facing challenge view
- Lists all active challenges
- Challenge detail view with leaderboard
- Join challenge functionality
- Route: `/challenges`

**ChallengesAdminPage** (`/src/pages/ChallengesAdminPage.js`)
- Leader-facing challenge management
- Create new challenges
- View and manage existing challenges
- Delete challenges (with restrictions)
- Route: `/admin/challenges`

#### Components (`/src/components/challenges/`)

**ChallengeCard** - Challenge summary card:
- Displays challenge name, type, progress
- Shows status badges (completed, expired, urgent)
- Participant count and deadline

**ProgressBar** - Animated progress indicator:
- Visual representation of challenge progress
- Percentage display
- Shimmer animation
- Completion state

**Leaderboard** - Top contributors list:
- Ranked list of participants
- Medal icons for top 3
- Highlight current user
- Contribution counts

## Usage Guide

### For Leaders

#### Creating a Challenge

1. Navigate to `/admin/challenges`
2. Select your group from the dropdown
3. Click "Create New Challenge"
4. Fill in challenge details:
   - **Name**: Descriptive challenge name
   - **Description**: Optional details about the challenge
   - **Type**: Select activity type (chapters read, verses memorized, etc.)
   - **Target Goal**: Number to reach as a group
   - **Start Date**: When the challenge begins
   - **End Date**: Challenge deadline
   - **Celebration Message**: Optional message shown when completed
   - **Settings**:
     - Show individual contributions (leaderboard visibility)
     - Allow late joins (let users join after start date)
5. Click "Create Challenge"

#### Challenge Types

- **CHAPTERS_READ**: Track Bible chapters read
- **VERSES_MEMORIZED**: Track verses memorized
- **PRAYERS_LOGGED**: Track prayers logged
- **LESSONS_COMPLETED**: Track lessons completed
- **DAYS_ATTENDED**: Track attendance days
- **READING_PLANS_COMPLETED**: Track reading plans completed
- **COMBO**: Multiple activity types combined

#### Managing Challenges

- View all challenges for your group
- See real-time progress and participant count
- Delete challenges (only if no one has contributed yet)
- Challenges automatically transition through statuses:
  - **DRAFT**: Created but not started
  - **ACTIVE**: Currently running
  - **COMPLETED**: Goal achieved!
  - **EXPIRED**: Time ended without reaching goal
  - **CANCELLED**: Manually cancelled

### For Students

#### Viewing Challenges

1. Navigate to `/challenges`
2. See all active challenges you can join
3. Click a challenge card to view details

#### Joining a Challenge

1. Click on a challenge
2. Review the details and leaderboard
3. Click "Join This Challenge"
4. Start contributing through your normal activities!

#### Contributing

Contributions are recorded automatically when you complete relevant activities:
- Reading Bible chapters → Contributes to "Chapters Read" challenges
- Memorizing verses → Contributes to "Verses Memorized" challenges
- Logging prayers → Contributes to "Prayers Logged" challenges
- Etc.

## Integration with Existing Features

### StreakContext Integration

To enable automatic contribution recording from StreakContext, modify the `logActivity` function to call challenge auto-record:

```javascript
import { useChallenges } from '../contexts/ChallengeContext';

// In your component:
const { autoRecordContribution } = useChallenges();

// After logging an activity in StreakContext:
logActivity(activityType);
autoRecordContribution(activityType, activityId);
```

This ensures that when a user completes an activity, it automatically contributes to any relevant active challenges they're participating in.

## Database Schema

### GroupChallenge Table
```
- id: String (CUID)
- groupId: String (FK → Group)
- name: String
- description: String?
- type: ChallengeType enum
- targetValue: Int
- startDate: DateTime
- endDate: DateTime
- status: ChallengeStatus enum
- createdBy: String (User ID)
- badgeId: String?
- celebrationMessage: String?
- showIndividualProgress: Boolean
- allowLateJoins: Boolean
- createdAt: DateTime
- updatedAt: DateTime
- completedAt: DateTime?
```

### ChallengeParticipant Table
```
- id: String (CUID)
- challengeId: String (FK → GroupChallenge)
- userId: String (FK → User)
- joinedAt: DateTime
- isActive: Boolean
- totalContributions: Int
- lastContributionAt: DateTime?
```

### ChallengeContribution Table
```
- id: String (CUID)
- challengeId: String (FK → GroupChallenge)
- userId: String
- amount: Int
- sourceActivityType: String
- sourceActivityId: String?
- sourceMetadata: Json?
- createdAt: DateTime
```

### ChallengeMetric Table
```
- id: String (CUID)
- challengeId: String (FK → GroupChallenge, unique)
- totalProgress: Int
- progressPercentage: Float
- participantCount: Int
- activeParticipants: Int
- topContributors: Json?
- averageContributionsPerDay: Float?
- estimatedCompletionDate: DateTime?
- lastUpdated: DateTime
```

## API Reference

### Create Challenge
```
POST /api/groups/:groupId/challenges
Authorization: Bearer {token}

Body:
{
  "name": "Read 100 Chapters Together",
  "description": "Let's read the New Testament together!",
  "type": "CHAPTERS_READ",
  "targetValue": 100,
  "startDate": "2025-01-01",
  "endDate": "2025-03-31",
  "celebrationMessage": "Amazing job team!",
  "showIndividualProgress": true,
  "allowLateJoins": true
}

Response: ChallengeWithDetails
```

### Get Group Challenges
```
GET /api/groups/:groupId/challenges?status=ACTIVE
Authorization: Bearer {token}

Response: ChallengeWithDetails[]
```

### Join Challenge
```
POST /api/challenges/:challengeId/join
Authorization: Bearer {token}

Response: ChallengeParticipant
```

### Record Contribution
```
POST /api/challenges/:challengeId/contributions
Authorization: Bearer {token}

Body:
{
  "amount": 1,
  "sourceActivityType": "chapter_read",
  "sourceActivityId": "activity-123",
  "sourceMetadata": { "book": "John", "chapter": 3 }
}

Response: ChallengeContribution
```

### Get Leaderboard
```
GET /api/challenges/:challengeId/leaderboard?limit=10
Authorization: Bearer {token}

Response: LeaderboardEntry[]
```

## Setup Instructions

### Database Migration

Run the Prisma migration to create challenge tables:

```bash
cd server
npx prisma migrate dev --name add_team_challenges
```

### Environment Variables

Ensure these are set in `/server/.env`:

```env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://localhost:6379"  # Required for background jobs
```

### Starting the Server

```bash
cd server
npm run dev
```

The server will:
- Connect to PostgreSQL
- Initialize challenge background jobs (if Redis is configured)
- Start listening on port 3001

### Frontend Setup

The frontend is already configured. Just ensure:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Permissions & Security

### Role-Based Access Control

- **Challenge Creation**: TEACHER, ORG_ADMIN, SUPER_ADMIN
- **Challenge Viewing**: All authenticated users (filtered by group membership)
- **Challenge Participation**: Group members only
- **Challenge Deletion**: Creator or ORG_ADMIN/SUPER_ADMIN (only if no contributions)

### Data Security

- All API endpoints require JWT authentication
- Users can only access challenges for groups they belong to
- Contribution recording validates participation
- Sensitive data (individual contributions) respects challenge settings

## Metrics & Analytics

Tracked automatically:
- Total challenges created
- Challenges completed vs. expired
- Average participation rate
- Average time to completion
- Top performing groups
- Most popular challenge types

Access via `/admin/challenges` for administrators.

## Future Enhancements

Potential additions:
- Real-time WebSocket updates for live progress
- Challenge templates library
- Multi-group challenges (cross-group competition)
- Badge rewards on challenge completion
- Push notifications for milestones
- Export challenge reports to PDF/CSV
- Challenge categories and tags
- Recurring challenges (weekly, monthly)

## Troubleshooting

### Challenges not appearing
- Verify user is authenticated
- Check user is a member of the group
- Ensure challenge status is ACTIVE
- Check date range (challenge must not be expired)

### Contributions not recording
- Verify user is a participant (auto-join if allowed)
- Check activity type matches challenge type
- Ensure challenge status is ACTIVE
- Check API logs for errors

### Background jobs not running
- Verify Redis is running and accessible
- Check REDIS_URL environment variable
- Review server logs for job initialization
- Manually trigger: `challengeService.expireOldChallenges()`

## Support

For issues or questions:
- Check server logs: `/server/logs/`
- Review API responses for error messages
- Verify database schema is up to date
- Ensure all dependencies are installed

---

**Version**: 1.0.0
**Last Updated**: 2025-11-18
**Author**: Claude Code Implementation
