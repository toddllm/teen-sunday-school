import React, { useState, useEffect } from 'react';
import './PlaylistManager.css';

/**
 * PlaylistManager Component
 * Allows leaders to create and manage song playlists for lessons
 */

const PlaylistManager = ({ lessonId }) => {
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylists();
    fetchSongs();
  }, [lessonId]);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (lessonId) params.append('lessonId', lessonId);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/playlists?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
      }
    } catch (err) {
      console.error('Error fetching playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSongs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/songs`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSongs(data);
      }
    } catch (err) {
      console.error('Error fetching songs:', err);
    }
  };

  const createPlaylist = async (name, description, isPublic) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/playlists`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            description,
            lessonId,
            isPublic,
          }),
        }
      );

      if (response.ok) {
        const newPlaylist = await response.json();
        setPlaylists([...playlists, newPlaylist]);
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error('Error creating playlist:', err);
    }
  };

  const addSongToPlaylist = async (playlistId, songId, notes) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/playlists/${playlistId}/songs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            songId,
            notes,
          }),
        }
      );

      if (response.ok) {
        fetchPlaylists(); // Refresh playlists
        setShowAddSongModal(false);
      }
    } catch (err) {
      console.error('Error adding song to playlist:', err);
    }
  };

  const removeSongFromPlaylist = async (playlistId, songId) => {
    if (!confirm('Remove this song from the playlist?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/playlists/${playlistId}/songs/${songId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        fetchPlaylists(); // Refresh playlists
      }
    } catch (err) {
      console.error('Error removing song from playlist:', err);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!confirm('Delete this playlist? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/playlists/${playlistId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setPlaylists(playlists.filter(p => p.id !== playlistId));
        if (selectedPlaylist?.id === playlistId) {
          setSelectedPlaylist(null);
        }
      }
    } catch (err) {
      console.error('Error deleting playlist:', err);
    }
  };

  if (loading) {
    return <div className="playlist-manager loading">Loading playlists...</div>;
  }

  return (
    <div className="playlist-manager">
      <div className="playlist-header">
        <h3>Song Playlists</h3>
        <button
          className="create-playlist-button"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Playlist
        </button>
      </div>

      <div className="playlist-container">
        <div className="playlist-list">
          <h4>My Playlists</h4>
          {playlists.length === 0 ? (
            <div className="no-playlists">
              No playlists yet. Create one to get started!
            </div>
          ) : (
            playlists.map((playlist) => (
              <PlaylistItem
                key={playlist.id}
                playlist={playlist}
                isSelected={selectedPlaylist?.id === playlist.id}
                onSelect={() => setSelectedPlaylist(playlist)}
                onDelete={() => deletePlaylist(playlist.id)}
              />
            ))
          )}
        </div>

        {selectedPlaylist && (
          <div className="playlist-details">
            <div className="playlist-details-header">
              <h4>{selectedPlaylist.name}</h4>
              {selectedPlaylist.description && (
                <p className="playlist-description">
                  {selectedPlaylist.description}
                </p>
              )}
              <button
                className="add-song-button"
                onClick={() => setShowAddSongModal(true)}
              >
                + Add Song
              </button>
            </div>

            <div className="playlist-songs">
              {selectedPlaylist.items.length === 0 ? (
                <div className="no-songs">No songs in this playlist yet.</div>
              ) : (
                selectedPlaylist.items.map((item) => (
                  <PlaylistSongItem
                    key={item.id}
                    item={item}
                    onRemove={() =>
                      removeSongFromPlaylist(selectedPlaylist.id, item.song.id)
                    }
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createPlaylist}
        />
      )}

      {showAddSongModal && selectedPlaylist && (
        <AddSongModal
          songs={songs}
          existingSongIds={selectedPlaylist.items.map(i => i.song.id)}
          onClose={() => setShowAddSongModal(false)}
          onAdd={(songId, notes) =>
            addSongToPlaylist(selectedPlaylist.id, songId, notes)
          }
        />
      )}
    </div>
  );
};

const PlaylistItem = ({ playlist, isSelected, onSelect, onDelete }) => {
  return (
    <div
      className={`playlist-item ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="playlist-item-content">
        <div className="playlist-item-name">{playlist.name}</div>
        <div className="playlist-item-count">
          {playlist.items.length} song{playlist.items.length !== 1 ? 's' : ''}
        </div>
      </div>
      <button
        className="delete-playlist-button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete playlist"
      >
        ×
      </button>
    </div>
  );
};

const PlaylistSongItem = ({ item, onRemove }) => {
  return (
    <div className="playlist-song-item">
      <div className="song-info">
        <div className="song-title">{item.song.title}</div>
        <div className="song-artist">{item.song.artist}</div>
        {item.notes && <div className="song-notes">{item.notes}</div>}
      </div>
      {item.song.linkUrl && (
        <a
          href={item.song.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="song-link"
          onClick={(e) => e.stopPropagation()}
        >
          Listen
        </a>
      )}
      <button className="remove-song-button" onClick={onRemove} title="Remove song">
        ×
      </button>
    </div>
  );
};

const CreatePlaylistModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim(), isPublic);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Playlist</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Playlist Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Worship Songs for Unit 3"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows="3"
            />
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Share with other leaders
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddSongModal = ({ songs, existingSongIds, onClose, onAdd }) => {
  const [selectedSongId, setSelectedSongId] = useState('');
  const [notes, setNotes] = useState('');

  const availableSongs = songs.filter(song => !existingSongIds.includes(song.id));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSongId) {
      onAdd(selectedSongId, notes.trim());
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Add Song to Playlist</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Song *</label>
            <select
              value={selectedSongId}
              onChange={(e) => setSelectedSongId(e.target.value)}
              required
            >
              <option value="">Choose a song...</option>
              {availableSongs.map((song) => (
                <option key={song.id} value={song.id}>
                  {song.title} - {song.artist}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about how to use this song in the lesson..."
              rows="3"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Add Song
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaylistManager;
