# Comparative Theme View (OT vs NT)

## Overview

The Comparative Theme View feature allows users to explore how key biblical themes develop from the Old Testament to the New Testament through side-by-side passage comparisons.

## User Stories

- **As a teen**, I want to see how the same theme appears in both OT and NT so I can understand the continuity and development of biblical concepts.
- **As a leader**, I want quick OT/NT comparisons for teaching so I can effectively demonstrate how themes evolve throughout Scripture.

## Key Features

### 1. Theme Selection
- Predefined themes including:
  - Covenant
  - Sacrifice
  - Grace
  - Justice
  - Redemption
  - Faith
  - Love
  - Obedience
  - Holiness
  - Prophecy
  - Kingdom
  - Salvation

### 2. Dual-Column Comparison View
- **Old Testament Column**: Displays relevant OT passages with notes
- **New Testament Column**: Displays relevant NT passages with notes
- **Theme Summary**: Overview of how the theme develops across testaments
- **Key Connections**: Highlights links between OT and NT passages
- **Key Insights**: Provides teaching points and applications

### 3. Integration Points
- Links from topical index
- Links from relevant Bible passages
- Direct navigation to full Bible text for any passage
- Metrics tracking for lesson building

## Technical Architecture

### Database Schema

#### ComparativeTheme Model
```prisma
model ComparativeTheme {
  id             String   @id @default(cuid())
  organizationId String
  themeName      String
  description    String?  @db.Text
  category       String?
  otPassages     Json     // Array of {ref, text?, notes?}
  ntPassages     Json     // Array of {ref, text?, notes?}
  themeNotes     Json?    // {summary, connections[], keyInsights[]}
  isPublic       Boolean  @default(false)
  createdBy      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

#### ThemeMetric Model
```prisma
model ThemeMetric {
  id             String   @id @default(cuid())
  themeId        String
  organizationId String
  viewCount      Int      @default(0)
  lastViewedAt   DateTime @default(now())
  userId         String?
  featureContext String?
  timeSpentMs    Int?
  usedInLesson   Boolean  @default(false)
  lessonId       String?
  createdAt      DateTime @default(now())
}
```

### API Endpoints

#### Public Endpoints (Authenticated Users)
- `GET /api/themes` - List all themes (public + org-specific)
  - Query params: `category`, `search`
- `GET /api/themes/:id` - Get specific theme details
- `POST /api/themes/:id/view` - Record theme view for metrics

#### Admin Endpoints
- `POST /api/themes` - Create new theme
- `PATCH /api/themes/:id` - Update theme
- `DELETE /api/themes/:id` - Delete theme
- `GET /api/themes/:id/metrics` - Get theme metrics
- `GET /api/themes/metrics/summary` - Get aggregated metrics

### Frontend Components

#### ComparativeThemeViewPage
Main page component that handles:
- Theme list/search/filter
- Theme selection
- Metrics recording
- Navigation integration

**Route**: `/bible/themes`

#### ThemeComparisonViewer
Displays the dual-column comparison view with:
- OT passages (left column)
- NT passages (right column)
- Theme summary
- Key connections
- Key insights

#### Service: comparativeThemeService.js
Handles all API calls:
- List/get themes
- Create/update/delete (admin)
- Record metrics
- Get metrics/summary (admin)

## Permissions & Access Control

### User Roles
- **All authenticated users**: Can view public and org-specific themes
- **Admin users**: Can create, edit, and delete themes; view metrics

### Public vs Organization Themes
- **Public themes**: Visible to all users across organizations
- **Organization themes**: Visible only to users within the organization

## Metrics Tracking

The system tracks:
- **View count**: Number of times a theme is viewed
- **Time spent**: Duration users spend viewing each theme
- **Feature context**: Where the theme was accessed from (topical index, direct link, etc.)
- **Lesson usage**: Whether the theme was used during lesson building
- **Unique viewers**: Number of distinct users who viewed the theme

### Metrics Dashboard (Admin)
Admins can view:
- Most viewed themes
- Average time spent per theme
- Theme usage in lessons
- Views by source (topical index, direct, etc.)
- Trends over time

## Installation & Setup

### 1. Run Database Migration
```bash
cd server
npx prisma migrate dev --name add_comparative_theme_view
```

### 2. Seed Sample Data
```bash
npx ts-node server/prisma/seeds/comparative-themes.seed.ts
```

This will create 4 sample themes:
- Covenant
- Sacrifice
- Grace
- Kingdom of God

### 3. Update Frontend Route
The route `/bible/themes` is already configured in App.js.

## Usage Guide

### For Users (Teens/Leaders)

1. **Navigate to the Comparative Theme View**
   - Click on Bible Tools → OT vs NT Themes
   - Or navigate to `/bible/themes`

2. **Browse Themes**
   - Use the category filter to narrow by theme type
   - Use the search box to find specific themes
   - Click on any theme to view the comparison

3. **View Comparison**
   - Read the theme summary at the top
   - Explore OT passages in the left column
   - Explore NT passages in the right column
   - Click any passage reference to view full context in Bible tool
   - Review key connections and insights at the bottom

### For Admins

1. **Create a New Theme**
   ```javascript
   POST /api/themes
   {
     "themeName": "Faith",
     "category": "faith",
     "description": "How faith is displayed throughout Scripture",
     "otPassages": [
       {
         "ref": "Genesis 15:6",
         "text": "Abram believed the Lord...",
         "notes": "Abraham's faith credited as righteousness"
       }
     ],
     "ntPassages": [
       {
         "ref": "Romans 4:3",
         "text": "Abraham believed God...",
         "notes": "Paul references Abraham's faith"
       }
     ],
     "themeNotes": {
       "summary": "Faith is central to relationship with God...",
       "connections": ["Both testaments emphasize faith..."],
       "keyInsights": ["Faith is trust in God's promises..."]
     },
     "isPublic": true
   }
   ```

2. **View Metrics**
   - Navigate to `/api/themes/metrics/summary` to see overall statistics
   - Use date filters to analyze specific time periods
   - Track which themes are most popular for lesson planning

## Integration Examples

### Link from Topical Index
```javascript
<a href="/bible/themes?themeId=theme_id&source=topical_index">
  View OT vs NT Comparison
</a>
```

### Link from Bible Passage
```javascript
// When viewing a passage, show related themes
const relatedThemes = await listThemes({ search: currentPassage });
// Display links to relevant theme comparisons
```

### Use in Lesson Builder
```javascript
// Record when a theme is used in lesson creation
await recordThemeView(themeId, {
  featureContext: 'lesson_builder',
  usedInLesson: true,
  lessonId: lesson.id
});
```

## Best Practices

### Content Creation
1. **Choose meaningful themes**: Focus on themes that develop significantly from OT to NT
2. **Select key passages**: Don't overwhelm with too many passages; 3-5 per testament is ideal
3. **Provide context**: Include notes explaining each passage's significance
4. **Write clear summaries**: Help users understand the big picture
5. **Highlight connections**: Make explicit links between OT and NT

### UX Considerations
1. **Mobile responsive**: The dual-column layout stacks on mobile devices
2. **Clickable references**: All passage references link to full Bible text
3. **Search functionality**: Help users find themes quickly
4. **Category organization**: Group related themes together

### Performance
1. **Pagination**: The API supports pagination for large result sets
2. **Caching**: Consider implementing client-side caching for frequently accessed themes
3. **Lazy loading**: Load theme details only when selected

## Future Enhancements

Potential additions:
- [ ] User-generated themes (with moderation)
- [ ] Theme comparison printing/export
- [ ] Visual timeline showing theme development
- [ ] Small group discussion questions for each theme
- [ ] Integration with sermon/teaching notes
- [ ] AI-assisted theme discovery
- [ ] Multi-language support
- [ ] Audio narration of comparisons

## Files Modified/Created

### Backend
- ✅ `server/prisma/schema.prisma` - Added ComparativeTheme and ThemeMetric models
- ✅ `server/src/routes/theme-comparison.routes.ts` - API routes
- ✅ `server/src/controllers/theme-comparison.controller.ts` - Request handlers
- ✅ `server/src/index.ts` - Route registration
- ✅ `server/prisma/seeds/comparative-themes.seed.ts` - Sample data

### Frontend
- ✅ `src/pages/ComparativeThemeViewPage.js` - Main page
- ✅ `src/pages/ComparativeThemeViewPage.css` - Page styles
- ✅ `src/components/ThemeComparisonViewer.js` - Comparison display
- ✅ `src/components/ThemeComparisonViewer.css` - Component styles
- ✅ `src/services/comparativeThemeService.js` - API service
- ✅ `src/App.js` - Route registration

### Documentation
- ✅ `docs/features/comparative-theme-view.md` - This file

## Support & Troubleshooting

### Common Issues

**Q: Themes not loading?**
- Check that database migration ran successfully
- Verify user is authenticated
- Check browser console for API errors

**Q: Can't create new themes?**
- Ensure user has admin role
- Verify all required fields are provided
- Check that otPassages and ntPassages are valid arrays

**Q: Metrics not recording?**
- Confirm user is authenticated when viewing
- Check that themeId is valid
- Verify network connection

## Contributing

To contribute new themes:
1. Fork the repository
2. Add themes to `server/prisma/seeds/comparative-themes.seed.ts`
3. Ensure themes follow the established format
4. Submit a pull request with description

## License

This feature is part of the Teen Sunday School project and follows the project's license.
