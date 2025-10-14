import { useEffect } from "react";
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
import GroupChatPage from "./page/GroupChatPage";
import { useAuthStore } from "./store/authStore";
import axiosInstance from "./lib/axiosInstance";
import NotificationSSE from "./components/notification/NotificationSse";
import GlobalChatWidget from "./components/chat/GlobalChatWidget";
import ChatPopupManager from "./components/chat/ChatPopupManger";

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
      { path: "/chat/:id", Component: GroupChatPage },
    ],
  },
]);

export default function App() {
  const { tryAutoLogin, setUser } = useAuthStore();

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
          }
        }
      } catch (err) {
        console.warn("자동 로그인 복원 중 오류:", err);
      }
    };

    initAuth();
  }, [tryAutoLogin, setUser]);

  return (
    <>
      <NotificationSSE />
      <RouterProvider router={router} />
      <ChatPopupManager />
      <GlobalChatWidget />
    </>
  );
}
