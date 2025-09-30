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
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
