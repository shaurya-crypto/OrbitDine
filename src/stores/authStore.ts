import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "owner" | "manager" | "staff" | "kitchen" | "customer";

interface AuthState {
  userId: string | null;
  roles: Role[];
  restaurantId: string | null;
  name: string | null;
  setAuth: (userId: string, roles: Role[], restaurantId: string | null, name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      roles: [],
      restaurantId: null,
      name: null,
      setAuth: (userId, roles, restaurantId, name) => set({ userId, roles, restaurantId, name }),
      logout: () => set({ userId: null, roles: [], restaurantId: null, name: null }),
    }),
    {
      name: "orbitdine-auth",
      partialize: (state) => {
        const { role, ...rest } = state as any; // Strip legacy 'role' key
        return rest;
      }
    }
  )
);
