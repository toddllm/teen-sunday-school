# Find the Reference Game

## Overview

The "Find the Reference" game is an interactive Bible quiz feature that helps teens test and improve their knowledge of Bible verse locations. Players are shown a verse text and must identify the correct Bible reference from multiple choice options.

## Features

### User-Facing Features

- **Multiple Choice Quiz**: Read a verse and select the correct reference from 4 options
- **Difficulty Levels**: Questions categorized as Easy, Medium, or Hard
- **Book Filtering**: Filter questions by specific Bible books or play with random verses
- **Statistics Tracking**: Track your performance with:
  - Current streak
  - Best streak
  - Overall accuracy percentage
  - Total attempts
  - Performance by book

### Game Modes

- **Random Mode**: Questions from all books and difficulty levels
- **Book-Specific Mode**: Focus on a specific book of the Bible
- **Difficulty Filter**: Choose Easy, Medium, Hard, or All difficulties

### Scoring & Progress

- **Streaks**: Build up consecutive correct answers
- **Accuracy**: Track your overall success rate
- **Time Tracking**: Optional timing of how long you take to answer
- **Anonymous Play**: Play without logging in (uses session tracking)

## Technical Implementation

### Backend (Node.js/Express + Prisma)

#### Database Models

**GuessReferenceQuestion**
- Stores Bible verse questions
- Fields: verse reference, display text, correct answer, distractor answers, book, difficulty
- Supports easy, medium, and hard difficulty levels

**GuessReferenceAttempt**
- Tracks user attempts and performance
- Links to questions and users (optional)
- Stores: selected answer, correctness, time to answer, game mode, round number

#### API Endpoints

- `GET /api/games/find-reference` - Get random questions
  - Query params: `scope` (book name or "random"), `difficulty`, `limit`

- `POST /api/games/find-reference/attempts` - Submit an answer attempt
  - Body: questionId, selectedAnswer, timeToAnswerMs, gameMode, roundNumber, sessionId

- `GET /api/games/find-reference/stats` - Get user/session statistics
  - Query params: `sessionId`, `gameMode`

- `GET /api/games/find-reference/books` - Get available books for filtering

### Frontend (React)

#### Components

- **FindTheReference.js** - Main game component
  - Manages game state, question loading, answer submission
  - Displays stats, filters, questions, and results

- **FindTheReferencePage.js** - Page wrapper
  - Navigation and page description

#### Features

- Responsive design for mobile and desktop
- Real-time feedback on answers
- Visual indicators for correct/incorrect answers
- Session persistence for anonymous users

### Database Setup

1. **Run Migration**:
   ```bash
   cd server
   npx prisma migrate dev
   ```

2. **Seed Sample Questions**:
   ```bash
   npx ts-node src/scripts/seed-reference-questions.ts
   ```

   This populates the database with 30+ sample questions from popular Bible verses.

### Sample Questions Included

The seed script includes questions from:
- **Genesis**: Creation verses
- **Psalms**: Popular psalms (23, 46, 119)
- **Proverbs**: Wisdom verses
- **Isaiah**: Prophecy and comfort verses
- **Matthew**: Sermon on the Mount
- **John**: Gospel highlights
- **Romans**: Core theological passages
- **Ephesians**: Spiritual armor and grace
- **Philippians**: Joy and strength verses
- **Hebrews**: Faith and perseverance
- **James**: Practical wisdom
- **Jeremiah**: Hope verses
- **1 Corinthians**: Love chapter and more
- **2 Timothy**: Scripture inspiration
- **Galatians**: Fruit of the Spirit

## User Stories Fulfilled

✅ **As a teen**, I want to test whether I know where verses are in the Bible.
- Multiple choice format makes it easy to test knowledge
- Immediate feedback on correct/incorrect answers
- Ability to focus on specific books

✅ **As a leader**, I want a simple guessing game for class.
- Clean, intuitive interface
- No setup required (pre-seeded questions)
- Statistics to track class engagement
- Can be used in group settings

## Usage

### For Players

1. Navigate to **Bible Tools → Find the Reference** from the main menu
2. (Optional) Select a specific book or difficulty level
3. Read the verse text displayed
4. Click on the Bible reference you think is correct
5. Get immediate feedback
6. Click "Next Question" to continue
7. Track your progress with the stats bar at the top

### For Administrators

#### Adding New Questions

Currently, questions are added via the seed script. To add more questions:

1. Edit `/server/src/scripts/seed-reference-questions.ts`
2. Add new question objects to the `sampleQuestions` array:
   ```javascript
   {
     verseReference: 'John 3:16',
     displayText: 'For God so loved the world...',
     correctAnswer: 'John 3:16',
     distractorRefs: ['John 3:17', 'Romans 3:16', '1 John 3:16'],
     book: 'John',
     difficulty: 'easy',
   }
   ```
3. Run the seed script again

#### Best Practices for Creating Questions

- **Distractors**: Choose references that are:
  - Similar chapter/verse numbers (John 3:16 vs John 3:17)
  - Same book, different chapter (John 3:16 vs John 14:6)
  - Different book, same numbers (John 3:16 vs Romans 3:16)

- **Difficulty Levels**:
  - **Easy**: Well-known verses (John 3:16, Psalm 23:1)
  - **Medium**: Familiar but less quoted verses
  - **Hard**: Less common verses or similar to other passages

- **Display Text**: Can be:
  - The exact verse text from NIV
  - A paraphrase for variety
  - Partial verse for harder questions

## Metrics Tracked

The system automatically tracks:
- **Accuracy**: Percentage of correct answers per user/session
- **Scope Popularity**: Which books are played most often
- **Time to Answer**: Average response time (helps identify difficulty)
- **Streaks**: Current and best consecutive correct answers
- **Book Performance**: Success rate by Bible book

## Future Enhancements

Potential features for future development:
- Leader dashboard to view class statistics
- Team competition mode
- Daily challenges
- Achievement badges for milestones
- Integration with reading plans
- Admin UI for adding questions without code
- Verse memorization mode (fill in the blank)
- Audio verse playback
- Social sharing of scores

## File Structure

```
server/
  prisma/
    schema.prisma                          # Database schema with game models
    migrations/
      [timestamp]_add_bible_reference_game/
        migration.sql                      # Database migration
  src/
    controllers/
      find-reference-game.controller.ts   # API logic
    routes/
      find-reference-game.routes.ts       # API routes
    scripts/
      seed-reference-questions.ts         # Seed script for sample data

src/
  components/
    games/
      FindTheReference.js                 # Main game component
      FindTheReference.css                # Game styles
  pages/
    FindTheReferencePage.js               # Game page wrapper
    FindTheReferencePage.css              # Page styles
```

## Installation & Setup

1. **Install dependencies** (if not already done):
   ```bash
   # Backend
   cd server
   npm install

   # Frontend
   cd ..
   npm install
   ```

2. **Set up database**:
   ```bash
   cd server
   npx prisma migrate dev
   ```

3. **Seed questions**:
   ```bash
   npx ts-node src/scripts/seed-reference-questions.ts
   ```

4. **Start the application**:
   ```bash
   # Backend (from server directory)
   npm run dev

   # Frontend (from root directory)
   npm start
   ```

5. **Access the game**:
   - Navigate to http://localhost:3000
   - Click "Find the Reference" in the navigation menu
   - Start playing!

## Support

For issues or questions about the Find the Reference game:
- Check the application logs for API errors
- Ensure the database is properly seeded
- Verify the API endpoints are accessible at http://localhost:3001/api/games/find-reference

## License

This feature is part of the Teen Sunday School application.
