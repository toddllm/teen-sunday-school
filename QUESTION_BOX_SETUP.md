# Anonymous Question Box - Setup Guide

## Overview
The Anonymous Question Box feature allows teens to submit anonymous questions about faith and life, which leaders can review and answer.

## Database Migration

To set up the database tables for this feature, run the following command:

```bash
cd server
npx prisma migrate dev --name add-anonymous-questions
```

Or if the database is already set up:

```bash
cd server
npx prisma migrate deploy
```

This will create the `AnonymousQuestion` table and related enums.

## Database Schema

### AnonymousQuestion Table
- `id` - Unique identifier (cuid)
- `groupId` - Reference to the group
- `sessionId` - Optional reference to a lesson/session
- `category` - Question category (BIBLE, LIFE, DOUBT)
- `body` - The question text
- `status` - Question status (UNANSWERED, ANSWERED, ARCHIVED)
- `answeredBy` - User ID of leader who answered
- `answeredAt` - Timestamp when answered
- `answerText` - Written answer (if provided)
- `answerMethod` - How it was answered (WRITTEN, IN_CLASS)
- `createdAt` - Timestamp when submitted
- `updatedAt` - Last update timestamp

## API Endpoints

### Public Endpoints (No Authentication Required)
- `POST /api/groups/:groupId/questions` - Submit an anonymous question

### Admin Endpoints (Authentication Required)
- `GET /api/admin/questions` - Get all questions (with filters)
- `GET /api/admin/questions/stats` - Get question statistics
- `GET /api/admin/questions/:id` - Get a specific question
- `PUT /api/admin/questions/:id/answer` - Mark question as answered
- `PUT /api/admin/questions/:id/status` - Update question status
- `DELETE /api/admin/questions/:id` - Delete a question

## Frontend Routes

### Public Routes
- `/questions` - Question submission page for students

### Admin Routes
- `/admin/questions` - Question management dashboard for leaders

## Features

### For Students
1. Submit questions anonymously in three categories:
   - 📖 Bible - Questions about Bible interpretation and theology
   - ❤️ Life - Questions about daily life and relationships
   - 🤔 Doubt - Questions about faith and doubts

2. No personal information is collected
3. Simple, intuitive form interface

### For Leaders
1. View all submitted questions
2. Filter by:
   - Status (Unanswered, Answered, Archived)
   - Category (Bible, Life, Doubt)
   - Group
   - Session

3. Answer questions:
   - Mark as "Answered in class"
   - Provide written answer

4. Statistics dashboard showing:
   - Total questions
   - Unanswered count
   - Response rate
   - Questions by category

5. Question management:
   - Archive questions
   - Reopen archived questions
   - Delete questions

## Permissions

- **Students**: Can submit questions (no authentication required)
- **Leaders**: Can view and manage questions for their groups
- **Teachers**: Can view and manage all questions
- **Admins**: Full access to all questions

## Next Steps

1. Set up database connection in `server/.env`
2. Run the migration: `npx prisma migrate dev`
3. Start the backend server: `npm run dev` (in server directory)
4. Start the frontend: `npm start` (in root directory)
5. Navigate to `/questions` to submit a question
6. Navigate to `/admin/questions` to manage questions

## Technical Stack

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

**Frontend:**
- React
- Context API for state management
- React Router for navigation
- Custom CSS for styling

## Security Notes

- Questions are truly anonymous - no user ID or identifying information is stored
- Admin endpoints are protected with JWT authentication
- Role-based access control ensures only authorized users can view questions
- CORS protection and rate limiting are in place
