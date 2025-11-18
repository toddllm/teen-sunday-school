import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TodayPage from './pages/TodayPage';
import PlansPage from './pages/PlansPage';
import LessonsPage from './pages/LessonsPage';
import LessonViewPage from './pages/LessonViewPage';
import AdminPage from './pages/AdminPage';
import LessonCreatorPage from './pages/LessonCreatorPage';
import GamesPage from './pages/GamesPage';
import BibleToolPage from './pages/BibleToolPage';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route path="/today" element={
                <ProtectedRoute>
                  <TodayPage />
                </ProtectedRoute>
              } />

              {/* Public Routes */}
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/lessons" element={<LessonsPage />} />
              <Route path="/lesson/:id" element={<LessonViewPage />} />
              <Route path="/bible" element={<BibleToolPage />} />
              <Route path="/games/:lessonId" element={<GamesPage />} />

              {/* Admin Routes - Should be protected in production */}
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/create" element={<LessonCreatorPage />} />
              <Route path="/admin/edit/:id" element={<LessonCreatorPage />} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
