import { create } from "zustand";

interface GroupUpdateState {
  updated: boolean;
  triggerUpdate: () => void;
  resetUpdate: () => void;
}

export const useGroupUpdateStore = create<GroupUpdateState>((set) => ({
  updated: false,
  triggerUpdate: () => set({ updated: true }),
  resetUpdate: () => set({ updated: false }),
}));
