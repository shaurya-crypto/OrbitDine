import { apiClient } from "./apiClient";
import { get, set } from "idb-keyval";

const fetchWithCache = async (key: string, url: string, params?: any) => {
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (isOffline) {
    const cached = await get(key);
    if (cached) return cached.data;
    throw new Error("Offline and no cache available");
  }
  try {
    const { data } = await apiClient.get(url, { params });
    await set(key, data);
    return data.data;
  } catch (error) {
    const cached = await get(key);
    if (cached) return cached.data;
    throw error;
  }
};

export const fetchLiveTables = async (restaurantId: string) => {
  return fetchWithCache(`orbitdine-tables-${restaurantId}`, `/tables/${restaurantId}`);
};

export const fetchActiveSessions = async (restaurantId: string) => {
  return fetchWithCache(`orbitdine-sessions-${restaurantId}`, `/sessions/active`, { restaurantId });
};

export const fetchDashboardOverview = async (restaurantId: string) => {
  return fetchWithCache(`orbitdine-overview-${restaurantId}`, `/dashboard/overview`, { restaurantId });
};

export const fetchKitchenOrders = async (restaurantId: string) => {
  return fetchWithCache(`orbitdine-kitchen-${restaurantId}`, `/orders/kitchen`, { restaurantId });
};

export const toggleMenuItemAvailability = async (payload: { menuItemId: string; available?: boolean; isBestseller?: boolean; chefSpecial?: boolean; isNewArrival?: boolean; limitedTimeOffer?: boolean }) => {
  const { data } = await apiClient.patch(`/menu/toggle`, payload);
  return data.data;
};
