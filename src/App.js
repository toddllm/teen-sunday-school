import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import TodayPage from './pages/TodayPage';
import BadgesPage from './pages/BadgesPage';
import StreakProtectionPage from './pages/StreakProtectionPage';
import LessonsPage from './pages/LessonsPage';
import LessonViewPage from './pages/LessonViewPage';
import PresenterViewPage from './pages/PresenterViewPage';
import AdminPage from './pages/AdminPage';
import LessonCreatorPage from './pages/LessonCreatorPage';
import ModerationPage from './pages/ModerationPage';
import GamesPage from './pages/GamesPage';
import GamesAdminPage from './pages/GamesAdminPage';
import ExperimentAdminPage from './pages/ExperimentAdminPage';
import ExperimentResultsPage from './pages/ExperimentResultsPage';
import FeedbackFormPage from './pages/FeedbackFormPage';
import FeedbackAdminPage from './pages/FeedbackAdminPage';
import TranslationAdminPage from './pages/TranslationAdminPage';
import PlansAdminPage from './pages/PlansAdminPage';
import PlanCreatorPage from './pages/PlanCreatorPage';
import PlanPreviewPage from './pages/PlanPreviewPage';
import TemplatesAdminPage from './pages/TemplatesAdminPage';
import TemplateEditorPage from './pages/TemplateEditorPage';
import BibleToolPage from './pages/BibleToolPage';
import BibleQAPage from './pages/BibleQAPage';
import BibleReadPage from './pages/BibleReadPage';
import ParallelBiblePage from './pages/ParallelBiblePage';
import SettingsPage from './pages/SettingsPage';
import SearchPage from './pages/SearchPage';
import JournalPage from './pages/JournalPage';
import TranslationSettingsPage from './pages/TranslationSettingsPage';
import TodayDevotionalPage from './pages/TodayDevotionalPage';
import DevotionalAdminPage from './pages/DevotionalAdminPage';
import DevotionalEditorPage from './pages/DevotionalEditorPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import OrganizationSettingsPage from './pages/OrganizationSettingsPage';
import AccessibilitySettingsPage from './pages/AccessibilitySettingsPage';
import ReadingMetricsSettingsPage from './pages/ReadingMetricsSettingsPage';
import QuoteImageGeneratorPage from './pages/QuoteImageGeneratorPage';
import OriginalLanguagePage from './pages/OriginalLanguagePage';
import ThematicJourneysPage from './pages/ThematicJourneysPage';
import JourneyDetailPage from './pages/JourneyDetailPage';
import MemeGeneratorPage from './pages/MemeGeneratorPage';
import ScriptureJournalingPage from './pages/ScriptureJournalingPage';
import AIFiltersAdminPage from './pages/AIFiltersAdminPage';
import ComparativeThemeViewPage from './pages/ComparativeThemeViewPage';
import MiraclesExplorerPage from './pages/MiraclesExplorerPage';
import WeeklyWordArchivePage from './pages/WeeklyWordArchivePage';
import WeeklyWordAdminPage from './pages/WeeklyWordAdminPage';
import FindTheReferencePage from './pages/FindTheReferencePage';
import OnboardingPage from './pages/OnboardingPage';
import { useOnboarding } from './contexts/OnboardingContext';
import { EngagementAnalyticsProvider } from './contexts/EngagementAnalyticsContext';
import DailyGratitudeLogPage from './pages/DailyGratitudeLogPage';
import WarmupAdminPage from './pages/WarmupAdminPage';
import PreClassWarmupPage from './pages/PreClassWarmupPage';
import SubstituteDashboardPage from './pages/SubstituteDashboardPage';
import ParablesExplorerPage from './pages/ParablesExplorerPage';
import TranslationComparisonPage from './pages/TranslationComparisonPage';
import DoctrineOverviewPage from './pages/DoctrineOverviewPage';
import BigStoryPage from './pages/BigStoryPage';
import GoalsPage from './pages/GoalsPage';
import CurriculumCoverageReportPage from './pages/CurriculumCoverageReportPage';
import SignupAnalyticsPage from './pages/SignupAnalyticsPage';
import ComicGeneratorPage from './pages/ComicGeneratorPage';
import IncidentReportingPage from './pages/IncidentReportingPage';
import TimelinePage from './pages/TimelinePage';
import ChronologicalPlanPage from './pages/ChronologicalPlanPage';
import QuestionsAdminPage from './pages/QuestionsAdminPage';
import QuestionBoxPage from './pages/QuestionBoxPage';
import CurriculumCalendarPage from './pages/CurriculumCalendarPage';
import JoinSessionPage from './pages/JoinSessionPage';
import StudentSessionView from './pages/StudentSessionView';
import ChallengesPage from './pages/ChallengesPage';
import ChallengesAdminPage from './pages/ChallengesAdminPage';
import BibleMapPage from './pages/BibleMapPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import SeasonalEventsAdminPage from './pages/SeasonalEventsAdminPage';
import EventCreatorPage from './pages/EventCreatorPage';
import TopicsPage from './pages/TopicsPage';
import TopicDetailPage from './pages/TopicDetailPage';
import TopicsAdminPage from './pages/TopicsAdminPage';
import IcebreakerAdminPage from './pages/IcebreakerAdminPage';
import IcebreakerCreatorPage from './pages/IcebreakerCreatorPage';
import IcebreakerViewPage from './pages/IcebreakerViewPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import CharacterIndexPage from './pages/CharacterIndexPage';
import QuestionBankPage from './pages/QuestionBankPage';
import BulkImportPage from './pages/BulkImportPage';
import ImportMonitorPage from './pages/ImportMonitorPage';
import SeriesBrowsePage from './pages/SeriesBrowsePage';
import SeriesViewPage from './pages/SeriesViewPage';
import SeriesAdminPage from './pages/SeriesAdminPage';
import SeriesEditorPage from './pages/SeriesEditorPage';
import ParentOverviewPage from './pages/ParentOverviewPage';
import QuizAdminPage from './pages/QuizAdminPage';
import QuizTakePage from './pages/QuizTakePage';
import QuizResultsPage from './pages/QuizResultsPage';
import BugReportPage from './pages/BugReportPage';
import AdminBugReportsPage from './pages/AdminBugReportsPage';
import CohortProgressTrackingPage from './pages/CohortProgressTrackingPage';
import ProverbsAdminPage from './pages/ProverbsAdminPage';
import AIPassageSummaryPage from './pages/AIPassageSummaryPage';
import SermonIllustrationPage from './pages/SermonIllustrationPage';
import ScavengerHuntPage from './pages/ScavengerHuntPage';
import ScavengerHuntAdminPage from './pages/ScavengerHuntAdminPage';
import SubmissionGalleryPage from './pages/SubmissionGalleryPage';
import CacheConfigAdminPage from './pages/CacheConfigAdminPage';
import ErrorDashboardPage from './pages/ErrorDashboardPage';
import ServiceProjectsAdminPage from './pages/ServiceProjectsAdminPage';
import ProjectCreatorPage from './pages/ProjectCreatorPage';
import ProjectPreviewPage from './pages/ProjectPreviewPage';
import SermonOutlinePage from './pages/SermonOutlinePage';
import KidsHomePage from './pages/KidsHomePage';
import KidsStoryViewPage from './pages/KidsStoryViewPage';
import KidsAllStoriesPage from './pages/KidsAllStoriesPage';
import KidsSongsPage from './pages/KidsSongsPage';
import KidsFavoritesPage from './pages/KidsFavoritesPage';
import KidsProgressPage from './pages/KidsProgressPage';
import KidsModeSettingsPage from './pages/KidsModeSettingsPage';
import ReflectionPage from './pages/ReflectionPage';
import ReadingPreferencesPage from './pages/ReadingPreferencesPage';
import MemoryVersesPage from './pages/MemoryVersesPage';
import ReviewSessionPage from './pages/ReviewSessionPage';
import ProgressPage from './pages/ProgressPage';
import BookProgressDetail from './pages/BookProgressDetail';
import PrayerListPage from './pages/PrayerListPage';
import './App.css';

// Component to handle onboarding check and navigation visibility
function AppContent() {
  const { isOnboardingComplete } = useOnboarding();
  const location = useLocation();
  const isOnboardingRoute = location.pathname === '/onboarding';

  // Show navigation only if onboarding is complete or user is on onboarding page
  const showNavigation = isOnboardingComplete || isOnboardingRoute;

  // Redirect to onboarding if not complete and not already there
  if (!isOnboardingComplete && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <EngagementAnalyticsProvider>
      <div className="App">
        {showNavigation && <Navigation />}
        <main className="main-content">
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/gratitude" element={<DailyGratitudeLogPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/streak-protection" element={<StreakProtectionPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/lesson/:id" element={<LessonViewPage />} />
            <Route path="/presenter/:id" element={<PresenterViewPage />} />
            <Route path="/devotionals" element={<TodayDevotionalPage />} />
            <Route path="/devotional/:id" element={<TodayDevotionalPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/create" element={<LessonCreatorPage />} />
            <Route path="/admin/edit/:id" element={<LessonCreatorPage />} />
            <Route path="/admin/games/:lessonId" element={<GamesAdminPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/branding" element={<OrganizationSettingsPage />} />
            <Route path="/admin/translations" element={<TranslationAdminPage />} />
            <Route path="/admin/feedback" element={<FeedbackAdminPage />} />
            <Route path="/admin/moderation" element={<ModerationPage />} />
            <Route path="/admin/templates" element={<TemplatesAdminPage />} />
            <Route path="/admin/templates/create" element={<TemplateEditorPage />} />
            <Route path="/admin/templates/edit/:id" element={<TemplateEditorPage />} />
            <Route path="/admin/plans" element={<PlansAdminPage />} />
            <Route path="/admin/plan/create" element={<PlanCreatorPage />} />
            <Route path="/admin/plan/edit/:id" element={<PlanCreatorPage />} />
            <Route path="/admin/plan/preview/:id" element={<PlanPreviewPage />} />
            <Route path="/admin/devotionals" element={<DevotionalAdminPage />} />
            <Route path="/admin/devotionals/create" element={<DevotionalEditorPage />} />
            <Route path="/admin/devotionals/edit/:id" element={<DevotionalEditorPage />} />
            <Route path="/admin/experiments" element={<ExperimentAdminPage />} />
            <Route path="/admin/experiments/:experimentId/results" element={<ExperimentResultsPage />} />
            <Route path="/admin/ai-filters" element={<AIFiltersAdminPage />} />
            <Route path="/admin/weekly-word" element={<WeeklyWordAdminPage />} />
            <Route path="/admin/warmup" element={<WarmupAdminPage />} />
            <Route path="/admin/curriculum-coverage" element={<CurriculumCoverageReportPage />} />
            <Route path="/admin/signup-analytics" element={<SignupAnalyticsPage />} />
            <Route path="/admin/incidents" element={<IncidentReportingPage />} />
            <Route path="/admin/questions" element={<QuestionsAdminPage />} />
            <Route path="/admin/calendar" element={<CurriculumCalendarPage />} />
            <Route path="/admin/challenges" element={<ChallengesAdminPage />} />
            <Route path="/admin/events" element={<SeasonalEventsAdminPage />} />
            <Route path="/admin/events/create" element={<EventCreatorPage />} />
            <Route path="/admin/events/edit/:id" element={<EventCreatorPage />} />
            <Route path="/admin/topics" element={<TopicsAdminPage />} />
            <Route path="/admin/icebreakers" element={<IcebreakerAdminPage />} />
            <Route path="/admin/icebreaker/create" element={<IcebreakerCreatorPage />} />
            <Route path="/admin/icebreaker/edit/:id" element={<IcebreakerCreatorPage />} />
            <Route path="/admin/bulk-import" element={<BulkImportPage />} />
            <Route path="/admin/imports" element={<ImportMonitorPage />} />
            <Route path="/admin/imports/:jobId" element={<ImportMonitorPage />} />
            <Route path="/admin/series" element={<SeriesAdminPage />} />
            <Route path="/admin/series/create" element={<SeriesEditorPage />} />
            <Route path="/admin/series/edit/:id" element={<SeriesEditorPage />} />
            <Route path="/admin/quiz/create/:lessonId" element={<QuizAdminPage />} />
            <Route path="/admin/quiz/edit/:lessonId/:quizId" element={<QuizAdminPage />} />
            <Route path="/admin/bug-reports" element={<AdminBugReportsPage />} />
            <Route path="/admin/cohort-progress" element={<CohortProgressTrackingPage />} />
            <Route path="/admin/proverbs" element={<ProverbsAdminPage />} />
            <Route path="/admin/scavenger-hunt" element={<ScavengerHuntAdminPage />} />
            <Route path="/admin/scavenger-hunt/:huntId/submissions" element={<SubmissionGalleryPage />} />
            <Route path="/admin/cache-config" element={<CacheConfigAdminPage />} />
            <Route path="/admin/errors" element={<ErrorDashboardPage />} />
            <Route path="/admin/service-projects" element={<ServiceProjectsAdminPage />} />
            <Route path="/admin/service-project/create" element={<ProjectCreatorPage />} />
            <Route path="/admin/service-project/edit/:id" element={<ProjectCreatorPage />} />
            <Route path="/admin/service-project/preview/:id" element={<ProjectPreviewPage />} />
            <Route path="/weekly-word/archive" element={<WeeklyWordArchivePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/topics/:id" element={<TopicDetailPage />} />
            <Route path="/icebreaker/:id" element={<IcebreakerViewPage />} />
            <Route path="/series" element={<SeriesBrowsePage />} />
            <Route path="/series/:id" element={<SeriesViewPage />} />
            <Route path="/quiz/:quizId" element={<QuizTakePage />} />
            <Route path="/quiz/:quizId/results" element={<QuizResultsPage />} />
            <Route path="/bug-report" element={<BugReportPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/scavenger-hunt" element={<ScavengerHuntPage />} />
            <Route path="/scavenger-hunt/:huntId" element={<ScavengerHuntPage />} />
            <Route path="/sermon-illustrations" element={<SermonIllustrationPage />} />
            <Route path="/questions" element={<QuestionBoxPage />} />
            <Route path="/join-session" element={<JoinSessionPage />} />
            <Route path="/session/student" element={<StudentSessionView />} />
            <Route path="/warmup/present" element={<PreClassWarmupPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/games/:lessonId" element={<GamesPage />} />
            <Route path="/bible" element={<BibleToolPage />} />
            <Route path="/bible/qa" element={<BibleQAPage />} />
            <Route path="/bible/read" element={<BibleReadPage />} />
            <Route path="/bible/parallel" element={<ParallelBiblePage />} />
            <Route path="/bible/miracles" element={<MiraclesExplorerPage />} />
            <Route path="/bible/themes" element={<ComparativeThemeViewPage />} />
            <Route path="/bible/parables" element={<ParablesExplorerPage />} />
            <Route path="/bible/doctrine" element={<DoctrineOverviewPage />} />
            <Route path="/bible/big-story" element={<BigStoryPage />} />
            <Route path="/bible/quote-generator" element={<QuoteImageGeneratorPage />} />
            <Route path="/bible/meme-generator" element={<MemeGeneratorPage />} />
            <Route path="/bible/find-reference" element={<FindTheReferencePage />} />
            <Route path="/bible/journaling" element={<ScriptureJournalingPage />} />
            <Route path="/bible/original-language" element={<OriginalLanguagePage />} />
            <Route path="/bible/comic-generator" element={<ComicGeneratorPage />} />
            <Route path="/bible/timeline" element={<TimelinePage />} />
            <Route path="/bible/chronological-plan" element={<ChronologicalPlanPage />} />
            <Route path="/bible/maps" element={<BibleMapPage />} />
            <Route path="/bible/ai-summary" element={<AIPassageSummaryPage />} />
            <Route path="/bible/sermon-outline" element={<SermonOutlinePage />} />
            <Route path="/characters" element={<CharacterIndexPage />} />
            <Route path="/question-bank" element={<QuestionBankPage />} />
            <Route path="/translation-comparisons" element={<TranslationComparisonPage />} />
            <Route path="/translation-comparisons/:noteId" element={<TranslationComparisonPage />} />
            <Route path="/journeys" element={<ThematicJourneysPage />} />
            <Route path="/journeys/:journeyId" element={<JourneyDetailPage />} />
            <Route path="/feedback" element={<FeedbackFormPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/translations" element={<TranslationSettingsPage />} />
            <Route path="/settings/accessibility" element={<AccessibilitySettingsPage />} />
            <Route path="/settings/reading-metrics" element={<ReadingMetricsSettingsPage />} />
            <Route path="/settings/profile" element={<ProfileSettingsPage />} />
            <Route path="/parent" element={<ParentOverviewPage />} />
            <Route path="/substitute" element={<SubstituteDashboardPage />} />
            <Route path="/kids" element={<KidsHomePage />} />
            <Route path="/kids/story/:id" element={<KidsStoryViewPage />} />
            <Route path="/kids/all-stories" element={<KidsAllStoriesPage />} />
            <Route path="/kids/songs" element={<KidsSongsPage />} />
            <Route path="/kids/favorites" element={<KidsFavoritesPage />} />
            <Route path="/kids/progress" element={<KidsProgressPage />} />
            <Route path="/kids/settings" element={<KidsModeSettingsPage />} />
            <Route path="/reflections" element={<ReflectionPage />} />
            <Route path="/settings/reading" element={<ReadingPreferencesPage />} />
            <Route path="/memory-verses" element={<MemoryVersesPage />} />
            <Route path="/memory-verses/review" element={<ReviewSessionPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/progress/:bookName" element={<BookProgressDetail />} />
            <Route path="/prayer" element={<PrayerListPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
      </main>
    </div>
    </EngagementAnalyticsProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
