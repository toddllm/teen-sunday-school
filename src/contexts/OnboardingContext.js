import React, { createContext, useContext, useState, useEffect } from 'react';

const OnboardingContext = createContext();

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  // Load saved data from localStorage
  const savedProfile = localStorage.getItem('user-profile');
  const savedOnboardingComplete = localStorage.getItem('onboarding-complete');

  const [isOnboardingComplete, setIsOnboardingComplete] = useState(
    savedOnboardingComplete === 'true'
  );

  const [userProfile, setUserProfile] = useState(
    savedProfile ? JSON.parse(savedProfile) : {
      name: '',
      role: '', // 'student' | 'teacher' | 'parent' | 'admin'
      interests: [], // Array of interest tags
      experience: '', // 'new' | 'intermediate' | 'experienced'
      preferences: {
        primaryTranslation: 'de4e12af7f28f599-02', // NIV default
        learningStyle: '', // 'visual' | 'text' | 'interactive'
        difficulty: '', // 'beginner' | 'intermediate' | 'advanced'
      }
    }
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(null);

  // Persist to localStorage whenever profile changes
  useEffect(() => {
    localStorage.setItem('user-profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('onboarding-complete', isOnboardingComplete.toString());
  }, [isOnboardingComplete]);

  // Update profile field
  const updateProfile = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update nested preference field
  const updatePreference = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  // Toggle interest tag
  const toggleInterest = (interest) => {
    setUserProfile(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  // Complete onboarding
  const completeOnboarding = () => {
    setIsOnboardingComplete(true);

    // Save analytics
    const analytics = {
      completedAt: new Date().toISOString(),
      timeSpent: quizStartTime ? Date.now() - quizStartTime : 0,
      profile: userProfile
    };
    localStorage.setItem('onboarding-analytics', JSON.stringify(analytics));
    localStorage.setItem('onboarding-timestamp', new Date().toISOString());
  };

  // Reset onboarding (for testing or re-taking quiz)
  const resetOnboarding = () => {
    setIsOnboardingComplete(false);
    setCurrentStep(0);
    setUserProfile({
      name: '',
      role: '',
      interests: [],
      experience: '',
      preferences: {
        primaryTranslation: 'de4e12af7f28f599-02',
        learningStyle: '',
        difficulty: '',
      }
    });
    localStorage.removeItem('onboarding-complete');
    localStorage.removeItem('onboarding-analytics');
    localStorage.removeItem('onboarding-timestamp');
  };

  // Start quiz timer
  const startQuiz = () => {
    if (!quizStartTime) {
      setQuizStartTime(Date.now());
    }
  };

  // Get recommended content based on profile
  const getRecommendations = () => {
    const recommendations = {
      lessons: [],
      games: [],
      bibleBooks: [],
      features: []
    };

    // Recommend based on role
    if (userProfile.role === 'teacher' || userProfile.role === 'admin') {
      recommendations.features.push('lesson-creator', 'admin-dashboard', 'reading-plan-builder');
    } else if (userProfile.role === 'student') {
      recommendations.features.push('games', 'streaks', 'badges', 'today-page');
    } else if (userProfile.role === 'parent') {
      recommendations.features.push('lessons', 'reading-plans', 'progress-tracking');
    }

    // Recommend based on interests
    if (userProfile.interests.includes('old-testament')) {
      recommendations.bibleBooks.push('Genesis', 'Exodus', 'Psalms', 'Isaiah');
    }
    if (userProfile.interests.includes('new-testament')) {
      recommendations.bibleBooks.push('Matthew', 'John', 'Romans', 'Revelation');
    }
    if (userProfile.interests.includes('parables')) {
      recommendations.bibleBooks.push('Matthew', 'Luke');
      recommendations.lessons.push('Parable of the Prodigal Son', 'The Good Samaritan');
    }
    if (userProfile.interests.includes('prophecy')) {
      recommendations.bibleBooks.push('Daniel', 'Revelation', 'Isaiah');
    }

    // Recommend based on experience
    if (userProfile.experience === 'new') {
      recommendations.features.push('bible-basics', 'context-cards', 'parallel-translations');
    } else if (userProfile.experience === 'experienced') {
      recommendations.features.push('cross-references', 'comparative-themes', 'advanced-study');
    }

    return recommendations;
  };

  const value = {
    isOnboardingComplete,
    userProfile,
    currentStep,
    setCurrentStep,
    updateProfile,
    updatePreference,
    toggleInterest,
    completeOnboarding,
    resetOnboarding,
    startQuiz,
    getRecommendations
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
