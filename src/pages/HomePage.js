import React from 'react';
import { Link } from 'react-router-dom';
import { useLessons } from '../contexts/LessonContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import './HomePage.css';

function HomePage() {
  const { lessons } = useLessons();
  const { userProfile, getRecommendations } = useOnboarding();
  const recommendations = getRecommendations();

  // Personalized greetings and CTAs based on role
  const getRoleBasedContent = () => {
    const role = userProfile.role;

    if (role === 'teacher' || role === 'admin') {
      return {
        greeting: `Welcome back, ${userProfile.name || 'Teacher'}!`,
        subtitle: 'Create engaging lessons and manage your Sunday school curriculum',
        primaryCTA: { text: 'Create New Lesson', link: '/admin/create' },
        secondaryCTA: { text: 'Admin Dashboard', link: '/admin' }
      };
    } else if (role === 'student') {
      return {
        greeting: `Hey ${userProfile.name || 'there'}! 👋`,
        subtitle: 'Discover Bible study tools, games, and build your reading streak',
        primaryCTA: { text: 'Today\'s Page', link: '/today' },
        secondaryCTA: { text: 'Play Games', link: lessons.length > 0 ? `/games/${lessons[0].id}` : '/lessons' }
      };
    } else if (role === 'parent') {
      return {
        greeting: `Welcome, ${userProfile.name || 'Parent'}!`,
        subtitle: 'Support your teen\'s faith journey with quality lessons and resources',
        primaryCTA: { text: 'Browse Lessons', link: '/lessons' },
        secondaryCTA: { text: 'Reading Plans', link: '/admin/plans' }
      };
    }

    // Default for users without role set
    return {
      greeting: 'Teen Sunday School',
      subtitle: 'Interactive lesson builder and delivery platform for engaging teen Bible study',
      primaryCTA: { text: 'Browse Lessons', link: '/lessons' },
      secondaryCTA: { text: 'Create New Lesson', link: '/admin/create' }
    };
  };

  const roleContent = getRoleBasedContent();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>{roleContent.greeting}</h1>
          <p className="hero-subtitle">
            {roleContent.subtitle}
          </p>
          <div className="hero-buttons">
            <Link to={roleContent.primaryCTA.link} className="btn btn-primary btn-large">
              {roleContent.primaryCTA.text}
            </Link>
            <Link to={roleContent.secondaryCTA.link} className="btn btn-outline btn-large">
              {roleContent.secondaryCTA.text}
            </Link>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations Section */}
      {userProfile.interests && userProfile.interests.length > 0 && (
        <section className="recommendations">
          <div className="container">
            <h2 className="section-title">Recommended for You</h2>
            <p className="section-subtitle">
              Based on your interests: {userProfile.interests.map(i => i.replace('-', ' ')).join(', ')}
            </p>
            <div className="grid grid-3">
              {recommendations.features.slice(0, 3).map((feature, idx) => {
                const featureMap = {
                  'lesson-creator': { icon: '✏️', title: 'Lesson Creator', desc: 'Build engaging lessons', link: '/admin/create' },
                  'admin-dashboard': { icon: '📊', title: 'Admin Dashboard', desc: 'Manage your content', link: '/admin' },
                  'reading-plan-builder': { icon: '📅', title: 'Reading Plans', desc: 'Create study plans', link: '/admin/plans' },
                  'games': { icon: '🎮', title: 'Interactive Games', desc: 'Learn through play', link: lessons.length > 0 ? `/games/${lessons[0].id}` : '/lessons' },
                  'streaks': { icon: '🔥', title: 'Reading Streaks', desc: 'Build daily habits', link: '/today' },
                  'badges': { icon: '🏆', title: 'Badges', desc: 'Earn achievements', link: '/badges' },
                  'today-page': { icon: '📖', title: 'Today', desc: 'Daily devotional hub', link: '/today' },
                  'lessons': { icon: '📚', title: 'Lessons', desc: 'Browse all lessons', link: '/lessons' },
                  'reading-plans': { icon: '📋', title: 'Reading Plans', desc: 'Structured Bible reading', link: '/admin/plans' },
                  'bible-basics': { icon: '📖', title: 'Bible Basics', desc: 'Start your journey', link: '/bible' },
                  'context-cards': { icon: 'ℹ️', title: 'Context Cards', desc: 'Understand difficult verses', link: '/bible/parallel' },
                  'parallel-translations': { icon: '📄', title: 'Parallel Translations', desc: 'Compare versions', link: '/bible/parallel' },
                  'cross-references': { icon: '🔗', title: 'Cross References', desc: 'Explore connections', link: '/bible' },
                  'comparative-themes': { icon: '🔍', title: 'Comparative Themes', desc: 'OT vs NT themes', link: '/bible/themes' },
                };

                const featureData = featureMap[feature] || {
                  icon: '⭐',
                  title: feature.replace('-', ' '),
                  desc: 'Explore this feature',
                  link: '/'
                };

                return (
                  <div key={idx} className="feature-card">
                    <div className="feature-icon">{featureData.icon}</div>
                    <h3>{featureData.title}</h3>
                    <p>{featureData.desc}</p>
                    <Link to={featureData.link} className="feature-link">
                      Explore →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

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
            {userProfile.role === 'student' ? (
              <>
                <h2>Keep Building Your Streak!</h2>
                <p>Make Bible study a daily habit and earn achievement badges</p>
                <Link to="/today" className="btn btn-primary btn-large">
                  Go to Today's Page
                </Link>
              </>
            ) : userProfile.role === 'teacher' || userProfile.role === 'admin' ? (
              <>
                <h2>Ready to create engaging lessons?</h2>
                <p>Start building interactive Sunday school content today</p>
                <Link to="/admin" className="btn btn-primary btn-large">
                  Go to Admin Dashboard
                </Link>
              </>
            ) : (
              <>
                <h2>Explore Bible Study Tools</h2>
                <p>Discover powerful features to deepen your understanding</p>
                <Link to="/bible" className="btn btn-primary btn-large">
                  Explore Bible Tools
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
