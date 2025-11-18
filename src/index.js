import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LessonProvider } from './contexts/LessonContext';
import { PlanProvider } from './contexts/PlanContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { StreakProvider } from './contexts/StreakContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { ContextCardProvider } from './contexts/ContextCardContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AccessibilityProvider>
        <TranslationProvider>
          <StreakProvider>
            <LessonProvider>
              <PlanProvider>
                <ContextCardProvider>
                  <App />
                </ContextCardProvider>
              </PlanProvider>
            </LessonProvider>
          </StreakProvider>
        </TranslationProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  </React.StrictMode>
);
