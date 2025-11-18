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
              to="/badges"
              className={`nav-link ${isActive('/badges') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Badges
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
              to="/bible"
              className={`nav-link ${isActive('/bible') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Bible Tool
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/collections"
              className={`nav-link ${isActive('/collections') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Collections
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/admin"
              className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Admin
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
