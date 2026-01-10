import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import axiosInstance from "../lib/axiosInstance";
import { getImageUrl } from "../api/imageApi";
import { logger } from "../utils/logger";
import axios from "axios";

/**
 * 앱 초기화 로직을 담당하는 커스텀 훅
 * - 자동 로그인 시도
 * - 사용자 프로필 이미지 로드
 * - 인증 상태 복원
 */
export function useAppInitialization() {
  const { tryAutoLogin, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await tryAutoLogin();

        const currentUser = useAuthStore.getState().user;
        const token = useAuthStore.getState().accessToken;
        const defaultImage = `${window.location.origin}/profileimage.png`;

        if (token && currentUser?.userId) {
          const userRes = await axiosInstance.get(
            `/api/user/${currentUser.userId}`
          );

          if (userRes.data.status === "success" && userRes.data.data) {
            const userData = userRes.data.data;
            let profileImage = defaultImage;

            try {
              const imgRes = await axiosInstance.get(
                `/api/images/U/${currentUser.userId}`
              );
              if (imgRes.data.status === "success" && imgRes.data.data) {
                profileImage = getImageUrl(imgRes.data.data);
              } else {
                profileImage = defaultImage;
              }
            } catch (err: unknown) {
              if (axios.isAxiosError(err) && err.response?.status === 404) {
                profileImage = defaultImage;
              } else {
                logger.error("프로필 이미지 조회 중 오류", err, {
                  userId: currentUser.userId,
                  endpoint: `/api/images/U/${currentUser.userId}`
                });
              }
            }

            setUser({
              ...userData,
              profileImage: profileImage || defaultImage,
            });
          }
        }
      } catch (err) {
        logger.warn("자동 로그인 복원 중 오류", { error: err });
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [tryAutoLogin, setUser]);

  return { loading };
}