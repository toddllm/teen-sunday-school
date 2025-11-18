import React from 'react';
import { Link } from 'react-router-dom';
import { useLessons } from '../contexts/LessonContext';
import { useSession } from '../contexts/SessionContext';
import './AdminPage.css';

function AdminPage() {
  const { lessons, deleteLesson, duplicateLesson } = useLessons();
  const { getSessionMetrics } = useSession();
  const sessionMetrics = getSessionMetrics();

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteLesson(id);
    }
  };

  const handleDuplicate = (id) => {
    const newId = duplicateLesson(id);
    if (newId) {
      alert('Lesson duplicated successfully!');
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <Link to="/admin/create" className="btn btn-primary">
            + Create New Lesson
          </Link>
        </div>

        <div className="quick-access">
          <Link to="/admin/plans" className="quick-access-card">
            <div className="quick-access-icon">📅</div>
            <div className="quick-access-content">
              <h3>Reading Plans</h3>
              <p>Create and manage Bible reading plans</p>
            </div>
          </Link>
          <Link to="/admin/warmup" className="quick-access-card">
            <div className="quick-access-icon">🎯</div>
            <div className="quick-access-content">
              <h3>Pre-Class Warmup</h3>
              <p>Create auto-playlists for class warmup activities</p>
            </div>
          </Link>
          <Link to="/admin" className="quick-access-card">
            <div className="quick-access-icon">📚</div>
            <div className="quick-access-content">
              <h3>Lessons</h3>
              <p>Manage Sunday School lessons (current page)</p>
            </div>
          </Link>
          <Link to="/admin/series" className="quick-access-card">
            <div className="quick-access-icon">📖</div>
            <div className="quick-access-content">
              <h3>Series</h3>
              <p>Create and manage multi-week lesson series</p>
            </div>
          </Link>
          <Link to="/admin/weekly-word" className="quick-access-card">
            <div className="quick-access-icon">📖</div>
            <div className="quick-access-content">
              <h3>Weekly Word</h3>
              <p>Manage Greek/Hebrew words of the week</p>
            </div>
          </Link>
          <Link to="/admin/ai-filters" className="quick-access-card">
            <div className="quick-access-icon">🛡️</div>
            <div className="quick-access-content">
              <h3>AI Content Filters</h3>
              <p>Configure safe-mode filters for AI features</p>
            </div>
          </Link>
          <Link to="/admin/curriculum-coverage" className="quick-access-card">
            <div className="quick-access-icon">📊</div>
            <div className="quick-access-content">
              <h3>Curriculum Coverage</h3>
              <p>Track lesson completion and curriculum progress</p>
            </div>
          </Link>
          <Link to="/admin/incidents" className="quick-access-card">
            <div className="quick-access-icon">📋</div>
            <div className="quick-access-content">
              <h3>Incident Reports</h3>
              <p>Track behavior and wellbeing incidents</p>
            </div>
          </Link>
          <Link to="/admin/questions" className="quick-access-card">
            <div className="quick-access-icon">❓</div>
            <div className="quick-access-content">
              <h3>Question Box</h3>
              <p>Review and respond to anonymous questions</p>
            </div>
          </Link>
          <Link to="/admin/calendar" className="quick-access-card">
            <div className="quick-access-icon">📅</div>
            <div className="quick-access-content">
              <h3>Curriculum Calendar</h3>
              <p>Plan and schedule lesson calendar</p>
            </div>
          </Link>
          <Link to="/admin/templates" className="quick-access-card">
            <div className="quick-access-icon">📝</div>
            <div className="quick-access-content">
              <h3>Templates</h3>
              <p>Manage lesson templates</p>
          <Link to="/admin/topics" className="quick-access-card">
            <div className="quick-access-icon">📑</div>
            <div className="quick-access-content">
              <h3>Topics</h3>
              <p>Manage topical index and verses</p>
            </div>
          </Link>
            </div>
          </Link>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{lessons.length}</div>
            <div className="stat-label">Total Lessons</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {lessons.reduce((sum, l) => sum + (l.slides?.length || 0), 0)}
            </div>
            <div className="stat-label">Total Slides</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {[...new Set(lessons.map(l => l.quarter).filter(Boolean))].length}
            </div>
            <div className="stat-label">Quarters</div>
          </div>
        </div>

        <div className="admin-section">
          <h2>Live Teaching Sessions</h2>
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-number">{sessionMetrics.totalSessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{sessionMetrics.completedSessions}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{sessionMetrics.activeSessions}</div>
              <div className="stat-label">Active Now</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{sessionMetrics.averageSessionLength} min</div>
              <div className="stat-label">Avg Duration</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{sessionMetrics.averageSlidesAdvanced}</div>
              <div className="stat-label">Avg Slides Advanced</div>
            </div>
          </div>
        </div>

        <div className="admin-content">
          <h2>Manage Lessons</h2>
          {lessons.length === 0 ? (
            <div className="empty-state">
              <p>No lessons yet. Create your first lesson to get started!</p>
              <Link to="/admin/create" className="btn btn-primary">
                Create Lesson
              </Link>
            </div>
          ) : (
            <div className="lessons-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Q/U/L</th>
                    <th>Slides</th>
                    <th>Scripture</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map(lesson => (
                    <tr key={lesson.id}>
                      <td className="lesson-title-cell">
                        <strong>{lesson.title}</strong>
                        {lesson.connection && (
                          <div className="lesson-subtitle">{lesson.connection}</div>
                        )}
                      </td>
                      <td>
                        {lesson.quarter && lesson.unit && lesson.lessonNumber && (
                          <span className="lesson-qul">
                            Q{lesson.quarter}/U{lesson.unit}/L{lesson.lessonNumber}
                          </span>
                        )}
                      </td>
                      <td>{lesson.slides?.length || 0}</td>
                      <td className="scripture-cell">
                        {lesson.scripture?.join(', ') || 'None'}
                      </td>
                      <td className="actions-cell">
                        <Link to={`/lesson/${lesson.id}`} className="btn btn-small btn-secondary" title="View">
                          👁️
                        </Link>
                        <Link to={`/admin/edit/${lesson.id}`} className="btn btn-small btn-primary" title="Edit">
                          ✏️
                        </Link>
                        <Link to={`/admin/games/${lesson.id}`} className="btn btn-small btn-success" title="Manage Games">
                          🎮
                        </Link>
                        <button
                          onClick={() => handleDuplicate(lesson.id)}
                          className="btn btn-small btn-outline"
                          title="Duplicate"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id, lesson.title)}
                          className="btn btn-small btn-danger"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
