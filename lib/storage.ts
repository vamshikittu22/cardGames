
/**
 * Production-grade Safe Storage utility.
 * Prevents "Access to storage is not allowed" errors in sandboxed contexts
 * by wrapping property access and methods in rigorous try-catch blocks.
 */

const memoryStorage: Record<string, string> = {};

const getStorage = (type: 'sessionStorage' | 'localStorage'): Storage | null => {
  try {
    return window[type];
  } catch (e) {
    return null;
  }
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      const storage = getStorage('sessionStorage');
      return storage ? storage.getItem(key) : (memoryStorage[`session_${key}`] || null);
    } catch (e) {
      return memoryStorage[`session_${key}`] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      const storage = getStorage('sessionStorage');
      if (storage) {
        storage.setItem(key, value);
      } else {
        memoryStorage[`session_${key}`] = value;
      }
    } catch (e) {
      memoryStorage[`session_${key}`] = value;
    }
  },
  removeItem: (key: string): void => {
    try {
      const storage = getStorage('sessionStorage');
      if (storage) {
        storage.removeItem(key);
      } else {
        delete memoryStorage[`session_${key}`];
      }
    } catch (e) {
      delete memoryStorage[`session_${key}`];
    }
  }
};

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      const storage = getStorage('localStorage');
      return storage ? storage.getItem(key) : (memoryStorage[`local_${key}`] || null);
    } catch (e) {
      return memoryStorage[`local_${key}`] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      const storage = getStorage('localStorage');
      if (storage) {
        storage.setItem(key, value);
      } else {
        memoryStorage[`local_${key}`] = value;
      }
    } catch (e) {
      memoryStorage[`local_${key}`] = value;
    }
  }
};
