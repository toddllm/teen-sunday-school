import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LessonProvider } from './contexts/LessonContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StreakProvider } from './contexts/StreakContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { UserProvider } from './contexts/UserContext';
import { SmallGroupProvider } from './contexts/SmallGroupContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <TranslationProvider>
        <UserProvider>
          <StreakProvider>
            <LessonProvider>
              <SmallGroupProvider>
                <App />
              </SmallGroupProvider>
            </LessonProvider>
          </StreakProvider>
        </UserProvider>
      </TranslationProvider>
    </ThemeProvider>
  </React.StrictMode>
);
