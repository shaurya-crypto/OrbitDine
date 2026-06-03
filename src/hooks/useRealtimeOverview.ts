import { useQuery } from "@tanstack/react-query";
import { fetchDashboardOverview } from "@/services/dashboardService";
import { realtimeService } from "@/services/realtimeService";

export function useRealtimeOverview(restaurantId: string | null) {
  const pollingInterval = realtimeService.getPollingInterval("overview");

  return useQuery({
    queryKey: ["realtimeOverview", restaurantId],
    queryFn: () => fetchDashboardOverview(restaurantId!),
    enabled: !!restaurantId,
    refetchInterval: pollingInterval,
  });
}
