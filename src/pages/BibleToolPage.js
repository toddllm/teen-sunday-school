import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVerseText } from '../services/bibleAPI';
import { useMemoryVerse } from '../contexts/MemoryVerseContext';
import './BibleToolPage.css';

const BibleToolPage = () => {
  const navigate = useNavigate();
  const { addMemoryVerse, isVerseInMemory } = useMemoryVerse();
  const [reference, setReference] = useState('');
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setError('');
    setVerse(null);
    setAddSuccess('');

    try {
      const result = await getVerseText(reference);
      setVerse(result);
    } catch (err) {
      setError('Could not find that verse. Please check the reference and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMemory = () => {
    if (!verse) return;

    if (isVerseInMemory(verse.reference)) {
      setAddSuccess('This verse is already in your memory collection!');
      setTimeout(() => navigate('/memory-verses'), 2000);
      return;
    }

    addMemoryVerse(verse.reference, verse.text);
    setAddSuccess('Added to memory! Redirecting...');
    setTimeout(() => navigate('/memory-verses'), 1500);
  };

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
          <h2>{verse.reference}</h2>
          <div className="verse-text">
            {verse.text}
          </div>
          <button
            onClick={handleAddToMemory}
            className="add-to-memory-btn"
            disabled={isVerseInMemory(verse.reference)}
          >
            {isVerseInMemory(verse.reference) ? 'Already in Memory ✓' : 'Add to Memory 🧠'}
          </button>
          {addSuccess && <div className="success-message">{addSuccess}</div>}
        </div>
      )}

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
