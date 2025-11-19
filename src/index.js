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
import { LexiconProvider } from './contexts/LexiconContext';
import { ThematicJourneyProvider } from './contexts/ThematicJourneyContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { CommentaryProvider } from './contexts/CommentaryContext';
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
import { MapProvider } from './contexts/MapContext';
import { PollProvider } from './contexts/PollContext';
import { SeasonalEventProvider } from './contexts/SeasonalEventContext';
import { TopicProvider } from './contexts/TopicContext';
import { IcebreakerProvider } from './contexts/IcebreakerContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { CharacterProvider } from './contexts/CharacterContext';
import { QuestionBankProvider } from './contexts/QuestionBankContext';
import { FeedbackProvider } from './contexts/FeedbackContext';
import { DevotionalProvider } from './contexts/DevotionalContext';
import { UserProvider } from './contexts/UserContext';
import { CommentProvider } from './contexts/CommentContext';
import { KidsModeProvider } from './contexts/KidsModeContext';
import { KidsContentProvider } from './contexts/KidsContentProvider';
import { ReflectionProvider } from './contexts/ReflectionContext';
import { ABTestProvider } from './contexts/ABTestContext';
import { AuthProvider } from './contexts/AuthContext';
import { ReadingMetricsProvider } from './contexts/ReadingMetricsContext';
import { SeriesProvider } from './contexts/SeriesContext';
import { XPProvider } from './contexts/XPContext';
import { QuizProvider } from './contexts/QuizContext';
import { BugReportProvider } from './contexts/BugReportContext';
import { ScavengerHuntProvider } from './contexts/ScavengerHuntContext';
import { CacheConfigProvider } from './contexts/CacheConfigContext';
import { ServiceProjectProvider } from './contexts/ServiceProjectContext';
import { OutlineProvider } from './contexts/OutlineContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ABTestProvider>
      <OrganizationProvider>
        <AuthProvider>
        <ThemeProvider>
        <ReadingMetricsProvider>
          <AccessibilityProvider>
            <OnboardingProvider>
              <TranslationProvider>
                <XPProvider>
                  <StreakProvider>
              <ChallengeProvider>
                <WarmupProvider>
                  <LessonProvider>
                  <PlanProvider>
                    <SeriesProvider>
                      <QuizProvider>
                        <GoalProvider>
                      <QuestionProvider>
                        <TemplateProvider>
                          <ServiceProjectProvider>
                            <ContextCardProvider>
                          <WeeklyWordProvider>
                          <ReadAloudProvider>
                            <BigStoryProvider>
                              <MapProvider>
                                <PollProvider>
                                  <SeasonalEventProvider>
                                    <TopicProvider>
                                      <IcebreakerProvider>
                                        <ProfileProvider>
                                          <CharacterProvider>
                                            <QuestionBankProvider>
                                              <SessionProvider>
                                                <BugReportProvider>
                                                  <ScavengerHuntProvider>
                                                    <CacheConfigProvider>
                                                      <OutlineProvider>
                                                        <LexiconProvider>
                                                          <ThematicJourneyProvider>
                                                            <CommentaryProvider>
                                                              <FeedbackProvider>
                                                                <DevotionalProvider>
                                                                  <UserProvider>
                                                                    <CommentProvider>
                                                                      <KidsModeProvider>
                                                                        <KidsContentProvider>
                                                                          <ReflectionProvider>
                                                                            <App />
                                                                          </ReflectionProvider>
                                                                        </KidsContentProvider>
                                                                      </KidsModeProvider>
                                                                    </CommentProvider>
                                                                  </UserProvider>
                                                                </DevotionalProvider>
                                                              </FeedbackProvider>
                                                            </CommentaryProvider>
                                                          </ThematicJourneyProvider>
                                                        </LexiconProvider>
                                                      </OutlineProvider>
                                                    </CacheConfigProvider>
                                                  </ScavengerHuntProvider>
                                                </BugReportProvider>
                                              </SessionProvider>
                                            </QuestionBankProvider>
                                          </CharacterProvider>
                                        </ProfileProvider>
                                      </IcebreakerProvider>
                                    </TopicProvider>
                                  </SeasonalEventProvider>
                                </PollProvider>
                              </MapProvider>
                            </BigStoryProvider>
                          </ReadAloudProvider>
                          </WeeklyWordProvider>
                          </ContextCardProvider>
                          </ServiceProjectProvider>
                        </TemplateProvider>
                      </QuestionProvider>
                        </GoalProvider>
                      </QuizProvider>
                    </SeriesProvider>
                  </PlanProvider>
                  </LessonProvider>
                </WarmupProvider>
              </ChallengeProvider>
                  </StreakProvider>
                </XPProvider>
              </TranslationProvider>
            </OnboardingProvider>
          </AccessibilityProvider>
        </ReadingMetricsProvider>
      </ThemeProvider>
        </AuthProvider>
      </OrganizationProvider>
    </ABTestProvider>
  </React.StrictMode>
);

// Register service worker for offline functionality
serviceWorkerRegistration.register({
  onSuccess: () => console.log('Service Worker registered successfully'),
  onUpdate: (registration) => {
    console.log('New content is available; please refresh.');
    // Optionally show a notification to the user
  },
});
