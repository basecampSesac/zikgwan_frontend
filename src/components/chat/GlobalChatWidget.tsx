import { useEffect, useRef } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatListPanel from "./ChatListPanel";
import { useChatWidgetStore } from "../../store/chatWidgetStore";
import { useAuthStore } from "../../store/authStore";

export default function GlobalChatWidget() {
  const { isAuthenticated } = useAuthStore();
  const { isOpen, openWidget, closeWidget, openPopup } = useChatWidgetStore();
  const widgetRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // 버튼이나 패널 내부 클릭은 무시
      if (
        widgetRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      )
        return;
      if (isOpen) closeWidget();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeWidget]);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        ref={buttonRef}
        onClick={() => (isOpen ? closeWidget() : openWidget())}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#6F00B6] text-white flex items-center justify-center shadow-lg hover:bg-[#4E008A] transition z-[1000]"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
      </button>

      {/* 사이드 패널 */}
      {isOpen && (
        <div
          ref={widgetRef}
          className="fixed bottom-24 right-6 w-[380px] h-[540px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col z-[999]"
        >
          <ChatListPanel
            onSelect={(roomId, title) => {
              openPopup(roomId, title);
              closeWidget();
            }}
          />
        </div>
      )}
    </>
  );
}
