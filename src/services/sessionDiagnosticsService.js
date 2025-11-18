/**
 * Session Diagnostics Service
 * Collects diagnostic information about the user's session for bug reports
 */

class SessionDiagnosticsService {
  constructor() {
    this.errors = [];
    this.setupErrorTracking();
  }

  /**
   * Setup global error tracking
   */
  setupErrorTracking() {
    // Track console errors
    const originalError = console.error;
    console.error = (...args) => {
      this.logError({
        type: 'console.error',
        message: args.map(arg => String(arg)).join(' '),
        timestamp: new Date().toISOString()
      });
      originalError.apply(console, args);
    };

    // Track window errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'window.error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString()
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandledrejection',
        message: event.reason?.message || String(event.reason),
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Log an error
   */
  logError(error) {
    this.errors.push(error);
    // Keep only last 20 errors
    if (this.errors.length > 20) {
      this.errors.shift();
    }
  }

  /**
   * Get browser information
   */
  getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio
    };
  }

  /**
   * Get localStorage data (sanitized for privacy)
   */
  getLocalStorageInfo() {
    const data = {};

    try {
      // Get relevant app data
      const keys = ['lessons', 'streaks', 'theme', 'translations', 'badges'];

      for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            // Parse and include size info
            const parsed = JSON.parse(value);
            data[key] = {
              size: value.length,
              type: typeof parsed,
              itemCount: Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length
            };
          } catch {
            data[key] = {
              size: value.length,
              type: 'string'
            };
          }
        }
      }

      data.totalKeys = localStorage.length;
      data.estimatedSize = Object.keys(localStorage).reduce((sum, key) => {
        return sum + (localStorage.getItem(key)?.length || 0);
      }, 0);

    } catch (error) {
      data.error = 'Unable to access localStorage';
    }

    return data;
  }

  /**
   * Get performance metrics
   */
  getPerformanceInfo() {
    const perf = window.performance;

    if (!perf) {
      return { available: false };
    }

    const timing = perf.timing;
    const navigation = perf.navigation;

    return {
      available: true,
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
      responseTime: timing.responseEnd - timing.requestStart,
      navigationType: navigation.type,
      redirectCount: navigation.redirectCount,
      resourceCount: perf.getEntriesByType('resource').length,
      memoryUsage: perf.memory ? {
        usedJSHeapSize: perf.memory.usedJSHeapSize,
        totalJSHeapSize: perf.memory.totalJSHeapSize,
        jsHeapSizeLimit: perf.memory.jsHeapSizeLimit
      } : null
    };
  }

  /**
   * Get React and app version info
   */
  getAppInfo() {
    return {
      reactVersion: require('react').version,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      pathname: window.location.pathname,
      referrer: document.referrer || 'none'
    };
  }

  /**
   * Collect all diagnostics
   */
  collectDiagnostics() {
    return {
      timestamp: new Date().toISOString(),
      browser: this.getBrowserInfo(),
      app: this.getAppInfo(),
      storage: this.getLocalStorageInfo(),
      performance: this.getPerformanceInfo(),
      errors: this.errors.slice(-10), // Last 10 errors
      errorCount: this.errors.length
    };
  }

  /**
   * Clear error log
   */
  clearErrors() {
    this.errors = [];
  }

  /**
   * Export diagnostics as downloadable JSON
   */
  exportDiagnostics() {
    const diagnostics = this.collectDiagnostics();
    const blob = new Blob([JSON.stringify(diagnostics, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
const sessionDiagnostics = new SessionDiagnosticsService();

export default sessionDiagnostics;
