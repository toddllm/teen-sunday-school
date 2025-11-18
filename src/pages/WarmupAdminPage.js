import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarmup, WARMUP_ACTIVITY_TYPES, WARMUP_DURATIONS } from '../contexts/WarmupContext';
import { useLessons } from '../contexts/LessonContext';
import {
  generateAutoPlaylist,
  generatePlaylistFromLesson,
  getActivityTypeIcon,
  getActivityTypeLabel
} from '../services/warmupActivityService';
import './WarmupAdminPage.css';

function WarmupAdminPage() {
  const navigate = useNavigate();
  const {
    warmupPlaylists,
    warmupSettings,
    createPlaylist,
    deletePlaylist,
    startWarmupSession,
    updateSettings,
    getRecentWarmups,
    getWarmupStats
  } = useWarmup();

  const { lessons } = useLessons();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [generationType, setGenerationType] = useState('auto'); // 'auto' or 'lesson'
  const [selectedDuration, setSelectedDuration] = useState(WARMUP_DURATIONS.MEDIUM);
  const [selectedActivityTypes, setSelectedActivityTypes] = useState(Object.values(WARMUP_ACTIVITY_TYPES));
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const stats = getWarmupStats();
  const recentWarmups = getRecentWarmups(5);

  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    let activities = [];
    let lessonId = null;

    if (generationType === 'auto') {
      activities = generateAutoPlaylist(selectedDuration, selectedActivityTypes);
    } else if (generationType === 'lesson') {
      if (!selectedLesson) {
        alert('Please select a lesson');
        return;
      }
      const lesson = lessons.find(l => l.id === selectedLesson);
      if (lesson) {
        activities = generatePlaylistFromLesson(lesson);
        lessonId = lesson.id;
      }
    }

    if (activities.length === 0) {
      alert('Could not generate activities. Please check your settings.');
      return;
    }

    createPlaylist(playlistName, activities, lessonId);

    // Reset form
    setPlaylistName('');
    setSelectedLesson('');
    setGenerationType('auto');
    setShowCreateModal(false);

    alert(`Playlist "${playlistName}" created with ${activities.length} activities!`);
  };

  const handleStartWarmup = (playlistId) => {
    startWarmupSession(playlistId);
    navigate(`/warmup/present?playlist=${playlistId}`);
  };

  const handleDeletePlaylist = (playlistId, playlistName) => {
    if (window.confirm(`Are you sure you want to delete "${playlistName}"?`)) {
      deletePlaylist(playlistId);
    }
  };

  const handleToggleActivityType = (activityType) => {
    if (selectedActivityTypes.includes(activityType)) {
      setSelectedActivityTypes(selectedActivityTypes.filter(t => t !== activityType));
    } else {
      setSelectedActivityTypes([...selectedActivityTypes, activityType]);
    }
  };

  const handleSaveSettings = () => {
    updateSettings({
      defaultDuration: selectedDuration,
      enabledActivityTypes: selectedActivityTypes
    });
    setShowSettingsModal(false);
    alert('Settings saved!');
  };

  return (
    <div className="warmup-admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>Pre-Class Warmup Manager</h1>
            <p className="admin-subtitle">Create and manage warmup playlists for your classes</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setShowSettingsModal(true)}>
              ⚙️ Settings
            </button>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              + Create Playlist
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalPlaylists}</div>
              <div className="stat-label">Total Playlists</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalCompleted}</div>
              <div className="stat-label">Warmups Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalActivities}</div>
              <div className="stat-label">Total Activities</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-value">{stats.averageActivitiesPerPlaylist}</div>
              <div className="stat-label">Avg per Playlist</div>
            </div>
          </div>
        </div>

        {/* Recent Warmups */}
        {recentWarmups.length > 0 && (
          <div className="recent-section">
            <h2>Recent Warmup Sessions</h2>
            <div className="recent-list">
              {recentWarmups.map((warmup, index) => (
                <div key={index} className="recent-item">
                  <div className="recent-info">
                    <span className="recent-name">{warmup.playlistName}</span>
                    <span className="recent-date">
                      {new Date(warmup.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="recent-stats">
                    {warmup.activitiesCompleted}/{warmup.totalActivities} activities
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Playlists */}
        <div className="playlists-section">
          <h2>Warmup Playlists</h2>
          {warmupPlaylists.length === 0 ? (
            <div className="empty-state">
              <p>No playlists yet. Create your first warmup playlist to get started!</p>
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                Create Your First Playlist
              </button>
            </div>
          ) : (
            <div className="playlists-grid">
              {warmupPlaylists.map(playlist => {
                const lesson = playlist.lessonId
                  ? lessons.find(l => l.id === playlist.lessonId)
                  : null;

                return (
                  <div key={playlist.id} className="playlist-card">
                    <div className="playlist-header">
                      <h3>{playlist.name}</h3>
                      {lesson && (
                        <span className="playlist-lesson-badge">
                          📚 {lesson.title}
                        </span>
                      )}
                    </div>
                    <div className="playlist-info">
                      <span className="playlist-activity-count">
                        {playlist.activities.length} activities
                      </span>
                      <span className="playlist-date">
                        Created {new Date(playlist.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="playlist-activities-preview">
                      {playlist.activities.slice(0, 5).map((activity, index) => (
                        <span key={index} className="activity-type-badge" title={getActivityTypeLabel(activity.type)}>
                          {getActivityTypeIcon(activity.type)}
                        </span>
                      ))}
                      {playlist.activities.length > 5 && (
                        <span className="activity-more">+{playlist.activities.length - 5}</span>
                      )}
                    </div>
                    <div className="playlist-actions">
                      <button
                        className="btn-primary"
                        onClick={() => handleStartWarmup(playlist.id)}
                      >
                        Start Warmup
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeletePlaylist(playlist.id, playlist.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Warmup Playlist</h2>
                <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Playlist Name</label>
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="e.g., Sunday Morning Warmup"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Generation Type</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="auto"
                        checked={generationType === 'auto'}
                        onChange={(e) => setGenerationType(e.target.value)}
                      />
                      <span>Auto-Generate (Random Activities)</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="lesson"
                        checked={generationType === 'lesson'}
                        onChange={(e) => setGenerationType(e.target.value)}
                      />
                      <span>From Lesson (Lesson-Specific)</span>
                    </label>
                  </div>
                </div>

                {generationType === 'auto' && (
                  <>
                    <div className="form-group">
                      <label>Duration (minutes)</label>
                      <select
                        value={selectedDuration}
                        onChange={(e) => setSelectedDuration(Number(e.target.value))}
                        className="form-select"
                      >
                        <option value={WARMUP_DURATIONS.SHORT}>5 minutes</option>
                        <option value={WARMUP_DURATIONS.MEDIUM}>10 minutes</option>
                        <option value={WARMUP_DURATIONS.LONG}>15 minutes</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Activity Types</label>
                      <div className="checkbox-group">
                        {Object.values(WARMUP_ACTIVITY_TYPES).map(type => (
                          <label key={type} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedActivityTypes.includes(type)}
                              onChange={() => handleToggleActivityType(type)}
                            />
                            <span>
                              {getActivityTypeIcon(type)} {getActivityTypeLabel(type)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {generationType === 'lesson' && (
                  <div className="form-group">
                    <label>Select Lesson</label>
                    <select
                      value={selectedLesson}
                      onChange={(e) => setSelectedLesson(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Choose a lesson...</option>
                      {lessons.map(lesson => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleCreatePlaylist}>
                  Create Playlist
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Warmup Settings</h2>
                <button className="modal-close" onClick={() => setShowSettingsModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Default Duration</label>
                  <select
                    value={warmupSettings.defaultDuration}
                    onChange={(e) => setSelectedDuration(Number(e.target.value))}
                    className="form-select"
                  >
                    <option value={WARMUP_DURATIONS.SHORT}>5 minutes</option>
                    <option value={WARMUP_DURATIONS.MEDIUM}>10 minutes</option>
                    <option value={WARMUP_DURATIONS.LONG}>15 minutes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Enabled Activity Types</label>
                  <div className="checkbox-group">
                    {Object.values(WARMUP_ACTIVITY_TYPES).map(type => (
                      <label key={type} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={warmupSettings.enabledActivityTypes.includes(type)}
                          onChange={() => handleToggleActivityType(type)}
                        />
                        <span>
                          {getActivityTypeIcon(type)} {getActivityTypeLabel(type)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowSettingsModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSaveSettings}>
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WarmupAdminPage;
