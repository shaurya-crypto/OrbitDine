import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "owner" | "manager" | "staff" | "kitchen" | "customer";

interface AuthState {
  userId: string | null;
  role: Role | null;
  restaurantId: string | null;
  name: string | null;
  setAuth: (userId: string, role: Role, restaurantId: string | null, name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      role: null,
      restaurantId: null,
      name: null,
      setAuth: (userId, role, restaurantId, name) => set({ userId, role, restaurantId, name }),
      logout: () => set({ userId: null, role: null, restaurantId: null, name: null }),
    }),
    {
      name: "orbitdine-auth",
    }
  )
);
