import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDevotionals } from '../contexts/DevotionalContext';
import { createEmptyDevotional, validateDevotional, parsePassageRef } from '../services/devotionalService';
import './DevotionalEditorPage.css';

const DevotionalEditorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getDevotionalById, addDevotional, updateDevotional } = useDevotionals();

  const [formData, setFormData] = useState(createEmptyDevotional());
  const [passageInput, setPassageInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (id) {
      const devotional = getDevotionalById(id);
      if (devotional) {
        setFormData(devotional);
      } else {
        alert('Devotional not found');
        navigate('/admin/devotionals');
      }
    }
  }, [id, getDevotionalById, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    const validation = validateDevotional(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors([]);

    if (id) {
      updateDevotional(id, formData);
      setSuccessMessage('Devotional updated successfully!');
    } else {
      const newId = addDevotional(formData);
      setSuccessMessage('Devotional created successfully!');
      setTimeout(() => {
        navigate(`/admin/devotionals/edit/${newId}`);
      }, 1000);
    }

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBodyChange = (content) => {
    setFormData(prev => ({
      ...prev,
      body: content
    }));
  };

  const handleAddPassage = () => {
    if (!passageInput.trim()) return;

    const parsed = parsePassageRef(passageInput.trim());
    if (!parsed) {
      alert('Invalid passage reference. Use format: Book Chapter:Verse (e.g., John 3:16)');
      return;
    }

    // Check if already exists
    const exists = formData.passageRefs?.some(ref => ref.ref === parsed.ref);
    if (exists) {
      alert('This passage is already added');
      return;
    }

    setFormData(prev => ({
      ...prev,
      passageRefs: [...(prev.passageRefs || []), parsed]
    }));

    setPassageInput('');
  };

  const handleRemovePassage = (refToRemove) => {
    setFormData(prev => ({
      ...prev,
      passageRefs: prev.passageRefs.filter(ref => ref.ref !== refToRemove)
    }));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    const tag = tagInput.trim().toLowerCase();

    // Check if already exists
    if (formData.tags?.includes(tag)) {
      alert('This tag is already added');
      return;
    }

    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tag]
    }));

    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e, handler) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handler();
    }
  };

  // React-Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'link'],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'blockquote', 'link', 'align'
  ];

  return (
    <div className="devotional-editor-page">
      <div className="container">
        <div className="editor-header">
          <h1>{id ? 'Edit Devotional' : 'Create New Devotional'}</h1>
          <button onClick={() => navigate('/admin/devotionals')} className="btn btn-outline">
            ← Back to Devotionals
          </button>
        </div>

        {errors.length > 0 && (
          <div className="error-message">
            <strong>Please fix the following errors:</strong>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="devotional-form">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h2>Basic Information</h2>

              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter devotional title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subtitle">Subtitle</label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="Optional subtitle"
                />
              </div>

              <div className="form-group">
                <label htmlFor="author">Author</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Author name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., spiritual-growth, prayer, faith"
                />
                <small className="form-help">Use lowercase with hyphens</small>
              </div>
            </div>

            {/* Publishing Settings */}
            <div className="form-section">
              <h2>Publishing Settings</h2>

              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="publishAt">Publish Date *</label>
                <input
                  type="date"
                  id="publishAt"
                  name="publishAt"
                  value={formData.publishAt}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="expiryAt">Expiry Date (Optional)</label>
                <input
                  type="date"
                  id="expiryAt"
                  name="expiryAt"
                  value={formData.expiryAt || ''}
                  onChange={handleChange}
                />
                <small className="form-help">Leave empty for no expiry</small>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                  />
                  <span>Featured Devotional</span>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="targetType">Target Audience</label>
                <select
                  id="targetType"
                  name="targetType"
                  value={formData.targetType}
                  onChange={handleChange}
                >
                  <option value="global">Global (All Users)</option>
                  <option value="plan">Specific Plan</option>
                  <option value="group">Specific Group</option>
                </select>
              </div>

              {formData.targetType !== 'global' && (
                <div className="form-group">
                  <label htmlFor="targetId">Target ID</label>
                  <input
                    type="text"
                    id="targetId"
                    name="targetId"
                    value={formData.targetId || ''}
                    onChange={handleChange}
                    placeholder="Enter plan or group ID"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div className="form-section full-width">
            <h2>Content *</h2>
            <div className="form-group">
              <ReactQuill
                theme="snow"
                value={formData.body}
                onChange={handleBodyChange}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Write your devotional content here..."
              />
            </div>
          </div>

          {/* Passage References */}
          <div className="form-section full-width">
            <h2>Bible Passages</h2>
            <div className="form-group">
              <label>Add Passage Reference</label>
              <div className="input-with-button">
                <input
                  type="text"
                  value={passageInput}
                  onChange={(e) => setPassageInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleAddPassage)}
                  placeholder="e.g., John 3:16 or Psalm 23:1-6"
                />
                <button
                  type="button"
                  onClick={handleAddPassage}
                  className="btn btn-secondary"
                >
                  Add Passage
                </button>
              </div>
              <small className="form-help">
                Format: Book Chapter:Verse or Book Chapter:Verse-Verse
              </small>
            </div>

            {formData.passageRefs && formData.passageRefs.length > 0 && (
              <div className="items-list">
                {formData.passageRefs.map((passage) => (
                  <div key={passage.ref} className="item-tag">
                    <span>{passage.ref}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePassage(passage.ref)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="form-section full-width">
            <h2>Tags</h2>
            <div className="form-group">
              <label>Add Tag</label>
              <div className="input-with-button">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleAddTag)}
                  placeholder="e.g., faith, prayer, hope"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn btn-secondary"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {formData.tags && formData.tags.length > 0 && (
              <div className="items-list">
                {formData.tags.map((tag) => (
                  <div key={tag} className="item-tag">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/devotionals')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, status: 'draft' }));
                setTimeout(() => handleSubmit({ preventDefault: () => {} }), 0);
              }}
              className="btn btn-secondary"
            >
              Save as Draft
            </button>
            <button type="submit" className="btn btn-primary">
              {id ? 'Update Devotional' : 'Create Devotional'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DevotionalEditorPage;
