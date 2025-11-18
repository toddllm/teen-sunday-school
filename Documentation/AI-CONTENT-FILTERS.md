# AI Content Filters - Safe-Mode Implementation Guide

## Overview

The AI Content Filters feature provides a comprehensive safe-mode system for filtering sensitive topics in AI-powered features. This ensures that AI-generated content is appropriate for teens and aligns with church values.

## Features

- **10 Pre-configured Categories**: Relationships/Sexuality, Mental Health, Controversial Doctrine, Violence/Abuse, Substance Use, Politics, Family Issues, Death/Grief, Doubts/Faith, and Peer Pressure
- **4 Filter Actions**: Redirect to leader, Provide high-level guidance, Block completely, or Monitor
- **Custom Keywords**: Add organization-specific keywords to filter
- **Metrics & Analytics**: Track filtered queries and leader follow-ups
- **Admin Dashboard**: Easy-to-use UI for configuring filters

## Architecture

### Database Models

**AIFilterConfig** (`server/prisma/schema.prisma:316-337`)
- Stores filter configuration per organization
- Contains filter rules mapping categories to actions
- Custom keywords and redirect messages
- Can be global (organizationId: null) or org-specific

**AIFilterMetric** (`server/prisma/schema.prisma:360-390`)
- Logs every filtered query
- Tracks category, action taken, and context
- Enables leader follow-up tracking
- Provides analytics data

### Backend Services

**Content Filter Service** (`server/src/services/content-filter.service.ts`)
- Core filtering logic
- Keyword detection algorithm
- Response generation based on filter action
- Statistics aggregation

**AI Filter Controller** (`server/src/controllers/ai-filter.controller.ts`)
- CRUD operations for filter configuration
- Metrics endpoints with filtering and aggregation
- Summary statistics

### API Endpoints

All endpoints require authentication and ORG_ADMIN role.

#### Configuration Endpoints

```
GET    /api/admin/ai-filters              # Get filter config
PATCH  /api/admin/ai-filters              # Update filter config
GET    /api/admin/ai-filters/categories   # Get available categories/actions
```

#### Metrics Endpoints

```
GET    /api/admin/ai-filters/metrics          # Get filtered queries (paginated)
GET    /api/admin/ai-filters/metrics/summary  # Get summary statistics
PATCH  /api/admin/ai-filters/metrics/:id      # Update metric (leader response)
```

### Frontend Components

**AIFiltersAdminPage** (`src/pages/AIFiltersAdminPage.js`)
- Two-tab interface: Settings and Metrics
- Filter rules configuration with visual indicators
- Custom keywords management
- Metrics dashboard with charts and tables

## Integration Guide

### For AI Feature Developers

When implementing a new AI feature that processes user queries, integrate the content filter as follows:

#### 1. Import the Service

```typescript
import { analyzeQuery } from '../services/content-filter.service';
```

#### 2. Analyze User Query Before Processing

```typescript
// Example: AI-powered lesson generation
export async function generateLessonContent(
  userPrompt: string,
  userId: string,
  organizationId: string
) {
  // Step 1: Analyze the query
  const filterResult = await analyzeQuery(userPrompt, {
    organizationId,
    userId,
    featureName: 'lesson-generation',
  });

  // Step 2: Handle filtered content
  if (!filterResult.allowed) {
    return {
      success: false,
      filtered: true,
      action: filterResult.action,
      message: filterResult.message,
      metricId: filterResult.metricId,
    };
  }

  // Step 3: If allowed, proceed with AI generation
  const aiResponse = await callAIService(userPrompt);

  return {
    success: true,
    filtered: false,
    content: aiResponse,
  };
}
```

#### 3. Frontend Handling

```javascript
// In your React component
const handleGenerateContent = async () => {
  const response = await fetch('/api/ai/generate-lesson', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt: userInput }),
  });

  const result = await response.json();

  if (result.filtered) {
    // Show the filter message to the user
    setFilterMessage(result.message);
    setShowFilterModal(true);
  } else {
    // Display the generated content
    setGeneratedContent(result.content);
  }
};
```

### Filter Result Object

```typescript
interface FilterResult {
  allowed: boolean;          // false if query should be blocked
  action: FilterAction | null; // REDIRECT, GUIDANCE, BLOCK, or MONITOR
  category: FilterCategory | null; // Detected category
  message: string | null;    // Message to show user (if filtered)
  metricId?: string;         // ID for tracking this filtered query
}
```

### Filter Actions Explained

| Action | Behavior | Use Case |
|--------|----------|----------|
| **REDIRECT** | Shows message encouraging user to ask a leader | Sensitive topics requiring personal guidance |
| **GUIDANCE** | AI provides high-level, age-appropriate response | Topics where general guidance is acceptable |
| **BLOCK** | Query blocked with generic message | Topics completely off-limits |
| **MONITOR** | Query allowed but logged for review | Topics to track but not block |

## Admin Configuration

### Setting Up Filters

1. Navigate to **Admin Dashboard** → **AI Content Filters**
2. Enable/disable filters using the status toggle
3. Configure each category's action:
   - Select appropriate action for each sensitive topic
   - Actions are color-coded for easy identification
4. Customize redirect message if desired
5. Add custom keywords for your organization
6. Click **Save Configuration**

### Monitoring Usage

1. Switch to the **Metrics & Reports** tab
2. View summary statistics:
   - Total filtered queries
   - Pending leader follow-ups
   - Resolved queries
3. Analyze trends:
   - Queries by category
   - Queries by action taken
4. Review individual filtered queries in the table

### Leader Follow-up Workflow

1. Review filtered queries in the metrics tab
2. Identify queries needing personal attention
3. Contact the user to provide guidance
4. Mark the query as resolved using the API:

```javascript
await fetch(`/api/admin/ai-filters/metrics/${metricId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    leaderNotified: true,
    leaderResponse: 'Spoke with student about...',
    resolvedAt: new Date().toISOString(),
  }),
});
```

## Default Configuration

The system includes sensible defaults:

```javascript
{
  RELATIONSHIPS_SEXUALITY: 'REDIRECT',
  MENTAL_HEALTH: 'GUIDANCE',
  CONTROVERSIAL_DOCTRINE: 'GUIDANCE',
  VIOLENCE_ABUSE: 'REDIRECT',
  SUBSTANCE_USE: 'REDIRECT',
  POLITICS: 'GUIDANCE',
  FAMILY_ISSUES: 'GUIDANCE',
  DEATH_GRIEF: 'GUIDANCE',
  DOUBTS_FAITH: 'MONITOR',
  PEER_PRESSURE: 'GUIDANCE',
}
```

Default redirect message:
> "This is a great question! For topics like this, we think it's best to talk with a youth leader who can give you personalized guidance. Please reach out to your group leader or pastor."

## Keyword Detection Algorithm

The service uses a multi-layered approach:

1. **Custom Keywords First**: Check org-specific keywords
2. **Built-in Categories**: Match against category-specific keyword lists
3. **Word Boundary Detection**: Uses regex with word boundaries to avoid false positives
4. **Case Insensitive**: All matching is case-insensitive

Example keywords for Mental Health category:
- depression, anxiety, suicide, self-harm, cutting
- eating disorder, panic attack, trauma
- hopeless, worthless, "kill myself"

## Performance Considerations

- **Fail-Open Design**: If the service errors, queries are allowed to prevent blocking legitimate use
- **Async Processing**: All database operations are asynchronous
- **Indexed Queries**: Metrics table has indexes on common query patterns
- **Lightweight**: Keyword matching is fast and doesn't require external API calls

## Security & Privacy

- **Admin-Only Access**: Only ORG_ADMIN and SUPER_ADMIN can configure filters
- **Logged Queries**: Filtered queries are logged but stored securely
- **Organization Isolation**: Each org's filters and metrics are isolated
- **No AI Training**: Filtered queries are never used for AI training

## Future AI Features Integration

When building new AI features, always integrate content filtering:

### Planned Features:
1. **AI Lesson Generator**: Filter lesson topics and discussion questions
2. **AI Discussion Questions**: Ensure questions are age-appropriate
3. **AI Study Guide Generator**: Filter content suggestions
4. **AI Prayer Assistant**: Monitor sensitive prayer requests
5. **AI Bible Q&A**: Filter theological questions

### Integration Checklist:
- [ ] Import `analyzeQuery` service
- [ ] Call `analyzeQuery` before AI processing
- [ ] Handle filtered responses in UI
- [ ] Provide context (userId, organizationId, featureName)
- [ ] Test with sample sensitive queries
- [ ] Document in feature README

## Testing

### Sample Test Queries

**Should be filtered (Relationships/Sexuality):**
- "Is it okay to have sex before marriage?"
- "I'm struggling with same-sex attraction"

**Should be filtered (Mental Health):**
- "I've been thinking about suicide"
- "I think I have depression"

**Should be allowed:**
- "What does the Bible say about love?"
- "How can I be a better Christian?"

### Running Tests

```bash
# Unit tests for filter service
npm test services/content-filter.service.test.ts

# Integration tests for API endpoints
npm test controllers/ai-filter.controller.test.ts
```

## Troubleshooting

### Filters not working?
1. Check if filters are enabled in admin dashboard
2. Verify organization has filter config (or global default exists)
3. Check service logs for errors

### False positives?
1. Review keyword lists in `content-filter.service.ts`
2. Adjust word boundary detection if needed
3. Consider changing action from BLOCK to GUIDANCE

### Missing categories?
1. Add to `FilterCategory` enum in Prisma schema
2. Update `CATEGORY_KEYWORDS` in filter service
3. Run `npx prisma generate` and `npx prisma migrate dev`

## Database Migration

To set up the AI filter tables:

```bash
cd server
npx prisma migrate dev --name add-ai-filters
npx prisma generate
```

## Support

For questions or issues:
- Review this documentation
- Check server logs: `server/logs/`
- Review metrics in admin dashboard
- Contact development team

---

**Last Updated**: 2025-11-18
**Version**: 1.0.0
