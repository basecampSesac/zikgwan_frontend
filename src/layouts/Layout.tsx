import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import Toast from "../components/common/Toast";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-14 sm:pt-16">
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
