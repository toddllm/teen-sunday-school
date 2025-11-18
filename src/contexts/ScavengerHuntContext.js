import React, { createContext, useContext, useState, useEffect } from 'react';

const ScavengerHuntContext = createContext();

export const useScavengerHunts = () => {
  const context = useContext(ScavengerHuntContext);
  if (!context) {
    throw new Error('useScavengerHunts must be used within a ScavengerHuntProvider');
  }
  return context;
};

export const ScavengerHuntProvider = ({ children }) => {
  const [hunts, setHunts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load hunts from localStorage on mount
  useEffect(() => {
    const storedHunts = localStorage.getItem('sunday-school-scavenger-hunts');
    if (storedHunts) {
      try {
        setHunts(JSON.parse(storedHunts));
      } catch (error) {
        console.error('Error loading scavenger hunts:', error);
      }
    } else {
      // Load example hunt if no hunts exist
      loadExampleHunt();
    }
    setLoading(false);
  }, []);

  // Load submissions from localStorage on mount
  useEffect(() => {
    const storedSubmissions = localStorage.getItem('sunday-school-scavenger-submissions');
    if (storedSubmissions) {
      try {
        setSubmissions(JSON.parse(storedSubmissions));
      } catch (error) {
        console.error('Error loading submissions:', error);
      }
    }
  }, []);

  // Save hunts to localStorage whenever they change
  useEffect(() => {
    if (!loading && hunts.length > 0) {
      localStorage.setItem('sunday-school-scavenger-hunts', JSON.stringify(hunts));
    }
  }, [hunts, loading]);

  // Save submissions to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('sunday-school-scavenger-submissions', JSON.stringify(submissions));
    }
  }, [submissions, loading]);

  const loadExampleHunt = () => {
    const exampleHunt = {
      id: 'hunt-example-1',
      title: 'Faith in Action',
      description: 'Capture photos that represent verses about faith, love, and service.',
      prompts: [
        {
          id: 'prompt-1',
          verse: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
          verseReference: 'Hebrews 11:1',
          prompt: 'Take a photo that represents hope or something you can\'t see but believe in'
        },
        {
          id: 'prompt-2',
          verse: 'Love your neighbor as yourself.',
          verseReference: 'Matthew 22:39',
          prompt: 'Capture an act of kindness or service to others'
        },
        {
          id: 'prompt-3',
          verse: 'The heavens declare the glory of God; the skies proclaim the work of his hands.',
          verseReference: 'Psalm 19:1',
          prompt: 'Find beauty in God\'s creation and photograph it'
        },
        {
          id: 'prompt-4',
          verse: 'Do everything in love.',
          verseReference: '1 Corinthians 16:14',
          prompt: 'Take a photo showing love in everyday life'
        }
      ],
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setHunts([exampleHunt]);
  };

  const addHunt = (hunt) => {
    const newHunt = {
      ...hunt,
      id: `hunt-${Date.now()}`,
      active: hunt.active !== undefined ? hunt.active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setHunts([...hunts, newHunt]);
    return newHunt.id;
  };

  const updateHunt = (id, updates) => {
    setHunts(hunts.map(hunt =>
      hunt.id === id
        ? { ...hunt, ...updates, updatedAt: new Date().toISOString() }
        : hunt
    ));
  };

  const deleteHunt = (id) => {
    setHunts(hunts.filter(hunt => hunt.id !== id));
    // Also delete all submissions for this hunt
    setSubmissions(submissions.filter(sub => sub.huntId !== id));
  };

  const getHuntById = (id) => {
    return hunts.find(hunt => hunt.id === id);
  };

  const getActiveHunts = () => {
    return hunts.filter(hunt => hunt.active);
  };

  const duplicateHunt = (id) => {
    const hunt = getHuntById(id);
    if (hunt) {
      const duplicate = {
        ...hunt,
        id: `hunt-${Date.now()}`,
        title: `${hunt.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setHunts([...hunts, duplicate]);
      return duplicate.id;
    }
  };

  const addSubmission = (submission) => {
    const newSubmission = {
      ...submission,
      id: `submission-${Date.now()}`,
      timestamp: new Date().toISOString(),
      approved: false
    };
    setSubmissions([...submissions, newSubmission]);
    return newSubmission.id;
  };

  const updateSubmission = (id, updates) => {
    setSubmissions(submissions.map(sub =>
      sub.id === id
        ? { ...sub, ...updates }
        : sub
    ));
  };

  const deleteSubmission = (id) => {
    setSubmissions(submissions.filter(sub => sub.id !== id));
  };

  const getSubmissionsByHunt = (huntId) => {
    return submissions.filter(sub => sub.huntId === huntId);
  };

  const getSubmissionsByPrompt = (huntId, promptId) => {
    return submissions.filter(sub => sub.huntId === huntId && sub.promptId === promptId);
  };

  const getApprovedSubmissions = (huntId) => {
    return submissions.filter(sub => sub.huntId === huntId && sub.approved);
  };

  const getSubmissionsByStudent = (studentName) => {
    return submissions.filter(sub => sub.studentName === studentName);
  };

  const getLeaderboard = (huntId) => {
    const huntSubmissions = getApprovedSubmissions(huntId);
    const studentScores = {};

    huntSubmissions.forEach(sub => {
      if (!studentScores[sub.studentName]) {
        studentScores[sub.studentName] = {
          name: sub.studentName,
          count: 0,
          submissions: []
        };
      }
      studentScores[sub.studentName].count++;
      studentScores[sub.studentName].submissions.push(sub);
    });

    return Object.values(studentScores).sort((a, b) => b.count - a.count);
  };

  const value = {
    hunts,
    submissions,
    loading,
    addHunt,
    updateHunt,
    deleteHunt,
    getHuntById,
    getActiveHunts,
    duplicateHunt,
    addSubmission,
    updateSubmission,
    deleteSubmission,
    getSubmissionsByHunt,
    getSubmissionsByPrompt,
    getApprovedSubmissions,
    getSubmissionsByStudent,
    getLeaderboard
  };

  return (
    <ScavengerHuntContext.Provider value={value}>
      {children}
    </ScavengerHuntContext.Provider>
  );
};
