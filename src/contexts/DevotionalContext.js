import React, { createContext, useContext, useState, useEffect } from 'react';

const DevotionalContext = createContext();

export const useDevotionals = () => {
  const context = useContext(DevotionalContext);
  if (!context) {
    throw new Error('useDevotionals must be used within a DevotionalProvider');
  }
  return context;
};

export const DevotionalProvider = ({ children }) => {
  const [devotionals, setDevotionals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load devotionals from localStorage on mount
  useEffect(() => {
    const storedDevotionals = localStorage.getItem('sunday-school-devotionals');
    if (storedDevotionals) {
      try {
        setDevotionals(JSON.parse(storedDevotionals));
      } catch (error) {
        console.error('Error loading devotionals:', error);
      }
    } else {
      // Load example devotionals if none exist
      loadExampleDevotionals();
    }
    setLoading(false);
  }, []);

  // Save devotionals to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('sunday-school-devotionals', JSON.stringify(devotionals));
    }
  }, [devotionals, loading]);

  const loadExampleDevotionals = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const exampleDevotionals = [
      {
        id: 'devotional-1',
        title: 'Walking in Faith',
        subtitle: 'Trusting God Through Uncertainty',
        body: '<p>Faith is not about having all the answers. It\'s about trusting the One who does.</p><p>When Abraham was called by God to leave his homeland, he didn\'t know where he was going. Hebrews 11:8 tells us, "By faith Abraham, when called to go to a place he would later receive as his inheritance, obeyed and went, even though he did not know where he was going."</p><p>Today, you may be facing situations where the path ahead is unclear. Remember that God sees the full picture. He is faithful to guide you one step at a time.</p><p><strong>Reflection:</strong> What area of your life requires you to take a step of faith today?</p>',
        passageRefs: [
          { ref: 'Hebrews 11:8', book: 'Hebrews', chapter: 11, verse: 8 },
          { ref: 'Proverbs 3:5-6', book: 'Proverbs', chapter: 3, verse: 5 }
        ],
        author: 'Admin',
        targetType: 'global', // global, plan, group
        targetId: null,
        publishAt: today.toISOString().split('T')[0], // YYYY-MM-DD
        expiryAt: null,
        status: 'published', // draft, published, archived
        featured: true,
        tags: ['faith', 'trust', 'guidance'],
        category: 'spiritual-growth',
        readCount: 0,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'devotional-2',
        title: 'The Power of Prayer',
        subtitle: 'Connecting with Our Heavenly Father',
        body: '<p>Prayer is not a monologue; it\'s a conversation with the Creator of the universe.</p><p>Jesus taught us the importance of persistent prayer. In Luke 18:1, we read that "they should always pray and not give up." Prayer transforms not only our circumstances but also our hearts.</p><p>James 5:16 reminds us: "The prayer of a righteous person is powerful and effective."</p><p>Don\'t underestimate the power of bringing your requests, worries, and thanksgivings before God. He hears you, He cares, and He acts.</p><p><strong>Challenge:</strong> Set aside 10 minutes today for focused, uninterrupted prayer.</p>',
        passageRefs: [
          { ref: 'Luke 18:1', book: 'Luke', chapter: 18, verse: 1 },
          { ref: 'James 5:16', book: 'James', chapter: 5, verse: 16 },
          { ref: 'Philippians 4:6-7', book: 'Philippians', chapter: 4, verse: 6 }
        ],
        author: 'Admin',
        targetType: 'global',
        targetId: null,
        publishAt: tomorrow.toISOString().split('T')[0],
        expiryAt: null,
        status: 'published',
        featured: false,
        tags: ['prayer', 'communication', 'spiritual-discipline'],
        category: 'spiritual-disciplines',
        readCount: 0,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'devotional-3',
        title: 'Love in Action',
        subtitle: 'Living Out the Greatest Commandment',
        body: '<p>Love is more than a feeling—it\'s a choice we make every day.</p><p>Jesus said in John 13:34-35, "A new command I give you: Love one another. As I have loved you, so you must love one another. By this everyone will know that you are my disciples, if you love one another."</p><p>Real love is sacrificial. It seeks the good of others even when it costs us something. It forgives when wronged. It serves when tired. It gives when empty.</p><p>1 John 3:18 challenges us: "Dear children, let us not love with words or speech but with actions and in truth."</p><p><strong>Action Step:</strong> Who can you show practical love to today? What specific action can you take?</p>',
        passageRefs: [
          { ref: 'John 13:34-35', book: 'John', chapter: 13, verse: 34 },
          { ref: '1 John 3:18', book: '1 John', chapter: 3, verse: 18 },
          { ref: '1 Corinthians 13:4-7', book: '1 Corinthians', chapter: 13, verse: 4 }
        ],
        author: 'Admin',
        targetType: 'global',
        targetId: null,
        publishAt: yesterday.toISOString().split('T')[0],
        expiryAt: null,
        status: 'published',
        featured: false,
        tags: ['love', 'service', 'discipleship'],
        category: 'practical-faith',
        readCount: 5,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    setDevotionals(exampleDevotionals);
  };

  const addDevotional = (devotional) => {
    const newDevotional = {
      ...devotional,
      id: `devotional-${Date.now()}`,
      readCount: 0,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDevotionals([...devotionals, newDevotional]);
    return newDevotional.id;
  };

  const updateDevotional = (id, updates) => {
    setDevotionals(devotionals.map(devotional =>
      devotional.id === id
        ? {
          ...devotional,
          ...updates,
          version: (devotional.version || 1) + 1,
          updatedAt: new Date().toISOString()
        }
        : devotional
    ));
  };

  const deleteDevotional = (id) => {
    setDevotionals(devotionals.filter(devotional => devotional.id !== id));
  };

  const getDevotionalById = (id) => {
    return devotionals.find(devotional => devotional.id === id);
  };

  const getTodayDevotional = () => {
    const today = new Date().toISOString().split('T')[0];

    // Find devotionals scheduled for today that are published
    const todaysDevotionals = devotionals.filter(devotional => {
      if (devotional.status !== 'published') return false;
      if (devotional.publishAt !== today) return false;

      // Check if expired
      if (devotional.expiryAt && devotional.expiryAt < today) return false;

      return true;
    });

    // Return featured devotional first, or the first one found
    const featured = todaysDevotionals.find(d => d.featured);
    return featured || todaysDevotionals[0] || null;
  };

  const getUpcomingDevotionals = (limit = 5) => {
    const today = new Date().toISOString().split('T')[0];

    return devotionals
      .filter(d => d.status === 'published' && d.publishAt >= today)
      .sort((a, b) => a.publishAt.localeCompare(b.publishAt))
      .slice(0, limit);
  };

  const getPastDevotionals = (limit = 10) => {
    const today = new Date().toISOString().split('T')[0];

    return devotionals
      .filter(d => d.status === 'published' && d.publishAt < today)
      .sort((a, b) => b.publishAt.localeCompare(a.publishAt))
      .slice(0, limit);
  };

  const searchDevotionals = (query) => {
    const lowerQuery = query.toLowerCase();
    return devotionals.filter(devotional =>
      devotional.title?.toLowerCase().includes(lowerQuery) ||
      devotional.subtitle?.toLowerCase().includes(lowerQuery) ||
      devotional.body?.toLowerCase().includes(lowerQuery) ||
      devotional.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      devotional.category?.toLowerCase().includes(lowerQuery)
    );
  };

  const duplicateDevotional = (id) => {
    const original = getDevotionalById(id);
    if (!original) return null;

    const duplicate = {
      ...original,
      id: `devotional-${Date.now()}`,
      title: `${original.title} (Copy)`,
      status: 'draft',
      publishAt: new Date().toISOString().split('T')[0],
      readCount: 0,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDevotionals([...devotionals, duplicate]);
    return duplicate.id;
  };

  const incrementReadCount = (id) => {
    setDevotionals(devotionals.map(devotional =>
      devotional.id === id
        ? {
          ...devotional,
          readCount: (devotional.readCount || 0) + 1
        }
        : devotional
    ));
  };

  const getStatistics = () => {
    const today = new Date().toISOString().split('T')[0];

    return {
      total: devotionals.length,
      published: devotionals.filter(d => d.status === 'published').length,
      draft: devotionals.filter(d => d.status === 'draft').length,
      scheduled: devotionals.filter(d => d.status === 'published' && d.publishAt > today).length,
      totalReads: devotionals.reduce((sum, d) => sum + (d.readCount || 0), 0)
    };
  };

  const value = {
    devotionals,
    loading,
    addDevotional,
    updateDevotional,
    deleteDevotional,
    getDevotionalById,
    getTodayDevotional,
    getUpcomingDevotionals,
    getPastDevotionals,
    searchDevotionals,
    duplicateDevotional,
    incrementReadCount,
    getStatistics
  };

  return (
    <DevotionalContext.Provider value={value}>
      {children}
    </DevotionalContext.Provider>
  );
};
