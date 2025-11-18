# Tagging Taxonomy Manager (Topics & Themes)

## Overview

The Tagging Taxonomy Manager feature provides a flexible and hierarchical tagging system for organizing lessons, themes, and other content through custom topics and tags. This allows administrators to create a customized taxonomy that reflects their organization's teaching structure and priorities.

## User Stories

- **As an admin**, I want to create and organize tags in a hierarchy so I can categorize content in a meaningful way.
- **As a leader**, I want to tag lessons and themes so I can quickly find related content across different quarters.
- **As a teen**, I want to browse content by topic tags so I can explore themes I'm interested in.

## Key Features

### 1. Hierarchical Tag Structure
- **Parent-Child Relationships**: Tags can have parent tags, creating a tree structure
- **Unlimited Nesting**: Support for multiple levels of hierarchy
- **Visual Tree View**: Interactive hierarchy visualization for easy navigation

### 2. Tag Customization
- **Custom Names & Descriptions**: Fully customizable tag metadata
- **Color Coding**: Assign colors to tags for visual organization
- **Icon Selection**: Choose from predefined icons for quick recognition
- **URL-Friendly Slugs**: Auto-generated or custom slugs for clean URLs

### 3. Multi-Purpose Tagging
- **Lesson Tagging**: Associate tags with lessons for organization
- **Theme Tagging**: Tag comparative themes for cross-referencing
- **Extensible**: Architecture supports tagging additional content types

### 4. Usage Metrics
- **Usage Tracking**: Monitor how often each tag is used
- **Search Analytics**: Track tag searches to understand user interests
- **Last Used Dates**: Identify stale or outdated tags
- **Association Counts**: See how many items are tagged with each tag

### 5. Public & Private Tags
- **Organization Tags**: Private tags visible only within your organization
- **Public Tags**: Shared tags visible across all organizations
- **Visibility Control**: Admins can toggle public/private status

## Technical Architecture

### Database Schema

#### Tag Model
```prisma
model Tag {
  id             String   @id @default(cuid())
  organizationId String

  // Core fields
  name           String
  slug           String   // URL-friendly identifier
  description    String?  @db.Text
  color          String?  // Hex color for UI display
  icon           String?  // Icon identifier

  // Hierarchy support
  parentTagId    String?
  parentTag      Tag?     @relation("TagHierarchy")
  childTags      Tag[]    @relation("TagHierarchy")

  // Organization & visibility
  isPublic       Boolean  @default(false)
  order          Int      @default(0)

  // Metadata
  createdBy      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization @relation(...)
  taggedLessons  TagAssociation[]
  metrics        TagMetric[]
}
```

#### TagAssociation Model
```prisma
model TagAssociation {
  id             String   @id @default(cuid())
  tagId          String

  // Polymorphic association
  lessonId       String?  // Can tag lessons
  themeId        String?  // Can tag comparative themes

  createdAt      DateTime @default(now())
  createdBy      String?

  tag            Tag      @relation(...)
}
```

#### TagMetric Model
```prisma
model TagMetric {
  id             String   @id @default(cuid())
  tagId          String
  organizationId String

  // Usage tracking
  usageCount     Int      @default(0)
  searchCount    Int      @default(0)

  // Temporal tracking
  lastUsedAt     DateTime @default(now())
  lastSearchedAt DateTime?

  // Context tracking
  featureContext String?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  tag            Tag      @relation(...)
}
```

### API Endpoints

#### Public Endpoints (Authenticated Users)
- `GET /api/taxonomy` - List all tags (public + org-specific)
  - Query params: `parentId`, `search`
- `GET /api/taxonomy/search` - Search tags by name/description
  - Query params: `q` (query), `limit`
- `GET /api/taxonomy/hierarchy` - Get full taxonomy tree structure
- `GET /api/taxonomy/:id` - Get specific tag details
- `GET /api/taxonomy/lesson/:lessonId` - Get all tags for a lesson
- `GET /api/taxonomy/theme/:themeId` - Get all tags for a theme

#### Admin Endpoints
- `POST /api/taxonomy` - Create new tag
- `PATCH /api/taxonomy/:id` - Update tag
- `DELETE /api/taxonomy/:id` - Delete tag
- `POST /api/taxonomy/:id/lesson/:lessonId` - Add tag to lesson
- `DELETE /api/taxonomy/:id/lesson/:lessonId` - Remove tag from lesson
- `POST /api/taxonomy/:id/theme/:themeId` - Add tag to theme
- `DELETE /api/taxonomy/:id/theme/:themeId` - Remove tag from theme
- `GET /api/taxonomy/:id/metrics` - Get tag metrics
- `GET /api/taxonomy/admin/metrics/summary` - Get aggregated metrics

### Frontend Components

#### TaxonomyAdminPage
Main admin interface with three tabs:

**1. All Tags Tab**
- Grid view of all tags
- Search and filter functionality
- Create/edit/delete operations
- Visual color and icon indicators

**2. Hierarchy View Tab**
- Tree visualization of tag relationships
- Drag-to-reorder functionality
- Inline editing and deletion
- Nested display with indentation

**3. Usage Metrics Tab**
- Summary statistics (total tags, associations, usage)
- Detailed metrics table
- Usage trends and insights

**Route**: `/admin/taxonomy`

#### Service: taxonomyService.js
Handles all API calls:
- List/search/get tags
- CRUD operations (admin)
- Tag associations management
- Metrics retrieval

## Permissions & Access Control

### User Roles
- **All authenticated users**: Can view public and org-specific tags
- **Admin users**: Can create, edit, and delete tags; manage associations; view metrics

### Public vs Organization Tags
- **Public tags**: Visible to all users across organizations (use for universal topics)
- **Organization tags**: Visible only to users within the organization (use for custom topics)

## Tag Organization Best Practices

### Hierarchy Design
```
Biblical Themes (root)
├── Old Testament Themes
│   ├── Covenant
│   ├── Law & Prophecy
│   └── Kingdom of Israel
├── New Testament Themes
│   ├── Grace & Salvation
│   ├── Church & Community
│   └── Kingdom of God
└── Life Application
    ├── Relationships
    ├── Faith & Doubt
    └── Service & Leadership
```

### Recommended Tag Categories
1. **Topical Tags**: prayer, worship, faith, service, community
2. **Scripture Tags**: genesis, psalms, gospels, epistles, revelation
3. **Season Tags**: advent, lent, easter, pentecost
4. **Age Group Tags**: middle-school, high-school, young-adult
5. **Format Tags**: discussion, activity, game, video-based

## Metrics Tracking

The system automatically tracks:
- **Usage count**: Number of times a tag is associated with content
- **Search count**: How often users search for the tag
- **Last used date**: When the tag was last applied
- **Association counts**: Number of lessons and themes tagged
- **Child tag counts**: Number of sub-tags in hierarchy

### Metrics Dashboard (Admin)
Admins can view:
- Most used tags
- Least used tags (candidates for removal)
- Total associations across all content
- Usage trends over time
- Tag hierarchy statistics

## Installation & Setup

### 1. Run Database Migration
```bash
cd server
npx prisma migrate dev --name add_tagging_taxonomy
```

This creates the Tag, TagAssociation, and TagMetric tables.

### 2. Update Organization Relation
The migration automatically adds the `tags` relation to the Organization model.

### 3. Access the Admin Interface
Navigate to `/admin/taxonomy` to start creating tags.

## Usage Guide

### For Admins

#### Creating a New Tag

1. **Navigate to Taxonomy Admin**
   - Go to `/admin/taxonomy`
   - Click "Create Tag" button

2. **Fill Out Tag Form**
   ```javascript
   {
     "name": "Prayer",                    // Required
     "slug": "prayer",                     // Optional (auto-generated)
     "description": "Topics related to prayer and communication with God",
     "color": "#4A90E2",                   // Choose from palette
     "icon": "dove",                       // Choose from icon list
     "parentTagId": null,                  // Optional parent tag
     "isPublic": false,                    // Visibility setting
     "order": 0                            // Sort order within parent
   }
   ```

3. **Save and Use**
   - Tag will appear in hierarchy
   - Available for tagging lessons and themes

#### Tagging a Lesson

**Option 1: Via API**
```javascript
import { addTagToLesson } from '../services/taxonomyService';

await addTagToLesson(tagId, lessonId);
```

**Option 2: Via Lesson Editor**
- When editing a lesson, select tags from dropdown
- Tags are saved automatically with lesson

#### Viewing Metrics

1. Navigate to the "Usage Metrics" tab
2. Review summary statistics
3. Sort table by usage count to identify popular tags
4. Identify unused tags for cleanup

### For Users

#### Browsing by Tags

1. **View Tagged Content**
   - Navigate to lessons or themes
   - Filter by selected tags
   - View all content with specific tag

2. **Explore Hierarchy**
   - Browse tag tree in hierarchy view
   - Drill down into sub-categories
   - Find related topics

## Integration Examples

### Tagging During Lesson Creation
```javascript
// In LessonCreatorPage.js
import { listTags, addTagToLesson } from '../services/taxonomyService';

// Load available tags
const tags = await listTags();

// When lesson is saved, add selected tags
selectedTagIds.forEach(async (tagId) => {
  await addTagToLesson(tagId, lesson.id);
});
```

### Filtering Lessons by Tag
```javascript
// Get lessons tagged with specific tag
const tagId = 'tag_prayer';
const associations = await fetch(`/api/taxonomy/lesson/${lessonId}`);
const tags = associations.map(a => a.tag);

// Display tagged lessons
const lessons = await fetchLessons({ tagIds: [tagId] });
```

### Tag-Based Navigation
```javascript
// Show tag chips on lesson cards
<div className="lesson-tags">
  {lesson.tags.map(tag => (
    <span
      key={tag.id}
      className="tag-chip"
      style={{ backgroundColor: tag.color }}
      onClick={() => filterByTag(tag.id)}
    >
      {tag.icon} {tag.name}
    </span>
  ))}
</div>
```

## Advanced Features

### Bulk Tagging
```javascript
// Tag multiple lessons at once
const lessonIds = ['lesson1', 'lesson2', 'lesson3'];
const tagId = 'tag_advent';

await Promise.all(
  lessonIds.map(lessonId => addTagToLesson(tagId, lessonId))
);
```

### Tag Analytics
```javascript
// Get most popular tags
const metrics = await getTagMetricsSummary();
const topTags = metrics.summary
  .sort((a, b) => b.usageCount - a.usageCount)
  .slice(0, 10);

// Display top tags dashboard
```

### Smart Tag Suggestions
```javascript
// Suggest tags based on lesson content (future enhancement)
const lessonText = lesson.title + ' ' + lesson.content;
const suggestions = await suggestTags(lessonText);
```

## Best Practices

### Tag Naming
1. **Be Specific**: Use clear, descriptive names (e.g., "Prayer" not "P")
2. **Use Title Case**: Capitalize appropriately (e.g., "Old Testament Themes")
3. **Avoid Redundancy**: Don't repeat parent tag name in child (e.g., "Themes > Prayer" not "Themes > Prayer Themes")
4. **Keep it Short**: Aim for 1-3 words per tag

### Hierarchy Design
1. **Limit Depth**: 2-3 levels is usually sufficient
2. **Balanced Trees**: Avoid having one branch much deeper than others
3. **Logical Grouping**: Group related tags under common parents
4. **Avoid Orphans**: Every tag should have a clear purpose

### Tag Maintenance
1. **Regular Audits**: Review unused tags quarterly
2. **Merge Duplicates**: Combine similar tags to reduce clutter
3. **Update Descriptions**: Keep descriptions current and helpful
4. **Archive vs Delete**: Consider archiving instead of deleting historical tags

### Color Usage
1. **Consistent Scheme**: Use similar colors for related tags
2. **Accessibility**: Ensure sufficient contrast with text
3. **Semantic Meaning**: Use red for urgent/important, green for positive, etc.

## Performance Considerations

### Caching
```javascript
// Cache tag hierarchy for faster loading
const hierarchy = await getTaxonomyHierarchy();
localStorage.setItem('tagHierarchy', JSON.stringify(hierarchy));
```

### Pagination
```javascript
// For organizations with many tags, paginate results
const tags = await listTags({ limit: 50, offset: 0 });
```

### Lazy Loading
```javascript
// Load tag details only when needed
const tag = await getTag(tagId); // Only when user clicks
```

## Future Enhancements

Potential additions:
- [ ] Drag-and-drop tag reordering in hierarchy view
- [ ] Tag synonyms/aliases for improved search
- [ ] Tag suggestions based on AI content analysis
- [ ] Tag merging tool for consolidating duplicates
- [ ] Tag templates for quick taxonomy setup
- [ ] Tag usage heatmap visualization
- [ ] Export/import taxonomy for sharing across orgs
- [ ] Tag-based content recommendations
- [ ] Automated tag cleanup suggestions
- [ ] Tag permissions (role-based tag visibility)

## Files Modified/Created

### Backend
- ✅ `server/prisma/schema.prisma` - Added Tag, TagAssociation, and TagMetric models
- ✅ `server/src/routes/tagging-taxonomy.routes.ts` - API routes
- ✅ `server/src/controllers/tagging-taxonomy.controller.ts` - Request handlers
- ✅ `server/src/index.ts` - Route registration

### Frontend
- ✅ `src/pages/TaxonomyAdminPage.js` - Admin interface
- ✅ `src/pages/TaxonomyAdminPage.css` - Page styles
- ✅ `src/services/taxonomyService.js` - API service
- ✅ `src/App.js` - Route registration

### Documentation
- ✅ `docs/features/tagging-taxonomy-manager.md` - This file

## Support & Troubleshooting

### Common Issues

**Q: Can't create tags?**
- Ensure you have admin role
- Check that tag name is provided
- Verify slug doesn't conflict with existing tag

**Q: Tag hierarchy not displaying?**
- Refresh the page to reload hierarchy
- Check browser console for errors
- Verify parent tag exists

**Q: Can't delete a tag?**
- Tags with child tags must have children deleted first
- Check if tag is in use (associations exist)
- Verify you have admin permissions

**Q: Tags not appearing on lessons?**
- Ensure tag association was created successfully
- Check that lesson exists and belongs to your org
- Verify tag is visible to your organization

**Q: Metrics not updating?**
- Metrics update asynchronously
- Check that API calls are succeeding
- Refresh the metrics tab

## Migration Guide

### From Manual Categories to Tags

If you're migrating from a manual category system:

1. **Map existing categories to tags**
   ```javascript
   const categoryToTag = {
     'covenant': { name: 'Covenant', parent: 'Old Testament Themes' },
     'grace': { name: 'Grace', parent: 'New Testament Themes' },
     // ... more mappings
   };
   ```

2. **Create tag hierarchy**
   ```javascript
   // Create parent tags first
   const otThemes = await createTag({ name: 'Old Testament Themes' });
   const ntThemes = await createTag({ name: 'New Testament Themes' });

   // Create child tags
   await createTag({
     name: 'Covenant',
     parentTagId: otThemes.id
   });
   ```

3. **Migrate associations**
   ```javascript
   // For each lesson with old category
   const lessons = await fetchLessonsWithCategory('covenant');
   const covenantTag = await findTagBySlug('covenant');

   lessons.forEach(async (lesson) => {
     await addTagToLesson(covenantTag.id, lesson.id);
   });
   ```

## Contributing

To contribute to the taxonomy system:
1. Propose new tag categories via GitHub Issues
2. Submit PRs with tag hierarchy improvements
3. Share best practices for tag organization
4. Report bugs or UX issues

## License

This feature is part of the Teen Sunday School project and follows the project's license.
