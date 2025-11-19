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
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { organization } = useOrganization();
  const { currentUser, users, switchUser, isModerator } = useUser();
  const { getReportsByStatus } = useComments();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => {
    setIsOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const isDropdownActive = (paths) => {
    return paths.some(path => isActive(path));
  };

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

          {/* Bible Tools Dropdown */}
          <li className={`nav-item nav-dropdown ${isDropdownActive(['/bible']) ? 'active' : ''}`}>
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown('bible')}
            >
              Bible Tools <span className="dropdown-arrow">{openDropdown === 'bible' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'bible' && (
              <ul className="dropdown-menu">
                <li><Link to="/bible" onClick={closeMenu}>Bible Reader</Link></li>
                <li><Link to="/bible/read" onClick={closeMenu}>Bible Read</Link></li>
                <li><Link to="/bible/qa" onClick={closeMenu}>Bible Q&A</Link></li>
                <li><Link to="/bible/parallel" onClick={closeMenu}>Parallel Translations</Link></li>
                <li><Link to="/bible/original-language" onClick={closeMenu}>Original Language</Link></li>
                <li><Link to="/bible/ai-summary" onClick={closeMenu}>AI Summary</Link></li>
                <li><Link to="/search" onClick={closeMenu}>Search</Link></li>
                <li><Link to="/translation-comparisons" onClick={closeMenu}>Translation Notes</Link></li>
              </ul>
            )}
          </li>

          {/* Study Resources Dropdown */}
          <li className={`nav-item nav-dropdown ${isDropdownActive(['/bible/miracles', '/bible/parables', '/bible/timeline', '/bible/maps', '/characters']) ? 'active' : ''}`}>
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown('study')}
            >
              Study Resources <span className="dropdown-arrow">{openDropdown === 'study' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'study' && (
              <ul className="dropdown-menu">
                <li><Link to="/bible/miracles" onClick={closeMenu}>Miracles Explorer</Link></li>
                <li><Link to="/bible/parables" onClick={closeMenu}>Parables Explorer</Link></li>
                <li><Link to="/bible/themes" onClick={closeMenu}>Comparative Themes</Link></li>
                <li><Link to="/bible/doctrine" onClick={closeMenu}>Doctrine Overview</Link></li>
                <li><Link to="/bible/big-story" onClick={closeMenu}>Big Story</Link></li>
                <li><Link to="/bible/timeline" onClick={closeMenu}>Bible Timeline</Link></li>
                <li><Link to="/bible/chronological-plan" onClick={closeMenu}>Chronological Plan</Link></li>
                <li><Link to="/bible/maps" onClick={closeMenu}>Bible Maps</Link></li>
                <li><Link to="/characters" onClick={closeMenu}>Character Index</Link></li>
                <li><Link to="/question-bank" onClick={closeMenu}>Question Bank</Link></li>
              </ul>
            )}
          </li>

          {/* Lessons & Content Dropdown */}
          <li className={`nav-item nav-dropdown ${isDropdownActive(['/lessons', '/devotionals', '/series', '/events', '/topics', '/journeys']) ? 'active' : ''}`}>
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown('content')}
            >
              Lessons & Content <span className="dropdown-arrow">{openDropdown === 'content' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'content' && (
              <ul className="dropdown-menu">
                <li><Link to="/lessons" onClick={closeMenu}>All Lessons</Link></li>
                <li><Link to="/devotionals" onClick={closeMenu}>Devotionals</Link></li>
                <li><Link to="/series" onClick={closeMenu}>Series</Link></li>
                <li><Link to="/topics" onClick={closeMenu}>Topics</Link></li>
                <li><Link to="/events" onClick={closeMenu}>Events</Link></li>
                <li><Link to="/journeys" onClick={closeMenu}>Thematic Journeys</Link></li>
              </ul>
            )}
          </li>

          {/* Personal Tools Dropdown */}
          <li className={`nav-item nav-dropdown ${isDropdownActive(['/journal', '/highlights', '/memory-verses', '/prayer', '/gratitude', '/reflections']) ? 'active' : ''}`}>
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown('personal')}
            >
              Personal <span className="dropdown-arrow">{openDropdown === 'personal' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'personal' && (
              <ul className="dropdown-menu">
                <li><Link to="/journal" onClick={closeMenu}>Journal</Link></li>
                <li><Link to="/highlights" onClick={closeMenu}>Highlights</Link></li>
                <li><Link to="/bible/journaling" onClick={closeMenu}>Scripture Journaling</Link></li>
                <li><Link to="/memory-verses" onClick={closeMenu}>Memory Verses</Link></li>
                <li><Link to="/prayer" onClick={closeMenu}>Prayer List</Link></li>
                <li><Link to="/gratitude" onClick={closeMenu}>Gratitude Log</Link></li>
                <li><Link to="/reflections" onClick={closeMenu}>Reflections</Link></li>
              </ul>
            )}
          </li>

          {/* Creative Tools Dropdown */}
          <li className={`nav-item nav-dropdown ${isDropdownActive(['/bible/meme-generator', '/bible/quote-generator', '/bible/comic-generator']) ? 'active' : ''}`}>
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown('creative')}
            >
              Creative <span className="dropdown-arrow">{openDropdown === 'creative' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'creative' && (
              <ul className="dropdown-menu">
                <li><Link to="/bible/meme-generator" onClick={closeMenu}>Meme Generator</Link></li>
                <li><Link to="/bible/quote-generator" onClick={closeMenu}>Quote Generator</Link></li>
                <li><Link to="/bible/comic-generator" onClick={closeMenu}>Comic Generator</Link></li>
                <li><Link to="/sermon-illustrations" onClick={closeMenu}>Sermon Illustrations</Link></li>
                <li><Link to="/bible/sermon-outline" onClick={closeMenu}>Sermon Outlines</Link></li>
              </ul>
            )}
          </li>

          {/* Games & Activities Dropdown */}
          <li className={`nav-item nav-dropdown ${isDropdownActive(['/challenges', '/scavenger-hunt', '/bible/find-reference']) ? 'active' : ''}`}>
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown('games')}
            >
              Games <span className="dropdown-arrow">{openDropdown === 'games' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'games' && (
              <ul className="dropdown-menu">
                <li><Link to="/challenges" onClick={closeMenu}>Challenges</Link></li>
                <li><Link to="/scavenger-hunt" onClick={closeMenu}>Scavenger Hunt</Link></li>
                <li><Link to="/bible/find-reference" onClick={closeMenu}>Find the Reference</Link></li>
                <li><Link to="/questions" onClick={closeMenu}>Question Box</Link></li>
              </ul>
            )}
          </li>

          {/* Progress Dropdown */}
          <li className={`nav-item nav-dropdown ${isDropdownActive(['/progress', '/badges', '/goals']) ? 'active' : ''}`}>
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown('progress')}
            >
              Progress <span className="dropdown-arrow">{openDropdown === 'progress' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'progress' && (
              <ul className="dropdown-menu">
                <li><Link to="/progress" onClick={closeMenu}>Reading Progress</Link></li>
                <li><Link to="/badges" onClick={closeMenu}>Badges</Link></li>
                <li><Link to="/goals" onClick={closeMenu}>Goals</Link></li>
              </ul>
            )}
          </li>

          {/* Admin Dropdown */}
          <li className={`nav-item nav-dropdown ${isDropdownActive(['/admin']) ? 'active' : ''}`}>
            <button
              className="nav-link dropdown-toggle admin-link"
              onClick={() => toggleDropdown('admin')}
            >
              Admin <span className="dropdown-arrow">{openDropdown === 'admin' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'admin' && (
              <ul className="dropdown-menu">
                <li><Link to="/admin" onClick={closeMenu}>Dashboard</Link></li>
                <li><Link to="/admin/create" onClick={closeMenu}>Create Lesson</Link></li>
                <li><Link to="/admin/analytics" onClick={closeMenu}>Analytics</Link></li>
                <li><Link to="/admin/experiments" onClick={closeMenu}>Experiments</Link></li>
                {isModerator() && (
                  <li>
                    <Link to="/admin/moderation" onClick={closeMenu}>
                      Moderation
                      {getReportsByStatus('pending').length > 0 && (
                        <span className="notification-badge-inline">
                          {getReportsByStatus('pending').length}
                        </span>
                      )}
                    </Link>
                  </li>
                )}
                <li><Link to="/admin/incidents" onClick={closeMenu}>Incidents</Link></li>
                <li><Link to="/groups" onClick={closeMenu}>Groups</Link></li>
                <li><Link to="/organization/dashboard" onClick={closeMenu}>Organization</Link></li>
              </ul>
            )}
          </li>

          {/* Settings Dropdown */}
          <li className={`nav-item nav-dropdown ${isDropdownActive(['/settings']) ? 'active' : ''}`}>
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown('settings')}
            >
              Settings <span className="dropdown-arrow">{openDropdown === 'settings' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'settings' && (
              <ul className="dropdown-menu">
                <li><Link to="/settings" onClick={closeMenu}>General Settings</Link></li>
                <li><Link to="/settings/profile" onClick={closeMenu}>Profile</Link></li>
                <li><Link to="/settings/accessibility" onClick={closeMenu}>Accessibility</Link></li>
                <li><Link to="/settings/translations" onClick={closeMenu}>Translations</Link></li>
                <li><Link to="/settings/reading" onClick={closeMenu}>Reading Preferences</Link></li>
                <li><Link to="/feedback" onClick={closeMenu}>Feedback</Link></li>
                <li><Link to="/bug-report" onClick={closeMenu}>Report a Bug</Link></li>
              </ul>
            )}
          </li>

          {/* Theme Toggle */}
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

          {/* User Switcher */}
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
