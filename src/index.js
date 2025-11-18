import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LessonProvider } from './contexts/LessonContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StreakProvider } from './contexts/StreakContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { SermonNotesProvider } from './contexts/SermonNotesContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <TranslationProvider>
        <StreakProvider>
          <LessonProvider>
            <SermonNotesProvider>
              <App />
            </SermonNotesProvider>
          </LessonProvider>
        </StreakProvider>
      </TranslationProvider>
    </ThemeProvider>
  </React.StrictMode>
);
