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
import GamesPage from './pages/GamesPage';
import GamesAdminPage from './pages/GamesAdminPage';
import PlansAdminPage from './pages/PlansAdminPage';
import PlanCreatorPage from './pages/PlanCreatorPage';
import PlanPreviewPage from './pages/PlanPreviewPage';
import TemplatesAdminPage from './pages/TemplatesAdminPage';
import TemplateEditorPage from './pages/TemplateEditorPage';
import BibleToolPage from './pages/BibleToolPage';
import ParallelBiblePage from './pages/ParallelBiblePage';
import TranslationSettingsPage from './pages/TranslationSettingsPage';
import AccessibilitySettingsPage from './pages/AccessibilitySettingsPage';
import ReadingMetricsSettingsPage from './pages/ReadingMetricsSettingsPage';
import QuoteImageGeneratorPage from './pages/QuoteImageGeneratorPage';
import OriginalLanguagePage from './pages/OriginalLanguagePage';
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
import CharactersPage from './pages/CharactersPage';
import CharacterDetailPage from './pages/CharacterDetailPage';
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
    <div className="App">
      {showNavigation && <Navigation />}
      <main className="main-content">
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/lesson/:id" element={<LessonViewPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/create" element={<LessonCreatorPage />} />
          <Route path="/admin/edit/:id" element={<LessonCreatorPage />} />
          <Route path="/admin/games/:lessonId" element={<GamesAdminPage />} />
          <Route path="/admin/plans" element={<PlansAdminPage />} />
          <Route path="/admin/plan/create" element={<PlanCreatorPage />} />
          <Route path="/admin/plan/edit/:id" element={<PlanCreatorPage />} />
          <Route path="/admin/plan/preview/:id" element={<PlanPreviewPage />} />
          <Route path="/admin/ai-filters" element={<AIFiltersAdminPage />} />
          <Route path="/games/:lessonId" element={<GamesPage />} />
          <Route path="/bible" element={<BibleToolPage />} />
          <Route path="/bible/parallel" element={<ParallelBiblePage />} />
          <Route path="/bible/themes" element={<ComparativeThemeViewPage />} />
          <Route path="/bible/quote-generator" element={<QuoteImageGeneratorPage />} />
          <Route path="/bible/original-language" element={<OriginalLanguagePage />} />
          <Route path="/settings/translations" element={<TranslationSettingsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/gratitude" element={<DailyGratitudeLogPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/streak-protection" element={<StreakProtectionPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/lesson/:id" element={<LessonViewPage />} />
            <Route path="/presenter/:id" element={<PresenterViewPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/create" element={<LessonCreatorPage />} />
            <Route path="/admin/edit/:id" element={<LessonCreatorPage />} />
            <Route path="/admin/games/:lessonId" element={<GamesAdminPage />} />
            <Route path="/admin/templates" element={<TemplatesAdminPage />} />
            <Route path="/admin/templates/create" element={<TemplateEditorPage />} />
            <Route path="/admin/templates/edit/:id" element={<TemplateEditorPage />} />
            <Route path="/admin/plans" element={<PlansAdminPage />} />
            <Route path="/admin/plan/create" element={<PlanCreatorPage />} />
            <Route path="/admin/plan/edit/:id" element={<PlanCreatorPage />} />
            <Route path="/admin/plan/preview/:id" element={<PlanPreviewPage />} />
            <Route path="/admin/ai-filters" element={<AIFiltersAdminPage />} />
            <Route path="/admin/weekly-word" element={<WeeklyWordAdminPage />} />
            <Route path="/weekly-word/archive" element={<WeeklyWordArchivePage />} />
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
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/topics/:id" element={<TopicDetailPage />} />
            <Route path="/admin/topics" element={<TopicsAdminPage />} />
            <Route path="/admin/icebreakers" element={<IcebreakerAdminPage />} />
            <Route path="/admin/icebreaker/create" element={<IcebreakerCreatorPage />} />
            <Route path="/admin/icebreaker/edit/:id" element={<IcebreakerCreatorPage />} />
            <Route path="/icebreaker/:id" element={<IcebreakerViewPage />} />
            <Route path="/admin/bulk-import" element={<BulkImportPage />} />
            <Route path="/admin/imports" element={<ImportMonitorPage />} />
            <Route path="/admin/imports/:jobId" element={<ImportMonitorPage />} />
            <Route path="/admin/series" element={<SeriesAdminPage />} />
            <Route path="/admin/series/create" element={<SeriesEditorPage />} />
            <Route path="/admin/series/edit/:id" element={<SeriesEditorPage />} />
            <Route path="/series" element={<SeriesBrowsePage />} />
            <Route path="/series/:id" element={<SeriesViewPage />} />
            <Route path="/admin/quiz/create/:lessonId" element={<QuizAdminPage />} />
            <Route path="/admin/quiz/edit/:lessonId/:quizId" element={<QuizAdminPage />} />
            <Route path="/quiz/:quizId" element={<QuizTakePage />} />
            <Route path="/quiz/:quizId/results" element={<QuizResultsPage />} />
            <Route path="/admin/bug-reports" element={<AdminBugReportsPage />} />
            <Route path="/bug-report" element={<BugReportPage />} />
            <Route path="/admin/cohort-progress" element={<CohortProgressTrackingPage />} />
            <Route path="/admin/proverbs" element={<ProverbsAdminPage />} />
            <Route path="/sermon-illustrations" element={<SermonIllustrationPage />} />
            <Route path="/admin/scavenger-hunt" element={<ScavengerHuntAdminPage />} />
            <Route path="/admin/cache-config" element={<CacheConfigAdminPage />} />
            <Route path="/admin/errors" element={<ErrorDashboardPage />} />
            <Route path="/admin/service-projects" element={<ServiceProjectsAdminPage />} />
            <Route path="/admin/service-project/create" element={<ProjectCreatorPage />} />
            <Route path="/admin/service-project/edit/:id" element={<ProjectCreatorPage />} />
            <Route path="/admin/service-project/preview/:id" element={<ProjectPreviewPage />} />
            <Route path="/admin/scavenger-hunt/:huntId/submissions" element={<SubmissionGalleryPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/scavenger-hunt" element={<ScavengerHuntPage />} />
            <Route path="/scavenger-hunt/:huntId" element={<ScavengerHuntPage />} />
            <Route path="/questions" element={<QuestionBoxPage />} />
            <Route path="/join-session" element={<JoinSessionPage />} />
            <Route path="/session/student" element={<StudentSessionView />} />
            <Route path="/games/:lessonId" element={<GamesPage />} />
            <Route path="/warmup/present" element={<PreClassWarmupPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/bible" element={<BibleToolPage />} />
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
            <Route path="/bible/comic-generator" element={<ComicGeneratorPage />} />
            <Route path="/bible/timeline" element={<TimelinePage />} />
            <Route path="/bible/chronological-plan" element={<ChronologicalPlanPage />} />
            <Route path="/bible/maps" element={<BibleMapPage />} />
            <Route path="/bible/ai-summary" element={<AIPassageSummaryPage />} />
            <Route path="/bible/sermon-outline" element={<SermonOutlinePage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/characters/:id" element={<CharacterDetailPage />} />
            <Route path="/question-bank" element={<QuestionBankPage />} />
            <Route path="/translation-comparisons" element={<TranslationComparisonPage />} />
            <Route path="/translation-comparisons/:noteId" element={<TranslationComparisonPage />} />
            <Route path="/settings/translations" element={<TranslationSettingsPage />} />
            <Route path="/settings/accessibility" element={<AccessibilitySettingsPage />} />
            <Route path="/settings/reading-metrics" element={<ReadingMetricsSettingsPage />} />
            <Route path="/settings/profile" element={<ProfileSettingsPage />} />
            <Route path="/parent" element={<ParentOverviewPage />} />
            <Route path="/substitute" element={<SubstituteDashboardPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
      <AppContent />
    </Router>
  );
}

export default App;
