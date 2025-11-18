import React, { useState } from 'react';
import { getVerseText, getAudioByReference, hasAudioAvailable } from '../services/bibleAPI';
import { useAudio } from '../contexts/AudioContext';
import AudioPlayer from '../components/AudioPlayer';
import './BibleToolPage.css';

const BibleToolPage = () => {
  const [reference, setReference] = useState('');
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioLoading, setAudioLoading] = useState(false);

  const { loadTrack, currentTrack } = useAudio();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setError('');
    setVerse(null);

    try {
      const result = await getVerseText(reference);
      setVerse(result);
    } catch (err) {
      setError('Could not find that verse. Please check the reference and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAudio = async () => {
    if (!reference.trim()) return;

    setAudioLoading(true);
    try {
      // Try to parse the reference to get just the chapter (not verse-specific)
      // E.g., "John 3:16" -> "John 3"
      const chapterRef = reference.split(':')[0].trim();
      const audioTrack = await getAudioByReference(chapterRef);

      if (audioTrack) {
        await loadTrack(audioTrack);
      } else {
        setError('Audio not available for this chapter.');
      }
    } catch (err) {
      console.error('Error loading audio:', err);
      setError('Could not load audio. Please try again.');
    } finally {
      setAudioLoading(false);
    }
  };

  // Check if audio might be available for current reference
  const checkAudioAvailability = () => {
    if (!reference) return false;

    try {
      // Extract book and chapter from reference
      const chapterRef = reference.split(':')[0].trim();
      const parts = chapterRef.split(/\s+/);

      if (parts.length < 2) return false;

      let book = '';
      let chapter = '';

      if (parts[0].match(/^\d/)) {
        book = `${parts[0]} ${parts[1]}`;
        chapter = parts[2];
      } else {
        book = parts[0];
        chapter = parts[1];
      }

      return hasAudioAvailable(book, parseInt(chapter));
    } catch {
      return false;
    }
  };

  const audioAvailable = checkAudioAvailability();

  return (
    <div className="bible-tool-page">
      <div className="bible-header">
        <h1>Bible Verse Lookup</h1>
        <p>Search for any Bible verse by reference (e.g., "John 3:16")</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Enter Bible reference (e.g., John 3:16)"
          className="search-input"
        />
        <button type="submit" disabled={loading} className="search-btn">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="error-box">
          <p>{error}</p>
        </div>
      )}

      {verse && (
        <div className="verse-result">
          <div className="verse-header-with-audio">
            <h2>{verse.reference}</h2>
            {audioAvailable && (
              <button
                onClick={handleLoadAudio}
                disabled={audioLoading}
                className="audio-btn"
                title="Listen to this chapter"
              >
                {audioLoading ? '⏳' : '🔊'} {audioLoading ? 'Loading...' : 'Listen'}
              </button>
            )}
          </div>
          <div className="verse-text">
            {verse.text}
          </div>
        </div>
      )}

      {currentTrack && <AudioPlayer />}

      <div className="popular-verses">
        <h3>Popular Verses</h3>
        <div className="verse-buttons">
          {['John 3:16', 'Psalm 23:1', 'Proverbs 3:5-6', 'Romans 8:28', 'Philippians 4:13'].map(ref => (
            <button
              key={ref}
              onClick={() => setReference(ref)}
              className="verse-btn"
            >
              {ref}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BibleToolPage;
