import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./layouts/Layout";
import TicketList from "./page/TicketList";
import GroupList from "./page/GroupList";
import LoginPage from "./page/Login";
import SignupPage from "./page/SignUp";
import SchedulePage from "./page/Schedule";
import PolicyPage from "./page/Policy";
import TicketGuidePage from "./page/TicketGuide";
import MainHome from "./page/MainHome";
import MyPage from "./page/MyPage";
import { useAuthStore } from "./store/authStore";
import TicketDetail from "./page/TicketDetail";
import GroupDetail from "./page/GroupDetail";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { path: "/", Component: MainHome },
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
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) return;

        const data = await res.json();

        if (data.success && data.user) {
          setUser(data.user);
          setAuth(true);

          // 새 토큰이 있으면 전역 상태 갱신
          if (data.newAccessToken) {
            setAccessToken(data.newAccessToken);
          }
        }
      } catch (err) {
        console.error("로그인 유저 정보 불러오기 실패:", err);
      }
    };

    fetchMe();
  }, [setUser, setAccessToken, setAuth]);

  return <RouterProvider router={router} />;
}
