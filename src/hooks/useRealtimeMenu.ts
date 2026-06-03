import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useRealtimeMenu(restaurantId: string | null) {
  return useQuery({
    queryKey: ["realtimeMenu", restaurantId],
    queryFn: async () => {
      const res = await axios.get(`/api/menu/admin/${restaurantId}`);
      return res.data;
    },
    enabled: !!restaurantId,
    refetchInterval: 10000, // Poll every 10s for menu changes
  });
}
