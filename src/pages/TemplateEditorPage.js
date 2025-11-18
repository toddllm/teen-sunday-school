import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTemplates } from '../contexts/TemplateContext';
import './LessonCreatorPage.css';

const SECTION_TYPES = [
  { value: 'content', label: 'Content' },
  { value: 'scripture', label: 'Scripture Reading' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'game', label: 'Game/Activity' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'worship', label: 'Worship' },
];

const TemplateEditorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { templates, addTemplate, updateTemplate } = useTemplates();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sectionsJson: [],
  });

  useEffect(() => {
    if (id) {
      const template = templates.find(t => t.id === id);
      if (template) {
        setFormData({
          name: template.name,
          description: template.description || '',
          sectionsJson: template.sectionsJson || [],
        });
      }
    }
  }, [id, templates]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.sectionsJson.length === 0) {
      alert('Please add at least one section to the template.');
      return;
    }

    try {
      if (id) {
        await updateTemplate(id, formData);
        alert('Template updated successfully!');
      } else {
        await addTemplate(formData);
        alert('Template created successfully!');
      }
      navigate('/admin/templates');
    } catch (err) {
      alert('Failed to save template. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      name: '',
      type: 'content',
      timeEstimate: 10,
      placeholder: '',
    };
    setFormData(prev => ({
      ...prev,
      sectionsJson: [...prev.sectionsJson, newSection]
    }));
  };

  const removeSection = (index) => {
    setFormData(prev => ({
      ...prev,
      sectionsJson: prev.sectionsJson.filter((_, i) => i !== index)
    }));
  };

  const updateSection = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sectionsJson: prev.sectionsJson.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const moveSection = (index, direction) => {
    const newSections = [...formData.sectionsJson];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newSections.length) return;

    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];

    setFormData(prev => ({
      ...prev,
      sectionsJson: newSections
    }));
  };

  const totalTime = formData.sectionsJson.reduce((sum, s) => sum + (parseInt(s.timeEstimate) || 0), 0);

  return (
    <div className="lesson-creator-page">
      <div className="creator-header">
        <h1>{id ? 'Edit Template' : 'Create New Template'}</h1>
        <button onClick={() => navigate('/admin/templates')} className="back-btn">
          Back to Templates
        </button>
      </div>

      <form onSubmit={handleSubmit} className="lesson-form">
        <div className="form-group">
          <label htmlFor="name">Template Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Standard 60-minute, Discussion-heavy"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Brief description of this template's purpose and structure"
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <label style={{ marginBottom: 0 }}>
              Sections ({formData.sectionsJson.length}) - Total Time: {totalTime} minutes
            </label>
            <button type="button" onClick={addSection} className="btn btn-primary btn-small">
              + Add Section
            </button>
          </div>

          {formData.sectionsJson.length === 0 ? (
            <div style={{
              padding: '30px',
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              border: '2px dashed #ddd'
            }}>
              <p style={{ color: '#666', marginBottom: '15px' }}>No sections yet. Add your first section to get started!</p>
              <button type="button" onClick={addSection} className="btn btn-primary">
                + Add Section
              </button>
            </div>
          ) : (
            <div className="sections-list">
              {formData.sectionsJson.map((section, index) => (
                <div key={section.id} className="section-card" style={{
                  padding: '20px',
                  marginBottom: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0 }}>Section {index + 1}</h4>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        type="button"
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                        className="btn btn-small"
                        title="Move up"
                        style={{ opacity: index === 0 ? 0.5 : 1 }}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === formData.sectionsJson.length - 1}
                        className="btn btn-small"
                        title="Move down"
                        style={{ opacity: index === formData.sectionsJson.length - 1 ? 0.5 : 1 }}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="btn btn-small btn-danger"
                        title="Remove section"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Section Name *</label>
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e) => updateSection(index, 'name', e.target.value)}
                        required
                        placeholder="e.g., Introduction, Discussion"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Type *</label>
                      <select
                        value={section.type}
                        onChange={(e) => updateSection(index, 'type', e.target.value)}
                        required
                      >
                        {SECTION_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', marginTop: '15px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Time (minutes) *</label>
                      <input
                        type="number"
                        value={section.timeEstimate}
                        onChange={(e) => updateSection(index, 'timeEstimate', parseInt(e.target.value) || 0)}
                        required
                        min="1"
                        max="120"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Placeholder Text</label>
                      <input
                        type="text"
                        value={section.placeholder}
                        onChange={(e) => updateSection(index, 'placeholder', e.target.value)}
                        placeholder="Guidance text for lesson creators"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/templates')} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="save-btn">
            {id ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateEditorPage;
