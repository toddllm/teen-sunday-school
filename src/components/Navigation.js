import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import './Navigation.css';

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

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

          {isAuthenticated && (
            <li className="nav-item">
              <Link
                to="/today"
                className={`nav-link ${isActive('/today') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Today
              </Link>
            </li>
          )}

          <li className="nav-item">
            <Link
              to="/plans"
              className={`nav-link ${isActive('/plans') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Reading Plans
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

          {isAuthenticated ? (
            <>
              <li className="nav-item user-item">
                <span className="user-greeting">
                  Hi, {user?.name?.split(' ')[0] || 'User'}
                </span>
              </li>
              <li className="nav-item">
                <button
                  onClick={handleLogout}
                  className="nav-link logout-btn"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link
                  to="/login"
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/register"
                  className="nav-link register-link"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
