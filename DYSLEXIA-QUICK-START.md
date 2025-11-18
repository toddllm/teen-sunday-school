# Dyslexia-Friendly Font Mode - Quick Start Guide

## What You Need to Know

### Architecture at a Glance
```
React 18 App
├── Global State (Context API)
│   ├── ThemeContext (Dark/Light) ← COPY THIS PATTERN
│   ├── TranslationContext (Bible versions)
│   ├── AuthContext (User login)
│   └── [NEW] AccessibilityContext (Font settings)
├── CSS Variables (Dynamic theming)
│   └── Applied via data-* attributes on <html>
└── localStorage (Persistence)
    └── JSON serialized preferences
```

---

## The 6-Step Implementation

### 1. Create Context (`/src/contexts/AccessibilityContext.js`)
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [dyslexiaFriendlyEnabled, setDyslexiaFriendlyEnabled] = useState(() => {
    const saved = localStorage.getItem('dyslexia-friendly-enabled');
    return saved === 'true';
  });

  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('accessibility-font-size');
    return saved ? parseFloat(saved) : 1;
  });

  const [lineSpacing, setLineSpacing] = useState(() => {
    const saved = localStorage.getItem('accessibility-line-spacing');
    return saved ? parseFloat(saved) : 1;
  });

  useEffect(() => {
    const accessibilityMode = dyslexiaFriendlyEnabled ? 'dyslexia-friendly' : 'default';
    document.documentElement.setAttribute('data-accessibility', accessibilityMode);
    document.documentElement.style.setProperty('--font-size-multiplier', fontSize);
    document.documentElement.style.setProperty('--line-spacing-multiplier', lineSpacing);
    
    localStorage.setItem('dyslexia-friendly-enabled', dyslexiaFriendlyEnabled);
    localStorage.setItem('accessibility-font-size', fontSize);
    localStorage.setItem('accessibility-line-spacing', lineSpacing);
  }, [dyslexiaFriendlyEnabled, fontSize, lineSpacing]);

  const value = {
    dyslexiaFriendlyEnabled,
    setDyslexiaFriendlyEnabled,
    fontSize,
    setFontSize,
    lineSpacing,
    setLineSpacing,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityContext;
```

---

### 2. Update CSS (`/src/index.css`)
Add after the `[data-theme="dark"]` block:

```css
[data-accessibility="dyslexia-friendly"] {
  /* Import dyslexia-friendly font */
  --font-family: 'OpenDyslexic', 'Lexend', 'Comic Sans', sans-serif;
  --line-height-base: calc(1.6 * var(--line-spacing-multiplier, 1));
  --letter-spacing-base: 0.12em;
  --font-size-base: calc(1rem * var(--font-size-multiplier, 1));
}

[data-accessibility="dyslexia-friendly"] body {
  font-family: var(--font-family);
  line-height: var(--line-height-base);
  letter-spacing: var(--letter-spacing-base);
  font-size: var(--font-size-base);
}

/* Add web font import at top of file */
@import url('https://fonts.googleapis.com/css2?family=OpenDyslexic:wght@400;700&display=swap');
```

---

### 3. Add Provider (`/src/index.js`)
Replace the provider chain:

```javascript
// OLD
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <TranslationProvider>
        {/* ... other providers */}

// NEW
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AccessibilityProvider>
        <TranslationProvider>
          {/* ... other providers */}
        </TranslationProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  </React.StrictMode>
);
```

---

### 4. Add Route (`/src/App.js`)
Add in `<Routes>`:

```javascript
<Route 
  path="/settings/accessibility" 
  element={<AccessibilitySettingsPage />} 
/>
```

---

### 5. Create Settings Page (`/src/pages/AccessibilitySettingsPage.js`)
Basic structure:

```javascript
import React, { useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useNavigate } from 'react-router-dom';
import './AccessibilitySettingsPage.css';

const AccessibilitySettingsPage = () => {
  const navigate = useNavigate();
  const {
    dyslexiaFriendlyEnabled,
    setDyslexiaFriendlyEnabled,
    fontSize,
    setFontSize,
    lineSpacing,
    setLineSpacing
  } = useAccessibility();

  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="accessibility-settings-page">
      <header className="settings-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Accessibility Settings</h1>
      </header>

      {showSaved && <div className="save-notification">Settings saved!</div>}

      <div className="settings-container">
        <section className="settings-section">
          <h2>Dyslexia-Friendly Mode</h2>
          
          <div className="setting-item checkbox-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={dyslexiaFriendlyEnabled}
                onChange={(e) => setDyslexiaFriendlyEnabled(e.target.checked)}
              />
              <div>
                <strong>Enable Dyslexia-Friendly Font</strong>
                <span className="label-description">
                  Uses OpenDyslexic font with increased spacing
                </span>
              </div>
            </label>
          </div>

          {dyslexiaFriendlyEnabled && (
            <>
              <div className="setting-item">
                <label htmlFor="font-size">
                  <strong>Font Size: {(fontSize * 100).toFixed(0)}%</strong>
                </label>
                <input
                  id="font-size"
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.1"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseFloat(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="setting-item">
                <label htmlFor="line-spacing">
                  <strong>Line Spacing: {(lineSpacing * 100).toFixed(0)}%</strong>
                </label>
                <input
                  id="line-spacing"
                  type="range"
                  min="1"
                  max="2"
                  step="0.1"
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
            </>
          )}
        </section>

        <button onClick={handleSave} className="btn btn-primary">
          Save Settings
        </button>
      </div>

      <div className="preview-section" data-accessibility={dyslexiaFriendlyEnabled ? 'dyslexia-friendly' : 'default'}>
        <h3>Preview</h3>
        <p>This is how your text will look with the current settings.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
    </div>
  );
};

export default AccessibilitySettingsPage;
```

---

### 6. Add Navigation Link (`/src/components/Navigation.js`)
Add in nav menu:

```javascript
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

## File Summary

| File | Type | Purpose |
|------|------|---------|
| AccessibilityContext.js | NEW | Global state management |
| AccessibilitySettingsPage.js | NEW | Settings UI |
| index.css | MODIFY | Add dyslexia CSS rules |
| index.js | MODIFY | Add provider |
| App.js | MODIFY | Add route |
| Navigation.js | MODIFY | Add link |
| AccessibilitySettingsPage.css | NEW | Settings styles |

---

## Testing Locally

1. Start dev server:
   ```bash
   npm start  # Frontend on localhost:3013
   cd server && npm run dev  # Backend on localhost:3001
   ```

2. Navigate to `/settings/accessibility`

3. Toggle dyslexia-friendly mode

4. Refresh page - should persist via localStorage

5. Switch between dark/light themes - should work together

---

## What Gets Applied

When dyslexia-friendly is enabled:
- Font changes to OpenDyslexic (or fallback)
- Line spacing increases (1.6 base to 1.8-2.0 with slider)
- Letter spacing increases (0.12em)
- Font size becomes adjustable
- Works across ALL pages

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Font not loading | Add Google Fonts import to index.css |
| Styles not applying | Check `data-accessibility` attribute in DevTools |
| localStorage not working | Check browser localStorage limits |
| Conflicts with dark mode | Use CSS specificity - `[data-accessibility] [data-theme]` |

---

## Key Files to Reference

- `/src/contexts/ThemeContext.js` - How dark mode works (53 lines)
- `/src/pages/TranslationSettingsPage.js` - Settings page pattern (207 lines)
- `/src/index.css` - CSS variables system (104 lines)

These files show you the exact patterns to follow.

---

## Estimated Time: 2-3 hours

- Context: 30 min
- CSS: 20 min  
- Settings page: 45 min
- Navigation: 15 min
- Testing: 30 min

---

## Git Workflow

1. Already on branch: `claude/dyslexia-friendly-font-01JXinF12w6BQkVMUzW3bQoq`
2. Implement changes
3. Test locally
4. Commit with clear message
5. Push to remote
6. Create PR from feature branch

