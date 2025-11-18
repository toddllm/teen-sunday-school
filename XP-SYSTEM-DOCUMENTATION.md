# XP & Level System Documentation

## Overview

The XP & Level System is a gamification feature designed to encourage consistent engagement and healthy spiritual growth among teen users. It provides a fun, non-competitive way to track progress and celebrate milestones.

**Key Principles:**
- **Soft gamification** - Fun without being gimmicky
- **No public leaderboards** - Avoids unhealthy comparison (v1)
- **Meaningful rewards** - Unlocks avatars, themes, and badges
- **Consistent engagement** - Rewards daily activities

---

## System Architecture

### Backend (Node.js + TypeScript + Prisma)

**Database Models:**
- `UserXP` - Tracks user's total XP and current level
- `XPEvent` - Records each XP-earning action
- `Reward` - Defines available rewards (avatars, themes, badges, titles)
- `UserReward` - Tracks which rewards users have unlocked

**Services:**
- `xp.service.ts` - Core XP logic (calculations, level progression, rewards)

**Controllers:**
- `xp.controller.ts` - API endpoints for XP management

**Routes:**
- `GET /api/me/xp` - Get current user's XP and level
- `GET /api/me/xp/stats` - Get detailed XP statistics
- `POST /api/me/xp` - Award XP to current user
- `POST /api/me/xp/rewards/:rewardId/activate` - Activate a reward
- `GET /api/admin/xp/leaderboard` - Admin-only leaderboard
- `GET /api/rewards` - Get all available rewards

### Frontend (React + Context API)

**Context:**
- `XPContext.jsx` - Manages XP state and actions

**Components:**
- `XPBar.jsx` - Progress bar showing XP towards next level
- `LevelDisplay.jsx` - Badge-style display of current level
- `LevelUpNotification.jsx` - Celebration notification on level up

**Integration:**
- `TodayPage.js` - Displays XP, level, and progress
- Activity logging automatically awards XP

---

## XP Rules & Rewards

### XP Amounts by Action

| Action | XP Amount | Description |
|--------|-----------|-------------|
| Read a chapter | 10 XP | Reading a Bible chapter |
| Reading plan day | 15 XP | Completing daily reading plan |
| Complete lesson | 20 XP | Finishing a Sunday school lesson |
| Quiz correct answer | 5 XP | Each correct quiz answer |
| Prayer logged | 10 XP | Logging a prayer or prayer time |
| Verse memorized | 25 XP | Memorizing a Bible verse |
| Journal entry | 10 XP | Writing a journal entry |
| Daily login | 5 XP | Logging in each day |
| Streak bonus | Variable | Based on current streak (10 XP per week) |

### Level Calculation Formula

**Formula:** `XP Required = 100 × (Level ^ 1.5)`

This creates an exponential curve that:
- Starts easy for new users
- Gradually increases difficulty
- Keeps progression meaningful at higher levels

**Example Levels:**

| Level | Total XP Required | XP for This Level |
|-------|-------------------|-------------------|
| 1 | 0 | 100 |
| 2 | 100 | 183 |
| 3 | 283 | 237 |
| 5 | 1,118 | 382 |
| 10 | 3,162 | 688 |
| 20 | 8,944 | 1,230 |
| 30 | 16,431 | 1,597 |
| 50 | 35,355 | 2,387 |

### Reward System

**Avatars (Every 5 levels):**
- Level 1: Beginner Badge 🌱
- Level 5: Growing Disciple 🌿
- Level 10: Faithful Servant ⭐
- Level 15: Devoted Follower 💎
- Level 20: Spiritual Warrior 🛡️
- Level 25: Kingdom Builder 🏰
- Level 30: Light Bearer 🕯️
- Level 35: Wise Teacher 📚
- Level 40: Heavenly Crown 👑
- Level 50: Eternal Flame 🔥

**Themes (Every 10 levels):**
- Level 10: Ocean Blue
- Level 20: Forest Green
- Level 30: Royal Purple
- Level 40: Sunset Orange
- Level 50: Golden Glory

**Badges (Milestones):**
- Level 1: First Steps 🎯
- Level 10: Rising Star 🌟
- Level 20: Dedicated Disciple ✨
- Level 30: Faithful Achiever 🏆
- Level 50: Master of Faith 🎖️

**Titles:**
- Level 1: Newcomer
- Level 5: Apprentice
- Level 10: Disciple
- Level 20: Warrior
- Level 30: Champion
- Level 50: Legend

---

## Implementation Guide

### Database Setup

1. **Run migrations:**
```bash
cd server
npx prisma migrate dev --name add_xp_system
```

2. **Seed rewards:**
```bash
npx ts-node prisma/seeds/rewards.seed.ts
```

### Backend Integration

**Award XP when user completes an action:**

```typescript
import * as xpService from '../services/xp.service';

// Example: Award XP for completing a lesson
const result = await xpService.awardXP(
  userId,
  'LESSON_COMPLETED',
  { lessonId: '123' }
);

if (result.leveledUp) {
  console.log(`User leveled up from ${result.oldLevel} to ${result.level}!`);
}
```

**Get user's XP stats:**

```typescript
const stats = await xpService.getUserXPStats(userId);
console.log(`Level ${stats.level}, ${stats.progress}% to next level`);
```

### Frontend Integration

**Use XP context in components:**

```jsx
import { useXP } from '../contexts/XPContext';

function MyComponent() {
  const { xpData, awardXP, levelUpNotification } = useXP();

  const handleActivity = () => {
    awardXP('CHAPTER_READ');
  };

  return (
    <div>
      <LevelDisplay level={xpData.level} />
      <XPBar progress={xpData.progress} />
      {levelUpNotification && (
        <LevelUpNotification {...levelUpNotification} />
      )}
    </div>
  );
}
```

---

## User Experience Flow

### 1. Daily Activity
1. User logs a prayer → Instantly gains 10 XP
2. XP bar fills visually with smooth animation
3. User sees progress towards next level

### 2. Level Up Experience
1. User completes activity that pushes them over XP threshold
2. Celebration notification appears with confetti animation
3. Shows old level → new level transition
4. Lists newly unlocked rewards
5. User can immediately select new avatar or theme

### 3. Progression Visibility
- **Today Page:** Shows current level, XP bar, and next reward
- **Profile:** Displays level badge and equipped rewards
- **Activity Log:** Recent XP gains visible in history

---

## Metrics & Analytics

### Tracked Metrics

**User Engagement:**
- Average XP gain per day
- Most common XP-earning activities
- Level distribution across user base
- Time to reach each level milestone

**Retention Impact:**
- User retention rate (XP users vs non-XP users)
- Daily active users before/after XP system
- Activity frequency correlation with XP

**Admin Dashboard:**
```typescript
// Get organization leaderboard (admin only)
const leaderboard = await xpService.getXPLeaderboard(orgId, 10);
```

**User Stats API:**
```typescript
// Detailed stats for individual user
const stats = await xpService.getUserXPStats(userId);
// Returns:
// - Level progress
// - XP last 7/30 days
// - XP by action type
// - Daily XP breakdown
// - Unlocked rewards count
```

---

## API Reference

### GET /api/me/xp
**Description:** Get current user's XP information

**Response:**
```json
{
  "xpTotal": 1250,
  "level": 8,
  "progress": {
    "level": 8,
    "totalXP": 1250,
    "currentXP": 230,
    "xpForCurrentLevel": 1020,
    "xpForNextLevel": 1350,
    "xpNeeded": 330,
    "progress": 69.7
  },
  "recentEvents": [
    {
      "id": "evt_123",
      "actionType": "CHAPTER_READ",
      "amount": 10,
      "createdAt": "2025-11-18T10:30:00Z"
    }
  ],
  "rewards": [
    {
      "id": "reward_1",
      "type": "AVATAR",
      "name": "Beginner Badge",
      "unlockLevel": 1,
      "isActive": true
    }
  ]
}
```

### POST /api/me/xp
**Description:** Award XP to current user

**Request Body:**
```json
{
  "actionType": "LESSON_COMPLETED",
  "metadata": {
    "lessonId": "lesson_123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "xpAwarded": 20,
  "totalXP": 1270,
  "level": 8,
  "leveledUp": false,
  "oldLevel": 8,
  "progress": {
    "level": 8,
    "progress": 75.8
  }
}
```

### GET /api/me/xp/stats
**Description:** Get detailed XP statistics

**Response:**
```json
{
  "level": 8,
  "totalXP": 1250,
  "progress": 69.7,
  "xpLast30Days": 450,
  "xpLast7Days": 120,
  "xpByAction": {
    "CHAPTER_READ": 100,
    "LESSON_COMPLETED": 200,
    "PRAYER_LOGGED": 50
  },
  "dailyXP": {
    "2025-11-18": 30,
    "2025-11-17": 25,
    "2025-11-16": 40
  },
  "totalEvents": 45,
  "unlockedRewards": 8
}
```

---

## Design Decisions

### Why No Public Leaderboards (v1)?
- **Avoid unhealthy comparison:** Focus on personal growth, not competition
- **Reduce pressure:** Teens should feel encouraged, not stressed
- **Inclusive:** Everyone progresses at their own pace
- **Future consideration:** Could add opt-in friend comparisons in v2

### Why Exponential Level Curve?
- **Early wins:** Quick levels early build confidence
- **Sustained engagement:** Higher levels feel like achievements
- **Natural pacing:** Matches spiritual growth journey
- **Prevents burnout:** Doesn't feel grindy at high levels

### Why Soft Gamification?
- **Age-appropriate:** Teens respond well to achievement systems
- **Not distracting:** Enhances rather than replaces core content
- **Meaningful:** Rewards reflect spiritual journey
- **Positive reinforcement:** Celebrates consistency

---

## Testing Checklist

- [ ] User can gain XP from all activity types
- [ ] Level calculation is accurate
- [ ] XP bar animates smoothly
- [ ] Level up notification displays correctly
- [ ] Rewards unlock at correct levels
- [ ] API endpoints return correct data
- [ ] XP persists across sessions
- [ ] Leaderboard shows correct rankings (admin)
- [ ] Database migrations run successfully
- [ ] Seed script creates all rewards
- [ ] Frontend components render properly
- [ ] Dark mode styles work correctly

---

## Future Enhancements (v2+)

**Planned Features:**
- [ ] Opt-in friend comparisons
- [ ] Weekly XP challenges
- [ ] Special event bonus XP periods
- [ ] Custom reward creation (admin)
- [ ] XP multipliers for streaks
- [ ] Team/group XP goals
- [ ] Achievement system integration
- [ ] Redemption store (spend XP on perks)

**Analytics Expansion:**
- [ ] Cohort analysis (XP impact on retention)
- [ ] A/B testing XP amounts
- [ ] Predictive modeling for churn
- [ ] Engagement heatmaps

---

## Troubleshooting

### User not gaining XP
- Verify user is authenticated
- Check action type is valid
- Ensure XP service is running
- Review error logs for failures

### Level not updating
- Check level calculation formula
- Verify database transaction committed
- Confirm XP total is correct
- Test level progression manually

### Rewards not unlocking
- Verify reward seed data exists
- Check unlock level thresholds
- Review unlockRewardsForLevel function
- Test with manual reward creation

### Frontend not showing XP
- Verify XPProvider is wrapping app
- Check XP context is accessible
- Review browser console for errors
- Test with mock XP data

---

## Support & Contact

For questions or issues with the XP system:
- Backend: `server/src/services/xp.service.ts`
- Frontend: `src/contexts/XPContext.jsx`
- Database: `server/prisma/schema.prisma` (XP models)
- API: `server/src/routes/xp.routes.ts`

---

**Version:** 1.0.0
**Last Updated:** November 18, 2025
**Status:** ✅ Production Ready
