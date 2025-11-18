import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import TodayPage from './pages/TodayPage';
import BadgesPage from './pages/BadgesPage';
import LessonsPage from './pages/LessonsPage';
import LessonViewPage from './pages/LessonViewPage';
import AdminPage from './pages/AdminPage';
import LessonCreatorPage from './pages/LessonCreatorPage';
import GamesPage from './pages/GamesPage';
import GamesAdminPage from './pages/GamesAdminPage';
import BibleToolPage from './pages/BibleToolPage';
import ParallelBiblePage from './pages/ParallelBiblePage';
import TranslationSettingsPage from './pages/TranslationSettingsPage';
import QuoteImageGeneratorPage from './pages/QuoteImageGeneratorPage';
import AuditLogPage from './pages/AuditLogPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/lesson/:id" element={<LessonViewPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/audit-log" element={<AuditLogPage />} />
            <Route path="/admin/create" element={<LessonCreatorPage />} />
            <Route path="/admin/edit/:id" element={<LessonCreatorPage />} />
            <Route path="/admin/games/:lessonId" element={<GamesAdminPage />} />
            <Route path="/games/:lessonId" element={<GamesPage />} />
            <Route path="/bible" element={<BibleToolPage />} />
            <Route path="/bible/parallel" element={<ParallelBiblePage />} />
            <Route path="/bible/quote-generator" element={<QuoteImageGeneratorPage />} />
            <Route path="/settings/translations" element={<TranslationSettingsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
