import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LessonProvider } from './contexts/LessonContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StreakProvider } from './contexts/StreakContext';
import { VerseOfDayProvider } from './contexts/VerseOfDayContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <StreakProvider>
        <LessonProvider>
          <VerseOfDayProvider>
            <App />
          </VerseOfDayProvider>
        </LessonProvider>
      </StreakProvider>
    </ThemeProvider>
  </React.StrictMode>
);
