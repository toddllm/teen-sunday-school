import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSeasonalEvents } from '../contexts/SeasonalEventContext';
import './EventCreatorPage.css';

/**
 * EventCreatorPage Component
 * Form for creating and editing seasonal events (admin only)
 */
function EventCreatorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEvent, createEvent, updateEvent } = useSeasonalEvents();

  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    season: 'ADVENT',
    startDate: '',
    endDate: '',
    icon: '',
    bannerColor: '#4A90E2',
    bannerImage: '',
    isActive: true,
    isPinned: false,
  });

  const [challenges, setChallenges] = useState([]);
  const [rewards, setRewards] = useState({
    xpMultiplier: 1,
    badges: [],
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      const event = await getEvent(id);

      setFormData({
        title: event.title,
        description: event.description,
        season: event.season,
        startDate: new Date(event.startDate).toISOString().split('T')[0],
        endDate: new Date(event.endDate).toISOString().split('T')[0],
        icon: event.icon || '',
        bannerColor: event.bannerColor || '#4A90E2',
        bannerImage: event.bannerImage || '',
        isActive: event.isActive,
        isPinned: event.isPinned || false,
      });

      if (event.challenges) {
        setChallenges(event.challenges);
      }

      if (event.rewards) {
        setRewards(event.rewards);
      }
    } catch (err) {
      console.error('Failed to load event:', err);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddChallenge = () => {
    setChallenges(prev => [
      ...prev,
      { title: '', description: '', points: 10 },
    ]);
  };

  const handleChallengeChange = (index, field, value) => {
    setChallenges(prev => prev.map((challenge, i) => {
      if (i === index) {
        return { ...challenge, [field]: value };
      }
      return challenge;
    }));
  };

  const handleRemoveChallenge = (index) => {
    setChallenges(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    setSaving(true);

    try {
      const eventData = {
        ...formData,
        challenges,
        rewards,
      };

      if (isEditMode) {
        await updateEvent(id, eventData);
      } else {
        await createEvent(eventData);
      }

      navigate('/admin/events');
    } catch (err) {
      console.error('Failed to save event:', err);
      setError('Failed to save event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="event-creator-page">
        <div className="creator-loading">
          <div className="spinner"></div>
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-creator-page">
      <header className="creator-header">
        <h1>{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
        <button onClick={() => navigate('/admin/events')} className="btn btn-secondary">
          Cancel
        </button>
      </header>

      {error && (
        <div className="creator-error">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="creator-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Advent Challenge 2024"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the event and its purpose..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="season">Season *</label>
              <select
                id="season"
                name="season"
                value={formData.season}
                onChange={handleChange}
                required
              >
                <option value="ADVENT">🕯️ Advent</option>
                <option value="CHRISTMAS">🎄 Christmas</option>
                <option value="LENT">✝️ Lent</option>
                <option value="EASTER">🐣 Easter</option>
                <option value="PENTECOST">🔥 Pentecost</option>
                <option value="SUMMER">☀️ Summer</option>
                <option value="FALL">🍂 Fall</option>
                <option value="CUSTOM">⭐ Custom</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="icon">Icon (emoji or text)</label>
              <input
                type="text"
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="e.g., 🎄"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Visual Design */}
        <div className="form-section">
          <h2>Visual Design</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bannerColor">Banner Color</label>
              <input
                type="color"
                id="bannerColor"
                name="bannerColor"
                value={formData.bannerColor}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bannerImage">Banner Image URL</label>
              <input
                type="url"
                id="bannerImage"
                name="bannerImage"
                value={formData.bannerImage}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>

        {/* Challenges */}
        <div className="form-section">
          <div className="section-header">
            <h2>Challenges</h2>
            <button type="button" onClick={handleAddChallenge} className="btn btn-secondary btn-small">
              + Add Challenge
            </button>
          </div>

          {challenges.map((challenge, index) => (
            <div key={index} className="challenge-item">
              <div className="challenge-header">
                <h4>Challenge {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveChallenge(index)}
                  className="btn-remove"
                >
                  Remove
                </button>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={challenge.title}
                  onChange={(e) => handleChallengeChange(index, 'title', e.target.value)}
                  placeholder="Challenge title"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={challenge.description}
                  onChange={(e) => handleChallengeChange(index, 'description', e.target.value)}
                  placeholder="Challenge description"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Points</label>
                <input
                  type="number"
                  value={challenge.points}
                  onChange={(e) => handleChallengeChange(index, 'points', parseInt(e.target.value))}
                  min="1"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Rewards */}
        <div className="form-section">
          <h2>Rewards</h2>

          <div className="form-group">
            <label htmlFor="xpMultiplier">XP Multiplier</label>
            <input
              type="number"
              id="xpMultiplier"
              value={rewards.xpMultiplier}
              onChange={(e) => setRewards(prev => ({ ...prev, xpMultiplier: parseFloat(e.target.value) }))}
              min="1"
              max="10"
              step="0.5"
            />
          </div>
        </div>

        {/* Settings */}
        <div className="form-section">
          <h2>Settings</h2>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span>Active (event is visible and joinable)</span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isPinned"
                checked={formData.isPinned}
                onChange={handleChange}
              />
              <span>Pinned (show as featured event)</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/events')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : (isEditMode ? 'Update Event' : 'Create Event')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventCreatorPage;
