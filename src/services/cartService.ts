import { apiClient } from "./apiClient";

export const fetchCart = async (sessionId: string) => {
  const { data } = await apiClient.get(`/cart`, { params: { sessionId } });
  return data.data;
};

export const addToCart = async (payload: { sessionId: string; menuItemId: string; quantity: number; notes?: string }) => {
  const { data } = await apiClient.post("/cart/add", payload);
  return data.data; // returns recalculated totals
};

export const updateCartItem = async (payload: { sessionId: string; cartItemId: string; quantity: number }) => {
  const { data } = await apiClient.post("/cart/update", payload);
  return data.data;
};

export const removeFromCart = async (payload: { sessionId: string; cartItemId: string }) => {
  const { data } = await apiClient.post("/cart/remove", payload);
  return data.data;
};

export const clearCart = async (payload: { sessionId: string }) => {
  const { data } = await apiClient.post("/cart/clear", payload);
  return data.data;
};
