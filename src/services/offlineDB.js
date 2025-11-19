/**
 * IndexedDB Database for Offline Bible Storage
 *
 * Stores:
 * - Bible translations metadata
 * - Bible verses and passages
 * - User notes and highlights
 * - Sync queue for offline actions
 * - Download progress
 */

const DB_NAME = 'TeenSundaySchoolDB';
const DB_VERSION = 1;

// Object store names
const STORES = {
  TRANSLATIONS: 'translations',
  BOOKS: 'books',
  CHAPTERS: 'chapters',
  VERSES: 'verses',
  NOTES: 'notes',
  HIGHLIGHTS: 'highlights',
  SYNC_QUEUE: 'syncQueue',
  DOWNLOAD_PROGRESS: 'downloadProgress'
};

class OfflineDB {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  /**
   * Initialize the IndexedDB database
   */
  async init() {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Translations store
        if (!db.objectStoreNames.contains(STORES.TRANSLATIONS)) {
          const translationStore = db.createObjectStore(STORES.TRANSLATIONS, { keyPath: 'id' });
          translationStore.createIndex('abbreviation', 'abbreviation', { unique: true });
          translationStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        }

        // Books store
        if (!db.objectStoreNames.contains(STORES.BOOKS)) {
          const booksStore = db.createObjectStore(STORES.BOOKS, { keyPath: 'id' });
          booksStore.createIndex('translationId', 'translationId', { unique: false });
          booksStore.createIndex('bookId', 'bookId', { unique: false });
        }

        // Chapters store
        if (!db.objectStoreNames.contains(STORES.CHAPTERS)) {
          const chaptersStore = db.createObjectStore(STORES.CHAPTERS, { keyPath: 'id' });
          chaptersStore.createIndex('translationId', 'translationId', { unique: false });
          chaptersStore.createIndex('bookId', 'bookId', { unique: false });
          chaptersStore.createIndex('chapterNumber', 'chapterNumber', { unique: false });
        }

        // Verses store
        if (!db.objectStoreNames.contains(STORES.VERSES)) {
          const versesStore = db.createObjectStore(STORES.VERSES, { keyPath: 'id' });
          versesStore.createIndex('translationId', 'translationId', { unique: false });
          versesStore.createIndex('bookId', 'bookId', { unique: false });
          versesStore.createIndex('chapterId', 'chapterId', { unique: false });
          versesStore.createIndex('reference', 'reference', { unique: false });
        }

        // Notes store
        if (!db.objectStoreNames.contains(STORES.NOTES)) {
          const notesStore = db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
          notesStore.createIndex('verseId', 'verseId', { unique: false });
          notesStore.createIndex('reference', 'reference', { unique: false });
          notesStore.createIndex('createdAt', 'createdAt', { unique: false });
          notesStore.createIndex('synced', 'synced', { unique: false });
        }

        // Highlights store
        if (!db.objectStoreNames.contains(STORES.HIGHLIGHTS)) {
          const highlightsStore = db.createObjectStore(STORES.HIGHLIGHTS, { keyPath: 'id' });
          highlightsStore.createIndex('verseId', 'verseId', { unique: false });
          highlightsStore.createIndex('reference', 'reference', { unique: false });
          highlightsStore.createIndex('color', 'color', { unique: false });
          highlightsStore.createIndex('synced', 'synced', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
            keyPath: 'id',
            autoIncrement: true
          });
          syncStore.createIndex('actionType', 'actionType', { unique: false });
          syncStore.createIndex('createdAt', 'createdAt', { unique: false });
          syncStore.createIndex('status', 'status', { unique: false });
        }

        // Download progress store
        if (!db.objectStoreNames.contains(STORES.DOWNLOAD_PROGRESS)) {
          db.createObjectStore(STORES.DOWNLOAD_PROGRESS, { keyPath: 'translationId' });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Generic method to add or update an item in a store
   */
  async put(storeName, item) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to get an item from a store
   */
  async get(storeName, key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to get all items from a store
   */
  async getAll(storeName) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to delete an item from a store
   */
  async delete(storeName, key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get items by index
   */
  async getByIndex(storeName, indexName, value) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data from a store
   */
  async clear(storeName) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get database size estimate
   */
  async getStorageEstimate() {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: estimate.quota ? (estimate.usage / estimate.quota) * 100 : 0
      };
    }
    return null;
  }

  // ===== TRANSLATION METHODS =====

  async saveTranslation(translation) {
    return this.put(STORES.TRANSLATIONS, translation);
  }

  async getTranslation(id) {
    return this.get(STORES.TRANSLATIONS, id);
  }

  async getAllTranslations() {
    return this.getAll(STORES.TRANSLATIONS);
  }

  async deleteTranslation(id) {
    // Delete translation and all associated data
    await this.delete(STORES.TRANSLATIONS, id);

    // Delete associated books, chapters, and verses
    const books = await this.getByIndex(STORES.BOOKS, 'translationId', id);
    for (const book of books) {
      await this.delete(STORES.BOOKS, book.id);
    }

    const chapters = await this.getByIndex(STORES.CHAPTERS, 'translationId', id);
    for (const chapter of chapters) {
      await this.delete(STORES.CHAPTERS, chapter.id);
    }

    const verses = await this.getByIndex(STORES.VERSES, 'translationId', id);
    for (const verse of verses) {
      await this.delete(STORES.VERSES, verse.id);
    }
  }

  // ===== VERSE METHODS =====

  async saveVerse(verse) {
    return this.put(STORES.VERSES, verse);
  }

  async getVerse(id) {
    return this.get(STORES.VERSES, id);
  }

  async getVersesByReference(reference, translationId) {
    const allVerses = await this.getByIndex(STORES.VERSES, 'reference', reference);
    if (translationId) {
      return allVerses.filter(v => v.translationId === translationId);
    }
    return allVerses;
  }

  async getVersesByChapter(chapterId) {
    return this.getByIndex(STORES.VERSES, 'chapterId', chapterId);
  }

  // ===== NOTES METHODS =====

  async saveNote(note) {
    if (!note.id) {
      note.id = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!note.createdAt) {
      note.createdAt = new Date().toISOString();
    }
    note.updatedAt = new Date().toISOString();
    note.synced = note.synced || false;

    return this.put(STORES.NOTES, note);
  }

  async getNote(id) {
    return this.get(STORES.NOTES, id);
  }

  async getNotesByReference(reference) {
    return this.getByIndex(STORES.NOTES, 'reference', reference);
  }

  async getAllNotes() {
    return this.getAll(STORES.NOTES);
  }

  async deleteNote(id) {
    return this.delete(STORES.NOTES, id);
  }

  async getUnsyncedNotes() {
    return this.getByIndex(STORES.NOTES, 'synced', false);
  }

  // ===== HIGHLIGHTS METHODS =====

  async saveHighlight(highlight) {
    if (!highlight.id) {
      highlight.id = `highlight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!highlight.createdAt) {
      highlight.createdAt = new Date().toISOString();
    }
    highlight.synced = highlight.synced || false;

    return this.put(STORES.HIGHLIGHTS, highlight);
  }

  async getHighlight(id) {
    return this.get(STORES.HIGHLIGHTS, id);
  }

  async getHighlightsByReference(reference) {
    return this.getByIndex(STORES.HIGHLIGHTS, 'reference', reference);
  }

  async getAllHighlights() {
    return this.getAll(STORES.HIGHLIGHTS);
  }

  async deleteHighlight(id) {
    return this.delete(STORES.HIGHLIGHTS, id);
  }

  async getUnsyncedHighlights() {
    return this.getByIndex(STORES.HIGHLIGHTS, 'synced', false);
  }

  // ===== SYNC QUEUE METHODS =====

  async addToSyncQueue(action) {
    const queueItem = {
      ...action,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    return this.put(STORES.SYNC_QUEUE, queueItem);
  }

  async getSyncQueue() {
    return this.getAll(STORES.SYNC_QUEUE);
  }

  async getPendingSyncItems() {
    return this.getByIndex(STORES.SYNC_QUEUE, 'status', 'pending');
  }

  async updateSyncItem(id, updates) {
    const item = await this.get(STORES.SYNC_QUEUE, id);
    if (item) {
      return this.put(STORES.SYNC_QUEUE, { ...item, ...updates });
    }
  }

  async clearSyncQueue() {
    return this.clear(STORES.SYNC_QUEUE);
  }

  // ===== DOWNLOAD PROGRESS METHODS =====

  async saveDownloadProgress(progress) {
    return this.put(STORES.DOWNLOAD_PROGRESS, progress);
  }

  async getDownloadProgress(translationId) {
    return this.get(STORES.DOWNLOAD_PROGRESS, translationId);
  }

  async deleteDownloadProgress(translationId) {
    return this.delete(STORES.DOWNLOAD_PROGRESS, translationId);
  }
}

// Export singleton instance
const offlineDB = new OfflineDB();
export default offlineDB;
export { STORES };
