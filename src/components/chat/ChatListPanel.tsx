import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axiosInstance";

interface ChatListItem {
  roomId: number;
  roomName: string;
  lastMessage: string;
  unreadCount: number;
}

interface Props {
  onSelect: (roomId: number) => void;
}

export default function ChatListPanel({ onSelect }: Props) {
  const [rooms, setRooms] = useState<ChatListItem[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axiosInstance.get("/api/chatroom/my");
        if (res.data.status === "success" && Array.isArray(res.data.data)) {
          setRooms(res.data.data);
        } else {
          console.warn("채팅방 목록 형식이 올바르지 않습니다:", res.data);
          setRooms([]);
        }
      } catch (err) {
        console.warn("채팅방 목록 불러오기 실패:", err);
        setRooms([]);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b bg-[#6F00B6] text-white font-semibold">
        내 채팅방
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            참여 중인 채팅방이 없습니다.
          </div>
        ) : (
          rooms.map((room) => (
            <button
              key={room.roomId}
              onClick={() => onSelect(room.roomId)}
              className="w-full flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50 transition text-left"
            >
              <div>
                <p className="font-medium text-gray-800">{room.roomName}</p>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {room.lastMessage || "최근 메시지 없음"}
                </p>
              </div>
              {room.unreadCount > 0 && (
                <span className="ml-2 bg-[#6F00B6] text-white text-xs font-bold px-2 py-1 rounded-full">
                  {room.unreadCount}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
