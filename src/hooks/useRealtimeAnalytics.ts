import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useRealtimeAnalytics(restaurantId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["analytics", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const res = await fetch(`/api/restaurant/analytics?restaurantId=${restaurantId}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!restaurantId,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!restaurantId) return;

    let pusherClient: any = null;
    let channel: any = null;

    import("@/lib/pusher/client").then(({ getPusherClient }) => {
      pusherClient = getPusherClient();
      if (!pusherClient) return;

      channel = pusherClient.subscribe(`restaurant-${restaurantId}`);

      // Debounce refetches to prevent API spam during bursts of events
      let timeout: NodeJS.Timeout;
      const refetchDebounced = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["analytics", restaurantId] });
        }, 1000); // 1s debounce
      };

      // Listen to everything that could change analytics metrics
      channel.bind("order_created", refetchDebounced);
      channel.bind("order_updated", refetchDebounced);
      channel.bind("order_status_updated", refetchDebounced);
      channel.bind("review_submitted", refetchDebounced);
      channel.bind("bill_generated", refetchDebounced);
      channel.bind("session_closed", refetchDebounced);
      channel.bind("table_status_changed", refetchDebounced);
    });

    return () => {
      if (channel) {
        channel.unbind_all();
        pusherClient?.unsubscribe(`restaurant-${restaurantId}`);
      }
    };
  }, [restaurantId, queryClient]);

  return query;
}
