import React from 'react';
import { Link } from 'react-router-dom';
import { useLessons } from '../contexts/LessonContext';
import DashboardMetrics from '../components/DashboardMetrics';
import './AdminPage.css';

function AdminPage() {
  const { lessons, deleteLesson, duplicateLesson } = useLessons();

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

        <DashboardMetrics />

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
