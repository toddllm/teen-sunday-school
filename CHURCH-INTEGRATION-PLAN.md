# Church Systems Integration - Implementation Plan

## Executive Summary

This document outlines the implementation plan for integrating the Teen Sunday School app with church management systems (starting with Planning Center). This is a **major architectural enhancement** that requires adding backend infrastructure to the current frontend-only application.

## Current State Analysis

### What We Have
- ✅ Robust React frontend with lesson management
- ✅ LocalStorage-based data persistence
- ✅ Admin UI for lesson creation
- ✅ Strong CI/CD pipeline with GitHub Actions

### What We Need
- ❌ Backend API server
- ❌ Database for persistent storage
- ❌ Authentication & authorization system
- ❌ Organization/multi-tenancy support
- ❌ Secure credential storage
- ❌ Background job scheduling
- ❌ External API integration layer

## Proposed Architecture

### Technology Stack

#### Backend
- **Runtime**: Node.js 18+ with Express.js
- **Language**: TypeScript for type safety
- **Database**: PostgreSQL 14+ (scalable, ACID-compliant)
- **ORM**: Prisma (modern, type-safe)
- **Authentication**: JWT with bcrypt for password hashing
- **Job Scheduler**: Bull + Redis (reliable background jobs)
- **API Security**: Helmet, CORS, rate limiting

#### Infrastructure
- **Development**: Docker Compose for local setup
- **Production**: Railway/Render/Heroku (easy Node.js deployment)
- **Environment**: dotenv for configuration
- **Monitoring**: Winston for logging

### Database Schema

```prisma
// Organizations
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users        User[]
  groups       Group[]
  integrations ExternalIntegration[]
}

// Users with roles
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  passwordHash   String
  firstName      String
  lastName       String
  role           Role     @default(MEMBER)
  organizationId String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  groupMemberships GroupMember[]
}

enum Role {
  ORG_ADMIN
  TEACHER
  MEMBER
}

// Groups
model Group {
  id             String   @id @default(cuid())
  name           String
  description    String?
  organizationId String
  externalId     String?  // For syncing with external systems
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  members      GroupMember[]
  mappings     ExternalGroupMapping[]
}

model GroupMember {
  id        String   @id @default(cuid())
  userId    String
  groupId   String
  role      String   @default("member")
  createdAt DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id])
  group Group @relation(fields: [groupId], references: [id])

  @@unique([userId, groupId])
}

// External Integrations
model ExternalIntegration {
  id             String   @id @default(cuid())
  organizationId String
  provider       String   // "planning_center", "ccb", "elvanto", etc.
  status         IntegrationStatus @default(INACTIVE)

  // Encrypted credentials
  credentialsEncrypted String   // JSON containing OAuth tokens, API keys

  // OAuth specific fields
  accessToken    String?
  refreshToken   String?
  tokenExpiresAt DateTime?

  // Sync configuration
  syncEnabled    Boolean  @default(false)
  syncFrequency  String   @default("daily") // "hourly", "daily", "weekly"
  lastSyncAt     DateTime?
  lastSyncStatus String?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  groupMappings ExternalGroupMapping[]
  syncLogs     SyncLog[]
}

enum IntegrationStatus {
  ACTIVE
  INACTIVE
  ERROR
  PENDING
}

// Group Mappings
model ExternalGroupMapping {
  id            String   @id @default(cuid())
  integrationId String
  externalGroupId String  // ID from external system
  externalGroupName String
  groupId       String?  // NULL if not yet mapped
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  integration ExternalIntegration @relation(fields: [integrationId], references: [id])
  group       Group? @relation(fields: [groupId], references: [id])

  @@unique([integrationId, externalGroupId])
}

// Sync Logs for Analytics
model SyncLog {
  id            String   @id @default(cuid())
  integrationId String
  status        String   // "success", "error", "partial"
  startedAt     DateTime @default(now())
  completedAt   DateTime?

  // Metrics
  peopleAdded   Int @default(0)
  peopleUpdated Int @default(0)
  peopleRemoved Int @default(0)
  groupsAdded   Int @default(0)
  groupsUpdated Int @default(0)

  errorMessage  String?
  metadata      Json?    // Additional details

  integration ExternalIntegration @relation(fields: [integrationId], references: [id])
}
```

## API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login
POST   /api/auth/logout            # Logout
GET    /api/auth/me                # Get current user
POST   /api/auth/refresh           # Refresh JWT token
```

### Organizations (Admin Only)
```
GET    /api/orgs                   # List orgs (super admin)
POST   /api/orgs                   # Create org (super admin)
GET    /api/orgs/:id               # Get org details
PUT    /api/orgs/:id               # Update org
DELETE /api/orgs/:id               # Delete org
```

### Groups
```
GET    /api/orgs/:orgId/groups     # List groups
POST   /api/orgs/:orgId/groups     # Create group
GET    /api/groups/:id             # Get group details
PUT    /api/groups/:id             # Update group
DELETE /api/groups/:id             # Delete group
POST   /api/groups/:id/members     # Add member
DELETE /api/groups/:id/members/:userId  # Remove member
```

### Integrations (Org Admin Only)
```
GET    /api/orgs/:orgId/integrations                    # List integrations
POST   /api/orgs/:orgId/integrations                    # Create integration
GET    /api/orgs/:orgId/integrations/:id                # Get integration details
PUT    /api/orgs/:orgId/integrations/:id                # Update integration
DELETE /api/orgs/:orgId/integrations/:id                # Delete integration

# OAuth flow
GET    /api/integrations/planning-center/auth           # Initiate OAuth
GET    /api/integrations/planning-center/callback       # OAuth callback

# Sync operations
POST   /api/orgs/:orgId/integrations/:id/sync           # Manual sync
GET    /api/orgs/:orgId/integrations/:id/sync/status    # Get sync status
GET    /api/orgs/:orgId/integrations/:id/sync/logs      # Get sync history

# Group mappings
GET    /api/orgs/:orgId/integrations/:id/groups         # List external groups
POST   /api/orgs/:orgId/integrations/:id/mappings       # Create mapping
PUT    /api/integrations/mappings/:id                   # Update mapping
DELETE /api/integrations/mappings/:id                   # Delete mapping
```

### Analytics
```
GET    /api/orgs/:orgId/analytics/integrations          # Integration usage stats
GET    /api/orgs/:orgId/analytics/sync-success          # Sync success rates
```

## Planning Center Integration

### OAuth Flow
1. User clicks "Connect Planning Center" in admin settings
2. App redirects to Planning Center OAuth authorize URL
3. User approves access
4. Planning Center redirects back with authorization code
5. App exchanges code for access/refresh tokens
6. Tokens stored encrypted in database

### API Endpoints Used
```
# OAuth
POST   https://api.planningcenteronline.com/oauth/token

# People API
GET    https://api.planningcenteronline.com/people/v2/people
GET    https://api.planningcenteronline.com/people/v2/people/{id}

# Groups API (Lists)
GET    https://api.planningcenteronline.com/people/v2/lists
GET    https://api.planningcenteronline.com/people/v2/lists/{id}/people
```

### Sync Process
1. **Fetch External Groups**: Get all lists/groups from Planning Center
2. **Match/Create Mappings**: Admin maps external groups to internal groups
3. **Sync People**:
   - Fetch people from each mapped group
   - Create/update users in local database
   - Add to appropriate groups
4. **Handle Removals**: Remove people no longer in external groups
5. **Log Results**: Record sync metrics for analytics

## Frontend Changes

### New Pages/Components

#### 1. Integration Settings (`/admin/settings/integrations`)
```jsx
- IntegrationList: Shows all configured integrations
- IntegrationCard: Status, last sync, actions
- AddIntegrationModal: Choose provider (Planning Center, etc.)
- IntegrationForm: Configure credentials, sync settings
```

#### 2. Planning Center Connection (`/admin/integrations/planning-center`)
```jsx
- PlanningCenterAuth: OAuth connection flow
- ConnectionStatus: Show connection health
- SyncControls: Manual sync button, schedule settings
```

#### 3. Group Mapping (`/admin/integrations/:id/mappings`)
```jsx
- ExternalGroupsList: Show groups from Planning Center
- MappingInterface: Drag-and-drop or dropdown to map groups
- UnmappedGroupsWarning: Alert for unmapped groups
```

#### 4. Sync Logs (`/admin/integrations/:id/logs`)
```jsx
- SyncLogTable: History of sync operations
- SyncMetrics: Charts showing people/groups synced
- ErrorDisplay: Show sync errors with retry option
```

### Updated Components
- **AdminNavigation**: Add "Integrations" menu item
- **OrganizationContext**: Add org-level state management
- **AuthContext**: Add authentication state
- **ProtectedRoute**: Require org admin role

## Security Considerations

### Credential Storage
- **Never store plaintext credentials**
- Use encryption at rest (AES-256-GCM)
- Store encryption key in environment variable (AWS KMS in production)
- Rotate tokens regularly

### API Security
- **Rate Limiting**: Prevent abuse (express-rate-limit)
- **CORS**: Whitelist frontend domain only
- **Helmet**: Security headers
- **Input Validation**: Joi or Zod for request validation
- **SQL Injection**: Prisma provides protection
- **XSS Protection**: Sanitize all user inputs

### Authentication
- **JWT with short expiry** (15 minutes)
- **Refresh tokens** for session management
- **bcrypt** for password hashing (salt rounds: 12)
- **HTTPS only** in production
- **CSRF protection** for state-changing operations

### Authorization
```typescript
// Middleware example
const requireOrgAdmin = (req, res, next) => {
  if (req.user.role !== 'ORG_ADMIN') {
    return res.status(403).json({ error: 'Org admin required' });
  }
  if (req.user.organizationId !== req.params.orgId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};
```

## Background Jobs

### Job Types
1. **Scheduled Sync**: Run based on integration.syncFrequency
2. **Token Refresh**: Refresh OAuth tokens before expiry
3. **Cleanup**: Remove old sync logs (retention: 90 days)

### Job Queue Setup (Bull)
```typescript
// syncQueue.ts
import Bull from 'bull';

export const syncQueue = new Bull('integration-sync', {
  redis: process.env.REDIS_URL
});

// Worker
syncQueue.process(async (job) => {
  const { integrationId } = job.data;
  await performSync(integrationId);
});

// Schedule
syncQueue.add(
  { integrationId: 'xxx' },
  { repeat: { cron: '0 2 * * *' } } // Daily at 2 AM
);
```

## Deployment Strategy

### Phase 1: Backend Foundation (Week 1-2)
- [ ] Set up Express server with TypeScript
- [ ] Configure PostgreSQL database
- [ ] Implement Prisma schema and migrations
- [ ] Build authentication system
- [ ] Create basic CRUD endpoints for orgs/groups/users
- [ ] Add security middleware

### Phase 2: Integration Core (Week 3-4)
- [ ] Implement Planning Center OAuth flow
- [ ] Build sync service
- [ ] Create integration management endpoints
- [ ] Add credential encryption
- [ ] Set up job queue with Bull/Redis

### Phase 3: Frontend Integration (Week 5)
- [ ] Update frontend to use backend API
- [ ] Build integration settings UI
- [ ] Create group mapping interface
- [ ] Add sync controls and logs viewer
- [ ] Update authentication flow

### Phase 4: Testing & Polish (Week 6)
- [ ] Integration testing with Planning Center sandbox
- [ ] Load testing for sync operations
- [ ] Security audit
- [ ] Documentation and deployment guides
- [ ] Production deployment

## Environment Variables

```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/teen_sunday_school
REDIS_URL=redis://localhost:6379

JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRY=15m
REFRESH_TOKEN_SECRET=<generate-secure-random-string>
REFRESH_TOKEN_EXPIRY=7d

ENCRYPTION_KEY=<generate-32-byte-hex-string>

# Planning Center OAuth
PLANNING_CENTER_CLIENT_ID=<from-planning-center-app>
PLANNING_CENTER_CLIENT_SECRET=<from-planning-center-app>
PLANNING_CENTER_REDIRECT_URI=http://localhost:3001/api/integrations/planning-center/callback

# Frontend
REACT_APP_API_URL=http://localhost:3001
NODE_ENV=development
PORT=3001

# Production
FRONTEND_URL=https://your-app.com
ALLOWED_ORIGINS=https://your-app.com
```

## Analytics Metrics

### Track in Database
- `integrations.count`: Number of active integrations by provider
- `sync_logs.success_rate`: Percentage of successful syncs
- `sync_logs.avg_duration`: Average sync time
- `sync_logs.people_synced`: Total people synced per day/week/month

### Dashboard Queries
```sql
-- Sync success rate (last 30 days)
SELECT
  DATE(started_at) as sync_date,
  COUNT(*) as total_syncs,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_syncs,
  ROUND(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as success_rate
FROM sync_logs
WHERE started_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(started_at)
ORDER BY sync_date DESC;

-- Organizations using integrations
SELECT
  provider,
  COUNT(DISTINCT organization_id) as org_count,
  COUNT(*) as integration_count
FROM external_integrations
WHERE status = 'ACTIVE'
GROUP BY provider;
```

## Migration from LocalStorage

### Data Migration Script
```typescript
// migrate-to-backend.ts
// Run once to migrate existing localStorage lessons to backend

async function migrateLessonsToBackend() {
  const lessons = JSON.parse(localStorage.getItem('lessons') || '[]');

  for (const lesson of lessons) {
    await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lesson)
    });
  }

  // Keep localStorage as cache/offline backup
  console.log(`Migrated ${lessons.length} lessons to backend`);
}
```

## Future Enhancements

### Additional Integrations
- Church Community Builder (CCB)
- Elvanto
- Breeze ChMS
- Fellowship One
- Rock RMS

### Advanced Features
- **Bi-directional sync**: Push lesson completion data back to Planning Center
- **Conflict resolution**: Handle data conflicts intelligently
- **Selective sync**: Choose which groups to sync
- **Custom field mapping**: Map custom fields between systems
- **Webhook support**: Real-time updates from Planning Center
- **SSO integration**: Single sign-on with church system credentials

## Testing Strategy

### Unit Tests
- Integration service methods
- Sync logic
- Encryption/decryption
- API endpoint handlers

### Integration Tests
- OAuth flow end-to-end
- Database operations
- API endpoint responses
- Job queue processing

### Security Tests
- SQL injection attempts
- XSS attempts
- Authentication bypass attempts
- Rate limiting
- CORS violations

## Documentation Deliverables

1. **Setup Guide**: How to configure Planning Center app
2. **Admin Manual**: How to use integration features
3. **API Documentation**: OpenAPI/Swagger spec
4. **Troubleshooting**: Common issues and solutions
5. **Security Best Practices**: For production deployment

## Success Criteria

- [ ] Org admin can connect to Planning Center via OAuth
- [ ] Groups sync automatically from Planning Center
- [ ] People sync automatically into correct groups
- [ ] Manual "Sync Now" works reliably
- [ ] Sync logs show detailed metrics
- [ ] 95%+ sync success rate
- [ ] Credentials stored securely (encrypted)
- [ ] Sub-second API response times
- [ ] Zero security vulnerabilities in audit
- [ ] Complete documentation for admins

## Estimated Effort

- **Backend Infrastructure**: 40 hours
- **Planning Center Integration**: 30 hours
- **Frontend UI**: 25 hours
- **Testing & Security**: 20 hours
- **Documentation**: 10 hours
- **Buffer for unknowns**: 15 hours

**Total**: ~140 hours (3.5 weeks full-time)

---

## Next Steps

1. Review and approve this plan
2. Set up development environment (Docker, PostgreSQL, Redis)
3. Create Planning Center developer app
4. Begin Phase 1 implementation
5. Schedule weekly progress reviews
