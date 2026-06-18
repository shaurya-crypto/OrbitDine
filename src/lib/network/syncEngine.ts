import { useSyncStore, SyncAction } from '@/stores/syncStore';

const MAX_RETRIES = 3;

/**
 * Executes a single sync action against the backend
 */
const executeSyncAction = async (action: SyncAction): Promise<boolean> => {
  try {
    const res = await fetch(action.endpoint, {
      method: action.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': action.id, // Guarantee exactly-once processing
      },
      body: JSON.stringify(action.payload),
    });

    if (res.ok) {
      return true;
    }

    // Handle explicit conflicts (e.g., 409 Conflict)
    if (res.status === 409) {
      const errorData = await res.json().catch(() => ({}));
      useSyncStore.getState().updateActionStatus(action.id, 'CONFLICT', errorData.error || 'Conflict detected');
      return false; // Leave in queue as CONFLICT for UI resolution
    }

    // 4xx errors usually mean bad request, don't retry indefinitely
    if (res.status >= 400 && res.status < 500) {
      useSyncStore.getState().updateActionStatus(action.id, 'FAILED', `Client error ${res.status}`);
      return false;
    }

    // 5xx errors or network failures will throw or return false, allowing retry
    return false;
  } catch (error) {
    console.error(`[SyncEngine] Network failure for action ${action.id}`, error);
    return false;
  }
};

/**
 * Background Sync Engine
 * Drains the offline queue sequentially to maintain order consistency.
 */
export const runBackgroundSync = async () => {
  const state = useSyncStore.getState();
  
  // Don't run if offline, already syncing, or queue is empty
  if (!state.isOnline || state.isSyncing || state.queue.length === 0) return;

  state.setSyncing(true);

  // We loop dynamically because new actions could be enqueued while we sync
  let actionProcessed = true;
  
  while (actionProcessed) {
    actionProcessed = false;
    
    // Get the oldest pending/failed action that hasn't exceeded max retries
    const pendingAction = useSyncStore.getState().queue.find(
      a => (a.status === 'PENDING' || a.status === 'FAILED') && a.retryCount < MAX_RETRIES
    );

    if (pendingAction) {
      actionProcessed = true;
      useSyncStore.getState().updateActionStatus(pendingAction.id, 'SYNCING');
      
      const success = await executeSyncAction(pendingAction);
      
      if (success) {
        useSyncStore.getState().removeAction(pendingAction.id);
        
        // Track production offline metric
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'OFFLINE_SYNC_SUCCESS',
            metadata: {
              actionType: pendingAction.type,
              retryCount: pendingAction.retryCount,
              queueTimeMs: Date.now() - pendingAction.timestamp
            }
          })
        }).catch(() => {});

        // Dispatch custom event for UI/Toasts
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('orbitdine:sync-success', { detail: pendingAction }));
        }
      } else {
        const freshAction = useSyncStore.getState().queue.find(a => a.id === pendingAction.id);
        if (freshAction && freshAction.status !== 'CONFLICT') {
           useSyncStore.getState().incrementRetry(pendingAction.id);
           useSyncStore.getState().updateActionStatus(pendingAction.id, 'FAILED');
           
           if (freshAction.retryCount >= MAX_RETRIES - 1) {
             fetch('/api/analytics/track', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                 eventType: 'OFFLINE_SYNC_FAILED',
                 metadata: {
                   actionType: freshAction.type,
                   errorMessage: freshAction.errorMessage
                 }
               })
             }).catch(() => {});
           }
        }
        
        // If we failed due to a non-conflict network issue, pause the queue briefly to prevent spamming
        if (freshAction?.status !== 'CONFLICT') {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
  }

  useSyncStore.getState().setSyncing(false);
};
