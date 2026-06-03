import { apiClient } from "./apiClient";

export const createOrder = async (payload: { sessionId: string; notes?: string }) => {
  const { data } = await apiClient.post("/orders/create", payload);
  return data.data;
};

export const requestBill = async (payload: { sessionId: string }) => {
  const { data } = await apiClient.post("/orders/request-bill", payload);
  return data.data;
};

// We don't have a direct 'GET /orders/[sessionId]' built yet to fetch active tracking status
// Wait, the backend only built GET /orders/kitchen. 
// For a customer tracking their order, we need to fetch the session's active orders.
// Actually, `GET /sessions/[id]` returns the session. But we need the active order status.
// I will build a simple fetcher here that relies on GET /sessions/[id] or we might need to add a small route.
// Let's use GET /sessions/[id] and we can populate orderIds if needed, OR we create `GET /api/orders/track?sessionId=...`
export const fetchOrderTracking = async (sessionId: string) => {
  // Let's call a specific endpoint we will create for tracking
  const { data } = await apiClient.get("/orders/track", { params: { sessionId } });
  return data.data;
};
