import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./layouts/Layout";
import HomePage from "./page/Home";
import TicketList from "./page/TicketList";
import GroupList from "./page/GroupList";
import LoginPage from "./page/Login";
import SignupPage from "./page/SignUp";
import SchedulePage from "./page/Schedule";
import PolicyPage from "./page/Policy";
import TicketGuidePage from "./page/TicketGuide";
import MyPage from "./page/MyPage";
import TicketDetail from "./page/TicketDetail";
import GroupDetail from "./page/GroupDetail";
import { useAuthStore } from "./store/authStore";
import axiosInstance from "./lib/axiosInstance";

const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { path: "/", Component: HomePage },
      { path: "/tickets", Component: TicketList },
      { path: "/groups", Component: GroupList },
      { path: "/login", Component: LoginPage },
      { path: "/signup", Component: SignupPage },
      { path: "/schedule", Component: SchedulePage },
      { path: "/policy", Component: PolicyPage },
      { path: "/ticket-guide", Component: TicketGuidePage },
      { path: "/mypage", Component: MyPage },
      { path: "/tickets/:id", Component: TicketDetail },
      { path: "/groups/:id", Component: GroupDetail },
    ],
  },
]);

export default function App() {
  const { tryAutoLogin, setUser } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // refreshToken 쿠키 기반으로 자동 로그인 시도
        await tryAutoLogin();

        // 로그인 상태라면 사용자 정보 다시 불러오기
        const token = useAuthStore.getState().accessToken;
        const userId = useAuthStore.getState().user?.userId;

        if (token && userId) {
          const { data } = await axiosInstance.get(`/api/user/${userId}`);
          if (data.status === "success" && data.data) {
            setUser(data.data);
          } else {
            console.warn("⚠️ 사용자 정보 조회 실패:", data.message);
          }
        }
      } catch (err) {
        console.error("자동 로그인/유저 정보 복원 중 오류:", err);
      } finally {
        // 모든 초기화 완료 후 렌더링 허용
        setIsReady(true);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 아직 로그인 복원 중일 땐 렌더링 지연 (깜박임 방지)
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        초기화 중...
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
