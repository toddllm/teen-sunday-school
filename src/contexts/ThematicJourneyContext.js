import React, { createContext, useContext, useState, useEffect } from 'react';

const ThematicJourneyContext = createContext();

// Activity type for journey completion (to integrate with streak system)
export const JOURNEY_ACTIVITY_TYPE = 'journey_step_completed';

export const useThematicJourneys = () => {
  const context = useContext(ThematicJourneyContext);
  if (!context) {
    throw new Error('useThematicJourneys must be used within a ThematicJourneyProvider');
  }
  return context;
};

export const ThematicJourneyProvider = ({ children }) => {
  const [journeys, setJourneys] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // Load journeys and progress from localStorage on mount
  useEffect(() => {
    try {
      const storedJourneys = localStorage.getItem('sunday-school-thematic-journeys');
      const storedProgress = localStorage.getItem('sunday-school-journey-progress');

      if (storedJourneys) {
        setJourneys(JSON.parse(storedJourneys));
      } else {
        // Load default journeys if none exist
        loadDefaultJourneys();
      }

      if (storedProgress) {
        setUserProgress(JSON.parse(storedProgress));
      }
    } catch (error) {
      console.error('Error loading thematic journey data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save journeys to localStorage whenever they change
  useEffect(() => {
    if (!loading && journeys.length > 0) {
      localStorage.setItem('sunday-school-thematic-journeys', JSON.stringify(journeys));
    }
  }, [journeys, loading]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('sunday-school-journey-progress', JSON.stringify(userProgress));
    }
  }, [userProgress, loading]);

  const loadDefaultJourneys = () => {
    const defaultJourneys = [
      {
        id: 'journey-forgiveness',
        title: 'Forgiveness',
        description: 'Explore how God\'s forgiveness transforms us and how we are called to forgive others.',
        theme: 'Forgiveness',
        steps: [
          {
            stepIndex: 0,
            title: 'God\'s Forgiveness',
            passageRefs: ['Psalm 103:8-12', 'Isaiah 1:18'],
            introText: 'Begin your journey by understanding the depth of God\'s forgiveness. He doesn\'t just overlook our sins—He removes them completely.',
            questions: [
              'How far does God remove our sins according to Psalm 103?',
              'What does it mean that our scarlet sins become white as snow?',
              'How does knowing God\'s forgiveness affect your daily life?'
            ]
          },
          {
            stepIndex: 1,
            title: 'Forgiving Others',
            passageRefs: ['Matthew 18:21-35', 'Ephesians 4:32'],
            introText: 'Jesus teaches us that receiving forgiveness means extending it to others. The parable of the unforgiving servant shows us why.',
            questions: [
              'Why does Jesus say we should forgive "seventy times seven"?',
              'What does this parable teach about comparing our sins to others\' sins?',
              'Who in your life might need your forgiveness?'
            ]
          },
          {
            stepIndex: 2,
            title: 'The Cross: Ultimate Forgiveness',
            passageRefs: ['Luke 23:32-34', 'Colossians 2:13-14'],
            introText: 'At the cross, Jesus demonstrated the ultimate act of forgiveness, canceling our debt of sin.',
            questions: [
              'What does Jesus say while being crucified?',
              'How does this demonstrate perfect forgiveness?',
              'What "written code" was canceled at the cross?'
            ]
          },
          {
            stepIndex: 3,
            title: 'Living in Freedom',
            passageRefs: ['Romans 8:1-2', '1 John 1:9'],
            introText: 'Forgiveness brings freedom from guilt and condemnation. Walk in the freedom Christ purchased for you.',
            questions: [
              'What does "no condemnation" mean for your daily life?',
              'How can we experience ongoing forgiveness?',
              'What changes when you truly accept God\'s forgiveness?'
            ]
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'journey-justice',
        title: 'Justice',
        description: 'Discover God\'s heart for justice and how He calls us to act justly in the world.',
        theme: 'Justice',
        steps: [
          {
            stepIndex: 0,
            title: 'God\'s Character of Justice',
            passageRefs: ['Deuteronomy 32:4', 'Psalm 89:14'],
            introText: 'Justice is not just something God does—it\'s part of who He is. His justice is perfect and fair.',
            questions: [
              'What does it mean that God\'s ways are just?',
              'How are righteousness and justice connected?',
              'Why is God\'s justice important for us?'
            ]
          },
          {
            stepIndex: 1,
            title: 'Called to Do Justice',
            passageRefs: ['Micah 6:8', 'Isaiah 1:17'],
            introText: 'God doesn\'t just want us to know about justice—He calls us to actively pursue it in our world.',
            questions: [
              'What does the Lord require of us according to Micah?',
              'What does it mean to "seek justice" practically?',
              'Who are the oppressed in your community?'
            ]
          },
          {
            stepIndex: 2,
            title: 'Jesus and Justice',
            passageRefs: ['Luke 4:16-21', 'Matthew 23:23'],
            introText: 'Jesus came to bring good news to the poor and freedom to the oppressed. Justice was central to His ministry.',
            questions: [
              'What does Jesus say He came to do?',
              'What are the "more important matters of the law"?',
              'How did Jesus demonstrate justice in His life?'
            ]
          },
          {
            stepIndex: 3,
            title: 'Justice and Mercy Together',
            passageRefs: ['James 2:14-17', 'Proverbs 21:3'],
            introText: 'True faith produces action. Justice and mercy work together in the life of a believer.',
            questions: [
              'How does faith connect to deeds?',
              'What does God value more than religious rituals?',
              'How can you practice justice this week?'
            ]
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'journey-faith',
        title: 'Faith',
        description: 'Journey through the Bible to understand what true faith looks like and how it transforms lives.',
        theme: 'Faith',
        steps: [
          {
            stepIndex: 0,
            title: 'What is Faith?',
            passageRefs: ['Hebrews 11:1-3', 'Romans 10:17'],
            introText: 'Faith is confidence in what we hope for and assurance about what we don\'t see. It begins with hearing God\'s Word.',
            questions: [
              'How does Hebrews define faith?',
              'How does faith come according to Romans?',
              'What are you putting your faith in?'
            ]
          },
          {
            stepIndex: 1,
            title: 'Examples of Faith',
            passageRefs: ['Hebrews 11:8-12', 'Genesis 15:6'],
            introText: 'Abraham is called the father of faith. His story shows us what it means to trust God completely.',
            questions: [
              'What did Abraham do even though he didn\'t know where he was going?',
              'How was Abraham\'s faith "credited as righteousness"?',
              'What has God called you to do by faith?'
            ]
          },
          {
            stepIndex: 2,
            title: 'Faith and Works',
            passageRefs: ['James 2:14-26', 'Ephesians 2:8-10'],
            introText: 'Faith and works aren\'t opposites—true faith naturally produces good works.',
            questions: [
              'Can faith exist without deeds? Why or why not?',
              'How are we saved, and for what purpose?',
              'What "good works" is God calling you to?'
            ]
          },
          {
            stepIndex: 3,
            title: 'Living by Faith',
            passageRefs: ['2 Corinthians 5:7', 'Galatians 2:20'],
            introText: 'The Christian life is lived by faith from beginning to end. We walk by faith, not by sight.',
            questions: [
              'What does it mean to "walk by faith, not by sight"?',
              'How does Christ live in you?',
              'What area of your life needs more faith?'
            ]
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'journey-hope',
        title: 'Hope',
        description: 'Discover the living hope we have in Christ that sustains us through all circumstances.',
        theme: 'Hope',
        steps: [
          {
            stepIndex: 0,
            title: 'The Source of Hope',
            passageRefs: ['Romans 15:13', 'Psalm 42:5-11'],
            introText: 'True hope doesn\'t come from our circumstances but from the God of hope who fills us with joy and peace.',
            questions: [
              'What does the God of hope fill us with?',
              'Why does the psalmist tell his soul to hope in God?',
              'Where do you typically place your hope?'
            ]
          },
          {
            stepIndex: 1,
            title: 'Hope in Suffering',
            passageRefs: ['Romans 5:3-5', '1 Peter 1:3-7'],
            introText: 'Even in trials, our hope remains secure because it\'s based on God\'s character and promises.',
            questions: [
              'What does suffering produce in our lives?',
              'Why does hope not disappoint us?',
              'How can trials refine your faith like gold?'
            ]
          },
          {
            stepIndex: 2,
            title: 'Living Hope Through Resurrection',
            passageRefs: ['1 Peter 1:3-5', '1 Corinthians 15:19-22'],
            introText: 'The resurrection of Jesus gives us a living hope and an eternal inheritance that can never perish.',
            questions: [
              'What has given us new birth into a living hope?',
              'What is our inheritance like?',
              'How does the resurrection change everything?'
            ]
          },
          {
            stepIndex: 3,
            title: 'Hope for the Future',
            passageRefs: ['Revelation 21:1-5', 'Titus 2:11-14'],
            introText: 'Our hope extends to the future when God will make all things new and wipe away every tear.',
            questions: [
              'What will be gone in the new creation?',
              'What are we waiting for with hope?',
              'How does future hope affect your present life?'
            ]
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    setJourneys(defaultJourneys);
  };

  // Get all journeys
  const getAllJourneys = () => {
    return journeys;
  };

  // Get journey by ID
  const getJourneyById = (id) => {
    return journeys.find(journey => journey.id === id);
  };

  // Get user progress for a specific journey
  const getJourneyProgress = (journeyId) => {
    return userProgress[journeyId] || {
      completedStepIndexes: [],
      startedAt: null,
      lastActivityAt: null
    };
  };

  // Get progress percentage for a journey
  const getProgressPercentage = (journeyId) => {
    const journey = getJourneyById(journeyId);
    if (!journey) return 0;

    const progress = getJourneyProgress(journeyId);
    const totalSteps = journey.steps.length;
    const completedSteps = progress.completedStepIndexes.length;

    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  // Check if a specific step is completed
  const isStepCompleted = (journeyId, stepIndex) => {
    const progress = getJourneyProgress(journeyId);
    return progress.completedStepIndexes.includes(stepIndex);
  };

  // Mark a step as completed
  const completeStep = (journeyId, stepIndex) => {
    const journey = getJourneyById(journeyId);
    if (!journey) return;

    const currentProgress = getJourneyProgress(journeyId);

    // Don't add if already completed
    if (currentProgress.completedStepIndexes.includes(stepIndex)) {
      return currentProgress;
    }

    const updatedProgress = {
      ...currentProgress,
      completedStepIndexes: [...currentProgress.completedStepIndexes, stepIndex].sort((a, b) => a - b),
      startedAt: currentProgress.startedAt || new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    };

    setUserProgress({
      ...userProgress,
      [journeyId]: updatedProgress
    });

    return updatedProgress;
  };

  // Reset progress for a journey
  const resetJourneyProgress = (journeyId) => {
    const updatedProgress = { ...userProgress };
    delete updatedProgress[journeyId];
    setUserProgress(updatedProgress);
  };

  // Get all journeys with progress info
  const getJourneysWithProgress = () => {
    return journeys.map(journey => ({
      ...journey,
      progress: getJourneyProgress(journey.id),
      progressPercentage: getProgressPercentage(journey.id),
      isStarted: userProgress[journey.id]?.completedStepIndexes.length > 0,
      isCompleted: getProgressPercentage(journey.id) === 100
    }));
  };

  // Get stats
  const getStats = () => {
    const totalJourneys = journeys.length;
    const startedJourneys = Object.keys(userProgress).filter(
      journeyId => userProgress[journeyId].completedStepIndexes.length > 0
    ).length;

    const completedJourneys = journeys.filter(
      journey => getProgressPercentage(journey.id) === 100
    ).length;

    const totalSteps = journeys.reduce((sum, journey) => sum + journey.steps.length, 0);
    const completedSteps = Object.values(userProgress).reduce(
      (sum, progress) => sum + progress.completedStepIndexes.length,
      0
    );

    return {
      totalJourneys,
      startedJourneys,
      completedJourneys,
      totalSteps,
      completedSteps
    };
  };

  const value = {
    journeys,
    userProgress,
    loading,
    getAllJourneys,
    getJourneyById,
    getJourneyProgress,
    getProgressPercentage,
    isStepCompleted,
    completeStep,
    resetJourneyProgress,
    getJourneysWithProgress,
    getStats
  };

  return (
    <ThematicJourneyContext.Provider value={value}>
      {children}
    </ThematicJourneyContext.Provider>
  );
};
