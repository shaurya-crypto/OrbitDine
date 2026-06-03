import { apiClient } from "./apiClient";

export const fetchMenu = async (restaurantId: string) => {
  const { data } = await apiClient.get(`/menu/${restaurantId}`);
  return data.data;
};
