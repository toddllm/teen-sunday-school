import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './Navigation.css';

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <span className="logo-icon">📖</span>
          <span className="logo-text">Teen Sunday School</span>
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
              to="/bible"
              className={`nav-link ${isActive('/bible') && location.pathname === '/bible' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Bible Tool
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
              to="/bible/miracles"
              className={`nav-link ${isActive('/bible/miracles') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Miracles
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
              to="/admin"
              className={`nav-link admin-link ${isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Admin
            </Link>
          </li>
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
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
