# Key Files Summary for Custom Organization Branding Implementation

## Critical File Paths

### Core Application Files (Absolute Paths)
- `/home/user/teen-sunday-school/src/App.js` - Main router (14 routes defined)
- `/home/user/teen-sunday-school/src/index.js` - React entry, context providers
- `/home/user/teen-sunday-school/src/index.css` - CSS theme variables (light/dark)
- `/home/user/teen-sunday-school/package.json` - Dependencies (React 18, Router v6)

### Contexts to Reference (State Management)
1. `/home/user/teen-sunday-school/src/contexts/LessonContext.js` - Lessons CRUD (4.5 KB)
2. `/home/user/teen-sunday-school/src/contexts/ThemeContext.js` - Light/dark toggle (1.2 KB)
3. `/home/user/teen-sunday-school/src/contexts/StreakContext.js` - Activity tracking (9.4 KB)
4. `/home/user/teen-sunday-school/src/contexts/TranslationContext.js` - Bible versions (3.6 KB)
5. `/home/user/teen-sunday-school/src/contexts/ContextCardContext.js` - Verse annotations (11 KB)

### Components (UI)
- `/home/user/teen-sunday-school/src/components/Navigation.js` - Main nav bar (hard-coded "Teen Sunday School")
- `/home/user/teen-sunday-school/src/components/Navigation.css` - Nav styling
- `/home/user/teen-sunday-school/src/components/games/` - 4 game components

### Pages (Routes)
- `/home/user/teen-sunday-school/src/pages/HomePage.js` - Landing page (hard-coded title/subtitle)
- `/home/user/teen-sunday-school/src/pages/AdminPage.js` - Lesson management dashboard
- `/home/user/teen-sunday-school/src/pages/LessonCreatorPage.js` - Create/edit lessons
- `/home/user/teen-sunday-school/src/pages/GamesAdminPage.js` - Configure games

### Services (External APIs)
- `/home/user/teen-sunday-school/src/services/bibleAPI.js` - Bible API wrapper (15 KB)
- `/home/user/teen-sunday-school/src/services/imageGeneratorService.js` - Canvas image gen (11.4 KB)

## Files That Need Modification for Organization Branding

### Priority 1: Branding Customization
1. **Navigation.js** - Remove hard-coded logo and text
   - Current: `<span className="logo-text">Teen Sunday School</span>`
   - Needs: Dynamic from OrganizationContext
   
2. **HomePage.js** - Parameterize hero content
   - Current: Hard-coded title and subtitle
   - Needs: Pull from OrganizationContext
   
3. **index.css** - CSS variables are already set up
   - Current: :root and [data-theme="dark"] selectors
   - Already supports dynamic color override via CSS variables
   - Can be extended with organization-specific colors

### Priority 2: State Management
4. **index.js** - Add OrganizationContext to provider stack
   - Current: ThemeProvider > TranslationProvider > StreakProvider > LessonProvider > ContextCardProvider
   - Needs: Add OrganizationProvider as outermost wrapper

### Priority 3: Data Model
5. **LessonContext.js** - Add organization filtering
   - Current: All lessons stored at `sunday-school-lessons`
   - Needed: Filter/namespace by organization

### Priority 4: Admin Interface  
6. **AdminPage.js** - Add organization branding settings
   - Current: Only lesson management
   - Needed: Admin section for org customization (colors, logo, name)

## Files to Create

### New Context (State Management)
- `/home/user/teen-sunday-school/src/contexts/OrganizationContext.js`
  - Manage: current organization, org settings, org list
  - Functions: setCurrentOrg(), updateOrgBranding(), getOrgSettings()
  - Persist: `org-{id}-settings` and `current-organization` to localStorage

### New Pages
- `/home/user/teen-sunday-school/src/pages/OrganizationSettingsPage.js`
  - Form to customize: name, logo, colors (primary, secondary, accent)
  - Logo upload or URL input
  - Color picker for branding
  - Preview panel showing how branding applies

### New Components
- `/home/user/teen-sunday-school/src/components/OrgBrandingPreview.js`
  - Shows live preview of organization branding
  - Displays: brand colors, logo, name as they appear in app

### New Services
- `/home/user/teen-sunday-school/src/services/organizationService.js`
  - Functions: createOrganization(), updateOrganization(), getOrganization()
  - Handle localStorage persistence with org namespacing

## Storage Naming Convention

### Current Storage Keys
```
sunday-school-lessons           - All lessons
streakData                      - Activities and badges  
sunday-school-context-cards     - Verse annotations
primary-translation             - Bible version ID
secondary-translation           - Bible version ID
parallel-mode-enabled           - Boolean
quoteImageGenerator             - Generated images
theme                          - light/dark
```

### Proposed Multi-Org Keys
```
organizations                           - List of org IDs
current-organization                    - Active org ID
org-{orgId}-settings                   - Name, logo, colors
org-{orgId}-lessons                    - Org-specific lessons
org-{orgId}-streaks                    - Org-specific streaks
org-{orgId}-context-cards              - Org-specific annotations
org-{orgId}-translations               - Org-specific translation prefs
org-{orgId}-generated-images           - Org-specific saved images
```

## Data Model Extensions Needed

### Organization Settings Schema
```javascript
{
  id: string,                    // org-{timestamp}
  name: string,                  // "Youth Group Name"
  description: string,
  logo: string,                  // URL or base64
  colors: {
    primary: string,             // #4A90E2
    secondary: string,           // #50C878
    accent: string               // #FF6B6B
  },
  features: {
    lessonsEnabled: boolean,
    gamesEnabled: boolean,
    bibleToolEnabled: boolean,
    streaksEnabled: boolean,
    badgesEnabled: boolean
  },
  createdAt: ISO8601,
  updatedAt: ISO8601,
  createdBy: string              // User ID (if multi-user added)
}
```

### Updated Lesson Schema
```javascript
{
  id: string,
  organizationId: string,        // NEW - tie lesson to org
  title: string,
  // ... rest of schema
}
```

## Implementation Strategy

### Phase 1: Add OrganizationContext
1. Create OrganizationContext.js
2. Add OrganizationProvider to index.js wrapper
3. Implement localStorage storage and retrieval

### Phase 2: Modify Components for Dynamic Branding
1. Update Navigation.js to use org name/logo
2. Update HomePage.js to use org branding
3. Create OrgBrandingPreview component
4. Update index.css to support dynamic color injection

### Phase 3: Admin Interface
1. Create OrganizationSettingsPage
2. Add route to App.js
3. Add admin menu link to Navigation.js
4. Implement color picker, logo upload UI

### Phase 4: Data Isolation
1. Update LessonContext to namespace by org
2. Update other contexts for org-scoped data
3. Add organization selector/switcher

## CSS Variable Override Approach

Current variables are already in place. To support org-specific colors:

Option A: Dynamically set CSS variables via JavaScript
```javascript
// In OrganizationContext or wherever colors are updated
document.documentElement.style.setProperty('--primary-color', orgSettings.colors.primary);
document.documentElement.style.setProperty('--secondary-color', orgSettings.colors.secondary);
document.documentElement.style.setProperty('--accent-color', orgSettings.colors.accent);
```

Option B: Create organization-specific CSS class/theme
```css
.org-theme-custom {
  --primary-color: var(--org-primary);
  --secondary-color: var(--org-secondary);
  --accent-color: var(--org-accent);
}
```

## Testing Considerations

1. **LocalStorage Namespacing**: Ensure org-specific data doesn't leak between organizations
2. **Theme Persistence**: Verify org branding persists across page reloads
3. **Multi-org Switching**: Test switching between organizations clears/loads correct data
4. **Fallback Behavior**: Default branding when no org is selected
5. **Logo Display**: Test logo rendering for both URLs and base64 data

## Dependencies Assessment

Current stack handles organization branding well:
- React Context: Perfect for org state management
- localStorage: Can easily namespace by org
- CSS Variables: Already designed for theming
- React Router: Can add org routes if needed

No additional npm packages needed for basic org branding.

