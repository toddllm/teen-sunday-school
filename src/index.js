import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LessonProvider } from './contexts/LessonContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StreakProvider } from './contexts/StreakContext';
import { BookmarkProvider } from './contexts/BookmarkContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <StreakProvider>
        <BookmarkProvider>
          <LessonProvider>
            <App />
          </LessonProvider>
        </BookmarkProvider>
      </StreakProvider>
    </ThemeProvider>
  </React.StrictMode>
);
