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
import NotificationSSE from "./components/notification/NotificationSse";
import GlobalChatWidget from "./components/chat/GlobalChatWidget";
import ChatPopupManager from "./components/chat/ChatPopupManger";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { useAppInitialization } from "./hooks/useAppInitialization";
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
  const { loading } = useAppInitialization();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6F00B6]"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <NotificationSSE />
      <RouterProvider router={router} />
      <ChatPopupManager />
      <GlobalChatWidget />
      <Analytics />
    </ErrorBoundary>
  );
}
