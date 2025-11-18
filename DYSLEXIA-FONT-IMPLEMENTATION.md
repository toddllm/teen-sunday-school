# Dyslexia-Friendly Font Mode - Implementation Guide

## Quick Summary

The Teen Sunday School app is a **React 18 + Express/Prisma** platform for creating interactive Bible lessons. It already has a **working theme system** (dark/light mode) that can serve as a template for implementing dyslexia-friendly font support.

---

## Current Architecture Relevant to This Feature

### State Management Pattern (USE THIS AS TEMPLATE)
The app uses **React Context API** for global state:
- **ThemeContext** - Dark/light mode (localStorage persistence)
- **TranslationContext** - Bible translation preferences
- **AuthContext** - User authentication

All follow the same pattern:
1. Create Context
2. Use localStorage for persistence
3. Apply state via CSS variables or DOM attributes
4. Provide hooks for consumption (`useTheme()`, `useTranslation()`)

### Preference Storage
- **Frontend**: localStorage (currently, no server persistence for UI prefs)
- **Backend**: User model has `externalData` JSON field for future use
- **Settings Page**: TranslationSettingsPage.js is the UI pattern to follow

---

## Files to Create/Modify

### NEW FILES (2 main files needed)

**1. /src/contexts/AccessibilityContext.js**
```javascript
// Create new context following ThemeContext.js pattern
// Manage: dyslexiaFriendlyMode, fontSize, lineSpacing, letterSpacing
// Persist to localStorage: 'accessibility-settings'
// Apply to <html> via data-accessibility attribute
```

**2. /src/pages/AccessibilitySettingsPage.js**
```javascript
// Create new settings page following TranslationSettingsPage.js pattern
// Include toggles, sliders, preview
// Route: /settings/accessibility
```

### MODIFIED FILES (4 files to update)

**1. /src/index.css**
- Add new CSS variables for dyslexia fonts
- Add `[data-accessibility="dyslexia-friendly"]` selector

**2. /src/index.js**
- Add `<AccessibilityProvider>` to provider chain

**3. /src/App.js**
- Add route: `<Route path="/settings/accessibility" element={<AccessibilitySettingsPage />} />`

**4. /src/components/Navigation.js**
- Add link to accessibility settings OR quick toggle button

---

## Implementation Steps

### Step 1: Create AccessibilityContext.js
Location: `/src/contexts/AccessibilityContext.js`

Should include:
- `dyslexiaFriendlyEnabled` (boolean)
- `fontSize` (multiplier, default 1)
- `lineSpacing` (multiplier, default 1)
- `letterSpacing` (em value, default 0)
- `highContrastMode` (boolean)
- localStorage persistence
- Hook: `useAccessibility()`

### Step 2: Add CSS Variables
Location: `/src/index.css`

Add under new selector:
```css
[data-accessibility="dyslexia-friendly"] {
  /* Font stacks */
  --dyslexia-font-family: 'OpenDyslexic', 'Lexend', 'Comic Sans', sans-serif;
  --dyslexia-line-height: 1.8;
  --dyslexia-letter-spacing: 0.12em;
  
  /* Apply to body */
  body {
    font-family: var(--dyslexia-font-family);
    line-height: var(--dyslexia-line-height);
    letter-spacing: var(--dyslexia-letter-spacing);
  }
}
```

### Step 3: Create Settings Page
Location: `/src/pages/AccessibilitySettingsPage.js`

Template from: `/src/pages/TranslationSettingsPage.js`

Include:
- Dyslexia-friendly font toggle
- Font size slider (0.8x to 1.5x)
- Line spacing slider (1.4 to 2.0)
- Letter spacing slider (0 to 0.2em)
- High contrast toggle
- Preview section
- Save/Reset buttons

### Step 4: Update App Configuration
Location: `/src/index.js`

```javascript
import { AccessibilityProvider } from './contexts/AccessibilityContext';

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AccessibilityProvider>  {/* ADD THIS */}
        <TranslationProvider>
          {/* ... rest of providers ... */}
```

### Step 5: Add Routes
Location: `/src/App.js`

```javascript
<Route 
  path="/settings/accessibility" 
  element={<AccessibilitySettingsPage />} 
/>
```

### Step 6: Update Navigation
Location: `/src/components/Navigation.js`

Add link in nav menu:
```jsx
<li className="nav-item">
  <Link
    to="/settings/accessibility"
    className={`nav-link ${isActive('/settings/accessibility') ? 'active' : ''}`}
    onClick={closeMenu}
  >
    Accessibility
  </Link>
</li>
```

---

## Reference Files

### Most Important (Read These First)
1. `/src/contexts/ThemeContext.js` (53 lines) - **MAIN TEMPLATE**
   - Shows localStorage pattern
   - Shows CSS variable application
   - Shows data attribute usage

2. `/src/pages/TranslationSettingsPage.js` (207 lines) - **UI TEMPLATE**
   - Shows settings page structure
   - Shows form patterns
   - Shows save/reset logic

### Supporting Files
3. `/src/index.js` - Provider setup
4. `/src/index.css` - CSS variables system
5. `/src/App.js` - Route definitions
6. `/src/components/Navigation.js` - Navigation patterns

---

## Dyslexia-Friendly Font Recommendations

### Recommended Font Stacks
1. **OpenDyslexic** - Purpose-built for dyslexia (free, open-source)
2. **Lexend** - Evidence-based design for dyslexia
3. **Comic Sans MS** - Scientific evidence supports readability for dyslexic readers
4. **Verdana** - High contrast sans-serif

### Font Implementation
```css
/* Import web font (example with OpenDyslexic) */
@import url('https://fonts.googleapis.com/css2?family=OpenDyslexic:wght@400;700&display=swap');

/* Apply selectively */
[data-accessibility="dyslexia-friendly"] body {
  font-family: 'OpenDyslexic', 'Lexend', sans-serif;
  line-height: 1.8;      /* Increased from 1.6 */
  letter-spacing: 0.12em; /* Increased spacing */
  word-spacing: 0.16em;   /* Additional word spacing */
}
```

### Additional Accessibility Features
- Increased line spacing (1.8 or more)
- Increased letter spacing (0.1-0.15em)
- Larger default font size (16-18px)
- High contrast colors
- Left alignment (not justified)
- Consider background color (off-white may be better than white)

---

## Testing Checklist

- [ ] AccessibilityContext persists to localStorage
- [ ] Settings page loads and saves preferences
- [ ] Font changes apply instantly across all pages
- [ ] Works with dark/light theme toggle (no conflicts)
- [ ] Works on mobile devices
- [ ] Responsive design maintained
- [ ] Accessibility attributes maintained
- [ ] Settings survive page refresh
- [ ] Settings survive logout/login
- [ ] All game components work with dyslexia font

---

## Estimated Time

- Context creation: 30 minutes
- CSS updates: 20 minutes
- Settings page: 45 minutes
- Navigation updates: 15 minutes
- Testing & refinement: 30 minutes

**Total: ~2-3 hours**

---

## Future Enhancements (Phase 2)

1. **Server Persistence**: Store accessibility settings in backend
2. **More Font Options**: Add dropdown selector for different fonts
3. **Color Schemes**: Custom background colors for dyslexia mode
4. **Preset Profiles**: Save/load accessibility profiles
5. **System Preference**: Detect OS accessibility settings
6. **All Components**: Apply to all components including games
7. **Print Styles**: Ensure dyslexia-friendly fonts in printed output

---

## Questions to Consider

1. Should dyslexia mode apply to ALL text or selectively?
2. Should it be a quick toggle (like theme) or settings page only?
3. Should it include other accessibility features?
4. Should settings sync to user account (requires backend changes)?
5. Should there be preset profiles (e.g., "Maximum Dyslexia Support")?

---

## Current Branch
Already created: `claude/dyslexia-friendly-font-01JXinF12w6BQkVMUzW3bQoq`

