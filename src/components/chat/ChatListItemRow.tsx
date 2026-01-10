import { useAuthStore } from "../../store/authStore";
import type { ChatListItem } from "../../types/chat";
import axiosInstance from "../../lib/axiosInstance";

interface Props {
  room: ChatListItem;
  onSelect: (roomId: number, title: string) => void;
  onLeaveSuccess: () => void;
}

export default function ChatListItemRow({
  room,
  onSelect,
  onLeaveSuccess,
}: Props) {
  const { user } = useAuthStore();

  const isLeader = room.type === "C" && room.leaderId === user?.userId;

  const handleLeaveRoom = async () => {
    try {
      await axiosInstance.delete(`/api/chatroom/${room.roomId}/leave`);
      onLeaveSuccess();
} catch (err) {
      // TODO: logger로 변경
      console.error("채팅방 나가기 실패:", err);
    }
  };

  return (
    <div className="group relative flex items-center justify-between px-5 py-4 transition-all hover:bg-gray-50">
      <button
        onClick={() => onSelect(room.roomId, room.roomName)}
        className="flex flex-col text-left overflow-hidden flex-1"
      >
        <p className="font-medium text-gray-900 truncate max-w-[250px]">
          {room.roomName.length > 20
            ? room.roomName.slice(0, 20) + "..."
            : room.roomName}
        </p>
        <p className="text-[13px] text-gray-500 truncate mt-0.5 max-w-[200px]">
          {room.lastMessage || "최근 메시지 없음"}
        </p>
      </button>

      {/* 조건
          - 티켓방(T): 항상 떠나기 가능
          - 모임방(C): 리더일 경우 버튼 아예 숨김
      */}
      {(room.type === "T" || (room.type === "C" && !isLeader)) && (
        <button
          onClick={handleLeaveRoom}
          className="absolute right-4 top-1/2 -translate-y-1/2
                     opacity-0 group-hover:opacity-100
                     px-3 py-1 border border-gray-300 text-gray-500
                     hover:bg-gray-100 rounded-lg text-[13px]
                     font-medium transition-all duration-300 ease-in-out"
        >
          떠나기
        </button>
      )}

      {room.unreadCount > 0 && (
        <span className="ml-3 bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {room.unreadCount}
        </span>
      )}
    </div>
  );
}
