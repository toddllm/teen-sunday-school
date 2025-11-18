import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LessonProvider } from './contexts/LessonContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StreakProvider } from './contexts/StreakContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <StreakProvider>
        <LessonProvider>
          <App />
        </LessonProvider>
      </StreakProvider>
    </ThemeProvider>
  </React.StrictMode>
);
