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
import { getImageUrl } from "./api/imageApi";
import TicketChatPage from "./page/TicketChatPage";
import { Analytics } from "@vercel/analytics/react";

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
      { path: "/ticket-chat/:id", Component: TicketChatPage }, // 티켓 채팅 페이지 추가
    ],
  },
]);

export default function App() {
  const { tryAutoLogin, setUser } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return;

      try {
        await tryAutoLogin();

        const token = useAuthStore.getState().accessToken;
        const user = useAuthStore.getState().user;

        if (token && user?.userId) {
          // 사용자 정보 조회
          const userRes = await axiosInstance.get(`/api/user/${user.userId}`);

          if (userRes.data.status === "success" && userRes.data.data) {
            const userData = userRes.data.data;

            let profileImage = "";

            // 프로필 이미지가 등록된 경우에만 세팅
            if (
              userData.profileImageUrl &&
              userData.profileImageUrl.trim() !== ""
            ) {
              profileImage = userData.profileImageUrl.startsWith("http")
                ? userData.profileImageUrl
                : getImageUrl(userData.profileImageUrl);
            } else {
              console.log("프로필 이미지 없음 → 요청 스킵");
            }

            // Zustand store에 사용자 정보 + 이미지 반영
            setUser({
              ...userData,
              profileImage,
            });
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
      <Analytics />
    </>
  );
}
