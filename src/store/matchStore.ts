import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance";
import type { Match } from "../types/match";

interface MatchResponse {
  status: "success" | "error";
  data: Match[];
}

interface MatchState {
  matches: Match[];
  dates: string[];
  loading: boolean;
  fetchMatches: () => Promise<void>;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  dates: [],
  loading: false,

  fetchMatches: async () => {
    // 이미 로드된 경우 캐시 활용
    if (get().matches.length > 0 && get().dates.length > 0) return;

    set({ loading: true });
    try {
      const start = new Date(2025, 8, 27);
      const requests = Array.from({ length: 8 }, (_, i) => {
        const target = new Date(start);
        target.setDate(start.getDate() + i);
        return axiosInstance.post<MatchResponse>("/api/match/", {
          year: target.getFullYear(),
          month: target.getMonth() + 1,
          day: target.getDate(),
        });
      });

      const results = await Promise.allSettled(requests);
      const allMatches: Match[] = [];
      const uniqueDates = new Set<string>();

      results.forEach((res) => {
        if (res.status === "fulfilled" && res.value.data.status === "success") {
          const data = res.value.data.data;
          if (data.length > 0) {
            allMatches.push(...data);
            uniqueDates.add(data[0].date);
          }
        }
      });

      set({
        matches: allMatches,
        dates: Array.from(uniqueDates),
      });
    } catch (e) {
      console.error("경기 데이터 로드 실패:", e);
    } finally {
      set({ loading: false });
    }
  },
}));
