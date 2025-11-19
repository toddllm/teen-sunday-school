/**
 * Service Worker for Teen Sunday School
 * Handles offline caching and PWA functionality
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `teen-sunday-school-${CACHE_VERSION}`;

// Cache configuration loaded from API
let cacheConfig = {
  strategy: 'CACHE_FIRST',
  cacheLessons: true,
  cacheReadingPlans: true,
  cacheScriptures: true,
  cacheImages: false,
  cacheAudio: false,
  maxCacheSize: 50 * 1024 * 1024, // 50 MB in bytes
};

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
];

// API endpoints that should be cached
const CACHEABLE_API_PATTERNS = [
  /\/api\/lessons/,
  /\/api\/reading-plans/,
  /\/api\/scriptures/,
];

// ============================================================================
// INSTALL EVENT
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS.filter(asset => asset !== '/')).catch((error) => {
        console.error('[Service Worker] Failed to cache static assets:', error);
        // Continue even if some assets fail
        return Promise.resolve();
      });
    })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// ============================================================================
// ACTIVATE EVENT
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Claim all clients immediately
  return self.clients.claim();
});

// ============================================================================
// FETCH EVENT
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine if this request should be cached
  const shouldCache = shouldCacheRequest(request);

  if (!shouldCache) {
    return;
  }

  // Apply caching strategy
  event.respondWith(
    applyCachingStrategy(request, cacheConfig.strategy)
  );
});

// ============================================================================
// MESSAGE EVENT (for config updates)
// ============================================================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_CACHE_CONFIG') {
    console.log('[Service Worker] Updating cache config:', event.data.config);
    cacheConfig = { ...cacheConfig, ...event.data.config };
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[Service Worker] Clearing cache');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        return caches.open(CACHE_NAME);
      })
    );
  }

  if (event.data && event.data.type === 'PRE_CACHE_CONTENT') {
    console.log('[Service Worker] Pre-caching content:', event.data.urls);
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determine if a request should be cached
 */
function shouldCacheRequest(request) {
  const url = new URL(request.url);

  // Always cache static assets
  if (url.pathname.startsWith('/static/')) {
    return true;
  }

  // Check if API endpoint matches cacheable patterns
  if (url.pathname.startsWith('/api/')) {
    // Check lessons
    if (cacheConfig.cacheLessons && url.pathname.includes('/lessons')) {
      return true;
    }

    // Check reading plans
    if (cacheConfig.cacheReadingPlans && url.pathname.includes('/plans')) {
      return true;
    }

    // Check scriptures
    if (cacheConfig.cacheScriptures && url.pathname.includes('/scriptures')) {
      return true;
    }

    return false;
  }

  // Check images
  if (cacheConfig.cacheImages && isImageRequest(request)) {
    return true;
  }

  // Check audio
  if (cacheConfig.cacheAudio && isAudioRequest(request)) {
    return true;
  }

  return false;
}

/**
 * Check if request is for an image
 */
function isImageRequest(request) {
  const url = new URL(request.url);
  const extension = url.pathname.split('.').pop().toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension);
}

/**
 * Check if request is for audio
 */
function isAudioRequest(request) {
  const url = new URL(request.url);
  const extension = url.pathname.split('.').pop().toLowerCase();
  return ['mp3', 'wav', 'ogg', 'm4a'].includes(extension);
}

/**
 * Apply the configured caching strategy
 */
async function applyCachingStrategy(request, strategy) {
  switch (strategy) {
    case 'CACHE_FIRST':
      return cacheFirst(request);
    case 'NETWORK_FIRST':
      return networkFirst(request);
    case 'CACHE_ONLY':
      return cacheOnly(request);
    case 'NETWORK_ONLY':
      return networkOnly(request);
    default:
      return cacheFirst(request);
  }
}

/**
 * Cache First Strategy
 * Try cache first, fallback to network
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[Service Worker] Cache hit:', request.url);
    return cached;
  }

  try {
    console.log('[Service Worker] Cache miss, fetching:', request.url);
    const response = await fetch(request);

    // Only cache successful responses
    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);

    // Return offline page if available
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    // Return generic offline response
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    });
  }
}

/**
 * Network First Strategy
 * Try network first, fallback to cache
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    console.log('[Service Worker] Fetching from network:', request.url);
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    // Return offline page if available
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    });
  }
}

/**
 * Cache Only Strategy
 * Only use cached content
 */
async function cacheOnly(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  return new Response('Content not cached', {
    status: 404,
    statusText: 'Not Found',
    headers: new Headers({
      'Content-Type': 'text/plain',
    }),
  });
}

/**
 * Network Only Strategy
 * Always fetch from network, no caching
 */
async function networkOnly(request) {
  return fetch(request);
}
