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
    if (get().matches.length > 0 && get().dates.length > 0) return;

    set({ loading: true });
    try {
      const today = new Date();

      // “오늘 기준으로 이전 7일 + 오늘 + 이후 7일”
      const start = new Date(today);
      start.setDate(today.getDate() - 7);

      const totalDays = 15; // 7일 전 + 오늘 + 7일 후

      const requests = Array.from({ length: totalDays }, (_, i) => {
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

      results.forEach((res, i) => {
        if (res.status === "fulfilled" && res.value.data.status === "success") {
          const target = new Date(start);
          target.setDate(start.getDate() + i);

          const dateStr = target.toISOString().slice(0, 10);
          uniqueDates.add(dateStr);

          const data = res.value.data.data;
          if (data.length > 0) allMatches.push(...data);
        }
      });

      const sortedDates = Array.from(uniqueDates).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );

      set({
        matches: allMatches,
        dates: sortedDates,
      });
    } catch (e) {
      console.error("🚨 경기 데이터 로드 실패:", e);
    } finally {
      set({ loading: false });
    }
  },
}));
