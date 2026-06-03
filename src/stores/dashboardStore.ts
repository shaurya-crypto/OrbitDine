import { create } from "zustand";

interface DashboardState {
  selectedTableId: string | null;
  selectedSessionId: string | null;
  isEmergencyPaused: boolean;
  
  setSelectedTable: (tableId: string | null) => void;
  setSelectedSession: (sessionId: string | null) => void;
  setEmergencyPause: (isPaused: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedTableId: null,
  selectedSessionId: null,
  isEmergencyPaused: false,

  setSelectedTable: (tableId) => set({ selectedTableId: tableId }),
  setSelectedSession: (sessionId) => set({ selectedSessionId: sessionId }),
  setEmergencyPause: (isPaused) => set({ isEmergencyPaused: isPaused }),
}));
