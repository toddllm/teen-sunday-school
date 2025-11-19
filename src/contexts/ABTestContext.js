import React, { createContext, useContext, useState, useEffect } from 'react';

const ABTestContext = createContext();

export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within ABTestProvider');
  }
  return context;
};

// Generate or retrieve a persistent user ID
const getUserId = () => {
  let userId = localStorage.getItem('ab-user-id');
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('ab-user-id', userId);
  }
  return userId;
};

export const ABTestProvider = ({ children }) => {
  const [experiments, setExperiments] = useState([]);
  const [userAssignments, setUserAssignments] = useState({});
  const [experimentEvents, setExperimentEvents] = useState([]);
  const [userId] = useState(getUserId());

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedExperiments = JSON.parse(localStorage.getItem('ab-experiments') || '[]');
    const loadedAssignments = JSON.parse(localStorage.getItem('ab-user-assignments') || '{}');
    const loadedEvents = JSON.parse(localStorage.getItem('ab-experiment-events') || '[]');

    setExperiments(loadedExperiments);
    setUserAssignments(loadedAssignments);
    setExperimentEvents(loadedEvents);
  }, []);

  // Save experiments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ab-experiments', JSON.stringify(experiments));
  }, [experiments]);

  // Save assignments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ab-user-assignments', JSON.stringify(userAssignments));
  }, [userAssignments]);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ab-experiment-events', JSON.stringify(experimentEvents));
  }, [experimentEvents]);

  // Create a new experiment
  const createExperiment = (experimentData) => {
    const newExperiment = {
      id: `exp-${Date.now()}`,
      name: experimentData.name,
      description: experimentData.description || '',
      status: 'draft', // draft, active, paused, completed
      variants: experimentData.variants || [
        { id: 'control', name: 'Control', description: '' },
        { id: 'variant', name: 'Variant', description: '' }
      ],
      targetMetric: experimentData.targetMetric || 'completion_rate',
      audienceSplit: experimentData.audienceSplit || [50, 50], // percentage for each variant
      featureType: experimentData.featureType || 'plan', // plan, onboarding, feature
      createdAt: new Date().toISOString(),
      startedAt: null,
      endedAt: null,
      metadata: experimentData.metadata || {}
    };

    setExperiments(prev => [...prev, newExperiment]);
    return newExperiment;
  };

  // Update an experiment
  const updateExperiment = (experimentId, updates) => {
    setExperiments(prev =>
      prev.map(exp =>
        exp.id === experimentId
          ? { ...exp, ...updates, updatedAt: new Date().toISOString() }
          : exp
      )
    );
  };

  // Delete an experiment
  const deleteExperiment = (experimentId) => {
    setExperiments(prev => prev.filter(exp => exp.id !== experimentId));

    // Clean up assignments and events for this experiment
    const newAssignments = { ...userAssignments };
    delete newAssignments[experimentId];
    setUserAssignments(newAssignments);

    setExperimentEvents(prev =>
      prev.filter(event => event.experimentId !== experimentId)
    );
  };

  // Start an experiment
  const startExperiment = (experimentId) => {
    updateExperiment(experimentId, {
      status: 'active',
      startedAt: new Date().toISOString()
    });
  };

  // Pause an experiment
  const pauseExperiment = (experimentId) => {
    updateExperiment(experimentId, { status: 'paused' });
  };

  // Complete an experiment
  const completeExperiment = (experimentId) => {
    updateExperiment(experimentId, {
      status: 'completed',
      endedAt: new Date().toISOString()
    });
  };

  // Get variant for a user in an experiment (with automatic assignment)
  const getVariant = (experimentId) => {
    // Check if user already has an assignment
    if (userAssignments[experimentId]) {
      return userAssignments[experimentId];
    }

    // Find the experiment
    const experiment = experiments.find(exp => exp.id === experimentId);
    if (!experiment || experiment.status !== 'active') {
      return null;
    }

    // Assign user to a variant based on audience split
    const variant = assignVariant(experiment);

    // Save assignment
    setUserAssignments(prev => ({
      ...prev,
      [experimentId]: variant.id
    }));

    // Track assignment event
    trackEvent(experimentId, variant.id, 'user_assigned', {});

    return variant.id;
  };

  // Assign a variant based on the audience split
  const assignVariant = (experiment) => {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (let i = 0; i < experiment.variants.length; i++) {
      cumulative += experiment.audienceSplit[i] || (100 / experiment.variants.length);
      if (random <= cumulative) {
        return experiment.variants[i];
      }
    }

    // Fallback to first variant
    return experiment.variants[0];
  };

  // Track an experiment event
  const trackEvent = (experimentId, variant, eventType, metadata = {}) => {
    const event = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      experimentId,
      userId,
      variant: variant || userAssignments[experimentId],
      eventType,
      timestamp: new Date().toISOString(),
      metadata
    };

    setExperimentEvents(prev => [...prev, event]);
    return event;
  };

  // Get all events for an experiment
  const getExperimentEvents = (experimentId) => {
    return experimentEvents.filter(event => event.experimentId === experimentId);
  };

  // Calculate experiment results
  const calculateResults = (experimentId) => {
    const experiment = experiments.find(exp => exp.id === experimentId);
    if (!experiment) return null;

    const events = getExperimentEvents(experimentId);
    const results = {};

    experiment.variants.forEach(variant => {
      const variantEvents = events.filter(e => e.variant === variant.id);
      const uniqueUsers = new Set(variantEvents.map(e => e.userId)).size;

      // Count different event types
      const assignments = variantEvents.filter(e => e.eventType === 'user_assigned').length;
      const completions = variantEvents.filter(e => e.eventType === 'plan_completed' || e.eventType === 'lesson_completed').length;
      const conversions = variantEvents.filter(e => e.eventType === 'conversion').length;

      results[variant.id] = {
        variantName: variant.name,
        assignments,
        uniqueUsers,
        completions,
        conversions,
        completionRate: assignments > 0 ? (completions / assignments * 100).toFixed(2) : 0,
        conversionRate: assignments > 0 ? (conversions / assignments * 100).toFixed(2) : 0,
        totalEvents: variantEvents.length
      };
    });

    // Calculate statistical significance (simple z-test for proportions)
    if (experiment.variants.length === 2) {
      const [control, variant] = experiment.variants;
      const controlData = results[control.id];
      const variantData = results[variant.id];

      if (controlData.assignments > 0 && variantData.assignments > 0) {
        const p1 = controlData.completions / controlData.assignments;
        const p2 = variantData.completions / variantData.assignments;
        const n1 = controlData.assignments;
        const n2 = variantData.assignments;

        const pooledP = (controlData.completions + variantData.completions) / (n1 + n2);
        const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
        const zScore = se > 0 ? Math.abs(p2 - p1) / se : 0;

        // p-value approximation (two-tailed)
        const pValue = zScore > 0 ? 2 * (1 - normalCDF(zScore)) : 1;
        const isSignificant = pValue < 0.05;
        const confidence = (1 - pValue) * 100;

        results.statistical = {
          zScore: zScore.toFixed(3),
          pValue: pValue.toFixed(4),
          isSignificant,
          confidence: confidence.toFixed(1),
          improvement: ((p2 - p1) / p1 * 100).toFixed(2)
        };
      }
    }

    return results;
  };

  // Helper function for normal CDF (cumulative distribution function)
  const normalCDF = (z) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - probability : probability;
  };

  // Get experiment by ID
  const getExperiment = (experimentId) => {
    return experiments.find(exp => exp.id === experimentId);
  };

  // Get all active experiments
  const getActiveExperiments = () => {
    return experiments.filter(exp => exp.status === 'active');
  };

  const value = {
    experiments,
    userAssignments,
    experimentEvents,
    userId,
    createExperiment,
    updateExperiment,
    deleteExperiment,
    startExperiment,
    pauseExperiment,
    completeExperiment,
    getVariant,
    trackEvent,
    getExperimentEvents,
    calculateResults,
    getExperiment,
    getActiveExperiments
  };

  return <ABTestContext.Provider value={value}>{children}</ABTestContext.Provider>;
};
