import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (401 → 자동 리프레시)
axiosInstance.interceptors.response.use(
  (response) => response, // 응답 성공 시 그대로 통과
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore.getState();

    // 401이고 아직 재시도 안했을 때만 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await authStore.refreshAccessToken();
        const newToken = useAuthStore.getState().accessToken;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error("🔒 토큰 재발급 실패:", refreshError);
        authStore.logout();
        window.location.href = "/login"; // 로그인 페이지로 이동
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
