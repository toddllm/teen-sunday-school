import React, { createContext, useContext, useState, useEffect } from 'react';

const QuestionBankContext = createContext();

export const useQuestionBank = () => {
  const context = useContext(QuestionBankContext);
  if (!context) {
    throw new Error('useQuestionBank must be used within a QuestionBankProvider');
  }
  return context;
};

export const QuestionBankProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [sessionPlans, setSessionPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load questions from localStorage on mount
  useEffect(() => {
    const storedQuestions = localStorage.getItem('sunday-school-questions');
    if (storedQuestions) {
      try {
        setQuestions(JSON.parse(storedQuestions));
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    } else {
      // Load example questions if none exist
      loadExampleQuestions();
    }
    setLoading(false);
  }, []);

  // Load session plans from localStorage on mount
  useEffect(() => {
    const storedPlans = localStorage.getItem('sunday-school-session-plans');
    if (storedPlans) {
      try {
        setSessionPlans(JSON.parse(storedPlans));
      } catch (error) {
        console.error('Error loading session plans:', error);
      }
    }
  }, []);

  // Save questions to localStorage whenever they change
  useEffect(() => {
    if (!loading && questions.length > 0) {
      localStorage.setItem('sunday-school-questions', JSON.stringify(questions));
    }
  }, [questions, loading]);

  // Save session plans to localStorage whenever they change
  useEffect(() => {
    if (!loading && sessionPlans.length > 0) {
      localStorage.setItem('sunday-school-session-plans', JSON.stringify(sessionPlans));
    }
  }, [sessionPlans, loading]);

  const loadExampleQuestions = () => {
    const exampleQuestions = [
      {
        id: 'q1',
        text: 'What does this passage teach us about God\'s character?',
        category: 'discussion',
        difficulty: 'medium',
        verseReference: '',
        suggestedTime: 5,
        notes: 'Focus on specific attributes mentioned in the text',
        tags: ['theology', 'character-of-god'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'q2',
        text: 'Share one thing you\'re grateful for this week',
        category: 'icebreaker',
        difficulty: 'easy',
        verseReference: '',
        suggestedTime: 3,
        notes: 'Keep it light and encourage everyone to participate',
        tags: ['gratitude', 'sharing'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'q3',
        text: 'How can we apply this truth to our daily lives this week?',
        category: 'application',
        difficulty: 'medium',
        verseReference: '',
        suggestedTime: 7,
        notes: 'Encourage specific, practical applications',
        tags: ['application', 'practical'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    setQuestions(exampleQuestions);
  };

  // Question CRUD operations
  const addQuestion = (question) => {
    const newQuestion = {
      ...question,
      id: `question-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setQuestions([...questions, newQuestion]);
    return newQuestion.id;
  };

  const updateQuestion = (id, updates) => {
    setQuestions(questions.map(question =>
      question.id === id
        ? { ...question, ...updates, updatedAt: new Date().toISOString() }
        : question
    ));
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(question => question.id !== id));
  };

  const getQuestionById = (id) => {
    return questions.find(question => question.id === id);
  };

  const duplicateQuestion = (id) => {
    const question = getQuestionById(id);
    if (question) {
      const duplicate = {
        ...question,
        id: `question-${Date.now()}`,
        text: `${question.text} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setQuestions([...questions, duplicate]);
      return duplicate.id;
    }
  };

  const searchQuestions = (filters) => {
    return questions.filter(q => {
      if (filters.category && q.category !== filters.category) return false;
      if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
      if (filters.verseReference && !q.verseReference.toLowerCase().includes(filters.verseReference.toLowerCase())) return false;
      if (filters.searchText && !q.text.toLowerCase().includes(filters.searchText.toLowerCase())) return false;
      if (filters.tags && filters.tags.length > 0) {
        if (!filters.tags.some(tag => q.tags.includes(tag))) return false;
      }
      return true;
    });
  };

  // Session Plan CRUD operations
  const addSessionPlan = (plan) => {
    const newPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSessionPlans([...sessionPlans, newPlan]);
    return newPlan.id;
  };

  const updateSessionPlan = (id, updates) => {
    setSessionPlans(sessionPlans.map(plan =>
      plan.id === id
        ? { ...plan, ...updates, updatedAt: new Date().toISOString() }
        : plan
    ));
  };

  const deleteSessionPlan = (id) => {
    setSessionPlans(sessionPlans.filter(plan => plan.id !== id));
  };

  const getSessionPlanById = (id) => {
    return sessionPlans.find(plan => plan.id === id);
  };

  const duplicateSessionPlan = (id) => {
    const plan = getSessionPlanById(id);
    if (plan) {
      const duplicate = {
        ...plan,
        id: `plan-${Date.now()}`,
        title: `${plan.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setSessionPlans([...sessionPlans, duplicate]);
      return duplicate.id;
    }
  };

  const value = {
    questions,
    sessionPlans,
    loading,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionById,
    duplicateQuestion,
    searchQuestions,
    addSessionPlan,
    updateSessionPlan,
    deleteSessionPlan,
    getSessionPlanById,
    duplicateSessionPlan
  };

  return (
    <QuestionBankContext.Provider value={value}>
      {children}
    </QuestionBankContext.Provider>
  );
};
