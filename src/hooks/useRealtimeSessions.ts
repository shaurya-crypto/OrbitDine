import { useQuery } from "@tanstack/react-query";
import { fetchActiveSessions } from "@/services/dashboardService";
import { realtimeService } from "@/services/realtimeService";

export function useRealtimeSessions(restaurantId: string | null) {
  const pollingInterval = realtimeService.getPollingInterval("sessions");

  return useQuery({
    queryKey: ["realtimeSessions", restaurantId],
    queryFn: () => fetchActiveSessions(restaurantId!),
    enabled: !!restaurantId,
    refetchInterval: pollingInterval,
  });
}
