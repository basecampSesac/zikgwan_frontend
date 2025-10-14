import { MessageCircle, X } from "lucide-react";
import ChatListPanel from "./ChatListPanel";
import { useChatWidgetStore } from "../../store/chatWidgetStore";
import { useAuthStore } from "../../store/authStore";

export default function GlobalChatWidget() {
  const { isAuthenticated } = useAuthStore();
  const { isOpen, openWidget, closeWidget, openPopup } = useChatWidgetStore();

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => (isOpen ? closeWidget() : openWidget())}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#6F00B6] text-white flex items-center justify-center shadow-lg hover:bg-[#4E008A] transition z-[1000]"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
      </button>

      {/* 사이드 패널 */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[540px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col z-[999]">
          <ChatListPanel onSelect={(roomId) => openPopup(roomId)} />
        </div>
      )}
    </>
  );
}
