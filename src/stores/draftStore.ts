import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";

interface DraftState {
  drafts: Record<string, any>;
  setDraft: (key: string, data: any) => void;
  getDraft: (key: string) => any | null;
  clearDraft: (key: string) => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      drafts: {},
      setDraft: (key, data) => set((state) => ({
        drafts: { ...state.drafts, [key]: data }
      })),
      getDraft: (key) => get().drafts[key] || null,
      clearDraft: (key) => set((state) => {
        const newDrafts = { ...state.drafts };
        delete newDrafts[key];
        return { drafts: newDrafts };
      }),
    }),
    {
      name: "orbitdine-drafts",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
