// src/store/authStore.ts
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface User {
  id: number;
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

  // 리프레시 토큰으로 accessToken 갱신
  refreshAccessToken: async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("토큰 갱신 실패");
      const data = await res.json();

      set({ accessToken: data.accessToken });
    } catch (err) {
      console.error("토큰 갱신 에러:", err);
      get().logout();
    }
  },
}));
