"use client";

import { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export function ConnectionBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsReconnecting(true);
      setTimeout(() => {
        setIsOffline(false);
        setIsReconnecting(false);
      }, 1500); // Artificial delay to show reconnecting state
    }

    function handleOffline() {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline && !isReconnecting) return null;

  return (
    <div className={`fixed top-0 left-0 w-full z-[100] transition-colors duration-300 flex items-center justify-center p-2 text-sm font-medium text-white
      ${isReconnecting ? "bg-emerald-600" : "bg-red-600"}
    `}>
      {isReconnecting ? (
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="animate-spin" />
          <span>Connection Restored. Syncing...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <WifiOff size={16} className="animate-pulse" />
          <span>You are offline. Please check your connection.</span>
        </div>
      )}
    </div>
  );
}
