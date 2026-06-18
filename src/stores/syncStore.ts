import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/lib/idbStorage';

export type SyncActionType = 'ORDER' | 'FEEDBACK' | 'BILL_REQUEST' | 'KITCHEN_STATUS' | 'TABLE_STATUS';

export interface SyncAction {
  id: string; // Idempotency key (UUID)
  type: SyncActionType;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  timestamp: number;
  retryCount: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'CONFLICT';
  errorMessage?: string;
}

interface SyncState {
  queue: SyncAction[];
  isOnline: boolean;
  isSyncing: boolean;
  
  // Actions
  setOnlineStatus: (status: boolean) => void;
  enqueueAction: (action: Omit<SyncAction, 'timestamp' | 'retryCount' | 'status'>) => void;
  removeAction: (id: string) => void;
  updateActionStatus: (id: string, status: SyncAction['status'], error?: string) => void;
  incrementRetry: (id: string) => void;
  setSyncing: (isSyncing: boolean) => void;
  clearQueue: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      queue: [],
      isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
      isSyncing: false,

      setOnlineStatus: (status) => set({ isOnline: status }),

      enqueueAction: (action) => set((state) => ({
        queue: [
          ...state.queue,
          {
            ...action,
            timestamp: Date.now(),
            retryCount: 0,
            status: 'PENDING'
          }
        ]
      })),

      removeAction: (id) => set((state) => ({
        queue: state.queue.filter((a) => a.id !== id)
      })),

      updateActionStatus: (id, status, error) => set((state) => ({
        queue: state.queue.map((a) => a.id === id ? { ...a, status, errorMessage: error } : a)
      })),

      incrementRetry: (id) => set((state) => ({
        queue: state.queue.map((a) => a.id === id ? { ...a, retryCount: a.retryCount + 1 } : a)
      })),

      setSyncing: (isSyncing) => set({ isSyncing }),
      
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'orbitdine-sync-queue',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ queue: state.queue }), // Only persist the queue, not active syncing state
    }
  )
);
