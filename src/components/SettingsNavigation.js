import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './SettingsNavigation.css';

const SettingsNavigation = () => {
  const location = useLocation();

  const settingsPages = [
    {
      path: '/settings/translations',
      label: 'Translations',
      icon: '🌐',
      description: 'Bible translation preferences'
    },
    {
      path: '/settings/reading-metrics',
      label: 'Reading Metrics',
      icon: '📊',
      description: 'Reading time & difficulty settings'
    }
  ];

  return (
    <nav className="settings-navigation">
      <div className="settings-nav-container">
        {settingsPages.map(page => (
          <Link
            key={page.path}
            to={page.path}
            className={`settings-nav-item ${location.pathname === page.path ? 'active' : ''}`}
          >
            <span className="settings-nav-icon">{page.icon}</span>
            <div className="settings-nav-content">
              <span className="settings-nav-label">{page.label}</span>
              <span className="settings-nav-description">{page.description}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default SettingsNavigation;
