import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LessonProvider } from './contexts/LessonContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ActivityProvider } from './contexts/ActivityContext';
import { StreakProvider } from './contexts/StreakContext';
import { BadgeProvider } from './contexts/BadgeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LessonProvider>
        <ActivityProvider>
          <StreakProvider>
            <BadgeProvider>
              <App />
            </BadgeProvider>
          </StreakProvider>
        </ActivityProvider>
      </LessonProvider>
    </ThemeProvider>
  </React.StrictMode>
);
