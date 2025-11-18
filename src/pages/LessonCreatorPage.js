import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLessons } from '../contexts/LessonContext';
import './LessonCreatorPage.css';

const LessonCreatorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { lessons, addLesson, updateLesson } = useLessons();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bibleVerses: [],
    slides: [],
    games: []
  });

  useEffect(() => {
    if (id) {
      const lesson = lessons.find(l => l.id === id);
      if (lesson) {
        setFormData(lesson);
      }
    }
  }, [id, lessons]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (id) {
      updateLesson(id, formData);
    } else {
      addLesson(formData);
    }

    navigate('/admin');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="lesson-creator-page">
      <div className="creator-header">
        <h1>{id ? 'Edit Lesson' : 'Create New Lesson'}</h1>
        <button onClick={() => navigate('/admin')} className="back-btn">
          Back to Admin
        </button>
      </div>

      <form onSubmit={handleSubmit} className="lesson-form">
        <div className="form-group">
          <label htmlFor="title">Lesson Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter lesson title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Enter lesson description"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin')} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="save-btn">
            {id ? 'Update Lesson' : 'Create Lesson'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonCreatorPage;
