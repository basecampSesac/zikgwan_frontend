import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  activeRequests: Set<string>;
  show: (key: string) => void;
  hide: (key: string) => void;
  clear: () => void;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  isLoading: false,
  activeRequests: new Set(),

  show: (key: string) => {
    const { activeRequests } = get();
    activeRequests.add(key);
    set({ activeRequests: new Set(activeRequests), isLoading: true });
  },

  hide: (key: string) => {
    const { activeRequests } = get();
    activeRequests.delete(key);
    const newSet = new Set(activeRequests);
    set({ activeRequests: newSet, isLoading: newSet.size > 0 });
  },

  clear: () => {
    set({ activeRequests: new Set(), isLoading: false });
  },
}));
