import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSeries } from '../contexts/SeriesContext';
import { useStreak } from '../contexts/StreakContext';
import './SeriesViewPage.css';

function SeriesViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSeriesById, completeLesson } = useSeries();
  const { logActivity } = useStreak();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completingLesson, setCompletingLesson] = useState(null);

  useEffect(() => {
    loadSeries();
  }, [id]);

  const loadSeries = async () => {
    setLoading(true);
    const data = await getSeriesById(id);
    setSeries(data);
    setLoading(false);
  };

  const handleCompleteLesson = async (lessonId) => {
    if (completingLesson) return;

    setCompletingLesson(lessonId);
    try {
      await completeLesson(id, lessonId);
      // Log activity in streak tracker
      logActivity('LESSON_COMPLETED');
      // Reload series to get updated completion status
      await loadSeries();
      alert('Lesson marked as complete!');
    } catch (error) {
      alert(`Failed to mark lesson as complete: ${error.message}`);
    } finally {
      setCompletingLesson(null);
    }
  };

  const isLessonComplete = (lessonId) => {
    if (!series?.completions) return false;
    return series.completions.some((c) => c.lessonId === lessonId);
  };

  if (loading) {
    return (
      <div className="series-view-page">
        <div className="container">
          <div className="loading">Loading series...</div>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="series-view-page">
        <div className="container">
          <div className="error-message">
            <h2>Series Not Found</h2>
            <p>The series you're looking for doesn't exist or has been removed.</p>
            <Link to="/series" className="btn btn-primary">
              Browse Series
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="series-view-page">
      <div className="container">
        <button onClick={() => navigate('/series')} className="back-button">
          ← Back to Series
        </button>

        <div className="series-header">
          {series.thumbnailUrl && (
            <div className="series-hero">
              <img src={series.thumbnailUrl} alt={series.title} />
            </div>
          )}
          <div className="series-info">
            <h1>{series.title}</h1>
            {series.subtitle && <p className="subtitle">{series.subtitle}</p>}
            {series.description && <p className="description">{series.description}</p>}

            <div className="series-details">
              <div className="detail-item">
                <span className="detail-label">Lessons:</span>
                <span className="detail-value">{series.lessons?.length || 0}</span>
              </div>
              {series.ageMin && series.ageMax && (
                <div className="detail-item">
                  <span className="detail-label">Age Range:</span>
                  <span className="detail-value">
                    {series.ageMin}-{series.ageMax}
                  </span>
                </div>
              )}
            </div>

            {series.tags && series.tags.length > 0 && (
              <div className="series-tags">
                {series.tags.map((tag, i) => (
                  <span key={i} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {series.progress && (
          <div className="progress-section">
            <h2>Your Progress</h2>
            <div className="progress-stats">
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${series.progress.percentage}%` }}
                >
                  <span className="progress-text">{series.progress.percentage}%</span>
                </div>
              </div>
              <p className="progress-details">
                {series.progress.completed} of {series.progress.total} lessons completed
              </p>
            </div>
          </div>
        )}

        <div className="lessons-section">
          <h2>Lessons in This Series</h2>
          <div className="lessons-list">
            {series.lessons && series.lessons.length > 0 ? (
              series.lessons.map((sl, index) => {
                const completed = isLessonComplete(sl.lesson.id);
                return (
                  <div key={sl.id} className={`lesson-card ${completed ? 'completed' : ''}`}>
                    <div className="lesson-number">{index + 1}</div>
                    <div className="lesson-content">
                      <h3>{sl.lesson.title}</h3>
                      <p className="lesson-scripture">{sl.lesson.scripture}</p>
                      {sl.scheduledDate && (
                        <p className="lesson-date">
                          Scheduled: {new Date(sl.scheduledDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="lesson-actions">
                      {completed ? (
                        <div className="completion-badge">
                          <span className="checkmark">✓</span> Completed
                        </div>
                      ) : (
                        <>
                          <Link
                            to={`/lessons/${sl.lesson.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            View Lesson
                          </Link>
                          <button
                            onClick={() => handleCompleteLesson(sl.lesson.id)}
                            disabled={completingLesson === sl.lesson.id}
                            className="btn btn-success btn-sm"
                          >
                            {completingLesson === sl.lesson.id
                              ? 'Marking...'
                              : 'Mark Complete'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-lessons">
                <p>No lessons have been added to this series yet.</p>
              </div>
            )}
          </div>
        </div>

        {series.progress && series.progress.percentage === 100 && (
          <div className="completion-celebration">
            <div className="celebration-content">
              <h2>🎉 Congratulations! 🎉</h2>
              <p>You've completed the entire "{series.title}" series!</p>
              <Link to="/series" className="btn btn-primary">
                Explore More Series
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeriesViewPage;
