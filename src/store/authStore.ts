import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance";

export interface User {
  userId: number;
  email: string;
  nickname: string;
  club?: string;
  profileImage?: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  nickname: string;
  club?: string;
  token: string; // accessToken
  refreshToken: string;
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

  login: (
    user: User,
    accessToken: string,
    refreshToken: string,
    rememberMe: boolean
  ) => void;
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

  // 로그인
  login: (user, accessToken, refreshToken, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("refreshToken", refreshToken);

    set({
      isAuthenticated: true,
      user,
      accessToken,
    });
  },

  // 로그아웃
  logout: async () => {
    const { user, accessToken } = get();

    try {
      if (user && accessToken) {
        const res = await axiosInstance.get("/api/user/logout", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.data.status === "success") {
          console.log("✅ 서버 로그아웃 완료");
        }
      }
    } catch (err) {
      console.error("❌ 로그아웃 중 오류:", err);
    } finally {
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("refreshToken");
      set({ isAuthenticated: false, user: null, accessToken: null });
    }
  },

  // 자동 로그인 (refreshToken 기반)
  tryAutoLogin: async () => {
    // localStorage > sessionStorage 우선순위
    const refreshToken =
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken");

    if (!refreshToken) return;

    try {
      const res = await axiosInstance.post<{
        status: string;
        data: AuthResponse;
      }>("/api/user/refresh/login", { refreshToken });

      const { status, data } = res.data;
      if (status === "success" && data) {
        const userInfo: User = {
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

        // 새 refreshToken 저장
        if (localStorage.getItem("refreshToken")) {
          localStorage.setItem("refreshToken", data.refreshToken);
        } else {
          sessionStorage.setItem("refreshToken", data.refreshToken);
        }

        console.log("✅ 자동 로그인 성공");
      } else {
        await get().logout();
      }
    } catch (err) {
      console.warn("자동 로그인 실패:", err);
      await get().logout();
    }
  },

  // 액세스 토큰 재발급
  refreshAccessToken: async () => {
    const refreshToken =
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken");
    if (!refreshToken) return;

    try {
      const res = await axiosInstance.post<{
        status: string;
        data: AuthResponse;
      }>("/api/user/refresh/login", { refreshToken });

      const { status, data } = res.data;
      if (status === "success" && data?.token) {
        set({ accessToken: data.token });

        if (localStorage.getItem("refreshToken")) {
          localStorage.setItem("refreshToken", data.refreshToken);
        } else {
          sessionStorage.setItem("refreshToken", data.refreshToken);
        }

        console.log("🔄 액세스 토큰 갱신 완료");
      } else {
        await get().logout();
      }
    } catch (err) {
      console.error("토큰 갱신 실패:", err);
      await get().logout();
    }
  },
}));
