# Offline Mode Feature Guide

## Overview

The Teen Sunday School app now supports full offline functionality, allowing users to read the Bible, take notes, create highlights, and continue their study even without an internet connection. All changes made offline are automatically synced when connectivity is restored.

## 🌟 Key Features

### 1. **Offline Bible Reading**
- Download entire Bible translations for offline access
- Support for multiple translations (NIV, KJV, ESV, NLT)
- Offline-first architecture: checks cache before making network requests
- Automatic caching of viewed verses for future offline use

### 2. **Notes & Highlights**
- Create personal notes on Bible verses
- Highlight verses with 6 different colors
- All notes and highlights work offline
- Automatic sync when back online

### 3. **Download Management**
- Easy-to-use interface for downloading Bible translations
- Real-time progress tracking during downloads
- Ability to cancel downloads
- Storage usage monitoring
- Delete translations to free up space

### 4. **Automatic Sync**
- Changes made offline are queued for syncing
- Automatic sync when internet connection is restored
- Manual sync option available in Settings
- Visual indicators for sync status

### 5. **PWA Support**
- Install the app on your device for native-like experience
- Works offline after installation
- Fast loading with service worker caching

## 📱 User Interface

### Navigation Updates
- **Read** (📖): New Bible reading page with notes and highlights
- **Settings** (⚙️): Download translations and manage offline content
- **Offline Indicator**: Shows connection status and pending sync items

### New Pages

#### 1. Bible Reading Page (`/bible-read`)
**Features:**
- Verse search with popular verse shortcuts
- Highlight verses with color picker
- Add, edit, and delete notes
- View all notes and highlights for current verse
- Offline cache indicator

**How to Use:**
1. Enter a Bible reference (e.g., "John 3:16") or click a popular verse
2. Click "🎨 Highlight" to add a color highlight
3. Click "📝 Add Note" to create a personal note
4. All changes save automatically and work offline

#### 2. Settings Page (`/settings`)
**Three Tabs:**

##### Downloads Tab
- View available Bible translations
- See download size estimates
- Download button (requires internet)
- Progress bar during downloads
- Cancel download option
- Delete downloaded translations

##### Storage Tab
- Visual storage usage bar
- Total storage used vs. available
- Bible data storage breakdown
- List of downloaded translations with details

##### Sync Tab
- Last sync timestamp
- Current sync status
- Manual "Sync Now" button
- Sync information and help

## 🔧 Technical Implementation

### Architecture

#### IndexedDB Database
The app uses IndexedDB for offline data storage with the following stores:

- **translations**: Downloaded Bible translation metadata
- **books**: Bible books information
- **chapters**: Chapter metadata
- **verses**: Cached verse text and passages
- **notes**: User notes on verses
- **highlights**: Verse highlights with colors
- **syncQueue**: Queue of offline actions to sync
- **downloadProgress**: Download progress tracking

#### Offline-First Strategy
1. **Check Cache First**: All data requests check IndexedDB before network
2. **Cache New Data**: API responses are automatically cached
3. **Queue Changes**: Offline changes are queued for sync
4. **Auto-Sync**: Sync queue processes when connection restored

#### Service Worker
- Caches app shell (HTML, CSS, JS) for offline loading
- Implements cache-first strategy for app resources
- Network-first strategy for Bible API requests with cache fallback
- Background sync support (when available)

### File Structure

```
src/
├── contexts/
│   └── OfflineContext.js          # Offline state management
├── services/
│   ├── offlineDB.js                # IndexedDB wrapper
│   ├── offlineStorage.js           # Download & caching service
│   ├── notesService.js             # Notes & highlights service
│   └── bibleAPI.js (enhanced)      # Offline-first API wrapper
├── pages/
│   ├── BibleReadPage.js            # Bible reading with notes/highlights
│   └── SettingsPage.js             # Download & settings management
├── components/
│   └── OfflineIndicator.js         # Connection status indicator
└── serviceWorkerRegistration.js    # Service worker setup

public/
├── manifest.json                    # PWA manifest
└── service-worker.js                # Service worker implementation
```

## 📊 Analytics & Metrics

The offline system tracks the following metrics:

- **Offline Mode Usage**
  - Number of users enabling offline mode
  - Translations downloaded
  - Storage usage patterns

- **Sync Performance**
  - Sync success rate
  - Number of conflicts (currently: last-write-wins)
  - Average sync time
  - Queue size

- **User Engagement**
  - Verses viewed offline
  - Notes created offline
  - Highlights created offline

Access analytics in the OfflineContext using `getAnalytics()` method.

## 🔐 Permissions & Constraints

### Storage Limits
- Browser storage is limited (typically 50MB - 10GB depending on device)
- Each Bible translation is approximately 4-5MB
- Storage warnings shown when approaching limits
- Users can delete translations to free space

### Translation Licenses
- Respect copyright and license terms for each translation
- Downloaded content is for personal use only
- Commercial redistribution not permitted

### Network Requirements
- **For Downloads**: Internet connection required
- **For Reading**: Works completely offline after download
- **For Syncing**: Brief internet connection needed

## 🚀 Getting Started (For Users)

### Step 1: Download a Bible Translation
1. Go to **Settings** (⚙️) in the navigation
2. Click the **Downloads** tab
3. Choose a translation and click **📥 Download**
4. Wait for download to complete (progress shown)

### Step 2: Read Offline
1. Go to **Read** (📖) in the navigation
2. Search for any verse
3. Verse loads from offline cache
4. Add notes and highlights as desired

### Step 3: Sync When Online
- Sync happens automatically when you reconnect
- Or manually sync in **Settings** > **Sync** tab

## 🛠️ Development Guide

### Adding New Features

#### To Add a New Offline-Capable Feature:

1. **Add Database Store** (if needed)
```javascript
// In offlineDB.js
// Add to object store creation in init()
```

2. **Create Service Methods**
```javascript
// In your service file
import offlineDB from './offlineDB';

async saveItem(item, addToSyncQueue) {
  await offlineDB.put('storeName', item);

  if (addToSyncQueue) {
    await addToSyncQueue({
      actionType: 'create_item',
      data: item
    });
  }
}
```

3. **Use in Components**
```javascript
import { useOffline } from '../contexts/OfflineContext';

const MyComponent = () => {
  const { addToSyncQueue, isOnline } = useOffline();

  // Use addToSyncQueue when saving offline changes
};
```

### Testing Offline Functionality

#### Manual Testing:
1. Open Chrome DevTools
2. Go to Network tab
3. Set throttling to "Offline"
4. Test app functionality

#### Automated Testing:
```javascript
// Test offline detection
expect(navigator.onLine).toBe(false);

// Test IndexedDB operations
const verse = await offlineDB.getVerse('test-id');

// Test sync queue
await addToSyncQueue({ actionType: 'test', data: {} });
```

## 🐛 Troubleshooting

### Common Issues

#### "Download Failed"
- **Cause**: Network connection lost during download
- **Solution**: Check internet connection and try again

#### "Storage Full"
- **Cause**: Browser storage quota exceeded
- **Solution**: Delete unused translations in Settings

#### "Sync Failed"
- **Cause**: Network error during sync
- **Solution**: Sync will retry automatically when connection improves

#### Service Worker Not Updating
- **Cause**: Cached service worker
- **Solution**: Hard refresh (Ctrl+Shift+R) or clear cache

## 📈 Future Enhancements

Potential improvements for offline mode:

1. **Selective Chapter Downloads**: Download specific books/chapters instead of entire translations
2. **Offline Search**: Full-text search within downloaded content
3. **Reading Plans**: Offline-capable reading plan tracking
4. **Export Notes**: Export notes to PDF/text files
5. **Audio Bible**: Download audio versions for offline listening
6. **Conflict Resolution**: More sophisticated merge strategies
7. **Compression**: Reduce download sizes with compression
8. **Differential Sync**: Only sync changed data

## 🤝 Contributing

When contributing to offline features:

1. **Test Offline**: Always test in offline mode
2. **Handle Errors**: Gracefully handle sync failures
3. **Add Analytics**: Track new offline-capable features
4. **Update Docs**: Document new offline capabilities
5. **Consider Storage**: Be mindful of storage impact

## 📝 License & Attribution

### Third-Party Services
- **Bible API**: api.scripture.api.bible (requires API key)
- **IndexedDB**: Browser native storage API
- **Service Workers**: PWA standard

### Bible Translations
Each Bible translation has its own copyright and licensing terms. Users must respect these terms when using downloaded content.

## 📞 Support

For issues or questions about offline mode:
1. Check this guide first
2. Review the troubleshooting section
3. Open an issue on GitHub with:
   - Browser and version
   - Steps to reproduce
   - Console errors (if any)
   - Screenshots (if applicable)

---

**Built with ❤️ for teens studying God's Word**

Last Updated: 2025-11-18
