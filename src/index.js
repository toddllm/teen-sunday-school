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
import { WeeklyWordProvider } from './contexts/WeeklyWordContext';
import { OnboardingProvider } from './contexts/OnboardingContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AccessibilityProvider>
        <OnboardingProvider>
          <TranslationProvider>
            <StreakProvider>
              <LessonProvider>
                <PlanProvider>
                  <ContextCardProvider>
                    <WeeklyWordProvider>
                      <App />
                    </WeeklyWordProvider>
                  </ContextCardProvider>
                </PlanProvider>
              </LessonProvider>
            </StreakProvider>
          </TranslationProvider>
        </OnboardingProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  </React.StrictMode>
);
