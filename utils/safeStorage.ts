/**
 * Tales of Dharma - Safe Storage Utility
 * Provides a resilient interface for storage that falls back to memory
 * if the browser context denies access (SecurityError).
 */

const memoryStore = new Map<string, string>();

const getStorage = (type: 'localStorage' | 'sessionStorage'): Storage | null => {
  try {
    if (typeof window === 'undefined') return null;
    const storage = window[type];
    // Test write to ensure it's not just available but also writable
    const testKey = '__dharma_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch (e) {
    return null;
  }
};

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      const storage = getStorage('localStorage');
      return storage ? storage.getItem(key) : (memoryStore.get(`local_${key}`) || null);
    } catch (e) {
      return memoryStore.get(`local_${key}`) || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      const storage = getStorage('localStorage');
      if (storage) {
        storage.setItem(key, value);
      } else {
        memoryStore.set(`local_${key}`, value);
      }
    } catch (e) {
      memoryStore.set(`local_${key}`, value);
    }
  },
  removeItem: (key: string): void => {
    try {
      const storage = getStorage('localStorage');
      if (storage) {
        storage.removeItem(key);
      }
    } catch (e) {}
    memoryStore.delete(`local_${key}`);
  }
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      const storage = getStorage('sessionStorage');
      return storage ? storage.getItem(key) : (memoryStore.get(`session_${key}`) || null);
    } catch (e) {
      return memoryStore.get(`session_${key}`) || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      const storage = getStorage('sessionStorage');
      if (storage) {
        storage.setItem(key, value);
      } else {
        memoryStore.set(`session_${key}`, value);
      }
    } catch (e) {
      memoryStore.set(`session_${key}`, value);
    }
  },
  removeItem: (key: string): void => {
    try {
      const storage = getStorage('sessionStorage');
      if (storage) {
        storage.removeItem(key);
      }
    } catch (e) {}
    memoryStore.delete(`session_${key}`);
  }
};