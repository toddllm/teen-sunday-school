import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LessonProvider } from './contexts/LessonContext';
import { PlanProvider } from './contexts/PlanContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StreakProvider } from './contexts/StreakContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { ContextCardProvider } from './contexts/ContextCardContext';
import { AuthProvider } from './contexts/AuthContext';
import { SessionProvider } from './contexts/SessionContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <TranslationProvider>
        <AuthProvider>
          <StreakProvider>
            <LessonProvider>
              <PlanProvider>
                <SessionProvider>
                  <ContextCardProvider>
                    <App />
                  </ContextCardProvider>
                </SessionProvider>
              </PlanProvider>
            </LessonProvider>
          </StreakProvider>
        </AuthProvider>
      </TranslationProvider>
    </ThemeProvider>
  </React.StrictMode>
);
