import React from 'react';
import { Link } from 'react-router-dom';
import { useLessons } from '../contexts/LessonContext';
import './HomePage.css';

function HomePage() {
  const { lessons } = useLessons();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Teen Sunday School</h1>
          <p className="hero-subtitle">
            Interactive lesson builder and delivery platform for engaging teen Bible study
          </p>
          <div className="hero-buttons">
            <Link to="/lessons" className="btn btn-primary btn-large">
              Browse Lessons
            </Link>
            <Link to="/admin/create" className="btn btn-outline btn-large">
              Create New Lesson
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="grid grid-3">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Lesson Creator</h3>
              <p>Build custom lessons with slides, activities, and discussion questions</p>
              <Link to="/admin/create" className="feature-link">
                Get Started →
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📖</div>
              <h3>Bible Integration</h3>
              <p>Automatically fetch and display Bible verses with reference lookup</p>
              <Link to="/bible" className="feature-link">
                Try Bible Tool →
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎮</div>
              <h3>Interactive Games</h3>
              <p>Word scramble, Hangman, and Word Search to reinforce learning</p>
              {lessons.length > 0 && (
                <Link to={`/games/${lessons[0].id}`} className="feature-link">
                  Play Games →
                </Link>
              )}
            </div>

            <div className="feature-card">
              <div className="feature-icon">😄</div>
              <h3>Meme Generator</h3>
              <p>Create wholesome, faith-based memes to share with friends</p>
              <Link to="/bible/meme-generator" className="feature-link">
                Create Memes →
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎬</div>
              <h3>Bible Project</h3>
              <p>Find related Bible Project videos and content for your lessons</p>
              <span className="feature-link coming-soon">Coming in v2 →</span>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔊</div>
              <h3>Read Aloud</h3>
              <p>Text-to-speech for slides and Bible verses for accessibility</p>
              <span className="feature-link">Built-in →</span>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Generation</h3>
              <p>AI-powered lesson creation and discussion question generation</p>
              <span className="feature-link coming-soon">Coming in v2 →</span>
            </div>
          </div>
        </div>
      </section>

      <section className="recent-lessons">
        <div className="container">
          <h2 className="section-title">Recent Lessons</h2>
          {lessons.length === 0 ? (
            <div className="empty-state">
              <p>No lessons yet. Create your first lesson to get started!</p>
              <Link to="/admin/create" className="btn btn-primary">
                Create Lesson
              </Link>
            </div>
          ) : (
            <div className="grid grid-2">
              {lessons.slice(0, 4).map(lesson => (
                <div key={lesson.id} className="lesson-preview-card">
                  <div className="lesson-preview-header">
                    <h3>{lesson.title}</h3>
                    {lesson.lessonNumber && (
                      <span className="badge badge-primary">Lesson {lesson.lessonNumber}</span>
                    )}
                  </div>
                  <p className="lesson-preview-connection">{lesson.connection}</p>
                  <div className="lesson-preview-meta">
                    <span>📖 {lesson.scripture?.join(', ')}</span>
                  </div>
                  <div className="lesson-preview-actions">
                    <Link to={`/lesson/${lesson.id}`} className="btn btn-primary">
                      View Lesson
                    </Link>
                    <Link to={`/games/${lesson.id}`} className="btn btn-secondary">
                      Games
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          {lessons.length > 4 && (
            <div className="view-all">
              <Link to="/lessons" className="btn btn-outline">
                View All Lessons →
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to create engaging lessons?</h2>
            <p>Start building interactive Sunday school content today</p>
            <Link to="/admin" className="btn btn-primary btn-large">
              Go to Admin Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
