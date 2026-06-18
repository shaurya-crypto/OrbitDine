import { get, set, del } from 'idb-keyval';
import { StateStorage } from 'zustand/middleware';

/**
 * Custom Zustand storage engine utilizing IndexedDB.
 * This guarantees reliable offline persistence with virtually unlimited storage,
 * safely avoiding localStorage quota limits and synchronous blocking.
 */
export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    try {
      const value = await get(name);
      return value === undefined ? null : value;
    } catch (error) {
      console.warn(`[IDBStorage] Failed to get item ${name}:`, error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    try {
      await set(name, value);
    } catch (error) {
      console.error(`[IDBStorage] Failed to set item ${name}:`, error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    try {
      await del(name);
    } catch (error) {
      console.error(`[IDBStorage] Failed to remove item ${name}:`, error);
    }
  },
};
