# Teen Sunday School App

An interactive lesson builder and delivery platform for teen Sunday school classes.

## Features

- **Lesson Creator**: Build custom lessons with slides, activities, and discussion questions
- **Bible Integration**: Automatically fetch and display Bible verses
- **Bible Q&A (NEW)**: Ask natural language questions about the Bible and get AI-powered answers with scripture references
- **Interactive Games**: Wordle, Word Scramble, Hangman, and Word Search
- **Gamification**: Streaks, badges, and activity tracking to keep students engaged
- **Dark Mode**: Full dark mode support with theme toggle
- **Admin Dashboard**: Manage lessons, view analytics, and organize curriculum

## Getting Started

### Installation

```bash
npm install
```

### API Configuration

To use the Bible Q&A feature and Bible verse lookup, you'll need to configure API keys:

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Get your API keys:
   - **Bible API**: Get a free API key from [https://scripture.api.bible](https://scripture.api.bible)
   - **OpenAI API**: Get an API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

3. Add your API keys to the `.env` file:
```
REACT_APP_BIBLE_API_KEY=your_bible_api_key_here
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: The Bible Q&A feature requires an OpenAI API key. Without it, you'll see a configuration error when trying to ask questions. All other features will continue to work.

### Running the App

```bash
npm start
```

The app will run on http://localhost:3013

## Project Structure

```
teen-sunday-school/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API services (Bible, Bible Project)
│   ├── data/           # Data storage and management
│   ├── utils/          # Utility functions
│   └── contexts/       # React contexts for state management
├── public/             # Static assets
└── package.json
```

## Core Concepts

### Lessons
Each lesson contains:
- Metadata (title, scripture, theme)
- Slides with content and teaching notes
- Discussion questions
- Word games configuration
- Bible verses

### Admin Features
- Create/Edit/Delete lessons
- Import lessons from templates
- Export lessons for sharing
- Manage curriculum organization

### Bible Q&A Feature

The Bible Q&A feature uses AI to help students explore scripture through natural language questions.

**How it works:**
1. Students type a question in natural language (e.g., "Where does the Bible talk about forgiveness?")
2. The AI analyzes the question and searches for relevant Bible passages
3. Returns a concise answer with:
   - Summary explanation
   - 2-5 relevant scripture references with context
   - Related themes
   - Suggested follow-up questions

**Key Features:**
- **Question History**: All questions and answers are saved locally for review
- **Rating System**: Students can rate answers with thumbs up/down
- **Analytics**: Track which topics are being explored most
- **Reference Linking**: Click on any verse reference to view the full text
- **Follow-up Questions**: AI suggests related questions to deepen study
- **Safety Disclaimer**: Clearly labeled as AI assistance, not pastoral counsel

**Usage Tips:**
- Ask specific questions for more focused answers
- Use the example questions to get started
- Review your question history to track your Bible study journey
- Share interesting Q&As with your study group

### Future Enhancements (v2)
- AI-powered lesson generation
- Automatic Bible Project content matching
- Smart discussion question generation
- Collaborative lesson planning

## Technologies

- React 18
- React Router v6
- OpenAI API (GPT-4) for Bible Q&A
- Bible API integration for scripture lookup
- LocalStorage for data persistence
- Speech Synthesis API for read-aloud features
- AWS S3 + CloudFront for deployment

## License

MIT
