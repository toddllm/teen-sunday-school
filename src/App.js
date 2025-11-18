import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
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
import Login from './pages/Login';
import UserRoleManagement from './pages/UserRoleManagement';
import RolesPermissions from './pages/RolesPermissions';
import AuditLogs from './pages/AuditLogs';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />

              {/* Protected routes - Basic user access */}
              <Route path="/today" element={
                <ProtectedRoute>
                  <TodayPage />
                </ProtectedRoute>
              } />
              <Route path="/badges" element={
                <ProtectedRoute>
                  <BadgesPage />
                </ProtectedRoute>
              } />
              <Route path="/lessons" element={
                <ProtectedRoute permission="lessons:read">
                  <LessonsPage />
                </ProtectedRoute>
              } />
              <Route path="/lesson/:id" element={
                <ProtectedRoute permission="lessons:read">
                  <LessonViewPage />
                </ProtectedRoute>
              } />
              <Route path="/games/:lessonId" element={
                <ProtectedRoute>
                  <GamesPage />
                </ProtectedRoute>
              } />
              <Route path="/bible" element={
                <ProtectedRoute>
                  <BibleToolPage />
                </ProtectedRoute>
              } />
              <Route path="/bible/parallel" element={
                <ProtectedRoute>
                  <ParallelBiblePage />
                </ProtectedRoute>
              } />
              <Route path="/settings/translations" element={
                <ProtectedRoute>
                  <TranslationSettingsPage />
                </ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute permission="lessons:update">
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/create" element={
                <ProtectedRoute permission="lessons:create">
                  <LessonCreatorPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/edit/:id" element={
                <ProtectedRoute permission="lessons:update">
                  <LessonCreatorPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/games/:lessonId" element={
                <ProtectedRoute permission="lessons:update">
                  <GamesAdminPage />
                </ProtectedRoute>
              } />

              {/* Roles and permissions routes */}
              <Route path="/admin/users" element={
                <ProtectedRoute permission="users:read">
                  <UserRoleManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/roles" element={
                <ProtectedRoute permission="roles:read">
                  <RolesPermissions />
                </ProtectedRoute>
              } />
              <Route path="/admin/audit-logs" element={
                <ProtectedRoute permission="audit:view">
                  <AuditLogs />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
