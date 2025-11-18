# Personalized "Today" Screen Feature

## Overview
This feature adds a personalized home screen for authenticated users, showing their most relevant spiritual and app actions including daily verse, reading progress, and personalized CTAs.

## Features Implemented

### 1. Backend Infrastructure
- **Express.js Server**: REST API running on port 3014
- **MongoDB Database**: User data, reading plans, progress tracking
- **JWT Authentication**: Secure token-based auth with 7-day expiration

### 2. Database Models
- **User**: Authentication, profile, streaks, preferences, usage stats
- **ReadingPlan**: Bible reading plans with daily assignments
- **UserProgress**: Track user's progress through reading plans
- **DailyVerse**: Verse of the day with reflection

### 3. API Endpoints

#### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

#### Today Screen
- `GET /api/me/today-screen` - Get personalized today screen data
- `GET /api/me/verse-of-the-day` - Get daily verse (public)
- `GET /api/me/current-plan` - Get current reading plan progress

#### Reading Plans
- `GET /api/plans` - Browse all reading plans (with filters)
- `GET /api/plans/:id` - Get plan details
- `POST /api/plans/:id/enroll` - Enroll in a plan
- `POST /api/plans/:id/complete-day` - Mark day as complete
- `GET /api/plans/:id/progress` - Get user's progress
- `GET /api/plans/my-plans` - Get all user's plans

### 4. Frontend Components

#### Pages
- **TodayPage**: Main personalized dashboard
  - Greeting with streak indicator
  - Daily verse with reflection
  - Current reading plan progress
  - Primary CTA based on user behavior
  - Quick action shortcuts
  - User stats

- **LoginPage**: User authentication
- **RegisterPage**: New user signup
- **PlansPage**: Browse and enroll in reading plans

#### Contexts
- **AuthContext**: Global authentication state management
- Handles login, logout, registration, token management

#### Services
- **api.js**: Axios-based API client with interceptors
- Token injection
- Error handling
- Automatic logout on 401

### 5. Key Features

#### Streak Tracking
- Daily login tracking
- Current streak vs. longest streak
- Automatic calculation on login

#### Personalization
- Primary CTA adapts based on:
  - Reading plan completion status
  - Most used features
  - User behavior patterns
- Feature usage tracking

#### Reading Plans
- Pre-seeded plans:
  - Gospel of John - 21 Days
  - Psalms of Praise - 14 Days
  - Life of Jesus - 30 Days
  - Proverbs Wisdom - 31 Days
- Filter by category, difficulty, search
- Progress tracking with percentage
- Day completion with notes

## Setup Instructions

### Backend Setup

1. **Install MongoDB**
   ```bash
   # Mac (using Homebrew)
   brew install mongodb-community
   brew services start mongodb-community

   # Ubuntu/Debian
   sudo apt-get install mongodb
   sudo systemctl start mongodb

   # Windows - Download from mongodb.com
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Seed Database**
   ```bash
   npm run seed
   ```

5. **Start Server**
   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

   Server will run on http://localhost:3014

### Frontend Setup

1. **Install Dependencies** (if not already installed)
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Add REACT_APP_API_URL=http://localhost:3014/api
   ```

3. **Start Frontend**
   ```bash
   npm start
   ```

   Frontend will run on http://localhost:3013

### Full Stack Development

Run both servers simultaneously:

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm start
```

## Usage

### First Time Setup

1. **Start both servers** (backend and frontend)
2. **Navigate to** http://localhost:3013
3. **Click "Sign Up"** in navigation
4. **Create an account** with name, email, age, password
5. **You'll be redirected** to the Today screen

### Using the Today Screen

1. **View your personalized dashboard**
   - See your current streak
   - Read the daily verse
   - Check your reading plan progress

2. **Start a Reading Plan**
   - If no plan enrolled, click "Explore Reading Plans"
   - Browse available plans
   - Click "Start Plan" to enroll
   - Return to Today screen to see your assignment

3. **Complete Daily Reading**
   - View today's reading assignment
   - Click "Continue Reading" (would need reading view page)
   - Progress updates automatically

4. **Quick Actions**
   - Access Prayer List (placeholder)
   - Journal (placeholder)
   - Explore more plans
   - View Lessons

## Personalization Logic

### Primary CTA Selection

The app determines the primary call-to-action based on:

1. **If Reading Plan Active & Today Not Completed**
   → "Continue [Chapter Name]"

2. **If Today's Reading Completed**
   → Suggest next action based on most-used feature:
   - Prayer users → "Add to Prayer List"
   - Journal users → "Write Journal Entry"
   - Others → "Explore More Plans"

3. **No Active Plan**
   → "Start Reading Plan"

### Feature Usage Tracking

The system tracks which features users engage with most:
- Reading
- Prayer
- Journal
- Games
- Lessons

This data personalizes the experience over time.

## Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  age: Number,
  streak: { current, longest, lastActiveDate },
  currentReadingPlan: ObjectId,
  preferences: { dailyReminderTime, theme, notificationsEnabled },
  stats: { totalDaysActive, chaptersRead, plansCompleted, featureUsage }
}
```

### ReadingPlan
```javascript
{
  name: String,
  description: String,
  duration: Number,
  category: String,
  difficulty: String,
  days: [{ dayNumber, title, readings[], reflection, questions[] }],
  enrollmentCount: Number,
  completionCount: Number
}
```

### UserProgress
```javascript
{
  user: ObjectId,
  readingPlan: ObjectId,
  currentDay: Number,
  completedDays: [{ dayNumber, completedAt, notes }],
  percentComplete: Number,
  isActive: Boolean
}
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication tokens
- **Protected Routes**: Backend middleware and frontend guards
- **Input Validation**: express-validator on all inputs
- **CORS**: Configured for frontend access

## Analytics Metrics (Ready to Track)

The system is designed to track:
- Daily open rate (via streak system)
- CTA click-through rate
- Reading plan completion rate
- Feature usage distribution
- User engagement patterns

Data is stored in user.stats and can be aggregated for insights.

## Future Enhancements

1. **Reading View Page**: Full chapter reader with highlighting
2. **Prayer List Feature**: Manage prayer requests
3. **Journal Feature**: Daily spiritual reflections
4. **Push Notifications**: Daily reminders
5. **Social Features**: Share progress, prayer requests
6. **Analytics Dashboard**: Admin view of user engagement
7. **Gamification**: Badges, achievements for milestones
8. **Offline Support**: Service worker for offline reading

## API Documentation

Full API documentation available at:
- Health Check: `GET /api/health`
- Swagger/OpenAPI docs (would need to add)

## Testing

To test the feature:

1. **Create test user**: Use register page
2. **Check daily verse**: Should rotate daily
3. **Enroll in plan**: Choose "Gospel of John"
4. **Complete a day**: Use complete-day endpoint
5. **Verify streak**: Login on consecutive days
6. **Check personalization**: Use different features

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `brew services list` or `sudo systemctl status mongodb`
- Verify .env file exists and has correct settings
- Check port 3014 is not in use

### Frontend can't connect to API
- Verify backend is running on port 3014
- Check .env has REACT_APP_API_URL set
- Check browser console for CORS errors

### Authentication not working
- Clear localStorage in browser DevTools
- Check JWT_SECRET is set in server/.env
- Verify token is being sent in Authorization header

## Contributors

This feature implements the full specification from the Personalized "Today" Screen user story including:
- ✅ User authentication
- ✅ Personalized greeting and streak
- ✅ Daily verse with reflection
- ✅ Reading plan integration
- ✅ Progress tracking
- ✅ Personalized CTAs
- ✅ Quick action shortcuts
- ✅ User statistics
- ✅ Analytics-ready data collection
