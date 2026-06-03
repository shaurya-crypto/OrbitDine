import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionState {
  sessionId: string | null;
  restaurantId: string | null;
  tableId: string | null;
  setSession: (sessionId: string, restaurantId: string, tableId: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: null,
      restaurantId: null,
      tableId: null,
      setSession: (sessionId, restaurantId, tableId) => set({ sessionId, restaurantId, tableId }),
      clearSession: () => set({ sessionId: null, restaurantId: null, tableId: null }),
    }),
    {
      name: "orbitdine-session", // unique name for localStorage key
    }
  )
);
