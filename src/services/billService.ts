import { apiClient } from "./apiClient";

export const generateBill = async (payload: { sessionId: string }) => {
  const { data } = await apiClient.post("/bill/generate", payload);
  return data.data;
};
