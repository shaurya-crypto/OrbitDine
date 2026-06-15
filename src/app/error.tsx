"use client";

import { useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // We could log this to a third-party error tracking service here
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-6 bg-base">
      <GlassPanel premium className="max-w-md w-full p-8 text-center flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-serif text-text-primary mb-2">Something went wrong</h2>
          <p className="text-text-secondary text-sm">
            We've encountered an unexpected issue. Our team has been notified.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="w-full py-3 px-4 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors font-medium shadow-lg shadow-accent/20"
        >
          Try again
        </button>
      </GlassPanel>
    </div>
  );
}
