import { useQuery } from "@tanstack/react-query";
import { fetchOrderTracking } from "@/services/orderService";

export function useOrderTracking(sessionId: string | null) {
  return useQuery({
    queryKey: ["orderTracking", sessionId],
    queryFn: () => fetchOrderTracking(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 5000, // Poll every 5 seconds as requested
  });
}
