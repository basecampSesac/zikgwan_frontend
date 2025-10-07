import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import ChatRoom from "./ChatRoom";

export default function GlobalChatWidget() {
  const { isAuthenticated, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [roomId] = useState<number>(1);
  const nickname = user?.nickname || "익명";

  // 로그인 안 된 상태라면 표시하지 않음
  if (!isAuthenticated) return null;

  return (
    <>
      {/* 💬 Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#6F00B6] text-white flex items-center justify-center shadow-lg hover:bg-[#4E008A] transition z-50"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* 채팅 사이드바 */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] h-[500px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col animate-slide-up z-50">
          <div className="flex justify-between items-center px-4 py-3 border-b bg-[#6F00B6] text-white font-semibold">
            <span>실시간 채팅</span>
            <button onClick={() => setIsOpen(false)} className="text-white">
              ✕
            </button>
          </div>
          <ChatRoom roomId={roomId} nickname={nickname} />
        </div>
      )}
    </>
  );
}
