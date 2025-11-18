# Parent Overview Mode

## Overview

The Parent Overview Mode feature provides parents with a read-only dashboard to stay informed about their teen's Sunday School journey. This feature respects teen privacy by default, showing only lesson content and curriculum information without exposing private teen data such as notes, streaks, or scores.

## Features

### 1. Parent Account Linking
- Parents can create accounts with the `PARENT` role
- Parents can link their children's accounts using the child's email address
- Configurable permissions per child:
  - `canViewProgress`: View general progress (default: true)
  - `canViewLessons`: View lesson content (default: true)
  - `canViewActivities`: View private activities, notes, and streaks (default: false)

### 2. Parent Dashboard
The parent dashboard provides three main views:

#### Overview Tab
- **My Children**: Display of all linked children and their groups
- **Recent Lessons**: Last 10 lessons covered in the children's groups
- **Upcoming Series**: Preview of upcoming quarterly series

#### Calendar Tab
- **Lesson Calendar**: Chronological view of all planned lessons
- **Estimated Dates**: Calculated dates based on quarterly schedule
- **Scripture References**: Bible passages for each lesson

#### My Children Tab
- **Linked Children**: Detailed view of each child
- **Groups**: Which groups/classes the child is in
- **Permissions**: What data the parent can view

### 3. Privacy Protection
- **Default Privacy**: Private teen data is NOT exposed by default
- **Privacy Notice**: Clear messaging about what data is visible
- **Opt-in Activities**: Parents must explicitly enable viewing private activities
- **No Individual Scores**: Streaks, badges, and scores remain private

## Database Schema

### New Models

#### ParentChild
Manages the parent-child relationship and permissions:

```prisma
model ParentChild {
  id        String   @id @default(cuid())
  parentId  String
  childId   String

  canViewProgress    Boolean @default(true)
  canViewLessons     Boolean @default(true)
  canViewActivities  Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  parent User @relation("ParentRelation", fields: [parentId], references: [id])
  child  User @relation("ChildRelation", fields: [childId], references: [id])

  @@unique([parentId, childId])
}
```

#### ParentLogin
Tracks parent login metrics:

```prisma
model ParentLogin {
  id        String   @id @default(cuid())
  userId    String
  loginAt   DateTime @default(now())
  ipAddress String?
  userAgent String?

  user User @relation(fields: [userId], references: [id])
}
```

#### ParentFeedback
Collects parent feedback:

```prisma
model ParentFeedback {
  id          String   @id @default(cuid())
  userId      String
  rating      Int?     // 1-5 stars
  comment     String?
  category    String?  // "content", "usability", "features", etc.
  lessonId    String?  // Optional: feedback about specific lesson
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

### Updated Models

#### User
Added new role and relationships:

```prisma
enum Role {
  SUPER_ADMIN
  ORG_ADMIN
  TEACHER
  MEMBER
  PARENT  // NEW
}

model User {
  // ... existing fields

  // Parent-child relationships
  parentsOf        ParentChild[] @relation("ParentRelation")
  childrenOf       ParentChild[] @relation("ChildRelation")

  // Parent-specific data
  parentLogins     ParentLogin[]
  parentFeedback   ParentFeedback[]
}
```

## API Endpoints

All endpoints require authentication and the `PARENT` role.

### GET /api/parent/overview
Get parent overview dashboard data.

**Response:**
```json
{
  "children": [
    {
      "id": "child_id",
      "firstName": "John",
      "lastName": "Doe",
      "groups": [
        {
          "id": "group_id",
          "name": "Teen Group A",
          "description": "High school teens",
          "grade": "9-12"
        }
      ],
      "permissions": {
        "canViewProgress": true,
        "canViewLessons": true,
        "canViewActivities": false
      }
    }
  ],
  "recentLessons": [
    {
      "id": "lesson_id",
      "title": "God's Love: Unconditional and Everlasting",
      "quarter": 9,
      "unit": 3,
      "lessonNumber": 12,
      "scripture": "Isaiah 43:1-7",
      "groups": [{"id": "group_id", "name": "Teen Group A"}],
      "date": "2025-11-15T00:00:00.000Z"
    }
  ],
  "upcomingSeries": [
    {
      "quarter": 10,
      "unit": 1,
      "title": "Walking in Faith"
    }
  ]
}
```

### GET /api/parent/calendar
Get lesson calendar view.

**Response:**
```json
{
  "calendar": [
    {
      "id": "lesson_id",
      "title": "God's Love: Unconditional and Everlasting",
      "quarter": 9,
      "unit": 3,
      "lessonNumber": 12,
      "scripture": "Isaiah 43:1-7",
      "groups": [{"id": "group_id", "name": "Teen Group A"}],
      "estimatedDate": "2025-11-15"
    }
  ],
  "totalLessons": 52
}
```

### GET /api/parent/children
Get list of linked children.

**Response:**
```json
{
  "children": [
    {
      "id": "child_id",
      "email": "child@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "groups": [...],
      "permissions": {...},
      "linkedAt": "2025-11-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/parent/children
Link a child to parent account.

**Request Body:**
```json
{
  "childEmail": "child@example.com",
  "canViewActivities": false
}
```

**Response:**
```json
{
  "message": "Child linked successfully",
  "relationship": {
    "id": "relationship_id",
    "child": {
      "id": "child_id",
      "email": "child@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "permissions": {
      "canViewProgress": true,
      "canViewLessons": true,
      "canViewActivities": false
    }
  }
}
```

### DELETE /api/parent/children/:childId
Unlink a child from parent account.

**Response:**
```json
{
  "message": "Child unlinked successfully"
}
```

### POST /api/parent/feedback
Submit parent feedback.

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great curriculum!",
  "category": "content",
  "lessonId": "lesson_id"  // Optional
}
```

**Response:**
```json
{
  "message": "Feedback submitted successfully",
  "feedback": {
    "id": "feedback_id",
    "rating": 5,
    "category": "content",
    "createdAt": "2025-11-18T00:00:00.000Z"
  }
}
```

## Frontend Components

### ParentOverviewPage
Main dashboard component located at `/parent`.

**Features:**
- Three-tab interface (Overview, Calendar, My Children)
- Child account linking modal
- Privacy notice banner
- Responsive design for mobile and desktop

**Files:**
- `/src/pages/ParentOverviewPage.js`
- `/src/pages/ParentOverviewPage.css`

## Usage Examples

### Creating a Parent Account

1. Register a new account with the organization
2. Have an admin update the user role to `PARENT`
3. Navigate to `/parent`
4. Click "Link Child Account"
5. Enter child's email address
6. Optionally enable viewing private activities
7. Submit to link the account

### Viewing Lesson Content

1. Log in as a parent
2. Navigate to `/parent`
3. View recent lessons in the Overview tab
4. See upcoming series and topics
5. Switch to Calendar tab for chronological view

### Managing Permissions

Currently, permissions are set during the linking process. Future enhancements could include:
- Updating permissions for existing linked children
- Time-based permission expiration
- Child approval workflow for linking

## Security Considerations

### Role-Based Access Control
- All parent endpoints require `PARENT` role
- Parents can only link children in the same organization
- Parents can only link users with `MEMBER` role (not admins or teachers)

### Data Privacy
- Private teen data (streaks, badges, scores, notes) is NOT exposed by default
- `canViewActivities` must be explicitly enabled
- Parents only see curriculum content and lesson topics

### Metrics Tracking
- Parent logins are tracked for analytics
- IP address and user agent are stored for security
- Login tracking failures do not prevent login

## Future Enhancements

### Planned Features
1. **Session Highlight Reels**: Leaders can share specific session highlights
2. **Push Notifications**: Notify parents of new lessons or updates
3. **Permission Management UI**: Update child permissions after linking
4. **Child Approval Workflow**: Require child approval before linking
5. **Progress Reports**: Generate PDF reports for parent review
6. **Multi-Child Dashboard**: Compare progress across multiple children
7. **Feedback Analytics**: Dashboard for org admins to view parent feedback

### Optional Integrations
- Email notifications for new lessons
- SMS alerts for important updates
- Integration with church apps
- Calendar export (iCal format)

## Migration Guide

### Database Migration

Run the Prisma migration to add the new tables:

```bash
cd server
npx prisma migrate dev --name add_parent_overview_mode
```

This will:
1. Add `PARENT` to the `Role` enum
2. Create `ParentChild` table
3. Create `ParentLogin` table
4. Create `ParentFeedback` table
5. Add relationships to `User` model

### Backend Deployment

No additional configuration required. The new endpoints are automatically available at:
- `/api/parent/*`

### Frontend Deployment

The parent dashboard is available at:
- `/parent`

No additional environment variables or configuration needed.

## Testing

### Manual Testing Checklist

#### Parent Account Creation
- [ ] Register new account
- [ ] Admin assigns PARENT role
- [ ] User can access `/parent` route
- [ ] Non-parent users cannot access `/parent` route

#### Child Linking
- [ ] Parent can link child by email
- [ ] Cannot link child from different organization
- [ ] Cannot link admin/teacher accounts
- [ ] Duplicate linking is prevented
- [ ] Unlinking works correctly

#### Data Visibility
- [ ] Parent sees recent lessons
- [ ] Parent sees upcoming series
- [ ] Parent sees lesson calendar
- [ ] Private data is NOT visible (default)
- [ ] Privacy notice is displayed

#### Permissions
- [ ] Default permissions are correct (progress: true, lessons: true, activities: false)
- [ ] `canViewActivities` can be enabled during linking
- [ ] Permissions are enforced on backend

#### Metrics
- [ ] Parent logins are tracked
- [ ] Login failures don't prevent access
- [ ] IP and user agent are captured

#### Feedback
- [ ] Parents can submit feedback
- [ ] Rating validation (1-5)
- [ ] Feedback is stored correctly

### Automated Tests

Create tests for:
- Parent controller endpoints
- Permission checks
- Data filtering (ensuring private data is excluded)
- Parent login tracking
- Feedback submission

Example test structure:

```javascript
describe('Parent Overview Mode', () => {
  describe('GET /api/parent/overview', () => {
    it('requires authentication', async () => { ... });
    it('requires PARENT role', async () => { ... });
    it('returns children and lessons', async () => { ... });
    it('excludes private teen data', async () => { ... });
  });

  describe('POST /api/parent/children', () => {
    it('links child successfully', async () => { ... });
    it('prevents linking from different org', async () => { ... });
    it('prevents duplicate linking', async () => { ... });
  });
});
```

## Metrics & Analytics

### Tracked Metrics

1. **Parent Logins**
   - Login frequency
   - Login times
   - User agent distribution
   - Geographic distribution (via IP)

2. **Parent Feedback**
   - Average rating
   - Feedback by category
   - Feedback trends over time
   - Lesson-specific feedback

3. **Feature Usage**
   - Number of parent accounts
   - Number of linked children per parent
   - Most viewed lessons
   - Calendar access frequency

### Accessing Metrics

Metrics can be queried via Prisma:

```typescript
// Parent login metrics
const loginCount = await prisma.parentLogin.count({
  where: {
    loginAt: {
      gte: startDate,
      lte: endDate,
    },
  },
});

// Average feedback rating
const avgRating = await prisma.parentFeedback.aggregate({
  _avg: {
    rating: true,
  },
  where: {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  },
});
```

## Support & Troubleshooting

### Common Issues

#### Parent Cannot Access Dashboard
- Verify user role is set to `PARENT`
- Check JWT token includes correct role
- Ensure user is active (`isActive: true`)

#### Child Linking Fails
- Verify child email is correct
- Check child is in same organization
- Ensure child has `MEMBER` role
- Check for existing parent-child relationship

#### Lessons Not Showing
- Verify child is assigned to groups
- Check groups have lessons assigned
- Ensure lessons are not filtered out

#### Private Data Visible
- Check `canViewActivities` permission
- Verify backend is filtering correctly
- Review controller logic

### Debug Mode

Enable debug logging:

```typescript
// In server/src/controllers/parent.controller.ts
logger.debug('Parent overview request', {
  parentId,
  childCount,
  lessonCount
});
```

## Contributors

This feature was implemented as part of the Teen Sunday School platform enhancement initiative.

**Related Issues:**
- #17 - Parent Overview Mode

**Related Documentation:**
- [Authentication Guide](./AUTHENTICATION.md)
- [Role-Based Access Control](./RBAC.md)
- [Privacy Guidelines](./PRIVACY.md)

## License

This feature is part of the Teen Sunday School platform and follows the same license as the main project.
