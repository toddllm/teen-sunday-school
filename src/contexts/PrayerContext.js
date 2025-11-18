import React, { createContext, useState, useContext, useEffect } from 'react';

const PrayerContext = createContext();

export const usePrayer = () => {
  const context = useContext(PrayerContext);
  if (!context) {
    throw new Error('usePrayer must be used within a PrayerProvider');
  }
  return context;
};

export const PrayerProvider = ({ children }) => {
  const [prayers, setPrayers] = useState([]);

  // Load prayers from localStorage on mount
  useEffect(() => {
    const savedPrayers = localStorage.getItem('sunday-school-prayers');
    if (savedPrayers) {
      try {
        setPrayers(JSON.parse(savedPrayers));
      } catch (error) {
        console.error('Error loading prayers:', error);
        setPrayers([]);
      }
    }
  }, []);

  // Save prayers to localStorage whenever they change
  useEffect(() => {
    if (prayers.length >= 0) {
      localStorage.setItem('sunday-school-prayers', JSON.stringify(prayers));
    }
  }, [prayers]);

  // Create a new prayer item
  const createPrayer = (prayerData) => {
    const newPrayer = {
      id: `prayer-${Date.now()}`,
      title: prayerData.title,
      description: prayerData.description || '',
      category: prayerData.category || 'personal',
      status: 'active',
      createdAt: new Date().toISOString(),
      answeredAt: null,
      logEntries: []
    };

    setPrayers(prev => [newPrayer, ...prev]);
    return newPrayer;
  };

  // Update an existing prayer
  const updatePrayer = (prayerId, updates) => {
    setPrayers(prev =>
      prev.map(prayer =>
        prayer.id === prayerId
          ? { ...prayer, ...updates }
          : prayer
      )
    );
  };

  // Mark prayer as answered
  const markAsAnswered = (prayerId, note = '') => {
    setPrayers(prev =>
      prev.map(prayer =>
        prayer.id === prayerId
          ? {
              ...prayer,
              status: 'answered',
              answeredAt: new Date().toISOString(),
              logEntries: [
                ...prayer.logEntries,
                {
                  id: `log-${Date.now()}`,
                  body: note || 'Prayer answered!',
                  type: 'answered',
                  createdAt: new Date().toISOString()
                }
              ]
            }
          : prayer
      )
    );
  };

  // Archive a prayer
  const archivePrayer = (prayerId) => {
    setPrayers(prev =>
      prev.map(prayer =>
        prayer.id === prayerId
          ? { ...prayer, status: 'archived' }
          : prayer
      )
    );
  };

  // Reactivate a prayer
  const reactivatePrayer = (prayerId) => {
    setPrayers(prev =>
      prev.map(prayer =>
        prayer.id === prayerId
          ? { ...prayer, status: 'active', answeredAt: null }
          : prayer
      )
    );
  };

  // Delete a prayer
  const deletePrayer = (prayerId) => {
    setPrayers(prev => prev.filter(prayer => prayer.id !== prayerId));
  };

  // Add a log entry to a prayer
  const addLogEntry = (prayerId, body) => {
    const newEntry = {
      id: `log-${Date.now()}`,
      body,
      type: 'update',
      createdAt: new Date().toISOString()
    };

    setPrayers(prev =>
      prev.map(prayer =>
        prayer.id === prayerId
          ? { ...prayer, logEntries: [...prayer.logEntries, newEntry] }
          : prayer
      )
    );

    return newEntry;
  };

  // Get prayers by status
  const getPrayersByStatus = (status) => {
    return prayers.filter(prayer => prayer.status === status);
  };

  // Get a single prayer by ID
  const getPrayerById = (prayerId) => {
    return prayers.find(prayer => prayer.id === prayerId);
  };

  // Get prayers by category
  const getPrayersByCategory = (category) => {
    return prayers.filter(prayer => prayer.category === category);
  };

  // Get statistics
  const getStats = () => {
    const active = prayers.filter(p => p.status === 'active').length;
    const answered = prayers.filter(p => p.status === 'answered').length;
    const archived = prayers.filter(p => p.status === 'archived').length;
    const total = prayers.length;

    // Recent answered prayers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAnswered = prayers.filter(p =>
      p.status === 'answered' &&
      p.answeredAt &&
      new Date(p.answeredAt) > thirtyDaysAgo
    ).length;

    return {
      active,
      answered,
      archived,
      total,
      recentAnswered
    };
  };

  const value = {
    prayers,
    createPrayer,
    updatePrayer,
    markAsAnswered,
    archivePrayer,
    reactivatePrayer,
    deletePrayer,
    addLogEntry,
    getPrayersByStatus,
    getPrayerById,
    getPrayersByCategory,
    getStats
  };

  return (
    <PrayerContext.Provider value={value}>
      {children}
    </PrayerContext.Provider>
  );
};
