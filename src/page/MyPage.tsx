import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import ProfileSection from "../components/mypage/ProfileSection";
import TicketSection from "../components/mypage/TicketSection";
import GroupSection from "../components/mypage/GroupSection";

export default function MyPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "tickets" | "groups">(
    "profile"
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) return null;

  return (
    <main className="flex flex-1 justify-center bg-white min-h-screen">
      <div className="w-full max-w-4xl px-6">
        {/* 상단 탭 메뉴 */}
        <div className="flex gap-6 pb-2 justify-center mt-6 mb-4">
          <button
            className={`px-3 py-2 font-semibold ${
              activeTab === "profile"
                ? "text-[#6F00B6] border-b-2 border-[#6F00B6]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            프로필
          </button>
          <button
            className={`px-3 py-2 font-semibold ${
              activeTab === "tickets"
                ? "text-[#6F00B6] border-b-2 border-[#6F00B6]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("tickets")}
          >
            내 티켓
          </button>
          <button
            className={`px-3 py-2 font-semibold ${
              activeTab === "groups"
                ? "text-[#6F00B6] border-b-2 border-[#6F00B6]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("groups")}
          >
            직관 모임
          </button>
        </div>

        {/* 탭별 콘텐츠 */}
        <div className="-mt-2">
          {activeTab === "profile" && (
            <div className="w-full max-w-sm mx-auto p-6 rounded-lg bg-white">
              <ProfileSection />
            </div>
          )}
          {activeTab === "tickets" && (
            <div className="w-full max-w-4xl mx-auto">
              <TicketSection />
            </div>
          )}
          {activeTab === "groups" && (
            <div className="w-full max-w-4xl mx-auto">
              <GroupSection />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
