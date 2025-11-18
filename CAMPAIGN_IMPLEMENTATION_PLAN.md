# Custom Email/Notification Campaigns - Implementation Plan

## Overview
This feature will add targeted notification campaign capabilities to the Teen Sunday School application. This requires adding a backend infrastructure since the app currently runs entirely in the browser with localStorage.

## Current Architecture Constraints
- **Frontend-only**: React SPA with no backend
- **Data Storage**: Browser localStorage only
- **No User System**: No authentication or user accounts
- **No Email Infrastructure**: No email sending capability
- **Deployment**: AWS S3 + CloudFront (static hosting)

## Proposed Architecture

### Option 1: Full-Stack Implementation (Recommended)
Add a complete backend system to support campaigns, user management, and notifications.

**Stack:**
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (AWS RDS)
- **Email Service**: AWS SES or SendGrid
- **Authentication**: JWT tokens
- **Hosting**: AWS (EC2/ECS/Lambda + API Gateway)
- **Task Scheduling**: node-cron or AWS EventBridge

**Pros:**
- Full feature set as specified
- Scalable and production-ready
- Real user tracking across devices
- Proper notification preferences
- Analytics and reporting

**Cons:**
- Significant development effort
- Infrastructure costs
- Deployment complexity increases

### Option 2: Minimal Backend (Quick Start)
Simple backend with basic campaign functionality.

**Stack:**
- **Backend**: Node.js + Express (serverless on AWS Lambda)
- **Database**: MongoDB Atlas (free tier) or DynamoDB
- **Email Service**: SendGrid (free tier: 100 emails/day)
- **Authentication**: Simple API key for admins only
- **Hosting**: AWS Lambda + API Gateway (serverless)

**Pros:**
- Faster to implement
- Lower infrastructure costs
- Good for prototyping/MVP

**Cons:**
- Limited scalability
- Simpler user targeting
- Basic analytics

### Option 3: Frontend-Only Simulation (Demo)
Mock the campaign system for UI demonstration without actual email sending.

**Pros:**
- No infrastructure changes
- Quick to implement
- Good for UI/UX validation

**Cons:**
- Not functional (no real notifications)
- Not production-ready

---

## Recommended Approach: Full-Stack Implementation

## Phase 1: Backend Foundation (Week 1-2)

### 1.1 Database Schema Design

```sql
-- Users table (extends current localStorage data)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user', -- 'user' or 'admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  frequency VARCHAR(50) DEFAULT 'daily', -- 'immediate', 'daily', 'weekly'
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  opt_out_all BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- User activities (migrated from localStorage)
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL,
  activity_date DATE NOT NULL,
  metadata JSONB, -- Additional data (lesson_id, plan_id, etc.)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_date (user_id, activity_date),
  INDEX idx_activity_type (activity_type)
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  filters_json JSONB NOT NULL, -- Audience targeting rules
  message_content JSONB NOT NULL, -- {subject, body, template_vars}
  channel VARCHAR(50) NOT NULL, -- 'email' or 'push'
  schedule_type VARCHAR(50) NOT NULL, -- 'immediate', 'scheduled', 'recurring'
  schedule_config JSONB, -- {send_at, cron_expression, timezone}
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign sends (tracking individual notifications)
CREATE TABLE campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced BOOLEAN DEFAULT false,
  error_message TEXT,
  INDEX idx_campaign_user (campaign_id, user_id),
  INDEX idx_sent_at (sent_at)
);

-- Campaign analytics summary
CREATE TABLE campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  send_date DATE NOT NULL,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  reactivation_count INTEGER DEFAULT 0, -- Users who came back after campaign
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(campaign_id, send_date)
);
```

### 1.2 Backend API Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database connection
│   │   ├── email.js              # Email service config
│   │   └── auth.js               # JWT config
│   ├── models/
│   │   ├── User.js
│   │   ├── Campaign.js
│   │   ├── CampaignSend.js
│   │   ├── UserActivity.js
│   │   └── NotificationPreference.js
│   ├── controllers/
│   │   ├── authController.js     # Login, register, logout
│   │   ├── campaignController.js # Campaign CRUD
│   │   ├── userController.js     # User management
│   │   └── analyticsController.js
│   ├── services/
│   │   ├── emailService.js       # Email sending logic
│   │   ├── audienceService.js    # User filtering/targeting
│   │   ├── schedulerService.js   # Campaign scheduling
│   │   └── analyticsService.js   # Metrics calculation
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── adminOnly.js          # Admin authorization
│   │   └── rateLimiter.js        # Rate limiting
│   ├── routes/
│   │   ├── auth.js
│   │   ├── campaigns.js
│   │   ├── users.js
│   │   └── analytics.js
│   ├── utils/
│   │   ├── queryBuilder.js       # Build SQL from filter JSON
│   │   └── validators.js         # Input validation
│   └── index.js                  # Express app entry
├── migrations/                   # Database migrations
├── .env.example
├── package.json
└── README.md
```

### 1.3 API Endpoints

#### Authentication
```
POST   /api/auth/register         # Create user account
POST   /api/auth/login            # Login (get JWT)
POST   /api/auth/logout           # Logout
GET    /api/auth/me               # Get current user
```

#### Campaigns (Admin only)
```
POST   /api/admin/campaigns                    # Create campaign
GET    /api/admin/campaigns                    # List all campaigns
GET    /api/admin/campaigns/:id                # Get campaign details
PUT    /api/admin/campaigns/:id                # Update campaign
DELETE /api/admin/campaigns/:id                # Delete campaign
POST   /api/admin/campaigns/:id/duplicate      # Duplicate campaign
POST   /api/admin/campaigns/:id/preview        # Preview audience (get user count/sample)
POST   /api/admin/campaigns/:id/test-send      # Send test to admin email
POST   /api/admin/campaigns/:id/send           # Trigger campaign send
PATCH  /api/admin/campaigns/:id/status         # Update status (activate/pause)
GET    /api/admin/campaigns/:id/analytics      # Get campaign analytics
GET    /api/admin/campaigns/:id/sends          # Get individual send records
```

#### Users (Admin)
```
GET    /api/admin/users                        # List all users
GET    /api/admin/users/:id                    # Get user details
GET    /api/admin/users/:id/activities         # Get user activity history
```

#### User Preferences (User)
```
GET    /api/users/preferences                  # Get my notification preferences
PUT    /api/users/preferences                  # Update preferences
```

#### Analytics (Admin)
```
GET    /api/admin/analytics/overview           # Overall campaign performance
GET    /api/admin/analytics/engagement         # User engagement metrics
```

## Phase 2: Frontend Integration (Week 3)

### 2.1 New React Contexts

#### UserContext
```javascript
// src/contexts/UserContext.js
export const UserContext = {
  user: null,              // Current logged-in user
  isAuthenticated: false,
  isAdmin: false,
  login: async (email, password) => {},
  register: async (email, password, name) => {},
  logout: async () => {},
  updateProfile: async (data) => {}
};
```

#### CampaignContext
```javascript
// src/contexts/CampaignContext.js
export const CampaignContext = {
  campaigns: [],
  loading: false,
  fetchCampaigns: async () => {},
  createCampaign: async (data) => {},
  updateCampaign: async (id, data) => {},
  deleteCampaign: async (id) => {},
  sendCampaign: async (id) => {},
  previewAudience: async (filters) => {},
  testSend: async (id, email) => {}
};
```

#### NotificationPreferencesContext
```javascript
// src/contexts/NotificationPreferencesContext.js
export const NotificationPreferencesContext = {
  preferences: null,
  loading: false,
  fetchPreferences: async () => {},
  updatePreferences: async (data) => {}
};
```

### 2.2 New Admin Pages

#### CampaignListPage (`/admin/campaigns`)
- Table of all campaigns with columns:
  - Name, Status, Channel, Recipients, Send Date, Open Rate, Click Rate
- Actions: Create New, View, Edit, Duplicate, Delete, Send
- Filters: Status (draft/active/paused/completed), Channel (email/push)
- Search by name

#### CampaignBuilderPage (`/admin/campaigns/create`, `/admin/campaigns/:id/edit`)

**Sections:**
1. **Basic Info**
   - Name
   - Description
   - Channel (email/push radio buttons)

2. **Audience Builder** (Key component!)
   - Rule builder interface:
     ```
     Target users WHERE:
     [ Activity Type ▼ ] [ is ▼ ] [ reading_plan_completed ▼ ] [+]
     AND
     [ Last Activity ▼ ] [ more than ▼ ] [ 7 ] days ago [+]
     AND
     [ Current Streak ▼ ] [ greater than ▼ ] [ 3 ] [+]
     ```
   - Rule types:
     - Activity-based: "has/hasn't completed activity X in Y days"
     - Streak-based: "current streak is X days"
     - Badge-based: "has/hasn't earned badge X"
     - Plan-based: "started plan X but hasn't completed"
     - Engagement: "last activity was X days ago"
   - Live preview: "This will target approximately X users" (calls preview API)

3. **Message Content**
   - Subject line (email only)
   - Message body (rich text editor or markdown)
   - Template variables: `{name}`, `{streak}`, `{plan_name}`
   - Preview pane showing rendered message

4. **Schedule**
   - Send Type:
     - ○ Immediately when saved
     - ○ Scheduled: [Date Picker] [Time Picker]
     - ○ Recurring: [Cron expression builder or simple daily/weekly selector]
   - Timezone selector

5. **Review & Send**
   - Summary of settings
   - Preview button → shows audience + sample message
   - Test Send button → sends to admin email
   - Save as Draft button
   - Send Now / Schedule button

#### CampaignAnalyticsPage (`/admin/campaigns/:id/analytics`)
- Overview cards:
  - Total Sent
  - Delivered (%)
  - Opened (%)
  - Clicked (%)
  - Re-activated Users
- Timeline chart: sends/opens/clicks over time
- Table of individual send records
- Export to CSV button

### 2.3 New User Pages

#### NotificationSettingsPage (`/settings/notifications`)
- Toggle switches:
  - Email Notifications Enabled
  - Push Notifications Enabled (if implemented)
- Frequency dropdown: Immediate, Daily Digest, Weekly Digest
- Quiet Hours: From [time] to [time]
- Opt-out checkbox: "Unsubscribe from all notification campaigns"
- Save button

### 2.4 API Service Layer

```javascript
// src/services/campaignAPI.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const campaignAPI = {
  // Campaign CRUD
  getCampaigns: () => api.get('/admin/campaigns'),
  getCampaign: (id) => api.get(`/admin/campaigns/${id}`),
  createCampaign: (data) => api.post('/admin/campaigns', data),
  updateCampaign: (id, data) => api.put(`/admin/campaigns/${id}`, data),
  deleteCampaign: (id) => api.delete(`/admin/campaigns/${id}`),

  // Campaign actions
  previewAudience: (filters) => api.post('/admin/campaigns/preview', { filters }),
  testSend: (id, email) => api.post(`/admin/campaigns/${id}/test-send`, { email }),
  sendCampaign: (id) => api.post(`/admin/campaigns/${id}/send`),

  // Analytics
  getCampaignAnalytics: (id) => api.get(`/admin/campaigns/${id}/analytics`),
  getSendRecords: (id) => api.get(`/admin/campaigns/${id}/sends`)
};
```

## Phase 3: Email Integration (Week 4)

### 3.1 Email Service Setup

**Recommended: AWS SES** (already using AWS infrastructure)

**Setup steps:**
1. Verify sender email/domain in AWS SES
2. Request production access (remove sandbox mode)
3. Set up SNS topics for bounce/complaint handling
4. Configure DKIM for better deliverability

**Alternative: SendGrid**
- Easier setup
- Free tier: 100 emails/day
- Good for development/testing

### 3.2 Email Templates

```javascript
// backend/src/templates/emailTemplates.js

export const templates = {
  inactivePlanReminder: {
    subject: "Don't lose your progress on {plan_name}!",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hi {name},</h2>
        <p>We noticed you started the <strong>{plan_name}</strong> study plan,
           but haven't had activity in the last {days_inactive} days.</p>
        <p>Your {current_streak}-day streak is waiting for you!
           Even a few minutes today can make a difference.</p>
        <a href="{app_url}/today" style="background: #4CAF50; color: white;
           padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Continue Your Journey
        </a>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          Don't want these reminders?
          <a href="{app_url}/settings/notifications">Update preferences</a>
        </p>
      </div>
    `
  },

  reengageInactive: {
    subject: "We miss you! Come back to your spiritual growth journey",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hello {name},</h2>
        <p>It's been {days_inactive} days since your last visit.
           We'd love to see you back!</p>
        <p>Here's what's new:</p>
        <ul>
          <li>New Bible study lessons added</li>
          <li>Fresh discussion questions</li>
          <li>Interactive word games to make learning fun</li>
        </ul>
        <a href="{app_url}" style="background: #2196F3; color: white;
           padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Pick Up Where You Left Off
        </a>
      </div>
    `
  },

  streakAtRisk: {
    subject: "Your {current_streak}-day streak is at risk!",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Don't break the chain, {name}!</h2>
        <p>You've built an amazing <strong>{current_streak}-day streak</strong>
           of spiritual growth. Don't let it end today!</p>
        <p>Take just 5 minutes to:</p>
        <ul>
          <li>Read a Bible passage</li>
          <li>Complete a lesson</li>
          <li>Log a prayer</li>
        </ul>
        <a href="{app_url}/today" style="background: #FF9800; color: white;
           padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Keep Your Streak Alive
        </a>
      </div>
    `
  }
};
```

### 3.3 Email Service Implementation

```javascript
// backend/src/services/emailService.js
import AWS from 'aws-sdk';
import { templates } from '../templates/emailTemplates.js';

const ses = new AWS.SES({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

export const emailService = {
  send: async ({ to, subject, html, templateVars = {} }) => {
    // Replace template variables
    let renderedSubject = subject;
    let renderedHtml = html;

    Object.keys(templateVars).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      renderedSubject = renderedSubject.replace(regex, templateVars[key]);
      renderedHtml = renderedHtml.replace(regex, templateVars[key]);
    });

    const params = {
      Source: process.env.FROM_EMAIL || 'noreply@teensundayschool.com',
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: { Data: renderedSubject },
        Body: {
          Html: { Data: renderedHtml }
        }
      }
    };

    try {
      const result = await ses.sendEmail(params).promise();
      return { success: true, messageId: result.MessageId };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  },

  sendBulk: async (recipients, { subject, html, templateVars }) => {
    // Send to multiple recipients with personalized content
    const results = await Promise.allSettled(
      recipients.map(recipient =>
        emailService.send({
          to: recipient.email,
          subject,
          html,
          templateVars: { ...templateVars, ...recipient.vars }
        })
      )
    );

    return results;
  }
};
```

## Phase 4: Audience Targeting Logic (Week 4)

### 4.1 Query Builder

```javascript
// backend/src/services/audienceService.js

export const audienceService = {
  buildQuery: (filters) => {
    /*
    Example filters object:
    {
      rules: [
        { field: 'activity_type', operator: 'equals', value: 'reading_plan_completed' },
        { field: 'last_activity', operator: 'more_than_days_ago', value: 7 },
        { field: 'current_streak', operator: 'greater_than', value: 3 }
      ],
      logic: 'AND' // or 'OR'
    }
    */

    let query = 'SELECT DISTINCT u.* FROM users u ';
    let joins = [];
    let conditions = [];
    let params = [];

    filters.rules.forEach((rule, index) => {
      switch (rule.field) {
        case 'activity_type':
          joins.push('LEFT JOIN user_activities ua ON u.id = ua.user_id');
          if (rule.operator === 'equals') {
            conditions.push(`ua.activity_type = $${params.length + 1}`);
            params.push(rule.value);
          } else if (rule.operator === 'not_equals') {
            conditions.push(`ua.activity_type != $${params.length + 1}`);
            params.push(rule.value);
          }
          break;

        case 'last_activity':
          joins.push('LEFT JOIN user_activities ua ON u.id = ua.user_id');
          if (rule.operator === 'more_than_days_ago') {
            conditions.push(
              `ua.activity_date < CURRENT_DATE - INTERVAL '${rule.value} days'`
            );
          } else if (rule.operator === 'within_days') {
            conditions.push(
              `ua.activity_date >= CURRENT_DATE - INTERVAL '${rule.value} days'`
            );
          }
          break;

        case 'current_streak':
          // This requires calculating streak on the fly or having a cached value
          // For simplicity, assume we have a function to get it
          if (rule.operator === 'greater_than') {
            conditions.push(
              `(SELECT calculate_streak(u.id)) > $${params.length + 1}`
            );
            params.push(rule.value);
          }
          break;

        // Add more field types as needed
      }
    });

    // Combine query parts
    query += [...new Set(joins)].join(' '); // Remove duplicate joins
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(` ${filters.logic} `);
    }

    return { query, params };
  },

  getAudiencePreview: async (filters, limit = 100) => {
    const { query, params } = audienceService.buildQuery(filters);
    const previewQuery = query + ` LIMIT ${limit}`;

    const users = await db.query(previewQuery, params);
    const countQuery = `SELECT COUNT(*) FROM (${query}) AS subquery`;
    const countResult = await db.query(countQuery, params);

    return {
      totalCount: parseInt(countResult.rows[0].count),
      sampleUsers: users.rows
    };
  },

  getAudienceUsers: async (filters) => {
    const { query, params } = audienceService.buildQuery(filters);
    const users = await db.query(query, params);
    return users.rows;
  }
};
```

### 4.2 Common Audience Filters (Pre-built)

```javascript
export const commonFilters = {
  inactivePlanUsers: {
    name: "Users who started a plan but haven't been active in 7 days",
    filters: {
      rules: [
        { field: 'activity_type', operator: 'equals', value: 'reading_plan_started' },
        { field: 'last_activity', operator: 'more_than_days_ago', value: 7 }
      ],
      logic: 'AND'
    }
  },

  streakAtRisk: {
    name: "Users with a streak who haven't been active today",
    filters: {
      rules: [
        { field: 'current_streak', operator: 'greater_than', value: 0 },
        { field: 'last_activity', operator: 'not_today', value: null }
      ],
      logic: 'AND'
    }
  },

  highEngagement: {
    name: "Users with 10+ day streak",
    filters: {
      rules: [
        { field: 'current_streak', operator: 'greater_than', value: 10 }
      ],
      logic: 'AND'
    }
  },

  completelyInactive: {
    name: "Users who haven't logged in for 30+ days",
    filters: {
      rules: [
        { field: 'last_activity', operator: 'more_than_days_ago', value: 30 }
      ],
      logic: 'AND'
    }
  }
};
```

## Phase 5: Scheduling & Automation (Week 5)

### 5.1 Campaign Scheduler

```javascript
// backend/src/services/schedulerService.js
import cron from 'node-cron';
import { Campaign } from '../models/Campaign.js';
import { campaignService } from './campaignService.js';

export const schedulerService = {
  scheduledJobs: new Map(),

  start: async () => {
    // Load all active scheduled/recurring campaigns from DB
    const campaigns = await Campaign.findAll({
      where: { status: 'active', schedule_type: ['scheduled', 'recurring'] }
    });

    campaigns.forEach(campaign => {
      schedulerService.scheduleJob(campaign);
    });

    console.log(`Loaded ${campaigns.length} scheduled campaigns`);
  },

  scheduleJob: (campaign) => {
    if (campaign.schedule_type === 'scheduled') {
      // One-time scheduled send
      const sendAt = new Date(campaign.schedule_config.send_at);
      const now = new Date();
      const delay = sendAt - now;

      if (delay > 0) {
        const timeout = setTimeout(async () => {
          await campaignService.sendCampaign(campaign.id);
          schedulerService.scheduledJobs.delete(campaign.id);
        }, delay);

        schedulerService.scheduledJobs.set(campaign.id, { type: 'timeout', job: timeout });
      }

    } else if (campaign.schedule_type === 'recurring') {
      // Recurring send (using cron expression)
      const cronExpression = campaign.schedule_config.cron_expression;

      const job = cron.schedule(cronExpression, async () => {
        await campaignService.sendCampaign(campaign.id);
      });

      schedulerService.scheduledJobs.set(campaign.id, { type: 'cron', job });
    }
  },

  cancelJob: (campaignId) => {
    const scheduled = schedulerService.scheduledJobs.get(campaignId);
    if (scheduled) {
      if (scheduled.type === 'timeout') {
        clearTimeout(scheduled.job);
      } else if (scheduled.type === 'cron') {
        scheduled.job.stop();
      }
      schedulerService.scheduledJobs.delete(campaignId);
    }
  }
};
```

### 5.2 Campaign Send Logic

```javascript
// backend/src/services/campaignService.js
import { audienceService } from './audienceService.js';
import { emailService } from './emailService.js';
import { CampaignSend } from '../models/CampaignSend.js';
import { NotificationPreference } from '../models/NotificationPreference.js';

export const campaignService = {
  sendCampaign: async (campaignId) => {
    const campaign = await Campaign.findByPk(campaignId);

    if (!campaign || campaign.status !== 'active') {
      throw new Error('Campaign not found or not active');
    }

    // Get target audience
    const users = await audienceService.getAudienceUsers(campaign.filters_json);

    // Filter by notification preferences
    const eligibleUsers = [];
    for (const user of users) {
      const prefs = await NotificationPreference.findOne({ where: { user_id: user.id } });

      // Respect opt-out
      if (prefs && prefs.opt_out_all) continue;

      // Respect channel preference
      if (campaign.channel === 'email' && prefs && !prefs.email_enabled) continue;
      if (campaign.channel === 'push' && prefs && !prefs.push_enabled) continue;

      // Respect quiet hours (check time in user's timezone)
      // TODO: Implement timezone logic

      eligibleUsers.push(user);
    }

    console.log(`Sending campaign ${campaign.name} to ${eligibleUsers.length} users`);

    // Rate limiting: send in batches
    const BATCH_SIZE = 50; // AWS SES limit: 14 emails/sec, be conservative
    const BATCH_DELAY = 1000; // 1 second between batches

    for (let i = 0; i < eligibleUsers.length; i += BATCH_SIZE) {
      const batch = eligibleUsers.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (user) => {
          try {
            // Calculate user-specific template variables
            const templateVars = {
              name: user.name || 'Friend',
              app_url: process.env.APP_URL || 'https://teensundayschool.com',
              // Add more dynamic vars based on user data
            };

            const result = await emailService.send({
              to: user.email,
              subject: campaign.message_content.subject,
              html: campaign.message_content.body,
              templateVars
            });

            // Track send
            await CampaignSend.create({
              campaign_id: campaign.id,
              user_id: user.id,
              sent_at: new Date(),
              delivered_at: result.success ? new Date() : null,
              error_message: result.error || null
            });

          } catch (error) {
            console.error(`Failed to send to user ${user.id}:`, error);
            await CampaignSend.create({
              campaign_id: campaign.id,
              user_id: user.id,
              sent_at: new Date(),
              error_message: error.message
            });
          }
        })
      );

      // Wait before next batch (except on last batch)
      if (i + BATCH_SIZE < eligibleUsers.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    console.log(`Campaign ${campaign.name} sent successfully`);

    // If one-time scheduled, mark as completed
    if (campaign.schedule_type === 'scheduled') {
      await campaign.update({ status: 'completed' });
    }
  }
};
```

## Phase 6: Analytics & Tracking (Week 6)

### 6.1 Email Tracking

**For tracking opens:**
- Add invisible 1x1 tracking pixel to email HTML
- Pixel URL: `https://api.yourapp.com/track/open/{campaign_send_id}`

**For tracking clicks:**
- Replace all links with tracking URLs
- Redirect through your server: `https://api.yourapp.com/track/click/{campaign_send_id}/{link_id}`

```javascript
// backend/src/routes/tracking.js
router.get('/track/open/:sendId', async (req, res) => {
  const { sendId } = req.params;

  // Update opened_at timestamp
  await CampaignSend.update(
    { opened_at: new Date() },
    { where: { id: sendId, opened_at: null } }
  );

  // Return 1x1 transparent pixel
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': pixel.length
  });
  res.end(pixel);
});

router.get('/track/click/:sendId/:linkId', async (req, res) => {
  const { sendId, linkId } = req.params;

  // Update clicked_at timestamp
  await CampaignSend.update(
    { clicked_at: new Date() },
    { where: { id: sendId, clicked_at: null } }
  );

  // Redirect to original URL (stored in DB or encoded in linkId)
  const originalUrl = await getOriginalUrl(linkId);
  res.redirect(originalUrl);
});
```

### 6.2 Analytics Aggregation

```javascript
// backend/src/services/analyticsService.js

export const analyticsService = {
  getCampaignStats: async (campaignId) => {
    const stats = await CampaignSend.findAll({
      where: { campaign_id: campaignId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_sent'],
        [sequelize.fn('COUNT', sequelize.col('delivered_at')), 'total_delivered'],
        [sequelize.fn('COUNT', sequelize.col('opened_at')), 'total_opened'],
        [sequelize.fn('COUNT', sequelize.col('clicked_at')), 'total_clicked'],
        [sequelize.fn('SUM', sequelize.cast(sequelize.col('bounced'), 'integer')), 'total_bounced']
      ],
      raw: true
    });

    const sent = parseInt(stats[0].total_sent);
    const delivered = parseInt(stats[0].total_delivered);
    const opened = parseInt(stats[0].total_opened);
    const clicked = parseInt(stats[0].total_clicked);
    const bounced = parseInt(stats[0].total_bounced);

    return {
      total_sent: sent,
      total_delivered: delivered,
      total_opened: opened,
      total_clicked: clicked,
      total_bounced: bounced,
      delivery_rate: sent > 0 ? (delivered / sent * 100).toFixed(2) : 0,
      open_rate: delivered > 0 ? (opened / delivered * 100).toFixed(2) : 0,
      click_rate: delivered > 0 ? (clicked / delivered * 100).toFixed(2) : 0,
      bounce_rate: sent > 0 ? (bounced / sent * 100).toFixed(2) : 0
    };
  },

  getReactivationStats: async (campaignId) => {
    // Users who had activity after receiving the campaign
    const campaign = await Campaign.findByPk(campaignId);
    const sends = await CampaignSend.findAll({
      where: { campaign_id: campaignId },
      include: [{ model: User, as: 'user' }]
    });

    let reactivatedCount = 0;

    for (const send of sends) {
      // Check if user had activity after campaign was sent
      const activity = await UserActivity.findOne({
        where: {
          user_id: send.user_id,
          created_at: { [Op.gt]: send.sent_at }
        },
        order: [['created_at', 'ASC']]
      });

      if (activity) {
        reactivatedCount++;
      }
    }

    return {
      total_recipients: sends.length,
      reactivated: reactivatedCount,
      reactivation_rate: sends.length > 0
        ? (reactivatedCount / sends.length * 100).toFixed(2)
        : 0
    };
  }
};
```

## Phase 7: Compliance & Best Practices (Week 6)

### 7.1 CAN-SPAM Compliance

**Requirements:**
1. ✅ Clear "From" name and email address
2. ✅ Accurate subject line (no deceptive subjects)
3. ✅ Identify message as advertisement (if applicable)
4. ✅ Include physical postal address
5. ✅ Provide unsubscribe mechanism
6. ✅ Honor opt-outs within 10 days

**Implementation:**

```javascript
// Add to all email templates
const footerHtml = `
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;
              color: #666; font-size: 12px;">
    <p>
      <strong>Teen Sunday School</strong><br>
      123 Church Street, City, State 12345
    </p>
    <p>
      You're receiving this because you signed up for Teen Sunday School.
      <a href="{app_url}/settings/notifications">Update preferences</a> |
      <a href="{app_url}/unsubscribe?token={unsubscribe_token}">Unsubscribe</a>
    </p>
  </div>
`;
```

### 7.2 Rate Limiting

```javascript
// backend/src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const campaignRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 campaign sends per hour
  message: 'Too many campaigns sent. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply to campaign send endpoint
router.post('/admin/campaigns/:id/send', campaignRateLimiter, campaignController.send);
```

### 7.3 Bounce & Complaint Handling

```javascript
// Set up SNS webhook endpoint for AWS SES notifications
router.post('/webhooks/ses', async (req, res) => {
  const message = JSON.parse(req.body.Message);

  if (message.notificationType === 'Bounce') {
    const { mail, bounce } = message;

    // Mark send as bounced
    for (const recipient of bounce.bouncedRecipients) {
      await CampaignSend.update(
        { bounced: true, error_message: recipient.diagnosticCode },
        { where: { /* match by messageId or email */ } }
      );
    }

    // If hard bounce, disable email for user
    if (bounce.bounceType === 'Permanent') {
      for (const recipient of bounce.bouncedRecipients) {
        await NotificationPreference.update(
          { email_enabled: false },
          { where: { /* match by email */ } }
        );
      }
    }
  }

  if (message.notificationType === 'Complaint') {
    // User marked email as spam
    const { mail, complaint } = message;

    for (const recipient of complaint.complainedRecipients) {
      await NotificationPreference.update(
        { opt_out_all: true },
        { where: { /* match by email */ } }
      );
    }
  }

  res.sendStatus(200);
});
```

## Deployment Plan

### Backend Deployment Options

#### Option A: AWS Lambda + API Gateway (Serverless)
**Pros:**
- Pay per use (very cost-effective for low traffic)
- Auto-scaling
- No server management

**Cons:**
- Cold start latency
- Complex for cron jobs (need EventBridge)

#### Option B: AWS EC2 + RDS
**Pros:**
- Full control
- Easier for background jobs
- Predictable performance

**Cons:**
- Higher cost
- Need to manage server

#### Option C: AWS ECS (Docker containers)
**Pros:**
- Balance of control and scalability
- Good for microservices
- Easy CI/CD

**Cons:**
- More complex setup

**Recommended: Option B (EC2 + RDS) for simplicity**

### Deployment Steps

1. **Set up RDS PostgreSQL database**
   ```bash
   # Create RDS instance
   aws rds create-db-instance \
     --db-instance-identifier teen-sunday-school-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username admin \
     --master-user-password <password> \
     --allocated-storage 20
   ```

2. **Launch EC2 instance**
   - Instance type: t3.small (2 vCPU, 2GB RAM) - ~$15/month
   - OS: Ubuntu 22.04 LTS
   - Security group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

3. **Install dependencies on EC2**
   ```bash
   # Connect to EC2
   ssh -i key.pem ubuntu@<ec2-ip>

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 (process manager)
   sudo npm install -g pm2

   # Install nginx (reverse proxy)
   sudo apt-get install -y nginx
   ```

4. **Deploy backend code**
   ```bash
   # Clone repository
   git clone <repo-url>
   cd teen-sunday-school/backend

   # Install dependencies
   npm install

   # Set up environment variables
   cp .env.example .env
   nano .env  # Edit with production values

   # Run migrations
   npm run migrate

   # Start with PM2
   pm2 start src/index.js --name "teen-sunday-school-api"
   pm2 startup  # Auto-start on reboot
   pm2 save
   ```

5. **Configure nginx**
   ```nginx
   # /etc/nginx/sites-available/api
   server {
     listen 80;
     server_name api.teensundayschool.com;

     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

6. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d api.teensundayschool.com
   ```

7. **Update frontend to use production API**
   ```bash
   # In .env.production
   REACT_APP_API_URL=https://api.teensundayschool.com/api
   ```

8. **Update GitHub Actions for backend deployment**
   ```yaml
   # .github/workflows/deploy-backend.yml
   name: Deploy Backend

   on:
     push:
       branches: [main]
       paths:
         - 'backend/**'

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2

         - name: Deploy to EC2
           uses: appleboy/ssh-action@master
           with:
             host: ${{ secrets.EC2_HOST }}
             username: ubuntu
             key: ${{ secrets.EC2_SSH_KEY }}
             script: |
               cd /home/ubuntu/teen-sunday-school
               git pull origin main
               cd backend
               npm install
               npm run migrate
               pm2 restart teen-sunday-school-api
   ```

## Testing Plan

### Backend Tests
- Unit tests: Services, utilities
- Integration tests: API endpoints
- E2E tests: Full campaign flow

### Frontend Tests
- Component tests: Campaign builder, audience selector
- Integration tests: API service calls
- E2E tests: Admin creates and sends campaign

## Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1. Backend Foundation | 2 weeks | Database, API, auth |
| 2. Frontend Integration | 1 week | Contexts, pages, components |
| 3. Email Integration | 1 week | Templates, sending logic |
| 4. Audience Targeting | 1 week | Query builder, filters |
| 5. Scheduling | 1 week | Cron jobs, campaign automation |
| 6. Analytics | 1 week | Tracking, reporting |
| 7. Polish & Testing | 1 week | Bug fixes, optimization |
| **Total** | **8 weeks** | Full feature |

## Success Metrics

After launch, track:
1. **Campaign Performance**
   - Open rate > 20%
   - Click-through rate > 3%
   - Bounce rate < 2%

2. **Re-engagement**
   - % of inactive users who return after campaign
   - Streak recovery rate

3. **System Health**
   - Email delivery rate > 98%
   - API response time < 500ms
   - Zero spam complaints

## Cost Estimate

### Infrastructure
- EC2 t3.small: $15/month
- RDS db.t3.micro: $15/month
- AWS SES: $0.10/1000 emails (first 62,000 free with EC2)
- S3 + CloudFront (existing): $5/month
- **Total: ~$35/month**

### Development
- 8 weeks @ 40 hours/week = 320 hours
- At $50/hour (example): $16,000

## Next Steps

1. **Review and approve this plan**
2. **Set up development environment** (local PostgreSQL, email sandbox)
3. **Create backend repository structure**
4. **Begin Phase 1: Database schema and API**

---

## Questions to Answer Before Starting

1. Do you want to implement user authentication? (Required for campaigns)
2. Which email service provider? (AWS SES recommended)
3. Do you need push notifications or just email for MVP?
4. What's the expected user volume? (Affects infrastructure choices)
5. Timeline constraints? (Can we do 8 weeks or need faster MVP?)
6. Budget for infrastructure?

Let me know your preferences and I'll begin implementation!
