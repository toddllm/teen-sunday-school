import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import LessonsPage from './pages/LessonsPage';
import LessonViewPage from './pages/LessonViewPage';
import AdminPage from './pages/AdminPage';
import LessonCreatorPage from './pages/LessonCreatorPage';
import GamesPage from './pages/GamesPage';
import BibleToolPage from './pages/BibleToolPage';
import PlansListPage from './pages/PlansListPage';
import PlanDetailPage from './pages/PlanDetailPage';
import MyPlansPage from './pages/MyPlansPage';
import PlanProgressPage from './pages/PlanProgressPage';
import { AuthProvider } from './contexts/AuthContext';
import { ReadingPlansProvider } from './contexts/ReadingPlansContext';
import { initializeSeedData } from './data/seedReadingPlans';
import './App.css';

function App() {
  // Initialize seed data on first load
  useEffect(() => {
    initializeSeedData();
  }, []);

  return (
    <AuthProvider>
      <ReadingPlansProvider>
        <Router>
          <div className="App">
            <Navigation />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/lessons" element={<LessonsPage />} />
                <Route path="/lesson/:id" element={<LessonViewPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/create" element={<LessonCreatorPage />} />
                <Route path="/admin/edit/:id" element={<LessonCreatorPage />} />
                <Route path="/games/:lessonId" element={<GamesPage />} />
                <Route path="/bible" element={<BibleToolPage />} />
                <Route path="/plans" element={<PlansListPage />} />
                <Route path="/plans/my-plans" element={<MyPlansPage />} />
                <Route path="/plans/:planId" element={<PlanDetailPage />} />
                <Route path="/plans/:planId/progress" element={<PlanProgressPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ReadingPlansProvider>
    </AuthProvider>
  );
}

export default App;
