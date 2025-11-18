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
import { ReadAloudProvider } from './contexts/ReadAloudContext';
import { WarmupProvider } from './contexts/WarmupContext';
import { BigStoryProvider } from './contexts/BigStoryContext';
import { GoalProvider } from './contexts/GoalContext';
import { QuestionProvider } from './contexts/QuestionContext';
import { TemplateProvider } from './contexts/TemplateContext';
import { SessionProvider } from './contexts/SessionContext';
import { ChallengeProvider } from './contexts/ChallengeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AccessibilityProvider>
        <OnboardingProvider>
          <TranslationProvider>
            <StreakProvider>
              <ChallengeProvider>
                <WarmupProvider>
                  <LessonProvider>
                  <PlanProvider>
                    <GoalProvider>
                      <QuestionProvider>
                        <TemplateProvider>
                          <ContextCardProvider>
                          <WeeklyWordProvider>
                          <ReadAloudProvider>
                            <BigStoryProvider>
                              <SessionProvider>
                                <App />
                              </SessionProvider>
                            </BigStoryProvider>
                          </ReadAloudProvider>
                          </WeeklyWordProvider>
                          </ContextCardProvider>
                        </TemplateProvider>
                      </QuestionProvider>
                    </GoalProvider>
                  </PlanProvider>
                  </LessonProvider>
                </WarmupProvider>
              </ChallengeProvider>
            </StreakProvider>
          </TranslationProvider>
        </OnboardingProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  </React.StrictMode>
);
