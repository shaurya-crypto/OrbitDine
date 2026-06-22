"use client";

import { useEffect, useState } from "react";
import { useSyncStore } from "@/stores/syncStore";
import { runBackgroundSync } from "@/lib/network/syncEngine";
import { WifiOff, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export function NetworkMonitor() {
  const { isOnline, setOnlineStatus, queue, isSyncing } = useSyncStore();
  const [showRestored, setShowRestored] = useState(false);
  const [mounted, setMounted] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setMounted(true);
    const handleOnline = () => {
      setOnlineStatus(true);
      setShowRestored(true);
      runBackgroundSync(); // Trigger background sync immediately!
      setTimeout(() => setShowRestored(false), 4000);
    };

    const handleOffline = () => {
      setOnlineStatus(false);
      setShowRestored(false);
    };

    // Listen for successful syncs to notify the user
    const handleSyncSuccess = (e: any) => {
      const action = e.detail;
      if (action.type === 'ORDER') {
        toast.success("Offline order synced successfully!");
      } else if (action.type === 'FEEDBACK') {
        toast.success("Offline feedback submitted.");
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("orbitdine:sync-success", handleSyncSuccess);

    // Initial check
    if (typeof window !== "undefined" && !navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("orbitdine:sync-success", handleSyncSuccess);
    };
  }, [setOnlineStatus, toast]);

  // Handle conflict resolutions from the queue
  useEffect(() => {
    const conflicts = queue.filter(a => a.status === 'CONFLICT');
    if (conflicts.length > 0) {
      // In a real scenario, you might open a modal here.
      // For now, we notify via toast and optionally let the user clear it.
      conflicts.forEach(conflict => {
        toast.error(`Sync Conflict: ${conflict.errorMessage || 'Unable to sync action due to a conflict.'}`);
        useSyncStore.getState().removeAction(conflict.id); // Auto-clear to prevent infinite conflict loop
      });
    }
  }, [queue, toast]);

  if (!mounted) return null;
  if (isOnline && !showRestored && !isSyncing) return null;

  return (
    <div className="fixed bottom-safe-center left-1/2 -translate-x-1/2 z-[100] pb-6 px-4 md:px-0 pointer-events-none w-full md:w-auto flex justify-center">
      <div className="bg-surface/90 backdrop-blur-xl border border-border rounded-full shadow-2xl overflow-hidden pointer-events-auto">
        <div className="flex items-center">
          {!isOnline && (
            <div className="flex items-center gap-2 px-4 py-2.5 text-orange-500 bg-orange-500/5">
              <WifiOff className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium tracking-wide">Working Offline</span>
              {queue.length > 0 && (
                <span className="text-xs bg-orange-500/20 px-2 py-0.5 rounded-full ml-1">
                  {queue.length} pending
                </span>
              )}
            </div>
          )}

          {isOnline && showRestored && !isSyncing && (
            <div className="flex items-center gap-2 px-4 py-2.5 text-green-500 bg-green-500/5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium tracking-wide">Connection Restored</span>
            </div>
          )}

          {isOnline && isSyncing && (
            <div className="flex items-center gap-2 px-4 py-2.5 text-accent bg-accent/5">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium tracking-wide">Syncing Data...</span>
              <span className="text-xs bg-accent/20 px-2 py-0.5 rounded-full ml-1 text-accent">
                {queue.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
