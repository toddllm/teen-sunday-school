import React, { useState, useEffect } from 'react';
import './RelatedSongs.css';

/**
 * RelatedSongs Component
 * Displays worship songs related to a Bible passage
 */

const RelatedSongs = ({ passageRef, theme }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!passageRef && !theme) {
      setSongs([]);
      return;
    }

    fetchSongs();
  }, [passageRef, theme]);

  const fetchSongs = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (passageRef) params.append('passage_ref', passageRef);
      if (theme) params.append('theme', theme);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/songs?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }

      const data = await response.json();
      setSongs(data);
    } catch (err) {
      console.error('Error fetching songs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSongView = async (songId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/songs/${songId}/metrics`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metricType: 'VIEW',
            passageRef,
          }),
        }
      );
    } catch (err) {
      console.error('Error tracking song view:', err);
    }
  };

  const handleLinkClick = async (songId, linkUrl) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/songs/${songId}/metrics`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metricType: 'LINK_CLICK',
            passageRef,
          }),
        }
      );

      // Open link in new tab
      window.open(linkUrl, '_blank');
    } catch (err) {
      console.error('Error tracking link click:', err);
    }
  };

  if (!passageRef && !theme) {
    return null;
  }

  if (loading) {
    return (
      <div className="related-songs">
        <h3>Related Songs</h3>
        <div className="loading">Loading songs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="related-songs">
        <h3>Related Songs</h3>
        <div className="error">Failed to load songs. Please try again.</div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="related-songs">
        <h3>Related Songs</h3>
        <div className="no-songs">No songs found for this passage.</div>
      </div>
    );
  }

  return (
    <div className="related-songs">
      <h3>Related Songs</h3>
      <p className="subtitle">
        Worship songs that connect with {passageRef ? 'this passage' : 'this theme'}
      </p>

      <div className="songs-grid">
        {songs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onView={() => handleSongView(song.id)}
            onLinkClick={() => handleLinkClick(song.id, song.linkUrl)}
          />
        ))}
      </div>
    </div>
  );
};

const SongCard = ({ song, onView, onLinkClick }) => {
  useEffect(() => {
    // Track view when card is rendered
    onView();
  }, []);

  return (
    <div className="song-card">
      <div className="song-header">
        <h4 className="song-title">{song.title}</h4>
        <p className="song-artist">{song.artist}</p>
      </div>

      <div className="song-themes">
        {song.themeTags.slice(0, 3).map((tag, index) => (
          <span key={index} className="theme-tag">
            {tag}
          </span>
        ))}
      </div>

      {song.linkUrl && (
        <button
          className="song-link-button"
          onClick={onLinkClick}
          title="Listen to this song"
        >
          Listen
        </button>
      )}
    </div>
  );
};

export default RelatedSongs;
