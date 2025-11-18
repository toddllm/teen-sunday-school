import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LessonProvider } from './contexts/LessonContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StreakProvider } from './contexts/StreakContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { MemoryVerseProvider } from './contexts/MemoryVerseContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <TranslationProvider>
        <StreakProvider>
          <MemoryVerseProvider>
            <LessonProvider>
              <App />
            </LessonProvider>
          </MemoryVerseProvider>
        </StreakProvider>
      </TranslationProvider>
    </ThemeProvider>
  </React.StrictMode>
);
