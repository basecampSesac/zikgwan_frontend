import { useEffect, useRef } from "react";
import Draggable from "react-draggable";
import { X, LogOut } from "lucide-react";
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

  // 완전 나가기 (leave)
  const handleLeaveRoom = async () => {
    try {
      await axiosInstance.delete(`/api/chatroom/${roomId}/leave`);
      alert("채팅방을 떠났습니다.");
      closePopup(roomId);
    } catch (err) {
      console.error("채팅방 나가기 실패:", err);
    }
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
            <span>💬</span>
            <span>{title ? title : `모임 채팅 #${roomId}`}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-1 px-2 py-1 text-[13px] 
                         text-gray-600 hover:bg-gray-200 rounded-md transition"
            >
              <LogOut size={14} />
            </button>

            <button
              onClick={() => closePopup(roomId)}
              className="p-1 text-gray-500 hover:bg-gray-200 rounded-md transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="h-[calc(100%-52px)] bg-gray-50">
          <ChatRoom roomId={roomId} nickname={user?.nickname || "익명"} />
        </div>
      </div>
    </Draggable>
  );
}
