import { apiClient } from "./apiClient";

export const fetchLiveTables = async (restaurantId: string) => {
  const { data } = await apiClient.get(`/tables/${restaurantId}`);
  return data.data;
};

export const fetchActiveSessions = async (restaurantId: string) => {
  const { data } = await apiClient.get(`/sessions/active`, { params: { restaurantId } });
  return data.data;
};

export const fetchDashboardOverview = async (restaurantId: string) => {
  const { data } = await apiClient.get(`/dashboard/overview/${restaurantId}`);
  return data.data;
};

export const fetchKitchenOrders = async (restaurantId: string) => {
  const { data } = await apiClient.get(`/orders/kitchen`, { params: { restaurantId } });
  return data.data;
};

export const toggleMenuItemAvailability = async (payload: { menuItemId: string; available?: boolean; isBestseller?: boolean; chefSpecial?: boolean; isNewArrival?: boolean; limitedTimeOffer?: boolean }) => {
  const { data } = await apiClient.patch(`/menu/toggle`, payload);
  return data.data;
};
