import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";

interface SessionState {
  sessionId: string | null;
  restaurantId: string | null;
  tableId: string | null;
  tableNumber: string | null;
  setSession: (sessionId: string, restaurantId: string, tableId: string, tableNumber?: string) => void;
  clearSession: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: null,
      restaurantId: null,
      tableId: null,
      tableNumber: null,
      _hasHydrated: false,
      setSession: (sessionId, restaurantId, tableId, tableNumber) => set({ sessionId, restaurantId, tableId, tableNumber: tableNumber || null }),
      clearSession: () => set({ sessionId: null, restaurantId: null, tableId: null, tableNumber: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "orbitdine-session",
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
