import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLessons } from '../contexts/LessonContext';
import { useTemplates } from '../contexts/TemplateContext';
import './LessonCreatorPage.css';

const LessonCreatorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { lessons, addLesson, updateLesson } = useLessons();
  const { templates, recordTemplateUsage } = useTemplates();

  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bibleVerses: [],
    slides: [],
    games: [],
    templateSections: null // Store template sections for reference
  });

  useEffect(() => {
    if (id) {
      const lesson = lessons.find(l => l.id === id);
      if (lesson) {
        setFormData(lesson);
      }
    }
  }, [id, lessons]);

  const handleTemplateSelect = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);

    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        // Pre-fill the form with template structure
        setFormData(prev => ({
          ...prev,
          description: template.description || prev.description,
          templateSections: template.sectionsJson,
        }));
      }
    } else {
      // Clear template sections
      setFormData(prev => ({
        ...prev,
        templateSections: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (id) {
      updateLesson(id, formData);
    } else {
      const lessonId = addLesson(formData);

      // Record template usage if a template was used
      if (selectedTemplateId && lessonId) {
        try {
          await recordTemplateUsage(selectedTemplateId, lessonId);
        } catch (err) {
          console.error('Failed to record template usage:', err);
        }
      }
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
        {!id && templates.length > 0 && (
          <div className="form-group" style={{
            padding: '20px',
            backgroundColor: '#f0f7ff',
            borderRadius: '8px',
            border: '1px solid #b3d9ff',
            marginBottom: '30px'
          }}>
            <label htmlFor="template">Start with a Template (Optional)</label>
            <select
              id="template"
              value={selectedTemplateId}
              onChange={handleTemplateSelect}
              style={{ marginTop: '10px' }}
            >
              <option value="">-- Select a template --</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.sectionsJson?.length || 0} sections,
                  {template.sectionsJson?.reduce((sum, s) => sum + (s.timeEstimate || 0), 0) || 0} min)
                </option>
              ))}
            </select>
            {selectedTemplateId && (
              <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff', borderRadius: '4px' }}>
                <strong>Template Structure:</strong>
                <ul style={{ margin: '10px 0 0 20px', listStyle: 'disc' }}>
                  {formData.templateSections?.map((section, index) => (
                    <li key={index}>
                      <strong>{section.name}</strong> ({section.timeEstimate} min) - {section.type}
                      {section.placeholder && <div style={{ fontSize: '0.9em', color: '#666', marginTop: '3px' }}>{section.placeholder}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

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
