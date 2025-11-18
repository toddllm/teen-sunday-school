import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSeries } from '../contexts/SeriesContext';
import { useLessons } from '../contexts/LessonContext';
import { useAuth } from '../contexts/AuthContext';
import './SeriesEditorPage.css';

function SeriesEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createSeries, updateSeries, getSeriesById, updateSeriesLessons } = useSeries();
  const { lessons } = useLessons();
  const { hasRole } = useAuth();

  const isEditMode = !!id;
  const canManage = hasRole('TEACHER') || hasRole('ORG_ADMIN') || hasRole('SUPER_ADMIN');

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    tags: [],
    ageMin: '',
    ageMax: '',
    thumbnailUrl: '',
    isPublic: false,
    isActive: true,
  });

  const [seriesLessons, setSeriesLessons] = useState([]);
  const [availableLessons, setAvailableLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Load series data if editing
  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      getSeriesById(id).then((series) => {
        if (series) {
          setFormData({
            title: series.title,
            subtitle: series.subtitle || '',
            description: series.description || '',
            tags: series.tags || [],
            ageMin: series.ageMin || '',
            ageMax: series.ageMax || '',
            thumbnailUrl: series.thumbnailUrl || '',
            isPublic: series.isPublic,
            isActive: series.isActive,
          });
          setSeriesLessons(
            series.lessons.map((sl) => ({
              lessonId: sl.lesson.id,
              orderIndex: sl.orderIndex,
              scheduledDate: sl.scheduledDate || '',
              lesson: sl.lesson,
            }))
          );
        }
        setLoading(false);
      });
    }
  }, [id, isEditMode, getSeriesById]);

  // Update available lessons
  useEffect(() => {
    const usedLessonIds = new Set(seriesLessons.map((sl) => sl.lessonId));
    setAvailableLessons(lessons.filter((l) => !usedLessonIds.has(l.id)));
  }, [lessons, seriesLessons]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddLesson = () => {
    if (!selectedLesson) return;

    const lesson = lessons.find((l) => l.id === selectedLesson);
    if (!lesson) return;

    setSeriesLessons((prev) => [
      ...prev,
      {
        lessonId: lesson.id,
        orderIndex: prev.length,
        scheduledDate: '',
        lesson,
      },
    ]);
    setSelectedLesson('');
  };

  const handleRemoveLesson = (index) => {
    setSeriesLessons((prev) => {
      const newLessons = prev.filter((_, i) => i !== index);
      return newLessons.map((sl, i) => ({ ...sl, orderIndex: i }));
    });
  };

  const handleLessonDateChange = (index, date) => {
    setSeriesLessons((prev) =>
      prev.map((sl, i) => (i === index ? { ...sl, scheduledDate: date } : sl))
    );
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newLessons = [...seriesLessons];
    const draggedItem = newLessons[draggedIndex];
    newLessons.splice(draggedIndex, 1);
    newLessons.splice(index, 0, draggedItem);

    setSeriesLessons(newLessons.map((sl, i) => ({ ...sl, orderIndex: i })));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    setLoading(true);

    try {
      const seriesData = {
        ...formData,
        ageMin: formData.ageMin ? parseInt(formData.ageMin) : null,
        ageMax: formData.ageMax ? parseInt(formData.ageMax) : null,
        lessons: seriesLessons.map((sl) => ({
          lessonId: sl.lessonId,
          orderIndex: sl.orderIndex,
          scheduledDate: sl.scheduledDate || null,
        })),
      };

      if (isEditMode) {
        // Update series metadata
        await updateSeries(id, {
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          tags: formData.tags,
          ageMin: seriesData.ageMin,
          ageMax: seriesData.ageMax,
          thumbnailUrl: formData.thumbnailUrl,
          isPublic: formData.isPublic,
          isActive: formData.isActive,
        });
        // Update lessons separately
        await updateSeriesLessons(id, seriesData.lessons);
        alert('Series updated successfully!');
      } else {
        await createSeries(seriesData);
        alert('Series created successfully!');
      }

      navigate('/admin/series');
    } catch (error) {
      alert(`Failed to ${isEditMode ? 'update' : 'create'} series: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!canManage) {
    return (
      <div className="series-editor-page">
        <div className="container">
          <div className="error-message">
            <h2>Access Denied</h2>
            <p>You don't have permission to manage series.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="series-editor-page">
      <div className="container">
        <div className="editor-header">
          <h1>{isEditMode ? 'Edit Series' : 'Create New Series'}</h1>
          <button onClick={() => navigate('/admin/series')} className="btn btn-secondary">
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="series-form">
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Fruit of the Spirit"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subtitle">Subtitle</label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="e.g., 4 Weeks"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe what this series covers..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="thumbnailUrl">Thumbnail URL</label>
              <input
                type="url"
                id="thumbnailUrl"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Target Audience</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ageMin">Minimum Age</label>
                <input
                  type="number"
                  id="ageMin"
                  name="ageMin"
                  value={formData.ageMin}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="e.g., 13"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ageMax">Maximum Age</label>
                <input
                  type="number"
                  id="ageMax"
                  name="ageMax"
                  value={formData.ageMax}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="e.g., 18"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Tags</h2>
            <div className="tag-input-group">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag (e.g., 'Character', 'Bible Study')"
              />
              <button type="button" onClick={handleAddTag} className="btn btn-secondary">
                Add Tag
              </button>
            </div>
            <div className="tags-display">
              {formData.tags.map((tag, i) => (
                <span key={i} className="tag">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="tag-remove">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Lessons</h2>
            <p className="section-description">
              Add lessons to this series and drag to reorder them.
            </p>

            <div className="lesson-selector">
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
              >
                <option value="">Select a lesson to add...</option>
                {availableLessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title} ({lesson.quarter}/{lesson.unit}/{lesson.lessonNumber})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddLesson}
                disabled={!selectedLesson}
                className="btn btn-primary"
              >
                Add Lesson
              </button>
            </div>

            <div className="series-lessons-list">
              {seriesLessons.length === 0 ? (
                <div className="empty-lessons">
                  No lessons added yet. Select lessons from the dropdown above.
                </div>
              ) : (
                seriesLessons.map((sl, index) => (
                  <div
                    key={sl.lessonId}
                    className="lesson-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="lesson-drag-handle">⋮⋮</div>
                    <div className="lesson-order">{index + 1}</div>
                    <div className="lesson-info">
                      <div className="lesson-title">{sl.lesson.title}</div>
                      <div className="lesson-scripture">{sl.lesson.scripture}</div>
                    </div>
                    <div className="lesson-date">
                      <input
                        type="date"
                        value={sl.scheduledDate}
                        onChange={(e) => handleLessonDateChange(index, e.target.value)}
                        placeholder="Scheduled date (optional)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLesson(index)}
                      className="btn btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="form-section">
            <h2>Settings</h2>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                />
                <span>Make this series public</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <span>Series is active</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : isEditMode ? 'Update Series' : 'Create Series'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/series')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SeriesEditorPage;
