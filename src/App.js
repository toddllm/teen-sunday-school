import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import LessonsPage from './pages/LessonsPage';
import LessonViewPage from './pages/LessonViewPage';
import AdminPage from './pages/AdminPage';
import LessonCreatorPage from './pages/LessonCreatorPage';
import GamesPage from './pages/GamesPage';
import BibleToolPage from './pages/BibleToolPage';
import BadgesPage from './pages/BadgesPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/lesson/:id" element={<LessonViewPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/create" element={<LessonCreatorPage />} />
            <Route path="/admin/edit/:id" element={<LessonCreatorPage />} />
            <Route path="/games/:lessonId" element={<GamesPage />} />
            <Route path="/bible" element={<BibleToolPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
