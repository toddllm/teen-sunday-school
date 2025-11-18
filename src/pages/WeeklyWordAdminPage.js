import React, { useState, useEffect } from 'react';
import { useWeeklyWord } from '../contexts/WeeklyWordContext';
import {
  getWordArchive,
  createWord,
  updateWord,
  deleteWord,
  getWordMetrics,
} from '../services/weeklyWordService';
import './WeeklyWordAdminPage.css';

const WeeklyWordAdminPage = () => {
  const [words, setWords] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [formData, setFormData] = useState({
    lemma: '',
    language: 'GREEK',
    transliteration: '',
    gloss: '',
    blurb: '',
    verseRefs: '',
    weekStart: '',
    isFeatured: false,
  });

  useEffect(() => {
    loadWords();
    loadMetrics();
  }, []);

  const loadWords = async () => {
    try {
      setLoading(true);
      const response = await getWordArchive(1, 50);
      if (response.success) {
        setWords(response.data.words);
      }
    } catch (error) {
      console.error('Error loading words:', error);
      alert('Failed to load words');
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await getWordMetrics();
      if (response.success) {
        setMetrics(response.data);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Parse verse refs from comma-separated string
      const verseRefs = formData.verseRefs
        .split(',')
        .map((ref) => ref.trim())
        .filter((ref) => ref);

      const wordData = {
        ...formData,
        verseRefs,
      };

      if (editingWord) {
        await updateWord(editingWord.id, wordData);
        alert('Word updated successfully!');
      } else {
        await createWord(wordData);
        alert('Word created successfully!');
      }

      setShowModal(false);
      resetForm();
      loadWords();
      loadMetrics();
    } catch (error) {
      console.error('Error saving word:', error);
      alert(error.response?.data?.message || 'Failed to save word');
    }
  };

  const handleEdit = (word) => {
    setEditingWord(word);
    setFormData({
      lemma: word.lemma,
      language: word.language,
      transliteration: word.transliteration,
      gloss: word.gloss,
      blurb: word.blurb,
      verseRefs: Array.isArray(word.verseRefs) ? word.verseRefs.join(', ') : '',
      weekStart: word.weekStart.split('T')[0],
      isFeatured: word.isFeatured,
    });
    setShowModal(true);
  };

  const handleDelete = async (id, lemma) => {
    if (window.confirm(`Are you sure you want to delete "${lemma}"?`)) {
      try {
        await deleteWord(id);
        alert('Word deleted successfully!');
        loadWords();
        loadMetrics();
      } catch (error) {
        console.error('Error deleting word:', error);
        alert('Failed to delete word');
      }
    }
  };

  const resetForm = () => {
    setEditingWord(null);
    setFormData({
      lemma: '',
      language: 'GREEK',
      transliteration: '',
      gloss: '',
      blurb: '',
      verseRefs: '',
      weekStart: '',
      isFeatured: false,
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="weekly-word-admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>📖 Weekly Word Management</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add New Word
          </button>
        </div>

        {/* Metrics Dashboard */}
        {metrics && (
          <div className="metrics-dashboard">
            <h2>Analytics</h2>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">👁️</div>
                <div className="metric-value">{metrics.summary.totalViews}</div>
                <div className="metric-label">Total Views</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">📖</div>
                <div className="metric-value">{metrics.summary.verseClicks}</div>
                <div className="metric-label">Verse Clicks</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">📚</div>
                <div className="metric-value">{words.length}</div>
                <div className="metric-label">Total Words</div>
              </div>
            </div>
          </div>
        )}

        {/* Words Table */}
        <div className="words-section">
          <h2>Manage Words</h2>
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : words.length === 0 ? (
            <div className="empty-state">
              <p>No words yet. Create your first word to get started!</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                Add Word
              </button>
            </div>
          ) : (
            <div className="words-table">
              <table>
                <thead>
                  <tr>
                    <th>Word</th>
                    <th>Language</th>
                    <th>Transliteration</th>
                    <th>Gloss</th>
                    <th>Week</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {words.map((word) => (
                    <tr key={word.id}>
                      <td className="word-cell">
                        <strong>{word.lemma}</strong>
                      </td>
                      <td>
                        <span className={`language-badge ${word.language.toLowerCase()}`}>
                          {word.language}
                        </span>
                      </td>
                      <td className="transliteration-cell">{word.transliteration}</td>
                      <td>{word.gloss}</td>
                      <td className="week-cell">
                        {new Date(word.weekStart).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        {word.isFeatured ? (
                          <span className="featured-badge">⭐ Featured</span>
                        ) : (
                          <span className="not-featured">-</span>
                        )}
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn-icon"
                          onClick={() => handleEdit(word)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDelete(word.id, word.lemma)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingWord ? 'Edit Word' : 'Add New Word'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="word-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="lemma">
                    Original Word <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="lemma"
                    name="lemma"
                    value={formData.lemma}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., ἀγάπη or אָהַב"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="language">
                    Language <span className="required">*</span>
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="GREEK">Greek</option>
                    <option value="HEBREW">Hebrew</option>
                    <option value="ARAMAIC">Aramaic</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="transliteration">
                    Transliteration <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="transliteration"
                    name="transliteration"
                    value={formData.transliteration}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., agape or ahav"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gloss">
                    Meaning/Gloss <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="gloss"
                    name="gloss"
                    value={formData.gloss}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., love"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="blurb">
                    Explanation <span className="required">*</span>
                  </label>
                  <textarea
                    id="blurb"
                    name="blurb"
                    value={formData.blurb}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="A short explanation about this word and its significance..."
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="verseRefs">
                    Verse References <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="verseRefs"
                    name="verseRefs"
                    value={formData.verseRefs}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., John 3:16, Romans 8:28, 1 Corinthians 13:4"
                  />
                  <small>Separate multiple verses with commas</small>
                </div>

                <div className="form-group">
                  <label htmlFor="weekStart">
                    Week Start Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="weekStart"
                    name="weekStart"
                    value={formData.weekStart}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                    />
                    <span>Feature this word</span>
                  </label>
                  <small>Only one word should be featured at a time</small>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingWord ? 'Update Word' : 'Create Word'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyWordAdminPage;
