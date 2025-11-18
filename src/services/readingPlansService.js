/**
 * Reading Plans Service
 *
 * Mock API service layer that uses localStorage for data persistence.
 * Mimics REST API endpoints as specified in the requirements.
 *
 * In production, these functions would call a real backend API.
 */

const PLANS_KEY = 'sunday-school-reading-plans';
const PLAN_DAYS_KEY = 'sunday-school-plan-days';
const USER_PLANS_KEY = 'sunday-school-user-plans';
const USER_PLAN_DAYS_KEY = 'sunday-school-user-plan-days';

// Helper to get data from localStorage
const getFromStorage = (key, defaultValue = []) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return defaultValue;
  }
};

// Helper to save data to localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

/**
 * GET /plans?filter=...
 * Get all reading plans with optional filtering
 */
export const getPlans = ({ duration, topic, difficulty, search, sort = 'popular' } = {}) => {
  let plans = getFromStorage(PLANS_KEY);

  // Apply filters
  if (duration) {
    const durationNum = parseInt(duration);
    plans = plans.filter(p => {
      if (durationNum === 7) return p.duration_days <= 7;
      if (durationNum === 30) return p.duration_days <= 30;
      if (durationNum === 90) return p.duration_days <= 90;
      if (durationNum === 365) return p.duration_days <= 365;
      return true;
    });
  }

  if (topic) {
    plans = plans.filter(p => p.tags.some(tag => tag.toLowerCase() === topic.toLowerCase()));
  }

  if (difficulty) {
    plans = plans.filter(p => p.difficulty === difficulty);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    plans = plans.filter(p =>
      p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    );
  }

  // Apply sorting
  if (sort === 'new') {
    plans.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sort === 'popular') {
    // Count how many users started each plan
    const userPlans = getFromStorage(USER_PLANS_KEY);
    const planCounts = {};
    userPlans.forEach(up => {
      planCounts[up.plan_id] = (planCounts[up.plan_id] || 0) + 1;
    });
    plans.sort((a, b) => (planCounts[b.id] || 0) - (planCounts[a.id] || 0));
  } else if (sort === 'recommended') {
    // Featured plans first, then by popularity
    plans.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return 0;
    });
  }

  return plans;
};

/**
 * GET /plans/{id}
 * Get a specific plan with all its days
 */
export const getPlanById = (planId) => {
  const plans = getFromStorage(PLANS_KEY);
  const plan = plans.find(p => p.id === planId);

  if (!plan) {
    throw new Error('Plan not found');
  }

  const allDays = getFromStorage(PLAN_DAYS_KEY);
  const days = allDays.filter(d => d.plan_id === planId).sort((a, b) => a.day_index - b.day_index);

  return { plan, days };
};

/**
 * POST /plans
 * Create a new reading plan (admin only)
 */
export const createPlan = (planData, days, adminId) => {
  const plans = getFromStorage(PLANS_KEY);
  const allDays = getFromStorage(PLAN_DAYS_KEY);

  const newPlan = {
    id: `plan-${Date.now()}`,
    ...planData,
    created_by_admin_id: adminId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  plans.push(newPlan);
  saveToStorage(PLANS_KEY, plans);

  // Add days
  const newDays = days.map(day => ({
    ...day,
    plan_id: newPlan.id,
  }));
  saveToStorage(PLAN_DAYS_KEY, [...allDays, ...newDays]);

  return { plan: newPlan, days: newDays };
};

/**
 * GET /me/plans
 * Get all plans for the current user
 */
export const getUserPlans = (userId, status = null) => {
  let userPlans = getFromStorage(USER_PLANS_KEY);
  userPlans = userPlans.filter(up => up.user_id === userId);

  if (status) {
    userPlans = userPlans.filter(up => up.status === status);
  }

  // Enrich with plan details and progress
  const plans = getFromStorage(PLANS_KEY);
  const allDays = getFromStorage(PLAN_DAYS_KEY);
  const completedDays = getFromStorage(USER_PLAN_DAYS_KEY);

  return userPlans.map(userPlan => {
    const plan = plans.find(p => p.id === userPlan.plan_id);
    const days = allDays.filter(d => d.plan_id === userPlan.plan_id).sort((a, b) => a.day_index - b.day_index);
    const userCompletedDays = completedDays.filter(
      cd => cd.user_id === userId && cd.plan_id === userPlan.plan_id
    );

    const completionPercentage = days.length > 0
      ? Math.round((userCompletedDays.length / days.length) * 100)
      : 0;

    const completedIndices = new Set(userCompletedDays.map(cd => cd.day_index));
    const currentDayIndex = days.find(d => !completedIndices.has(d.day_index))?.day_index || days.length;

    return {
      userPlan,
      plan,
      days,
      completedDays: userCompletedDays,
      currentDayIndex,
      completionPercentage,
    };
  });
};

/**
 * POST /me/plans/{id}/start
 * Start a reading plan
 */
export const startPlan = (userId, planId) => {
  const userPlans = getFromStorage(USER_PLANS_KEY);

  // Check if user already started this plan
  const existing = userPlans.find(up => up.user_id === userId && up.plan_id === planId);
  if (existing) {
    throw new Error('Plan already started');
  }

  const newUserPlan = {
    id: `user-plan-${Date.now()}`,
    user_id: userId,
    plan_id: planId,
    start_date: new Date().toISOString(),
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  userPlans.push(newUserPlan);
  saveToStorage(USER_PLANS_KEY, userPlans);

  return newUserPlan;
};

/**
 * PATCH /me/plans/{id}
 * Update plan status (pause, resume, complete)
 */
export const updateUserPlanStatus = (userId, planId, status) => {
  const userPlans = getFromStorage(USER_PLANS_KEY);
  const userPlan = userPlans.find(up => up.user_id === userId && up.plan_id === planId);

  if (!userPlan) {
    throw new Error('User plan not found');
  }

  userPlan.status = status;
  userPlan.updated_at = new Date().toISOString();

  saveToStorage(USER_PLANS_KEY, userPlans);
  return userPlan;
};

/**
 * POST /me/plans/{id}/days/{dayIndex}/complete
 * Mark a day as complete
 */
export const completePlanDay = (userId, planId, dayIndex) => {
  const completedDays = getFromStorage(USER_PLAN_DAYS_KEY);

  // Check if already completed
  const existing = completedDays.find(
    cd => cd.user_id === userId && cd.plan_id === planId && cd.day_index === dayIndex
  );

  if (existing) {
    return existing; // Already completed
  }

  const newCompletion = {
    user_id: userId,
    plan_id: planId,
    day_index: dayIndex,
    completed_at: new Date().toISOString(),
  };

  completedDays.push(newCompletion);
  saveToStorage(USER_PLAN_DAYS_KEY, completedDays);

  // Check if plan is now complete
  const allDays = getFromStorage(PLAN_DAYS_KEY);
  const planDays = allDays.filter(d => d.plan_id === planId);
  const userCompletedDays = completedDays.filter(
    cd => cd.user_id === userId && cd.plan_id === planId
  );

  if (userCompletedDays.length === planDays.length) {
    // Auto-complete the plan
    updateUserPlanStatus(userId, planId, 'completed');
  }

  return newCompletion;
};

/**
 * POST /me/plans/{id}/days/catch-up
 * Mark all previous days as complete
 */
export const catchUpPlan = (userId, planId, untilDayIndex) => {
  const allDays = getFromStorage(PLAN_DAYS_KEY);
  const planDays = allDays.filter(d => d.plan_id === planId && d.day_index <= untilDayIndex);

  const results = [];
  for (const day of planDays) {
    try {
      const result = completePlanDay(userId, planId, day.day_index);
      results.push(result);
    } catch (error) {
      // Day might already be completed
      console.log(`Day ${day.day_index} already completed`);
    }
  }

  return results;
};

/**
 * Initialize storage with seed data if empty
 */
export const initializeSeedData = () => {
  const existingPlans = getFromStorage(PLANS_KEY);
  if (existingPlans.length > 0) {
    return; // Already initialized
  }

  // This will be called from a separate seed data module
  console.log('No seed data found. Reading plans storage initialized.');
};
