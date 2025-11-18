# Bible Character Guessing Game

A "Who am I?" style guessing game where teens learn about Bible characters through progressive hints.

## Overview

The Bible Character Guessing Game provides an engaging way for teens to learn about Bible characters through a progressive hint system. Players receive clues one at a time and must guess the character's identity. The game supports both solo and group modes, making it perfect for warm-ups, review sessions, or casual learning.

## Features

### Solo Mode
- Multiple rounds with scoring
- Progressive hints (1-3 hints per character)
- Point system based on how quickly the character is guessed:
  - 3 points: Guess with 1 hint
  - 2 points: Guess with 2 hints
  - 1 point: Guess with 3 hints
- Character information displayed after guessing
- Tracks which characters have been played to avoid repeats

### Group Mode
- Leader can control hint reveals
- Group can answer aloud or submit guesses in-app
- Perfect for classroom or small group settings
- Same scoring system as solo mode

### Admin Features
- Easy-to-use interface for creating character riddles
- Add character name, hints, difficulty level, description, and scripture references
- Edit or delete existing characters
- Visual preview of all characters in a lesson

### Metrics & Analytics
The game tracks:
- Total plays per character
- Success rates
- Average hints used
- Popular characters
- User game history (when authenticated)

## Installation & Setup

### 1. Database Migration

Run the Prisma migration to add the game metrics tables:

```bash
cd server
npx prisma migrate dev --name add-bible-character-game
```

### 2. Seed Sample Characters

Sample Bible characters are available in `/docs/sample-bible-characters.json`. You can:

**Option A: Copy-Paste via Admin UI**
1. Navigate to a lesson's Games Admin page
2. Copy character data from the JSON file
3. Paste into the character form
4. Repeat for each character

**Option B: Import via API** (future enhancement)
```bash
# Future feature - bulk import endpoint
curl -X POST http://localhost:3001/api/games/character-guess/import \
  -H "Content-Type: application/json" \
  -d @docs/sample-bible-characters.json
```

## Usage

### For Administrators

#### Creating Character Riddles

1. Navigate to **Admin > Lessons**
2. Select a lesson and click **Manage Games**
3. Find the **Bible Character Riddles** section
4. Fill out the form:
   - **Character Name**: Full name of the Bible character
   - **Hints**: At least 2 hints (up to 3 recommended)
   - **Difficulty**: Easy, Medium, or Hard
   - **Description**: Brief bio shown after guessing (optional)
   - **Scripture Reference**: Where to find their story (optional)
5. Click **Add Character**
6. Click **Save Changes** to save to the lesson

#### Editing Characters

1. Click the **Edit** button on any character card
2. Modify the fields
3. Click **Update Character**
4. Click **Save Changes**

### For Users (Teens)

#### Playing Solo Mode

1. Navigate to **Lessons** and select a lesson
2. Click **Games**
3. Select **Guess the Character**
4. Read the first hint and make a guess
5. If incorrect, click **Reveal Next Clue** for more hints
6. Submit your guess in the input field
7. After guessing correctly (or using all attempts), learn about the character
8. Click **Next Character** to continue

#### Playing Group Mode

The game works the same as solo mode, but a leader controls the hint reveals for the whole group.

## API Endpoints

### Submit a Guess Attempt
```http
POST /api/games/character-guess/attempts
Content-Type: application/json

{
  "characterId": "char-1234567890",
  "characterName": "Moses",
  "difficulty": "easy",
  "hintsRevealed": 2,
  "isCorrect": true,
  "attempts": 1,
  "timeSpentMs": 45000,
  "mode": "solo",
  "lessonId": "lesson-123",
  "organizationId": "org-123"
}
```

**Response:**
```json
{
  "data": {
    "id": "attempt-123",
    "characterId": "char-1234567890",
    "isCorrect": true,
    "createdAt": "2025-11-18T10:30:00Z"
  },
  "message": "Attempt recorded successfully"
}
```

### Get Character Metrics
```http
GET /api/games/character-guess/metrics?lessonId=lesson-123
```

**Response:**
```json
{
  "data": [
    {
      "id": "metric-123",
      "characterId": "char-1234567890",
      "characterName": "Moses",
      "totalPlays": 50,
      "totalCorrect": 42,
      "successRate": 84.0,
      "avgHintsUsed": 1.8,
      "popularityScore": 42.0
    }
  ]
}
```

### Get Popular Characters
```http
GET /api/games/character-guess/popular?limit=10
```

**Response:**
```json
{
  "data": [
    {
      "characterName": "Moses",
      "totalPlays": 50,
      "successRate": 84.0,
      "popularityScore": 42.0
    }
  ]
}
```

### Get User Game History (Requires Authentication)
```http
GET /api/games/character-guess/history
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "data": {
    "history": [
      {
        "id": "attempt-123",
        "characterName": "Moses",
        "isCorrect": true,
        "hintsRevealed": 2,
        "createdAt": "2025-11-18T10:30:00Z"
      }
    ],
    "stats": {
      "totalGames": 20,
      "correctGuesses": 18,
      "successRate": 90.0,
      "avgHintsUsed": 1.5
    }
  }
}
```

## Data Structure

### Character Riddle Format

```typescript
interface CharacterRiddle {
  id: string;
  name: string;
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  description?: string;
  scriptureRef?: string;
}
```

### Lesson Storage

Characters are stored in the lesson's JSON field:

```json
{
  "bibleCharacterGames": {
    "characters": [
      {
        "id": "char-1234567890",
        "name": "Moses",
        "hints": [
          "I led God's people out of slavery in Egypt",
          "I received the Ten Commandments on Mount Sinai",
          "I parted the Red Sea with my staff"
        ],
        "difficulty": "easy",
        "description": "Moses was a prophet and lawgiver...",
        "scriptureRef": "Exodus 1-40"
      }
    ]
  }
}
```

## Best Practices

### Creating Good Hints

1. **Start broad, get specific**: First hint should be general, later hints more specific
2. **Avoid giving it away**: Don't use the character's name in hints
3. **Use memorable details**: Focus on well-known stories or characteristics
4. **Mix difficulty**: Include easy, medium, and hard characters for variety
5. **Include context**: Add description and scripture references for learning

### Example Progression

❌ **Poor hints:**
1. "I was in the Bible"
2. "I did something important"
3. "My name starts with M"

✅ **Good hints:**
1. "I led God's people out of slavery in Egypt"
2. "I received the Ten Commandments on Mount Sinai"
3. "I parted the Red Sea with my staff"

## Troubleshooting

### Characters not showing up in the game
- Ensure you clicked **Save Changes** after adding characters
- Check that the lesson is selected correctly
- Verify the lesson ID matches in the URL

### Metrics not tracking
- Check that the API server is running
- Verify database connection in server logs
- Ensure Prisma migrations have been run

### Game performance issues
- Limit character list to 20-30 per lesson for best performance
- Keep hint text concise (1-2 sentences per hint)
- Optimize images if adding character photos in the future

## Future Enhancements

Potential features for future development:

- **Bulk Import**: Import characters from JSON/CSV files
- **Character Images**: Add visual clues alongside text hints
- **Timed Mode**: Add countdown timer for extra challenge
- **Leaderboards**: Show top players across the organization
- **Character Categories**: Filter by Testament, role, or theme
- **Hint Customization**: Allow more than 3 hints per character
- **Audio Hints**: Record voice clues for accessibility
- **Multiplayer**: Real-time competitive mode between teens

## Credits

Sample characters included in this package were created based on commonly known Bible stories and figures. Scripture references are provided for further study.

## License

This feature is part of the Teen Sunday School platform. See the main project LICENSE for details.
