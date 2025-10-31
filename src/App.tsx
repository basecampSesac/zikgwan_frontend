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
import GroupChatPage from "./page/GroupChatPage";
import TicketChatPage from "./page/TicketChatPage";
import { useAuthStore } from "./store/authStore";
import axiosInstance from "./lib/axiosInstance";
import NotificationSSE from "./components/notification/NotificationSse";
import GlobalChatWidget from "./components/chat/GlobalChatWidget";
import ChatPopupManager from "./components/chat/ChatPopupManger";
import { getImageUrl } from "./api/imageApi";
import { Analytics } from "@vercel/analytics/react";
import axios from "axios";
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
      { path: "/ticket-chat/:id", Component: TicketChatPage },
    ],
  },
]);

export default function App() {
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
            } catch (err: any) {
              if (axios.isAxiosError(err) && err.response?.status === 404) {
                profileImage = defaultImage;
              } else {
                console.error("🚨 프로필 이미지 조회 중 오류:", err);
              }
            }

            setUser({
              ...userData,
              profileImage: profileImage || defaultImage,
            });
          }
        }
      } catch (err) {
        console.warn("자동 로그인 복원 중 오류:", err);
      } finally {
        setLoading(false);
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
