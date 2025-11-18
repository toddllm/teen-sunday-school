import React, { createContext, useContext, useState, useEffect } from 'react';

const PlanContext = createContext();

export const usePlans = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlans must be used within a PlanProvider');
  }
  return context;
};

export const PlanProvider = ({ children }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load plans from localStorage on mount
  useEffect(() => {
    const loadPlans = () => {
      try {
        const storedPlans = localStorage.getItem('sunday-school-reading-plans');
        if (storedPlans) {
          setPlans(JSON.parse(storedPlans));
        }
      } catch (error) {
        console.error('Error loading plans:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  // Save plans to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('sunday-school-reading-plans', JSON.stringify(plans));
      } catch (error) {
        console.error('Error saving plans:', error);
      }
    }
  }, [plans, loading]);

  const addPlan = (plan) => {
    const newPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      status: plan.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalEnrollments: 0,
        activeUsers: 0,
        completions: 0
      }
    };
    setPlans(prev => [...prev, newPlan]);
    return newPlan.id;
  };

  const updatePlan = (id, updates) => {
    setPlans(prev => prev.map(plan =>
      plan.id === id
        ? { ...plan, ...updates, updatedAt: new Date().toISOString() }
        : plan
    ));
  };

  const deletePlan = (id) => {
    setPlans(prev => prev.filter(plan => plan.id !== id));
  };

  const getPlanById = (id) => {
    return plans.find(plan => plan.id === id);
  };

  const duplicatePlan = (id) => {
    const plan = getPlanById(id);
    if (!plan) return null;

    const newPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      title: `${plan.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalEnrollments: 0,
        activeUsers: 0,
        completions: 0
      }
    };
    setPlans(prev => [...prev, newPlan]);
    return newPlan.id;
  };

  const publishPlan = (id) => {
    updatePlan(id, {
      status: 'published',
      publishedAt: new Date().toISOString()
    });
  };

  const archivePlan = (id) => {
    updatePlan(id, {
      status: 'archived',
      archivedAt: new Date().toISOString()
    });
  };

  const getPublishedPlans = () => {
    return plans.filter(plan => plan.status === 'published');
  };

  const getDraftPlans = () => {
    return plans.filter(plan => plan.status === 'draft');
  };

  const getArchivedPlans = () => {
    return plans.filter(plan => plan.status === 'archived');
  };

  const value = {
    plans,
    loading,
    addPlan,
    updatePlan,
    deletePlan,
    getPlanById,
    duplicatePlan,
    publishPlan,
    archivePlan,
    getPublishedPlans,
    getDraftPlans,
    getArchivedPlans
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};
