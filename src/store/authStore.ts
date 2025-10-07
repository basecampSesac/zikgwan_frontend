import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance";

interface User {
  userId: number;
  email: string;
  nickname: string;
  club?: string;
  profileImage?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  email: string;
  password: string;
  nickname: string | null;
  setEmail: (email: string) => void;
  setPassword: (pw: string) => void;
  setUser: (user: User | null) => void;
  setNickname: (nickname: string | null) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  tryAutoLogin: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  email: "",
  password: "",
  nickname: null,

  setEmail: (email) => set({ email }),
  setPassword: (pw) => set({ password: pw }),
  setUser: (user) => set({ user }),
  setNickname: (nickname) => set({ nickname }),
  // 로그인 (refreshToken 로컬에 저장)
  login: (user, accessToken, refreshToken) => {
    localStorage.setItem("refreshToken", refreshToken);
    set({
      isAuthenticated: true,
      user,
      accessToken,
    });
  },

  // 로그아웃 (서버 + 로컬 초기화)
  logout: async () => {
    const user = get().user;
    const token = get().accessToken;

    try {
      if (user && token) {
        const res = await axiosInstance.get(`/api/user/logout`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.status === "success") {
          console.log("✅ 서버 로그아웃 완료");
        }
      }
    } catch (err) {
      console.error("❌ 로그아웃 중 오류:", err);
    } finally {
      localStorage.removeItem("refreshToken");
      set({ isAuthenticated: false, user: null, accessToken: null });
    }
  },

  // 자동 로그인 (로컬 refreshToken → body로 전송)
  tryAutoLogin: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    try {
      const res = await axiosInstance.post("/api/user/refresh/login", {
        refreshToken,
      });
      const { status, data } = res.data;

      if (status === "success" && data) {
        const userInfo = {
          userId: data.userId,
          email: data.email,
          nickname: data.nickname,
          club: data.club,
        };
        set({
          isAuthenticated: true,
          user: userInfo,
          accessToken: data.token,
        });
        // 새 refreshToken 재발급 시 업데이트
        localStorage.setItem("refreshToken", data.refreshToken);
        console.log("✅ 자동 로그인 성공");
      } else {
        get().logout();
      }
    } catch (err) {
      console.warn("자동 로그인 실패:", err);
      get().logout();
    }
  },

  // 토큰 갱신 (401 시 재요청)
  refreshAccessToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    try {
      const res = await axiosInstance.post("/api/user/refresh/login", {
        refreshToken,
      });
      const { status, data } = res.data;

      if (status === "success" && data?.token) {
        set({ accessToken: data.token });
        localStorage.setItem("refreshToken", data.refreshToken);
        console.log("🔄 액세스 토큰 갱신 완료");
      } else {
        get().logout();
      }
    } catch (err) {
      console.error("토큰 갱신 실패:", err);
      get().logout();
    }
  },
}));
