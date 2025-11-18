import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LessonProvider } from './contexts/LessonContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StreakProvider } from './contexts/StreakContext';
import { CollectionsProvider } from './contexts/CollectionsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <StreakProvider>
        <LessonProvider>
          <CollectionsProvider>
            <App />
          </CollectionsProvider>
        </LessonProvider>
      </StreakProvider>
    </ThemeProvider>
  </React.StrictMode>
);
