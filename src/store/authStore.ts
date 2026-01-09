import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance";
import { useToastStore } from "../store/toastStore";

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
  profileImage?: string;
  provider?: "LOCAL" | "KAKAO" | "GOOGLE" | "NAVER";
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  email: string;
  password: string;
  nickname: string | null;
  profileImage: string | null;

  setEmail: (email: string) => void;
  setPassword: (pw: string) => void;
  setUser: (user: User | null) => void;
  setNickname: (nickname: string | null) => void;
  setProfileImage: (imageUrl: string | null) => void;

  login: (user: User, accessToken: string, rememberMe: boolean) => void;
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
  profileImage: null,

  setEmail: (email) => set({ email }),
  setPassword: (pw) => set({ password: pw }),

  /**setUser 안정화 (동일 객체면 리렌더링 방지) **/
  setUser: (newUser) => {
    const currentUser = get().user;
    // shallow compare (nickname, club, profileImage 등)
    if (
      currentUser &&
      newUser &&
      currentUser.userId === newUser.userId &&
      currentUser.nickname === newUser.nickname &&
      currentUser.club === newUser.club &&
      currentUser.profileImage === newUser.profileImage
    ) {
      return; // 동일할 경우 무시
    }
    set({ user: newUser });
  },

  setNickname: (nickname) => set({ nickname }),
  setProfileImage: (imageUrl) => set({ profileImage: imageUrl }),

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
    } catch (err) {
      console.error("로그아웃 중 오류:", err);
    } finally {
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      set({ isAuthenticated: false, user: null, accessToken: null });
    }
  },

  /** 자동 로그인 **/
  tryAutoLogin: async () => {
    const { addToast } = useToastStore.getState();

    try {
      const res = await axiosInstance.post("/api/user/refresh/login");
      const { status, data } = res.data;

      if (status === "success" && data) {
        //defaultImage 경로 수정 (origin 제거)
        const defaultImage = "/profileimage.png";

        const userInfo: User = {
          userId: data.userId,
          email: data.email,
          nickname: data.nickname,
          club: data.club,
          profileImage:
            data.profileImage && data.profileImage.trim() !== ""
              ? data.profileImage
              : defaultImage,
          provider: data.provider || "LOCAL",
        };

        set({
          isAuthenticated: true,
          user: userInfo,
          accessToken: data.token,
        });

        localStorage.setItem("accessToken", data.token);
      } else {
        console.warn("자동 로그인 실패: 서버 응답 오류");
        set({ isAuthenticated: false, user: null, accessToken: null });
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "세션이 만료되었습니다. 다시 로그인해주세요.";
      addToast(message, "error");
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      set({ isAuthenticated: false, user: null, accessToken: null });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
  },

  /** 토큰 재발급 **/
  refreshAccessToken: async () => {
    const { addToast } = useToastStore.getState();

    try {
      const res = await axiosInstance.post("/api/user/refresh/login");
      const { status, data } = res.data;

      if (status === "success" && data?.token) {
        set({ accessToken: data.token });
        localStorage.setItem("accessToken", data.token);
      } else {
        console.warn("토큰 갱신 실패: 서버 응답 오류");
        set({ isAuthenticated: false, user: null, accessToken: null });
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "토큰이 만료되었습니다. 다시 로그인해주세요.";

      addToast(message, "error");

      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      set({ isAuthenticated: false, user: null, accessToken: null });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
  },
}));
