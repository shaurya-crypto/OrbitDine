import { useQuery } from "@tanstack/react-query";
import { fetchMenu } from "@/services/menuService";

export function useMenu(restaurantId: string | null) {
  return useQuery({
    queryKey: ["menu", restaurantId],
    queryFn: () => fetchMenu(restaurantId!),
    enabled: !!restaurantId, // Only fetch if restaurantId exists
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
