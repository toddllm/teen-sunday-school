import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LessonProvider } from './contexts/LessonContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StreakProvider } from './contexts/StreakContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { AuthProvider } from './contexts/AuthContext';
import { GroupProvider } from './contexts/GroupContext';
import { PassageCommentProvider } from './contexts/PassageCommentContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <GroupProvider>
          <PassageCommentProvider>
            <TranslationProvider>
              <StreakProvider>
                <LessonProvider>
                  <App />
                </LessonProvider>
              </StreakProvider>
            </TranslationProvider>
          </PassageCommentProvider>
        </GroupProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
