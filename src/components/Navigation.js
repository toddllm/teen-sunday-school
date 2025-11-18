import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { useUser } from '../contexts/UserContext';
import { useComments } from '../contexts/CommentContext';
import './Navigation.css';

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { organization } = useOrganization();
  const { currentUser, users, switchUser, isModerator } = useUser();
  const { getReportsByStatus } = useComments();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          {organization?.logo && organization.themeOptions?.showLogoInHeader ? (
            <img src={organization.logo} alt="Logo" className="logo-image" />
          ) : (
            <span className="logo-icon">📖</span>
          )}
          {organization.themeOptions?.showNameInHeader && (
            <span className="logo-text">{organization?.name || 'Teen Sunday School'}</span>
          )}
        </Link>

        <div className="nav-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link
              to="/"
              className={`nav-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/today"
              className={`nav-link ${isActive('/today') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Today
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/gratitude"
              className={`nav-link ${isActive('/gratitude') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Gratitude
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/badges"
              className={`nav-link ${isActive('/badges') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Badges
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/events"
              className={`nav-link ${isActive('/events') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Events
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/lessons"
              className={`nav-link ${isActive('/lessons') || isActive('/lesson') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Lessons
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/journeys"
              className={`nav-link ${isActive('/journeys') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Journeys
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/devotionals"
              className={`nav-link ${isActive('/devotionals') || isActive('/devotional') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Devotionals
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/admin/experiments"
              className={`nav-link ${isActive('/admin/experiments') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Experiments
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/question-bank"
              className={`nav-link ${isActive('/question-bank') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Question Bank
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/session-plans"
              className={`nav-link ${isActive('/session-plans') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Session Plans
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/search"
              className={`nav-link ${isActive('/search') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Search
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/journal"
              className={`nav-link ${isActive('/journal') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Journal
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/highlights"
              className={`nav-link ${isActive('/highlights') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Highlights
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bible"
              className={`nav-link ${isActive('/bible') && location.pathname === '/bible' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Bible Tool
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bible/qa"
              className={`nav-link ${isActive('/bible/qa') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Bible Q&A
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bible/parallel"
              className={`nav-link ${isActive('/bible/parallel') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Parallel Bible
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/reflections"
              className={`nav-link ${isActive('/reflections') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Reflections
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/memory-verses"
              className={`nav-link ${isActive('/memory-verses') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Memory Verses
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/progress"
              className={`nav-link ${isActive('/progress') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Reading Progress
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/prayer"
              className={`nav-link ${isActive('/prayer') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Prayer List
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bible/miracles"
              className={`nav-link ${isActive('/bible/miracles') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Miracles
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bible/parables"
              className={`nav-link ${isActive('/bible/parables') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Parables Explorer
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bible/quote-generator"
              className={`nav-link ${isActive('/bible/quote-generator') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Quote Generator
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bible/original-language"
              className={`nav-link ${isActive('/bible/original-language') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Original Language
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bible/meme-generator"
              className={`nav-link ${isActive('/bible/meme-generator') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Meme Generator
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bible/ai-summary"
              className={`nav-link ${isActive('/bible/ai-summary') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              AI Passage Summary
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bible/sermon-outline"
              className={`nav-link ${isActive('/bible/sermon-outline') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Sermon Outlines
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bible/maps"
              className={`nav-link ${isActive('/bible/maps') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Bible Maps
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/sermon-illustrations"
              className={`nav-link ${isActive('/sermon-illustrations') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Sermon Illustrations
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/scavenger-hunt"
              className={`nav-link ${isActive('/scavenger-hunt') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Scavenger Hunt
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bible/find-reference"
              className={`nav-link ${isActive('/bible/find-reference') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Find the Reference
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bible/journaling"
              className={`nav-link ${isActive('/bible/journaling') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Scripture Journaling
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/translation-comparisons"
              className={`nav-link ${isActive('/translation-comparisons') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Translation Notes
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bible/timeline"
              className={`nav-link ${isActive('/bible/timeline') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Bible Timeline
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/settings/translations"
              className={`nav-link ${isActive('/settings/translations') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Translation Settings
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/settings/accessibility"
              className={`nav-link ${isActive('/settings/accessibility') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Accessibility
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/substitute"
              className={`nav-link ${isActive('/substitute') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Substitute
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/feedback"
              className={`nav-link ${isActive('/feedback') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Feedback
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/groups"
              className={`nav-link ${isActive('/groups') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Groups
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/admin"
              className={`nav-link admin-link ${isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Admin
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/organization/dashboard"
              className={`nav-link ${isActive('/organization') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Organization
            </Link>
          </li>
          {isModerator() && (
            <li className="nav-item">
              <Link
                to="/admin/moderation"
                className={`nav-link moderation-link ${isActive('/admin/moderation') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Moderation
                {getReportsByStatus('pending').length > 0 && (
                  <span className="notification-badge">
                    {getReportsByStatus('pending').length}
                  </span>
                )}
              </Link>
            </li>
          )}
          <li className="nav-item">
            <Link
              to="/admin/incidents"
              className={`nav-link ${isActive('/admin/incidents') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Incidents
            </Link>
          </li>
          <li className="nav-item theme-toggle-item">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </li>
          <li className="nav-item user-switcher-item">
            <button
              onClick={() => setShowUserSwitcher(!showUserSwitcher)}
              className="user-switcher-btn"
              title="Switch user"
            >
              👤 {currentUser?.name || 'Guest'}
            </button>
            {showUserSwitcher && (
              <div className="user-switcher-dropdown">
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      setShowUserSwitcher(false);
                      closeMenu();
                    }}
                    className={`user-option ${currentUser?.id === user.id ? 'active' : ''}`}
                  >
                    {user.name}
                    <span className="user-role">{user.role}</span>
                  </button>
                ))}
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
