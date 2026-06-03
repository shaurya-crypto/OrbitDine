import { useQuery } from "@tanstack/react-query";
import { fetchLiveTables } from "@/services/dashboardService";
import { realtimeService } from "@/services/realtimeService";

export function useRealtimeTables(restaurantId: string | null) {
  const pollingInterval = realtimeService.getPollingInterval("tables");

  return useQuery({
    queryKey: ["realtimeTables", restaurantId],
    queryFn: () => fetchLiveTables(restaurantId!),
    enabled: !!restaurantId,
    refetchInterval: pollingInterval,
  });
}
