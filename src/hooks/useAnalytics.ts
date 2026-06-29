"use client";

import { useAuthStore } from "@/stores/authStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useCallback } from "react";

/**
 * useAnalytics — Fire-and-forget analytics event tracking hook.
 * Automatically includes userId and sessionId from stores.
 */
export function useAnalytics() {
  const userId = useAuthStore((s) => s.userId);
  const sessionId = useSessionStore((s) => s.sessionId);

  const trackEvent = useCallback(
    (
      eventType: string,
      metadata?: Record<string, any>,
      overrides?: { restaurantId?: string; itemId?: string }
    ) => {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          customerId: userId || undefined,
          sessionId: sessionId || undefined,
          restaurantId: overrides?.restaurantId,
          itemId: overrides?.itemId,
          metadata,
        }),
      }).catch(() => {
        // Fire-and-forget: never block UI for analytics
      });
    },
    [userId, sessionId]
  );

  return { trackEvent };
}
