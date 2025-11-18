import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLessons } from '../contexts/LessonContext';
import './LessonsPage.css';

function LessonsPage() {
  const { lessons } = useLessons();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterQuarter, setFilterQuarter] = useState('all');

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.connection?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesQuarter = filterQuarter === 'all' || lesson.quarter?.toString() === filterQuarter;
    return matchesSearch && matchesQuarter;
  });

  const quarters = [...new Set(lessons.map(l => l.quarter).filter(Boolean))];

  return (
    <div className="lessons-page">
      <div className="container">
        <div className="page-header">
          <h1>All Lessons</h1>
          <Link to="/admin/create" className="btn btn-primary">
            + Create New Lesson
          </Link>
        </div>

        <div className="filters">
          <input
            type="text"
            className="search-input"
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={filterQuarter}
            onChange={(e) => setFilterQuarter(e.target.value)}
          >
            <option value="all">All Quarters</option>
            {quarters.map(q => (
              <option key={q} value={q}>Quarter {q}</option>
            ))}
          </select>
        </div>

        {filteredLessons.length === 0 ? (
          <div className="empty-state">
            <p>No lessons found matching your criteria.</p>
            {searchTerm || filterQuarter !== 'all' ? (
              <button onClick={() => { setSearchTerm(''); setFilterQuarter('all'); }} className="btn btn-outline">
                Clear Filters
              </button>
            ) : (
              <Link to="/admin/create" className="btn btn-primary">
                Create Your First Lesson
              </Link>
            )}
          </div>
        ) : (
          <div className="lessons-grid">
            {filteredLessons.map(lesson => (
              <div key={lesson.id} className="lesson-card">
                <div className="lesson-card-header">
                  {lesson.quarter && lesson.unit && (
                    <span className="lesson-meta">Q{lesson.quarter} U{lesson.unit}</span>
                  )}
                  {lesson.lessonNumber && (
                    <span className="badge badge-primary">L{lesson.lessonNumber}</span>
                  )}
                </div>
                <h3>{lesson.title}</h3>
                {lesson.connection && (
                  <p className="lesson-connection">{lesson.connection}</p>
                )}
                {lesson.rememberVerse && (
                  <blockquote className="remember-verse">
                    "{lesson.rememberVerse.text.substring(0, 80)}..."
                    <cite>{lesson.rememberVerse.reference}</cite>
                  </blockquote>
                )}
                <div className="lesson-card-actions">
                  <Link to={`/lesson/${lesson.id}`} className="btn btn-primary btn-small">
                    View
                  </Link>
                  <Link to={`/games/${lesson.id}`} className="btn btn-secondary btn-small">
                    Games
                  </Link>
                  <Link to={`/admin/edit/${lesson.id}`} className="btn btn-outline btn-small">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonsPage;
