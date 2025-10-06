import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance";

interface User {
  userId: number;
  email: string;
  nickname: string;
  club?: string;
  admin?: "Y" | "N" | "B";
  profileImage?: string;
}

interface AuthState {
  email: string;
  password: string;
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;

  // setters
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setAuth: (isAuth: boolean) => void;

  // auth methods
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  fetchUserInfo: (userId: number) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  email: "",
  password: "",
  isAuthenticated: false,
  user: null,
  accessToken: null,

  // setters
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  setAuth: (isAuth) => set({ isAuthenticated: isAuth }),

  // 로그인
  login: (user, accessToken) =>
    set({
      isAuthenticated: true,
      user,
      accessToken,
      email: "",
      password: "",
    }),

  // 로그아웃
  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      email: "",
      password: "",
    }),

  // 회원정보 조회
  fetchUserInfo: async (userId: number) => {
    try {
      const token = get().accessToken;
      if (!token) throw new Error("토큰이 없습니다.");

      const { data } = await axiosInstance.get(`/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.status === "success" && data.data) {
        set({ user: data.data, isAuthenticated: true });
      } else {
        console.error("회원정보 조회 실패:", data.message);
      }
    } catch (err) {
      console.error("회원정보 조회 오류:", err);
      get().logout();
    }
  },

  // 리프레시 토큰으로 accessToken 갱신
  refreshAccessToken: async () => {
    try {
      const { data } = await axiosInstance.post("/api/auth/refresh", null, {
        withCredentials: true,
      });

      if (data.accessToken) {
        set({ accessToken: data.accessToken });
      } else {
        throw new Error("토큰 응답이 올바르지 않습니다.");
      }
    } catch (err) {
      console.error("토큰 갱신 에러:", err);
      get().logout();
    }
  },
}));
