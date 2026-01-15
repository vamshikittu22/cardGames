
/**
 * Safe Storage utility to prevent "Access to storage is not allowed" errors 
 * common in sandboxed or highly restricted browser environments.
 */

const memoryStorage: Record<string, string> = {};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      return window.sessionStorage.getItem(key);
    } catch (e) {
      return memoryStorage[`session_${key}`] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (e) {
      memoryStorage[`session_${key}`] = value;
    }
  },
  removeItem: (key: string): void => {
    try {
      window.sessionStorage.removeItem(key);
    } catch (e) {
      delete memoryStorage[`session_${key}`];
    }
  }
};

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return memoryStorage[`local_${key}`] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      memoryStorage[`local_${key}`] = value;
    }
  }
};
