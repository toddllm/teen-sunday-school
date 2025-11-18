/**
 * Data models and types for Reading Plans feature
 *
 * These JSDoc type definitions provide structure for the reading plans system,
 * matching the API specification from the requirements.
 */

/**
 * @typedef {Object} Plan
 * @property {string} id - Unique identifier
 * @property {string} title - Plan title
 * @property {string} description - Detailed description
 * @property {number} duration_days - Total number of days
 * @property {string[]} tags - Topic tags (e.g., "Anxiety", "Faith", "Leadership")
 * @property {boolean} is_featured - Whether plan is featured
 * @property {string} difficulty - Difficulty level: "Beginner", "Intermediate", "Advanced"
 * @property {number} estimated_daily_minutes - Expected daily reading time
 * @property {string} created_by_admin_id - Admin user who created the plan
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 */

/**
 * @typedef {Object} PlanDay
 * @property {string} plan_id - Reference to parent plan
 * @property {number} day_index - Day number (1-based)
 * @property {string[]} passage_refs - Array of scripture references (e.g., ["John 1:1-14", "Psalm 23"])
 * @property {string} notes - Optional reflection notes or prompts for the day
 */

/**
 * @typedef {'active' | 'paused' | 'completed'} PlanStatus
 */

/**
 * @typedef {Object} UserPlan
 * @property {string} id - Unique identifier for this user-plan relationship
 * @property {string} user_id - User who started the plan
 * @property {string} plan_id - Reference to the plan
 * @property {string} start_date - ISO date when plan was started
 * @property {PlanStatus} status - Current status
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 */

/**
 * @typedef {Object} UserPlanDayStatus
 * @property {string} user_id - User who completed the day
 * @property {string} plan_id - Reference to the plan
 * @property {number} day_index - Day number that was completed
 * @property {string} completed_at - ISO timestamp when marked complete
 */

/**
 * @typedef {Object} PlanWithDays
 * @property {Plan} plan - The plan details
 * @property {PlanDay[]} days - Array of days in the plan
 */

/**
 * @typedef {Object} UserPlanProgress
 * @property {UserPlan} userPlan - User's plan enrollment
 * @property {Plan} plan - The plan details
 * @property {PlanDay[]} days - All days in the plan
 * @property {UserPlanDayStatus[]} completedDays - Days the user has completed
 * @property {number} currentDayIndex - Next day to complete
 * @property {number} completionPercentage - 0-100
 */

/**
 * @typedef {Object} PlanFilters
 * @property {string} [duration] - Filter by duration: "7", "30", "90", "365"
 * @property {string} [topic] - Filter by topic tag
 * @property {string} [difficulty] - Filter by difficulty level
 * @property {string} [search] - Text search in title/description
 */

/**
 * @typedef {'popular' | 'new' | 'recommended'} PlanSortOption
 */

export {};
