import React, { createContext, useContext, useState, useEffect } from 'react';

const ServiceProjectContext = createContext();

export const useServiceProjects = () => {
  const context = useContext(ServiceProjectContext);
  if (!context) {
    throw new Error('useServiceProjects must be used within ServiceProjectProvider');
  }
  return context;
};

// Pre-built project templates
const PROJECT_TEMPLATES = [
  {
    id: 'template-food-drive',
    name: 'Food Drive',
    description: 'Organize a food collection event for local food banks',
    category: 'Community Service',
    estimatedDuration: '2-4 weeks',
    participantCount: '10-50',
    defaultTasks: [
      { name: 'Contact local food bank', category: 'Planning', daysFromStart: 0 },
      { name: 'Create donation list of needed items', category: 'Planning', daysFromStart: 1 },
      { name: 'Design promotional materials', category: 'Marketing', daysFromStart: 3 },
      { name: 'Set up collection points', category: 'Logistics', daysFromStart: 7 },
      { name: 'Promote event to congregation', category: 'Marketing', daysFromStart: 7 },
      { name: 'Organize volunteer shifts', category: 'Volunteers', daysFromStart: 10 },
      { name: 'Collect donations', category: 'Execution', daysFromStart: 14 },
      { name: 'Sort and organize donations', category: 'Execution', daysFromStart: 21 },
      { name: 'Deliver to food bank', category: 'Execution', daysFromStart: 22 },
      { name: 'Thank volunteers and donors', category: 'Follow-up', daysFromStart: 23 }
    ],
    resources: [
      { item: 'Collection boxes/bins', quantity: '5-10', cost: '$50-100' },
      { item: 'Promotional flyers', quantity: '100-200', cost: '$20-40' },
      { item: 'Transportation for delivery', quantity: '1 vehicle', cost: 'Volunteer' }
    ],
    impactMetrics: ['Pounds of food collected', 'Number of families helped', 'Volunteer hours']
  },
  {
    id: 'template-community-cleanup',
    name: 'Community Cleanup',
    description: 'Organize a neighborhood or park cleanup event',
    category: 'Environmental',
    estimatedDuration: '1-2 weeks',
    participantCount: '15-40',
    defaultTasks: [
      { name: 'Identify cleanup location', category: 'Planning', daysFromStart: 0 },
      { name: 'Get permission from property owner/city', category: 'Planning', daysFromStart: 1 },
      { name: 'Purchase cleanup supplies', category: 'Logistics', daysFromStart: 5 },
      { name: 'Recruit volunteers', category: 'Volunteers', daysFromStart: 5 },
      { name: 'Schedule cleanup day', category: 'Planning', daysFromStart: 6 },
      { name: 'Arrange waste disposal', category: 'Logistics', daysFromStart: 7 },
      { name: 'Conduct safety briefing', category: 'Execution', daysFromStart: 10 },
      { name: 'Execute cleanup event', category: 'Execution', daysFromStart: 10 },
      { name: 'Dispose of collected waste', category: 'Execution', daysFromStart: 10 },
      { name: 'Document impact with photos', category: 'Follow-up', daysFromStart: 10 },
      { name: 'Share results with community', category: 'Follow-up', daysFromStart: 11 }
    ],
    resources: [
      { item: 'Trash bags', quantity: '50-100', cost: '$30-50' },
      { item: 'Work gloves', quantity: '30 pairs', cost: '$60-90' },
      { item: 'Safety vests', quantity: '20', cost: '$40-60' },
      { item: 'First aid kit', quantity: '1', cost: '$25' },
      { item: 'Water and snacks', quantity: 'For all volunteers', cost: '$50-100' }
    ],
    impactMetrics: ['Bags of trash collected', 'Area cleaned (acres)', 'Volunteer hours']
  },
  {
    id: 'template-elderly-care',
    name: 'Elderly Care & Visitation',
    description: 'Visit and assist elderly members or nursing home residents',
    category: 'Compassion',
    estimatedDuration: 'Ongoing',
    participantCount: '5-20',
    defaultTasks: [
      { name: 'Contact nursing home or identify homebound seniors', category: 'Planning', daysFromStart: 0 },
      { name: 'Background checks for volunteers', category: 'Planning', daysFromStart: 3 },
      { name: 'Train volunteers on best practices', category: 'Training', daysFromStart: 7 },
      { name: 'Create visitation schedule', category: 'Planning', daysFromStart: 10 },
      { name: 'Prepare activities/crafts', category: 'Preparation', daysFromStart: 12 },
      { name: 'First visitation', category: 'Execution', daysFromStart: 14 },
      { name: 'Regular weekly visits', category: 'Execution', daysFromStart: 21 },
      { name: 'Document stories and feedback', category: 'Follow-up', daysFromStart: 28 }
    ],
    resources: [
      { item: 'Activity supplies (cards, puzzles, crafts)', quantity: 'Various', cost: '$50-100' },
      { item: 'Transportation', quantity: 'Per volunteer', cost: 'Volunteer' },
      { item: 'Small gifts/care packages', quantity: '10-20', cost: '$50-150' }
    ],
    impactMetrics: ['Number of seniors visited', 'Total visits', 'Volunteer hours', 'Relationships formed']
  },
  {
    id: 'template-homeless-outreach',
    name: 'Homeless Outreach',
    description: 'Prepare and distribute care packages or meals to homeless individuals',
    category: 'Compassion',
    estimatedDuration: '1-3 weeks',
    participantCount: '10-30',
    defaultTasks: [
      { name: 'Research local homeless population needs', category: 'Planning', daysFromStart: 0 },
      { name: 'Create care package list', category: 'Planning', daysFromStart: 2 },
      { name: 'Collect donations/supplies', category: 'Logistics', daysFromStart: 5 },
      { name: 'Organize assembly event', category: 'Planning', daysFromStart: 10 },
      { name: 'Assemble care packages', category: 'Execution', daysFromStart: 12 },
      { name: 'Plan distribution route/locations', category: 'Planning', daysFromStart: 13 },
      { name: 'Brief volunteers on safety', category: 'Training', daysFromStart: 14 },
      { name: 'Distribute care packages', category: 'Execution', daysFromStart: 15 },
      { name: 'Debrief and share experiences', category: 'Follow-up', daysFromStart: 16 }
    ],
    resources: [
      { item: 'Toiletries (soap, shampoo, toothbrush)', quantity: '30 sets', cost: '$60-100' },
      { item: 'Socks and gloves', quantity: '30 pairs each', cost: '$100-150' },
      { item: 'Non-perishable snacks', quantity: '30 packages', cost: '$50-80' },
      { item: 'Water bottles', quantity: '50', cost: '$20-30' },
      { item: 'Gallon ziplock bags', quantity: '30', cost: '$10' }
    ],
    impactMetrics: ['Care packages distributed', 'People served', 'Volunteer hours']
  },
  {
    id: 'template-school-supply-drive',
    name: 'School Supply Drive',
    description: 'Collect and distribute school supplies to students in need',
    category: 'Education',
    estimatedDuration: '2-3 weeks',
    participantCount: '10-40',
    defaultTasks: [
      { name: 'Partner with local schools', category: 'Planning', daysFromStart: 0 },
      { name: 'Identify supply needs', category: 'Planning', daysFromStart: 3 },
      { name: 'Create donation list', category: 'Planning', daysFromStart: 5 },
      { name: 'Launch collection campaign', category: 'Marketing', daysFromStart: 7 },
      { name: 'Set up collection points', category: 'Logistics', daysFromStart: 7 },
      { name: 'Collect supplies', category: 'Execution', daysFromStart: 14 },
      { name: 'Sort and organize supplies', category: 'Execution', daysFromStart: 18 },
      { name: 'Package for distribution', category: 'Execution', daysFromStart: 19 },
      { name: 'Deliver to schools', category: 'Execution', daysFromStart: 20 }
    ],
    resources: [
      { item: 'Collection bins', quantity: '5-10', cost: '$40-80' },
      { item: 'Sorting tables/space', quantity: '1 room', cost: 'Volunteer' },
      { item: 'Backpacks (if providing)', quantity: '20-50', cost: '$200-500' }
    ],
    impactMetrics: ['Supply items collected', 'Students helped', 'Schools partnered with']
  },
  {
    id: 'template-habitat-build',
    name: 'Habitat for Humanity Build',
    description: 'Participate in a Habitat for Humanity construction project',
    category: 'Community Service',
    estimatedDuration: '1 day - ongoing',
    participantCount: '10-20',
    defaultTasks: [
      { name: 'Contact local Habitat chapter', category: 'Planning', daysFromStart: 0 },
      { name: 'Register team for build day', category: 'Planning', daysFromStart: 7 },
      { name: 'Collect volunteer waivers', category: 'Logistics', daysFromStart: 10 },
      { name: 'Safety training session', category: 'Training', daysFromStart: 12 },
      { name: 'Organize transportation', category: 'Logistics', daysFromStart: 13 },
      { name: 'Participate in build day', category: 'Execution', daysFromStart: 14 },
      { name: 'Team photo and reflection', category: 'Follow-up', daysFromStart: 14 }
    ],
    resources: [
      { item: 'Work gloves', quantity: '20 pairs', cost: '$40-60' },
      { item: 'Water and lunch', quantity: 'For all volunteers', cost: '$80-120' },
      { item: 'Transportation', quantity: '2-3 vehicles', cost: 'Volunteer' },
      { item: 'Donation to Habitat', quantity: 'Optional', cost: '$100-500' }
    ],
    impactMetrics: ['Hours contributed', 'Volunteers participated', 'Families helped']
  }
];

export const ServiceProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load projects from localStorage on mount
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('serviceProjects');
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } catch (error) {
      console.error('Error loading service projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('serviceProjects', JSON.stringify(projects));
      } catch (error) {
        console.error('Error saving service projects:', error);
      }
    }
  }, [projects, loading]);

  const addProject = (project) => {
    const newProject = {
      ...project,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'planning' // planning, active, completed, cancelled
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (id, updates) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      )
    );
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const duplicateProject = (id) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      const duplicate = {
        ...project,
        id: `project-${Date.now()}`,
        name: `${project.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'planning'
      };
      setProjects(prev => [...prev, duplicate]);
      return duplicate;
    }
  };

  const getProjectById = (id) => {
    return projects.find(project => project.id === id);
  };

  const getProjectsByStatus = (status) => {
    return projects.filter(project => project.status === status);
  };

  const updateTaskStatus = (projectId, taskIndex, completed) => {
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          const updatedTasks = [...project.tasks];
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            completed,
            completedAt: completed ? new Date().toISOString() : null
          };
          return {
            ...project,
            tasks: updatedTasks,
            updatedAt: new Date().toISOString()
          };
        }
        return project;
      })
    );
  };

  const addVolunteer = (projectId, volunteer) => {
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            volunteers: [...(project.volunteers || []), volunteer],
            updatedAt: new Date().toISOString()
          };
        }
        return project;
      })
    );
  };

  const removeVolunteer = (projectId, volunteerId) => {
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            volunteers: (project.volunteers || []).filter(v => v.id !== volunteerId),
            updatedAt: new Date().toISOString()
          };
        }
        return project;
      })
    );
  };

  const createFromTemplate = (templateId) => {
    const template = PROJECT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const newProject = {
        name: template.name,
        description: template.description,
        category: template.category,
        estimatedDuration: template.estimatedDuration,
        participantCount: template.participantCount,
        tasks: template.defaultTasks.map((task, index) => ({
          ...task,
          id: `task-${index}`,
          completed: false,
          completedAt: null
        })),
        resources: template.resources.map((resource, index) => ({
          ...resource,
          id: `resource-${index}`,
          acquired: false
        })),
        impactMetrics: template.impactMetrics.map((metric, index) => ({
          name: metric,
          value: 0,
          id: `metric-${index}`
        })),
        volunteers: [],
        budget: {
          estimated: 0,
          actual: 0,
          expenses: []
        },
        startDate: null,
        endDate: null,
        notes: ''
      };
      return addProject(newProject);
    }
  };

  const value = {
    projects,
    loading,
    templates: PROJECT_TEMPLATES,
    addProject,
    updateProject,
    deleteProject,
    duplicateProject,
    getProjectById,
    getProjectsByStatus,
    updateTaskStatus,
    addVolunteer,
    removeVolunteer,
    createFromTemplate
  };

  return (
    <ServiceProjectContext.Provider value={value}>
      {children}
    </ServiceProjectContext.Provider>
  );
};
