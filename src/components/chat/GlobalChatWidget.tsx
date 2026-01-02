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

  const handleRoomSelect = (roomId: number, title: string) => {
    openPopup(roomId, title);
    closeWidget();
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => {
          if (isOpen) closeWidget();
          else openWidget();
        }}
        className={`
          fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center
          rounded-full transition-all duration-200 ease-out
          bg-[#6F00B6]/85 backdrop-blur-md
          text-white shadow-md
          hover:bg-[#6F00B6]/75 hover:scale-110 active:scale-95
          z-[1000]
        `}
      >
        {isOpen ? (
          <X size={24} strokeWidth={2.2} className="drop-shadow-sm" />
        ) : (
          <MessageCircle
            size={24}
            strokeWidth={2.2}
            className="drop-shadow-sm"
          />
        )}
      </button>

      {isOpen && (
        <div
          ref={widgetRef}
          className="
            fixed z-[999] bg-white border border-gray-200 shadow-lg overflow-hidden flex flex-col
            rounded-2xl

            /* 모바일: 화면 폭에 맞춰 좌우 여백만 두고 꽉 채움 */
            left-4 right-4 bottom-24 h-[70vh] w-auto

            /* 데스크탑: 기존 고정 크기/위치 유지 */
            md:left-auto md:right-6 md:bottom-24 md:w-[380px] md:h-[540px]
          "
        >
          <ChatListPanel onSelect={handleRoomSelect} />
        </div>
      )}
    </>
  );
}
