# Topical Index Explorer - Feature Documentation

## Overview

The Topical Index Explorer provides a browsable index of Bible topics connected to curated verses and lesson hooks. This feature helps teens and leaders find relevant Bible passages organized by topics they care about.

## Features Implemented

### User-Facing Features

1. **Topic Browsing** (`/topics`)
   - Grid view of all available topics
   - Category filtering (Relationships, Identity, Faith & Doubt, Modern Life, etc.)
   - Search by topic name or tags
   - View count and verse count for each topic
   - Responsive design for mobile and desktop

2. **Topic Detail View** (`/topics/:id`)
   - Topic name, description, and category
   - Tagged keywords for easy discovery
   - List of key verses with expandable text
   - Notes explaining why each verse is relevant
   - Related reading plans integration
   - Suggested discussion questions
   - View tracking for analytics

3. **Related Reading Plans**
   - Automatic detection of related reading plans based on topic tags
   - Quick navigation to start a reading plan from a topic
   - Conversion tracking (topic views → plan starts)

### Admin Features

4. **Topic Management** (`/admin/topics`)
   - Create, edit, and delete topics
   - Manage topic verses with custom ordering
   - Set topic categories and tags
   - Control visibility (global vs organization-specific)
   - Set popularity ranking
   - View topic metrics (views, plan starts, conversion rate)
   - Bulk operations support

## Database Schema

### Models

```prisma
Topic {
  id              String
  organizationId  String?    // NULL for global topics
  name            String
  description     String?
  category        String?
  tags            String[]
  popularityRank  Int
  isGlobal        Boolean
  isActive        Boolean
  createdBy       String?
  createdAt       DateTime
  updatedAt       DateTime
  verses          TopicVerse[]
  views           TopicView[]
}

TopicVerse {
  id        String
  topicId   String
  verseRef  String     // e.g., "John 3:16"
  note      String?
  sortOrder Int
  createdAt DateTime
  updatedAt DateTime
  topic     Topic
}

TopicView {
  id          String
  topicId     String
  userId      String?   // NULL for anonymous
  viewedAt    DateTime
  startedPlan Boolean   // Conversion tracking
  topic       Topic
}
```

## API Endpoints

### Public Endpoints (No Auth Required)

- `GET /api/topics` - List all topics with filtering
  - Query params: `category`, `search`, `includeOrgTopics`
- `GET /api/topics/categories` - Get all unique categories

### Authenticated Endpoints

- `GET /api/topics/:id` - Get topic details (tracks view)
- `POST /api/topics/:id/plan-start` - Track reading plan start

### Admin Endpoints (Requires ORG_ADMIN or SUPER_ADMIN)

- `POST /api/topics` - Create a new topic
- `PUT /api/topics/:id` - Update topic
- `DELETE /api/topics/:id` - Delete topic
- `POST /api/topics/:id/verses` - Add verse to topic
- `PUT /api/topics/verses/:verseId` - Update verse
- `DELETE /api/topics/verses/:verseId` - Delete verse
- `GET /api/topics/:id/metrics` - Get topic analytics

## File Structure

### Backend

```
server/
├── prisma/
│   ├── schema.prisma                      # Updated with Topic models
│   ├── migrations/
│   │   └── [timestamp]_add_topical_index/
│   │       └── migration.sql              # Database migration
│   └── seed-topics.ts                     # Sample data
├── src/
│   ├── controllers/
│   │   └── topic.controller.ts            # Topic CRUD operations
│   ├── routes/
│   │   └── topic.routes.ts                # API routes
│   └── index.ts                           # Updated with topic routes
```

### Frontend

```
src/
├── contexts/
│   └── TopicContext.js                    # State management
├── pages/
│   ├── TopicsPage.js                      # Browse topics
│   ├── TopicsPage.css
│   ├── TopicDetailPage.js                 # Topic detail view
│   ├── TopicDetailPage.css
│   ├── TopicsAdminPage.js                 # Admin management
│   └── TopicsAdminPage.css
├── components/
│   └── Navigation.js                      # Updated with Topics link
├── App.js                                 # Updated with routes
└── index.js                               # Updated with TopicProvider
```

## Sample Topics Included

The seed file includes 10 sample topics across different categories:

**Faith & Doubt:**
- Anxiety and Worry
- Hope
- Prayer

**Identity:**
- Identity in Christ
- Purpose and Calling

**Relationships:**
- Friendship
- Forgiveness
- Dating and Relationships

**Modern Life:**
- Social Media & Technology
- Peer Pressure

Each topic includes 4-6 relevant verses with explanatory notes.

## Running the Seed Script

To populate the database with sample topics:

```bash
cd server
npx tsx prisma/seed-topics.ts
```

## Usage Examples

### For Teens

1. Navigate to **Topics** in the main navigation
2. Browse topics by category or search for keywords
3. Click on a topic to view detailed information
4. Read key verses and their context
5. Start a related reading plan if interested

### For Leaders

1. Go to **Admin Dashboard** → **Topics**
2. Create a new topic:
   - Enter name, description, category
   - Add relevant tags for searchability
   - Add verses with explanatory notes
   - Set as global or organization-specific
3. Edit existing topics to refine content
4. View metrics to see which topics resonate most

## Metrics & Analytics

The system tracks:
- **View Count**: How many times each topic is viewed
- **Plan Starts**: How many users started a reading plan from the topic
- **Conversion Rate**: Percentage of views that led to plan starts
- **Recent Activity**: Timeline of recent views

## Integration Points

### Bible API Integration

- Uses existing `bibleAPI.js` service to fetch verse text
- Supports verse reference format (e.g., "John 3:16")
- Compatible with multiple Bible translations

### Reading Plans Integration

- Topics automatically detect related reading plans
- Based on matching tags and categories
- Tracks when users navigate from topic to plan
- Helps measure topic effectiveness

## Permissions

### Read Access
- All users can browse and view global topics
- Authenticated users can also view organization-specific topics

### Write Access (Admin Only)
- `ORG_ADMIN`: Can create and manage organization-specific topics
- `SUPER_ADMIN`: Can create and manage global topics
- Both can view metrics for their accessible topics

## Future Enhancements

Potential improvements for future iterations:

1. **User-Generated Topics**: Allow teachers to create custom topics
2. **Topic Collections**: Group related topics into themed collections
3. **Verse Highlighting**: Highlight key phrases within verses
4. **Social Sharing**: Share topics on social media
5. **Study Guides**: Generate study guides from topics
6. **Video Integration**: Embed teaching videos for topics
7. **Community Notes**: Allow users to add their own insights
8. **Topic Recommendations**: AI-powered topic suggestions based on user interests

## Testing Checklist

- [ ] Topics list displays correctly with categories
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] Topic detail page loads with verses
- [ ] Verse text can be loaded from Bible API
- [ ] Related plans are displayed correctly
- [ ] View tracking increments properly
- [ ] Plan start tracking works
- [ ] Admin can create new topics
- [ ] Admin can edit existing topics
- [ ] Admin can delete topics
- [ ] Admin can add/edit/delete verses
- [ ] Metrics display correctly
- [ ] Mobile responsive design works
- [ ] Navigation link is visible
- [ ] Global topics visible to all users
- [ ] Organization topics properly scoped

## Support & Maintenance

### Common Issues

**Topics not loading:**
- Check that the migration has been run
- Verify database connection
- Check browser console for API errors

**Verses not displaying:**
- Ensure Bible API credentials are configured
- Check verse reference format
- Verify network connectivity

**Permission errors:**
- Verify user role in database
- Check authentication token
- Ensure organizationId is set correctly

### Database Maintenance

```sql
-- Find most popular topics
SELECT name, popularityRank, COUNT(views.id) as view_count
FROM Topic
LEFT JOIN TopicView views ON Topic.id = views.topicId
GROUP BY Topic.id
ORDER BY view_count DESC;

-- Find topics with no verses
SELECT name FROM Topic
WHERE id NOT IN (SELECT DISTINCT topicId FROM TopicVerse);

-- Calculate conversion rates
SELECT
  Topic.name,
  COUNT(DISTINCT TopicView.id) as total_views,
  COUNT(DISTINCT CASE WHEN TopicView.startedPlan THEN TopicView.id END) as plan_starts,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN TopicView.startedPlan THEN TopicView.id END) /
    NULLIF(COUNT(DISTINCT TopicView.id), 0), 2) as conversion_rate
FROM Topic
LEFT JOIN TopicView ON Topic.id = TopicView.topicId
GROUP BY Topic.id
ORDER BY conversion_rate DESC;
```

## Contributing

When adding new topics:
1. Use clear, teen-friendly language
2. Include 4-6 relevant verses
3. Add explanatory notes for each verse
4. Choose appropriate category and tags
5. Set popularity rank based on relevance to teens
6. Test verse references before publishing

---

**Version**: 1.0.0
**Last Updated**: 2025-11-18
**Maintainer**: Development Team
