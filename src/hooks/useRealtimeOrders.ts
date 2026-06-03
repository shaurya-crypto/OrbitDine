import { useQuery } from "@tanstack/react-query";
import { fetchKitchenOrders } from "@/services/dashboardService";
import { realtimeService } from "@/services/realtimeService";

export function useRealtimeOrders(restaurantId: string | null) {
  const pollingInterval = realtimeService.getPollingInterval("orders");

  return useQuery({
    queryKey: ["realtimeOrders", restaurantId],
    queryFn: () => fetchKitchenOrders(restaurantId!),
    enabled: !!restaurantId,
    refetchInterval: pollingInterval, // 3s polling for MVP. Will be false when WebSockets are added.
  });
}
