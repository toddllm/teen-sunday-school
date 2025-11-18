import React, { createContext, useContext, useState, useEffect } from 'react';

const LessonContext = createContext();

export const useLessons = () => {
  const context = useContext(LessonContext);
  if (!context) {
    throw new Error('useLessons must be used within a LessonProvider');
  }
  return context;
};

export const LessonProvider = ({ children }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load lessons from localStorage on mount
  useEffect(() => {
    const storedLessons = localStorage.getItem('sunday-school-lessons');
    if (storedLessons) {
      try {
        setLessons(JSON.parse(storedLessons));
      } catch (error) {
        console.error('Error loading lessons:', error);
      }
    } else {
      // Load example lesson if no lessons exist
      loadExampleLesson();
    }
    setLoading(false);
  }, []);

  // Save lessons to localStorage whenever they change
  useEffect(() => {
    if (!loading && lessons.length > 0) {
      localStorage.setItem('sunday-school-lessons', JSON.stringify(lessons));
    }
  }, [lessons, loading]);

  const loadExampleLesson = () => {
    const exampleLesson = {
      id: 'example-q9-l12',
      title: 'Trusting God with Our Needs',
      quarter: 9,
      unit: 3,
      unitTitle: 'Self-Esteem',
      lessonNumber: 12,
      connection: 'God supplies all we need for healthy self-esteem.',
      scripture: ['Isaiah 43:1-7', 'Mark 5:21-43'],
      rememberVerse: {
        text: 'When you pass through the waters, I will be with you; and when you pass through the rivers, they will not sweep over you.',
        reference: 'Isaiah 43:2a'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slides: [
        {
          id: 1,
          html: '<h1>Lesson 12</h1>\n<h2>Trusting God with Our Needs</h2>\n<p>Unit 3: Self-Esteem</p>',
          sayText: 'Lesson 12 - Trusting God with Our Needs. Unit 3: Self-Esteem.',
          notes: 'Welcome slide for lesson 12'
        },
        {
          id: 2,
          html: "<h2>Today's Big Idea</h2>\n<p>God sees what's in people's hearts and minds, and He cares deeply about their experiences, good and bad.</p>\n<p><strong>God supplies all we need for healthy self-esteem.</strong></p>",
          sayText: "Today's Big Idea: God sees what's in people's hearts and minds, and He cares deeply about their experiences, good and bad. God supplies all we need for healthy self-esteem.",
          notes: 'Main teaching point for the lesson'
        }
      ],
      discussionQuestions: [
        'What stands out to you from Isaiah 43:1-7?',
        'What has God helped you endure that has taught you about His faithfulness?',
        'How do the words "Do not be afraid, for I am with you" make you feel?'
      ],
      wordGames: {
        scramble: ['TRUSTING', 'REDEEMED', 'PRECIOUS', 'FAITHFUL', 'PROVISION'],
        hangman: ['TRUST', 'NEEDS', 'WATERS', 'REDEEMED', 'PRECIOUS'],
        wordSearch: {
          words: ['TRUST', 'NEEDS', 'GOD', 'FAITHFUL', 'PRECIOUS', 'REDEEMED'],
          grid: 10
        },
        wordle: ['TRUST', 'FAITH', 'GRACE', 'PEACE', 'LOVED']
      }
    };
    setLessons([exampleLesson]);
  };

  const addLesson = (lesson) => {
    const newLesson = {
      ...lesson,
      id: `lesson-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLessons([...lessons, newLesson]);
    return newLesson.id;
  };

  const updateLesson = (id, updates) => {
    setLessons(lessons.map(lesson =>
      lesson.id === id
        ? { ...lesson, ...updates, updatedAt: new Date().toISOString() }
        : lesson
    ));
  };

  const deleteLesson = (id) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
  };

  const getLessonById = (id) => {
    return lessons.find(lesson => lesson.id === id);
  };

  const duplicateLesson = (id) => {
    const lesson = getLessonById(id);
    if (lesson) {
      const duplicate = {
        ...lesson,
        id: `lesson-${Date.now()}`,
        title: `${lesson.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setLessons([...lessons, duplicate]);
      return duplicate.id;
    }
  };

  const value = {
    lessons,
    loading,
    addLesson,
    updateLesson,
    deleteLesson,
    getLessonById,
    duplicateLesson
  };

  return (
    <LessonContext.Provider value={value}>
      {children}
    </LessonContext.Provider>
  );
};
