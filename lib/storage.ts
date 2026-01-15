
/**
 * Ultra-Defensive Safe Storage utility.
 * Specifically handles "Access to storage is not allowed" errors 
 * that occur in restricted browser contexts or third-party iframes.
 */

const memoryStorage: Record<string, string> = {};

/**
 * Robustly checks if a specific storage type is available and writable.
 */
const getSafeStorage = (type: 'sessionStorage' | 'localStorage'): Storage | null => {
  try {
    // Check if window and the property exist
    if (typeof window === 'undefined') return null;
    const storage = window[type];
    if (!storage) return null;
    
    // Verify writability (some browsers return the object but throw on access)
    const testKey = '__dharma_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch (e) {
    // Silently fail to memory storage if any security error occurs
    return null;
  }
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      const storage = getSafeStorage('sessionStorage');
      if (storage) return storage.getItem(key);
    } catch (e) {}
    return memoryStorage[`session_${key}`] || null;
  },
  setItem: (key: string, value: string): void => {
    try {
      const storage = getSafeStorage('sessionStorage');
      if (storage) {
        storage.setItem(key, value);
        return;
      }
    } catch (e) {}
    memoryStorage[`session_${key}`] = value;
  },
  removeItem: (key: string): void => {
    try {
      const storage = getSafeStorage('sessionStorage');
      if (storage) {
        storage.removeItem(key);
        return;
      }
    } catch (e) {}
    delete memoryStorage[`session_${key}`];
  }
};

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      const storage = getSafeStorage('localStorage');
      if (storage) return storage.getItem(key);
    } catch (e) {}
    return memoryStorage[`local_${key}`] || null;
  },
  setItem: (key: string, value: string): void => {
    try {
      const storage = getSafeStorage('localStorage');
      if (storage) {
        storage.setItem(key, value);
        return;
      }
    } catch (e) {}
    memoryStorage[`local_${key}`] = value;
  }
};
