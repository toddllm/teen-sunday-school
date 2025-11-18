# Teen Sunday School App

An interactive lesson builder and delivery platform for teen Sunday school classes.

## Features

- **Lesson Creator**: Build custom lessons with slides, activities, and discussion questions
- **Bible Integration**: Automatically fetch and display Bible verses
- **Interactive Games**: Word scramble, Hangman, and Word Search
- **Bible Project Integration**: Find related Bible Project videos and content
- **Admin Dashboard**: Manage lessons, view analytics, and organize curriculum

## Getting Started

```bash
npm install
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

### Future Enhancements (v2)
- AI-powered lesson generation
- Automatic Bible Project content matching
- Smart discussion question generation
- Collaborative lesson planning

## Technologies

- React 18
- React Router v6
- Bible API integration
- LocalStorage for data persistence
- Speech Synthesis API for read-aloud features

## License

MIT
