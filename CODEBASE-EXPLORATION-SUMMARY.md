# Codebase Exploration Summary - Dyslexia-Friendly Font Implementation

## Executive Summary

The Teen Sunday School app is a **React 18 + Express/Prisma** platform with a well-established **theme system** (dark/light mode) that can serve as a template for implementing dyslexia-friendly font support. The codebase follows modern React patterns with Context API for state management and localStorage for persistence.

**Status:** Ready for dyslexia-friendly font feature implementation
**Branch:** `claude/dyslexia-friendly-font-01JXinF12w6BQkVMUzW3bQoq`
**Estimated Implementation Time:** 2-3 hours

---

## Documentation Created

### 1. **DYSLEXIA-FONT-IMPLEMENTATION.md** (This Repository)
Comprehensive guide covering:
- Current architecture relevant to the feature
- Detailed file modifications and creations
- 6-step implementation strategy with code examples
- Phase 1-4 implementation breakdown
- Dyslexia-friendly font recommendations
- Testing checklist
- Future enhancement ideas

### 2. **DYSLEXIA-QUICK-START.md** (This Repository)
Quick start guide with:
- Complete working code examples
- Minimal explanation (for experienced developers)
- Step-by-step file changes
- Common issues and solutions
- Time estimates

### 3. **This File: CODEBASE-EXPLORATION-SUMMARY.md**
Index and reference for all discovered files and patterns

---

## Project Architecture Overview

### Frontend Stack
- **Framework:** React 18.2.0
- **Routing:** React Router v6
- **State Management:** React Context API
- **Styling:** Plain CSS with CSS Variables
- **HTTP Client:** Axios
- **Persistence:** localStorage
- **Port:** 3013 (development)

### Backend Stack
- **Framework:** Express.js (TypeScript)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT tokens
- **Logging:** Winston logger
- **Security:** Helmet, Rate limiting
- **Port:** 3001 (development)

---

## Key Files for Implementation

### Context Pattern (MOST IMPORTANT - COPY THIS)
**File:** `/src/contexts/ThemeContext.js` (53 lines)
- Located at: `/home/user/teen-sunday-school/src/contexts/ThemeContext.js`
- Demonstrates:
  - Context creation pattern
  - localStorage persistence
  - CSS variable application via data attributes
  - System preference detection
  - Hook pattern (`useTheme()`)
- Status: READY TO COPY AS TEMPLATE

### Settings Page Pattern
**File:** `/src/pages/TranslationSettingsPage.js` (207 lines)
- Located at: `/home/user/teen-sunday-school/src/pages/TranslationSettingsPage.js`
- Demonstrates:
  - Settings page layout
  - Form controls (selects, checkboxes)
  - Save/Reset functionality
  - Temp state management for unsaved changes
  - Success notifications
  - Help/documentation section
- Status: READY TO COPY AS TEMPLATE

### CSS System
**File:** `/src/index.css` (104 lines)
- Located at: `/home/user/teen-sunday-school/src/index.css`
- Demonstrates:
  - CSS variables definition
  - Dark/light mode system
  - Global styles
- Status: READY TO EXTEND

### App Configuration
**Files:**
- `/src/App.js` - Route definitions, provider composition
- `/src/index.js` - Provider wrapper setup
- Navigation component: `/src/components/Navigation.js`

---

## Existing Theme Implementation Details

### How Dark Mode Works (Your Template)
1. **Context Creation** - `ThemeContext.js`
   ```
   State: theme ('light' or 'dark')
   Hook: useTheme()
   Provider: <ThemeProvider>
   ```

2. **Data Attribute** - Applied to document root
   ```javascript
   document.documentElement.setAttribute('data-theme', theme)
   ```

3. **CSS Selector** - Styles by data attribute
   ```css
   [data-theme="dark"] {
     --bg-color: #1a1d23;
     --text-color: #E8EAED;
   }
   ```

4. **localStorage** - Persists preference
   ```javascript
   localStorage.getItem('theme')
   localStorage.setItem('theme', newTheme)
   ```

5. **Navigation Button** - User control
   - Located in `/src/components/Navigation.js` (lines 114-122)
   - Simple emoji toggle (🌙/☀️)
   - aria-label for accessibility

### CSS Variables in Use
```css
--primary-color: #4A90E2
--secondary-color: #50C878
--accent-color: #FF6B6B
--dark-color: #2C3E50
--light-gray: #ECF0F1
--bg-color: #f5f7fa
--text-color: #2C3E50
--text-secondary: #5a6c7d
--card-bg: #ffffff
--border-color: #e1e8ed
--hover-bg: #f0f3f7
--input-bg: #ffffff
--input-border: #d1d9e0
--shadow-color: rgba(0, 0, 0, 0.1)
```

---

## User Preference Storage Mechanisms

### Frontend (localStorage)
**Current Storage Keys:**
- `theme` - Dark/light mode
- `primary-translation` - Bible translation ID
- `secondary-translation` - Bible translation ID
- `parallel-mode-enabled` - Boolean toggle
- `accessToken` - JWT token
- `refreshToken` - JWT refresh token

**Pattern Used:**
```javascript
// Read
const saved = localStorage.getItem('key');

// Write
localStorage.setItem('key', value);
```

### Backend User Model
**Table:** User (in Prisma schema)
- Has `externalData` (JSON field) for flexible metadata
- No dedicated UserPreferences table yet
- User authentication via JWT
- Available for future enhancement

**Location:** `/home/user/teen-sunday-school/server/prisma/schema.prisma` (lines 35-60)

---

## Existing Accessibility Features

### Current Implementations
1. **ARIA Labels** on interactive elements:
   - Theme toggle: `aria-label="Toggle theme"`
   - Close buttons: `aria-label="Close"`
   - Collapse/expand: `aria-label="Collapse"`

2. **Dark Mode** - Reduces eye strain

3. **Responsive Design** - Mobile-first approach

4. **Semantic HTML** - Proper heading hierarchy and structure

5. **Planned Features** (mentioned in code):
   - Text-to-speech for slides
   - Text-to-speech for Bible verses
   - Audio Bible support

---

## File Structure for New Implementation

### Files to Create (2)
```
/src/contexts/AccessibilityContext.js ← NEW (Copy ThemeContext pattern)
/src/pages/AccessibilitySettingsPage.js ← NEW (Copy TranslationSettingsPage pattern)
```

### Files to Modify (4)
```
/src/index.css ← Add dyslexia CSS rules
/src/index.js ← Add AccessibilityProvider
/src/App.js ← Add accessibility settings route
/src/components/Navigation.js ← Add accessibility link
```

### Supporting Files to Create (1)
```
/src/pages/AccessibilitySettingsPage.css ← Styles for settings page
```

---

## Frontend Component Tree

```
<App>
  <Navigation>
    [Links including /settings/accessibility]
    [Theme toggle button]
  </Navigation>
  
  <main className="main-content">
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/settings/translations" element={<TranslationSettingsPage />} />
      <Route path="/settings/accessibility" element={<AccessibilitySettingsPage />} /> ← NEW
      [... other routes ...]
    </Routes>
  </main>
</App>
```

---

## Provider Chain (Root Level)

**Current Order (in /src/index.js):**
```javascript
<ThemeProvider>
  <TranslationProvider>
    <StreakProvider>
      <LessonProvider>
        <PlanProvider>
          <ContextCardProvider>
            <App />
          </ContextCardProvider>
        </PlanProvider>
      </LessonProvider>
    </StreakProvider>
  </TranslationProvider>
</ThemeProvider>
```

**After Implementation:**
```javascript
<ThemeProvider>
  <AccessibilityProvider> ← INSERT HERE
    <TranslationProvider>
      [... rest same ...]
```

---

## Font Configuration Currently Used

### System Fonts (index.css)
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Image Generator Font Presets
**File:** `/src/services/imageGeneratorService.js`
- Uses templates with font presets
- Examples: Georgia (serif), Arial (sans-serif)
- Includes size, color, lineHeight, textAlign

---

## Recommended Dyslexia-Friendly Fonts

### Web Fonts (Free, Google Fonts)
1. **OpenDyslexic** - Purpose-built for dyslexia
   ```css
   @import url('https://fonts.googleapis.com/css2?family=OpenDyslexic:wght@400;700&display=swap');
   ```

2. **Lexend** - Evidence-based, high contrast
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap');
   ```

### System Fonts
- Comic Sans MS (has research backing)
- Verdana (high contrast)
- Arial (clean sans-serif)

### Recommended Spacing
- Line height: 1.8 - 2.0 (vs normal 1.6)
- Letter spacing: 0.1 - 0.15em
- Word spacing: 0.16 - 0.2em

---

## Testing Checklist for Implementation

### Functionality
- [ ] localStorage correctly saves and loads preferences
- [ ] Settings page loads and responds to inputs
- [ ] Font changes apply instantly across ALL pages
- [ ] Page refresh maintains saved settings
- [ ] Logout and login maintains saved settings

### Compatibility
- [ ] Works with dark mode (no CSS conflicts)
- [ ] Works on mobile devices
- [ ] Works in all major browsers
- [ ] Responsive design maintained
- [ ] All games render correctly with new font

### Accessibility
- [ ] New buttons have aria-labels
- [ ] Settings page is keyboard navigable
- [ ] Preview section updates in real-time
- [ ] High contrast maintained

### Performance
- [ ] No layout shifts or flicker
- [ ] Font loads without blocking render
- [ ] localStorage operations don't cause delays

---

## Development Commands

### Frontend
```bash
npm start              # Start dev server (port 3013)
npm run build          # Build for production
npm test               # Run tests
npm run eject          # Eject from create-react-app (NOT RECOMMENDED)
```

### Backend
```bash
cd server
npm run dev            # Start dev server (port 3001)
npm run build          # Build TypeScript
npm run db:generate    # Regenerate Prisma client
npm run db:migrate     # Run database migrations
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed database
npm run lint           # Run ESLint
npm run format         # Format with Prettier
```

---

## Git Information

### Current Branch
```
claude/dyslexia-friendly-font-01JXinF12w6BQkVMUzW3bQoq
```

### Recent Commits (Showing Pattern)
```
6f86ad6 Add Comparative Theme View (OT vs NT) feature (#25) (#74)
2d7c834 Add AI Content Filters feature for safe-mode AI responses (#53)
0c6c776 Add Church Systems Integration feature (#35) (#51)
5a05e08 Add Reading Plan Builder feature for admins (#31)
c81debb Add Quote/Image Share Generator feature (#24)
```

### Commit Message Pattern
Features follow format: `Add [Feature] feature [description] (#PR_NUMBER)`

---

## Known Patterns & Best Practices

### 1. Context Pattern (FOLLOW THIS)
```javascript
// 1. Create context
const MyContext = createContext();

// 2. Create hook
export const useMyFeature = () => {
  const context = useContext(MyContext);
  if (!context) throw new Error('Must use within Provider');
  return context;
};

// 3. Create provider
export const MyProvider = ({ children }) => {
  // useState, useEffect, etc.
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};
```

### 2. localStorage Pattern
```javascript
// On load
const saved = localStorage.getItem('key');
const initial = saved ? JSON.parse(saved) : defaultValue;

// On change
useEffect(() => {
  localStorage.setItem('key', JSON.stringify(value));
}, [value]);
```

### 3. CSS Variables Pattern
```css
:root {
  --variable-name: value;
}

/* Apply based on state */
[data-state="value"] {
  --variable-name: new-value;
}

/* Use in components */
element {
  property: var(--variable-name);
}
```

### 4. Settings Page Pattern
- Header with back button
- Multiple setting sections
- Form controls (checkbox, range, select)
- Temporary state for unsaved changes
- Save/Reset buttons
- Help/documentation section
- Success notification

---

## Deployment Information

### Frontend
- **Hosted on:** AWS S3 + CloudFront CDN
- **S3 Bucket:** teen-sunday-school-prod
- **CloudFront Distribution:** E3NZIE249ZRXZX
- **Live URL:** https://ds3lhez1cid5z.cloudfront.net
- **CI/CD:** GitHub Actions

### Backend
- **Current Status:** Not yet deployed in docs (but configured in schema)
- **Database:** PostgreSQL
- **Deployment Ready:** Yes (Prisma configured)

---

## Related Documentation in Repo

### Existing Documentation Files
- `PROJECT-OVERVIEW.md` - Complete project overview
- `CODEBASE-ANALYSIS.md` - Deep technical analysis
- `IMPLEMENTATION-SUMMARY.md` - Recent implementation summaries
- `AWS-SETUP-COMPLETE.md` - AWS deployment guide
- `INTEGRATION-README.md` - Church system integrations
- `QUICK-REFERENCE.md` - Quick feature reference

### Implementation Guides (NEW)
- `DYSLEXIA-FONT-IMPLEMENTATION.md` - Comprehensive guide
- `DYSLEXIA-QUICK-START.md` - Quick start with code
- `CODEBASE-EXPLORATION-SUMMARY.md` - This file

---

## Key Takeaways

1. **Copy ThemeContext pattern** - It's well-designed and proven
2. **Copy TranslationSettingsPage UI** - Settings pages follow this pattern
3. **Use CSS variables** - All styling uses them, maintain consistency
4. **Use localStorage** - All preferences persist this way
5. **Follow provider chain** - Add accessibility early in the chain
6. **Test with dark mode** - Ensure no CSS conflicts
7. **No backend changes needed for MVP** - localStorage is sufficient
8. **Add ARIA labels** - Continue accessibility best practices

---

## Next Steps

1. Review `/src/contexts/ThemeContext.js` (your main template)
2. Review `/src/pages/TranslationSettingsPage.js` (your UI template)
3. Follow the 6-step implementation in DYSLEXIA-QUICK-START.md
4. Test locally with `npm start`
5. Create commit with clear message
6. Open PR when ready

---

## Support Files Location

All files referenced are absolute paths from `/home/user/teen-sunday-school/`:

```
/src
├── contexts/
│   ├── ThemeContext.js ← TEMPLATE
│   ├── TranslationContext.js
│   ├── AuthContext.jsx
│   ├── LessonContext.js
│   ├── PlanContext.js
│   ├── StreakContext.js
│   └── ContextCardContext.js
├── pages/
│   ├── TranslationSettingsPage.js ← TEMPLATE
│   ├── HomePage.js
│   └── [other pages...]
├── components/
│   ├── Navigation.js ← MODIFY
│   └── [other components...]
├── services/
│   ├── imageGeneratorService.js
│   └── [other services...]
├── App.js ← MODIFY
├── App.css
├── index.js ← MODIFY
├── index.css ← MODIFY
└── [other files...]
```

---

## Questions Answered in This Exploration

1. **Frontend/Backend Tech Stack** ✓ - React 18 + Express/Prisma
2. **Existing Accessibility Features** ✓ - ARIA labels, dark mode, responsive design
3. **Font Configuration** ✓ - System fonts, CSS variables, image generator templates
4. **UI Settings Management** ✓ - TranslationSettingsPage is the model
5. **User Preference Storage** ✓ - localStorage frontend, externalData backend
6. **Where to Add Feature** ✓ - 6 specific files identified and documented
7. **Implementation Pattern** ✓ - ThemeContext is the template
8. **Testing Requirements** ✓ - Comprehensive checklist provided

---

**Created:** November 18, 2025
**Branch:** claude/dyslexia-friendly-font-01JXinF12w6BQkVMUzW3bQoq
**Status:** Ready for implementation

