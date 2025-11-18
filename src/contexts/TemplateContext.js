import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const TemplateContext = createContext();

export const useTemplates = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
};

// Check if backend API is available
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const USE_API = process.env.REACT_APP_USE_API === 'true';

export const TemplateProvider = ({ children }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);

    if (USE_API) {
      try {
        const response = await axios.get(`${API_URL}/lesson-templates`, {
          headers: getAuthHeaders(),
        });
        setTemplates(response.data);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load templates');
        // Fallback to localStorage
        loadFromLocalStorage();
      }
    } else {
      // Use localStorage for development
      loadFromLocalStorage();
    }

    setLoading(false);
  };

  const loadFromLocalStorage = () => {
    const storedTemplates = localStorage.getItem('lesson-templates');
    if (storedTemplates) {
      try {
        setTemplates(JSON.parse(storedTemplates));
      } catch (error) {
        console.error('Error loading templates from localStorage:', error);
        // Load default templates
        loadDefaultTemplates();
      }
    } else {
      loadDefaultTemplates();
    }
  };

  const loadDefaultTemplates = () => {
    const defaultTemplates = [
      {
        id: 'template-standard-60',
        name: 'Standard 60-minute',
        description: 'A balanced lesson structure for a 60-minute session',
        sectionsJson: [
          { id: 'welcome', name: 'Welcome & Opening', type: 'content', timeEstimate: 5, placeholder: 'Greet students and set the tone for the lesson' },
          { id: 'intro', name: 'Introduction', type: 'content', timeEstimate: 5, placeholder: 'Introduce today\'s topic and big idea' },
          { id: 'read', name: 'Read Together', type: 'scripture', timeEstimate: 10, placeholder: 'Read and discuss the scripture passage' },
          { id: 'discuss', name: 'Discussion Questions', type: 'discussion', timeEstimate: 15, placeholder: 'Engage students with thought-provoking questions' },
          { id: 'apply', name: 'Application', type: 'content', timeEstimate: 10, placeholder: 'Help students apply the lesson to their lives' },
          { id: 'game', name: 'Game Time', type: 'game', timeEstimate: 15, placeholder: 'Reinforce learning through fun activities' },
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'template-discussion-heavy',
        name: 'Discussion-heavy',
        description: 'Focus on deep conversations and student engagement',
        sectionsJson: [
          { id: 'intro', name: 'Introduction', type: 'content', timeEstimate: 5, placeholder: 'Set the stage for discussion' },
          { id: 'read', name: 'Read Together', type: 'scripture', timeEstimate: 10, placeholder: 'Read the scripture passage' },
          { id: 'discuss1', name: 'Small Group Discussion', type: 'discussion', timeEstimate: 15, placeholder: 'Break into small groups for initial discussion' },
          { id: 'discuss2', name: 'Large Group Discussion', type: 'discussion', timeEstimate: 20, placeholder: 'Share insights from small groups' },
          { id: 'apply', name: 'Personal Application', type: 'content', timeEstimate: 10, placeholder: 'Individual reflection and commitment' },
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'template-game-first',
        name: 'Game-first',
        description: 'Start with engaging activities to capture attention',
        sectionsJson: [
          { id: 'icebreaker', name: 'Ice Breaker Game', type: 'game', timeEstimate: 10, placeholder: 'Fun activity to energize the group' },
          { id: 'intro', name: 'Introduction', type: 'content', timeEstimate: 5, placeholder: 'Connect the game to the lesson' },
          { id: 'read', name: 'Scripture Reading', type: 'scripture', timeEstimate: 10, placeholder: 'Read the Bible passage together' },
          { id: 'discuss', name: 'Discussion', type: 'discussion', timeEstimate: 15, placeholder: 'Discuss key themes and questions' },
          { id: 'activity', name: 'Learning Activity', type: 'game', timeEstimate: 15, placeholder: 'Hands-on activity to reinforce concepts' },
          { id: 'closing', name: 'Closing & Prayer', type: 'content', timeEstimate: 5, placeholder: 'Wrap up and pray together' },
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
    setTemplates(defaultTemplates);
    localStorage.setItem('lesson-templates', JSON.stringify(defaultTemplates));
  };

  // Save templates to localStorage whenever they change (if not using API)
  useEffect(() => {
    if (!loading && !USE_API && templates.length > 0) {
      localStorage.setItem('lesson-templates', JSON.stringify(templates));
    }
  }, [templates, loading]);

  const addTemplate = async (template) => {
    if (USE_API) {
      try {
        const response = await axios.post(
          `${API_URL}/admin/lesson-templates`,
          template,
          { headers: getAuthHeaders() }
        );
        setTemplates([...templates, response.data]);
        return response.data.id;
      } catch (err) {
        console.error('Error creating template:', err);
        setError('Failed to create template');
        throw err;
      }
    } else {
      const newTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTemplates([...templates, newTemplate]);
      return newTemplate.id;
    }
  };

  const updateTemplate = async (id, updates) => {
    if (USE_API) {
      try {
        const response = await axios.patch(
          `${API_URL}/admin/lesson-templates/${id}`,
          updates,
          { headers: getAuthHeaders() }
        );
        setTemplates(templates.map(t => t.id === id ? response.data : t));
      } catch (err) {
        console.error('Error updating template:', err);
        setError('Failed to update template');
        throw err;
      }
    } else {
      setTemplates(templates.map(template =>
        template.id === id
          ? { ...template, ...updates, updatedAt: new Date().toISOString() }
          : template
      ));
    }
  };

  const deleteTemplate = async (id) => {
    if (USE_API) {
      try {
        await axios.delete(`${API_URL}/admin/lesson-templates/${id}`, {
          headers: getAuthHeaders(),
        });
        setTemplates(templates.filter(t => t.id !== id));
      } catch (err) {
        console.error('Error deleting template:', err);
        setError('Failed to delete template');
        throw err;
      }
    } else {
      setTemplates(templates.filter(template => template.id !== id));
    }
  };

  const getTemplateById = (id) => {
    return templates.find(template => template.id === id);
  };

  const recordTemplateUsage = async (templateId, lessonId = null) => {
    if (USE_API) {
      try {
        await axios.post(
          `${API_URL}/lesson-templates/usage`,
          { templateId, lessonId },
          { headers: getAuthHeaders() }
        );
      } catch (err) {
        console.error('Error recording template usage:', err);
        // Don't throw error - usage tracking is not critical
      }
    }
    // localStorage doesn't need usage tracking
  };

  const getTemplateStats = async () => {
    if (USE_API) {
      try {
        const response = await axios.get(`${API_URL}/lesson-templates/stats`, {
          headers: getAuthHeaders(),
        });
        return response.data;
      } catch (err) {
        console.error('Error fetching template stats:', err);
        return null;
      }
    } else {
      // Return mock stats for localStorage mode
      return {
        totalTemplates: templates.length,
        totalLessonsFromTemplates: 0,
        totalLessons: 0,
        percentageFromTemplates: 0,
        mostUsedTemplates: templates.map(t => ({
          id: t.id,
          name: t.name,
          usageCount: 0,
        })),
      };
    }
  };

  const value = {
    templates,
    loading,
    error,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    recordTemplateUsage,
    getTemplateStats,
    refreshTemplates: loadTemplates,
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};
