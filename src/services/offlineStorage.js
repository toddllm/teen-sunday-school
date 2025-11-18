/**
 * Offline Storage Service
 *
 * Handles downloading and caching Bible translations for offline use
 */

import offlineDB from './offlineDB';
import axios from 'axios';

const API_BASE_URL = 'https://api.scripture.api.bible/v1';
const API_KEY = process.env.REACT_APP_BIBLE_API_KEY || 'demo-key';

// Available Bible translations with metadata
export const AVAILABLE_TRANSLATIONS = [
  {
    id: 'de4e12af7f28f599-02',
    abbreviation: 'NIV',
    name: 'New International Version',
    language: 'English',
    estimatedSize: '4.5 MB',
    estimatedSizeBytes: 4500000,
    description: 'A modern, widely-used translation balancing accuracy and readability'
  },
  {
    id: 'de4e12af7f28f599-01',
    abbreviation: 'KJV',
    name: 'King James Version',
    language: 'English',
    estimatedSize: '4.2 MB',
    estimatedSizeBytes: 4200000,
    description: 'Classic translation from 1611, known for poetic language'
  },
  {
    id: 'de4e12af7f28f599-03',
    abbreviation: 'ESV',
    name: 'English Standard Version',
    language: 'English',
    estimatedSize: '4.3 MB',
    estimatedSizeBytes: 4300000,
    description: 'Modern literal translation emphasizing word-for-word accuracy'
  },
  {
    id: 'de4e12af7f28f599-04',
    abbreviation: 'NLT',
    name: 'New Living Translation',
    language: 'English',
    estimatedSize: '4.6 MB',
    estimatedSizeBytes: 4600000,
    description: 'Contemporary translation focusing on readability and clarity'
  }
];

class OfflineStorageService {
  constructor() {
    this.downloadControllers = new Map(); // For canceling downloads
  }

  /**
   * Get list of available translations
   */
  getAvailableTranslations() {
    return AVAILABLE_TRANSLATIONS;
  }

  /**
   * Get downloaded translations
   */
  async getDownloadedTranslations() {
    try {
      const translations = await offlineDB.getAllTranslations();
      return translations.filter(t => t.downloaded === true);
    } catch (error) {
      console.error('Error fetching downloaded translations:', error);
      return [];
    }
  }

  /**
   * Check if a translation is downloaded
   */
  async isTranslationDownloaded(translationId) {
    try {
      const translation = await offlineDB.getTranslation(translationId);
      return translation && translation.downloaded === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo() {
    try {
      const estimate = await offlineDB.getStorageEstimate();
      const translations = await this.getDownloadedTranslations();

      let totalBibleStorage = 0;
      for (const trans of translations) {
        totalBibleStorage += trans.downloadedSize || 0;
      }

      return {
        ...estimate,
        bibleStorage: totalBibleStorage,
        translationsCount: translations.length
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  /**
   * Download a Bible translation
   */
  async downloadTranslation(translationId, onProgress) {
    try {
      // Find translation metadata
      const translationMeta = AVAILABLE_TRANSLATIONS.find(t => t.id === translationId);
      if (!translationMeta) {
        throw new Error('Translation not found');
      }

      // Create abort controller for cancellation
      const controller = new AbortController();
      this.downloadControllers.set(translationId, controller);

      // Initialize progress
      const progressData = {
        translationId,
        status: 'downloading',
        progress: 0,
        currentStep: 'Initializing...',
        startedAt: new Date().toISOString()
      };

      await offlineDB.saveDownloadProgress(progressData);
      if (onProgress) onProgress(progressData);

      // Save translation metadata
      const translationData = {
        ...translationMeta,
        downloaded: false,
        downloadedAt: null,
        downloadedSize: 0
      };
      await offlineDB.saveTranslation(translationData);

      // Fetch Bible structure (books)
      progressData.currentStep = 'Fetching Bible structure...';
      progressData.progress = 5;
      await offlineDB.saveDownloadProgress(progressData);
      if (onProgress) onProgress(progressData);

      const booksResponse = await axios.get(
        `${API_BASE_URL}/bibles/${translationId}/books`,
        {
          headers: { 'api-key': API_KEY },
          signal: controller.signal
        }
      );

      const books = booksResponse.data.data || [];
      let totalChapters = 0;
      let processedChapters = 0;

      // Count total chapters for progress calculation
      for (const book of books) {
        const bookData = await axios.get(
          `${API_BASE_URL}/bibles/${translationId}/books/${book.id}`,
          {
            headers: { 'api-key': API_KEY },
            signal: controller.signal
          }
        );
        const chapters = bookData.data.data?.chapters || [];
        totalChapters += chapters.length;
      }

      let downloadedBytes = 0;

      // Download each book and its chapters
      for (const book of books) {
        // Save book metadata
        const bookData = {
          id: `${translationId}_${book.id}`,
          translationId,
          bookId: book.id,
          name: book.name,
          abbreviation: book.abbreviation
        };
        await offlineDB.put('books', bookData);

        // Fetch chapters for this book
        const bookDetailResponse = await axios.get(
          `${API_BASE_URL}/bibles/${translationId}/books/${book.id}`,
          {
            headers: { 'api-key': API_KEY },
            signal: controller.signal
          }
        );

        const chapters = bookDetailResponse.data.data?.chapters || [];

        // Download each chapter
        for (const chapter of chapters) {
          // Save chapter metadata
          const chapterData = {
            id: chapter.id,
            translationId,
            bookId: book.id,
            chapterNumber: chapter.number,
            reference: chapter.reference
          };
          await offlineDB.put('chapters', chapterData);

          // Fetch chapter content (verses)
          const chapterContentResponse = await axios.get(
            `${API_BASE_URL}/bibles/${translationId}/chapters/${chapter.id}`,
            {
              params: { 'content-type': 'json', 'include-verse-numbers': true },
              headers: { 'api-key': API_KEY },
              signal: controller.signal
            }
          );

          const chapterContent = chapterContentResponse.data.data;

          // Parse and save verses
          // Note: The actual verse parsing depends on the API response structure
          // This is a simplified version
          if (chapterContent.content) {
            const verseText = chapterContent.content;
            const verseData = {
              id: chapter.id,
              translationId,
              bookId: book.id,
              chapterId: chapter.id,
              reference: chapter.reference,
              content: verseText,
              cachedAt: new Date().toISOString()
            };
            await offlineDB.saveVerse(verseData);

            // Estimate size (rough estimate)
            downloadedBytes += JSON.stringify(verseData).length;
          }

          // Update progress
          processedChapters++;
          const progress = 10 + Math.floor((processedChapters / totalChapters) * 85);
          progressData.progress = progress;
          progressData.currentStep = `Downloading ${book.name} ${chapter.number}...`;
          await offlineDB.saveDownloadProgress(progressData);
          if (onProgress) onProgress(progressData);

          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Mark translation as downloaded
      translationData.downloaded = true;
      translationData.downloadedAt = new Date().toISOString();
      translationData.downloadedSize = downloadedBytes;
      await offlineDB.saveTranslation(translationData);

      // Finalize progress
      progressData.status = 'completed';
      progressData.progress = 100;
      progressData.currentStep = 'Download complete!';
      progressData.completedAt = new Date().toISOString();
      await offlineDB.saveDownloadProgress(progressData);
      if (onProgress) onProgress(progressData);

      // Clean up
      this.downloadControllers.delete(translationId);

      return { success: true, translation: translationData };

    } catch (error) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        // Download was canceled
        const progressData = await offlineDB.getDownloadProgress(translationId);
        if (progressData) {
          progressData.status = 'canceled';
          progressData.currentStep = 'Download canceled';
          await offlineDB.saveDownloadProgress(progressData);
        }
        throw new Error('Download canceled');
      }

      // Download failed
      const progressData = await offlineDB.getDownloadProgress(translationId);
      if (progressData) {
        progressData.status = 'failed';
        progressData.currentStep = `Error: ${error.message}`;
        progressData.error = error.message;
        await offlineDB.saveDownloadProgress(progressData);
      }

      this.downloadControllers.delete(translationId);
      throw error;
    }
  }

  /**
   * Cancel a download in progress
   */
  cancelDownload(translationId) {
    const controller = this.downloadControllers.get(translationId);
    if (controller) {
      controller.abort();
      this.downloadControllers.delete(translationId);
      return true;
    }
    return false;
  }

  /**
   * Delete a downloaded translation
   */
  async deleteTranslation(translationId) {
    try {
      await offlineDB.deleteTranslation(translationId);
      await offlineDB.deleteDownloadProgress(translationId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting translation:', error);
      throw error;
    }
  }

  /**
   * Get download progress for a translation
   */
  async getDownloadProgress(translationId) {
    try {
      return await offlineDB.getDownloadProgress(translationId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get cached verse by reference
   */
  async getCachedVerse(reference, translationId) {
    try {
      const verses = await offlineDB.getVersesByReference(reference, translationId);
      return verses.length > 0 ? verses[0] : null;
    } catch (error) {
      console.error('Error fetching cached verse:', error);
      return null;
    }
  }

  /**
   * Cache a single verse/passage
   */
  async cachePassage(passage, translationId) {
    try {
      const verseData = {
        id: passage.id || `${translationId}_${passage.reference}`,
        translationId,
        reference: passage.reference,
        content: passage.content,
        cachedAt: new Date().toISOString(),
        ...passage
      };
      await offlineDB.saveVerse(verseData);
      return verseData;
    } catch (error) {
      console.error('Error caching passage:', error);
      throw error;
    }
  }

  /**
   * Clear all offline data
   */
  async clearAllData() {
    try {
      const stores = ['translations', 'books', 'chapters', 'verses', 'downloadProgress'];
      for (const store of stores) {
        await offlineDB.clear(store);
      }
      return { success: true };
    } catch (error) {
      console.error('Error clearing offline data:', error);
      throw error;
    }
  }
}

// Export singleton instance
const offlineStorage = new OfflineStorageService();
export default offlineStorage;
