import { apiClient } from "./apiClient";
import { get, set } from "idb-keyval";

const getCacheKey = (restaurantId: string) => `orbitdine-menu-${restaurantId}`;

export const fetchMenu = async (restaurantId: string) => {
  const cacheKey = getCacheKey(restaurantId);
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  // 1. If offline, immediately return the cached menu
  if (isOffline) {
    const cachedData = await get(cacheKey);
    if (cachedData) {
      console.log(`[MenuService] Serving offline cached menu for ${restaurantId}`);
      return cachedData.data;
    }
    throw new Error("You are offline and no menu cache is available.");
  }

  // 2. Fetch fresh data from the network
  try {
    const { data } = await apiClient.get(`/menu/${restaurantId}`);
    
    // 3. Compare versions and cache
    const cachedData = await get(cacheKey);
    const newVersion = data.data.restaurant?.menuVersion || 1;
    const oldVersion = cachedData?.data?.restaurant?.menuVersion || 0;

    // Save to IndexedDB (either it's new, or versions mismatch, or cache is missing)
    if (!cachedData || newVersion > oldVersion) {
      console.log(`[MenuService] Caching new menu version ${newVersion} for ${restaurantId}`);
      await set(cacheKey, data);
    }

    return data.data;
  } catch (error) {
    // 4. Fallback to cache on network failure (e.g. 500 error or sudden drop)
    const cachedData = await get(cacheKey);
    if (cachedData) {
      console.warn(`[MenuService] Network fetch failed, returning cached menu version ${cachedData.data.restaurant?.menuVersion}`);
      return cachedData.data;
    }
    throw error;
  }
};
