# Teen Sunday School App

An interactive lesson builder and delivery platform for teen Sunday school classes.

## Features

- **Lesson Creator**: Build custom lessons with slides, activities, and discussion questions
- **Bible Integration**: Automatically fetch and display Bible verses
- **Interactive Games**: Word scramble, Hangman, Word Search, and Wordle
- **Bible Project Integration**: Find related Bible Project videos and content
- **Admin Dashboard**: Manage lessons, view analytics, and organize curriculum
- **Dark Mode**: Toggle between light and dark themes
- **Parallel Bible**: View multiple translations side-by-side
- **Gamification**: Streaks, badges, and achievements for engagement
- **Group Discussions**: Create study groups and discuss Bible passages with threaded comments
- **Real-time Notifications**: Get notified about replies and new comments in your groups

## Getting Started

### Installation

```bash
npm install
```

### Firebase Setup (Required for Group Discussions)

The group discussion feature requires Firebase. See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed setup instructions.

Quick setup:
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password and Anonymous)
3. Create a Firestore database
4. Copy your Firebase config to `.env` (see `.env.example`)
5. Deploy the security rules from [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

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

### Future Enhancements (v2)
- AI-powered lesson generation
- Automatic Bible Project content matching
- Smart discussion question generation
- Collaborative lesson planning

## Technologies

- React 18
- React Router v6
- Firebase (Authentication, Firestore)
- Bible API integration
- LocalStorage for lesson data persistence
- Speech Synthesis API for read-aloud features

## New Features Documentation

### Group Discussions & Passage Comments
See [PASSAGE_COMMENTS_FEATURE.md](./PASSAGE_COMMENTS_FEATURE.md) for complete documentation on:
- Creating and managing study groups
- Adding threaded comments to Bible passages
- Real-time notifications
- Permission system (leaders, moderators, members)
- Security and privacy

### Firebase Setup
See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for step-by-step setup instructions including:
- Creating a Firebase project
- Configuring authentication
- Setting up Firestore
- Deploying security rules
- Creating database indexes

## License

MIT
