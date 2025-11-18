import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LessonProvider } from './contexts/LessonContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StreakProvider } from './contexts/StreakContext';
import { AudioProvider } from './contexts/AudioContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <StreakProvider>
        <AudioProvider>
          <LessonProvider>
            <App />
          </LessonProvider>
        </AudioProvider>
      </StreakProvider>
    </ThemeProvider>
  </React.StrictMode>
);
