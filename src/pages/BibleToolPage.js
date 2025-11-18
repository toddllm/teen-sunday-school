import React, { useState } from 'react';
import { getVerseText } from '../services/bibleAPI';
import { useCollections } from '../contexts/CollectionsContext';
import './BibleToolPage.css';

const BibleToolPage = () => {
  const { collections, addCollection, addVerseToCollection } = useCollections();
  const [reference, setReference] = useState('');
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setError('');
    setVerse(null);
    setSaveSuccess('');

    try {
      const result = await getVerseText(reference);
      setVerse(result);
    } catch (err) {
      setError('Could not find that verse. Please check the reference and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = () => {
    setShowCollectionModal(true);
    setSaveSuccess('');
  };

  const handleSaveToCollection = () => {
    if (!verse) return;

    let collectionId = selectedCollection;

    // Create new collection if needed
    if (selectedCollection === 'new' && newCollectionName.trim()) {
      collectionId = addCollection({
        name: newCollectionName,
        description: '',
        color: '#4A90E2'
      });
    }

    if (collectionId && collectionId !== 'new') {
      const success = addVerseToCollection(collectionId, {
        reference: verse.reference,
        text: verse.text
      });

      if (success) {
        setSaveSuccess(`Added to collection!`);
        setShowCollectionModal(false);
        setSelectedCollection('');
        setNewCollectionName('');

        // Clear success message after 3 seconds
        setTimeout(() => setSaveSuccess(''), 3000);
      } else {
        alert('This verse is already in the selected collection.');
      }
    }
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

      {saveSuccess && (
        <div className="success-box">
          <p>{saveSuccess}</p>
        </div>
      )}

      {verse && (
        <div className="verse-result">
          <div className="verse-result-header">
            <h2>{verse.reference}</h2>
            <button
              className="btn btn-primary"
              onClick={handleAddToCollection}
            >
              + Add to Collection
            </button>
          </div>
          <div className="verse-text">
            {verse.text}
          </div>
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

      {showCollectionModal && (
        <div className="modal-overlay" onClick={() => setShowCollectionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add to Collection</h2>
              <button
                className="modal-close"
                onClick={() => setShowCollectionModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="collection-select">Select Collection</label>
                <select
                  id="collection-select"
                  className="form-input"
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                >
                  <option value="">-- Choose a collection --</option>
                  {collections.map(collection => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name} ({collection.verses?.length || 0} verses)
                    </option>
                  ))}
                  <option value="new">+ Create New Collection</option>
                </select>
              </div>

              {selectedCollection === 'new' && (
                <div className="form-group">
                  <label htmlFor="new-collection-name">New Collection Name</label>
                  <input
                    id="new-collection-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Encouragement, Prayer"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              {collections.length === 0 && selectedCollection !== 'new' && (
                <p className="help-text">
                  You don't have any collections yet. Create your first one!
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowCollectionModal(false);
                  setSelectedCollection('');
                  setNewCollectionName('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveToCollection}
                disabled={
                  !selectedCollection ||
                  (selectedCollection === 'new' && !newCollectionName.trim())
                }
              >
                Add to Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BibleToolPage;
