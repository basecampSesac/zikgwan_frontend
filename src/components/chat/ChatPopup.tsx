import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { IoSearchOutline, IoClose } from "react-icons/io5";
import ChatRoom from "./ChatRoom";
import { useChatWidgetStore } from "../../store/chatWidgetStore";
import { useAuthStore } from "../../store/authStore";
import axiosInstance from "../../lib/axiosInstance";

export default function ChatPopup({
  roomId,
  offsetX = 0,
  title,
}: {
  roomId: number;
  offsetX?: number;
  title: string;
}) {
  const { closePopup } = useChatWidgetStore();
  const { user } = useAuthStore();

  const nodeRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<{ scrollToBottom: () => void }>(null);

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        closePopup(roomId);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [roomId, closePopup]);

  // 채팅방 입장 (join)
  useEffect(() => {
    const joinRoom = async () => {
      try {
        await axiosInstance.patch(`/api/chatroom/${roomId}/join`);
        console.log(`✅ joined room ${roomId}`);
      } catch (err) {
        console.warn("채팅방 join 실패:", err);
      }
    };
    joinRoom();

    // 팝업 닫을 때 자동 (exit)
    return () => {
      axiosInstance.patch(`/api/chatroom/exit`).catch(() => {});
      console.log(`🚪 exited room ${roomId}`);
    };
  }, [roomId]);

  // 닫기 시 최신 채팅으로 이동
  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearch("");
    chatRef.current?.scrollToBottom();
    setTimeout(() => chatRef.current?.scrollToBottom(), 100);
  };

  return (
    <Draggable
      nodeRef={nodeRef as unknown as React.RefObject<HTMLElement>}
      handle=".drag-handle"
      bounds="parent"
    >
      <div
        ref={nodeRef}
        className="fixed w-[440px] h-[640px] rounded-2xl border border-gray-300 shadow-lg overflow-hidden bg-white z-[2000]"
        style={{
          top: `calc(50% - 320px)`,
          left: `calc(50% - 220px + ${offsetX * 40}px)`,
        }}
      >
        {/* 헤더 */}
        <div
          className="drag-handle cursor-move flex justify-between items-center 
                     px-4 py-3 bg-gray-100 text-gray-700 border-b border-gray-200 
                     rounded-t-2xl select-none active:cursor-grabbing"
        >
          <span className="inline-flex items-center gap-2 font-semibold text-[15px]">
            💬 {title || `모임 채팅 #${roomId}`}
          </span>

          <div className="flex items-center gap-2">
            {/* 검색 버튼 */}
            <button
              onClick={() => setShowSearch((prev) => !prev)}
              className="text-gray-500 hover:text-[#6F00B6] transition"
              title="검색"
            >
              <IoSearchOutline size={20} />
            </button>

            {/* 닫기 버튼 */}
            <button
              onClick={() => closePopup(roomId)}
              className="p-1 text-gray-500 hover:bg-gray-200 rounded-md transition"
            >
              <IoClose size={20} />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="relative h-[calc(100%-52px)] bg-gray-50 overflow-hidden">
          <ChatRoom
            ref={chatRef}
            roomId={roomId}
            nickname={user?.nickname || "익명"}
            search={search}
          />

          {/* 검색 패널 */}
          <div
            className={`absolute top-0 left-0 w-full bg-white/95 border-b border-gray-200 backdrop-blur-md z-50 
              transition-transform duration-300 ease-in-out
              ${showSearch ? "translate-y-0" : "-translate-y-full"}`}
          >
            <div className="flex items-center px-4 py-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="메시지 검색..."
                autoFocus={showSearch}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6F00B6]/40 bg-white"
              />
              <button
                onClick={handleCloseSearch}
                className="ml-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
}
