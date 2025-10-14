import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance";

export interface User {
  userId: number;
  email: string;
  nickname: string;
  club?: string;
  profileImage?: string;
  provider?: "LOCAL" | "KAKAO" | "GOOGLE" | "NAVER" | "EMAIL";
}

export interface AuthResponse {
  userId: number;
  email: string;
  nickname: string;
  club?: string;
  token: string;
  provider?: "LOCAL" | "KAKAO" | "GOOGLE" | "NAVER";
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

  login: (user: User, accessToken: string, rememberMe: boolean) => void;
  logout: () => Promise<void>;
  tryAutoLogin: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
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

  /** 로그인 **/
  login: (user, accessToken, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("accessToken", accessToken);

    set({
      isAuthenticated: true,
      user,
      accessToken,
    });
  },

  /** 로그아웃 **/
  logout: async () => {
    try {
      await axiosInstance.get("/api/user/logout");
      console.log("✅ 서버 로그아웃 완료");
    } catch (err) {
      console.error("❌ 로그아웃 중 오류:", err);
    } finally {
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      set({ isAuthenticated: false, user: null, accessToken: null });
    }
  },

  /** 자동 로그인 **/
  tryAutoLogin: async () => {
    try {
      const res = await axiosInstance.post("/api/user/refresh/login");
      const { status, data } = res.data;
      if (status === "success" && data) {
        const userInfo: User = {
          userId: data.userId,
          email: data.email,
          nickname: data.nickname,
          club: data.club,
          provider: data.provider || "LOCAL",
        };

        set({
          isAuthenticated: true,
          user: userInfo,
          accessToken: data.token,
        });

        localStorage.setItem("accessToken", data.token);
        console.log("✅ 자동 로그인 성공");
      } else {
        console.warn("자동 로그인 실패: 서버 응답 오류");
        set({ isAuthenticated: false, user: null, accessToken: null });
      }
    } catch (err) {
      console.warn("자동 로그인 실패:", err);
      set({ isAuthenticated: false, user: null, accessToken: null });
    }
  },

  /** 토큰 재발급 **/
  refreshAccessToken: async () => {
    try {
      const res = await axiosInstance.post("/api/user/refresh/login");
      const { status, data } = res.data;

      if (status === "success" && data?.token) {
        set({ accessToken: data.token });
        localStorage.setItem("accessToken", data.token);
        console.log("🔄 액세스 토큰 갱신 완료");
      } else {
        console.warn("토큰 갱신 실패: 서버 응답 오류");
        set({ isAuthenticated: false, user: null, accessToken: null });
      }
    } catch (err) {
      console.error("토큰 갱신 실패:", err);
      set({ isAuthenticated: false, user: null, accessToken: null });
    }
  },
}));
